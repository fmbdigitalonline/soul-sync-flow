import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface HACSMessage {
  id: string;
  text: string;
  hacsModule: string;
  interventionType: string;
  messageType: 'quick_bubble' | 'intervention_prompt' | 'deep_conversation';
  timestamp: Date;
  acknowledged: boolean;
}

export const useHACSAutonomy = () => {
  const { user } = useAuth();
  const [currentMessage, setCurrentMessage] = useState<HACSMessage | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [messageHistory, setMessageHistory] = useState<HACSMessage[]>([]);
  const [dismissedMessages, setDismissedMessages] = useState<Map<string, number>>(new Map());
  const [lastMessageTime, setLastMessageTime] = useState<number>(0);

  const generateHACSMessage = useCallback(async (
    hacsModule: string,
    interventionType: string,
    userContext: string,
    messageType: 'quick_bubble' | 'intervention_prompt' | 'deep_conversation' = 'quick_bubble'
  ) => {
    if (!user) return null;

    // Check global cooldown (30 minutes between any messages)
    const now = Date.now();
    if (now - lastMessageTime < 30 * 60 * 1000) {
      console.log('🔒 HACS message blocked by global cooldown');
      return null;
    }

    // Check if this message type was recently dismissed (10 minutes)
    const lastDismissed = dismissedMessages.get(messageType);
    if (lastDismissed && now - lastDismissed < 10 * 60 * 1000) {
      console.log('🔒 HACS message blocked - recently dismissed:', messageType);
      return null;
    }

    setIsGenerating(true);
    setLastMessageTime(now);
    try {
      // Try the new intelligent conversation system first
      const { data: intelligentData, error: intelligentError } = await supabase.functions.invoke('hacs-intelligent-conversation', {
        body: {
          action: 'generate_question',
          userId: user.id,
          sessionId: `autonomous_${Date.now()}`,
          messageHistory: []
        }
      });

      if (!intelligentError && intelligentData?.generatedQuestion) {
        const newMessage: HACSMessage = {
          id: `hacs_${Date.now()}`,
          text: intelligentData.generatedQuestion.text,
          hacsModule: intelligentData.generatedQuestion.module,
          interventionType: 'autonomous_question',
          messageType: 'deep_conversation',
          timestamp: new Date(),
          acknowledged: false
        };

        setCurrentMessage(newMessage);
        setMessageHistory(prev => [newMessage, ...prev].slice(0, 10));
        return newMessage;
      }

      // Fallback to original system
      const { data, error } = await supabase.functions.invoke('hacs-autonomous-text', {
        body: {
          hacsModule,
          interventionType,
          userContext,
          messageType,
          userId: user.id
        }
      });

      if (error) throw error;

      const newMessage: HACSMessage = {
        id: `hacs_${Date.now()}`,
        text: data.generatedText,
        hacsModule,
        interventionType,
        messageType,
        timestamp: new Date(),
        acknowledged: false
      };

      setCurrentMessage(newMessage);
      setMessageHistory(prev => [newMessage, ...prev].slice(0, 10)); // Keep last 10 messages

      return newMessage;
    } catch (error) {
      console.error('Error generating HACS message:', error);
      // Fallback message
        // Create fallback based on intervention type
        let fallbackText = 'I\'m here to support your journey.';
        if (interventionType === 'steward_completion') {
          fallbackText = 'Your learning system is now active! You can continue using the app while I learn and provide insights tailored to your journey.';
        }
        
        const fallbackMessage: HACSMessage = {
          id: `hacs_fallback_${Date.now()}`,
          text: fallbackText,
          hacsModule,
          interventionType,
          messageType,
          timestamp: new Date(),
          acknowledged: false
        };
      setCurrentMessage(fallbackMessage);
      return fallbackMessage;
    } finally {
      setIsGenerating(false);
    }
  }, [user, lastMessageTime, dismissedMessages]);

  const acknowledgeMessage = useCallback((messageId: string) => {
    setCurrentMessage(prev => 
      prev?.id === messageId ? { ...prev, acknowledged: true } : prev
    );
    setMessageHistory(prev => 
      prev.map(msg => 
        msg.id === messageId ? { ...msg, acknowledged: true } : msg
      )
    );
  }, []);

  const dismissMessage = useCallback(() => {
    if (currentMessage) {
      // Track dismissed message type with timestamp
      setDismissedMessages(prev => new Map(prev).set(currentMessage.messageType, Date.now()));
      setCurrentMessage(null);
    }
  }, [currentMessage]);

  // Autonomous triggers based on HACS modules
  const triggerPIEInsight = useCallback((activityPattern: string) => {
    return generateHACSMessage(
      'PIE',
      'proactive_insight',
      `User activity pattern: ${activityPattern}`,
      'quick_bubble'
    );
  }, [generateHACSMessage]);

  const triggerCNRPrompt = useCallback((conflictContext: string) => {
    return generateHACSMessage(
      'CNR',
      'conflict_resolution',
      `Detected conflict: ${conflictContext}`,
      'intervention_prompt'
    );
  }, [generateHACSMessage]);

  const triggerTMGValidation = useCallback((memoryContext: string) => {
    return generateHACSMessage(
      'TMG',
      'memory_validation',
      `Memory context: ${memoryContext}`,
      'intervention_prompt'
    );
  }, [generateHACSMessage]);

  const triggerDPEMAdaptation = useCallback((personalityShift: string) => {
    return generateHACSMessage(
      'DPEM',
      'personality_adaptation',
      `Personality shift detected: ${personalityShift}`,
      'deep_conversation'
    );
  }, [generateHACSMessage]);

  // New: Post-steward introduction message
  const triggerPostStewardMessage = useCallback(() => {
    return generateHACSMessage(
      'HACS',
      'steward_completion',
      'User has completed steward introduction - system learning activated',
      'quick_bubble'
    );
  }, [generateHACSMessage]);

  return {
    currentMessage,
    messageHistory,
    isGenerating,
    generateHACSMessage,
    acknowledgeMessage,
    dismissMessage,
    // Autonomous triggers
    triggerPIEInsight,
    triggerCNRPrompt,
    triggerTMGValidation,
    triggerDPEMAdaptation,
    triggerPostStewardMessage
  };
};
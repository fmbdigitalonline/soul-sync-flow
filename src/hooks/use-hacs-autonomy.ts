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

  const generateHACSMessage = useCallback(async (
    hacsModule: string,
    interventionType: string,
    userContext: string,
    messageType: 'quick_bubble' | 'intervention_prompt' | 'deep_conversation' = 'quick_bubble'
  ) => {
    if (!user) return null;

    setIsGenerating(true);
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
      const fallbackMessage: HACSMessage = {
        id: `hacs_fallback_${Date.now()}`,
        text: 'I\'m here to support your journey.',
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
  }, [user]);

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
    setCurrentMessage(null);
  }, []);

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
    triggerDPEMAdaptation
  };
};
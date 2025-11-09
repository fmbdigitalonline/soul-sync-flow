import { useState, useEffect, useCallback, useRef } from 'react';
import { aiCoachService } from '@/services/ai-coach-service';
import { supabase } from '@/integrations/supabase/client';
import { useCoordinatedLoading } from '@/hooks/use-coordinated-loading';
import { useSubconsciousOrb } from '@/hooks/use-subconscious-orb';
import { createErrorHandler } from '@/utils/error-recovery';
import { useLanguage } from '@/contexts/LanguageContext';

export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  agent_mode?: string;
  suppressDisplay?: boolean;
}

export type AgentType = "coach" | "guide" | "blend" | "dream";

interface BlueprintStatus {
  isAvailable: boolean;
  completionPercentage: number;
  summary: string;
}

interface VFPGraphStatus {
  isAvailable: boolean;
  vectorDimensions: number;
  personalitySummary: string;
  vectorMagnitude: number;
}

export const useEnhancedAICoach = (agentType?: AgentType, sessionId?: string) => {
  // Get user's language preference
  const { language } = useLanguage();
  
  // Coordinated loading for streaming operations
  const { startLoading, completeLoading } = useCoordinatedLoading();
  
  // Subconscious orb integration
  const { 
    processMessage: processSubconsciousMessage,
    orbState,
    subconsciousMode,
    patternDetected,
    adviceReady,
    handleOrbClick,
    isEnabled: subconsciousEnabled
  } = useSubconsciousOrb();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentAgent, setCurrentAgent] = useState<AgentType>(agentType || 'guide');
  const [personaReady, setPersonaReady] = useState(false);
  const [authInitialized, setAuthInitialized] = useState(false);
  const [userName, setUserName] = useState('friend');
  const [streamingContent, setStreamingContent] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [acsEnabled] = useState(false);
  const [acsState] = useState('disabled');
  
  const sessionIdRef = useRef(sessionId || aiCoachService.createNewSession());
  const streamingAbortRef = useRef<AbortController | null>(null);
  
  // Blueprint and VFP Graph status
  const [blueprintStatus, setBlueprintStatus] = useState<BlueprintStatus>({
    isAvailable: false,
    completionPercentage: 0,
    summary: 'Loading blueprint data...'
  });
  
  const [vfpGraphStatus, setVfpGraphStatus] = useState<VFPGraphStatus>({
    isAvailable: false,
    vectorDimensions: 0,
    personalitySummary: '',
    vectorMagnitude: 0
  });

  // Initialize authentication and user data
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) throw error;
        
        setAuthInitialized(true);
        
        if (user) {
          // Use email or id as display name for now
          setUserName(user.email?.split('@')[0] || 'friend');
          
          // Mock blueprint availability since we're restoring Enhanced AI Coach
          setBlueprintStatus({
            isAvailable: true,
            completionPercentage: 85,
            summary: 'Enhanced coaching enabled with personality blueprint'
          });
          setPersonaReady(true);
          
          // Mock VFP Graph status for Enhanced AI Coach
          setVfpGraphStatus({
            isAvailable: true,
            vectorDimensions: 512,
            personalitySummary: 'Analytical, goal-oriented, collaborative',
            vectorMagnitude: 0.87
          });
        }
        
        setIsInitialized(true);
      } catch (error) {
        console.error('Enhanced AI Coach initialization error:', error);
        setAuthInitialized(true);
        setIsInitialized(true);
      }
    };

    initializeAuth();
  }, []);

  const sendMessage = useCallback(async (
    message: string,
    isEnhanced: boolean = true,
    displayMessage?: string,
    options?: { suppressDisplay?: boolean }
  ): Promise<void> => {
    if (!message.trim()) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content: displayMessage || message,
      sender: 'user',
      timestamp: new Date(),
      agent_mode: currentAgent,
      suppressDisplay: options?.suppressDisplay ?? false
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    // Process message with subconscious orb (non-blocking)
    if (subconsciousEnabled) {
      processSubconsciousMessage(displayMessage || message, userMessage.id).catch(error => {
        console.error('🚨 Subconscious orb processing error:', error);
      });
    }
    
    // Track conversation activity for smart insights
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (user?.id) {
        console.log('💬 Tracking conversation activity for user:', user.id);
        const { SmartInsightController } = await import('@/services/smart-insight-controller');
        SmartInsightController.trackUserActivity(user.id, 'conversation');
      }
    } catch (error) {
      console.error('Error tracking conversation activity:', error);
    }
    
    try {
      // Use streaming for enhanced experience with coordinated loading
      setIsStreaming(true);
      setStreamingContent('');
      streamingAbortRef.current = startLoading('core');
      
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        content: '',
        sender: 'assistant',
        timestamp: new Date(),
        agent_mode: currentAgent
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      
      console.log('💬 Starting streaming conversation...', { 
        agent: currentAgent, 
        message: message.substring(0, 50) 
      });
      
      await aiCoachService.sendStreamingMessage(
        message,
        sessionIdRef.current,
        isEnhanced,
        currentAgent,
        language,
        {
          onChunk: (content: string) => {
            setStreamingContent(content);
            setMessages(prev => prev.map(msg => 
              msg.id === assistantMessage.id 
                ? { ...msg, content }
                : msg
            ));
          },
          onComplete: async (fullResponse: string) => {
            setIsStreaming(false);
            setStreamingContent('');
            completeLoading('core');
            setMessages(prev => prev.map(msg => 
              msg.id === assistantMessage.id 
                ? { ...msg, content: fullResponse }
                : msg
            ));
            
            // Trigger insight generation after conversation completes
            try {
              console.log('💬 Conversation completed, triggering insight check...');
              const { data: { user }, error } = await supabase.auth.getUser();
              if (user?.id) {
                const { useHACSInsights } = await import('@/hooks/use-hacs-insights');
                // Note: This is a hook import, the actual trigger will be handled via a service
                const { SmartInsightController } = await import('@/services/smart-insight-controller');
                
                // Check if we can deliver conversation insights
                if (SmartInsightController.canDeliverConversationInsight(user.id)) {
                  console.log('💬 Generating conversation insights...');
                  await SmartInsightController.generateConversationInsights(user.id);
                  console.log('✅ Conversation insights generated');
                }
              }
            } catch (error) {
              console.error('Error triggering insights:', error);
            }
          },
          onError: (error: Error) => {
            console.error('Streaming error:', error);
            setIsStreaming(false);
            completeLoading('core');
            setMessages(prev => prev.map(msg => 
              msg.id === assistantMessage.id 
                ? { ...msg, content: 'I encountered an error. Please try again.' }
                : msg
            ));
          }
        },
        userName
      );
      
    } catch (error) {
      console.error('Enhanced AI Coach error:', error);
      
      // Fallback to non-streaming
      try {
        const response = await aiCoachService.sendMessage(
          message,
          sessionIdRef.current,
          isEnhanced,
          currentAgent,
          language,
          userName
        );
        
        const assistantMessage: Message = {
          id: `assistant-fallback-${Date.now()}`,
          content: response.response,
          sender: 'assistant',
          timestamp: new Date(),
          agent_mode: currentAgent
        };
        
        setMessages(prev => [...prev, assistantMessage]);
      } catch (fallbackError) {
        console.error('Fallback error:', fallbackError);
        const errorMessage: Message = {
          id: `error-${Date.now()}`,
          content: 'I\'m having trouble connecting right now. Please try again in a moment.',
          sender: 'assistant',
          timestamp: new Date(),
          agent_mode: currentAgent
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
      completeLoading('core');
    }
  }, [currentAgent, userName]);

  const resetConversation = useCallback(() => {
    setMessages([]);
    sessionIdRef.current = aiCoachService.createNewSession();
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  const switchAgent = useCallback((agent: AgentType) => {
    setCurrentAgent(agent);
  }, []);

  const recordVFPGraphFeedback = useCallback((messageId: string, isPositive: boolean) => {
    // Log feedback for future ML improvements
    console.log(`VFP Graph feedback for message ${messageId}: ${isPositive ? 'positive' : 'negative'}`);
  }, []);

  return {
    messages,
    isLoading,
    sendMessage,
    resetConversation,
    clearMessages,
    currentAgent,
    switchAgent,
    personaReady,
    authInitialized,
    blueprintStatus,
    vfpGraphStatus,
    recordVFPGraphFeedback,
    acsEnabled,
    acsState,
    userName,
    streamingContent,
    isStreaming,
    isInitialized,
    
    // Subconscious orb integration
    subconsciousOrb: {
      state: orbState,
      mode: subconsciousMode,
      patternDetected,
      adviceReady,
      handleClick: handleOrbClick,
      enabled: subconsciousEnabled
    }
  };
};
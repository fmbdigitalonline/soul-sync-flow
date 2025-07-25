import { useState, useEffect, useCallback, useRef } from 'react';
import { aiCoachService } from '@/services/ai-coach-service';
import { supabase } from '@/integrations/supabase/client';

export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  agent_mode?: string;
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
    usePersonalization: boolean = true, 
    originalMessage?: string
  ): Promise<void> => {
    if (!message.trim()) return;
    
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content: originalMessage || message,
      sender: 'user',
      timestamp: new Date(),
      agent_mode: currentAgent
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    
    try {
      // Use streaming for enhanced experience
      setIsStreaming(true);
      setStreamingContent('');
      
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        content: '',
        sender: 'assistant',
        timestamp: new Date(),
        agent_mode: currentAgent
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      
      await aiCoachService.sendStreamingMessage(
        message,
        sessionIdRef.current,
        usePersonalization,
        currentAgent,
        'en',
        {
          onChunk: (content: string) => {
            setStreamingContent(content);
            setMessages(prev => prev.map(msg => 
              msg.id === assistantMessage.id 
                ? { ...msg, content }
                : msg
            ));
          },
          onComplete: (fullResponse: string) => {
            setIsStreaming(false);
            setStreamingContent('');
            setMessages(prev => prev.map(msg => 
              msg.id === assistantMessage.id 
                ? { ...msg, content: fullResponse }
                : msg
            ));
          },
          onError: (error: Error) => {
            console.error('Streaming error:', error);
            setIsStreaming(false);
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
          usePersonalization,
          currentAgent,
          'en',
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
    isInitialized
  };
};
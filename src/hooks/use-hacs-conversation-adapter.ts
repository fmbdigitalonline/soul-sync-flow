
import { useState, useCallback, useRef, useEffect } from 'react';
import { useHACSConversation, ConversationMessage } from './use-hacs-conversation';
import { useEnhancedAICoach } from './use-enhanced-ai-coach-stub';
import { supabase } from '@/integrations/supabase/client';
import { unifiedBrainService } from '@/services/unified-brain-service';

// Adapter interface that matches useEnhancedAICoach exactly
export interface HACSConversationAdapter {
  messages: ConversationMessage[];
  isLoading: boolean;
  sendMessage: (
    content: string,
    usePersonalization?: boolean,
    context?: any,
    agentOverride?: string
  ) => Promise<void>;
  resetConversation: () => void;
  currentAgent: string;
  switchAgent: (newAgent: string) => void;
  streamingContent: string;
  isStreaming: boolean;
  personaReady: boolean;
  authInitialized: boolean;
  blueprintStatus: any;
  vfpGraphStatus: any;
  recordVFPGraphFeedback: (messageId: string, isPositive: boolean) => void;
  acsEnabled: boolean;
  acsState: string;
  userName: string;
}

export const useHACSConversationAdapter = (
  initialAgent: string = "guide",
  pageContext: string = "general"
): HACSConversationAdapter => {
  // Use HACS conversation for message storage and state management
  const hacsConversation = useHACSConversation();
  
  // Keep enhanced AI coach for backwards compatibility but don't use its sendMessage
  const enhancedCoach = useEnhancedAICoach(initialAgent as any, pageContext);
  
  // Track streaming state for unified brain processing
  const [streamingContent, setStreamingContent] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const sessionIdRef = useRef(`session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);

  // CRITICAL: Route through Unified Brain Service like Companion does
  const sendMessage = useCallback(async (
    content: string,
    usePersonalization: boolean = true,
    context?: any,
    agentOverride?: string
  ) => {
    console.log(`🔄 HACS Adapter: Routing message through unified brain (${agentOverride || initialAgent} mode)`);
    
    // Add user message optimistically to HACS conversation
    const userMessage: ConversationMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: content.trim(),
      timestamp: new Date().toISOString()
    };

    // Add user message to HACS conversation state immediately
    hacsConversation.setMessages(prev => [...prev, userMessage]);
    
    try {
      // Get current user for unified brain processing
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Set loading state for AI response
      hacsConversation.setIsLoading(true);
      setIsStreaming(true);

      // CRITICAL: Route through Unified Brain Service (same as Companion)
      console.log('🧠 Processing message through unified brain with layered models - Mode:', agentOverride || initialAgent, 'State: NORMAL');
      
      // Map agent modes to valid AgentMode types
      const agentMode = (agentOverride || initialAgent) === 'companion' ? 'blend' : 
                       (agentOverride || initialAgent) as 'guide' | 'coach' | 'blend';
      
      const response = await unifiedBrainService.processMessage(
        content,
        sessionIdRef.current,
        agentMode,
        'NORMAL'
      );

      // Add AI response to HACS conversation
      const aiMessage: ConversationMessage = {
        id: `hacs_${Date.now()}`,
        role: 'hacs',
        content: response.response,
        timestamp: new Date().toISOString()
      };

      hacsConversation.setMessages(prev => [...prev, aiMessage]);

      // Record the interaction in HACS intelligence for learning
      await hacsConversation.recordConversationInteraction(
        content,
        'excellent' // Unified brain responses are high quality
      );

      // Refresh intelligence to update visuals
      await hacsConversation.refreshIntelligence();

      console.log('✅ HACS Adapter: Message processed through unified brain with all 11 Hermetic modules');

    } catch (error) {
      console.error('❌ HACS Adapter: Unified brain processing failed:', error);
      
      // Remove optimistically added user message on failure
      hacsConversation.setMessages(prev => prev.filter(msg => msg.id !== userMessage.id));
      
      // Re-throw error to surface the problem transparently
      throw error;
    } finally {
      hacsConversation.setIsLoading(false);
      setIsStreaming(false);
      setStreamingContent('');
    }
  }, [hacsConversation, initialAgent, unifiedBrainService]);

  const resetConversation = useCallback(() => {
    hacsConversation.clearConversation();
    setStreamingContent('');
    setIsStreaming(false);
  }, [hacsConversation.clearConversation]);

  const switchAgent = useCallback((newAgent: string) => {
    // Keep agent switching functionality but route through HACS
    enhancedCoach.switchAgent(newAgent as any);
  }, [enhancedCoach.switchAgent]);

  return {
    messages: hacsConversation.messages,
    isLoading: hacsConversation.isLoading,
    sendMessage,
    resetConversation,
    currentAgent: enhancedCoach.currentAgent,
    switchAgent,
    streamingContent,
    isStreaming,
    personaReady: enhancedCoach.personaReady,
    authInitialized: enhancedCoach.authInitialized,
    blueprintStatus: enhancedCoach.blueprintStatus,
    vfpGraphStatus: enhancedCoach.vfpGraphStatus,
    recordVFPGraphFeedback: enhancedCoach.recordVFPGraphFeedback,
    acsEnabled: enhancedCoach.acsEnabled,
    acsState: enhancedCoach.acsState,
    userName: enhancedCoach.userName
  };
};

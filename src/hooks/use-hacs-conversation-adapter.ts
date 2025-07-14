import { useState, useCallback, useRef, useEffect } from 'react';
import { useHACSConversation, ConversationMessage } from './use-hacs-conversation';
import { useEnhancedAICoach } from './use-enhanced-ai-coach-stub';
import { supabase } from '@/integrations/supabase/client';

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
  // Use HACS conversation for intelligence learning
  const hacsConversation = useHACSConversation();
  
  // Keep enhanced AI coach for backwards compatibility but don't use its sendMessage
  const enhancedCoach = useEnhancedAICoach(initialAgent as any, pageContext);
  
  // Return HACS messages directly - they already have the correct ConversationMessage format
  // No conversion needed since HACSChatInterface expects ConversationMessage type

  // **PHASE 2: Route all sendMessage calls through Unified Brain (11 Hermetic components)**
  const sendMessage = useCallback(async (
    content: string,
    usePersonalization: boolean = true,
    context?: any,
    agentOverride?: string
  ) => {
    // Route through Unified Brain Service for all 11 Hermetic Components
    // This ensures all modes get the same intelligence processing
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      
      // Import Unified Brain Service dynamically to avoid circular dependencies
      const { unifiedBrainService } = await import('../services/unified-brain-service');
      await unifiedBrainService.initialize(user.id);
      
      // Process through ALL 11 Hermetic components: NIK → CPSR → HFME → DPEM → TWS → CNR → BPSC + VPG → PIE → TMG → ACS
      const sessionId = `adapter_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const agentMode = agentOverride || initialAgent;
      
      console.log(`🔄 HACS Adapter: Routing message through unified brain (${agentMode} mode)`);
      
      const brainResponse = await unifiedBrainService.processMessageForModeHook(
        content,
        sessionId,
        agentMode as any,
        hacsConversation.messages || []
      );
      
      console.log('✅ HACS Adapter: Message processed through all 11 Hermetic components');
      
      // Let the hacsConversation handle UI updates but with our response
      // The UBS already processed through all 11 Hermetic components
      
    } catch (error) {
      console.error('❌ Unified Brain routing failed, using fallback:', error);
      // Fallback to original HACS conversation if unified brain fails
      await hacsConversation.sendMessage(content);
    }
  }, [hacsConversation.sendMessage, initialAgent]);

  const resetConversation = useCallback(() => {
    hacsConversation.clearConversation();
  }, [hacsConversation.clearConversation]);

  const switchAgent = useCallback((newAgent: string) => {
    enhancedCoach.switchAgent(newAgent as any);
  }, [enhancedCoach.switchAgent]);

  const recordVFPGraphFeedback = useCallback((messageId: string, isPositive: boolean) => {
    enhancedCoach.recordVFPGraphFeedback(messageId, isPositive);
  }, [enhancedCoach.recordVFPGraphFeedback]);

  return {
    // Use HACS conversation messages directly (they're already ConversationMessage format)
    messages: hacsConversation.messages,
    isLoading: hacsConversation.isLoading,
    sendMessage, // Unified Brain routing with all 11 Hermetic components
    resetConversation,
    currentAgent: enhancedCoach.currentAgent,
    switchAgent,
    streamingContent: '',
    isStreaming: hacsConversation.isTyping,
    personaReady: enhancedCoach.personaReady,
    authInitialized: enhancedCoach.authInitialized,
    blueprintStatus: enhancedCoach.blueprintStatus,
    vfpGraphStatus: enhancedCoach.vfpGraphStatus,
    recordVFPGraphFeedback,
    acsEnabled: enhancedCoach.acsEnabled,
    acsState: enhancedCoach.acsState,
    userName: enhancedCoach.userName,
  };
};

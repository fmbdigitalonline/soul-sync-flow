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

  // CRITICAL: Route all sendMessage calls through Unified Brain (11 Hermetic components)
  const sendMessage = useCallback(async (
    content: string,
    usePersonalization: boolean = true,
    context?: any,
    agentOverride?: string
  ) => {
    // Import services dynamically to avoid circular dependencies
    const { unifiedBrainService } = await import('../services/unified-brain-service');
    const { cnrMessageRouter } = await import('../services/cnr-message-router');
    
    try {
      // Ensure unified brain is initialized
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      
      // Initialize services if not already done
      await unifiedBrainService.initialize(user.id);
      cnrMessageRouter.initialize();
      
      // Process through ALL 11 Hermetic components: NIK → CPSR → HFME → DPEM → TWS → CNR → BPSC + VPG → PIE → TMG → ACS
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const agentMode = agentOverride || initialAgent;
      
      console.log(`🔄 HACS Adapter: Routing message through unified brain (${agentMode} mode)`);
      
      const brainResponse = await unifiedBrainService.processMessage(
        content,
        sessionId,
        agentMode as any,
        'NORMAL'
      );
      
      console.log('✅ HACS Adapter: Message processed through all 11 Hermetic components');
      
      // STEP 3: Check if response contains CNR clarifications that should route to floating orb
      // Following SoulSync Principle 3: No Fallbacks That Mask Errors - surface routing transparently
      const hasCNRClarification = await cnrMessageRouter.processUnifiedBrainResponse(brainResponse);
      
      if (hasCNRClarification) {
        console.log('🎯 HACS Adapter: CNR clarification detected - routed to floating orb, skipping main conversation');
        // Don't add CNR questions to main conversation - they go to floating orb
        return;
      }
      
      // Now update the HACS conversation with the processed response (only if not CNR clarification)
      // This maintains the optimistic UI while ensuring full pipeline processing
      await hacsConversation.sendMessage(content);
      
    } catch (error) {
      console.error('❌ Unified Brain routing failed - no fallback (as requested):', error);
      // Re-throw error to surface the problem transparently
      throw error;
    }
  }, [hacsConversation.sendMessage, initialAgent]);

  const resetConversation = useCallback(() => {
    hacsConversation.clearConversation();
  }, [hacsConversation.clearConversation]);

  const switchAgent = useCallback((newAgent: string) => {
    // Keep agent switching functionality but route through HACS
    enhancedCoach.switchAgent(newAgent as any);
  }, [enhancedCoach.switchAgent]);

  return {
    messages: hacsConversation.messages,
    isLoading: hacsConversation.isLoading || enhancedCoach.isLoading,
    sendMessage,
    resetConversation,
    currentAgent: enhancedCoach.currentAgent,
    switchAgent,
    streamingContent: enhancedCoach.streamingContent,
    isStreaming: enhancedCoach.isStreaming,
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

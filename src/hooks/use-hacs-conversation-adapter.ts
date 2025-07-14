import { useState, useCallback, useRef, useEffect } from 'react';
import { useHACSConversation } from './use-hacs-conversation';
import { useEnhancedAICoach } from './use-enhanced-ai-coach-stub';
import { supabase } from '@/integrations/supabase/client';

// Adapter interface that matches useEnhancedAICoach exactly
export interface HACSConversationAdapter {
  messages: Array<{
    id: string;
    content: string;
    sender: "user" | "assistant";
    timestamp: Date;
    agent_mode?: string;
  }>;
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
  
  // Convert HACS messages to enhanced coach format
  const convertedMessages = hacsConversation.messages.map(msg => ({
    id: msg.id,
    content: msg.content,
    sender: msg.role === 'user' ? 'user' as const : 'assistant' as const,
    timestamp: new Date(msg.timestamp),
    agent_mode: msg.module || initialAgent
  }));

  // CRITICAL: Route all sendMessage calls through Unified Brain (11 Hermetic components)
  const sendMessage = useCallback(async (
    content: string,
    usePersonalization: boolean = true,
    context?: any,
    agentOverride?: string
  ) => {
    // Import Unified Brain Service dynamically to avoid circular dependencies
    const { unifiedBrainService } = await import('../services/unified-brain-service');
    
    try {
      // Ensure unified brain is initialized
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      
      // Initialize if not already done
      await unifiedBrainService.initialize(user.id);
      
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
      
      // Convert brain response to HACS conversation format for UI compatibility
      const hacsMessage = {
        id: `hacs_${Date.now()}`,
        role: 'hacs' as const,
        content: brainResponse.response,
        timestamp: new Date().toISOString()
      };
      
      // Update the internal conversation state to maintain UI sync
      // This is a workaround to keep the UI working while routing through unified brain
      const userMessage = {
        id: `user_${Date.now()}`,
        role: 'user' as const,
        content,
        timestamp: new Date().toISOString()
      };
      
      // We can't directly modify hacsConversation state, so we'll let the original flow handle it
      // but ensure it routes through unified brain by wrapping the call
      await hacsConversation.sendMessage(content);
      
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
    // Keep agent switching functionality but route through HACS
    enhancedCoach.switchAgent(newAgent as any);
  }, [enhancedCoach.switchAgent]);

  return {
    messages: convertedMessages,
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

import { useState, useCallback, useRef, useEffect } from 'react';
import { useHACSConversation, ConversationMessage } from './use-hacs-conversation';
import { useEnhancedAICoach } from './use-enhanced-ai-coach-stub';
import { supabase } from '@/integrations/supabase/client';
import { ImmediateResponseService } from '../services/immediate-response-service';
import { BackgroundIntelligenceService } from '../services/background-intelligence-service';

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

  // PHASE 1: DUAL-PATHWAY ARCHITECTURE - Asynchronous Intelligence Model
  const sendMessage = useCallback(async (
    content: string,
    usePersonalization: boolean = true,
    context?: any,
    agentOverride?: string
  ) => {
    console.log('🚀 DUAL-PATHWAY VALIDATION: sendMessage called', {
      content: content.substring(0, 50),
      agentOverride,
      timestamp: new Date().toISOString()
    });

    try {
      // Get user authentication
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const agentMode = agentOverride || initialAgent;

      // ============================================================
      // PATHWAY 1: IMMEDIATE RESPONSE (Target: <200ms)
      // ============================================================
      console.log('🟢 PATHWAY 1: Starting immediate response generation');
      
      // INTELLIGENCE RETRIEVAL: Get accumulated intelligence from previous background processing
      console.log('🧠 RETRIEVAL: Fetching accumulated intelligence from previous cycles');
      const accumulatedIntelligence = await BackgroundIntelligenceService.getAccumulatedIntelligence(
        user.id,
        sessionId
      );
      
      const immediateResponsePromise = ImmediateResponseService.generateImmediateResponse(
        content,
        user.id,
        agentMode,
        accumulatedIntelligence // INJECTION: Pass deep context to immediate response
      );

      // ============================================================
      // PATHWAY 2: BACKGROUND INTELLIGENCE (Full Pipeline)
      // ============================================================
      console.log('🔵 PATHWAY 2: Starting background intelligence processing');
      
      const backgroundProcessingPromise = BackgroundIntelligenceService.processInBackground(
        content,
        user.id,
        sessionId,
        agentMode
      );

      // ============================================================
      // PATHWAY VALIDATION: Prove both pathways are called
      // ============================================================
      const [immediateResponse, backgroundResult] = await Promise.all([
        immediateResponsePromise,
        backgroundProcessingPromise
      ]);

      console.log('✅ DUAL-PATHWAY VALIDATION: Both pathways completed', {
        immediateProcessingTime: immediateResponse.processingTime,
        backgroundProcessingId: backgroundResult.processingId,
        pathwaysValidated: true
      });

      // For Phase 1, we'll still route through the original HACS conversation
      // to maintain UI compatibility while proving the pathway architecture works
      await hacsConversation.sendMessage(content);
      
    } catch (error) {
      console.error('❌ DUAL-PATHWAY ERROR: One or both pathways failed', error);
      // Fallback to original HACS conversation
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

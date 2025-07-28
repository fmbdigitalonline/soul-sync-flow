import { useState, useCallback, useRef, useEffect } from 'react';
import { useHACSConversation, ConversationMessage } from './use-hacs-conversation';
import { useEnhancedAICoach } from './use-enhanced-ai-coach';
import { useMode } from '@/contexts/ModeContext';
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
  // FUSION FIX: Use ModeContext to determine correct agent mode
  const { currentMode, modeConfig } = useMode();
  
  // Map ModeContext to agent mode correctly
  const getAgentModeFromContext = (): string => {
    if (currentMode === 'companion') return 'companion';
    if (currentMode === 'productivity') return 'coach';
    if (currentMode === 'growth') return 'guide';
    
    // FUSION FIX: For index route with blend agent, use companion mode
    if (currentMode === 'neutral' && modeConfig.agentType === 'blend') {
      return 'companion'; // This enables oracle functionality on index route
    }
    
    return modeConfig.agentType; // Fallback to configured agent type
  };
  
  // FUSION FIX: Enhanced companion mode detection
  // Check multiple sources to determine if we should use companion/oracle mode
  const shouldUseCompanionMode = (): boolean => {
    // Direct companion mode setting
    if (currentMode === 'companion') return true;
    
    // Check if we're on index route with 'blend' agent type (default companion behavior)
    if (currentMode === 'neutral' && modeConfig.agentType === 'blend') {
      // Index route with blend agent = companion functionality
      return true;
    }
    
    return false;
  };
  
  const isCompanionMode = shouldUseCompanionMode();
  console.log('🔮 FUSION: Enhanced mode detection', { 
    currentMode, 
    agentType: modeConfig.agentType,
    shouldUseCompanion: isCompanionMode,
    routePath: window.location.pathname
  });
  
  // Use HACS conversation for intelligence learning
  const hacsConversation = useHACSConversation();
  
  // Keep enhanced AI coach for backwards compatibility but don't use its sendMessage
  const enhancedCoach = useEnhancedAICoach(initialAgent as any, pageContext);
  
  // CRITICAL FIX: Persistent session ID to close intelligence loop
  const sessionIdRef = useRef<string | null>(null);
  
  // Generate session ID once per conversation and persist it
  const getOrCreateSessionId = useCallback(() => {
    if (!sessionIdRef.current) {
      sessionIdRef.current = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      console.log('🔑 SESSION: Created persistent session ID:', sessionIdRef.current);
    }
    return sessionIdRef.current;
  }, []);
  
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
      
      // FUSION FIX: Use context-aware agent mode instead of hardcoded 'guide'
      const sessionId = getOrCreateSessionId();
      const agentMode = agentOverride || getAgentModeFromContext();

      console.log('🔮 FUSION: Agent mode determination', { 
        currentMode, 
        isCompanionMode, 
        agentOverride, 
        finalAgentMode: agentMode,
        sessionId 
      });

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

      // FUSION: Oracle-enhanced conversation when in companion mode
      if (isCompanionMode) {
        console.log('🔮 FUSION: Enhancing conversation with oracle + HACS intelligence');
        
        // Call the companion oracle function with fusion enabled
        const { data: oracleResponse, error: oracleError } = await supabase.functions.invoke('companion-oracle-conversation', {
          body: {
            message: content,
            userId: user.id,
            sessionId,
            useOracleMode: true,
            enableBackgroundIntelligence: true // Enable HACS intelligence fusion
          }
        });

        if (oracleError) {
          console.error('❌ FUSION ERROR: Oracle call failed, falling back to standard HACS', oracleError);
          await hacsConversation.sendMessage(content);
        } else {
          console.log('✅ FUSION SUCCESS: Oracle + HACS intelligence response generated', {
            oracleStatus: oracleResponse.oracleStatus,
            semanticChunks: oracleResponse.semanticChunks,
            intelligenceLevel: oracleResponse.intelligenceLevel,
            fusionEnabled: oracleResponse.fusionEnabled
          });
          
          // Store oracle response in HACS conversation system for intelligence tracking
          await hacsConversation.sendOracleMessage(content, oracleResponse);
        }
      } else {
        // Standard HACS conversation for non-companion modes
        await hacsConversation.sendMessage(content);
      }
      
    } catch (error) {
      console.error('❌ DUAL-PATHWAY ERROR: One or both pathways failed', error);
      // Fallback to original HACS conversation
      await hacsConversation.sendMessage(content);
    }
  }, [hacsConversation.sendMessage, hacsConversation.sendOracleMessage, initialAgent, isCompanionMode]);

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

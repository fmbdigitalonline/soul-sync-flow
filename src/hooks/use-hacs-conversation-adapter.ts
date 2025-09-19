import { useState, useCallback, useRef, useEffect } from 'react';
import { useHACSConversation, ConversationMessage } from './use-hacs-conversation';
import { useEnhancedAICoach } from './use-enhanced-ai-coach';
import { useMode } from '@/contexts/ModeContext';
import { supabase } from '@/integrations/supabase/client';
import { ImmediateResponseService } from '../services/immediate-response-service';
import { BackgroundIntelligenceService } from '../services/background-intelligence-service';
import { useCoordinatedLoading } from '@/hooks/use-coordinated-loading';
import { createErrorHandler } from '@/utils/error-recovery';
import { conversationMemoryService } from '@/services/conversation-memory-service';

// Adapter interface that matches useEnhancedAICoach exactly
export interface HACSConversationAdapter {
  messages: ConversationMessage[];
  isLoading: boolean;
  isStreamingResponse: boolean;
  sendMessage: (
    content: string,
    usePersonalization?: boolean,
    context?: any,
    agentOverride?: string
  ) => Promise<void>;
  stopStreaming: () => void;
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
  markMessageStreamingComplete: (messageId: string) => void;
}

export const useHACSConversationAdapter = (
  initialAgent: string = "guide",
  pageContext: string = "general"
): HACSConversationAdapter => {
  // Coordinated loading state management
  const { 
    loadingState,
    isLoading: coordinatedLoading, 
    startLoading, 
    completeLoading, 
    forceRecovery,
    getActiveOperations 
  } = useCoordinatedLoading();
  
  // Local Oracle abort controller for coordinated cancellation
  const oracleAbortRef = useRef<AbortController | null>(null);
  
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
  const { markMessageStreamingComplete } = hacsConversation;
  
  // Oracle streaming completion handler
  const handleOracleStreamingComplete = useCallback((messageId: string) => {
    console.log('🔮 Oracle streaming complete for message:', messageId, { loadingState });
    markMessageStreamingComplete(messageId);
    
    // Complete both Oracle and streaming operations on adapter coordinator
    completeLoading('oracle');
    completeLoading('streaming');

    // Safety: if anything remains active after 1.2s, force recovery
    setTimeout(() => {
      const active = getActiveOperations();
      const stillActive = active.length > 0;
      if (stillActive) {
        console.warn('🛠️ Recovery: Active operations remain after streaming complete', { active });
        forceRecovery();
      }
    }, 1200);
  }, [markMessageStreamingComplete, completeLoading, getActiveOperations, forceRecovery, loadingState]);

  // Coordinated Oracle operation management
  const startOracleOperation = useCallback(() => {
    console.log('🔮 Starting Oracle operation with coordinated loading');
    oracleAbortRef.current = startLoading('oracle');
    return oracleAbortRef.current;
  }, [startLoading]);

  const completeOracleOperation = useCallback(() => {
    console.log('🔮 Completing Oracle operation');
    completeLoading('oracle');
    if (oracleAbortRef.current) {
      oracleAbortRef.current = null;
    }
  }, [completeLoading]);

  // Standardized error handler for Oracle operations
  const handleOracleError = createErrorHandler('oracle', () => {
    completeOracleOperation();
    forceRecovery();
  });
  
  // Keep enhanced AI coach for backwards compatibility but don't use its sendMessage
  const enhancedCoach = useEnhancedAICoach(initialAgent as any, pageContext);
  
  // PHASE 1 FIX: Server-managed thread lifecycle (stable conversation threads)
  const [stableThreadId, setStableThreadId] = useState<string | null>(null);
  const [threadLoading, setThreadLoading] = useState(true);
  
  // Get or create stable conversation thread
  const initializeStableThread = useCallback(async () => {
    // Get current user authentication state
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    
    try {
      console.log('🧵 THREAD: Initializing stable conversation thread');
      
      const { data, error } = await supabase.functions.invoke('conversation-thread-manager', {
        body: { 
          mode: isCompanionMode ? 'companion' : 'guide' 
        }
      });
      
      if (error) {
        console.error('🚨 THREAD: Failed to initialize thread:', error);
        return null;
      }
      
      console.log('✅ THREAD: Stable thread ready:', data.thread);
      return data.thread.id;
    } catch (error) {
      console.error('🚨 THREAD: Thread initialization failed:', error);
      return null;
    }
  }, [isCompanionMode]);
  
  // Initialize thread on mount or mode change
  useEffect(() => {
    const initThread = async () => {
      const threadId = await initializeStableThread();
      if (threadId) {
        setStableThreadId(threadId);
        localStorage.setItem('stable_thread_id', threadId);
      } else {
        // Fallback to legacy session ID
        const fallbackId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        setStableThreadId(fallbackId);
      }
      setThreadLoading(false);
    };
    
    initThread();
  }, [initializeStableThread]);
  
  // Legacy fallback for backward compatibility
  const sessionIdRef = useRef<string | null>(null);
  const getOrCreateSessionId = useCallback(() => {
    if (!sessionIdRef.current) {
      sessionIdRef.current = stableThreadId || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      console.log('🔑 SESSION: Using session ID:', sessionIdRef.current);
    }
    return sessionIdRef.current;
  }, [stableThreadId]);
  
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

    // Post-send guard: if any operations still active after 9s, force recovery
    setTimeout(() => {
      const active = getActiveOperations();
      if (active.length > 0) {
        console.warn('⏱️ Post-send guard forcing recovery due to lingering operations', { active });
        forceRecovery();
      }
    }, 9000);

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

  // ORACLE-FIRST FLOW: Enhanced with 4-layer memory system
      if (isCompanionMode) {
        console.log('🔮 ORACLE-FIRST: Starting enhanced conversation flow with 4-layer memory');
        
        // Start coordinated Oracle operation
        const abortController = startOracleOperation();
        
        try {
          // NEW: Use Enhanced Conversation Orchestrator for complete context
          const { enhancedConversationOrchestrator } = await import('@/services/enhanced-conversation-orchestrator');
          
          const enhancedContext = await enhancedConversationOrchestrator.processUserMessage(
            content,
            stableThreadId!,
            user.id
          );
          
          console.log('🎭 ENHANCED CONTEXT LOADED:', {
            intent: enhancedContext.currentIntent.type,
            confidence: enhancedContext.currentIntent.confidence,
            contextQuality: enhancedContext.contextQuality,
            turnBuffer: enhancedContext.turnBufferSize,
            semanticMemories: enhancedContext.semanticContext.relevantMemories.length
          });

          // Convert context for Oracle
          let recentMessages = enhancedContext.recentTurns.map(turn => ({
            role: turn.speaker === 'assistant' ? 'assistant' : turn.speaker,
            content: turn.text,
            timestamp: turn.timestamp
          }));

          // PILLAR II: Load user profile for Oracle context
          const { data: blueprint } = await supabase
            .from('user_blueprints')
            .select('blueprint')
            .eq('user_id', user.id)
            .eq('is_active', true)
            .maybeSingle();

          let userProfile: { name: string; mbti: string; hdType: string; sunSign: string } = {
            name: 'Seeker',
            mbti: 'Unknown',
            hdType: 'Unknown',
            sunSign: 'Unknown'
          };
          
          if (blueprint?.blueprint) {
            const blueprintData = blueprint.blueprint as any;
            userProfile = {
              name: blueprintData.user_meta?.preferred_name || 'Seeker',
              mbti: blueprintData.user_meta?.personality?.likelyType || 
                    blueprintData.cognition_mbti?.type || 'Unknown',
              hdType: blueprintData.energy_strategy_human_design?.type || 'Unknown',
              sunSign: blueprintData.archetype_western?.sun_sign || 'Unknown'
            };
          }

          console.log('🔮 ADAPTER ORACLE: Enhanced context loaded', {
            conversationHistory: recentMessages.length,
            userProfile: Object.keys(userProfile).length > 0
          });

          // Generate enhanced prompt for Oracle
          const basePrompt = "Je bent een wijze metgezel die luistert naar de gebruiker en bouwt voort op de gesprekcontext.";
          const enhancedPrompt = await enhancedConversationOrchestrator.generateEnhancedPrompt(
            basePrompt,
            enhancedContext,
            stableThreadId!,
            userProfile.name || 'friend'
          );

          // Call the companion oracle function with enhanced context and prompt
          const { data: oracleResponse, error: oracleError } = await supabase.functions.invoke('companion-oracle-conversation', {
            body: {
              message: content,
              userId: user.id,
              sessionId,
              threadId: stableThreadId,
              useOracleMode: true,
              enableBackgroundIntelligence: true,
              conversationHistory: recentMessages,
              userProfile: userProfile,
              enhancedPrompt: enhancedPrompt,
              intentContext: enhancedContext.currentIntent
            }
          });

          if (oracleError) {
            throw new Error(`Oracle call failed: ${oracleError.message}`);
          }

          console.log('✅ ORACLE-FIRST SUCCESS: Oracle response generated', {
            oracleStatus: oracleResponse.oracleStatus,
            semanticChunks: oracleResponse.semanticChunks,
            intelligenceLevel: oracleResponse.intelligenceLevel,
            responseLength: oracleResponse.response?.length || 0
          });
          
          // ENHANCED: Process AI response through orchestrator
          if (oracleResponse?.response) {
            await enhancedConversationOrchestrator.processAIResponse(
              oracleResponse.response,
              stableThreadId!,
              user.id,
              'companion'
            );
          }

          // Send through HACS conversation
          await hacsConversation.sendOracleMessage(content, oracleResponse);
          
          // Store in legacy conversation memory for backward compatibility
          try {
            await conversationMemoryService.storeMessageWithProgressiveMemory(stableThreadId!, {
              role: 'user',
              content: content,
              timestamp: new Date(),
              id: `user_${Date.now()}`
            }, user.id);
            
            if (oracleResponse?.response) {
              await conversationMemoryService.storeMessageWithProgressiveMemory(stableThreadId!, {
                role: 'assistant',
                content: oracleResponse.response,
                timestamp: new Date(),
                id: `oracle_${Date.now()}`,
                agent_mode: 'companion'
              }, user.id);
            }
            
            console.log('✅ ENHANCED ADAPTER: Complete 4-layer memory storage completed');
          } catch (error) {
            console.error('❌ ENHANCED ADAPTER: Storage error (non-critical):', error);
          }
          
          // Background processing for future intelligence
          BackgroundIntelligenceService.processInBackground(
            content,
            user.id,
            sessionId,
            agentMode
          ).catch(console.error);
          
        } catch (error) {
          console.error('❌ ORACLE-FIRST ERROR: Oracle conversation failed, falling back to HACS', error);
          handleOracleError(error, { fallback: true });
          
          // Fallback: Use standard HACS conversation
          await hacsConversation.sendMessage(content);
        }
        // Note: isOracleLoading will be set to false when streaming completes
        
      } else {
        // STANDARD FLOW: Dual-pathway for non-companion modes
        console.log('🟢 STANDARD FLOW: Starting dual-pathway for non-companion mode');
        
        // Get accumulated intelligence from previous processing
        const accumulatedIntelligence = await BackgroundIntelligenceService.getAccumulatedIntelligence(
          user.id,
          sessionId
        );
        
        const immediateResponsePromise = ImmediateResponseService.generateImmediateResponse(
          content,
          user.id,
          agentMode,
          accumulatedIntelligence
        );

        const backgroundProcessingPromise = BackgroundIntelligenceService.processInBackground(
          content,
          user.id,
          sessionId,
          agentMode
        );

        const [immediateResponse] = await Promise.all([
          immediateResponsePromise,
          backgroundProcessingPromise
        ]);

        console.log('✅ STANDARD FLOW: Dual-pathway completed', {
          immediateProcessingTime: immediateResponse.processingTime
        });

        // Standard HACS conversation for non-companion modes
        await hacsConversation.sendMessage(content);
      }
      
    } catch (error) {
      console.error('❌ DUAL-PATHWAY ERROR: One or both pathways failed', error);
      handleOracleError(error, { dualPathway: true });
      // Fallback to original HACS conversation
      await hacsConversation.sendMessage(content);
    }
  }, [hacsConversation.sendMessage, hacsConversation.sendOracleMessage, initialAgent, isCompanionMode, startOracleOperation, handleOracleError]);

  const resetConversation = useCallback(() => {
    hacsConversation.clearConversation();
  }, [hacsConversation.clearConversation]);

  const stopStreaming = useCallback(() => {
    console.log('🛑 STOP: User requested streaming stop');
    
    // Abort Oracle operation if active
    if (oracleAbortRef.current) {
      oracleAbortRef.current.abort();
      oracleAbortRef.current = null;
    }
    
    // Force recovery to clean up all operations
    forceRecovery();
    
    // Stop HACS streaming
    hacsConversation.stopStreaming();
  }, [forceRecovery, hacsConversation.stopStreaming]);

  const switchAgent = useCallback((newAgent: string) => {
    // Keep agent switching functionality but route through HACS
    enhancedCoach.switchAgent(newAgent as any);
  }, [enhancedCoach.switchAgent]);

  // Cleanup coordinated loading on unmount
  useEffect(() => {
    return () => {
      if (oracleAbortRef.current) {
        oracleAbortRef.current.abort();
      }
      forceRecovery();
    };
  }, [forceRecovery]);

  return {
    messages: hacsConversation.messages,
    isLoading: coordinatedLoading || hacsConversation.isLoading,
    isStreamingResponse: hacsConversation.isStreamingResponse,
    sendMessage,
    stopStreaming,
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
    userName: enhancedCoach.userName,
    markMessageStreamingComplete: handleOracleStreamingComplete
  };
};

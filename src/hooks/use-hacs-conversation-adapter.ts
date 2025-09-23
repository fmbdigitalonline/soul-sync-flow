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
  
  // DEBUGGING: Log loading states periodically
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('🔍 ADAPTER LOADING STATES:', {
        coordinatedLoading,
        threadLoading,
        isStreamingResponse: hacsConversation.isStreamingResponse,
        hacsLoading: hacsConversation.isLoading,
        enhancedLoading: enhancedCoach.isLoading,
        effectiveLoading: coordinatedLoading || threadLoading || hacsConversation.isLoading,
        activeOperations: getActiveOperations()
      });
    }, 2000);
    
    return () => clearInterval(interval);
  }, [coordinatedLoading, threadLoading, hacsConversation.isLoading, hacsConversation.isStreamingResponse, enhancedCoach.isLoading, getActiveOperations]);
  
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
    console.log('🚀 SEND MESSAGE START:', {
      content: content.substring(0, 50),
      agentOverride,
      threadLoading,
      isCompanionMode,
      timestamp: new Date().toISOString()
    });

    // STEP 0: Pre-flight checks
    if (!content?.trim()) {
      console.error('❌ SEND ERROR: Empty message content');
      return;
    }

    // Check if thread is still loading
    if (threadLoading) {
      console.warn('⚠️ SEND WARNING: Thread still loading, waiting...');
      // Wait up to 5 seconds for thread to initialize
      let attempts = 0;
      while (threadLoading && attempts < 50) {
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
      }
      
      if (threadLoading) {
        console.error('❌ SEND ERROR: Thread failed to initialize after 5 seconds');
        setThreadLoading(false); // Force reset
      }
    }

    // STEP 1: Skip optimistic message - let HACS conversation handle it
    console.log('📝 MESSAGE: Letting HACS conversation handle user message display');

    // Post-send guard: if any operations still active after 9s, force recovery
    setTimeout(() => {
      const active = getActiveOperations();
      if (active.length > 0) {
        console.warn('⏱️ Post-send guard forcing recovery due to lingering operations', { active });
        forceRecovery();
      }
    }, 9000);

    try {
      // STEP 2: Authentication check
      console.log('🔐 AUTH: Checking user authentication');
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('❌ AUTH ERROR: User not authenticated');
        throw new Error('User not authenticated - please refresh the page and log in again');
      }
      console.log('✅ AUTH: User authenticated', { userId: user.id });
      
      // STEP 3: Session and agent setup
      console.log('🔧 SETUP: Initializing session and agent mode');
      const sessionId = getOrCreateSessionId();
      const agentMode = agentOverride || getAgentModeFromContext();

      console.log('✅ SETUP: Session and agent configured', { 
        currentMode, 
        isCompanionMode, 
        agentOverride, 
        finalAgentMode: agentMode,
        sessionId,
        stableThreadId 
      });

      // STEP 4: Choose pathway based on companion mode
      if (isCompanionMode) {
        console.log('🔮 ORACLE-FIRST: Starting enhanced conversation flow');
        
        // Validate stable thread exists
        if (!stableThreadId) {
          console.error('❌ ORACLE ERROR: No stable thread ID available');
          throw new Error('Conversation thread not initialized');
        }
        
        // Start coordinated Oracle operation
        console.log('🔄 ORACLE: Starting coordinated loading operation');
        const abortController = startOracleOperation();
        
        try {
          console.log('🎭 ORACLE: Loading enhanced conversation orchestrator');
          // NEW: Use Enhanced Conversation Orchestrator for complete context
          const { enhancedConversationOrchestrator } = await import('@/services/enhanced-conversation-orchestrator');
          
          console.log('🧠 ORACLE: Processing user message with enhanced context');
          const enhancedContext = await enhancedConversationOrchestrator.processUserMessage(
            content,
            stableThreadId!,
            user.id
          );
          
          console.log('✅ ORACLE: Enhanced context loaded:', {
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

          // STEP 5: Load user profile for Oracle context
          console.log('👤 ORACLE: Loading user profile from blueprint');
          const { data: blueprint, error: blueprintError } = await supabase
            .from('user_blueprints')
            .select('blueprint')
            .eq('user_id', user.id)
            .eq('is_active', true)
            .maybeSingle();

          if (blueprintError) {
            console.warn('⚠️ ORACLE: Blueprint load error (non-critical):', blueprintError);
          }

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

          console.log('✅ ORACLE: User profile loaded', userProfile);

          // STEP 6: Generate enhanced prompt
          console.log('📝 ORACLE: Generating enhanced prompt');
          const basePrompt = "Je bent een wijze metgezel die luistert naar de gebruiker en bouwt voort op de gesprekcontext.";
          const enhancedPrompt = await enhancedConversationOrchestrator.generateEnhancedPrompt(
            basePrompt,
            enhancedContext,
            stableThreadId!,
            userProfile.name || 'friend'
          );

          // STEP 7: Call Oracle function
          console.log('🔮 ORACLE: Calling companion oracle function');
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
            console.error('❌ ORACLE ERROR: Oracle function failed', oracleError);
            throw new Error(`Oracle call failed: ${oracleError.message}`);
          }

          console.log('✅ ORACLE SUCCESS: Oracle response generated', {
            oracleStatus: oracleResponse.oracleStatus,
            semanticChunks: oracleResponse.semanticChunks,
            intelligenceLevel: oracleResponse.intelligenceLevel,
            responseLength: oracleResponse.response?.length || 0
          });
          
          // STEP 8: Process AI response through orchestrator
          if (oracleResponse?.response) {
            console.log('🔄 ORACLE: Processing AI response through orchestrator');
            await enhancedConversationOrchestrator.processAIResponse(
              oracleResponse.response,
              stableThreadId!,
              user.id,
              'companion'
            );
          }

          // STEP 9: Send through HACS conversation
          console.log('📤 ORACLE: Sending message through HACS conversation');
          await hacsConversation.sendOracleMessage(content, oracleResponse);
          
          // STEP 10: Store in legacy conversation memory for backward compatibility
          console.log('💾 ORACLE: Storing in conversation memory');
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
            
            console.log('✅ ORACLE: Complete 4-layer memory storage completed');
          } catch (storageError) {
            console.error('❌ ORACLE: Storage error (non-critical):', storageError);
          }
          
          // Background processing for future intelligence
          console.log('🔄 ORACLE: Starting background intelligence processing');
          BackgroundIntelligenceService.processInBackground(
            content,
            user.id,
            sessionId,
            agentMode
          ).catch(error => console.error('❌ ORACLE: Background processing error:', error));
          
        } catch (oracleError) {
          console.error('❌ ORACLE-FIRST ERROR: Oracle conversation failed, falling back to HACS', oracleError);
          handleOracleError(oracleError, { fallback: true });
          
          // Fallback: Use standard HACS conversation
          console.log('🔄 FALLBACK: Using standard HACS conversation');
          await hacsConversation.sendMessage(content);
        }
        // Note: Oracle loading will be set to false when streaming completes
        
      } else {
        // STANDARD FLOW: Dual-pathway for non-companion modes
        console.log('🟢 STANDARD FLOW: Starting dual-pathway for non-companion mode');
        
        try {
          // Get accumulated intelligence from previous processing
          console.log('🧠 STANDARD: Loading accumulated intelligence');
          const accumulatedIntelligence = await BackgroundIntelligenceService.getAccumulatedIntelligence(
            user.id,
            sessionId
          );
          
          console.log('🔄 STANDARD: Starting immediate response and background processing');
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

          // Send through standard HACS conversation
          console.log('📤 STANDARD: Sending message through HACS conversation');
          await hacsConversation.sendMessage(content);
          
        } catch (standardError) {
          console.error('❌ STANDARD FLOW ERROR: Dual-pathway failed, using basic HACS', standardError);
          // Fallback to basic HACS conversation
          await hacsConversation.sendMessage(content);
        }
      }
      
      console.log('🎉 SEND MESSAGE COMPLETE: All pathways processed successfully');
      
    } catch (error) {
      console.error('❌ SEND MESSAGE FATAL ERROR: Complete failure', error);
      
      // Mark any optimistic messages as failed
      hacsConversation.setMessages(prev => 
        prev.map(msg => 
          msg.status === 'sending' ? { ...msg, status: 'error' as const } : msg
        )
      );
      
      // Show user-friendly error
      const errorMessage = error instanceof Error ? error.message : 'Something went wrong sending your message';
      console.error('💥 USER ERROR:', errorMessage);
      
      // Force recovery from any stuck states
      handleOracleError(error, { fatal: true });
      
      // Rethrow to let UI handle the error display
      throw new Error(errorMessage);
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

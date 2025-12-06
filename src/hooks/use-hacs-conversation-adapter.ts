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
  addOptimisticMessage: (message: ConversationMessage) => void;
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
    // PRIORITY 1: If the page itself says it's for the companion, then it is
    // This allows components to override global mode settings
    if (pageContext === 'companion') {
      return true;
    }
    
    // PRIORITY 2: Direct companion mode setting from global context
    if (currentMode === 'companion') return true;
    
    // PRIORITY 3: Check if we're on index route with 'blend' agent type (default companion behavior)
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
    
    // Complete coordinated loading operations in sequence
    completeLoading('oracle');
    completeLoading('streaming');
    
    // Small delay to ensure all state updates complete before recovery check
    setTimeout(() => {
      const active = getActiveOperations();
      if (active.length > 0) {
        console.warn('🛠️ Recovery: Clearing lingering operations after streaming complete', { active });
        forceRecovery();
      }
    }, 500);
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

  // Add optimistic message callback
  const addOptimisticMessage = useCallback((message: ConversationMessage) => {
    hacsConversation.setMessages(prev => [...prev, message]);
  }, [hacsConversation.setMessages]);

  const appendOptimisticUserMessage = useCallback((messageContent: string) => {
    const clientMsgId = `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const optimisticMessage: ConversationMessage = {
      id: clientMsgId,
      role: 'user',
      content: messageContent.trim(),
      timestamp: new Date().toISOString(),
      client_msg_id: clientMsgId
    };

    addOptimisticMessage(optimisticMessage);
    return optimisticMessage;
  }, [addOptimisticMessage]);

  // PHASE 1: DUAL-PATHWAY ARCHITECTURE - Asynchronous Intelligence Model
  const sendMessage = useCallback(async (
    content: string,
    usePersonalization: boolean = true,
    context?: any,
    agentOverride?: string
  ) => {
    if (!content.trim()) return;

    let userMessageOptimisticallyAdded = false;
    let optimisticUserMessage: ConversationMessage | undefined;

    console.log('🚀 DUAL-PATHWAY: sendMessage called', {
      content: content.substring(0, 50),
      agentOverride,
      timestamp: new Date().toISOString()
    });

    // Set loading state coordination AFTER message validation
    const loadingTimeout = setTimeout(() => {
      const active = getActiveOperations();
      if (active.length > 0) {
        console.warn('⏱️ Loading timeout forcing recovery', { active });
        forceRecovery();
      }
    }, 8000);

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

      // ORACLE-FIRST FLOW: Prioritize Oracle response in companion mode
      if (isCompanionMode) {
        console.log('🔮 ORACLE-FIRST: Starting Oracle-prioritized conversation flow');
        
        // ✅ PHASE 1 FIX: Add user message IMMEDIATELY for instant UI feedback
        optimisticUserMessage = appendOptimisticUserMessage(content);
        userMessageOptimisticallyAdded = true;
        
        // ✅ PHASE 2 FIX: Show thinking animation IMMEDIATELY
        hacsConversation.setIsLoading(true);
        hacsConversation.setIsTyping(true);
        
        // Start coordinated Oracle operation with timeout cleanup
        const abortController = startOracleOperation();
        
        const cleanup = () => {
          clearTimeout(loadingTimeout);
          completeOracleOperation();
        };
        
        try {
          // PILLAR II: Load conversation context with intelligent selection
          const conversationContext = await conversationMemoryService.getConversationContext(stableThreadId!);
          
          let recentMessages = [];
          if (conversationContext?.messages) {
            // PHASE 3 UPGRADE: Use progressive context with multi-level summarization
            const intelligentMessages = await conversationMemoryService.getProgressiveIntelligentContext(
              stableThreadId!, 
              content, // Pass user query for semantic similarity
              4000 // Max tokens for Oracle context
            );
            
            recentMessages = intelligentMessages.map(msg => ({
              role: msg.role === 'assistant' ? 'assistant' : msg.role,
              content: msg.content,
              timestamp: msg.timestamp
            }));
          }

          // PILLAR II: Load user profile for Oracle context
          const { data: blueprint } = await supabase
            .from('user_blueprints')
            .select('blueprint')
            .eq('user_id', user.id)
            .eq('is_active', true)
            .maybeSingle();

          let userProfile = {};
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

          // Call the companion oracle function with enhanced context
          const { data: oracleResponse, error: oracleError } = await supabase.functions.invoke('companion-oracle-conversation', {
            body: {
              message: content,
              userId: user.id,
              sessionId,
              threadId: stableThreadId, // PHASE 2 FIX: Pass stable thread ID for Oracle context reconciliation
              useOracleMode: true,
              enableBackgroundIntelligence: true,
              conversationHistory: recentMessages,
              userProfile: userProfile
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
        
        // ✅ PHASE 3 FIX: Always skip user message addition - we already added it optimistically
        console.log('🔮 ADAPTER: Using optimistic user message, skipping duplicate addition');
        await hacsConversation.sendOracleMessage(content, oracleResponse, true);
          
          // PILLAR I & II: Store messages using enhanced ConversationMemoryService with semantic embeddings
          try {
            // PHASE 4: Check conversation state and detect closure signals
            const { conversationStateService } = await import('@/services/conversation-state-service');
            const conversationState = conversationStateService.detectConversationState(content);
            
            console.log('🎯 CONVERSATION STATE DETECTED:', conversationState);

            // Store conversation state in progressive memory
            await conversationStateService.storeConversationState(stableThreadId!, user.id, conversationState, content);

            // Store user message with progressive memory features
            await conversationMemoryService.storeMessageWithProgressiveMemory(stableThreadId!, {
              role: 'user',
              content: content,
              timestamp: new Date(),
              id: `user_${Date.now()}`
            }, user.id);
            
            // Store Oracle response with progressive memory features
            if (oracleResponse?.response) {
              await conversationMemoryService.storeMessageWithProgressiveMemory(stableThreadId!, {
                role: 'assistant',
                content: oracleResponse.response,
                timestamp: new Date(),
                id: `oracle_${Date.now()}`,
                agent_mode: 'companion'
              }, user.id);
            }
            
            console.log('✅ ADAPTER: Messages stored with semantic enhancement');
          } catch (error) {
            console.error('❌ ADAPTER: Enhanced storage error:', error);
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
          cleanup();
          handleOracleError(error, { fallback: true });
          
          // Fallback: Use standard HACS conversation
          await hacsConversation.sendMessage(content);
        } finally {
          // Ensure cleanup happens regardless of success/failure
          cleanup();
          // ✅ PHASE 4 FIX: Clear loading state (error recovery)
          hacsConversation.setIsTyping(false);
        }
        
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

        // Optimistically add the user message before skipping in HACS sendMessage
        optimisticUserMessage = appendOptimisticUserMessage(content);
        userMessageOptimisticallyAdded = true;

        // Standard HACS conversation for non-companion modes
        await hacsConversation.sendMessage(
          content,
          true,
          optimisticUserMessage
            ? [...hacsConversation.messages, optimisticUserMessage]
            : hacsConversation.messages
        ); // Skip user message - already added optimistically
      }

    } catch (error) {
      console.error('❌ DUAL-PATHWAY ERROR: One or both pathways failed', error);
      clearTimeout(loadingTimeout);
      handleOracleError(error, { dualPathway: true });

      // Ensure the user message is present for reconciliation when skipping
      if (!isCompanionMode && !userMessageOptimisticallyAdded) {
        optimisticUserMessage = appendOptimisticUserMessage(content);
      }
      // Fallback to original HACS conversation
      await hacsConversation.sendMessage(
        content,
        true,
        optimisticUserMessage ? [...hacsConversation.messages, optimisticUserMessage] : hacsConversation.messages
      ); // Skip user message - already added optimistically
    } finally {
      clearTimeout(loadingTimeout);
    }
  }, [appendOptimisticUserMessage, hacsConversation.messages, hacsConversation.sendMessage, hacsConversation.sendOracleMessage, initialAgent, isCompanionMode, startOracleOperation, handleOracleError]);

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

  // Message reconciliation - update optimistic messages with server data
  const reconcileOptimisticMessage = useCallback((clientMsgId: string, serverMessage: Partial<ConversationMessage>) => {
    hacsConversation.setMessages(prev =>
      prev.map(msg =>
        msg.client_msg_id === clientMsgId
          ? { ...msg, ...serverMessage, client_msg_id: clientMsgId } 
          : msg
      )
    );
  }, [hacsConversation.setMessages]);

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
    markMessageStreamingComplete: handleOracleStreamingComplete,
    addOptimisticMessage
  };
};

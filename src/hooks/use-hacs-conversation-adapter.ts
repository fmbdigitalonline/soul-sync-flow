import { useState, useCallback, useRef, useEffect } from 'react';
import { useHACSConversation, ConversationMessage } from './use-hacs-conversation';
import { useEnhancedAICoach } from './use-enhanced-ai-coach';
import { supabase } from '@/integrations/supabase/client';
import { ImmediateResponseService } from '../services/immediate-response-service';
import { BackgroundIntelligenceService } from '../services/background-intelligence-service';
import { hermeticConversationContextService, HermeticConversationContext } from '../services/hermetic-conversation-context';

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
  hermeticDepth: 'basic' | 'enhanced' | 'hermetic' | 'oracle';
}

export const useHACSConversationAdapter = (
  initialAgent: string = "guide",
  pageContext: string = "general"
): HACSConversationAdapter => {
  // CRITICAL FIX: Generate persistent session ID first
  const sessionIdRef = useRef<string | null>(null);
  
  const getOrCreateSessionId = useCallback(() => {
    if (!sessionIdRef.current) {
      sessionIdRef.current = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      console.log('🔑 SESSION: Created persistent session ID:', sessionIdRef.current);
    }
    return sessionIdRef.current;
  }, []);
  
  // Use HACS conversation with persistent session ID
  const hacsConversation = useHACSConversation(getOrCreateSessionId());
  
  // Keep enhanced AI coach for backwards compatibility but don't use its sendMessage
  const enhancedCoach = useEnhancedAICoach(initialAgent as any, pageContext);
  
  // HERMETIC CONTEXT STATE - Track conversation depth
  const [hermeticContext, setHermeticContext] = useState<HermeticConversationContext | null>(null);
  const [hermeticDepth, setHermeticDepth] = useState<'basic' | 'enhanced' | 'hermetic' | 'oracle'>('basic');
  
  // HERMETIC CONTEXT INITIALIZATION - Load context when adapter initializes
  useEffect(() => {
    const loadHermeticContext = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        console.log('🧠 HERMETIC ADAPTER: Loading context for user:', user.id.substring(0, 8));
        try {
          const context = await hermeticConversationContextService.buildConversationContext(user.id);
          setHermeticContext(context);
          setHermeticDepth(context.depth);
          console.log('✅ HERMETIC ADAPTER: Context loaded with depth:', context.depth);
        } catch (error) {
          console.error('❌ HERMETIC ADAPTER: Context loading failed:', error);
          setHermeticDepth('basic');
        }
      }
    };
    
    loadHermeticContext();
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
      
      // CRITICAL FIX: Use persistent session ID instead of regenerating
      const sessionId = getOrCreateSessionId();
      const agentMode = agentOverride || initialAgent;

      console.log('🔑 SESSION: Using persistent session ID:', sessionId);

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

      // HERMETIC-ENHANCED CONVERSATION ROUTING
      // Instead of basic sendMessage, we now inject Hermetic context into the conversation
      console.log('🧠 HERMETIC ROUTING: Sending message with context depth:', hermeticDepth);
      
      // Build enhanced message with Hermetic context
      const enhancedMessagePayload = {
        userMessage: content,
        hermeticContext: hermeticContext,
        useHermeticEnhancement: hermeticDepth !== 'basic',
        sessionId: sessionId,
        agentMode: agentMode
      };
      
  // Send through HACS conversation with enhanced payload
  await sendHermeticEnhancedMessage(enhancedMessagePayload);
  
  // CRITICAL FIX: Synchronize conversation ID after successful response
  console.log('🔄 CONVERSATION SYNC: Ensuring conversation ID persistence');
  
  // Force refresh of conversation ID to maintain persistence
  setTimeout(() => {
    if (hacsConversation.conversationId) {
      console.log('✅ CONVERSATION SYNC: ID synchronized:', hacsConversation.conversationId);
    }
  }, 100);
      
    } catch (error) {
      console.error('❌ DUAL-PATHWAY ERROR: One or both pathways failed', error);
      // Fallback to original HACS conversation without Hermetic enhancement
      await hacsConversation.sendMessage(content);
    }
  }, [hacsConversation.sendMessage, hacsConversation.conversationId, getOrCreateSessionId, initialAgent, hermeticContext, hermeticDepth]);

  // HERMETIC-ENHANCED MESSAGE SENDING - New method for context-aware conversations
  const sendHermeticEnhancedMessage = useCallback(async (payload: any) => {
    const { userMessage, hermeticContext, useHermeticEnhancement } = payload;
    
    if (useHermeticEnhancement && hermeticContext) {
      console.log('🔮 HERMETIC ENHANCEMENT: Sending enhanced conversation request');
      
      // Get user for edge function call
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      
      // Call enhanced conversation edge function with Hermetic context
      const { data, error } = await supabase.functions.invoke('hacs-intelligent-conversation', {
        body: {
          action: 'respond_to_user',
          userId: user.id,
          sessionId: payload.sessionId,
          conversationId: hacsConversation.conversationId, // CRITICAL FIX: Pass existing conversation ID
          userMessage: userMessage,
          messageHistory: hacsConversation.messages,
          useUnifiedBrain: true, // Enable unified brain for Hermetic processing
          hermeticContext: hermeticContext, // INJECT HERMETIC CONTEXT
          agentMode: payload.agentMode
        }
      });
      
      if (error) {
        console.error('❌ HERMETIC ENHANCEMENT FAILED:', error);
        throw error;
      }
      
      console.log('✅ HERMETIC ENHANCEMENT SUCCESS: Response enhanced with', hermeticContext.depth, 'depth');
      
    } else {
      // Fallback to standard HACS conversation
      console.log('📡 STANDARD ROUTING: Using basic HACS conversation');
      await hacsConversation.sendMessage(userMessage);
    }
  }, [hacsConversation.sendMessage, hacsConversation.conversationId, hacsConversation.messages, initialAgent]);

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
    userName: enhancedCoach.userName,
    hermeticDepth: hermeticDepth // EXPOSE HERMETIC DEPTH TO UI
  };
};

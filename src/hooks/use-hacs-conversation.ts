import { useState, useCallback, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useHacsIntelligence } from './use-hacs-intelligence';
import { useCoordinatedLoading } from '@/hooks/use-coordinated-loading';
import { createErrorHandler } from '@/utils/error-recovery';
import { conversationMemoryService } from '@/services/conversation-memory-service';

export interface ConversationMessage {
  id: string;
  role: 'user' | 'hacs';
  content: string;
  timestamp: string;
  module?: string;
  messageType?: string;
  questionId?: string;
  isQuestion?: boolean;
  oracleStatus?: string;
  semanticChunks?: number;
  personalityContext?: any;
  intelligence_bonus?: number;
  mode?: string;
  isStreaming?: boolean;
}

export interface HACSQuestion {
  id: string;
  text: string;
  module: string;
  type: 'foundational' | 'validation' | 'philosophical';
}

export const useHACSConversation = () => {
  const { user } = useAuth();
  const { recordConversationInteraction, refreshIntelligence } = useHacsIntelligence();
  
  // Coordinated loading for streaming operations
  const { startLoading, completeLoading } = useCoordinatedLoading();
  
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isStreamingResponse, setIsStreamingResponse] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<HACSQuestion | null>(null);
  const [currentSessionId, setCurrentSessionId] = useState<string>('');
  const streamingAbortRef = useRef<AbortController | null>(null);

  // Helper function to determine conversation quality
  const determineResponseQuality = useCallback((hacsResponse: string, userMessage: string): 'excellent' | 'good' | 'average' | 'poor' => {
    const messageLength = userMessage.length;
    const hasQuestions = userMessage.includes('?');
    const isEngaged = messageLength > 50 && (hasQuestions || userMessage.split(' ').length > 10);
    const isDeepResponse = hacsResponse.length > 100;
    
    if (isEngaged && isDeepResponse) return 'excellent';
    if (isEngaged || isDeepResponse) return 'good';
    if (messageLength > 20) return 'average';
    return 'poor';
  }, []);

  const loadConversationHistory = useCallback(async () => {
    if (!user) return;

    try {
      // Generate predictable session ID for companion conversations
      const sessionId = currentSessionId || `companion_${user.id}`;
      if (!currentSessionId) {
        setCurrentSessionId(sessionId);
      }

      console.log('🔮 LOADING COMPANION HISTORY: Searching for session', sessionId);
      
      // First try to load from conversation_memory (primary for companion mode)
      const { data: companionMemory, error: memoryError } = await supabase
        .from('conversation_memory')
        .select('*')
        .eq('user_id', user.id)
        .eq('session_id', sessionId)
        .eq('mode', 'companion')
        .maybeSingle();

      if (memoryError) {
        console.error('❌ CONVERSATION MEMORY ERROR:', {
          code: memoryError.code,
          message: memoryError.message,
          details: memoryError.details,
          hint: memoryError.hint,
          sessionId: sessionId
        });
        // Continue to fallback instead of stopping
      }

      if (companionMemory?.messages && !memoryError) {
        // Found companion conversation in memory table
        const conversationData = Array.isArray(companionMemory.messages) 
          ? (companionMemory.messages as unknown as ConversationMessage[])
          : [];
        setMessages(conversationData);
        
        // Keep conversationId null - will create new record with session_id
        setConversationId(null);
        
        console.log('✅ LOADED COMPANION HISTORY: From conversation_memory', {
          sessionId: companionMemory.session_id,
          messageCount: conversationData.length
        });
        return;
      }

      // Fallback: Check hacs_conversations for existing conversations
      console.log('🔄 FALLBACK: Checking hacs_conversations table');
      const { data: conversation, error: conversationError } = await supabase
        .from('hacs_conversations')
        .select('*')
        .eq('user_id', user.id)
        .eq('session_id', sessionId)
        .maybeSingle();

      if (conversationError) {
        console.error('❌ HACS CONVERSATION ERROR:', {
          code: conversationError.code,
          message: conversationError.message,
          details: conversationError.details,
          hint: conversationError.hint,
          sessionId: sessionId
        });
        // Continue to fresh session instead of failing
      }

      if (conversation && !conversationError) {
        setConversationId(conversation.id);
        const conversationData = conversation.conversation_data;
        if (Array.isArray(conversationData)) {
          setMessages(conversationData as unknown as ConversationMessage[]);
          console.log('✅ LOADED COMPANION HISTORY: From hacs_conversations fallback', {
            conversationId: conversation.id,
            messageCount: conversationData.length
          });
        }
      } else {
        console.log('🔮 FRESH SESSION: No existing conversation found, starting new companion session');
        // Ensure clean slate
        setMessages([]);
        setConversationId(null);
      }
    } catch (error) {
      console.error('❌ CRITICAL ERROR IN CONVERSATION LOADING:', error);
      // Ensure we don't get stuck - provide clean slate
      setMessages([]);
      setConversationId(null);
    }
  }, [user, currentSessionId]);

  // Load conversation history on mount with timeout protection
  useEffect(() => {
    if (user) {
      console.log('🔄 INITIALIZING CONVERSATION LOADING');
      
      // Set a timeout to prevent stuck loading states
      const loadingTimeout = setTimeout(() => {
        console.warn('⚠️ CONVERSATION LOADING TIMEOUT: Forcing ready state');
        setIsLoading(false);
        setIsTyping(false);
        setMessages([]);
      }, 10000); // 10 second timeout

      loadConversationHistory()
        .finally(() => {
          clearTimeout(loadingTimeout);
          console.log('✅ CONVERSATION LOADING COMPLETE');
        });

      return () => clearTimeout(loadingTimeout);
    }
  }, [user, loadConversationHistory]);

  const saveConversation = useCallback(async (conversationData: ConversationMessage[]) => {
    if (!user || !conversationData.length) return;

    try {
      const sessionId = currentSessionId || `companion_${user.id}`;
      
      // PILLAR III: Unified conversation storage - save to conversation_memory for Oracle consistency
      const conversationMemoryPayload = {
        user_id: user.id,
        session_id: sessionId,
        messages: conversationData as any,
        mode: 'companion',
        conversation_stage: 'active',
        last_activity: new Date().toISOString(),
        recovery_context: {
          lastOracleStatus: conversationData[conversationData.length - 1]?.oracleStatus,
          messageCount: conversationData.length
        }
      };

      // Upsert to conversation_memory (primary storage for Oracle conversations)
      const { error: memoryError } = await supabase
        .from('conversation_memory')
        .upsert(conversationMemoryPayload, {
          onConflict: 'session_id,user_id'
        });

      if (memoryError) {
        console.error('❌ ERROR SAVING TO CONVERSATION_MEMORY:', memoryError);
        throw memoryError;
      }

      // PILLAR I: Preserve existing hacs_conversations for backward compatibility
      const hacsPayload = {
        user_id: user.id,
        session_id: sessionId,
        conversation_data: conversationData as any,
        intelligence_level_start: 50,
        intelligence_level_end: null
      };

      if (conversationId) {
        // Update existing HACS conversation
        await supabase
          .from('hacs_conversations')
          .update({
            conversation_data: conversationData as any,
            last_activity: new Date().toISOString()
          })
          .eq('id', conversationId);
      } else {
        // Create new HACS conversation
        const { data, error } = await supabase
          .from('hacs_conversations')
          .insert(hacsPayload)
          .select('id')
          .single();

        if (error) throw error;
        setConversationId(data.id);
      }

      console.log('✅ CONVERSATION SAVED: Unified storage complete', {
        sessionId: sessionId,
        messageCount: conversationData.length,
        conversationId: conversationId
      });

    } catch (error) {
      console.error('❌ ERROR SAVING CONVERSATION:', error);
    }
  }, [user, conversationId]);

  const updateHACSIntelligence = useCallback(async (
    intelligenceBonus: number,
    userMessage: string,
    response: string
  ) => {
    if (!user || intelligenceBonus <= 0) return;

    try {
      await recordConversationInteraction(userMessage, determineResponseQuality(response, userMessage));
      await refreshIntelligence();
    } catch (error) {
      console.error('Error updating HACS intelligence:', error);
    }
  }, [user, recordConversationInteraction, refreshIntelligence, determineResponseQuality]);

  const sendMessage = useCallback(async (content: string) => {
    if (!user || !content.trim()) return;

    setIsLoading(true);
    setIsTyping(true);

    try {
      // Add user message immediately
      const userMessage: ConversationMessage = {
        id: `user_${Date.now()}`,
        role: 'user',
        content: content.trim(),
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, userMessage]);

      // Send to HACS intelligent conversation
      const { data, error } = await supabase.functions.invoke('hacs-intelligent-conversation', {
        body: {
          action: 'respond_to_user',
          userId: user.id,
          sessionId: currentSessionId || `companion_${user.id}`,
          conversationId,
          userMessage: content.trim(),
          messageHistory: [...messages, userMessage]
        }
      });

      if (error) throw error;

      // Add HACS response
      const hacsMessage: ConversationMessage = {
        id: `hacs_${Date.now()}`,
        role: 'hacs',
        content: data.response || 'I understand. How can I help you further?',
        timestamp: new Date().toISOString(),
        module: data.module,
        mode: data.mode,
        intelligence_bonus: data.intelligence_bonus
      };

      setMessages(prev => [...prev, hacsMessage]);

      // Save conversation to database
      await saveConversation([...messages, userMessage, hacsMessage]);

      // Update HACS intelligence if provided
      if (data.intelligence_bonus && data.intelligence_bonus > 0) {
        await updateHACSIntelligence(data.intelligence_bonus, content, data.response);
      }

      // Generate follow-up question if provided
      if (data.question) {
        setCurrentQuestion({
          id: `question_${Date.now()}`,
          text: data.question,
          module: data.module || 'hacs',
          type: 'foundational'
        });
      }

    } catch (error) {
      console.error('Error in HACS conversation:', error);
      const errorMessage: ConversationMessage = {
        id: `error_${Date.now()}`,
        role: 'hacs',
        content: 'I apologize, but I encountered an issue. Please try again.',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  }, [user, messages, conversationId, saveConversation, updateHACSIntelligence]);

  // Enhanced Oracle message with conversation context
  const sendOracleMessage = useCallback(async (content: string, oracleResponse?: any) => {
    if (!user || !content.trim()) return;

    setIsLoading(true);
    setIsTyping(true);

    try {
      // Add user message immediately
      const userMessage: ConversationMessage = {
        id: `user_${Date.now()}`,
        role: 'user',
        content: content.trim(),
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, userMessage]);

      // If oracle response provided, use it; otherwise call Oracle with conversation context
      let response = oracleResponse;
      if (!response) {
        // PILLAR II: Load real conversation history from conversation_memory table
        console.log('🔮 ORACLE MEMORY: Loading conversation history from conversation_memory table');
        
        const { data: conversationMemory, error: memoryError } = await supabase
          .from('conversation_memory')
          .select('messages')
          .eq('session_id', currentSessionId || `companion_${user.id}`)
          .eq('mode', 'companion')
          .maybeSingle();

        let recentMessages = [];
        
        if (conversationMemory?.messages && !memoryError) {
          // PILLAR I & II: Use ConversationMemoryService for intelligent context
          const conversationContext = await conversationMemoryService.getConversationContext(currentSessionId || `companion_${user.id}`);
          
          if (conversationContext?.messages) {
            // Use intelligent context selection instead of crude slice(-10)
            const intelligentMessages = conversationMemoryService.getIntelligentContext(
              conversationContext.messages,
              3000 // Oracle context token limit
            );
            
            recentMessages = intelligentMessages.map(msg => ({
              role: msg.role === 'assistant' ? 'assistant' : msg.role,
              content: msg.content,
              timestamp: msg.timestamp
            }));
            
            console.log('✅ ORACLE MEMORY: Intelligent context loaded', {
              totalMessages: conversationContext.messages.length,
              selectedCount: recentMessages.length,
              intelligentSelection: true
            });
          } else {
            // PILLAR II: Use validated in-memory messages as fallback
            const validatedMessages = messages
              .filter(msg => msg.content?.trim()) // Remove empty messages
              .slice(-5) // Smaller fallback for performance
              .map(msg => ({
                role: msg.role === 'hacs' ? 'assistant' : msg.role,
                content: msg.content,
                timestamp: msg.timestamp
              }));
            
            recentMessages = validatedMessages;
          }
          console.log('⚠️ ORACLE MEMORY: Using validated fallback in-memory history', {
            messageCount: recentMessages.length,
            intelligentSelection: false
          });
        } else {
          console.log('🔍 ORACLE MEMORY: No conversation memory found, using empty context');
          recentMessages = [];
        }

        // PILLAR II: Get real user profile for Oracle context
        const { data: blueprint, error: blueprintError } = await supabase
          .from('user_blueprints')
          .select('blueprint')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .maybeSingle();

        if (blueprintError) {
          console.error('❌ Error loading user blueprint:', blueprintError);
        }

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

        console.log('🔮 ORACLE CONTEXT: Sending enhanced context', {
          messageCount: recentMessages.length,
          userProfile: userProfile,
          currentMessage: content.trim()
        });

        response = await supabase.functions.invoke('companion-oracle-conversation', {
          body: {
            message: content.trim(),
            userId: user.id,
            sessionId: currentSessionId || `companion_${user.id}`,
            useOracleMode: true,
            enableBackgroundIntelligence: true,
            conversationHistory: recentMessages,
            userProfile: userProfile
          }
        });

        if (response.error) {
          throw new Error(`Oracle Error: ${response.error.message}`);
        }
        response = response.data;
      }

      // Add oracle response with enhanced metadata - mark as streaming
      const oracleMessage: ConversationMessage = {
        id: `oracle_${Date.now()}`,
        role: 'hacs',
        module: 'COMPANION_ORACLE',
        content: response.response || 'The cosmic channels are temporarily disrupted.',
        timestamp: new Date().toISOString(),
        oracleStatus: response.oracleStatus,
        semanticChunks: response.semanticChunks,
        personalityContext: response.personalityContext,
        isStreaming: true
      };

      setMessages(prev => [...prev, oracleMessage]);
      
      // PILLAR II: Transition from thinking to streaming state with coordinated loading
      setIsLoading(false);
      setIsStreamingResponse(true);
      streamingAbortRef.current = startLoading('streaming');

      // Save conversation to database with oracle metadata
      await saveConversation([...messages, userMessage, oracleMessage]);

      console.log('✅ ORACLE MESSAGE: Stored in conversation system', {
        sessionId: currentSessionId || `companion_${user.id}`,
        messageCount: [...messages, userMessage, oracleMessage].length,
        oracleStatus: response.oracleStatus,
        semanticChunks: response.semanticChunks,
        messageId: oracleMessage.id
      });

    } catch (error) {
      console.error('❌ ORACLE MESSAGE ERROR:', error);
      const errorMessage: ConversationMessage = {
        id: `error_${Date.now()}`,
        role: 'hacs',
        content: 'The oracle channels are disrupted. Please try reaching out again.',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setIsTyping(false);
      // Note: isStreamingResponse will be cleared by markMessageStreamingComplete
    }
  }, [user, messages, conversationId, saveConversation]);

  const generateQuestion = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('hacs-intelligent-conversation', {
        body: {
          action: 'generate_question',
          userId: user.id,
          sessionId: currentSessionId || `companion_${user.id}`,
          conversationId,
          messageHistory: messages
        }
      });

      if (error) throw error;

      if (data.generatedQuestion) {
        setCurrentQuestion(data.generatedQuestion);
        setConversationId(data.conversationId);

        // Add question as a message
        const questionMessage: ConversationMessage = {
          id: `question_${Date.now()}`,
          role: 'hacs',
          content: data.generatedQuestion.text,
          timestamp: new Date().toISOString(),
          module: data.generatedQuestion.module,
          questionId: data.generatedQuestion.id,
          isQuestion: true
        };

        setMessages(prev => [...prev, questionMessage]);
      }
    } catch (error) {
      console.error('Error generating question:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user, messages, conversationId]);

  const provideFeedback = useCallback(async (
    feedbackType: 'helpful' | 'not_helpful' | 'rating',
    feedbackValue: any,
    messageId?: string,
    questionId?: string
  ) => {
    if (!user || !conversationId) return;

    try {
      await supabase.from('hacs_learning_feedback').insert({
        user_id: user.id,
        conversation_id: conversationId,
        question_id: questionId,
        message_id: messageId,
        feedback_type: feedbackType,
        feedback_value: { value: feedbackValue },
        module_affected: currentQuestion?.module
      });

      console.log('Feedback recorded:', { feedbackType, feedbackValue });
    } catch (error) {
      console.error('Error recording feedback:', error);
    }
  }, [user, conversationId, currentQuestion]);

  // NEW: Send immediate message with temporary content (for Oracle channeling)
  const sendImmediateMessage = useCallback(async (userContent: string, temporaryResponse: string) => {
    if (!user || !userContent.trim()) return;

    setIsLoading(true);
    setIsTyping(true);

    // Add user message immediately
    const userMessage: ConversationMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: userContent.trim(),
      timestamp: new Date().toISOString()
    };

    // Add temporary response message
    const tempMessage: ConversationMessage = {
      id: `temp_${Date.now()}`,
      role: 'hacs',
      content: temporaryResponse,
      timestamp: new Date().toISOString(),
      module: 'ORACLE_CHANNELING'
    };

    setMessages(prev => [...prev, userMessage, tempMessage]);
  }, [user]);

  // NEW: Replace the last message content (for Oracle response replacement)
  const replaceLastMessage = useCallback(async (newContent: string) => {
    setMessages(prev => {
      if (prev.length === 0) return prev;
      
      const lastMessage = prev[prev.length - 1];
      const updatedMessage = {
        ...lastMessage,
        content: newContent,
        module: 'COMPANION_ORACLE',
        timestamp: new Date().toISOString()
      };
      
      const newMessages = [...prev.slice(0, -1), updatedMessage];
      
      // Save conversation with Oracle response
      saveConversation(newMessages);
      
      return newMessages;
    });

    setIsLoading(false);
    setIsTyping(false);
  }, [saveConversation]);

  // NEW: Mark a message as finished streaming
  const markMessageStreamingComplete = useCallback((messageId: string) => {
    console.log('🎯 STREAMING COMPLETE:', messageId);
    setMessages(prev => 
      prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, isStreaming: false } 
          : msg
      )
    );
    // Clear streaming/loading state when TypewriterText completes
    setIsStreamingResponse(false);
    setIsTyping(false);
    setIsLoading(false);
    completeLoading('streaming');
    completeLoading('oracle');

    // Safety: ensure no lingering streaming state after 1.2s
    setTimeout(() => {
      console.log('🧹 STREAMING SAFETY CHECK (post-complete)');
      setIsStreamingResponse(false);
      completeLoading('streaming');
      completeLoading('oracle');
    }, 1200);
  }, [completeLoading]);

  // Coordinated streaming error handler
  const handleStreamingError = createErrorHandler('streaming', () => {
    setIsStreamingResponse(false);
    completeLoading('streaming');
    if (streamingAbortRef.current) {
      streamingAbortRef.current = null;
    }
  });

  const clearConversation = useCallback(() => {
    setMessages([]);
    setConversationId(null);
    setCurrentQuestion(null);
  }, []);

  return {
    messages,
    isLoading,
    isTyping,
    isStreamingResponse,
    conversationId,
    currentQuestion,
    sendMessage,
    sendOracleMessage,
    sendImmediateMessage,
    replaceLastMessage,
    generateQuestion,
    provideFeedback,
    clearConversation,
    markMessageStreamingComplete
  };
};
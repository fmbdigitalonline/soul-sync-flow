import { useState, useCallback, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useHacsIntelligence } from './use-hacs-intelligence';

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
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<HACSQuestion | null>(null);
  const sessionIdRef = useRef(`session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);

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

  // Load conversation history on mount
  useEffect(() => {
    if (user) {
      loadConversationHistory();
    }
  }, [user]);

  const loadConversationHistory = useCallback(async () => {
    if (!user) return;

    try {
      // Get the most recent conversation
      const { data: conversation } = await supabase
        .from('hacs_conversations')
        .select('*')
        .eq('user_id', user.id)
        .order('last_activity', { ascending: false })
        .limit(1)
        .single();

      if (conversation) {
        setConversationId(conversation.id);
        const conversationData = conversation.conversation_data;
        if (Array.isArray(conversationData)) {
          setMessages(conversationData as unknown as ConversationMessage[]);
        }
      }
    } catch (error) {
      console.log('No previous conversation found, starting fresh');
    }
  }, [user]);

  const saveConversation = useCallback(async (conversationData: ConversationMessage[]) => {
    if (!user || !conversationData.length) return;

    try {
      const conversationPayload = {
        user_id: user.id,
        session_id: sessionIdRef.current,
        conversation_data: conversationData as any,
        intelligence_level_start: 50,
        intelligence_level_end: null
      };

      if (conversationId) {
        // Update existing conversation
        await supabase
          .from('hacs_conversations')
          .update({
            conversation_data: conversationData as any,
            last_activity: new Date().toISOString()
          })
          .eq('id', conversationId);
      } else {
        // Create new conversation
        const { data, error } = await supabase
          .from('hacs_conversations')
          .insert(conversationPayload)
          .select('id')
          .single();

        if (error) throw error;
        setConversationId(data.id);
      }
    } catch (error) {
      console.error('Error saving conversation:', error);
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
          sessionId: sessionIdRef.current,
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
        // Get recent conversation history for context (last 10 messages)
        const recentMessages = messages.slice(-10).map(msg => ({
          role: msg.role,
          content: msg.content,
          timestamp: msg.timestamp
        }));

        console.log('🔮 ORACLE CONTEXT: Sending conversation history', {
          messageCount: recentMessages.length,
          currentMessage: content.trim()
        });

        response = await supabase.functions.invoke('companion-oracle-conversation', {
          body: {
            message: content.trim(),
            userId: user.id,
            sessionId: conversationId,
            useOracleMode: true,
            enableBackgroundIntelligence: true,
            conversationHistory: recentMessages
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

      // Save conversation to database with oracle metadata
      await saveConversation([...messages, userMessage, oracleMessage]);

      console.log('✅ ORACLE MESSAGE: Stored in conversation system', {
        oracleStatus: oracleResponse.oracleStatus,
        semanticChunks: oracleResponse.semanticChunks,
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
          sessionId: sessionIdRef.current,
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
    setMessages(prev => 
      prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, isStreaming: false }
          : msg
      )
    );
  }, []);

  const clearConversation = useCallback(() => {
    setMessages([]);
    setConversationId(null);
    setCurrentQuestion(null);
  }, []);

  return {
    messages,
    isLoading,
    isTyping,
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
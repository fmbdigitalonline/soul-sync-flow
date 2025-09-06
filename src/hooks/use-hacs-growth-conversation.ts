import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface GrowthConversationMessage {
  id: string;
  role: 'user' | 'hacs';
  content: string;
  timestamp: string;
  module?: string;
  messageType?: string;
  questionId?: string;
  isQuestion?: boolean;
}

interface GrowthHACSQuestion {
  id: string;
  text: string;
  module: string;
  type: 'foundational' | 'validation' | 'philosophical';
}

export type { GrowthConversationMessage, GrowthHACSQuestion };

export const useHACSGrowthConversation = () => {
  const [messages, setMessages] = useState<GrowthConversationMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isStreamingResponse, setIsStreamingResponse] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<GrowthHACSQuestion | null>(null);

  // ENHANCED LOGGING: Hook initialization
  console.log('🟢 HOOK INIT: useHACSGrowthConversation hook initialized', {
    timestamp: new Date().toISOString(),
    initialStates: {
      messagesLength: messages.length,
      isLoading,
      isTyping,
      conversationId,
      currentQuestion
    }
  });

  useEffect(() => {
    console.log('🔄 HOOK EFFECT: Loading conversation history on mount');
    loadConversationHistory();
  }, []);

  const loadConversationHistory = async () => {
    console.log('📚 LOAD HISTORY: Starting conversation history load');
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('⚠️ LOAD SKIPPED: User not authenticated for conversation history');
        return;
      }

      console.log('👤 USER CONTEXT: Loading history for user', {
        userId: user.id.substring(0, 8),
        timestamp: new Date().toISOString()
      });

      const { data: conversation, error } = await supabase
        .from('hacs_growth_conversations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('❌ LOAD ERROR: Database query failed', {
          error: error.message,
          code: error.code,
          timestamp: new Date().toISOString()
        });
        return;
      }

      if (conversation) {
        console.log('📖 CONVERSATION FOUND: Loading existing conversation', {
          conversationId: conversation.id.substring(0, 8),
          messagesCount: (conversation.conversation_data as any)?.length || 0,
          createdAt: conversation.created_at
        });

        setMessages((conversation.conversation_data as any) || []);
        setConversationId(conversation.id);
      } else {
        console.log('🆕 NEW CONVERSATION: No existing conversation found, starting fresh');
        
        const sessionId = `growth-session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        setConversationId(sessionId);
        
        console.log('🆔 SESSION ID: Generated new session ID', {
          sessionId: sessionId.substring(0, 20) + '...',
          timestamp: new Date().toISOString()
        });
      }

    } catch (error) {
      console.error('❌ LOAD ERROR: Critical error in loadConversationHistory', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString()
      });
    }
  };

  const sendMessage = useCallback(async (content: string) => {
    console.log('💬 SEND MESSAGE: Processing user message', {
      messageLength: content.length,
      isCurrentlyLoading: isLoading,
      hasContent: !!content.trim(),
      timestamp: new Date().toISOString()
    });
    
    if (isLoading || !content.trim()) {
      console.log('⛔ SEND BLOCKED: Message send blocked', {
        reason: isLoading ? 'already_loading' : 'empty_content',
        isLoading,
        contentTrimmed: content.trim(),
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Set loading immediately
    console.log('🔄 STATE UPDATE: Setting isLoading to TRUE');
    setIsLoading(true);

    const userMessage: GrowthConversationMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: content.trim(),
      timestamp: new Date().toISOString(),
    };

    console.log('📨 MESSAGE CREATE: User message created', {
      messageId: userMessage.id,
      contentLength: userMessage.content.length,
      timestamp: userMessage.timestamp
    });

    setMessages(prev => {
      console.log('📝 MESSAGES UPDATE: Adding user message to conversation', {
        previousCount: prev.length,
        newCount: prev.length + 1,
        messageId: userMessage.id
      });
      return [...prev, userMessage];
    });
    
    setIsTyping(true);

    try {
      console.log('🧠 GROWTH COACH: Starting conversation through growth coach pipeline');
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Create assistant message for response
      const assistantMessage: GrowthConversationMessage = {
        id: `ai-${Date.now()}`,
        role: 'hacs',
        content: '',
        timestamp: new Date().toISOString(),
        module: 'spiritual-growth'
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Call the growth conversation edge function
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('No authentication session');
      }

      const supabaseUrl = 'https://qxaajirrqrcnmvtowjbg.supabase.co';
      const response = await fetch(`${supabaseUrl}/functions/v1/hacs-growth-conversation`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: content.trim(),
          userId: user.id,
          sessionId: conversationId || `session-${Date.now()}`,
          conversationHistory: messages.slice(-6) // Only send last 6 messages for performance
        }),
      });

      if (!response.ok) {
        throw new Error(`Growth coach response failed: ${response.status}`);
      }

      // Parse JSON response from edge function
      console.log('📄 JSON RESPONSE: Processing direct JSON response');
      const jsonData = await response.json();
      console.log('📋 JSON DATA:', {
        hasResponse: !!jsonData.response,
        responseLength: jsonData.response?.length || 0,
        module: jsonData.module,
        mode: jsonData.mode
      });

      if (jsonData.response) {
        const fullContent = jsonData.response;
        
        // Update message with full content
        setMessages(prev => prev.map(msg => 
          msg.id === assistantMessage.id 
            ? { ...msg, content: fullContent }
            : msg
        ));

        console.log('💾 SAVING: Starting conversation save and interaction recording');
        
        // Save conversation and record interaction
        if (user?.id) {
          await saveConversation([...messages, userMessage, { ...assistantMessage, content: fullContent }], user.id);
          await recordConversationInteraction(user.id, content, fullContent);
          
          console.log('✅ SAVE COMPLETE: Conversation saved successfully');
        }

        // Handle growth question if present
        if (jsonData.question) {
          setCurrentQuestion(jsonData.question);
          console.log('❓ QUESTION GENERATED: Growth question set', {
            questionId: jsonData.question.id,
            questionText: jsonData.question.text?.substring(0, 50)
          });
        }
      }

      // Check if HACS wants to ask a question
      const shouldAskQuestion = Math.random() < 0.3 && messages.length > 4;
      if (shouldAskQuestion && !currentQuestion) {
        setTimeout(() => {
          generateQuestion().catch(console.error);
        }, 2000);
      }

    } catch (error) {
      console.error('❌ Growth Coach error:', error);
      
      // Fallback error message
      const errorMessage: GrowthConversationMessage = {
        id: `error-${Date.now()}`,
        role: 'hacs',
        content: 'I\'m having trouble connecting right now. Could you try sharing that again?',
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => prev.map(msg => 
        msg.id.startsWith('ai-') && msg.content === '' ? errorMessage : msg
      ));
    } finally {
      console.log('🏁 SEND COMPLETE: Message send process completed');
      console.log('🔄 STATE UPDATE: Setting isLoading to FALSE');
      setIsLoading(false);
      console.log('🔄 STATE UPDATE: Setting isTyping to FALSE');
      setIsTyping(false);
    }
  }, [isLoading, messages, conversationId, currentQuestion]);

  const saveConversation = async (messages: GrowthConversationMessage[], userId: string) => {
    console.log('💾 SAVE START: Beginning conversation save process', {
      messagesCount: messages.length,
      userId,
      conversationId,
      timestamp: new Date().toISOString()
    });
    
    try {
      if (conversationId) {
        console.log('🔄 UPDATE MODE: Updating existing conversation', {
          conversationId,
          messagesCount: messages.length
        });

        const { error } = await supabase
          .from('hacs_growth_conversations')
          .update({
            conversation_data: messages as any,
            updated_at: new Date().toISOString(),
          })
          .eq('id', conversationId);

        if (error) {
          console.error('❌ UPDATE ERROR: Failed to update conversation', {
            error: error.message,
            conversationId
          });
        } else {
          console.log('✅ UPDATE SUCCESS: Conversation updated successfully', {
            conversationId,
            messagesCount: messages.length
          });
        }
      } else {
        console.log('🆕 CREATE MODE: Creating new conversation record');

        const newConversationId = `growth-conv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        const { error } = await supabase
          .from('hacs_growth_conversations')
          .insert({
            user_id: userId,
            session_id: conversationId || newConversationId,
            conversation_data: messages as any,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });

        if (error) {
          console.error('❌ CREATE ERROR: Failed to create conversation', {
            error: error.message,
            userId: userId.substring(0, 8)
          });
        } else {
          console.log('✅ CREATE SUCCESS: New conversation created', {
            conversationId: newConversationId.substring(0, 20) + '...',
            messagesCount: messages.length
          });
          setConversationId(newConversationId);
        }
      }
    } catch (error) {
      console.error('❌ SAVE ERROR: Critical error in saveConversation', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString()
      });
    }
  };

  const recordConversationInteraction = async (userId: string, userMessage: string, hacsResponse: string) => {
    console.log('📊 INTERACTION: Recording conversation interaction', {
      userId: userId.substring(0, 8),
      userMessageLength: userMessage.length,
      hacsResponseLength: hacsResponse.length,
      timestamp: new Date().toISOString()
    });

    try {
      const quality = determineResponseQuality(hacsResponse, userMessage);
      await updateIntelligenceBasedOnQuality(userId, quality);
      
      console.log('✅ INTERACTION SUCCESS: Interaction recorded and intelligence updated', {
        quality,
        userId: userId.substring(0, 8)
      });
    } catch (error) {
      console.error('❌ INTERACTION ERROR: Failed to record interaction', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: userId.substring(0, 8)
      });
    }
  };

  const refreshIntelligence = async () => {
    console.log('🔄 REFRESH: Refreshing growth intelligence data');
    // Placeholder for refreshing intelligence data
  };

  const generateQuestion = async (): Promise<void> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: intelligence } = await supabase
        .from('hacs_growth_intelligence')
        .select('intelligence_level')
        .eq('user_id', user.id)
        .single();

      const intelligenceLevel = intelligence?.intelligence_level || 50;
      const questionText = generateGrowthQuestion(intelligenceLevel);

      const newQuestion: GrowthHACSQuestion = {
        id: `q-${Date.now()}`,
        text: questionText,
        module: 'spiritual',
        type: 'philosophical'
      };

      setCurrentQuestion(newQuestion);

      await supabase
        .from('hacs_growth_questions')
        .insert({
          user_id: user.id,
          question_text: newQuestion.text,
          hacs_module: newQuestion.module,
          question_type: newQuestion.type,
          intelligence_level_when_asked: intelligenceLevel,
          created_at: new Date().toISOString(),
        });

    } catch (error) {
      console.error('Error generating growth question:', error);
    }
  };

  const provideFeedback = async (
    questionId: string,
    feedbackType: 'helpful' | 'not_helpful' | 'insightful' | 'confusing',
    feedbackValue: number,
    messageId?: string
  ) => {
    console.log('📝 FEEDBACK: Providing user feedback', {
      questionId,
      feedbackType,
      feedbackValue,
      messageId,
      timestamp: new Date().toISOString()
    });

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from('hacs_learning_feedback')
        .insert({
          user_id: user.id,
          conversation_id: conversationId,
          question_id: questionId,
          feedback_type: feedbackType,
          feedback_value: feedbackValue,
          message_id: messageId,
          module_affected: 'spiritual'
        });

    } catch (error) {
      console.error('Error providing growth feedback:', error);
    }
  };

  const clearConversation = () => {
    setMessages([]);
    setCurrentQuestion(null);
    setConversationId(null);
  };

  const generateGrowthQuestion = (intelligenceLevel: number): string => {
    const questions = [
      "What brings you the deepest sense of purpose in life?",
      "How do you connect with your inner wisdom?",
      "What spiritual practices resonate most with you?",
      "How has your understanding of yourself evolved recently?",
      "What patterns in your life are you ready to transform?",
      "How do you cultivate compassion for yourself and others?"
    ];
    return questions[Math.floor(Math.random() * questions.length)];
  };

  const determineResponseQuality = (hacsResponse: string, userMessage: string): 'excellent' | 'good' | 'average' | 'poor' => {
    if (hacsResponse.length > 100 && (hacsResponse.includes('spiritual') || hacsResponse.includes('growth'))) {
      return 'excellent';
    } else if (hacsResponse.length > 50) {
      return 'good';
    } else if (hacsResponse.length > 20) {
      return 'average';
    }
    return 'poor';
  };

  const updateIntelligenceBasedOnQuality = async (userId: string, quality: string) => {
    const bonusMap = { excellent: 5, good: 3, average: 1, poor: 0 };
    const bonus = bonusMap[quality as keyof typeof bonusMap] || 0;

    try {
      const { data: intelligence } = await supabase
        .from('hacs_growth_intelligence')
        .select('intelligence_level')
        .eq('user_id', userId)
        .single();

      const currentLevel = intelligence?.intelligence_level || 50;
      const newLevel = Math.min(100, currentLevel + bonus);

      await supabase
        .from('hacs_growth_intelligence')
        .update({ intelligence_level: newLevel })
        .eq('user_id', userId);

    } catch (error) {
      console.error('Error updating growth intelligence:', error);
    }
  };

  // Handle streaming completion
  const onStreamingComplete = (messageId: string) => {
    console.log('🎯 Spiritual growth streaming complete:', messageId);
    setIsStreamingResponse(false);
  };

  // Handle stopping streaming
  const onStopStreaming = () => {
    console.log('⏹️ Stopping spiritual growth streaming');
    setIsStreamingResponse(false);
    setIsLoading(false);
  };

  return {
    messages,
    isLoading,
    isTyping,
    isStreamingResponse,
    currentQuestion,
    sendMessage,
    generateQuestion,
    provideFeedback,
    clearConversation,
    onStreamingComplete,
    onStopStreaming
  };
};
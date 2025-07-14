
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface GrowthConversationMessage {
  id: string;
  role: 'user' | 'hacs';
  content: string;
  timestamp: string;
  module?: string;
  messageType?: string;
  questionId?: string;
  isQuestion?: boolean;
}

export interface GrowthHACSQuestion {
  id: string;
  text: string;
  module: string;
  type: 'foundational' | 'validation' | 'philosophical';
}

export const useHACSGrowthConversation = () => {
  const [messages, setMessages] = useState<GrowthConversationMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<GrowthHACSQuestion | null>(null);

  useEffect(() => {
    loadConversationHistory();
  }, []);

  const loadConversationHistory = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: conversations, error } = await supabase
        .from('hacs_growth_conversations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) {
        console.error('Error loading growth conversation history:', error);
        return;
      }

      if (conversations && conversations.length > 0) {
        const conversation = conversations[0];
        setConversationId(conversation.id);
        const conversationData = Array.isArray(conversation.conversation_data) 
          ? (conversation.conversation_data as unknown) as GrowthConversationMessage[]
          : [];
        setMessages(conversationData);
      }
    } catch (error) {
      console.error('Error in loadConversationHistory:', error);
    }
  };

  const sendMessage = async (content: string): Promise<void> => {
    setIsLoading(true);
    setIsTyping(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const userMessage: GrowthConversationMessage = {
        id: crypto.randomUUID(),
        role: 'user',
        content,
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, userMessage]);

      // Call the dedicated growth conversation edge function with correct parameters
      const { data, error } = await supabase.functions.invoke('hacs-growth-conversation', {
        body: {
          message: content,
          conversationHistory: messages,
          userId: user.id
        }
      });

      if (error) {
        console.error('Growth conversation error:', error);
        throw error;
      }

      // Create HACS response message
      const hacsMessage: GrowthConversationMessage = {
        id: crypto.randomUUID(),
        role: 'hacs',
        content: data.response,
        timestamp: new Date().toISOString(),
        module: data.module || 'spiritual',
      };

      const updatedMessages = [...messages, userMessage, hacsMessage];
      setMessages(updatedMessages);

      // Save to growth-specific conversation table
      await saveConversation(updatedMessages, user.id);

      // Handle generated questions
      if (data.question) {
        setCurrentQuestion(data.question);
      }

    } catch (error) {
      console.error('Error sending growth message:', error);
      // Remove the user message if the response failed
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  const saveConversation = async (messages: GrowthConversationMessage[], userId: string) => {
    try {
      if (conversationId) {
        await supabase
          .from('hacs_growth_conversations')
          .update({
            conversation_data: messages as any,
            last_activity: new Date().toISOString()
          })
          .eq('id', conversationId);
      } else {
        const { data, error } = await supabase
          .from('hacs_growth_conversations')
          .insert({
            user_id: userId,
            session_id: crypto.randomUUID(),
            conversation_data: messages as any
          })
          .select()
          .single();

        if (error) throw error;
        setConversationId(data.id);
      }
    } catch (error) {
      console.error('Error saving growth conversation:', error);
    }
  };

  const generateQuestion = async (): Promise<void> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('hacs_growth_intelligence')
        .select('intelligence_level')
        .eq('user_id', user.id)
        .single();

      const intelligenceLevel = data?.intelligence_level || 50;

      const question: GrowthHACSQuestion = {
        id: crypto.randomUUID(),
        text: generateGrowthQuestion(intelligenceLevel),
        module: 'spiritual',
        type: 'foundational'
      };

      setCurrentQuestion(question);

      await supabase
        .from('hacs_growth_questions')
        .insert({
          user_id: user.id,
          conversation_id: conversationId,
          intelligence_level_when_asked: intelligenceLevel,
          question_text: question.text,
          question_type: question.type,
          hacs_module: question.module,
          generated_context: { source: 'growth_conversation' }
        });

    } catch (error) {
      console.error('Error generating growth question:', error);
    }
  };

  const provideFeedback = async (
    feedbackType: 'helpful' | 'not_helpful' | 'rating',
    feedbackValue: any,
    messageId?: string,
    questionId?: string
  ): Promise<void> => {
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

  return {
    messages,
    isLoading,
    isTyping,
    currentQuestion,
    sendMessage,
    generateQuestion,
    provideFeedback,
    clearConversation
  };
};

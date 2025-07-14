import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface BlendConversationMessage {
  id: string;
  role: 'user' | 'hacs';
  content: string;
  timestamp: string;
  module?: string;
  messageType?: string;
  questionId?: string;
  isQuestion?: boolean;
}

export interface BlendHACSQuestion {
  id: string;
  text: string;
  module: string;
  type: 'foundational' | 'validation' | 'philosophical';
}

export const useHACSBlendConversation = () => {
  const [messages, setMessages] = useState<BlendConversationMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<BlendHACSQuestion | null>(null);

  // Load conversation history on mount
  useEffect(() => {
    loadConversationHistory();
  }, []);

  const loadConversationHistory = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Load from blend-specific tables
      const { data: conversations, error } = await supabase
        .from('hacs_blend_conversations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) {
        console.error('Error loading blend conversation history:', error);
        return;
      }

      if (conversations && conversations.length > 0) {
        const conversation = conversations[0];
        setConversationId(conversation.id);
        const conversationData = Array.isArray(conversation.conversation_data) 
          ? (conversation.conversation_data as unknown) as BlendConversationMessage[]
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

      // Create user message
      const userMessage: BlendConversationMessage = {
        id: crypto.randomUUID(),
        role: 'user',
        content,
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, userMessage]);

      // **PHASE 2: Route through Unified Brain Service (11 Hermetic Components)**
      const { unifiedBrainService } = await import('../services/unified-brain-service');
      await unifiedBrainService.initialize(user.id);
      
      const sessionId = `blend_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const data = await unifiedBrainService.processMessageForModeHook(
        content,
        sessionId,
        'blend',
        messages
      );

      // Create HACS response message
      const hacsMessage: BlendConversationMessage = {
        id: crypto.randomUUID(),
        role: 'hacs',
        content: data.response,
        timestamp: new Date().toISOString(),
        module: data.module || 'integration',
      };

      const updatedMessages = [...messages, userMessage, hacsMessage];
      setMessages(updatedMessages);

      // Save to blend-specific conversation table
      await saveConversation(updatedMessages, user.id);

      // Record interaction and refresh intelligence
      await recordConversationInteraction(user.id, content, data.response);
      await refreshIntelligence();

      // Handle generated questions
      if (data.question) {
        setCurrentQuestion(data.question);
      }

    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  const saveConversation = async (messages: BlendConversationMessage[], userId: string) => {
    try {
      if (conversationId) {
        // Update existing conversation
        await supabase
          .from('hacs_blend_conversations')
          .update({
            conversation_data: messages as any,
            last_activity: new Date().toISOString()
          })
          .eq('id', conversationId);
      } else {
        // Create new conversation
        const { data, error } = await supabase
          .from('hacs_blend_conversations')
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
      console.error('Error saving blend conversation:', error);
    }
  };

  const recordConversationInteraction = async (userId: string, userMessage: string, hacsResponse: string) => {
    try {
      // Record in blend-specific intelligence
      const { data: intelligence } = await supabase
        .from('hacs_blend_intelligence')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (intelligence) {
        // Update existing blend intelligence
        await supabase
          .from('hacs_blend_intelligence')
          .update({
            interaction_count: (intelligence.interaction_count || 0) + 1,
            last_update: new Date().toISOString()
          })
          .eq('user_id', userId);
      } else {
        // Create new blend intelligence record
        await supabase
          .from('hacs_blend_intelligence')
          .insert({
            user_id: userId,
            intelligence_level: 50,
            interaction_count: 1,
            module_scores: {}
          });
      }

      // Determine response quality and update intelligence
      const quality = determineResponseQuality(hacsResponse, userMessage);
      await updateIntelligenceBasedOnQuality(userId, quality);

    } catch (error) {
      console.error('Error recording blend conversation interaction:', error);
    }
  };

  const refreshIntelligence = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('hacs_blend_intelligence')
        .select('*')
        .eq('user_id', user.id)
        .single();

      console.log('Blend intelligence refreshed:', data);
    } catch (error) {
      console.error('Error refreshing blend intelligence:', error);
    }
  };

  const generateQuestion = async (): Promise<void> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('hacs_blend_intelligence')
        .select('intelligence_level')
        .eq('user_id', user.id)
        .single();

      const intelligenceLevel = data?.intelligence_level || 50;

      // Generate blend-specific question
      const question: BlendHACSQuestion = {
        id: crypto.randomUUID(),
        text: generateBlendQuestion(intelligenceLevel),
        module: 'integration',
        type: 'foundational'
      };

      setCurrentQuestion(question);

      // Save question to blend-specific table
      await supabase
        .from('hacs_blend_questions')
        .insert({
          user_id: user.id,
          conversation_id: conversationId,
          intelligence_level_when_asked: intelligenceLevel,
          question_text: question.text,
          question_type: question.type,
          hacs_module: question.module,
          generated_context: { source: 'blend_conversation' }
        });

    } catch (error) {
      console.error('Error generating blend question:', error);
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

      // Record feedback in learning feedback table (shared)
      await supabase
        .from('hacs_learning_feedback')
        .insert({
          user_id: user.id,
          conversation_id: conversationId,
          question_id: questionId,
          feedback_type: feedbackType,
          feedback_value: feedbackValue,
          message_id: messageId,
          module_affected: 'integration'
        });

    } catch (error) {
      console.error('Error providing blend feedback:', error);
    }
  };

  const clearConversation = () => {
    setMessages([]);
    setCurrentQuestion(null);
    setConversationId(null);
  };

  // Helper functions
  const generateBlendQuestion = (intelligenceLevel: number): string => {
    const questions = [
      "How do your spiritual insights connect with your daily goals?",
      "What patterns do you notice across different areas of your life?",
      "How can you apply recent insights to create more harmony in your life?",
      "What would it look like to integrate your dreams with your practical plans?",
      "How do your emotional patterns relate to your productivity cycles?",
      "What wisdom emerges when you connect your analytical mind with your intuition?"
    ];
    return questions[Math.floor(Math.random() * questions.length)];
  };

  const determineResponseQuality = (hacsResponse: string, userMessage: string): 'excellent' | 'good' | 'average' | 'poor' => {
    // Simple heuristic based on response length and relevance
    if (hacsResponse.length > 120 && hacsResponse.includes('integration')) {
      return 'excellent';
    } else if (hacsResponse.length > 80) {
      return 'good';
    } else if (hacsResponse.length > 40) {
      return 'average';
    }
    return 'poor';
  };

  const updateIntelligenceBasedOnQuality = async (userId: string, quality: string) => {
    const bonusMap = { excellent: 5, good: 3, average: 1, poor: 0 };
    const bonus = bonusMap[quality as keyof typeof bonusMap] || 0;

    try {
      const { data: intelligence } = await supabase
        .from('hacs_blend_intelligence')
        .select('intelligence_level')
        .eq('user_id', userId)
        .single();

      const currentLevel = intelligence?.intelligence_level || 50;
      const newLevel = Math.min(100, currentLevel + bonus);

      await supabase
        .from('hacs_blend_intelligence')
        .update({ intelligence_level: newLevel })
        .eq('user_id', userId);

    } catch (error) {
      console.error('Error updating blend intelligence:', error);
    }
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
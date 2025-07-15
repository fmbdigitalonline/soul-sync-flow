import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface DreamConversationMessage {
  id: string;
  role: 'user' | 'hacs';
  content: string;
  timestamp: string;
  module?: string;
  messageType?: string;
  questionId?: string;
  isQuestion?: boolean;
}

export interface DreamHACSQuestion {
  id: string;
  text: string;
  module: string;
  type: 'foundational' | 'validation' | 'philosophical';
}

export const useHACSDreamConversation = () => {
  const [messages, setMessages] = useState<DreamConversationMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<DreamHACSQuestion | null>(null);

  // Load conversation history on mount
  useEffect(() => {
    loadConversationHistory();
  }, []);

  const loadConversationHistory = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Load from dream-specific tables
      const { data: conversations, error } = await supabase
        .from('hacs_dream_conversations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) {
        console.error('Error loading dream conversation history:', error);
        return;
      }

      if (conversations && conversations.length > 0) {
        const conversation = conversations[0];
        setConversationId(conversation.id);
        const conversationData = Array.isArray(conversation.conversation_data) 
          ? (conversation.conversation_data as unknown) as DreamConversationMessage[]
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
      const userMessage: DreamConversationMessage = {
        id: crypto.randomUUID(),
        role: 'user',
        content,
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, userMessage]);

      // Route through Unified Brain Service (11 Hermetic Components) then to dream edge function
      const { unifiedBrainService } = await import('../services/unified-brain-service');
      await unifiedBrainService.initialize(user.id);
      
      const sessionId = `dream_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const data = await unifiedBrainService.processMessageForModeHook(
        content,
        sessionId,
        'dream',
        messages
      );

      if (!data) throw new Error('No response from unified brain service');

      // Create HACS response message
      const hacsMessage: DreamConversationMessage = {
        id: crypto.randomUUID(),
        role: 'hacs',
        content: data.response,
        timestamp: new Date().toISOString(),
        module: data.module || 'dreams',
      };

      const updatedMessages = [...messages, userMessage, hacsMessage];
      setMessages(updatedMessages);

      // Save to dream-specific conversation table
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

  const saveConversation = async (messages: DreamConversationMessage[], userId: string) => {
    try {
      if (conversationId) {
        // Update existing conversation
        await supabase
          .from('hacs_dream_conversations')
          .update({
            conversation_data: messages as any,
            last_activity: new Date().toISOString()
          })
          .eq('id', conversationId);
      } else {
        // Create new conversation
        const { data, error } = await supabase
          .from('hacs_dream_conversations')
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
      console.error('Error saving dream conversation:', error);
    }
  };

  const recordConversationInteraction = async (userId: string, userMessage: string, hacsResponse: string) => {
    try {
      // Record in dream-specific intelligence
      const { data: intelligence } = await supabase
        .from('hacs_dream_intelligence')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (intelligence) {
        // Update existing dream intelligence
        await supabase
          .from('hacs_dream_intelligence')
          .update({
            interaction_count: (intelligence.interaction_count || 0) + 1,
            last_update: new Date().toISOString()
          })
          .eq('user_id', userId);
      } else {
        // Create new dream intelligence record
        await supabase
          .from('hacs_dream_intelligence')
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
      console.error('Error recording dream conversation interaction:', error);
    }
  };

  const refreshIntelligence = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('hacs_dream_intelligence')
        .select('*')
        .eq('user_id', user.id)
        .single();

      console.log('Dream intelligence refreshed:', data);
    } catch (error) {
      console.error('Error refreshing dream intelligence:', error);
    }
  };

  const generateQuestion = async (): Promise<void> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('hacs_dream_intelligence')
        .select('intelligence_level')
        .eq('user_id', user.id)
        .single();

      const intelligenceLevel = data?.intelligence_level || 50;

      // Generate dream-specific question
      const question: DreamHACSQuestion = {
        id: crypto.randomUUID(),
        text: generateDreamQuestion(intelligenceLevel),
        module: 'dreams',
        type: 'foundational'
      };

      setCurrentQuestion(question);

      // Save question to dream-specific table
      await supabase
        .from('hacs_dream_questions')
        .insert({
          user_id: user.id,
          conversation_id: conversationId,
          intelligence_level_when_asked: intelligenceLevel,
          question_text: question.text,
          question_type: question.type,
          hacs_module: question.module,
          generated_context: { source: 'dream_conversation' }
        });

    } catch (error) {
      console.error('Error generating dream question:', error);
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
          module_affected: 'dreams'
        });

    } catch (error) {
      console.error('Error providing dream feedback:', error);
    }
  };

  const clearConversation = () => {
    setMessages([]);
    setCurrentQuestion(null);
    setConversationId(null);
  };

  // Helper functions
  const generateDreamQuestion = (intelligenceLevel: number): string => {
    const questions = [
      "What recurring themes appear in your dreams?",
      "How do your dreams connect to your waking life experiences?",
      "What symbols or images feel most significant in your dream world?",
      "How do you interpret the deeper meanings in your dreams?",
      "What insights have your dreams revealed about your subconscious?",
      "How do you use dream work for personal transformation?"
    ];
    return questions[Math.floor(Math.random() * questions.length)];
  };

  const determineResponseQuality = (hacsResponse: string, userMessage: string): 'excellent' | 'good' | 'average' | 'poor' => {
    // Simple heuristic based on response length and relevance
    if (hacsResponse.length > 100 && (hacsResponse.includes('dream') || hacsResponse.includes('subconscious'))) {
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
        .from('hacs_dream_intelligence')
        .select('intelligence_level')
        .eq('user_id', userId)
        .single();

      const currentLevel = intelligence?.intelligence_level || 50;
      const newLevel = Math.min(100, currentLevel + bonus);

      await supabase
        .from('hacs_dream_intelligence')
        .update({ intelligence_level: newLevel })
        .eq('user_id', userId);

    } catch (error) {
      console.error('Error updating dream intelligence:', error);
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
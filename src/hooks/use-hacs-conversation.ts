
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

      // Use AI Coach Service directly with includeBlueprint: true
      const { aiCoachService } = await import('../services/ai-coach-service');
      
      console.log('🔄 HACS Conversation: Using AI Coach Service with blueprint data');
      
      const result = await aiCoachService.sendMessage(
        content.trim(),
        sessionIdRef.current,
        true, // includeBlueprint: true - ensures persona/blueprint is used
        'guide', // AgentType
        'en',
        'friend'
      );

      // Add HACS response
      const hacsMessage: ConversationMessage = {
        id: `hacs_${Date.now()}`,
        role: 'hacs',
        content: result.response,
        timestamp: new Date().toISOString()
      };

      const updatedMessages = [...messages, userMessage, hacsMessage];
      setMessages(updatedMessages);

      // Save conversation to database
      if (conversationId) {
        await supabase
          .from('hacs_conversations')
          .update({
            conversation_data: updatedMessages as any,
            last_activity: new Date().toISOString()
          })
          .eq('id', conversationId);
      } else {
        const { data: newConversation } = await supabase
          .from('hacs_conversations')
          .insert({
            user_id: user.id,
            session_id: sessionIdRef.current,
            conversation_data: updatedMessages as any,
            intelligence_level_start: 50
          })
          .select()
          .single();
        
        if (newConversation) {
          setConversationId(newConversation.id);
        }
      }

      // CRITICAL: Record conversation interaction for intelligence growth
      await recordConversationInteraction(
        content.trim(),
        determineResponseQuality(result.response, content.trim())
      );

      // Refresh intelligence to update visuals
      await refreshIntelligence();

      console.log('✅ HACS Conversation: Successfully processed through AI Coach Service with blueprint');

    } catch (error) {
      console.error('❌ HACS CONVERSATION FAILED:', error);
      
      // Remove user message since conversation failed
      setMessages(prev => prev.slice(0, -1));
      
      // Re-throw error to surface the problem
      throw error;
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  }, [user, messages, conversationId, recordConversationInteraction, refreshIntelligence]);

  const generateQuestion = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      // Generate a simple question for now - the AI Coach Service handles more complex question generation
      const questions = [
        "What's on your mind today?",
        "How are you feeling about your current goals?",
        "What would you like to explore together?",
        "What aspects of your growth are you most curious about?"
      ];
      
      const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
      
      const question: HACSQuestion = {
        id: `question_${Date.now()}`,
        text: randomQuestion,
        module: 'hacs',
        type: 'foundational'
      };

      setCurrentQuestion(question);

      // Add question as a message
      const questionMessage: ConversationMessage = {
        id: question.id,
        role: 'hacs',
        content: question.text,
        timestamp: new Date().toISOString(),
        module: question.module,
        questionId: question.id,
        isQuestion: true
      };

      setMessages(prev => [...prev, questionMessage]);
    } catch (error) {
      console.error('Error generating question:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

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

  const clearConversation = useCallback(() => {
    setMessages([]);
    setConversationId(null);
    setCurrentQuestion(null);
  }, []);

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

  return {
    messages,
    isLoading,
    isTyping,
    conversationId,
    currentQuestion,
    sendMessage,
    generateQuestion,
    provideFeedback,
    clearConversation
  };
};

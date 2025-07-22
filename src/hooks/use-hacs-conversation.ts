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
          // STEP 4: Filter out CNR questions - they're handled by FloatingHACSOrb (SoulSync Principle 1: Additive)
          const filteredMessages = (conversationData as unknown as ConversationMessage[])
            .filter(message => !(message.isQuestion && message.module === 'CNR'));
          setMessages(filteredMessages);
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
      // CRITICAL: Ensure hacs_intelligence record exists with proper ID
      const { data: existingIntelligence, error: checkError } = await supabase
        .from('hacs_intelligence')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('❌ Error checking HACS intelligence:', checkError);
      }

      // Initialize intelligence record if it doesn't exist
      if (!existingIntelligence) {
        console.log('🔄 Initializing HACS intelligence record for user:', user.id);
        const { error: initError } = await supabase
          .from('hacs_intelligence')
          .insert({
            id: crypto.randomUUID(),
            user_id: user.id,
            intelligence_level: 50,
            interaction_count: 0,
            module_scores: {},
            pie_score: 0,
            tmg_score: 0,
            vfp_score: 0
          });

        if (initError) {
          console.error('❌ Failed to initialize HACS intelligence:', initError);
        } else {
          console.log('✅ HACS intelligence record initialized');
        }
      }

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
        content: data.response,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, hacsMessage]);
      setConversationId(data.conversationId);

      // Record conversation interaction for intelligence growth
      await recordConversationInteraction(
        content.trim(),
        determineResponseQuality(data.response, content.trim())
      );

      // Refresh intelligence to update visuals
      await refreshIntelligence();

      // Handle generated question
      if (data.generatedQuestion) {
        // STEP 4: Route CNR questions to floating orb instead of main conversation (SoulSync Principle 1: Additive)
        if (data.generatedQuestion.module === 'CNR') {
          console.log('🎯 HACS Conversation: CNR question generated - routing to floating orb');
          
          // Import CNR router dynamically to avoid circular dependencies
          const { cnrMessageRouter } = await import('../services/cnr-message-router');
          
          // Create clarifying question from generated question
          const clarifyingQuestion = {
            id: data.generatedQuestion.id,
            question: data.generatedQuestion.text,
            context: 'personality_conflict_resolution',
            expectedAnswerType: 'text' as const,
            conflictId: `conflict_${Date.now()}`
          };
          
          // Route to floating orb
          cnrMessageRouter.initialize();
          await cnrMessageRouter.routeQuestionToFloatingOrb(clarifyingQuestion);
          
          // Don't add CNR questions to main conversation
          setCurrentQuestion(null);
          
        } else {
          // Non-CNR questions go to main conversation as before
          setCurrentQuestion(data.generatedQuestion);
          
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
      }

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

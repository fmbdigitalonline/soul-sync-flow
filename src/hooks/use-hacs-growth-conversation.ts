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

  const sendMessage = useCallback(async (content: string) => {
    if (isLoading || !content.trim()) return;

    const userMessage: GrowthConversationMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: content.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    try {
      console.log('🧠 ENHANCED COACH: Starting streaming conversation through enhanced coach pipeline');
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Create assistant message for streaming
      const assistantMessage: GrowthConversationMessage = {
        id: `ai-${Date.now()}`,
        role: 'hacs',
        content: '',
        timestamp: new Date().toISOString(),
        module: 'enhanced-coach'
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Direct call to enhanced coach with streaming
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('No authentication session');
      }

      const supabaseUrl = 'https://qxaajirrqrcnmvtowjbg.supabase.co';
      const response = await fetch(`${supabaseUrl}/functions/v1/hacs-coach-conversation`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: content.trim(),
          userId: user.id,
          sessionId: conversationId || `session-${Date.now()}`,
          useEnhancedMode: true,
          enableBackgroundIntelligence: true,
          conversationHistory: messages,
          threadId: conversationId
        }),
      });

      if (!response.ok) {
        throw new Error(`Enhanced coach stream failed: ${response.status}`);
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullContent = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data.trim() === '[DONE]') {
                // Stream complete
                setMessages(prev => prev.map(msg => 
                  msg.id === assistantMessage.id 
                    ? { ...msg, content: fullContent }
                    : msg
                ));
                
                // Save conversation and record interaction
                if (user?.id) {
                  await saveConversation([...messages, userMessage, { ...assistantMessage, content: fullContent }], user.id);
                  await recordConversationInteraction(user.id, content, fullContent);
                }
                
                return;
              }

              try {
                const parsed = JSON.parse(data);
                const streamContent = parsed.choices?.[0]?.delta?.content;
                if (streamContent) {
                  fullContent += streamContent;
                  // Update message with streaming content
                  setMessages(prev => prev.map(msg => 
                    msg.id === assistantMessage.id 
                      ? { ...msg, content: fullContent }
                      : msg
                  ));
                }
              } catch (e) {
                // Skip invalid JSON
                continue;
              }
            }
          }
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
      console.error('❌ Enhanced Coach streaming error:', error);
      
      // Fallback to unified brain service (non-streaming)
      try {
        const { unifiedBrainService } = await import('../services/unified-brain-service');
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await unifiedBrainService.initialize(user.id);
          
          const sessionId = `growth_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          const data = await unifiedBrainService.processMessageForModeHook(
            content.trim(),
            sessionId,
            'guide',
            messages
          );

          if (data) {
            const fallbackMessage: GrowthConversationMessage = {
              id: `ai-fallback-${Date.now()}`,
              role: 'hacs',
              content: data.response,
              timestamp: new Date().toISOString(),
              module: data.module || 'fallback'
            };

            setMessages(prev => prev.map(msg => 
              msg.id.startsWith('ai-') && msg.content === '' ? fallbackMessage : msg
            ));

            await saveConversation([...messages, userMessage, fallbackMessage], user.id);
            await recordConversationInteraction(user.id, content, data.response);
          }
        }
      } catch (fallbackError) {
        console.error('❌ Fallback also failed:', fallbackError);
        const errorMessage: GrowthConversationMessage = {
          id: `error-${Date.now()}`,
          role: 'hacs',
          content: 'I\'m having trouble connecting right now. Could you try sharing that again?',
          timestamp: new Date().toISOString(),
        };
        setMessages(prev => prev.map(msg => 
          msg.id.startsWith('ai-') && msg.content === '' ? errorMessage : msg
        ));
      }
    } finally {
      setIsTyping(false);
    }
  }, [isLoading, messages, conversationId, currentQuestion]);

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

  const recordConversationInteraction = async (userId: string, userMessage: string, hacsResponse: string) => {
    try {
      const { data: intelligence } = await supabase
        .from('hacs_growth_intelligence')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (intelligence) {
        await supabase
          .from('hacs_growth_intelligence')
          .update({
            interaction_count: (intelligence.interaction_count || 0) + 1,
            last_update: new Date().toISOString()
          })
          .eq('user_id', userId);
      } else {
        await supabase
          .from('hacs_growth_intelligence')
          .insert({
            user_id: userId,
            intelligence_level: 50,
            interaction_count: 1,
            module_scores: {}
          });
      }

      const quality = determineResponseQuality(hacsResponse, userMessage);
      await updateIntelligenceBasedOnQuality(userId, quality);

    } catch (error) {
      console.error('Error recording growth conversation interaction:', error);
    }
  };

  const refreshIntelligence = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('hacs_growth_intelligence')
        .select('*')
        .eq('user_id', user.id)
        .single();

      console.log('Growth intelligence refreshed:', data);
    } catch (error) {
      console.error('Error refreshing growth intelligence:', error);
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
import { useState, useEffect, useCallback, useRef } from 'react';
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
  const [isHistoryLoaded, setIsHistoryLoaded] = useState(false);
  
  const loadingRef = useRef(false);
  const sessionIdRef = useRef<string | null>(null);

  // CRITICAL FIX: Robust session management like Companion Oracle
  const getOrCreateSessionId = useCallback(async (): Promise<string> => {
    if (sessionIdRef.current) return sessionIdRef.current;
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');
    
    // Predictable session ID format matching Companion Oracle
    const sessionId = `spiritual_growth_${user.id}`;
    sessionIdRef.current = sessionId;
    return sessionId;
  }, []);

  // CRITICAL FIX: Deduplicated conversation history loading with useCallback
  const loadConversationHistory = useCallback(async () => {
    if (loadingRef.current || isHistoryLoaded) return;
    
    try {
      loadingRef.current = true;
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const sessionId = await getOrCreateSessionId();

      // PHASE 2: Load from conversation_memory like Companion Oracle for deduplication
      const { data: memoryData } = await supabase
        .from('conversation_memory')
        .select('*')
        .eq('user_id', user.id)
        .eq('session_id', sessionId)
        .eq('mode', 'guide')
        .order('updated_at', { ascending: false })
        .limit(1);

      let loadedMessages: GrowthConversationMessage[] = [];

      if (memoryData && memoryData.length > 0) {
        console.log('📚 Loading from conversation_memory for deduplication');
        const memory = memoryData[0];
        const messages = Array.isArray(memory.messages) ? memory.messages : [];
        
        // Deduplicate and convert to GrowthConversationMessage format
        const messageMap = new Map();
        messages.forEach((msg: any) => {
          if (msg.id && !messageMap.has(msg.id)) {
            messageMap.set(msg.id, {
              id: msg.id,
              role: msg.role === 'assistant' ? 'hacs' : msg.role,
              content: msg.content || '',
              timestamp: msg.timestamp || new Date().toISOString(),
              module: msg.module || 'spiritual',
              messageType: msg.messageType,
              questionId: msg.questionId,
              isQuestion: msg.isQuestion
            });
          }
        });
        loadedMessages = Array.from(messageMap.values());
      } else {
        // Fallback to growth conversations table
        const { data: conversations } = await supabase
          .from('hacs_growth_conversations')
          .select('*')
          .eq('user_id', user.id)
          .eq('session_id', sessionId)
          .order('created_at', { ascending: false })
          .limit(1);

        if (conversations && conversations.length > 0) {
          console.log('📚 Loading from hacs_growth_conversations');
          const conversation = conversations[0];
          setConversationId(conversation.id);
          const conversationData = Array.isArray(conversation.conversation_data) 
            ? (conversation.conversation_data as unknown) as GrowthConversationMessage[]
            : [];
          
          // Deduplicate messages by ID
          const messageMap = new Map();
          conversationData.forEach(msg => {
            if (msg.id && !messageMap.has(msg.id)) {
              messageMap.set(msg.id, msg);
            }
          });
          loadedMessages = Array.from(messageMap.values());
        }
      }

      // PHASE 3: State management improvements - only set if we have new messages
      if (loadedMessages.length > 0) {
        setMessages(prev => {
          // Prevent duplicates by comparing with existing messages
          const existingIds = new Set(prev.map(m => m.id));
          const newMessages = loadedMessages.filter(m => !existingIds.has(m.id));
          return newMessages.length > 0 ? loadedMessages : prev;
        });
      }
      
      setIsHistoryLoaded(true);
    } catch (error) {
      console.error('❌ Error in loadConversationHistory:', error);
    } finally {
      loadingRef.current = false;
    }
  }, [isHistoryLoaded, getOrCreateSessionId]);

  // CRITICAL FIX: Only load once with proper dependency
  useEffect(() => {
    if (!isHistoryLoaded) {
      loadConversationHistory();
    }
  }, [loadConversationHistory, isHistoryLoaded]);


  const sendMessage = useCallback(async (content: string) => {
    if (isLoading || !content.trim()) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const sessionId = await getOrCreateSessionId();

    const userMessage: GrowthConversationMessage = {
      id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      role: 'user',
      content: content.trim(),
      timestamp: new Date().toISOString(),
    };

    // PHASE 3: Prevent duplicate message additions
    setMessages(prev => {
      const exists = prev.some(m => m.id === userMessage.id);
      return exists ? prev : [...prev, userMessage];
    });
    setIsLoading(true);
    setIsTyping(true);

    try {
      console.log('🧠 ENHANCED COACH: Starting streaming conversation through enhanced coach pipeline');

      // Create assistant message for streaming with unique ID
      const assistantMessage: GrowthConversationMessage = {
        id: `ai-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        role: 'hacs',
        content: '',
        timestamp: new Date().toISOString(),
        module: 'enhanced-coach'
      };

      setMessages(prev => {
        const exists = prev.some(m => m.id === assistantMessage.id);
        return exists ? prev : [...prev, assistantMessage];
      });

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
          sessionId: sessionId,
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
                
                // PHASE 2: Save to both conversation_memory and growth conversations
                if (user?.id) {
                  const finalMessages = [...messages, userMessage, { ...assistantMessage, content: fullContent }];
                  await saveToConversationMemory(finalMessages, user.id, sessionId);
                  await saveConversation(finalMessages, user.id);
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

            const sessionId = await getOrCreateSessionId();
            const finalMessages = [...messages, userMessage, fallbackMessage];
            await saveToConversationMemory(finalMessages, user.id, sessionId);
            await saveConversation(finalMessages, user.id);
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
      setIsLoading(false);
      setIsTyping(false);
    }
  }, [isLoading, messages, conversationId, currentQuestion, getOrCreateSessionId]);

  // PHASE 2: Save to conversation_memory for deduplication like Companion Oracle
  const saveToConversationMemory = async (messages: GrowthConversationMessage[], userId: string, sessionId: string) => {
    try {
      const conversationMemoryData = {
        user_id: userId,
        session_id: sessionId,
        mode: 'guide' as const,
        messages: messages.map(msg => ({
          id: msg.id,
          role: msg.role === 'hacs' ? 'assistant' : msg.role,
          content: msg.content,
          timestamp: msg.timestamp,
          module: msg.module,
          messageType: msg.messageType,
          questionId: msg.questionId,
          isQuestion: msg.isQuestion
        })),
        last_activity: new Date().toISOString()
      };

      // Upsert into conversation_memory
      const { error } = await supabase
        .from('conversation_memory')
        .upsert(conversationMemoryData, { 
          onConflict: 'user_id, session_id, mode' 
        });

      if (error) {
        console.error('❌ Error saving to conversation_memory:', error);
      } else {
        console.log('✅ Saved to conversation_memory for deduplication');
      }
    } catch (error) {
      console.error('❌ Error in saveToConversationMemory:', error);
    }
  };

  const saveConversation = async (messages: GrowthConversationMessage[], userId: string) => {
    try {
      const sessionId = await getOrCreateSessionId();
      
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
            session_id: sessionId,
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

  // PHASE 3: Enhanced clear with cleanup
  const clearConversation = useCallback(() => {
    setMessages([]);
    setCurrentQuestion(null);
    setConversationId(null);
    setIsHistoryLoaded(false);
    sessionIdRef.current = null;
    loadingRef.current = false;
  }, []);

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
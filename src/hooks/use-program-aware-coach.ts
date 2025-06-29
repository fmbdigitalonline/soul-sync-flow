
import { useState, useCallback, useEffect } from 'react';
import { programAwareCoachService } from '@/services/program-aware-coach-service';
import { useAuth } from '@/contexts/AuthContext';
import { Message } from './use-ai-coach';
import { LifeDomain } from '@/types/growth-program';
import { useConversationRecovery } from './use-conversation-recovery';

export const useProgramAwareCoach = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string>('');
  const { user } = useAuth();
  
  const { saveConversation, loadConversation } = useConversationRecovery();

  // Auto-save conversations periodically
  useEffect(() => {
    if (messages.length > 0 && currentSessionId && user) {
      const saveTimer = setTimeout(() => {
        programAwareCoachService.saveConversationState(currentSessionId, user.id, messages);
      }, 2000); // Save 2 seconds after last message

      return () => clearTimeout(saveTimer);
    }
  }, [messages, currentSessionId, user]);

  const sendMessage = useCallback(async (content: string) => {
    if (!user || isLoading) return;

    const userMessage: Message = {
      id: `msg_${Date.now()}_user`,
      content,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const sessionId = currentSessionId || `session_${user.id}_${Date.now()}`;
      if (!currentSessionId) {
        setCurrentSessionId(sessionId);
      }

      const response = await programAwareCoachService.sendProgramAwareMessage(
        content,
        sessionId,
        user.id,
        true
      );

      const assistantMessage: Message = {
        id: `msg_${Date.now()}_assistant`,
        content: response.response,
        sender: 'assistant',
        timestamp: new Date(),
      };

      setMessages(prev => {
        const updatedMessages = [...prev, assistantMessage];
        // Save conversation state after each exchange
        if (sessionId) {
          saveConversation(sessionId, updatedMessages, undefined, {
            stage: 'belief_drilling',
            lastUserMessage: content
          });
        }
        return updatedMessages;
      });
    } catch (error) {
      console.error('Error sending program-aware message:', error);
      
      const errorMessage: Message = {
        id: `msg_${Date.now()}_error`,
        content: 'I apologize, but I encountered an error. Please try again.',
        sender: 'assistant',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [user, isLoading, currentSessionId, saveConversation]);

  const initializeBeliefDrilling = useCallback(async (domain: LifeDomain) => {
    if (!user) return;

    try {
      const sessionId = `belief_drilling_${user.id}_${domain}_${Date.now()}`;
      setCurrentSessionId(sessionId);

      // Get the simple greeting without making an AI call
      const response = await programAwareCoachService.initializeBeliefDrilling(
        domain,
        user.id,
        sessionId
      );

      const assistantMessage: Message = {
        id: `msg_${Date.now()}_assistant`,
        content: response.response,
        sender: 'assistant',
        timestamp: new Date(),
      };

      // Set fresh conversation with only the greeting
      setMessages([assistantMessage]);
    } catch (error) {
      console.error('Error initializing belief drilling:', error);
      
      const errorMessage: Message = {
        id: `msg_${Date.now()}_error`,
        content: 'I apologize, but I encountered an error starting our conversation. Please try again.',
        sender: 'assistant',
        timestamp: new Date(),
      };

      setMessages([errorMessage]);
    }
  }, [user]);

  const recoverConversation = useCallback(async (sessionId: string) => {
    if (!user) return;

    try {
      setIsLoading(true);
      console.log('🔄 Recovering conversation:', sessionId);

      // Load conversation history
      const history = await programAwareCoachService.loadConversationHistory(sessionId, user.id);
      
      if (history.length > 0) {
        const formattedMessages: Message[] = history.map((msg: any) => ({
          id: msg.id || `msg_${Date.now()}_${Math.random()}`,
          content: msg.content || '',
          sender: msg.sender || 'user',
          timestamp: new Date(msg.timestamp || Date.now())
        }));
        
        setMessages(formattedMessages);
        setCurrentSessionId(sessionId);
        console.log('✅ Conversation recovered:', formattedMessages.length, 'messages');
      }
    } catch (error) {
      console.error('Error recovering conversation:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const initializeConversation = useCallback(async () => {
    if (!user || hasInitialized) return;
    
    setHasInitialized(true);
    await programAwareCoachService.initializeForUser(user.id);
  }, [user, hasInitialized]);

  const resetConversation = useCallback(() => {
    setMessages([]);
    setHasInitialized(false);
    setCurrentSessionId('');
  }, []);

  const getProgramContext = useCallback(() => {
    return programAwareCoachService.getCurrentContext();
  }, []);

  return {
    messages,
    isLoading,
    sendMessage,
    resetConversation,
    getProgramContext,
    initializeConversation,
    initializeBeliefDrilling,
    recoverConversation,
    currentSessionId
  };
};

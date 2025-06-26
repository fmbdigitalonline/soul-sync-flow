
import { useState, useCallback } from 'react';
import { programAwareCoachService } from '@/services/program-aware-coach-service';
import { useAuth } from '@/contexts/AuthContext';
import { Message } from './use-ai-coach';

export const useProgramAwareCoach = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const sendMessage = useCallback(async (content: string) => {
    if (!user) return;

    const userMessage: Message = {
      id: `msg_${Date.now()}_user`,
      content,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await programAwareCoachService.sendProgramAwareMessage(
        content,
        `session_${user.id}_${Date.now()}`,
        user.id,
        true
      );

      const assistantMessage: Message = {
        id: `msg_${Date.now()}_assistant`,
        content: response.response,
        sender: 'assistant',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
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
  }, [user]);

  const resetConversation = useCallback(() => {
    setMessages([]);
  }, []);

  const getProgramContext = useCallback(() => {
    return programAwareCoachService.getCurrentContext();
  }, []);

  return {
    messages,
    isLoading,
    sendMessage,
    resetConversation,
    getProgramContext
  };
};

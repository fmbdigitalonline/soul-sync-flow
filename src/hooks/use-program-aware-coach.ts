
import { useState, useCallback } from 'react';
import { programAwareCoachService } from '@/services/program-aware-coach-service';
import { useAuth } from '@/contexts/AuthContext';
import { Message } from './use-ai-coach';
import { LifeDomain } from '@/types/growth-program';

export const useProgramAwareCoach = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  const { user } = useAuth();

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
  }, [user, isLoading]);

  const initializeBeliefDrilling = useCallback(async (domain: LifeDomain) => {
    if (!user) return;

    try {
      // Get the simple greeting without making an AI call
      const response = await programAwareCoachService.initializeBeliefDrilling(
        domain,
        user.id,
        `session_${user.id}_${Date.now()}`
      );

      const assistantMessage: Message = {
        id: `msg_${Date.now()}_assistant`,
        content: response.response,
        sender: 'assistant',
        timestamp: new Date(),
      };

      // Only add the greeting if there are no messages, otherwise preserve conversation
      setMessages(prev => prev.length === 0 ? [assistantMessage] : [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error initializing belief drilling:', error);
      
      const errorMessage: Message = {
        id: `msg_${Date.now()}_error`,
        content: 'I apologize, but I encountered an error starting our conversation. Please try again.',
        sender: 'assistant',
        timestamp: new Date(),
      };

      setMessages(prev => prev.length === 0 ? [errorMessage] : [...prev, errorMessage]);
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
    initializeBeliefDrilling
  };
};

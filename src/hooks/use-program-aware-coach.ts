
import { useState, useCallback } from 'react';
import { programAwareCoachService } from '@/services/program-aware-coach-service';
import { useAuth } from '@/contexts/AuthContext';
import { Message } from './use-ai-coach';

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

  const initializeConversation = useCallback(async () => {
    if (!user || hasInitialized) return;
    
    setHasInitialized(true);
    
    // Initialize the service but don't automatically send a message
    await programAwareCoachService.initializeForUser(user.id);
    
    // Only send initial message for truly new users without programs
    const context = programAwareCoachService.getCurrentContext();
    
    if (!context.hasContext) {
      // User has no program - guide them through selection
      setTimeout(() => {
        sendMessage("I want to start a growth program but I'm not sure which area to focus on. Can you help me explore my options?");
      }, 1000);
    }
    // For users with existing programs, let them initiate the conversation naturally
  }, [user, hasInitialized, sendMessage]);

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
    initializeConversation
  };
};

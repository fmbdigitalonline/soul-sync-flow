import { useState, useCallback, useEffect } from 'react';
import { programAwareCoachService, Message } from '@/services/program-aware-coach-service';
import { useAuth } from '@/contexts/AuthContext';
import { LifeDomain } from '@/types/growth-program';
import { useConversationRecovery } from './use-conversation-recovery';
import { useStreamingMessage } from './use-streaming-message';

export const useProgramAwareCoach = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string>('');
  const [errorCount, setErrorCount] = useState(0);
  const { user } = useAuth();
  
  const { saveConversation, loadConversation } = useConversationRecovery();
  const { streamingContent, isStreaming, streamText, resetStreaming } = useStreamingMessage();

  // Auto-save conversations with error handling
  useEffect(() => {
    if (messages.length > 0 && currentSessionId && user && errorCount < 3) {
      const saveTimer = setTimeout(async () => {
        try {
          await programAwareCoachService.saveConversationState(currentSessionId, user.id, messages);
          setErrorCount(0); // Reset error count on success
        } catch (error) {
          console.error("Error auto-saving conversation:", error);
          setErrorCount(prev => prev + 1);
        }
      }, 2000);

      return () => clearTimeout(saveTimer);
    }
  }, [messages, currentSessionId, user, errorCount]);

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
    resetStreaming();

    try {
      const sessionId = currentSessionId || `session_${user.id}_${Date.now()}`;
      if (!currentSessionId) {
        setCurrentSessionId(sessionId);
      }

      // Use enhanced program-aware coach with brain innovations
      const response = await programAwareCoachService.sendProgramAwareMessage(
        content,
        sessionId,
        user.id,
        true // Use enhanced brain
      );

      // Create assistant message with streaming
      const assistantMessage: Message = {
        id: `msg_${Date.now()}_assistant`,
        content: '', // Start empty for streaming
        sender: 'assistant',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Start slow typewriter streaming of the response
      setTimeout(() => {
        streamText(response.response, 75); // Slow, contemplative speed
      }, 300);

      // Update the message content after streaming completes
      setTimeout(() => {
        setMessages(prev => 
          prev.map(msg => 
            msg.id === assistantMessage.id 
              ? { ...msg, content: response.response }
              : msg
          )
        );
      }, response.response.length * 75 + 1000);

      // Save conversation state with recovery context
      if (sessionId) {
        saveConversation(sessionId, [...messages, userMessage, { ...assistantMessage, content: response.response }], undefined, {
          stage: 'belief_drilling',
          lastUserMessage: content,
          progressPercentage: response.progressPercentage,
          keyInsights: response.keyInsights,
          coreChallenges: response.coreChallenges
        });
      }

      // Reset error count on successful message
      setErrorCount(0);

    } catch (error) {
      console.error('Error sending program-aware message:', error);
      setErrorCount(prev => prev + 1);
      
      // Provide error recovery response with slow streaming
      const errorMessage: Message = {
        id: `msg_${Date.now()}_error`,
        content: '',
        sender: 'assistant',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorMessage]);
      
      const errorText = 'I apologize, but I encountered an issue. Let me try to help you differently. Could you rephrase what you were trying to share?';
      setTimeout(() => {
        streamText(errorText, 80);
      }, 300);

    } finally {
      setIsLoading(false);
    }
  }, [user, isLoading, currentSessionId, saveConversation, errorCount, streamText, resetStreaming]);

  const resetConversation = useCallback(() => {
    setMessages([]);
    setHasInitialized(false);
    setErrorCount(0);
    resetStreaming();
    
    // Clear session data
    if (currentSessionId) {
      programAwareCoachService.clearSession(currentSessionId);
    }
    setCurrentSessionId('');
  }, [currentSessionId, resetStreaming]);

  const getProgramContext = useCallback(() => {
    return programAwareCoachService.getCurrentContext();
  }, []);

  const initializeConversation = useCallback(async () => {
    if (!user || hasInitialized) return;
    
    setHasInitialized(true);
    
    try {
      await programAwareCoachService.initializeForUser(user.id);
      console.log("✅ Program-aware coach initialized with enhanced brain");
    } catch (error) {
      console.error("Error initializing program-aware coach:", error);
      setErrorCount(prev => prev + 1);
    }
  }, [user, hasInitialized]);

  const initializeBeliefDrilling = useCallback(async (domain: LifeDomain) => {
    if (!user) return;

    try {
      const sessionId = `belief_drilling_${user.id}_${domain}_${Date.now()}`;
      setCurrentSessionId(sessionId);

      // Initialize program-aware coach
      await programAwareCoachService.initializeForUser(user.id);

      // Get personalized greeting with enhanced brain
      const response = await programAwareCoachService.initializeBeliefDrilling(
        domain,
        user.id,
        sessionId
      );

      const assistantMessage: Message = {
        id: `msg_${Date.now()}_assistant`,
        content: '',
        sender: 'assistant',
        timestamp: new Date(),
      };

      // Set fresh conversation with slow streaming greeting
      setMessages([assistantMessage]);
      
      // Start slow typewriter streaming
      setTimeout(() => {
        streamText(response.response, 80);
      }, 500);

      // Update message after streaming
      setTimeout(() => {
        setMessages([{ ...assistantMessage, content: response.response }]);
      }, response.response.length * 80 + 1000);

      console.log("✅ Belief drilling initialized with slow streaming");

    } catch (error) {
      console.error('Error initializing belief drilling:', error);
      
      const errorMessage: Message = {
        id: `msg_${Date.now()}_error`,
        content: '',
        sender: 'assistant',
        timestamp: new Date(),
      };

      setMessages([errorMessage]);
      
      const fallbackText = 'Welcome to your growth journey. I apologize for the technical issue, but I\'m here to help you explore and grow. What would you like to focus on?';
      setTimeout(() => {
        streamText(fallbackText, 80);
      }, 300);
    }
  }, [user, streamText]);

  const recoverConversation = useCallback(async (sessionId: string) => {
    if (!user) return;

    try {
      setIsLoading(true);
      console.log('🔄 Recovering conversation with enhanced context:', sessionId);

      // Load conversation history with enhanced recovery
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
        setErrorCount(0); // Reset error count on successful recovery
          
        console.log('✅ Enhanced conversation recovered:', formattedMessages.length, 'messages');
      }
    } catch (error) {
      console.error('Error recovering conversation:', error);
      setErrorCount(prev => prev + 1);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  return {
    messages,
    isLoading,
    sendMessage,
    resetConversation,
    getProgramContext,
    initializeConversation,
    initializeBeliefDrilling,
    recoverConversation,
    currentSessionId,
    hasError: errorCount >= 3, // Expose error state for UI feedback
    errorCount,
    streamingContent,
    isStreaming
  };
};

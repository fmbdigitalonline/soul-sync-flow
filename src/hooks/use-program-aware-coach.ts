
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
  const [errorCount, setErrorCount] = useState(0);
  const { user } = useAuth();
  
  const { saveConversation, loadConversation } = useConversationRecovery();

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

      const assistantMessage: Message = {
        id: `msg_${Date.now()}_assistant`,
        content: response.response,
        sender: 'assistant',
        timestamp: new Date(),
      };

      setMessages(prev => {
        const updatedMessages = [...prev, assistantMessage];
        
        // Save conversation state with recovery context
        if (sessionId) {
          saveConversation(sessionId, updatedMessages, undefined, {
            stage: 'belief_drilling',
            lastUserMessage: content,
            progressPercentage: response.progressPercentage,
            keyInsights: response.keyInsights,
            coreChallenges: response.coreChallenges
          });
        }
        return updatedMessages;
      });

      // Reset error count on successful message
      setErrorCount(0);

    } catch (error) {
      console.error('Error sending program-aware message:', error);
      setErrorCount(prev => prev + 1);
      
      // Provide error recovery response
      const errorMessage: Message = {
        id: `msg_${Date.now()}_error`,
        content: 'I apologize, but I encountered an issue. Let me try to help you differently. Could you rephrase what you were trying to share?',
        sender: 'assistant',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [user, isLoading, currentSessionId, saveConversation, errorCount]);

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
        content: response.response,
        sender: 'assistant',
        timestamp: new Date(),
      };

      // Set fresh conversation with enhanced greeting
      setMessages([assistantMessage]);

      console.log("✅ Belief drilling initialized with enhanced brain integration");

    } catch (error) {
      console.error('Error initializing belief drilling:', error);
      
      const errorMessage: Message = {
        id: `msg_${Date.now()}_error`,
        content: 'Welcome to your growth journey. I apologize for the technical issue, but I\'m here to help you explore and grow. What would you like to focus on?',
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

  const resetConversation = useCallback(() => {
    setMessages([]);
    setHasInitialized(false);
    setErrorCount(0);
    
    // Clear session data
    if (currentSessionId) {
      programAwareCoachService.clearSession(currentSessionId);
    }
    setCurrentSessionId('');
  }, [currentSessionId]);

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
    currentSessionId,
    hasError: errorCount >= 3, // Expose error state for UI feedback
    errorCount
  };
};

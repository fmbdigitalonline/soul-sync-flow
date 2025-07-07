
import { useState, useCallback, useEffect } from 'react';
import { programAwareCoachService, Message } from '@/services/program-aware-coach-service';
import { useAuth } from '@/contexts/AuthContext';
import { LifeDomain } from '@/types/growth-program';
import { useConversationRecovery } from './use-conversation-recovery';
import { useStreamingMessage } from './use-streaming-message';

export const useProgramAwareCoach = (pageContext: string = 'spiritual-growth') => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string>('');
  const [errorCount, setErrorCount] = useState(0);
  const { user } = useAuth();
  
  const { saveConversation, loadConversation } = useConversationRecovery();
  const { 
    streamingContent, 
    isStreaming, 
    streamText, 
    resetStreaming,
    startStreaming,
    completeStreaming 
  } = useStreamingMessage();

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

  const sendMessage = useCallback(async (content: string, pageContext: string = 'spiritual-growth') => {
    if (!user || isLoading) return;

    const userMessage: Message = {
      id: `msg_${Date.now()}_user`,
      content,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    
    // Reset streaming before starting new response
    resetStreaming();

    try {
      // Step 1: Session Context Isolation - Include page context in session ID
      const sessionId = currentSessionId || `${pageContext}_${user.id}_${Date.now()}`;
      if (!currentSessionId) {
        setCurrentSessionId(sessionId);
      }

      // Create placeholder assistant message for streaming
      const assistantMessage: Message = {
        id: `msg_${Date.now()}_assistant`,
        content: '', // Start empty for streaming
        sender: 'assistant',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Start streaming state
      startStreaming();

      // Get response from program-aware coach
      const response = await programAwareCoachService.sendProgramAwareMessage(
        content,
        sessionId,
        user.id,
        true, // Use enhanced brain
        pageContext
      );

      console.log("🎯 Starting slow typewriter streaming for response:", response.response.substring(0, 50) + "...");

      // Start slow typewriter streaming with natural pacing
      streamText(response.response, 85); // Slow, contemplative speed for growth conversations

      // Update the actual message content after a delay to ensure streaming completes
      setTimeout(() => {
        setMessages(prev => 
          prev.map(msg => 
            msg.id === assistantMessage.id 
              ? { ...msg, content: response.response }
              : msg
          )
        );
        completeStreaming();
      }, response.response.length * 90 + 2000); // Give extra time for natural pauses

      // Save conversation state with recovery context and page-specific domain
      if (sessionId) {
        const domainFromContext = pageContext === 'spiritual-growth' ? 'personal_growth' : 
                                 pageContext === 'dreams' ? 'dream_coaching' :
                                 pageContext === 'coach' ? 'general_coaching' : 'relationships';
        
        saveConversation(sessionId, [...messages, userMessage, { ...assistantMessage, content: response.response }], domainFromContext as any, {
          stage: 'belief_drilling',
          lastUserMessage: content,
          progressPercentage: response.progressPercentage,
          keyInsights: response.keyInsights,
          coreChallenges: response.coreChallenges,
          pageContext // Track the page context
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
      
      startStreaming();
      streamText(errorText, 80);
      
      setTimeout(() => {
        setMessages(prev => 
          prev.map(msg => 
            msg.id === errorMessage.id 
              ? { ...msg, content: errorText }
              : msg
          )
        );
        completeStreaming();
      }, errorText.length * 85 + 1000);

    } finally {
      setIsLoading(false);
    }
  }, [user, isLoading, currentSessionId, saveConversation, errorCount, streamText, resetStreaming, startStreaming, completeStreaming]);

  const resetConversation = useCallback(() => {
    setMessages([]);
    setHasInitialized(false);
    setErrorCount(0);
    resetStreaming();
    
    // Clear session data with context isolation
    if (currentSessionId) {
      programAwareCoachService.clearSession(currentSessionId, pageContext);
    }
    setCurrentSessionId('');
  }, [currentSessionId, resetStreaming, pageContext]);

  const getProgramContext = useCallback(() => {
    return programAwareCoachService.getCurrentContext(pageContext);
  }, [pageContext]);

  const initializeConversation = useCallback(async () => {
    if (!user || hasInitialized) return;
    
    setHasInitialized(true);
    
    try {
      await programAwareCoachService.initializeForUser(user.id, pageContext);
      console.log("✅ Program-aware coach initialized with enhanced brain");
    } catch (error) {
      console.error("Error initializing program-aware coach:", error);
      setErrorCount(prev => prev + 1);
    }
  }, [user, hasInitialized, pageContext]);

  const initializeBeliefDrilling = useCallback(async (domain: LifeDomain, pageContext: string = 'spiritual-growth') => {
    if (!user) return;

    try {
      // Step 1: Session Context Isolation - Include page context in session ID
      const sessionId = `${pageContext}_belief_drilling_${user.id}_${domain}_${Date.now()}`;
      setCurrentSessionId(sessionId);

      // Initialize program-aware coach with context
      await programAwareCoachService.initializeForUser(user.id, pageContext);

      // Create initial assistant message for streaming
      const assistantMessage: Message = {
        id: `msg_${Date.now()}_assistant`,
        content: '',
        sender: 'assistant',
        timestamp: new Date(),
      };

      setMessages([assistantMessage]);

      // Start streaming state
      startStreaming();

      // Get personalized greeting with enhanced brain and context
      const response = await programAwareCoachService.initializeBeliefDrilling(
        domain,
        user.id,
        sessionId,
        pageContext
      );

      console.log("🎯 Starting belief drilling with slow typewriter streaming");

      // Start slow typewriter streaming with contemplative pacing
      streamText(response.response, 90); // Even slower for initial greeting

      // Update message after streaming
      setTimeout(() => {
        setMessages([{ ...assistantMessage, content: response.response }]);
        completeStreaming();
      }, response.response.length * 95 + 2000);

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
      
      startStreaming();
      streamText(fallbackText, 80);
      
      setTimeout(() => {
        setMessages([{ ...errorMessage, content: fallbackText }]);
        completeStreaming();
      }, fallbackText.length * 85 + 1000);
    }
  }, [user, streamText, startStreaming, completeStreaming, pageContext]);

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

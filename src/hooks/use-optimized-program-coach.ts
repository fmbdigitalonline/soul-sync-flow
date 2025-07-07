
import { useState, useCallback, useEffect } from 'react';
import { Message } from '@/services/program-aware-coach-service';
import { useAuth } from '@/contexts/AuthContext';
import { LifeDomain } from '@/types/growth-program';
import { useStreamingMessage } from './use-streaming-message';
import { growthProgramOrchestrator, BasicContext, EnhancedContext } from '@/services/growth-program-orchestrator';
import { useProgressiveEnhancement } from './use-progressive-enhancement';

export const useOptimizedProgramCoach = (domain: string = 'spiritual-growth') => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [orchestrationResult, setOrchestrationResult] = useState<{
    basicContext: BasicContext;
    enhancedContextPromise: Promise<EnhancedContext>;
  } | null>(null);
  const { user } = useAuth();
  
  const { 
    streamingContent, 
    isStreaming, 
    streamText, 
    resetStreaming,
    startStreaming,
    completeStreaming 
  } = useStreamingMessage();

  const {
    enhancementState,
    enhancedContext,
    getContextualPrompt,
    canStartChat
  } = useProgressiveEnhancement(
    orchestrationResult?.basicContext || { userId: '', domain, hasBasicBlueprint: false, coreTraits: [] },
    orchestrationResult?.enhancedContextPromise || Promise.resolve({
      userId: '',
      domain,
      hasBasicBlueprint: false,
      coreTraits: [],
      enhancementLevel: 'basic' as const
    })
  );

  const initializeForDomain = useCallback(async (targetDomain: string, blueprintData?: any) => {
    if (!user) return;

    try {
      console.log(`🚀 Initializing optimized coach for domain: ${targetDomain}`);
      
      const result = await growthProgramOrchestrator.initializeForDomain(
        user.id,
        targetDomain,
        blueprintData
      );
      
      setOrchestrationResult(result);
      console.log('✨ Orchestration result ready, chat can begin immediately');
      
    } catch (error) {
      console.error('Error initializing optimized coach:', error);
    }
  }, [user]);

  const sendMessage = useCallback(async (content: string) => {
    if (!user || isLoading || !orchestrationResult) return;

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
      // Create contextual prompt based on current enhancement level
      const contextualPrompt = getContextualPrompt(content);
      
      // Create placeholder assistant message for streaming
      const assistantMessage: Message = {
        id: `msg_${Date.now()}_assistant`,
        content: '',
        sender: 'assistant',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
      startStreaming();

      // Generate response based on available context
      const response = await generateResponse(contextualPrompt, enhancedContext);
      
      // Stream the response with natural pacing
      streamText(response, 85);
      
      // Update the actual message content
      setTimeout(() => {
        setMessages(prev => 
          prev.map(msg => 
            msg.id === assistantMessage.id 
              ? { ...msg, content: response }
              : msg
          )
        );
        completeStreaming();
      }, response.length * 90 + 1000);

    } catch (error) {
      console.error('Error sending message:', error);
      
      const errorResponse = 'I apologize, but I encountered an issue. Let me try to help you differently. Could you rephrase what you were sharing?';
      
      const errorMessage: Message = {
        id: `msg_${Date.now()}_error`,
        content: '',
        sender: 'assistant',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorMessage]);
      startStreaming();
      streamText(errorResponse, 80);
      
      setTimeout(() => {
        setMessages(prev => 
          prev.map(msg => 
            msg.id === errorMessage.id 
              ? { ...msg, content: errorResponse }
              : msg
          )
        );
        completeStreaming();
      }, errorResponse.length * 85 + 1000);

    } finally {
      setIsLoading(false);
    }
  }, [user, isLoading, orchestrationResult, getContextualPrompt, enhancedContext, streamText, resetStreaming, startStreaming, completeStreaming]);

  const generateResponse = async (prompt: string, context: EnhancedContext | null): Promise<string> => {
    // Simulate AI response generation based on available context
    const baseResponse = "I hear you, and I'm here to support your journey. ";
    
    if (!context) {
      return baseResponse + "While I'm getting to know you better, let's explore what's most important to you right now.";
    }
    
    switch (context.enhancementLevel) {
      case 'full':
        return baseResponse + "Drawing on your complete personality blueprint, I can see how your unique traits guide this exploration. Let's dive deeper into what resonates with your authentic self.";
      case 'partial':
        return baseResponse + "With the insights I have about your personality, I can offer some personalized guidance. What aspect of this feels most aligned with who you are?";
      default:
        return baseResponse + "I'm learning about your unique journey, and already I can sense your sincere desire for growth. What feels most meaningful to you in this moment?";
    }
  };

  const resetConversation = useCallback(() => {
    setMessages([]);
    resetStreaming();
  }, [resetStreaming]);

  return {
    messages,
    isLoading,
    sendMessage,
    resetConversation,
    initializeForDomain,
    enhancementState,
    canStartChat,
    streamingContent,
    isStreaming,
    orchestrationResult
  };
};

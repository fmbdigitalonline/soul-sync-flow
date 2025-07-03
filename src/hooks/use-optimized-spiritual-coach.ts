
import { useState, useCallback, useRef } from 'react';
import { conversationPerformanceService } from '@/services/conversation-performance-service';
import { useStreamingMessage } from './use-streaming-message';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface OptimizedMessage {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  isEnhanced?: boolean;
}

export const useOptimizedSpiritualCoach = () => {
  const [messages, setMessages] = useState<OptimizedMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(() => `optimized_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const enhancementInProgress = useRef(false);
  const { user } = useAuth();
  
  const {
    streamingContent,
    isStreaming,
    streamText,
    completeStreaming,
    resetStreaming,
  } = useStreamingMessage();

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || !user?.id) return;

    const userMessage: OptimizedMessage = {
      id: `user_${Date.now()}`,
      content: content.trim(),
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    resetStreaming();

    try {
      console.log("🚀 Starting optimized spiritual coaching conversation");
      const startTime = performance.now();

      // Get stream-first response
      const { quickResponse, contextPromise } = await conversationPerformanceService.handleUserInputOptimized(
        content,
        user.id,
        sessionId
      );

      const quickResponseTime = performance.now() - startTime;
      console.log(`⚡ Quick response ready in ${quickResponseTime.toFixed(1)}ms`);

      // Create assistant message for quick response
      const quickAssistantMessage: OptimizedMessage = {
        id: `assistant_quick_${Date.now()}`,
        content: '',
        sender: 'assistant',
        timestamp: new Date(),
        isEnhanced: false
      };

      setMessages(prev => [...prev, quickAssistantMessage]);
      setIsLoading(false);

      // Stream the quick response immediately
      streamText(quickResponse, 25); // Fast streaming for quick response

      // Wait for streaming to complete
      await new Promise(resolve => {
        const checkComplete = () => {
          if (!isStreaming) {
            resolve(void 0);
          } else {
            setTimeout(checkComplete, 100);
          }
        };
        checkComplete();
      });

      // Update message content after streaming
      setMessages(prev => prev.map(msg => {
        if (msg.id === quickAssistantMessage.id) {
          return { ...msg, content: quickResponse };
        }
        return msg;
      }));

      // Continue with enhanced response in background
      if (!enhancementInProgress.current) {
        enhancementInProgress.current = true;
        
        try {
          const fullContext = await contextPromise;
          const contextReadyTime = performance.now() - startTime;
          console.log(`🎯 Full context ready in ${contextReadyTime.toFixed(1)}ms`);

          // Generate enhanced response
          const enhancedResponse = await conversationPerformanceService.generateEnhancedResponse(
            content,
            fullContext,
            sessionId
          );

          const totalTime = performance.now() - startTime;
          console.log(`✅ Enhanced response generated in ${totalTime.toFixed(1)}ms total`);

          // Create enhanced message
          const enhancedMessage: OptimizedMessage = {
            id: `assistant_enhanced_${Date.now()}`,
            content: '',
            sender: 'assistant',
            timestamp: new Date(),
            isEnhanced: true
          };

          setMessages(prev => [...prev, enhancedMessage]);

          // Stream enhanced response
          resetStreaming();
          streamText(enhancedResponse, 30);

          // Update enhanced message after streaming
          setTimeout(() => {
            setMessages(prev => prev.map(msg => {
              if (msg.id === enhancedMessage.id) {
                return { ...msg, content: enhancedResponse };
              }
              return msg;
            }));
          }, enhancedResponse.length * 30 + 500);

        } catch (error) {
          console.error("❌ Enhanced response failed:", error);
        } finally {
          enhancementInProgress.current = false;
        }
      }

    } catch (error) {
      console.error("❌ Optimized conversation failed:", error);
      setIsLoading(false);
      
      // Fallback error message
      const errorMessage: OptimizedMessage = {
        id: `assistant_error_${Date.now()}`,
        content: "I'm experiencing some technical difficulties. Let me take a moment to reconnect with your spiritual journey...",
        sender: 'assistant',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    }
  }, [user?.id, sessionId, streamText, isStreaming, resetStreaming]);

  const clearConversation = useCallback(() => {
    setMessages([]);
    resetStreaming();
    if (user?.id) {
      conversationPerformanceService.clearCache(user.id);
    }
  }, [user?.id, resetStreaming]);

  return {
    messages,
    isLoading,
    sendMessage,
    clearConversation,
    streamingContent,
    isStreaming,
    sessionId,
    performanceMetrics: conversationPerformanceService.getPerformanceMetrics()
  };
};

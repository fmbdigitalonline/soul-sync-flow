
import { useState, useCallback, useRef, useEffect } from 'react';
import { optimizedConversationOrchestrator } from '@/services/optimized-conversation-orchestrator';
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

export const useUltraOptimizedSpiritualCoach = () => {
  const [messages, setMessages] = useState<OptimizedMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(() => `ultra_optimized_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const enhancementInProgress = useRef(false);
  const storageQuota = useRef({ used: 0, quota: 0 });
  const { user } = useAuth();
  
  const {
    streamingContent,
    isStreaming,
    streamText,
    resetStreaming,
  } = useStreamingMessage();

  // Storage optimization - monitor and cleanup
  useEffect(() => {
    const monitorStorage = async () => {
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        try {
          const estimate = await navigator.storage.estimate();
          storageQuota.current = {
            used: estimate.usage || 0,
            quota: estimate.quota || 0
          };

          // Cleanup if over 80% quota usage
          const usagePercent = storageQuota.current.used / storageQuota.current.quota;
          if (usagePercent > 0.8) {
            console.log("🧹 Storage cleanup triggered at", Math.round(usagePercent * 100), "% usage");
            await cleanupBrowserStorage();
          }
        } catch (error) {
          console.warn("Storage monitoring failed:", error);
        }
      }
    };

    monitorStorage();
    const interval = setInterval(monitorStorage, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const cleanupBrowserStorage = async () => {
    try {
      // Clear old conversation data from localStorage
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (
          key.startsWith('conversation_') || 
          key.startsWith('memory_') || 
          key.startsWith('cache_')
        )) {
          keysToRemove.push(key);
        }
      }
      
      keysToRemove.forEach(key => localStorage.removeItem(key));
      
      // Clear service cache
      optimizedConversationOrchestrator.clearCache();
      
      console.log(`🧹 Cleaned up ${keysToRemove.length} storage items`);
    } catch (error) {
      console.error("Storage cleanup failed:", error);
    }
  };

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || !user?.id) return;

    console.log("🚀 Ultra-optimized message processing started");
    const startTime = performance.now();

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
      // Step 1: Get immediate response (target <500ms)
      const { quickResponse, contextPromise } = await optimizedConversationOrchestrator.handleUserInputOptimized(
        content,
        user.id,
        sessionId
      );

      const quickResponseTime = performance.now() - startTime;
      console.log(`⚡ Ultra-quick response ready in ${quickResponseTime.toFixed(1)}ms`);

      // Step 2: Show immediate response
      const quickAssistantMessage: OptimizedMessage = {
        id: `assistant_quick_${Date.now()}`,
        content: '',
        sender: 'assistant',
        timestamp: new Date(),
        isEnhanced: false
      };

      setMessages(prev => [...prev, quickAssistantMessage]);
      setIsLoading(false); // Unblock input immediately

      // Step 3: Stream quick response
      streamText(quickResponse, 20); // Very fast streaming

      // Step 4: Update message content after streaming
      setTimeout(() => {
        setMessages(prev => prev.map(msg => {
          if (msg.id === quickAssistantMessage.id) {
            return { ...msg, content: quickResponse };
          }
          return msg;
        }));
      }, quickResponse.length * 20 + 200);

      // Step 5: Build enhanced response in background
      if (!enhancementInProgress.current) {
        enhancementInProgress.current = true;
        
        try {
          const fullContext = await contextPromise;
          const contextReadyTime = performance.now() - startTime;
          console.log(`🎯 Full context ready in ${contextReadyTime.toFixed(1)}ms`);

          // Generate enhanced response
          const enhancedResponse = await optimizedConversationOrchestrator.generateEnhancedResponse(
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
          streamText(enhancedResponse, 25);

          // Update enhanced message
          setTimeout(() => {
            setMessages(prev => prev.map(msg => {
              if (msg.id === enhancedMessage.id) {
                return { ...msg, content: enhancedResponse };
              }
              return msg;
            }));
          }, enhancedResponse.length * 25 + 300);

        } catch (error) {
          console.error("❌ Enhanced response failed:", error);
        } finally {
          enhancementInProgress.current = false;
        }
      }

    } catch (error) {
      console.error("❌ Ultra-optimized conversation failed:", error);
      setIsLoading(false);
      
      const errorMessage: OptimizedMessage = {
        id: `assistant_error_${Date.now()}`,
        content: "I'm ready to help! Let me connect with your spiritual journey...",
        sender: 'assistant',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    }
  }, [user?.id, sessionId, streamText, resetStreaming]);

  const clearConversation = useCallback(() => {
    setMessages([]);
    resetStreaming();
    if (user?.id) {
      optimizedConversationOrchestrator.clearCache(user.id);
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
    performanceMetrics: optimizedConversationOrchestrator.getPerformanceMetrics(),
    storageStatus: storageQuota.current
  };
};

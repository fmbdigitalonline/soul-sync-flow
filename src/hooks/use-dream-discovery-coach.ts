
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useEnhancedAICoach } from "./use-enhanced-ai-coach";
import { dreamActivityLogger } from "@/services/dream-activity-logger";

export const useDreamDiscoveryCoach = () => {
  const { messages, isLoading, sendMessage, resetConversation, currentAgent, switchAgent } = useEnhancedAICoach("guide", "dreams");
  const [messageCount, setMessageCount] = useState(0);
  
  // Use refs for stable values that don't need to trigger re-renders
  const sessionStartTimeRef = useRef(Date.now());
  const initializedRef = useRef(false);
  const sessionIdRef = useRef(`dream-discovery-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);

  // Initialize dream discovery context only once
  useEffect(() => {
    if (!initializedRef.current) {
      console.log('🌟 Initializing dream discovery coach');
      
      dreamActivityLogger.logActivity('dream_discovery_coach_initialized', {
        session_id: sessionIdRef.current,
        context: 'dream_discovery'
      });

      initializedRef.current = true;
    }
  }, []); // Empty dependency array - initialize once

  // Set agent to guide for dream discovery
  useEffect(() => {
    if (currentAgent !== "guide") {
      switchAgent("guide");
    }
  }, [currentAgent, switchAgent]);

  // Enhanced send message with dream discovery context
  const sendDreamDiscoveryMessage = useCallback(async (message: string) => {
    const messageStartTime = Date.now();
    
    try {
      // Log message attempt
      await dreamActivityLogger.logActivity('dream_discovery_message_attempt', {
        message_length: message.length,
        message_number: messageCount + 1,
        context: 'dream_discovery',
        session_id: sessionIdRef.current
      });

      // Create enhanced message for dream discovery context
      const enhancedMessage = `${message}

DREAM DISCOVERY CONTEXT:
You are my dream discovery guide helping me explore and define my biggest aspirations. Your role is to:
- Help me clarify my dreams and goals
- Ask insightful questions about my vision
- Guide me through self-reflection
- Help me understand what truly matters to me
- Support me in creating a clear path forward

Please provide guidance focused on dream discovery and vision setting, avoiding task management or completion tracking.`;

      console.log('🌟 Sending dream discovery message to guide');
      
      // Send only the original user message to be displayed in chat
      await sendMessage(enhancedMessage, true, message);
      
      const messageTime = Date.now() - messageStartTime;
      setMessageCount(prev => prev + 1);

      // Log successful message send
      await dreamActivityLogger.logActivity('dream_discovery_message_sent', {
        message_time_ms: messageTime,
        enhanced_message_length: enhancedMessage.length,
        original_message_length: message.length,
        message_number: messageCount + 1,
        context: 'dream_discovery'
      });
      
    } catch (error) {
      await dreamActivityLogger.logError('dream_discovery_message_error', {
        error: error instanceof Error ? error.message : String(error),
        message_attempt: message.substring(0, 100),
        message_number: messageCount + 1,
        context: 'dream_discovery'
      });
      
      throw error;
    }
  }, [messageCount, sendMessage]);

  // Reset conversation with dream discovery context
  const resetDreamDiscoveryConversation = useCallback(() => {
    resetConversation();
    setMessageCount(0);
    sessionIdRef.current = `dream-discovery-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    dreamActivityLogger.logActivity('dream_discovery_conversation_reset', {
      session_id: sessionIdRef.current,
      context: 'dream_discovery'
    });
  }, [resetConversation]);

  // Memoized session stats to prevent re-renders
  const sessionStats = useMemo(() => ({
    messageCount,
    sessionDuration: Date.now() - sessionStartTimeRef.current,
    sessionId: sessionIdRef.current,
    context: 'dream_discovery'
  }), [messageCount]);

  return {
    messages,
    isLoading,
    sendMessage: sendDreamDiscoveryMessage,
    resetConversation: resetDreamDiscoveryConversation,
    currentAgent,
    switchAgent,
    // Debug info
    sessionStats
  };
};

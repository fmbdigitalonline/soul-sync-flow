
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
      console.log('🌟 Initializing empathetic dream discovery coach');
      
      dreamActivityLogger.logActivity('dream_discovery_coach_initialized', {
        session_id: sessionIdRef.current,
        context: 'empathetic_dream_discovery'
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

  // Enhanced send message with empathetic dream discovery context
  const sendDreamDiscoveryMessage = useCallback(async (message: string) => {
    const messageStartTime = Date.now();
    
    try {
      // Log message attempt
      await dreamActivityLogger.logActivity('empathetic_dream_message_attempt', {
        message_length: message.length,
        message_number: messageCount + 1,
        context: 'empathetic_dream_discovery',
        session_id: sessionIdRef.current
      });

      // Create deeply empathetic message for dream discovery
      const empathetic_prompt = `${message}

EMPATHETIC DREAM DISCOVERY GUIDE CONTEXT:
You are my deeply empathetic dream discovery companion. Your role is to create an organic, heart-centered conversation that feels like talking to a wise, caring friend who truly sees and understands me.

CONVERSATION STYLE - BE THIS WAY:
- Ask thoughtful, open-ended questions that invite deep reflection
- Listen with your whole being and respond to the emotional undertones
- Be genuinely curious about what makes me come alive
- Offer gentle insights that help me discover my own wisdom
- When appropriate, present meaningful choices using this format: [Choice A: option text] [Choice B: option text] [Choice C: option text]
- Speak from the heart, not from scripts or templates
- Help me feel truly seen and understood in my dreams and aspirations

AVOID THESE COMPLETELY:
- Generic advice or step-by-step instructions
- Scripted questions or robotic responses  
- Task management or productivity language
- Overwhelming lists or formal frameworks
- Anything that feels coached or programmed

CONVERSATION EXAMPLES:
Instead of: "What are your goals?"
Ask: "When you close your eyes and imagine feeling truly fulfilled, what comes alive in you?"

Instead of: "Here are steps to achieve your dreams"
Say: "I'm sensing something beautiful in what you shared. Tell me more about that feeling of [specific emotion they mentioned]..."

When offering choices, make them meaningful:
"I'm curious about what draws you most right now... [Choice A: ⚡ The excitement of creating something new] [Choice B: 🕊️ The peace of deeper connections] [Choice C: 🌱 The growth that comes from challenges]"

Remember: This is a sacred conversation about dreams. Be present, be real, be deeply caring. Help me discover what truly matters to my soul.`;

      console.log('🌟 Sending empathetic dream discovery message');
      
      // Send only the original user message to be displayed in chat
      await sendMessage(empathetic_prompt, true, message);
      
      const messageTime = Date.now() - messageStartTime;
      setMessageCount(prev => prev + 1);

      // Log successful message send
      await dreamActivityLogger.logActivity('empathetic_dream_message_sent', {
        message_time_ms: messageTime,
        enhanced_message_length: empathetic_prompt.length,
        original_message_length: message.length,
        message_number: messageCount + 1,
        context: 'empathetic_dream_discovery'
      });
      
    } catch (error) {
      await dreamActivityLogger.logError('empathetic_dream_message_error', {
        error: error instanceof Error ? error.message : String(error),
        message_attempt: message.substring(0, 100),
        message_number: messageCount + 1,
        context: 'empathetic_dream_discovery'
      });
      
      throw error;
    }
  }, [messageCount, sendMessage]);

  // Reset conversation with empathetic dream discovery context
  const resetDreamDiscoveryConversation = useCallback(() => {
    resetConversation();
    setMessageCount(0);
    sessionIdRef.current = `empathetic-dream-discovery-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    dreamActivityLogger.logActivity('empathetic_dream_conversation_reset', {
      session_id: sessionIdRef.current,
      context: 'empathetic_dream_discovery'
    });
  }, [resetConversation]);

  // Memoized session stats to prevent re-renders
  const sessionStats = useMemo(() => ({
    messageCount,
    sessionDuration: Date.now() - sessionStartTimeRef.current,
    sessionId: sessionIdRef.current,
    context: 'empathetic_dream_discovery'
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

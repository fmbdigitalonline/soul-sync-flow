
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useEnhancedAICoach } from "./use-enhanced-ai-coach-stub";
import { dreamActivityLogger } from "@/services/dream-activity-logger";

interface DreamIntakeData {
  title: string;
  description: string;
  category: string;
  timeframe: string;
}

type ConversationPhase = 'discovery' | 'intake' | 'ready_for_decomposition';

export const useDreamDiscoveryCoach = () => {
  const { messages, isLoading, sendMessage, resetConversation, currentAgent, switchAgent } = useEnhancedAICoach("guide", "dreams");
  const [messageCount, setMessageCount] = useState(0);
  const [conversationPhase, setConversationPhase] = useState<ConversationPhase>('discovery');
  const [intakeData, setIntakeData] = useState<DreamIntakeData>({
    title: '',
    description: '',
    category: 'personal_growth',
    timeframe: '3 months'
  });
  const [discoveryContext, setDiscoveryContext] = useState<string>('');
  
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

  // Detect when to transition from discovery to intake
  const shouldTransitionToIntake = useCallback((userMessage: string, conversationHistory: any[]) => {
    if (conversationPhase !== 'discovery') return false;
    
    // Check if we have enough meaningful exchanges (at least 4-6 messages from user)
    const userMessages = conversationHistory.filter(msg => msg.sender === 'user');
    if (userMessages.length < 4) return false;
    
    // Check if user has shared specific, actionable dreams
    const recentMessages = userMessages.slice(-3).map(msg => msg.content.toLowerCase());
    const hasSpecificContent = recentMessages.some(content => 
      content.includes('build') || content.includes('create') || content.includes('help') ||
      content.includes('product') || content.includes('business') || content.includes('app') ||
      content.includes('invent') || content.includes('write') || content.includes('teach')
    );
    
    return hasSpecificContent && userMessages.length >= 4;
  }, [conversationPhase]);

  // Generate contextual intake prompts based on discovery
  const generateIntakePrompt = useCallback((phase: 'title' | 'description' | 'category' | 'timeframe', context: string) => {
    const basePrompts = {
      title: `I can feel the beautiful dream taking shape through our conversation, and I'm excited to help you bring it to life! Based on everything you've shared, what would you call this dream of yours? What title captures the essence of what you want to create?`,
      description: `That's a wonderful title! Now, can you help me understand the deeper "why" behind this dream? What makes this so important to you, and how do you envision it impacting both your life and the lives of others?`,
      category: `This sounds like it could fit into several areas of life. Which category feels most aligned with this dream?`,
      timeframe: `When you imagine this dream becoming reality, what timeframe feels both exciting and achievable to you?`
    };
    
    return `${basePrompts[phase]}

DREAM DISCOVERY TO INTAKE TRANSITION CONTEXT:
We've had a beautiful conversation about dreams and aspirations. Now we're naturally transitioning to help crystallize this dream into something concrete and actionable. Use the rich context from our discovery conversation to make this feel like a natural continuation, not a form to fill out. Be warm, encouraging, and reference specific things they've shared.

Previous conversation insights: ${context}

Keep the same empathetic, heart-centered tone while gently guiding toward this specific information we need.`;
  }, []);

  // Enhanced send message with phase-aware context
  const sendDreamDiscoveryMessage = useCallback(async (message: string) => {
    const messageStartTime = Date.now();
    
    try {
      // Log message attempt
      await dreamActivityLogger.logActivity('empathetic_dream_message_attempt', {
        message_length: message.length,
        message_number: messageCount + 1,
        context: 'empathetic_dream_discovery',
        session_id: sessionIdRef.current,
        conversation_phase: conversationPhase
      });

      // Update discovery context with user's message
      setDiscoveryContext(prev => prev + ` User shared: ${message}`);

      let prompt = '';
      
      if (conversationPhase === 'discovery') {
        // Check if we should transition to intake
        if (shouldTransitionToIntake(message, messages)) {
          setConversationPhase('intake');
          prompt = generateIntakePrompt('title', discoveryContext + ` Latest: ${message}`);
        } else {
          // Continue discovery conversation
          prompt = `${message}

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

Remember: This is a sacred conversation about dreams. Be present, be real, be deeply caring. Help me discover what truly matters to my soul.`;
        }
      } else if (conversationPhase === 'intake') {
        // Handle intake phase - determine which field we're collecting
        if (!intakeData.title) {
          prompt = generateIntakePrompt('title', discoveryContext);
        } else if (!intakeData.description) {
          prompt = generateIntakePrompt('description', discoveryContext);
        } else if (intakeData.category === 'personal_growth') {
          prompt = generateIntakePrompt('category', discoveryContext);
        } else if (intakeData.timeframe === '3 months') {
          prompt = generateIntakePrompt('timeframe', discoveryContext);
        }
      }

      console.log('🌟 Sending empathetic dream discovery message, phase:', conversationPhase);
      
      // Send only the original user message to be displayed in chat
      await sendMessage(prompt, true, message);
      
      const messageTime = Date.now() - messageStartTime;
      setMessageCount(prev => prev + 1);

      // Log successful message send
      await dreamActivityLogger.logActivity('empathetic_dream_message_sent', {
        message_time_ms: messageTime,
        enhanced_message_length: prompt.length,
        original_message_length: message.length,
        message_number: messageCount + 1,
        context: 'empathetic_dream_discovery',
        conversation_phase: conversationPhase
      });
      
    } catch (error) {
      await dreamActivityLogger.logError('empathetic_dream_message_error', {
        error: error instanceof Error ? error.message : String(error),
        message_attempt: message.substring(0, 100),
        message_number: messageCount + 1,
        context: 'empathetic_dream_discovery',
        conversation_phase: conversationPhase
      });
      
      throw error;
    }
  }, [messageCount, sendMessage, conversationPhase, shouldTransitionToIntake, messages, discoveryContext, intakeData, generateIntakePrompt]);

  // Reset conversation with empathetic dream discovery context
  const resetDreamDiscoveryConversation = useCallback(() => {
    resetConversation();
    setMessageCount(0);
    setConversationPhase('discovery');
    setIntakeData({
      title: '',
      description: '',
      category: 'personal_growth',
      timeframe: '3 months'
    });
    setDiscoveryContext('');
    sessionIdRef.current = `empathetic-dream-discovery-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    dreamActivityLogger.logActivity('empathetic_dream_conversation_reset', {
      session_id: sessionIdRef.current,
      context: 'empathetic_dream_discovery'
    });
  }, [resetConversation]);

  // Function to update intake data from AI responses
  const updateIntakeField = useCallback((field: keyof DreamIntakeData, value: string) => {
    setIntakeData(prev => ({ ...prev, [field]: value }));
    
    // Check if we have all required fields
    const updatedData = { ...intakeData, [field]: value };
    if (updatedData.title && updatedData.description && updatedData.category && updatedData.timeframe) {
      setConversationPhase('ready_for_decomposition');
    }
  }, [intakeData]);

  // Memoized session stats to prevent re-renders
  const sessionStats = useMemo(() => ({
    messageCount,
    sessionDuration: Date.now() - sessionStartTimeRef.current,
    sessionId: sessionIdRef.current,
    context: 'empathetic_dream_discovery',
    conversationPhase,
    intakeProgress: {
      title: !!intakeData.title,
      description: !!intakeData.description,
      category: intakeData.category !== 'personal_growth',
      timeframe: intakeData.timeframe !== '3 months'
    }
  }), [messageCount, conversationPhase, intakeData]);

  return {
    messages,
    isLoading,
    sendMessage: sendDreamDiscoveryMessage,
    resetConversation: resetDreamDiscoveryConversation,
    currentAgent,
    switchAgent,
    // Enhanced dream discovery features
    conversationPhase,
    intakeData,
    discoveryContext,
    updateIntakeField,
    isReadyForDecomposition: conversationPhase === 'ready_for_decomposition',
    // Debug info
    sessionStats
  };
};

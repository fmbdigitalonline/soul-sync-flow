
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useEnhancedAICoach } from "./use-enhanced-ai-coach";
import { dreamActivityLogger } from "@/services/dream-activity-logger";
import { useBlueprintData } from "./use-blueprint-data";
import { useLanguage } from "@/contexts/LanguageContext";
import { safeInterpolateTranslation } from "@/utils/translation-utils";

interface DreamIntakeData {
  title: string;
  description: string;
  category: string;
  timeframe: string;
}

interface DreamSuggestion {
  id: string;
  title: string;
  description: string;
  category: string;
  confidence: number;
  blueprintReason: string;
}

type ConversationPhase = 'blueprint_analysis' | 'suggestion_presentation' | 'exploration' | 'refinement' | 'ready_for_decomposition';

export const useBlueprintAwareDreamDiscoveryCoach = () => {
  const { messages, isLoading, sendMessage, resetConversation, currentAgent, switchAgent } = useEnhancedAICoach("guide", "dreams");
  const { blueprintData, getPersonalityTraits, getDisplayName } = useBlueprintData();
  const { t } = useLanguage();
  
  const [messageCount, setMessageCount] = useState(0);
  const [conversationPhase, setConversationPhase] = useState<ConversationPhase>('blueprint_analysis');
  const [dreamSuggestions, setDreamSuggestions] = useState<DreamSuggestion[]>([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState<DreamSuggestion | null>(null);
  const [intakeData, setIntakeData] = useState<DreamIntakeData>({
    title: '',
    description: '',
    category: 'personal_growth',
    timeframe: '3 months'
  });
  
  // Use refs for stable values
  const sessionStartTimeRef = useRef(Date.now());
  const initializedRef = useRef(false);
  const sessionIdRef = useRef(`blueprint-dream-discovery-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);

  // Generate blueprint-based dream suggestions
  const generateBlueprintSuggestions = useCallback(() => {
    if (!blueprintData) return [];

    const suggestions: DreamSuggestion[] = [];
    const mbtiType = blueprintData.cognition_mbti?.type;
    const hdType = blueprintData.energy_strategy_human_design?.type;
    const sunSign = blueprintData.archetype_western?.sun_sign;

    // Helper to get dream content translations
    const getDreamContent = (category: 'mbti' | 'humanDesign' | 'astrology', key: string) => {
      const contentKey = `dreamContent.${category}.${key}`;
      const content = t(contentKey) as any;
      // If translation returns the key itself, it means translation is not found
      if (typeof content === 'string' && content === contentKey) {
        console.warn(`Dream content translation not found for: ${contentKey}`);
        return null;
      }
      return content;
    };

    // MBTI-based suggestions
    if (mbtiType && mbtiType !== 'Unknown') {
      if (mbtiType.includes('NF')) { // Idealists
        const content = getDreamContent('mbti', 'creative-expression');
        if (content) {
          suggestions.push({
            id: 'creative-expression',
            title: content.title,
            description: content.description,
            category: 'creativity',
            confidence: 0.9,
            blueprintReason: safeInterpolateTranslation(content.blueprintReason, { mbtiType })
          });
        }
      }
      
      if (mbtiType.includes('NT')) { // Rationals
        const content = getDreamContent('mbti', 'innovative-solution');
        if (content) {
          suggestions.push({
            id: 'innovative-solution',
            title: content.title,
            description: content.description,
            category: 'career',
            confidence: 0.85,
            blueprintReason: safeInterpolateTranslation(content.blueprintReason, { mbtiType })
          });
        }
      }

      if (mbtiType.includes('SF')) { // Guardians with feeling
        const content = getDreamContent('mbti', 'community-service');
        if (content) {
          suggestions.push({
            id: 'community-service',
            title: content.title,
            description: content.description,
            category: 'relationships',
            confidence: 0.8,
            blueprintReason: safeInterpolateTranslation(content.blueprintReason, { mbtiType })
          });
        }
      }
    }

    // Human Design-based suggestions
    if (hdType && hdType !== 'Unknown') {
      if (hdType === 'Generator' || hdType === 'Manifesting Generator') {
        const content = getDreamContent('humanDesign', 'mastery-sharing');
        if (content) {
          suggestions.push({
            id: 'mastery-sharing',
            title: content.title,
            description: content.description,
            category: 'personal_growth',
            confidence: 0.8,
            blueprintReason: safeInterpolateTranslation(content.blueprintReason, { hdType })
          });
        }
      }

      if (hdType === 'Projector') {
        const content = getDreamContent('humanDesign', 'guidance-wisdom');
        if (content) {
          suggestions.push({
            id: 'guidance-wisdom',
            title: content.title,
            description: content.description,
            category: 'career',
            confidence: 0.85,
            blueprintReason: content.blueprintReason
          });
        }
      }

      if (hdType === 'Manifestor') {
        const content = getDreamContent('humanDesign', 'initiate-movement');
        if (content) {
          suggestions.push({
            id: 'initiate-movement',
            title: content.title,
            description: content.description,
            category: 'career',
            confidence: 0.9,
            blueprintReason: content.blueprintReason
          });
        }
      }
    }

    // Astrological-based suggestions
    if (sunSign && sunSign !== 'Unknown') {
      const fireSign = ['Aries', 'Leo', 'Sagittarius'].includes(sunSign);
      const waterSign = ['Cancer', 'Scorpio', 'Pisces'].includes(sunSign);

      if (fireSign) {
        const content = getDreamContent('astrology', 'leadership-inspiration');
        if (content) {
          suggestions.push({
            id: 'leadership-inspiration',
            title: content.title,
            description: content.description,
            category: 'career',
            confidence: 0.75,
            blueprintReason: safeInterpolateTranslation(content.blueprintReason, { sunSign })
          });
        }
      }

      if (waterSign) {
        const content = getDreamContent('astrology', 'healing-transformation');
        if (content) {
          suggestions.push({
            id: 'healing-transformation',
            title: content.title,
            description: content.description,
            category: 'spiritual',
            confidence: 0.8,
            blueprintReason: safeInterpolateTranslation(content.blueprintReason, { sunSign })
          });
        }
      }
    }

    // Remove duplicates and sort by confidence
    const uniqueSuggestions = suggestions.filter((suggestion, index, self) => 
      index === self.findIndex(s => s.id === suggestion.id)
    );

    return uniqueSuggestions.sort((a, b) => b.confidence - a.confidence).slice(0, 3);
  }, [blueprintData, t]);

  // Initialize with blueprint analysis
  useEffect(() => {
    if (!initializedRef.current && blueprintData) {
      console.log('🌟 Initializing blueprint-aware dream discovery coach');
      
      const suggestions = generateBlueprintSuggestions();
      setDreamSuggestions(suggestions);
      
      if (suggestions.length > 0) {
        setConversationPhase('suggestion_presentation');
      }
      
      dreamActivityLogger.logActivity('blueprint_dream_discovery_initialized', {
        session_id: sessionIdRef.current,
        blueprint_traits: getPersonalityTraits(),
        suggestions_count: suggestions.length
      });

      initializedRef.current = true;
    }
  }, [blueprintData, generateBlueprintSuggestions, getPersonalityTraits]);

  // Set agent to guide for dream discovery
  useEffect(() => {
    if (currentAgent !== "guide") {
      switchAgent("guide");
    }
  }, [currentAgent, switchAgent]);

  // Generate contextual prompts based on phase and blueprint
  const generateContextualPrompt = useCallback((userMessage: string, phase: ConversationPhase) => {
    const traits = getPersonalityTraits();
    const displayName = getDisplayName();
    const blueprintContext = traits.length > 0 ? traits.join(', ') : 'unique personality';

    const baseContext = `
BLUEPRINT-AWARE DREAM DISCOVERY CONTEXT:
You are ${displayName}'s deeply empathetic dream discovery guide who understands their unique personality blueprint.

PERSONALITY BLUEPRINT:
- Core Traits: ${blueprintContext}
- MBTI: ${blueprintData?.cognition_mbti?.type || 'Unknown'}
- Human Design: ${blueprintData?.energy_strategy_human_design?.type || 'Unknown'}
- Sun Sign: ${blueprintData?.archetype_western?.sun_sign || 'Unknown'}

CONVERSATION APPROACH:
- Reference their specific personality traits naturally in conversation
- Make personalized suggestions based on their blueprint
- Ask targeted questions that align with their personality type
- Help them see connections between their traits and potential dreams

USER MESSAGE: ${userMessage}`;

    switch (phase) {
      case 'suggestion_presentation':
        return `${baseContext}

PHASE: PRESENTING BLUEPRINT-BASED SUGGESTIONS
Present the dream suggestions I've generated based on their personality blueprint. Explain how each suggestion connects to their specific traits. Ask them which resonates most or if they'd like to explore something different.

SUGGESTIONS TO PRESENT:
${dreamSuggestions.map(s => `- ${s.title}: ${s.description} (Reason: ${s.blueprintReason})`).join('\n')}

Be warm, personalized, and help them see how their unique blueprint points toward these potential dreams.`;

      case 'exploration':
        return `${baseContext}

PHASE: EXPLORING SELECTED DREAM
They've shown interest in: ${selectedSuggestion?.title || 'a dream area'}
Ask deeper questions to understand what specifically excites them about this direction. Reference their personality traits to help them explore further.`;

      case 'refinement':
        return `${baseContext}

PHASE: REFINING DREAM INTO CONCRETE GOAL
Help them transform their dream interest into a specific, actionable goal. Use their blueprint to suggest approaches that would work well for their personality type.`;

      default:
        return `${baseContext}

Continue the empathetic dream discovery conversation, always keeping their unique personality blueprint in mind.`;
    }
  }, [blueprintData, dreamSuggestions, selectedSuggestion, getPersonalityTraits, getDisplayName]);

  // Enhanced send message with blueprint-aware context
  const sendBlueprintAwareDreamMessage = useCallback(async (message: string) => {
    const messageStartTime = Date.now();
    
    try {
      await dreamActivityLogger.logActivity('blueprint_dream_message_attempt', {
        message_length: message.length,
        message_number: messageCount + 1,
        conversation_phase: conversationPhase,
        session_id: sessionIdRef.current
      });

      // Generate contextual prompt based on current phase
      const prompt = generateContextualPrompt(message, conversationPhase);

      console.log('🌟 Sending blueprint-aware dream discovery message, phase:', conversationPhase);
      
      await sendMessage(prompt, true, message);
      
      const messageTime = Date.now() - messageStartTime;
      setMessageCount(prev => prev + 1);

      // Auto-advance phases based on conversation context
      if (conversationPhase === 'suggestion_presentation' && message.toLowerCase().includes('interested')) {
        setConversationPhase('exploration');
      } else if (conversationPhase === 'exploration' && messageCount > 3) {
        setConversationPhase('refinement');
      }

      await dreamActivityLogger.logActivity('blueprint_dream_message_sent', {
        message_time_ms: messageTime,
        message_number: messageCount + 1,
        conversation_phase: conversationPhase
      });
      
    } catch (error) {
      await dreamActivityLogger.logError('blueprint_dream_message_error', {
        error: error instanceof Error ? error.message : String(error),
        conversation_phase: conversationPhase
      });
      
      throw error;
    }
  }, [messageCount, sendMessage, conversationPhase, generateContextualPrompt]);

  // Select a dream suggestion
  const selectDreamSuggestion = useCallback((suggestion: DreamSuggestion) => {
    setSelectedSuggestion(suggestion);
    setConversationPhase('exploration');
    
    // Pre-populate intake data
    setIntakeData(prev => ({
      ...prev,
      title: suggestion.title,
      description: suggestion.description,
      category: suggestion.category
    }));
  }, []);

  // Check if ready for decomposition
  const isReadyForDecomposition = useMemo(() => {
    return conversationPhase === 'refinement' && 
           intakeData.title && 
           intakeData.description && 
           messageCount >= 4;
  }, [conversationPhase, intakeData, messageCount]);

  // Reset conversation with blueprint awareness
  const resetBlueprintDreamConversation = useCallback(() => {
    resetConversation();
    setMessageCount(0);
    setConversationPhase('blueprint_analysis');
    setDreamSuggestions([]);
    setSelectedSuggestion(null);
    setIntakeData({
      title: '',
      description: '',
      category: 'personal_growth',
      timeframe: '3 months'
    });
    sessionIdRef.current = `blueprint-dream-discovery-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    initializedRef.current = false;
    
    dreamActivityLogger.logActivity('blueprint_dream_conversation_reset', {
      session_id: sessionIdRef.current
    });
  }, [resetConversation]);

  return {
    messages,
    isLoading,
    sendMessage: sendBlueprintAwareDreamMessage,
    resetConversation: resetBlueprintDreamConversation,
    currentAgent,
    switchAgent,
    // Blueprint-aware features
    conversationPhase,
    dreamSuggestions,
    selectedSuggestion,
    selectDreamSuggestion,
    intakeData,
    isReadyForDecomposition,
    // Debug info
    sessionStats: {
      messageCount,
      sessionDuration: Date.now() - sessionStartTimeRef.current,
      sessionId: sessionIdRef.current,
      blueprintTraits: getPersonalityTraits(),
      suggestionsCount: dreamSuggestions.length
    }
  };
};

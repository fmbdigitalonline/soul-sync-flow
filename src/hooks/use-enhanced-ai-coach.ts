import { useState, useEffect, useRef } from "react";
import { enhancedAICoachService, AgentType } from "@/services/enhanced-ai-coach-service";
import { useLanguage } from "@/contexts/LanguageContext";
import { useBlueprintData } from "./use-blueprint-data";
import { useBlueprintCache } from "@/contexts/BlueprintCacheContext";
import { LayeredBlueprint } from "@/types/personality-modules";
import { useStreamingMessage } from "./use-streaming-message";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface Message {
  id: string;
  content: string;
  sender: "user" | "assistant";
  timestamp: Date;
  agentType?: AgentType;
  isStreaming?: boolean;
}

export const useEnhancedAICoach = (defaultAgent: AgentType = "guide") => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentAgent, setCurrentAgent] = useState<AgentType>(defaultAgent);
  const [currentSessionId] = useState(() => enhancedAICoachService.createNewSession(defaultAgent));
  const [authInitialized, setAuthInitialized] = useState(false);
  const [personaReady, setPersonaReady] = useState(false);
  const { language } = useLanguage();
  const { blueprintData } = useBlueprintData();
  const { blueprintData: cacheBlueprint, hasBlueprint } = useBlueprintCache();
  const { user } = useAuth();
  
  const {
    streamingContent,
    isStreaming,
    addStreamingChunk,
    startStreaming,
    completeStreaming,
    resetStreaming,
  } = useStreamingMessage();

  // Enhanced authentication and user setup with debugging
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log("🔐 Enhanced AI Coach Hook: Initializing authentication");
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          console.log("👤 Enhanced AI Coach Hook: User authenticated:", user.id);
          console.log("👤 User email:", user.email);
          await enhancedAICoachService.setCurrentUser(user.id);
          setAuthInitialized(true);
        } else {
          console.log("👤 Enhanced AI Coach Hook: No authenticated user");
          setAuthInitialized(true);
        }
      } catch (error) {
        console.error("❌ Enhanced AI Coach Hook: Auth initialization error:", error);
        setAuthInitialized(true); // Still mark as initialized to prevent blocking
      }
    };

    initializeAuth();
  }, [user]);

  // Enhanced blueprint integration with comprehensive debugging - use both sources
  useEffect(() => {
    if (!authInitialized) {
      console.log("⏳ Enhanced AI Coach Hook: Waiting for auth initialization");
      return;
    }

    // Use blueprint from cache context first, fallback to direct hook
    const activeBlueprint = cacheBlueprint || blueprintData;
    const hasBlueprintData = hasBlueprint || !!blueprintData;

    console.log("🎭 Enhanced AI Coach Hook: Blueprint Integration Debug:", {
      authInitialized,
      hasCacheBlueprintData: !!cacheBlueprint,
      hasDirectBlueprintData: !!blueprintData,
      hasBlueprint,
      activeBlueprint: !!activeBlueprint,
      user: user ? { id: user.id, email: user.email } : null
    });

    if (!hasBlueprintData || !activeBlueprint) {
      console.log("⏳ Enhanced AI Coach Hook: No blueprint data available yet");
      setPersonaReady(false);
      return;
    }

    console.log("🎭 Enhanced AI Coach Hook: Processing blueprint data for persona generation");
    console.log("🔍 ACTIVE Blueprint Data Debug:", {
      hasUserMeta: !!activeBlueprint.user_meta,
      userMeta: activeBlueprint.user_meta,
      hasCognitionMBTI: !!activeBlueprint.cognition_mbti,
      hasEnergyStrategy: !!activeBlueprint.energy_strategy_human_design,
      hasBasharSuite: !!activeBlueprint.bashar_suite,
      hasValuesLifePath: !!activeBlueprint.values_life_path,
      hasArchetypeWestern: !!activeBlueprint.archetype_western,
      hasArchetypeChinese: !!activeBlueprint.archetype_chinese,
    });
    
    try {
      // Extract user's first name from blueprint with detailed logging
      const userFirstName = activeBlueprint.user_meta?.preferred_name || 
                           activeBlueprint.user_meta?.full_name?.split(' ')[0] || 
                           null;
      
      console.log("👤 Enhanced AI Coach Hook: User name extraction:", {
        preferredName: activeBlueprint.user_meta?.preferred_name,
        fullName: activeBlueprint.user_meta?.full_name,
        extractedFirstName: userFirstName
      });

      // Convert blueprint data to LayeredBlueprint format with detailed logging
      const layeredBlueprint: Partial<LayeredBlueprint> = {
        cognitiveTemperamental: {
          mbtiType: activeBlueprint.cognition_mbti?.type || "Unknown",
          functions: activeBlueprint.cognition_mbti?.functions || [],
          dominantFunction: activeBlueprint.cognition_mbti?.dominant_function || "Unknown",
          auxiliaryFunction: activeBlueprint.cognition_mbti?.auxiliary_function || "Unknown",
          cognitiveStack: activeBlueprint.cognition_mbti?.cognitive_stack || [],
          taskApproach: activeBlueprint.cognition_mbti?.task_approach || "systematic",
          communicationStyle: activeBlueprint.cognition_mbti?.communication_style || "clear",
          decisionMaking: activeBlueprint.cognition_mbti?.decision_making || "logical",
          informationProcessing: activeBlueprint.cognition_mbti?.information_processing || "sequential",
        },
        energyDecisionStrategy: {
          humanDesignType: activeBlueprint.energy_strategy_human_design?.type || "Generator",
          authority: activeBlueprint.energy_strategy_human_design?.authority || "Sacral",
          decisionStyle: activeBlueprint.energy_strategy_human_design?.decision_style || "intuitive",
          pacing: activeBlueprint.energy_strategy_human_design?.pacing || "steady",
          energyType: activeBlueprint.energy_strategy_human_design?.energy_type || "sustainable",
          strategy: activeBlueprint.energy_strategy_human_design?.strategy || "respond",
          profile: activeBlueprint.energy_strategy_human_design?.profile || "1/3",
          centers: activeBlueprint.energy_strategy_human_design?.centers || [],
          gates: activeBlueprint.energy_strategy_human_design?.gates || [],
          channels: activeBlueprint.energy_strategy_human_design?.channels || [],
        },
        motivationBeliefEngine: {
          mindset: activeBlueprint.bashar_suite?.mindset || "growth",
          motivation: activeBlueprint.bashar_suite?.motivation || ["growth", "authenticity"],
          stateManagement: activeBlueprint.bashar_suite?.state_management || "awareness",
          coreBeliefs: activeBlueprint.bashar_suite?.core_beliefs || ["potential"],
          drivingForces: activeBlueprint.bashar_suite?.driving_forces || ["purpose"],
          excitementCompass: activeBlueprint.bashar_suite?.excitement_compass || "follow joy",
          frequencyAlignment: activeBlueprint.bashar_suite?.frequency_alignment || "authentic self",
          beliefInterface: activeBlueprint.bashar_suite?.belief_interface || [],
          resistancePatterns: activeBlueprint.bashar_suite?.resistance_patterns || [],
        },
        coreValuesNarrative: {
          lifePath: activeBlueprint.values_life_path?.lifePathNumber || activeBlueprint.values_life_path?.lifePath || 1,
          lifePathKeyword: activeBlueprint.values_life_path?.lifePathKeyword,
          expressionNumber: activeBlueprint.values_life_path?.expressionNumber,
          expressionKeyword: activeBlueprint.values_life_path?.expressionKeyword,
          soulUrgeNumber: activeBlueprint.values_life_path?.soulUrgeNumber,
          soulUrgeKeyword: activeBlueprint.values_life_path?.soulUrgeKeyword,
          personalityNumber: activeBlueprint.values_life_path?.personalityNumber,
          personalityKeyword: activeBlueprint.values_life_path?.personalityKeyword,
          birthdayNumber: activeBlueprint.values_life_path?.birthdayNumber,
          birthdayKeyword: activeBlueprint.values_life_path?.birthdayKeyword,
          meaningfulAreas: activeBlueprint.values_life_path?.meaningful_areas || ["growth"],
          anchoringVision: activeBlueprint.values_life_path?.anchoring_vision || "authentic contribution",
          lifeThemes: activeBlueprint.values_life_path?.life_themes || ["self-discovery"],
          valueSystem: activeBlueprint.values_life_path?.value_system || "integrity",
          northStar: activeBlueprint.values_life_path?.north_star || "purposeful living",
          missionStatement: activeBlueprint.values_life_path?.mission_statement || "live authentically",
          purposeAlignment: activeBlueprint.values_life_path?.purpose_alignment || "high",
        },
        publicArchetype: {
          sunSign: activeBlueprint.archetype_western?.sun_sign || "Unknown",
          moonSign: activeBlueprint.archetype_western?.moon_sign,
          risingSign: activeBlueprint.archetype_western?.rising_sign,
          socialStyle: activeBlueprint.archetype_western?.social_style || "warm",
          publicVibe: activeBlueprint.archetype_western?.public_vibe || "approachable",
          publicPersona: activeBlueprint.archetype_western?.public_persona || "genuine",
          leadershipStyle: activeBlueprint.archetype_western?.leadership_style || "collaborative",
          socialMask: activeBlueprint.archetype_western?.social_mask || "authentic",
          externalExpression: activeBlueprint.archetype_western?.external_expression || "natural",
        },
        generationalCode: {
          chineseZodiac: activeBlueprint.archetype_chinese?.animal || "Unknown",
          element: activeBlueprint.archetype_chinese?.element || "Unknown",
          cohortTint: activeBlueprint.archetype_chinese?.cohort_tint || "balanced",
          generationalThemes: activeBlueprint.archetype_chinese?.generational_themes || [],
          collectiveInfluence: activeBlueprint.archetype_chinese?.collective_influence || "moderate",
        },
        timingOverlays: {
          currentTransits: activeBlueprint.timing_overlays?.current_transits || [],
          seasonalInfluences: activeBlueprint.timing_overlays?.seasonal_influences || [],
          cyclicalPatterns: activeBlueprint.timing_overlays?.cyclical_patterns || [],
          optimalTimings: activeBlueprint.timing_overlays?.optimal_timings || [],
          energyWeather: activeBlueprint.timing_overlays?.energy_weather || "stable growth",
        },
        user_meta: {
          preferred_name: userFirstName,
          full_name: activeBlueprint.user_meta?.full_name,
          ...activeBlueprint.user_meta
        }
      };

      console.log("📊 Enhanced AI Coach Hook: Layered Blueprint created with FULL DATA:", {
        mbtiType: layeredBlueprint.cognitiveTemperamental?.mbtiType,
        humanDesignType: layeredBlueprint.energyDecisionStrategy?.humanDesignType,
        missionStatement: layeredBlueprint.coreValuesNarrative?.missionStatement,
        userName: layeredBlueprint.user_meta?.preferred_name,
        sunSign: layeredBlueprint.publicArchetype?.sunSign,
        lifePath: layeredBlueprint.coreValuesNarrative?.lifePath,
        expressionNumber: layeredBlueprint.coreValuesNarrative?.expressionNumber,
        chineseZodiac: layeredBlueprint.generationalCode?.chineseZodiac,
        hasCompleteData: true
      });

      // Update the AI service with the user's blueprint - this triggers persona regeneration
      console.log("🔄 Calling enhancedAICoachService.updateUserBlueprint with COMPLETE DATA...");
      enhancedAICoachService.updateUserBlueprint(layeredBlueprint);
      setPersonaReady(true);
      
      console.log("✅ Enhanced AI Coach Hook: Blueprint processed with COMPLETE user data and persona system ready");
    } catch (error) {
      console.error("❌ Enhanced AI Coach Hook: Blueprint processing error:", error);
      setPersonaReady(false); // Don't allow fallback if blueprint should be available
    }
  }, [authInitialized, blueprintData, cacheBlueprint, hasBlueprint]);

  // Load conversation history when component mounts or agent changes
  useEffect(() => {
    if (!authInitialized) return;
    
    const loadHistory = async () => {
      try {
        console.log("📚 Enhanced AI Coach Hook: Loading conversation history for", currentAgent);
        const history = await enhancedAICoachService.loadConversationHistory(currentAgent);
        setMessages(history);
        console.log(`✅ Enhanced AI Coach Hook: Loaded ${history.length} messages for ${currentAgent} mode`);
      } catch (error) {
        console.error("❌ Enhanced AI Coach Hook: Error loading conversation history:", error);
      }
    };

    loadHistory();
  }, [currentAgent, authInitialized]);

  // Save conversation history when messages change
  useEffect(() => {
    if (!authInitialized || messages.length === 0) return;
    
    const saveHistory = async () => {
      try {
        await enhancedAICoachService.saveConversationHistory(currentAgent, messages);
        console.log(`💾 Enhanced AI Coach Hook: Saved ${messages.length} messages for ${currentAgent} mode`);
      } catch (error) {
        console.error("❌ Enhanced AI Coach Hook: Error saving conversation history:", error);
      }
    };

    // Debounce saving to avoid excessive database calls
    const timeoutId = setTimeout(saveHistory, 1000);
    return () => clearTimeout(timeoutId);
  }, [messages, currentAgent, authInitialized]);

  const sendMessage = async (content: string, useStreaming: boolean = true) => {
    if (!content.trim()) return;

    console.log('📤 Enhanced AI Coach Hook: Sending message with BLUEPRINT ACCESS DEBUG:', {
      contentLength: content.length,
      useStreaming,
      currentAgent,
      hasBlueprint: hasBlueprint || !!blueprintData,
      personaReady,
      authInitialized,
      hasUserName: !!(cacheBlueprint?.user_meta?.preferred_name || blueprintData?.user_meta?.preferred_name),
      willUsePersona: personaReady && (hasBlueprint || !!blueprintData)
    });

    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      sender: "user",
      timestamp: new Date(),
      agentType: currentAgent,
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    resetStreaming();

    // Enhanced content for better companionship with persona integration
    const enhancedContent = currentAgent === "blend" 
      ? content // Let the persona system handle the personality for blend mode
      : currentAgent === "coach" 
        ? `${content}

Please remember to:
- Keep responses conversational and engaging using my unique personality
- Break down advice into small, actionable chunks
- Ask follow-up questions to maintain engagement
- Provide specific next steps rather than general advice
- Use encouraging and motivational language aligned with my personality blueprint
- When suggesting task breakdowns, be specific about time estimates and energy requirements`
        : content;

    if (useStreaming) {
      const assistantMessageId = (Date.now() + 1).toString();
      const assistantMessage: Message = {
        id: assistantMessageId,
        content: "",
        sender: "assistant",
        timestamp: new Date(),
        agentType: currentAgent,
        isStreaming: true,
      };

      setMessages(prev => [...prev, assistantMessage]);
      startStreaming();

      try {
        let accumulatedContent = '';
        
        console.log('📡 Enhanced AI Coach Hook: Starting streaming with FULL PERSONA INTEGRATION DEBUG...', {
          personaReady,
          hasBlueprintData: hasBlueprint || !!blueprintData,
          currentAgent,
          willUsePersona: personaReady && (hasBlueprint || !!blueprintData)
        });
        
        await enhancedAICoachService.sendStreamingMessage(
          enhancedContent,
          currentSessionId,
          personaReady && (hasBlueprint || !!blueprintData), // Use persona system when ready AND data available
          currentAgent,
          language,
          {
            onChunk: (chunk: string) => {
              accumulatedContent += chunk;
              addStreamingChunk(chunk);
              
              setMessages(prev => 
                prev.map(msg => 
                  msg.id === assistantMessageId 
                    ? { ...msg, content: accumulatedContent, isStreaming: true }
                    : msg
                )
              );
            },
            onComplete: (fullResponse: string) => {
              console.log('✅ Enhanced AI Coach Hook: Streaming complete, response length:', fullResponse.length);
              console.log('🎯 RESPONSE ANALYSIS:', {
                hasPersonalizedContent: fullResponse.includes(cacheBlueprint?.user_meta?.preferred_name || blueprintData?.user_meta?.preferred_name || ''),
                containsPersonalityTraits: fullResponse.includes('MBTI') || fullResponse.includes('Human Design') || fullResponse.includes('Life Path'),
                isGeneric: fullResponse.includes('Creating a full blueprint') || fullResponse.includes('deep dive into various facets'),
                responsePreview: fullResponse.substring(0, 200)
              });
              completeStreaming();
              setMessages(prev => 
                prev.map(msg => 
                  msg.id === assistantMessageId 
                    ? { ...msg, content: fullResponse || accumulatedContent, isStreaming: false }
                    : msg
                )
              );
              setIsLoading(false);
            },
            onError: (error: Error) => {
              console.error("❌ Enhanced AI Coach Hook: Streaming error:", error);
              completeStreaming();
              setMessages(prev => 
                prev.map(msg => 
                  msg.id === assistantMessageId 
                    ? { ...msg, content: accumulatedContent || "Sorry, there was an error. Please try again.", isStreaming: false }
                    : msg
                )
              );
              setIsLoading(false);
            }
          }
        );
      } catch (error) {
        console.error("❌ Enhanced AI Coach Hook: Error with streaming:", error);
        completeStreaming();
        setMessages(prev => 
          prev.map(msg => 
            msg.id === assistantMessageId 
              ? { ...msg, content: "Sorry, there was an error. Please try again.", isStreaming: false }
              : msg
          )
        );
        setIsLoading(false);
      }
    } else {
      handleNonStreamingMessage(enhancedContent);
    }
  };

  const handleNonStreamingMessage = async (content: string, existingMessageId?: string) => {
    try {
      console.log('📤 Enhanced AI Coach Hook: Falling back to non-streaming with persona integration');
      
      const response = await enhancedAICoachService.sendMessage(
        content,
        currentSessionId,
        personaReady && (hasBlueprint || !!blueprintData), // Use persona system when ready AND data available
        currentAgent,
        language
      );

      const assistantMessage: Message = {
        id: existingMessageId || (Date.now() + 1).toString(),
        content: response.response,
        sender: "assistant",
        timestamp: new Date(),
        agentType: currentAgent,
      };

      if (existingMessageId) {
        setMessages(prev => 
          prev.map(msg => 
            msg.id === existingMessageId ? assistantMessage : msg
          )
        );
      } else {
        setMessages(prev => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error("❌ Enhanced AI Coach Hook: Error in non-streaming fallback:", error);
      const errorMessage: Message = {
        id: existingMessageId || (Date.now() + 1).toString(),
        content: language === 'nl' ? 
          "Sorry, er is een fout opgetreden. Probeer het later opnieuw." : 
          "Sorry, there was an error. Please try again later.",
        sender: "assistant",
        timestamp: new Date(),
        agentType: currentAgent,
      };

      if (existingMessageId) {
        setMessages(prev => 
          prev.map(msg => 
            msg.id === existingMessageId ? errorMessage : msg
          )
        );
      } else {
        setMessages(prev => [...prev, errorMessage]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const resetConversation = () => {
    console.log("🔄 Enhanced AI Coach Hook: Resetting conversation");
    setMessages([]);
    enhancedAICoachService.clearConversationCache();
  };

  const switchAgent = (newAgent: AgentType) => {
    console.log("🔄 Enhanced AI Coach Hook: Switching agent from", currentAgent, "to", newAgent);
    setCurrentAgent(newAgent);
  };

  return {
    messages,
    isLoading,
    sendMessage,
    resetConversation,
    currentAgent,
    switchAgent,
    streamingContent,
    isStreaming,
    personaReady: personaReady && (hasBlueprint || !!blueprintData),
    authInitialized,
  };
};

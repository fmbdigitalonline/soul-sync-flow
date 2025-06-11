
import { useState, useEffect } from "react";
import { enhancedAICoachService, AgentType } from "@/services/enhanced-ai-coach-service";
import { useLanguage } from "@/contexts/LanguageContext";
import { useBlueprintData } from "./use-blueprint-data";
import { LayeredBlueprint } from "@/types/personality-modules";
import { useStreamingMessage } from "./use-streaming-message";
import { useJourneyTracking } from "./use-journey-tracking";

export interface Message {
  id: string;
  content: string;
  sender: "user" | "assistant";
  timestamp: Date;
  agentType?: AgentType;
  isStreaming?: boolean;
}

export const useEnhancedAICoach = (mode: AgentType = "guide") => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentSessionId] = useState(() => enhancedAICoachService.createNewSession(mode));
  const { language } = useLanguage();
  const { blueprintData } = useBlueprintData();
  const { refetch: refetchJourneys } = useJourneyTracking();
  
  const {
    streamingContent,
    isStreaming,
    addStreamingChunk,
    startStreaming,
    completeStreaming,
    resetStreaming,
  } = useStreamingMessage();

  // Load conversation history when component mounts or mode changes
  useEffect(() => {
    const loadHistory = async () => {
      const history = await enhancedAICoachService.loadConversationHistory(mode);
      setMessages(history);
    };
    
    loadHistory();
  }, [mode]);

  // Convert blueprint data to LayeredBlueprint format and update the AI service
  useEffect(() => {
    if (blueprintData) {
      console.log("Converting blueprint data for enhanced personality engine:", blueprintData);
      
      const layeredBlueprint: Partial<LayeredBlueprint> = {
        cognitiveTemperamental: {
          mbtiType: blueprintData.cognition_mbti?.type || "Unknown",
          functions: blueprintData.cognition_mbti?.functions || [],
          dominantFunction: blueprintData.cognition_mbti?.dominant_function || "Unknown",
          auxiliaryFunction: blueprintData.cognition_mbti?.auxiliary_function || "Unknown",
          cognitiveStack: blueprintData.cognition_mbti?.cognitive_stack || [],
          taskApproach: blueprintData.cognition_mbti?.task_approach || "systematic",
          communicationStyle: blueprintData.cognition_mbti?.communication_style || "clear",
          decisionMaking: blueprintData.cognition_mbti?.decision_making || "logical",
          informationProcessing: blueprintData.cognition_mbti?.information_processing || "sequential",
        },
        energyDecisionStrategy: {
          humanDesignType: blueprintData.energy_strategy_human_design?.type || "Generator",
          authority: blueprintData.energy_strategy_human_design?.authority || "Sacral",
          decisionStyle: blueprintData.energy_strategy_human_design?.decision_style || "intuitive",
          pacing: blueprintData.energy_strategy_human_design?.pacing || "steady",
          energyType: blueprintData.energy_strategy_human_design?.energy_type || "sustainable",
          strategy: blueprintData.energy_strategy_human_design?.strategy || "respond",
          profile: blueprintData.energy_strategy_human_design?.profile || "1/3",
          centers: blueprintData.energy_strategy_human_design?.centers || [],
          gates: blueprintData.energy_strategy_human_design?.gates || [],
          channels: blueprintData.energy_strategy_human_design?.channels || [],
        },
        motivationBeliefEngine: {
          mindset: blueprintData.bashar_suite?.mindset || "growth",
          motivation: blueprintData.bashar_suite?.motivation || ["growth", "authenticity"],
          stateManagement: blueprintData.bashar_suite?.state_management || "awareness",
          coreBeliefs: blueprintData.bashar_suite?.core_beliefs || ["potential"],
          drivingForces: blueprintData.bashar_suite?.driving_forces || ["purpose"],
          excitementCompass: blueprintData.bashar_suite?.excitement_compass || "follow joy",
          frequencyAlignment: blueprintData.bashar_suite?.frequency_alignment || "authentic self",
          beliefInterface: blueprintData.bashar_suite?.belief_interface || [],
          resistancePatterns: blueprintData.bashar_suite?.resistance_patterns || [],
        },
        coreValuesNarrative: {
          lifePath: blueprintData.values_life_path?.lifePathNumber || 1,
          meaningfulAreas: blueprintData.values_life_path?.meaningful_areas || ["growth"],
          anchoringVision: blueprintData.values_life_path?.anchoring_vision || "authentic contribution",
          lifeThemes: blueprintData.values_life_path?.life_themes || ["self-discovery"],
          valueSystem: blueprintData.values_life_path?.value_system || "integrity",
          northStar: blueprintData.values_life_path?.north_star || "purposeful living",
          missionStatement: blueprintData.values_life_path?.mission_statement || "live authentically",
          purposeAlignment: blueprintData.values_life_path?.purpose_alignment || "high",
        },
        publicArchetype: {
          sunSign: blueprintData.archetype_western?.sun_sign || "Unknown",
          socialStyle: blueprintData.archetype_western?.social_style || "warm",
          publicVibe: blueprintData.archetype_western?.public_vibe || "approachable",
          publicPersona: blueprintData.archetype_western?.public_persona || "genuine",
          leadershipStyle: blueprintData.archetype_western?.leadership_style || "collaborative",
          socialMask: blueprintData.archetype_western?.social_mask || "authentic",
          externalExpression: blueprintData.archetype_western?.external_expression || "natural",
        },
        generationalCode: {
          chineseZodiac: blueprintData.archetype_chinese?.animal || "Unknown",
          element: blueprintData.archetype_chinese?.element || "Unknown",
          cohortTint: blueprintData.archetype_chinese?.cohort_tint || "balanced",
          generationalThemes: blueprintData.archetype_chinese?.generational_themes || [],
          collectiveInfluence: blueprintData.archetype_chinese?.collective_influence || "moderate",
        },
        timingOverlays: {
          currentTransits: blueprintData.timing_overlays?.current_transits || [],
          seasonalInfluences: blueprintData.timing_overlays?.seasonal_influences || [],
          cyclicalPatterns: blueprintData.timing_overlays?.cyclical_patterns || [],
          optimalTimings: blueprintData.timing_overlays?.optimal_timings || [],
          energyWeather: blueprintData.timing_overlays?.energy_weather || "stable growth",
        },
      };

      enhancedAICoachService.updateUserBlueprint(layeredBlueprint);
      console.log("Updated enhanced AI service with layered blueprint");
    }
  }, [blueprintData]);

  // Save conversation history whenever messages change
  useEffect(() => {
    if (messages.length > 0) {
      enhancedAICoachService.saveConversationHistory(mode, messages);
    }
  }, [messages, mode]);

  const sendMessage = async (content: string, useStreaming: boolean = true) => {
    if (!content.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      sender: "user",
      timestamp: new Date(),
      agentType: mode,
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    resetStreaming();

    if (useStreaming) {
      const assistantMessageId = (Date.now() + 1).toString();
      const assistantMessage: Message = {
        id: assistantMessageId,
        content: "",
        sender: "assistant",
        timestamp: new Date(),
        agentType: mode,
        isStreaming: true,
      };

      setMessages(prev => [...prev, assistantMessage]);
      startStreaming();

      try {
        let accumulatedContent = '';
        
        await enhancedAICoachService.sendStreamingMessage(
          content,
          currentSessionId,
          true,
          mode,
          language,
          {
            onChunk: (chunk: string) => {
              accumulatedContent += chunk;
              addStreamingChunk(chunk);
              
              setMessages(prev => 
                prev.map(msg => 
                  msg.id === assistantMessageId 
                    ? { ...msg, content: accumulatedContent }
                    : msg
                )
              );
            },
            onComplete: (fullResponse: string) => {
              console.log('Enhanced streaming complete, full response length:', fullResponse.length);
              completeStreaming();
              setMessages(prev => 
                prev.map(msg => 
                  msg.id === assistantMessageId 
                    ? { ...msg, content: fullResponse, isStreaming: false }
                    : msg
                )
              );
              setIsLoading(false);
              // Refresh journey data after conversation
              refetchJourneys();
            },
            onError: (error: Error) => {
              console.error("Enhanced streaming error:", error);
              setMessages(prev => prev.filter(msg => msg.id !== assistantMessageId));
              handleNonStreamingMessage(content);
              completeStreaming();
            }
          }
        );
      } catch (error) {
        console.error("Error with enhanced streaming, falling back:", error);
        setMessages(prev => prev.filter(msg => msg.id !== assistantMessageId));
        handleNonStreamingMessage(content);
        completeStreaming();
      }
    } else {
      handleNonStreamingMessage(content);
    }
  };

  const handleNonStreamingMessage = async (content: string, existingMessageId?: string) => {
    try {
      const response = await enhancedAICoachService.sendMessage(
        content,
        currentSessionId,
        true,
        mode,
        language
      );

      const assistantMessage: Message = {
        id: existingMessageId || (Date.now() + 1).toString(),
        content: response.response,
        sender: "assistant",
        timestamp: new Date(),
        agentType: mode,
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

      // Refresh journey data after conversation
      refetchJourneys();
    } catch (error) {
      console.error("Error sending enhanced message:", error);
      const errorMessage: Message = {
        id: existingMessageId || (Date.now() + 1).toString(),
        content: language === 'nl' ? "Sorry, er is een fout opgetreden. Probeer het later opnieuw." : "Sorry, there was an error. Please try again later.",
        sender: "assistant",
        timestamp: new Date(),
        agentType: mode,
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
    setMessages([]);
    enhancedAICoachService.clearConversationCache();
  };

  return {
    messages,
    isLoading,
    sendMessage,
    resetConversation,
    currentAgent: mode,
    streamingContent,
    isStreaming,
  };
};

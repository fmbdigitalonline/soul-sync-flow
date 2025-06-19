
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { blueprintService, BlueprintData } from '@/services/blueprint-service';
import { useAuth } from '@/contexts/AuthContext';
import { LayeredBlueprint } from '@/types/personality-modules';

interface BlueprintCacheContextType {
  blueprintData: LayeredBlueprint | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  hasBlueprint: boolean;
}

const BlueprintCacheContext = createContext<BlueprintCacheContextType | undefined>(undefined);

export function BlueprintCacheProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  
  const {
    data: blueprintResult,
    isLoading,
    error,
    refetch: queryRefetch
  } = useQuery({
    queryKey: ['blueprint-cache', user?.id],
    queryFn: async () => {
      if (!user) return { data: null, error: 'No user' };
      
      console.log('🔍 Blueprint Cache: Fetching data for user:', user.id);
      const result = await blueprintService.getActiveBlueprintData();
      
      if (result.data) {
        console.log('✅ Blueprint Cache: Raw data received');
        // Convert raw blueprint to LayeredBlueprint format
        const layeredBlueprint = convertToLayeredBlueprint(result.data);
        console.log('🎯 Blueprint Cache: Converted to LayeredBlueprint with complete data:', {
          hasUserMeta: !!layeredBlueprint.user_meta,
          userName: layeredBlueprint.user_meta?.preferred_name,
          hasCognitive: !!layeredBlueprint.cognitiveTemperamental,
          hasEnergy: !!layeredBlueprint.energyDecisionStrategy,
          hasValues: !!layeredBlueprint.coreValuesNarrative,
          lifePath: layeredBlueprint.coreValuesNarrative?.lifePath,
          expressionNumber: layeredBlueprint.coreValuesNarrative?.expressionNumber
        });
        return { data: layeredBlueprint, error: null };
      } else {
        console.log('⚠️ Blueprint Cache: No data received, error:', result.error);
        return { data: null, error: result.error };
      }
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes - reasonable for static data
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false, // Don't refetch on focus for static data
    refetchOnMount: true,
    retry: 2,
    retryDelay: 1000
  });

  const refetch = async () => {
    console.log('🔄 Blueprint Cache: Manual refetch triggered');
    await queryRefetch();
  };

  const value: BlueprintCacheContextType = {
    blueprintData: blueprintResult?.data || null,
    loading: isLoading,
    error: blueprintResult?.error || (error as Error)?.message || null,
    refetch,
    hasBlueprint: !!blueprintResult?.data && !blueprintResult?.error
  };

  // Log state changes for debugging
  useEffect(() => {
    console.log('🎯 Blueprint Cache State Update:', {
      hasData: !!value.blueprintData,
      loading: value.loading,
      hasError: !!value.error,
      hasBlueprint: value.hasBlueprint,
      userName: value.blueprintData?.user_meta?.preferred_name,
      lifePath: value.blueprintData?.coreValuesNarrative?.lifePath
    });
  }, [value.blueprintData, value.loading, value.error, value.hasBlueprint]);

  return (
    <BlueprintCacheContext.Provider value={value}>
      {children}
    </BlueprintCacheContext.Provider>
  );
}

export function useBlueprintCache() {
  const context = useContext(BlueprintCacheContext);
  if (context === undefined) {
    throw new Error('useBlueprintCache must be used within a BlueprintCacheProvider');
  }
  return context;
}

// Helper function to convert raw blueprint to LayeredBlueprint format
function convertToLayeredBlueprint(rawData: BlueprintData): LayeredBlueprint {
  return {
    cognitiveTemperamental: {
      mbtiType: rawData.cognition_mbti?.type || rawData.mbti?.type || "Unknown",
      functions: rawData.cognition_mbti?.functions || [],
      dominantFunction: rawData.cognition_mbti?.dominant_function || "Unknown",
      auxiliaryFunction: rawData.cognition_mbti?.auxiliary_function || "Unknown",
      cognitiveStack: rawData.cognition_mbti?.cognitive_stack || [],
      taskApproach: rawData.cognition_mbti?.task_approach || "systematic",
      communicationStyle: rawData.cognition_mbti?.communication_style || "clear",
      decisionMaking: rawData.cognition_mbti?.decision_making || "logical",
      informationProcessing: rawData.cognition_mbti?.information_processing || "sequential",
    },
    energyDecisionStrategy: {
      humanDesignType: rawData.energy_strategy_human_design?.type || rawData.human_design?.type || "Generator",
      authority: rawData.energy_strategy_human_design?.authority || "Sacral",
      decisionStyle: rawData.energy_strategy_human_design?.decision_style || "intuitive",
      pacing: rawData.energy_strategy_human_design?.pacing || "steady",
      energyType: rawData.energy_strategy_human_design?.energy_type || "sustainable",
      strategy: rawData.energy_strategy_human_design?.strategy || "respond",
      profile: rawData.energy_strategy_human_design?.profile || "1/3",
      centers: rawData.energy_strategy_human_design?.centers || [],
      gates: rawData.energy_strategy_human_design?.gates || [],
      channels: rawData.energy_strategy_human_design?.channels || [],
    },
    motivationBeliefEngine: {
      mindset: rawData.bashar_suite?.mindset || "growth",
      motivation: rawData.bashar_suite?.motivation || ["growth", "authenticity"],
      stateManagement: rawData.bashar_suite?.state_management || "awareness",
      coreBeliefs: rawData.bashar_suite?.core_beliefs || ["potential"],
      drivingForces: rawData.bashar_suite?.driving_forces || ["purpose"],
      excitementCompass: rawData.bashar_suite?.excitement_compass || "follow joy",
      frequencyAlignment: rawData.bashar_suite?.frequency_alignment || "authentic self",
      beliefInterface: rawData.bashar_suite?.belief_interface || [],
      resistancePatterns: rawData.bashar_suite?.resistance_patterns || [],
    },
    coreValuesNarrative: {
      lifePath: rawData.values_life_path?.lifePathNumber || rawData.values_life_path?.lifePath || rawData.numerology?.lifePathNumber || 1,
      lifePathKeyword: rawData.values_life_path?.lifePathKeyword,
      expressionNumber: rawData.values_life_path?.expressionNumber || rawData.numerology?.expressionNumber,
      expressionKeyword: rawData.values_life_path?.expressionKeyword,
      soulUrgeNumber: rawData.values_life_path?.soulUrgeNumber || rawData.numerology?.soulUrgeNumber,
      soulUrgeKeyword: rawData.values_life_path?.soulUrgeKeyword,
      personalityNumber: rawData.values_life_path?.personalityNumber || rawData.numerology?.personalityNumber,
      personalityKeyword: rawData.values_life_path?.personalityKeyword,
      birthdayNumber: rawData.values_life_path?.birthdayNumber || rawData.numerology?.birthdayNumber,
      birthdayKeyword: rawData.values_life_path?.birthdayKeyword,
      meaningfulAreas: rawData.values_life_path?.meaningful_areas || ["growth"],
      anchoringVision: rawData.values_life_path?.anchoring_vision || "authentic contribution",
      lifeThemes: rawData.values_life_path?.life_themes || ["self-discovery"],
      valueSystem: rawData.values_life_path?.value_system || "integrity",
      northStar: rawData.values_life_path?.north_star || "purposeful living",
      missionStatement: rawData.values_life_path?.mission_statement || "live authentically",
      purposeAlignment: rawData.values_life_path?.purpose_alignment || "high",
    },
    publicArchetype: {
      sunSign: rawData.archetype_western?.sun_sign || rawData.astrology?.sun_sign || "Unknown",
      moonSign: rawData.archetype_western?.moon_sign || rawData.astrology?.moon_sign,
      risingSign: rawData.archetype_western?.rising_sign || rawData.astrology?.rising_sign,
      socialStyle: rawData.archetype_western?.social_style || "warm",
      publicVibe: rawData.archetype_western?.public_vibe || "approachable",
      publicPersona: rawData.archetype_western?.public_persona || "genuine",
      leadershipStyle: rawData.archetype_western?.leadership_style || "collaborative",
      socialMask: rawData.archetype_western?.social_mask || "authentic",
      externalExpression: rawData.archetype_western?.external_expression || "natural",
    },
    generationalCode: {
      chineseZodiac: rawData.archetype_chinese?.animal || "Unknown",
      element: rawData.archetype_chinese?.element || "Unknown",
      cohortTint: rawData.archetype_chinese?.cohort_tint || "balanced",
      generationalThemes: rawData.archetype_chinese?.generational_themes || [],
      collectiveInfluence: rawData.archetype_chinese?.collective_influence || "moderate",
    },
    timingOverlays: {
      currentTransits: rawData.timing_overlays?.current_transits || [],
      seasonalInfluences: rawData.timing_overlays?.seasonal_influences || [],
      cyclicalPatterns: rawData.timing_overlays?.cyclical_patterns || [],
      optimalTimings: rawData.timing_overlays?.optimal_timings || [],
      energyWeather: rawData.timing_overlays?.energy_weather || "stable growth",
    },
    user_meta: {
      preferred_name: rawData.user_meta?.preferred_name,
      full_name: rawData.user_meta?.full_name,
      ...rawData.user_meta
    },
    // Auto-generated components - will be enhanced later
    humorProfile: {
      primaryStyle: 'warm-nurturer',
      intensity: 'moderate',
      appropriatenessLevel: 'balanced',
      contextualAdaptation: {
        coaching: 'warm-nurturer',
        guidance: 'warm-nurturer',
        casual: 'warm-nurturer'
      },
      avoidancePatterns: [],
      signatureElements: []
    },
    voiceTokens: {
      pacing: {
        sentenceLength: 'medium',
        pauseFrequency: 'thoughtful',
        rhythmPattern: 'steady'
      },
      expressiveness: {
        emojiFrequency: 'occasional',
        emphasisStyle: 'subtle',
        exclamationTendency: 'balanced'
      },
      vocabulary: {
        formalityLevel: 'conversational',
        metaphorUsage: 'occasional',
        technicalDepth: 'balanced'
      },
      conversationStyle: {
        questionAsking: 'supportive',
        responseLength: 'thorough',
        personalSharing: 'warm'
      },
      signaturePhrases: [],
      greetingStyles: [],
      transitionWords: []
    },
    // Required fields with defaults
    surfaceExpression: {
      observableStyle: "authentic",
      realWorldImpact: "positive",
      behavioralSignatures: [],
      externalManifestations: []
    },
    marketingArchetype: {
      messagingStyle: "authentic",
      socialHooks: [],
      brandPersonality: "genuine",
      communicationPatterns: [],
      influenceStyle: "collaborative"
    },
    goalPersona: {
      currentMode: 'blend',
      serviceRole: "supportive guide",
      coachingTone: "encouraging",
      nudgeStyle: "gentle",
      motivationApproach: "intrinsic"
    },
    interactionPreferences: {
      rapportStyle: "warm",
      storyPreference: "personal",
      empathyLevel: "high",
      conflictStyle: "collaborative",
      collaborationStyle: "supportive",
      feedbackStyle: "constructive",
      learningStyle: "experiential"
    },
    proactiveContext: {
      nudgeHistory: [],
      taskGraph: {},
      streaks: {},
      moodLog: [],
      recentPatterns: [],
      triggerEvents: []
    }
  };
}

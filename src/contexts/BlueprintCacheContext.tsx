
import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
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
  
  // Memoize query key to prevent unnecessary re-renders
  const queryKey = useMemo(() => ['blueprint-cache', user?.id], [user?.id]);
  
  const {
    data: blueprintResult,
    isLoading,
    error,
    refetch: queryRefetch
  } = useQuery({
    queryKey,
    queryFn: async () => {
      if (!user) return { data: null, error: 'No user' };
      
      console.log('🔍 Blueprint Cache: Fetching data for user:', user.id);
      const result = await blueprintService.getActiveBlueprintData();
      
      if (result.data) {
        console.log('✅ Blueprint Cache: Raw data received');
        console.log('🔬 RAW BLUEPRINT DATA STRUCTURE:', JSON.stringify(result.data, null, 2));
        
        // Convert raw blueprint to LayeredBlueprint format
        const layeredBlueprint = convertBlueprintToLayered(result.data);
        console.log('🎯 Blueprint Cache: Converted to LayeredBlueprint');
        console.log('📊 CONVERTED BLUEPRINT SAMPLE:', {
          hasUserMeta: !!layeredBlueprint.user_meta,
          userName: layeredBlueprint.user_meta?.preferred_name,
          hasCognitive: !!layeredBlueprint.cognitiveTemperamental,
          mbtiType: layeredBlueprint.cognitiveTemperamental?.mbtiType,
          hasEnergy: !!layeredBlueprint.energyDecisionStrategy,
          hdType: layeredBlueprint.energyDecisionStrategy?.humanDesignType,
          hasValues: !!layeredBlueprint.coreValuesNarrative,
          lifePath: layeredBlueprint.coreValuesNarrative?.lifePath,
          hasArchetype: !!layeredBlueprint.publicArchetype,
          sunSign: layeredBlueprint.publicArchetype?.sunSign
        });
        
        return { data: layeredBlueprint, error: null };
      } else {
        console.log('⚠️ Blueprint Cache: No data received, error:', result.error);
        return { data: null, error: result.error };
      }
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    retry: 2,
    retryDelay: 1000
  });

  const refetch = async () => {
    console.log('🔄 Blueprint Cache: Manual refetch triggered');
    await queryRefetch();
  };

  // Memoize the context value to prevent unnecessary re-renders
  const value: BlueprintCacheContextType = useMemo(() => ({
    blueprintData: blueprintResult?.data || null,
    loading: isLoading,
    error: blueprintResult?.error || (error as Error)?.message || null,
    refetch,
    hasBlueprint: !!blueprintResult?.data && !blueprintResult?.error
  }), [blueprintResult, isLoading, error, refetch]);

  // Log state changes for debugging
  useEffect(() => {
    console.log('🎯 Blueprint Cache State Update:', {
      hasData: !!value.blueprintData,
      loading: value.loading,
      hasError: !!value.error,
      hasBlueprint: value.hasBlueprint,
      userName: value.blueprintData?.user_meta?.preferred_name,
      lifePath: value.blueprintData?.coreValuesNarrative?.lifePath,
      mbtiType: value.blueprintData?.cognitiveTemperamental?.mbtiType,
      sunSign: value.blueprintData?.publicArchetype?.sunSign
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
const convertBlueprintToLayered = (data: BlueprintData): LayeredBlueprint => {
  console.log('🔧 Converting raw data to LayeredBlueprint...');
  console.log('🗂️ Raw data keys available:', Object.keys(data));
  
  // Handle user_meta with proper type checking and type assertion
  const userMeta = data.user_meta || {};
  const safeUserMeta = typeof userMeta === 'object' && userMeta !== null ? userMeta as any : {};
  
  // Handle MBTI data - check multiple possible sources
  const mbtiData = data.cognition_mbti || data.mbti || data.personality || {};
  let mbtiType = "Unknown";
  
  // Extract MBTI type from user personality data if available
  if (safeUserMeta.personality) {
    // Check if personality is an object with likelyType property
    if (typeof safeUserMeta.personality === 'object' && safeUserMeta.personality !== null) {
      const personalityObj = safeUserMeta.personality as any;
      if (personalityObj.likelyType) {
        mbtiType = personalityObj.likelyType;
        console.log('🎯 Using MBTI from user personality object:', mbtiType);
      }
    } else if (typeof safeUserMeta.personality === 'string') {
      // If it's a string, use it directly
      mbtiType = safeUserMeta.personality;
      console.log('🎯 Using MBTI from user personality string:', mbtiType);
    }
  } else if (mbtiData?.type) {
    mbtiType = mbtiData.type;
    console.log('🎯 Using MBTI from cognition_mbti:', mbtiType);
  }
  
  // Extract other data sections
  const hdData = data.energy_strategy_human_design || data.human_design || {};
  const numerologyData = data.values_life_path || data.numerology || {};
  const westernAstroData = data.archetype_western || data.astrology || {};
  const chineseAstroData = data.archetype_chinese || {};
  
  console.log('🔍 Data extraction results:', {
    mbtiType,
    hdType: hdData?.type || hdData?.design_type || hdData?.humanDesignType || "Generator",
    lifePath: numerologyData?.life_path_number || numerologyData?.lifePathNumber || numerologyData?.lifePath || 1,
    sunSign: westernAstroData?.sun_sign || westernAstroData?.sunSign || westernAstroData?.sun || "Unknown",
    chineseAnimal: chineseAstroData?.animal || "Unknown"
  });

  const converted = {
    cognitiveTemperamental: {
      mbtiType: mbtiType,
      functions: mbtiData?.functions || [],
      dominantFunction: mbtiData?.dominant_function || mbtiData?.dominantFunction || "Unknown",
      auxiliaryFunction: mbtiData?.auxiliary_function || mbtiData?.auxiliaryFunction || "Unknown",
      cognitiveStack: mbtiData?.cognitive_stack || mbtiData?.cognitiveStack || [],
      taskApproach: mbtiData?.task_approach || mbtiData?.taskApproach || "systematic",
      communicationStyle: mbtiData?.communication_style || mbtiData?.communicationStyle || "clear",
      decisionMaking: mbtiData?.decision_making || mbtiData?.decisionMaking || "logical",
      informationProcessing: mbtiData?.information_processing || mbtiData?.informationProcessing || "sequential",
    },
    energyDecisionStrategy: {
      humanDesignType: hdData?.type || hdData?.design_type || hdData?.humanDesignType || "Generator",
      authority: hdData?.authority || hdData?.inner_authority || "Sacral",
      decisionStyle: hdData?.decision_style || hdData?.decisionStyle || "intuitive",
      pacing: hdData?.pacing || "steady",
      energyType: hdData?.energy_type || hdData?.energyType || "sustainable",
      strategy: hdData?.strategy || "respond",
      profile: hdData?.profile || "1/3",
      centers: hdData?.centers || [],
      gates: hdData?.gates || [],
      channels: hdData?.channels || [],
    },
    motivationBeliefEngine: {
      coreBeliefs: data.bashar_suite?.mindset || [],
      motivationalDrivers: data.bashar_suite?.motivation || [],
      beliefPatterns: data.bashar_suite?.stateManagement || [],
      motivationTriggers: data.bashar_suite?.drivingForces || [],
      resistancePoints: data.bashar_suite?.resistancePatterns || [],
      empowermentSources: data.bashar_suite?.excitementCompass || []
    },
    coreValuesNarrative: {
      lifePath: numerologyData?.life_path_number || numerologyData?.lifePathNumber || numerologyData?.lifePath || 1,
      lifePathKeyword: numerologyData?.life_path_keyword || numerologyData?.lifePathKeyword,
      expressionNumber: numerologyData?.expression_number || numerologyData?.expressionNumber,
      expressionKeyword: numerologyData?.expression_keyword || numerologyData?.expressionKeyword,
      soulUrgeNumber: numerologyData?.soul_urge_number || numerologyData?.soulUrgeNumber,
      soulUrgeKeyword: numerologyData?.soul_urge_keyword || numerologyData?.soulUrgeKeyword,
      personalityNumber: numerologyData?.personality_number || numerologyData?.personalityNumber,
      personalityKeyword: numerologyData?.personality_keyword || numerologyData?.personalityKeyword,
      birthdayNumber: numerologyData?.birthday_number || numerologyData?.birthdayNumber || 1,
      birthdayKeyword: numerologyData?.birthday_keyword || numerologyData?.birthdayKeyword || 'Pioneer',
      meaningfulAreas: numerologyData?.meaningful_areas || ["growth"],
      anchoringVision: numerologyData?.anchoring_vision || "authentic contribution",
      lifeThemes: numerologyData?.life_themes || ["self-discovery"],
      valueSystem: numerologyData?.value_system || "integrity",
      northStar: numerologyData?.north_star || "purposeful living",
      missionStatement: numerologyData?.mission_statement || "live authentically",
      purposeAlignment: numerologyData?.purpose_alignment || "high",
    },
    publicArchetype: {
      sunSign: westernAstroData?.sun_sign || westernAstroData?.sunSign || westernAstroData?.sun || "Unknown",
      moonSign: westernAstroData?.moon_sign || westernAstroData?.moonSign || westernAstroData?.moon,
      risingSign: westernAstroData?.rising_sign || westernAstroData?.risingSign || westernAstroData?.rising,
      socialStyle: westernAstroData?.social_style || westernAstroData?.socialStyle || "warm",
      publicVibe: westernAstroData?.public_vibe || westernAstroData?.publicVibe || "approachable",
      publicPersona: westernAstroData?.public_persona || westernAstroData?.publicPersona || "genuine",
      leadershipStyle: westernAstroData?.leadership_style || westernAstroData?.leadershipStyle || "collaborative",
      socialMask: westernAstroData?.social_mask || westernAstroData?.socialMask || "authentic",
      externalExpression: westernAstroData?.external_expression || westernAstroData?.externalExpression || "natural",
    },
    generationalCode: {
      chineseZodiac: chineseAstroData?.animal || chineseAstroData?.zodiac_animal || chineseAstroData?.sign || "Unknown",
      element: chineseAstroData?.element || "Unknown",
      cohortTint: chineseAstroData?.cohort_tint || chineseAstroData?.cohortTint || "balanced",
      generationalThemes: chineseAstroData?.generational_themes || chineseAstroData?.generationalThemes || [],
      collectiveInfluence: chineseAstroData?.collective_influence || chineseAstroData?.collectiveInfluence || "moderate",
    },
    timingOverlays: {
      currentTransits: data.timing_overlays?.current_transits || [],
      seasonalInfluences: data.timing_overlays?.seasonal_influences || [],
      cyclicalPatterns: data.timing_overlays?.cyclical_patterns || [],
      optimalTimings: data.timing_overlays?.optimal_timings || [],
      energyWeather: data.timing_overlays?.energy_weather || "stable growth",
    },
    user_meta: {
      preferred_name: safeUserMeta.preferred_name as any,
      full_name: safeUserMeta.full_name,
      ...safeUserMeta
    },
    humorProfile: {
      primaryStyle: 'warm-nurturer' as const,
      intensity: 'moderate' as const,
      appropriatenessLevel: 'balanced' as const,
      contextualAdaptation: {
        coaching: 'warm-nurturer' as const,
        guidance: 'warm-nurturer' as const,
        casual: 'warm-nurturer' as const
      },
      avoidancePatterns: [],
      signatureElements: []
    },
    voiceTokens: {
      pacing: {
        sentenceLength: 'medium' as const,
        pauseFrequency: 'thoughtful' as const,
        rhythmPattern: 'steady' as const
      },
      expressiveness: {
        emojiFrequency: 'occasional' as const,
        emphasisStyle: 'subtle' as const,
        exclamationTendency: 'balanced' as const
      },
      vocabulary: {
        formalityLevel: 'conversational' as const,
        metaphorUsage: 'occasional' as const,
        technicalDepth: 'balanced' as const
      },
      conversationStyle: {
        questionAsking: 'supportive' as const,
        responseLength: 'thorough' as const,
        personalSharing: 'warm' as const
      },
      signaturePhrases: [],
      greetingStyles: [],
      transitionWords: []
    },
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
      currentMode: 'blend' as const,
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

  console.log('✅ Conversion complete. Final validation:', {
    mbtiType: converted.cognitiveTemperamental.mbtiType,
    hdType: converted.energyDecisionStrategy.humanDesignType,
    lifePath: converted.coreValuesNarrative.lifePath,
    sunSign: converted.publicArchetype.sunSign,
    chineseZodiac: converted.generationalCode.chineseZodiac,
    userName: converted.user_meta.preferred_name,
    hasValidData: converted.cognitiveTemperamental.mbtiType !== "Unknown" ||
                  converted.energyDecisionStrategy.humanDesignType !== "Generator" ||
                  converted.publicArchetype.sunSign !== "Unknown"
  });

  return converted;
};

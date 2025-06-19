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
        console.log('🔬 RAW BLUEPRINT DATA STRUCTURE:', JSON.stringify(result.data, null, 2));
        
        // Log all top-level keys to understand the structure
        console.log('📋 Available top-level keys:', Object.keys(result.data));
        
        // Log specific sections we're interested in
        console.log('🧠 MBTI Section:', result.data.cognition_mbti || result.data.mbti || 'NOT FOUND');
        console.log('⚡ Human Design Section:', result.data.energy_strategy_human_design || result.data.human_design || 'NOT FOUND');
        console.log('🔢 Numerology Section:', result.data.values_life_path || result.data.numerology || 'NOT FOUND');
        console.log('🌟 Western Astrology Section:', result.data.archetype_western || result.data.astrology || 'NOT FOUND');
        console.log('🐉 Chinese Astrology Section:', result.data.archetype_chinese || 'NOT FOUND');
        console.log('👤 User Meta Section:', result.data.user_meta || 'NOT FOUND');
        
        // Convert raw blueprint to LayeredBlueprint format
        const layeredBlueprint = convertToLayeredBlueprint(result.data);
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
          expressionNumber: layeredBlueprint.coreValuesNarrative?.expressionNumber,
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
function convertToLayeredBlueprint(rawData: BlueprintData): LayeredBlueprint {
  console.log('🔧 Converting raw data to LayeredBlueprint...');
  
  // Try multiple possible paths for each data type
  const mbtiData = rawData.cognition_mbti || rawData.mbti || rawData.personality || {};
  const hdData = rawData.energy_strategy_human_design || rawData.human_design || rawData.humanDesign || {};
  const numerologyData = rawData.values_life_path || rawData.numerology || rawData.lifePathData || {};
  const westernAstroData = rawData.archetype_western || rawData.astrology || rawData.westernAstrology || {};
  const chineseAstroData = rawData.archetype_chinese || rawData.chineseAstrology || {};
  
  console.log('🔍 Data extraction results:', {
    mbtiData: mbtiData ? Object.keys(mbtiData) : 'NO MBTI DATA',
    hdData: hdData ? Object.keys(hdData) : 'NO HD DATA',
    numerologyData: numerologyData ? Object.keys(numerologyData) : 'NO NUMEROLOGY DATA',
    westernAstroData: westernAstroData ? Object.keys(westernAstroData) : 'NO WESTERN ASTRO DATA',
    chineseAstroData: chineseAstroData ? Object.keys(chineseAstroData) : 'NO CHINESE ASTRO DATA'
  });

  const converted = {
    cognitiveTemperamental: {
      mbtiType: mbtiData?.type || mbtiData?.mbti_type || mbtiData?.personality_type || "Unknown",
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
      lifePath: numerologyData?.life_path_number || numerologyData?.lifePathNumber || numerologyData?.lifePath || 1,
      lifePathKeyword: numerologyData?.life_path_keyword || numerologyData?.lifePathKeyword,
      expressionNumber: numerologyData?.expression_number || numerologyData?.expressionNumber,
      expressionKeyword: numerologyData?.expression_keyword || numerologyData?.expressionKeyword,
      soulUrgeNumber: numerologyData?.soul_urge_number || numerologyData?.soulUrgeNumber,
      soulUrgeKeyword: numerologyData?.soul_urge_keyword || numerologyData?.soulUrgeKeyword,
      personalityNumber: numerologyData?.personality_number || numerologyData?.personalityNumber,
      personalityKeyword: numerologyData?.personality_keyword || numerologyData?.personalityKeyword,
      birthdayNumber: numerologyData?.birthday_number || numerologyData?.birthdayNumber,
      birthdayKeyword: numerologyData?.birthday_keyword || numerologyData?.birthdayKeyword,
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
      currentTransits: rawData.timing_overlays?.current_transits || [],
      seasonalInfluences: rawData.timing_overlays?.seasonal_influences || [],
      cyclicalPatterns: rawData.timing_overlays?.cyclical_patterns || [],
      optimalTimings: rawData.timing_overlays?.optimal_timings || [],
      energyWeather: rawData.timing_overlays?.energy_weather || "stable growth",
    },
    user_meta: {
      preferred_name: rawData.user_meta?.preferred_name || rawData.user_meta?.name || rawData.preferred_name,
      full_name: rawData.user_meta?.full_name || rawData.user_meta?.fullName || rawData.full_name,
      ...rawData.user_meta
    },
    
    // ... keep existing code (auto-generated components with defaults)
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

  console.log('✅ Conversion complete. Final values check:', {
    mbtiType: converted.cognitiveTemperamental.mbtiType,
    hdType: converted.energyDecisionStrategy.humanDesignType,
    lifePath: converted.coreValuesNarrative.lifePath,
    sunSign: converted.publicArchetype.sunSign,
    chineseZodiac: converted.generationalCode.chineseZodiac,
    userName: converted.user_meta.preferred_name
  });

  return converted;
}

import { useState, useEffect } from 'react';
import { soulSyncService } from '@/services/soul-sync-service';
import { enhancedAICoachService } from '@/services/enhanced-ai-coach-service';
import { useBlueprintCache } from '@/contexts/BlueprintCacheContext';
import { useAuth } from '@/contexts/AuthContext';

export function useSoulSync() {
  const { user } = useAuth();
  const { blueprintData, hasBlueprint } = useBlueprintCache();
  const [isSoulSyncReady, setIsSoulSyncReady] = useState(false);
  const [soulSyncError, setSoulSyncError] = useState<string | null>(null);

  useEffect(() => {
    const initializeSoulSync = async () => {
      if (!user || !blueprintData) {
        setIsSoulSyncReady(false);
        return;
      }

      try {
        console.log("🔄 SoulSync: Initializing with comprehensive blueprint extraction");
        
        // Map blueprint data with ALL available fields
        const layeredBlueprint = mapToLayeredBlueprint(blueprintData);
        
        console.log("🎯 SoulSync: Complete blueprint mapped:", {
          mbtiType: layeredBlueprint.cognitiveTemperamental?.mbtiType,
          hdType: layeredBlueprint.energyDecisionStrategy?.humanDesignType,
          authority: layeredBlueprint.energyDecisionStrategy?.authority,
          profile: layeredBlueprint.energyDecisionStrategy?.profile,
          sunSign: layeredBlueprint.publicArchetype?.sunSign,
          moonSign: layeredBlueprint.publicArchetype?.moonSign,
          risingSign: layeredBlueprint.publicArchetype?.risingSign,
          lifePath: layeredBlueprint.coreValuesNarrative?.lifePath,
          expressionNumber: layeredBlueprint.coreValuesNarrative?.expressionNumber,
          soulUrgeNumber: layeredBlueprint.coreValuesNarrative?.soulUrgeNumber,
          personalityNumber: layeredBlueprint.coreValuesNarrative?.personalityNumber,
          birthdayNumber: layeredBlueprint.coreValuesNarrative?.birthdayNumber,
          userName: layeredBlueprint.user_meta?.preferred_name
        });

        // Update both services with complete blueprint data
        enhancedAICoachService.updateUserBlueprint(layeredBlueprint);
        await enhancedAICoachService.setCurrentUser(user.id);
        
        setIsSoulSyncReady(true);
        setSoulSyncError(null);
        console.log("✅ SoulSync: Complete blueprint system ready");
      } catch (error) {
        console.error("❌ SoulSync: Initialization error:", error);
        setSoulSyncError(error instanceof Error ? error.message : 'Unknown error');
        setIsSoulSyncReady(false);
      }
    };

    initializeSoulSync();
  }, [user, blueprintData]);

  return {
    isSoulSyncReady: isSoulSyncReady && hasBlueprint,
    soulSyncError,
    hasBlueprint,
    blueprintData
  };
}

// Enhanced comprehensive data mapping function
function mapToLayeredBlueprint(blueprintData: any) {
  console.log("🗺️ Mapping complete blueprint data to LayeredBlueprint structure");
  
  // Extract comprehensive data from the actual blueprint structure
  const mbtiType = blueprintData?.user_meta?.personality?.likelyType || 'Unknown';
  const mbtiProbabilities = blueprintData?.user_meta?.personality?.mbtiProbabilities || {};
  const bigFive = blueprintData?.user_meta?.personality?.bigFive || {};
  const description = blueprintData?.user_meta?.personality?.description || '';
  
  const hdType = blueprintData?.energy_strategy_human_design?.type || 'Unknown';
  const hdAuthority = blueprintData?.energy_strategy_human_design?.authority || 'Unknown';
  const hdStrategy = blueprintData?.energy_strategy_human_design?.strategy || 'Unknown';
  const hdProfile = blueprintData?.energy_strategy_human_design?.profile || 'Unknown';
  const hdDefinition = blueprintData?.energy_strategy_human_design?.definition || 'Unknown';
  const hdNotSelfTheme = blueprintData?.energy_strategy_human_design?.not_self_theme || 'Unknown';
  const hdGates = blueprintData?.energy_strategy_human_design?.gates || [];
  const hdChannels = blueprintData?.energy_strategy_human_design?.channels || [];
  const hdCenters = blueprintData?.energy_strategy_human_design?.centers || [];
  
  const sunSign = blueprintData?.archetype_western?.sun_sign || 'Unknown';
  const moonSign = blueprintData?.archetype_western?.moon_sign || 'Unknown';
  const risingSign = blueprintData?.archetype_western?.rising_sign || 'Unknown';
  const sunKeyword = blueprintData?.archetype_western?.sun_keyword || '';
  const moonKeyword = blueprintData?.archetype_western?.moon_keyword || '';
  
  const chineseAnimal = blueprintData?.archetype_chinese?.animal || 'Unknown';
  const chineseElement = blueprintData?.archetype_chinese?.element || 'Unknown';
  const chineseYinYang = blueprintData?.archetype_chinese?.yin_yang || 'Unknown';
  const chineseKeyword = blueprintData?.archetype_chinese?.keyword || '';
  
  // Comprehensive numerology extraction
  const lifePath = Number(blueprintData?.values_life_path?.life_path_number ?? 0);
  const expressionNumber = Number(blueprintData?.values_life_path?.expression_number ?? 0);
  const soulUrgeNumber = Number(blueprintData?.values_life_path?.soul_urge_number ?? 0);
  const personalityNumber = Number(blueprintData?.values_life_path?.personality_number ?? 0);
  const birthdayNumber = Number(blueprintData?.values_life_path?.birthday_number ?? 0);
  const lifePathKeyword = blueprintData?.values_life_path?.life_path_keyword || '';
  const expressionKeyword = blueprintData?.values_life_path?.expression_keyword || '';
  const soulUrgeKeyword = blueprintData?.values_life_path?.soul_urge_keyword || '';
  const personalityKeyword = blueprintData?.values_life_path?.personality_keyword || '';
  const birthdayKeyword = blueprintData?.values_life_path?.birthday_keyword || '';
  
  // Bashar Suite extraction
  const basharBeliefInterface = blueprintData?.bashar_suite?.belief_interface || {};
  const basharExcitementCompass = blueprintData?.bashar_suite?.excitement_compass || {};
  const basharFrequencyAlignment = blueprintData?.bashar_suite?.frequency_alignment || {};
  
  // Goal Stack extraction
  const goalStack = blueprintData?.goal_stack || {};
  const primaryGoal = goalStack?.primary_goal || '';
  const timeHorizon = goalStack?.time_horizon || '';
  const supportStyle = goalStack?.support_style || '';
  
  const preferredName = blueprintData?.user_meta?.preferred_name || 'Unknown';
  
  console.log("📊 Extracted comprehensive data:", {
    mbtiType, mbtiProbabilities, bigFive, description,
    hdType, hdAuthority, hdStrategy, hdProfile, hdDefinition, hdNotSelfTheme,
    sunSign, moonSign, risingSign, sunKeyword, moonKeyword,
    chineseAnimal, chineseElement, chineseYinYang, chineseKeyword,
    lifePath, expressionNumber, soulUrgeNumber, personalityNumber, birthdayNumber,
    lifePathKeyword, expressionKeyword, soulUrgeKeyword, personalityKeyword, birthdayKeyword,
    basharBeliefInterface, basharExcitementCompass, basharFrequencyAlignment,
    primaryGoal, timeHorizon, supportStyle,
    preferredName
  });
  
  return {
    user_meta: {
      ...blueprintData.user_meta,
      personality: {
        likelyType: mbtiType,
        description: description,
        mbtiProbabilities: mbtiProbabilities,
        bigFive: bigFive
      }
    },
    cognitiveTemperamental: {
      mbtiType: mbtiType,
      mbtiProbabilities: mbtiProbabilities,
      bigFive: bigFive,
      description: description,
      functions: [],
      dominantFunction: getMBTIFunctions(mbtiType).dominant,
      auxiliaryFunction: getMBTIFunctions(mbtiType).auxiliary,
      cognitiveStack: [],
      taskApproach: 'balanced',
      communicationStyle: 'adaptive',
      decisionMaking: 'analytical',
      informationProcessing: 'sequential',
      coreKeywords: extractKeywords(description)
    },
    energyDecisionStrategy: {
      humanDesignType: hdType,
      authority: hdAuthority,
      strategy: hdStrategy,
      profile: hdProfile,
      definition: hdDefinition,
      notSelfTheme: hdNotSelfTheme,
      decisionStyle: 'intuitive',
      pacing: 'steady',
      energyType: 'sustainable',
      centers: hdCenters,
      gates: hdGates,
      channels: hdChannels
    },
    publicArchetype: {
      sunSign: cleanAstrologySign(sunSign),
      moonSign: cleanAstrologySign(moonSign),
      risingSign: cleanAstrologySign(risingSign),
      sunKeyword: sunKeyword,
      moonKeyword: moonKeyword,
      socialStyle: 'authentic',
      publicVibe: 'approachable',
      publicPersona: 'genuine',
      leadershipStyle: 'collaborative',
      socialMask: 'minimal',
      externalExpression: 'natural'
    },
    coreValuesNarrative: {
      lifePath: lifePath,
      lifePathKeyword: lifePathKeyword,
      expressionNumber: expressionNumber,
      expressionKeyword: expressionKeyword,
      soulUrgeNumber: soulUrgeNumber,
      soulUrgeKeyword: soulUrgeKeyword,
      personalityNumber: personalityNumber,
      personalityKeyword: personalityKeyword,
      birthdayNumber: birthdayNumber,
      birthdayKeyword: birthdayKeyword,
      meaningfulAreas: blueprintData.values_life_path?.meaningful_areas || [],
      anchoringVision: 'personal growth',
      lifeThemes: blueprintData.values_life_path?.themes || [],
      valueSystem: 'integrity-based',
      northStar: 'authentic living',
      missionStatement: blueprintData.values_life_path?.mission_statement || 'Live authentically',
      purposeAlignment: 'high',
      core_values: blueprintData.values_life_path?.core_values || []
    },
    generationalCode: {
      chineseZodiac: chineseAnimal,
      element: chineseElement,
      yinYang: chineseYinYang,
      keyword: chineseKeyword,
      cohortTint: 'optimistic',
      generationalThemes: [],
      collectiveInfluence: 'moderate'
    },
    basharSuite: {
      beliefInterface: basharBeliefInterface,
      excitementCompass: basharExcitementCompass,
      frequencyAlignment: basharFrequencyAlignment
    },
    goalStack: {
      primaryGoal: primaryGoal,
      timeHorizon: timeHorizon,
      supportStyle: supportStyle
    },
    motivationBeliefEngine: {
      mindset: 'growth-oriented',
      motivation: ['personal development'],
      stateManagement: 'mindful',
      coreBeliefs: ['I can grow and evolve'],
      drivingForces: ['authenticity', 'growth'],
      excitementCompass: 'follow joy',
      frequencyAlignment: 'high',
      beliefInterface: ['positive possibility'],
      resistancePatterns: []
    },
    surfaceExpression: {
      observableStyle: 'authentic',
      realWorldImpact: 'positive',
      behavioralSignatures: [],
      externalManifestations: []
    },
    marketingArchetype: {
      messagingStyle: 'genuine',
      socialHooks: [],
      brandPersonality: 'authentic',
      communicationPatterns: [],
      influenceStyle: 'inspiring'
    },
    goalPersona: {
      currentMode: 'blend' as const,
      serviceRole: 'companion',
      coachingTone: 'supportive',
      nudgeStyle: 'gentle',
      motivationApproach: 'encouraging'
    },
    interactionPreferences: {
      rapportStyle: 'warm',
      storyPreference: 'meaningful',
      empathyLevel: 'high',
      conflictStyle: 'collaborative',
      collaborationStyle: 'inclusive',
      feedbackStyle: 'constructive',
      learningStyle: 'experiential'
    },
    timingOverlays: {
      currentTransits: [],
      seasonalInfluences: [],
      cyclicalPatterns: [],
      optimalTimings: [],
      energyWeather: 'stable'
    },
    proactiveContext: {
      nudgeHistory: [],
      taskGraph: {},
      streaks: {},
      moodLog: [],
      recentPatterns: [],
      triggerEvents: []
    },
    humorProfile: {
      primaryStyle: 'warm-nurturer' as const,
      intensity: 'moderate' as const,
      appropriatenessLevel: 'balanced' as const,
      contextualAdaptation: {
        coaching: 'warm-nurturer' as const,
        guidance: 'philosophical-sage' as const,
        casual: 'playful-storyteller' as const
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
    }
  };
}

// Helper function to clean astrology signs (remove degrees)
function cleanAstrologySign(signString: string): string {
  if (!signString || signString === 'Unknown' || signString === 'Calculating...') {
    return 'Unknown';
  }
  return signString.split(' ')[0];
}

// Helper functions
function getMBTIFunctions(type: string) {
  const functionMap: { [key: string]: { dominant: string; auxiliary: string } } = {
    'INFP': { dominant: 'Introverted Feeling', auxiliary: 'Extraverted Intuition' },
    'ENFP': { dominant: 'Extraverted Intuition', auxiliary: 'Introverted Feeling' },
    'INFJ': { dominant: 'Introverted Intuition', auxiliary: 'Extraverted Feeling' },
    'ENFJ': { dominant: 'Extraverted Feeling', auxiliary: 'Introverted Intuition' },
  };
  return functionMap[type] || { dominant: 'Unknown', auxiliary: 'Unknown' };
}

function extractKeywords(description: string): string[] {
  const keywords = [];
  if (description.includes('authentic')) keywords.push('Authentic');
  if (description.includes('empathetic')) keywords.push('Empathetic');
  if (description.includes('growth')) keywords.push('Growth-oriented');
  if (description.includes('helping')) keywords.push('Helper');
  if (description.includes('creative')) keywords.push('Creative');
  if (description.includes('values')) keywords.push('Values-driven');
  return keywords.length > 0 ? keywords : ['Authentic', 'Empathetic'];
}

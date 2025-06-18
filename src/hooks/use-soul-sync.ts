
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
        console.log("🔄 SoulSync: Initializing with blueprint data");
        
        // Fixed: Proper data mapping using correct paths from blueprintData
        const layeredBlueprint = mapToLayeredBlueprint(blueprintData);
        
        console.log("🎯 SoulSync: Mapped blueprint data:", {
          mbtiType: layeredBlueprint.cognitiveTemperamental?.mbtiType,
          hdType: layeredBlueprint.energyDecisionStrategy?.humanDesignType,
          authority: layeredBlueprint.energyDecisionStrategy?.authority,
          sunSign: layeredBlueprint.publicArchetype?.sunSign,
          moonSign: layeredBlueprint.publicArchetype?.moonSign,
          lifePath: layeredBlueprint.coreValuesNarrative?.lifePath,
          userName: layeredBlueprint.user_meta?.preferred_name
        });

        // Update both services with blueprint data
        enhancedAICoachService.updateUserBlueprint(layeredBlueprint);
        await enhancedAICoachService.setCurrentUser(user.id);
        
        setIsSoulSyncReady(true);
        setSoulSyncError(null);
        console.log("✅ SoulSync: Successfully initialized with proper data mapping");
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

// Fixed: Proper data mapping function that correctly extracts data from blueprintData
function mapToLayeredBlueprint(blueprintData: any) {
  console.log("🗺️ Mapping blueprint data to LayeredBlueprint structure");
  
  // Extract data from the actual blueprint structure
  const mbtiType = blueprintData?.user_meta?.personality?.likelyType || 'Unknown';
  const hdType = blueprintData?.energy_strategy_human_design?.type || 'Unknown';
  const hdAuthority = blueprintData?.energy_strategy_human_design?.authority || 'Unknown';
  const sunSign = blueprintData?.archetype_western?.sun_sign || 'Unknown';
  const moonSign = blueprintData?.archetype_western?.moon_sign || 'Unknown';
  const lifePath = blueprintData?.values_life_path?.life_path_number || 'Unknown';
  const preferredName = blueprintData?.user_meta?.preferred_name || 'Unknown';
  
  console.log("📊 Extracted raw data:", {
    mbtiType,
    hdType,
    hdAuthority,
    sunSign,
    moonSign,
    lifePath,
    preferredName
  });
  
  return {
    user_meta: blueprintData.user_meta || {},
    // Fixed: Map to cognitiveTemperamental (what PersonalityEngine expects)
    cognitiveTemperamental: {
      mbtiType: mbtiType,
      functions: [],
      dominantFunction: getMBTIFunctions(mbtiType).dominant,
      auxiliaryFunction: getMBTIFunctions(mbtiType).auxiliary,
      cognitiveStack: [],
      taskApproach: 'balanced',
      communicationStyle: 'adaptive',
      decisionMaking: 'analytical',
      informationProcessing: 'sequential',
      coreKeywords: extractKeywords(blueprintData?.user_meta?.personality?.description || '')
    },
    // Fixed: Map to energyDecisionStrategy (what PersonalityEngine expects)
    energyDecisionStrategy: {
      humanDesignType: hdType,
      authority: hdAuthority,
      decisionStyle: 'intuitive',
      pacing: 'steady',
      energyType: 'sustainable',
      strategy: blueprintData.energy_strategy_human_design?.strategy || 'To Respond',
      profile: blueprintData.energy_strategy_human_design?.profile || '1/3',
      centers: blueprintData.energy_strategy_human_design?.centers || [],
      gates: blueprintData.energy_strategy_human_design?.gates || [],
      channels: blueprintData.energy_strategy_human_design?.channels || []
    },
    // Fixed: Map to publicArchetype (what PersonalityEngine expects)
    publicArchetype: {
      sunSign: cleanAstrologySign(sunSign),
      moonSign: cleanAstrologySign(moonSign),
      risingSign: cleanAstrologySign(blueprintData.archetype_western?.rising_sign) || 'Unknown',
      socialStyle: 'authentic',
      publicVibe: 'approachable',
      publicPersona: 'genuine',
      leadershipStyle: 'collaborative',
      socialMask: 'minimal',
      externalExpression: 'natural'
    },
    // Fixed: Map to coreValuesNarrative (what PersonalityEngine expects)
    coreValuesNarrative: {
      lifePath: lifePath,
      meaningfulAreas: blueprintData.values_life_path?.meaningful_areas || [],
      anchoringVision: 'personal growth',
      lifeThemes: blueprintData.values_life_path?.themes || [],
      valueSystem: 'integrity-based',
      northStar: 'authentic living',
      missionStatement: blueprintData.values_life_path?.mission_statement || 'Live authentically',
      purposeAlignment: 'high',
      core_values: blueprintData.values_life_path?.core_values || []
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
    generationalCode: {
      chineseZodiac: blueprintData.archetype_chinese?.animal || 'Unknown',
      element: blueprintData.archetype_chinese?.element || 'Unknown',
      cohortTint: 'optimistic',
      generationalThemes: [],
      collectiveInfluence: 'moderate'
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
  // Extract just the sign name (e.g., "Cancer 13.1°" -> "Cancer")
  return signString.split(' ')[0];
}

// Helper functions
function getMBTIFunctions(type: string) {
  const functionMap: { [key: string]: { dominant: string; auxiliary: string } } = {
    'INFP': { dominant: 'Introverted Feeling', auxiliary: 'Extraverted Intuition' },
    'ENFP': { dominant: 'Extraverted Intuition', auxiliary: 'Introverted Feeling' },
    'INFJ': { dominant: 'Introverted Intuition', auxiliary: 'Extraverted Feeling' },
    'ENFJ': { dominant: 'Extraverted Feeling', auxiliary: 'Introverted Intuition' },
    // ... keep existing code for other types
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

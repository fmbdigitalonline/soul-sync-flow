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
  // Extract personality data from correct path
  const personalityData = blueprintData?.user_meta?.personality || {};
  
  return {
    user_meta: blueprintData.user_meta || {},
    // Fixed: Correct mapping from user_meta.personality.likelyType instead of cognition_mbti
    cognitiveTemperamental: {
      mbtiType: personalityData.likelyType || 'Unknown',
      functions: [],
      dominantFunction: getMBTIFunctions(personalityData.likelyType || 'Unknown').dominant,
      auxiliaryFunction: getMBTIFunctions(personalityData.likelyType || 'Unknown').auxiliary,
      cognitiveStack: [],
      taskApproach: 'balanced',
      communicationStyle: 'adaptive',
      decisionMaking: 'analytical',
      informationProcessing: 'sequential',
      coreKeywords: extractKeywords(personalityData.description || '')
    },
    // Fixed: Correct mapping from energy_strategy_human_design instead of human_design
    energyDecisionStrategy: {
      humanDesignType: blueprintData.energy_strategy_human_design?.type || 'Generator',
      authority: blueprintData.energy_strategy_human_design?.authority || 'Sacral',
      decisionStyle: 'intuitive',
      pacing: 'steady',
      energyType: 'sustainable',
      strategy: blueprintData.energy_strategy_human_design?.strategy || 'To Respond',
      profile: blueprintData.energy_strategy_human_design?.profile || '1/3',
      centers: blueprintData.energy_strategy_human_design?.centers || [],
      gates: blueprintData.energy_strategy_human_design?.gates || [],
      channels: blueprintData.energy_strategy_human_design?.channels || []
    },
    // Fixed: Correct mapping from archetype_western instead of astrology
    publicArchetype: {
      sunSign: blueprintData.archetype_western?.sun_sign || 'Unknown',
      moonSign: blueprintData.archetype_western?.moon_sign || 'Unknown',
      risingSign: blueprintData.archetype_western?.rising_sign || 'Unknown',
      socialStyle: 'authentic',
      publicVibe: 'approachable',
      publicPersona: 'genuine',
      leadershipStyle: 'collaborative',
      socialMask: 'minimal',
      externalExpression: 'natural'
    },
    // Fixed: Correct mapping from values_life_path instead of numerology
    coreValuesNarrative: {
      lifePath: blueprintData.values_life_path?.lifePathNumber || 
                blueprintData.values_life_path?.life_path_number || 'Unknown',
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
      chineseZodiac: blueprintData.timing_overlays?.chinese_zodiac || 'Unknown',
      element: blueprintData.timing_overlays?.element || 'Unknown',
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

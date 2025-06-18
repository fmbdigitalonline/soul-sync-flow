
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
        
        // Convert blueprint data to LayeredBlueprint format with proper structure
        const layeredBlueprint = {
          user_meta: blueprintData.user_meta,
          cognitiveTemperamental: {
            mbtiType: blueprintData.cognition_mbti?.type || 'Unknown',
            functions: [],
            dominantFunction: blueprintData.cognition_mbti?.dominant_function || 'Unknown',
            auxiliaryFunction: blueprintData.cognition_mbti?.auxiliary_function || 'Unknown',
            cognitiveStack: [],
            taskApproach: 'balanced',
            communicationStyle: 'adaptive',
            decisionMaking: 'analytical',
            informationProcessing: 'sequential',
            coreKeywords: blueprintData.cognition_mbti?.core_keywords || []
          },
          energyDecisionStrategy: {
            humanDesignType: blueprintData.energy_strategy_human_design?.type || 'Unknown',
            authority: blueprintData.energy_strategy_human_design?.authority || 'Unknown',
            decisionStyle: 'intuitive',
            pacing: 'steady',
            energyType: 'sustainable',
            strategy: blueprintData.energy_strategy_human_design?.strategy || 'Unknown',
            profile: blueprintData.energy_strategy_human_design?.profile || 'Unknown',
            centers: [],
            gates: [],
            channels: []
          },
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
          coreValuesNarrative: {
            lifePath: blueprintData.values_life_path?.lifePathNumber || blueprintData.values_life_path?.life_path_number || 'Unknown',
            meaningfulAreas: [],
            anchoringVision: 'personal growth',
            lifeThemes: [],
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

        // Update both services with blueprint data
        enhancedAICoachService.updateUserBlueprint(layeredBlueprint);
        await enhancedAICoachService.setCurrentUser(user.id);
        
        setIsSoulSyncReady(true);
        setSoulSyncError(null);
        console.log("✅ SoulSync: Successfully initialized");
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

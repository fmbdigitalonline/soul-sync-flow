
import { enhancedAICoachService } from "./enhanced-ai-coach-service";
import { UnifiedBlueprintService } from "./unified-blueprint-service";
import { blueprintService, BlueprintData } from "./blueprint-service";
import { LayeredBlueprint } from "@/types/personality-modules";
import { supabase } from "@/integrations/supabase/client";

export interface BlueprintIntegrationReport {
  userId: string;
  blueprintLoaded: boolean;
  blueprintValid: boolean;
  completionPercentage: number;
  aiServiceSynced: boolean;
  lastSyncTime: string | null;
  integrationScore: number;
  validationErrors: string[];
}

export interface BlueprintSyncResult {
  success: boolean;
  previousState: any;
  newState: any;
  syncTime: string;
  error?: string;
}

// Helper function to convert BlueprintData to LayeredBlueprint (from BlueprintCacheContext)
function convertToLayeredBlueprint(rawData: BlueprintData): LayeredBlueprint {
  const mbtiData = rawData.cognition_mbti || rawData.mbti || rawData.personality || {};
  let mbtiType = "Unknown";
  
  if (rawData.user_meta?.personality) {
    if (typeof rawData.user_meta.personality === 'object' && rawData.user_meta.personality !== null) {
      const personalityObj = rawData.user_meta.personality as any;
      if (personalityObj.likelyType) {
        mbtiType = personalityObj.likelyType;
      }
    } else if (typeof rawData.user_meta.personality === 'string') {
      mbtiType = rawData.user_meta.personality;
    }
  } else if (mbtiData?.type) {
    mbtiType = mbtiData.type;
  }
  
  const hdData = rawData.energy_strategy_human_design || rawData.human_design || {};
  const numerologyData = rawData.values_life_path || rawData.numerology || {};
  const westernAstroData = rawData.archetype_western || rawData.astrology || {};
  const chineseAstroData = rawData.archetype_chinese || {};

  return {
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
      preferred_name: rawData.user_meta?.preferred_name,
      full_name: rawData.user_meta?.full_name,
      ...rawData.user_meta
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
}

class BlueprintAIIntegrationService {
  private lastBlueprintHash: string | null = null;
  private lastSyncTime: string | null = null;

  private async getAuthenticatedUserId(): Promise<string | null> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error || !user) {
        console.error('🔐 Blueprint Integration: Authentication error:', error?.message);
        return null;
      }
      
      return user.id;
    } catch (error) {
      console.error('🔐 Blueprint Integration: Unexpected auth error:', error);
      return null;
    }
  }

  private generateBlueprintHash(blueprint: LayeredBlueprint): string {
    const hashData = {
      user_meta: blueprint.user_meta,
      astrology: blueprint.publicArchetype,
      human_design: blueprint.energyDecisionStrategy,
      numerology: blueprint.coreValuesNarrative,
      mbti: blueprint.cognitiveTemperamental
    };
    return JSON.stringify(hashData);
  }

  async performBlueprintSync(): Promise<BlueprintSyncResult> {
    const syncTime = new Date().toISOString();
    
    try {
      console.log('🔄 Blueprint Integration: Starting sync process');
      
      const userId = await this.getAuthenticatedUserId();
      if (!userId) {
        return {
          success: false,
          previousState: null,
          newState: null,
          syncTime,
          error: 'User not authenticated'
        };
      }

      // Get current blueprint data
      const blueprintResult = await blueprintService.getActiveBlueprintData();
      
      if (!blueprintResult.data) {
        return {
          success: false,
          previousState: null,
          newState: null,
          syncTime,
          error: blueprintResult.error || 'No blueprint data available'
        };
      }

      // Convert to LayeredBlueprint
      const layeredBlueprint = convertToLayeredBlueprint(blueprintResult.data);
      const currentHash = this.generateBlueprintHash(layeredBlueprint);
      const previousState = {
        hash: this.lastBlueprintHash,
        syncTime: this.lastSyncTime
      };

      // Check if blueprint has changed
      if (currentHash === this.lastBlueprintHash) {
        console.log('✅ Blueprint Integration: No changes detected, sync not needed');
        return {
          success: true,
          previousState,
          newState: { hash: currentHash, syncTime: this.lastSyncTime },
          syncTime
        };
      }

      console.log('🔄 Blueprint Integration: Changes detected, performing sync');

      // Validate blueprint before sync
      const validation = UnifiedBlueprintService.validateBlueprint(layeredBlueprint);
      
      if (validation.completionPercentage < 30) {
        console.warn('⚠️ Blueprint Integration: Blueprint completion too low for optimal sync');
      }

      // Update AI service with new blueprint
      await enhancedAICoachService.setCurrentUser(userId);
      enhancedAICoachService.updateUserBlueprint(layeredBlueprint);

      // Update tracking variables
      this.lastBlueprintHash = currentHash;
      this.lastSyncTime = syncTime;

      const newState = {
        hash: currentHash,
        syncTime,
        completionPercentage: validation.completionPercentage
      };

      console.log('✅ Blueprint Integration: Sync completed successfully');
      
      return {
        success: true,
        previousState,
        newState,
        syncTime
      };
    } catch (error) {
      console.error('❌ Blueprint Integration: Sync error:', error);
      return {
        success: false,
        previousState: { hash: this.lastBlueprintHash, syncTime: this.lastSyncTime },
        newState: null,
        syncTime,
        error: error instanceof Error ? error.message : 'Unknown sync error'
      };
    }
  }

  async generateIntegrationReport(): Promise<BlueprintIntegrationReport> {
    const userId = await this.getAuthenticatedUserId();
    
    if (!userId) {
      return {
        userId: 'not_authenticated',
        blueprintLoaded: false,
        blueprintValid: false,
        completionPercentage: 0,
        aiServiceSynced: false,
        lastSyncTime: null,
        integrationScore: 0,
        validationErrors: ['User not authenticated']
      };
    }

    try {
      console.log('📊 Blueprint Integration: Generating integration report');
      
      // Get blueprint data
      const blueprintResult = await blueprintService.getActiveBlueprintData();
      const blueprintLoaded = !!blueprintResult.data;
      
      let blueprintValid = false;
      let completionPercentage = 0;
      let validationErrors: string[] = [];
      
      if (blueprintResult.data) {
        const layeredBlueprint = convertToLayeredBlueprint(blueprintResult.data);
        const validation = UnifiedBlueprintService.validateBlueprint(layeredBlueprint);
        blueprintValid = validation.isComplete;
        completionPercentage = validation.completionPercentage;
        validationErrors = validation.missingFields || [];
      } else {
        validationErrors.push(blueprintResult.error || 'Blueprint not found');
      }

      // Check AI service sync status
      const currentHash = blueprintResult.data ? this.generateBlueprintHash(convertToLayeredBlueprint(blueprintResult.data)) : null;
      const aiServiceSynced = currentHash === this.lastBlueprintHash && this.lastSyncTime !== null;

      // Calculate integration score
      const integrationScore = this.calculateIntegrationScore({
        blueprintLoaded,
        blueprintValid,
        completionPercentage,
        aiServiceSynced,
        validationErrorCount: validationErrors.length
      });

      return {
        userId: userId.substring(0, 8),
        blueprintLoaded,
        blueprintValid,
        completionPercentage,
        aiServiceSynced,
        lastSyncTime: this.lastSyncTime,
        integrationScore,
        validationErrors
      };
    } catch (error) {
      console.error('❌ Blueprint Integration: Report generation error:', error);
      return {
        userId: userId.substring(0, 8),
        blueprintLoaded: false,
        blueprintValid: false,
        completionPercentage: 0,
        aiServiceSynced: false,
        lastSyncTime: null,
        integrationScore: 0,
        validationErrors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  private calculateIntegrationScore(metrics: {
    blueprintLoaded: boolean;
    blueprintValid: boolean;
    completionPercentage: number;
    aiServiceSynced: boolean;
    validationErrorCount: number;
  }): number {
    let score = 0;
    
    // Blueprint availability (0-25)
    if (metrics.blueprintLoaded) score += 25;
    
    // Blueprint validity (0-25)
    if (metrics.blueprintValid) score += 25;
    
    // Completion percentage (0-30)
    score += Math.floor(metrics.completionPercentage * 0.3);
    
    // AI service sync (0-15)
    if (metrics.aiServiceSynced) score += 15;
    
    // Error penalty (0-5 deduction)
    score -= Math.min(5, metrics.validationErrorCount);
    
    return Math.max(0, Math.min(100, score));
  }

  async testBlueprintIntegration(): Promise<{
    blueprintLoadTest: boolean;
    validationTest: boolean;
    aiSyncTest: boolean;
    consistencyTest: boolean;
    error?: string;
  }> {
    try {
      console.log('🧪 Blueprint Integration: Starting integration test');
      
      // Test 1: Blueprint loading
      const blueprintResult = await blueprintService.getActiveBlueprintData();
      const blueprintLoadTest = !!blueprintResult.data;
      console.log('🧪 Blueprint load test:', blueprintLoadTest ? 'PASS' : 'FAIL');
      
      if (!blueprintLoadTest) {
        return {
          blueprintLoadTest: false,
          validationTest: false,
          aiSyncTest: false,
          consistencyTest: false,
          error: blueprintResult.error || 'Blueprint not found'
        };
      }
      
      // Test 2: Blueprint validation
      const layeredBlueprint = convertToLayeredBlueprint(blueprintResult.data!);
      const validation = UnifiedBlueprintService.validateBlueprint(layeredBlueprint);
      const validationTest = validation.completionPercentage > 0;
      console.log('🧪 Blueprint validation test:', validationTest ? 'PASS' : 'FAIL');
      
      // Test 3: AI service sync
      const syncResult = await this.performBlueprintSync();
      const aiSyncTest = syncResult.success;
      console.log('🧪 AI sync test:', aiSyncTest ? 'PASS' : 'FAIL');
      
      // Test 4: Consistency check
      const report = await this.generateIntegrationReport();
      const consistencyTest = report.integrationScore > 50;
      console.log('🧪 Consistency test:', consistencyTest ? 'PASS' : 'FAIL');
      
      return {
        blueprintLoadTest,
        validationTest,
        aiSyncTest,
        consistencyTest
      };
    } catch (error) {
      console.error('❌ Blueprint Integration: Integration test error:', error);
      return {
        blueprintLoadTest: false,
        validationTest: false,
        aiSyncTest: false,
        consistencyTest: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Force sync method for testing
  async forceBlueprintSync(): Promise<BlueprintSyncResult> {
    this.lastBlueprintHash = null; // Force sync by clearing hash
    return this.performBlueprintSync();
  }
}

export const blueprintAIIntegrationService = new BlueprintAIIntegrationService();

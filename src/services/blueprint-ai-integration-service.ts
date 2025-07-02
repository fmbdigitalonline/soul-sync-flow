import { LayeredBlueprint } from "@/types/personality-modules";
import { enhancedAICoachService } from "./enhanced-ai-coach-service";
import { blueprintService } from "./blueprint-service";

export interface BlueprintIntegrationReport {
  blueprintLoaded: boolean;
  completionPercentage: number;
  integrationScore: number;
  missingComponents: string[];
  activeComponents: string[];
  lastSyncTime: Date;
  personalityVectorStatus: {
    isGenerated: boolean;
    dimensions: number;
    coherenceScore: number;
  };
}

class BlueprintAIIntegrationService {
  private lastSyncTime: Date | null = null;
  private cachedIntegrationReport: BlueprintIntegrationReport | null = null;

  async performBlueprintSync(): Promise<void> {
    try {
      console.log("🔄 Starting blueprint sync process...");
      
      const blueprintResult = await blueprintService.getActiveBlueprintData();
      if (blueprintResult.data) {
        await enhancedAICoachService.updateUserBlueprint(this.convertToLayeredBlueprint(blueprintResult.data));
        this.lastSyncTime = new Date();
        
        console.log("✅ Blueprint sync completed successfully");
      }
    } catch (error) {
      console.error("❌ Blueprint sync failed:", error);
    }
  }

  async forceBlueprintSync(): Promise<{ success: boolean; timestamp: Date }> {
    await this.performBlueprintSync();
    return {
      success: this.lastSyncTime !== null,
      timestamp: this.lastSyncTime || new Date()
    };
  }

  async generateIntegrationReport(): Promise<BlueprintIntegrationReport> {
    if (this.cachedIntegrationReport && this.lastSyncTime && 
        (Date.now() - this.lastSyncTime.getTime()) < 30000) {
      return this.cachedIntegrationReport;
    }

    try {
      const blueprintResult = await blueprintService.getActiveBlueprintData();
      
      if (!blueprintResult.data) {
        return this.createEmptyReport();
      }

      const blueprint = this.convertToLayeredBlueprint(blueprintResult.data);
      const report: BlueprintIntegrationReport = {
        blueprintLoaded: true,
        completionPercentage: this.calculateCompletionPercentage(blueprint),
        integrationScore: this.calculateIntegrationScore(blueprint),
        missingComponents: this.identifyMissingComponents(blueprint),
        activeComponents: this.identifyActiveComponents(blueprint),
        lastSyncTime: this.lastSyncTime || new Date(),
        personalityVectorStatus: {
          isGenerated: true,
          dimensions: 7,
          coherenceScore: 0.85
        }
      };

      this.cachedIntegrationReport = report;
      return report;
    } catch (error) {
      console.error("❌ Error generating integration report:", error);
      return this.createEmptyReport();
    }
  }

  private convertToLayeredBlueprint(data: any): LayeredBlueprint {
    const mbtiData = data.cognition_mbti || data.mbti || data.personality || {};
    let mbtiType = "Unknown";
    
    if (data.user_meta?.personality) {
      if (typeof data.user_meta.personality === 'object' && data.user_meta.personality !== null) {
        const personalityObj = data.user_meta.personality as any;
        if (personalityObj.likelyType) {
          mbtiType = personalityObj.likelyType;
        }
      } else if (typeof data.user_meta.personality === 'string') {
        mbtiType = data.user_meta.personality;
      }
    } else if (mbtiData?.type) {
      mbtiType = mbtiData.type;
    }
    
    const hdData = data.energy_strategy_human_design || data.human_design || {};
    const numerologyData = data.values_life_path || data.numerology || {};
    const westernAstroData = data.archetype_western || data.astrology || {};
    const chineseAstroData = data.archetype_chinese || {};

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
        coreBeliefs: data.core_beliefs || [],
        motivationalDrivers: data.motivational_drivers || [],
        beliefPatterns: data.belief_patterns || [],
        motivationTriggers: data.motivation_triggers || [],
        resistancePoints: data.resistance_points || [],
        empowermentSources: data.empowerment_sources || []
      },
      coreValuesNarrative: {
        lifePath: typeof data.life_path_number === 'string' ? parseInt(data.life_path_number) : (data.life_path_number || 1),
        lifePathKeyword: data.life_path_keyword,
        expressionNumber: data.expression_number,
        expressionKeyword: data.expression_keyword,
        soulUrgeNumber: data.soul_urge_number,
        soulUrgeKeyword: data.soul_urge_keyword,
        personalityNumber: data.personality_number,
        personalityKeyword: data.personality_keyword,
        birthdayNumber: data.birthday_number || 1,
        birthdayKeyword: data.birthday_keyword || 'Pioneer',
        meaningfulAreas: data.meaningful_areas || [],
        anchoringVision: data.anchoring_vision || '',
        lifeThemes: data.life_themes || [],
        valueSystem: data.value_system || '',
        northStar: data.north_star || '',
        missionStatement: data.mission_statement || '',
        purposeAlignment: data.purpose_alignment || '',
        core_values: data.core_values || []
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
        preferred_name: data.user_meta?.preferred_name,
        full_name: data.user_meta?.full_name,
        ...data.user_meta
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

  private createEmptyReport(): BlueprintIntegrationReport {
    return {
      blueprintLoaded: false,
      completionPercentage: 0,
      integrationScore: 0,
      missingComponents: [],
      activeComponents: [],
      lastSyncTime: new Date(),
      personalityVectorStatus: {
        isGenerated: false,
        dimensions: 0,
        coherenceScore: 0
      }
    };
  }

  private calculateCompletionPercentage(blueprint: LayeredBlueprint): number {
    // Calculate completion percentage based on specific criteria
    return 50; // Example value
  }

  private calculateIntegrationScore(blueprint: LayeredBlueprint): number {
    // Calculate integration score based on specific criteria
    return 75; // Example value
  }

  private identifyMissingComponents(blueprint: LayeredBlueprint): string[] {
    // Identify missing components based on specific criteria
    return []; // Example value
  }

  private identifyActiveComponents(blueprint: LayeredBlueprint): string[] {
    // Identify active components based on specific criteria
    return []; // Example value
  }
}

export const blueprintAIIntegrationService = new BlueprintAIIntegrationService();

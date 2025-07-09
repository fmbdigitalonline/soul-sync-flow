
import { BlueprintData } from './blueprint-service';
import { LayeredBlueprint } from '@/types/personality-modules';

export class UnifiedBlueprintService {
  static convertBlueprintDataToLayered(blueprintData: BlueprintData): LayeredBlueprint {
    console.log('🔄 UNIFIED SERVICE: Converting BlueprintData to LayeredBlueprint');
    console.log('📊 INPUT DATA:', {
      hasUserMeta: !!blueprintData.user_meta,
      hasArchetypeWestern: !!blueprintData.archetype_western,
      hasValuesLifePath: !!blueprintData.values_life_path,
      hasEnergyStrategy: !!blueprintData.energy_strategy_human_design,
      hasCognitionMbti: !!blueprintData.cognition_mbti
    });

    const layered: LayeredBlueprint = {
      user_meta: blueprintData.user_meta || {},
      
      publicArchetype: {
        sunSign: blueprintData.archetype_western?.sun_sign || 
                blueprintData.astrology?.sun_sign || 'Unknown',
        moonSign: blueprintData.archetype_western?.moon_sign || 
                 blueprintData.astrology?.moon_sign || 'Unknown',
        risingSign: blueprintData.archetype_western?.rising_sign || 
                   blueprintData.astrology?.rising_sign || 'Unknown',
        socialStyle: 'Unknown',
        publicVibe: 'Unknown',
        publicPersona: 'Unknown',
        leadershipStyle: 'Unknown',
        socialMask: 'Unknown',
        externalExpression: 'Unknown'
      },
      
      cognitiveTemperamental: {
        mbtiType: blueprintData.cognition_mbti?.type || 
                 blueprintData.mbti?.type || 'Unknown',
        functions: [],
        dominantFunction: blueprintData.cognition_mbti?.dominant_function || 'Unknown',
        auxiliaryFunction: blueprintData.cognition_mbti?.auxiliary_function || 'Unknown',
        cognitiveStack: [],
        taskApproach: 'Unknown',
        communicationStyle: 'Unknown',
        decisionMaking: 'Unknown',
        informationProcessing: 'Unknown',
        coreKeywords: blueprintData.cognition_mbti?.core_keywords || []
      },
      
      energyDecisionStrategy: {
        humanDesignType: blueprintData.energy_strategy_human_design?.type || 
                        blueprintData.human_design?.type || 'Unknown',
        authority: blueprintData.energy_strategy_human_design?.authority || 
                  blueprintData.human_design?.authority || 'Unknown',
        decisionStyle: 'Unknown',
        pacing: 'Unknown',
        energyType: 'Unknown',
        strategy: 'Unknown',
        profile: blueprintData.energy_strategy_human_design?.profile || 
                blueprintData.human_design?.profile || 'Unknown',
        centers: [],
        gates: [],
        channels: []
      },

      motivationBeliefEngine: {
        mindset: 'Unknown',
        motivation: [],
        stateManagement: 'Unknown',
        coreBeliefs: [],
        drivingForces: [],
        excitementCompass: 'Unknown',
        frequencyAlignment: 'Unknown',
        beliefInterface: [],
        resistancePatterns: []
      },
      
      coreValuesNarrative: {
        lifePath: blueprintData.values_life_path?.lifePathNumber || 
                 blueprintData.values_life_path?.life_path_number ||
                 blueprintData.numerology?.lifePathNumber ||
                 blueprintData.numerology?.life_path_number || 1,
        lifePathKeyword: 'Unknown',
        expressionNumber: blueprintData.values_life_path?.expressionNumber || 
                         blueprintData.numerology?.expressionNumber || 1,
        soulUrgeNumber: blueprintData.values_life_path?.soulUrge || 
                       blueprintData.numerology?.soulUrge || 1,
        meaningfulAreas: [],
        anchoringVision: 'Unknown',
        lifeThemes: [],
        valueSystem: 'Unknown',
        northStar: 'Unknown',
        missionStatement: 'Unknown',
        purposeAlignment: 'Unknown'
      },
      
      generationalCode: {
        chineseZodiac: blueprintData.archetype_chinese?.animal || 'Unknown',
        element: blueprintData.archetype_chinese?.element || 'Unknown',
        cohortTint: 'Unknown',
        generationalThemes: [],
        collectiveInfluence: 'Unknown'
      },

      surfaceExpression: {
        observableStyle: 'Unknown',
        realWorldImpact: 'Unknown',
        behavioralSignatures: [],
        externalManifestations: []
      },

      marketingArchetype: {
        messagingStyle: 'Unknown',
        socialHooks: [],
        brandPersonality: 'Unknown',
        communicationPatterns: [],
        influenceStyle: 'Unknown'
      },

      goalPersona: {
        currentMode: 'blend',
        serviceRole: 'Unknown',
        coachingTone: 'Unknown',
        nudgeStyle: 'Unknown',
        motivationApproach: 'Unknown'
      },

      interactionPreferences: {
        rapportStyle: 'Unknown',
        storyPreference: 'Unknown',
        empathyLevel: 'Unknown',
        conflictStyle: 'Unknown',
        collaborationStyle: 'Unknown',
        feedbackStyle: 'Unknown',
        learningStyle: 'Unknown'
      },

      timingOverlays: {
        currentTransits: [],
        seasonalInfluences: [],
        cyclicalPatterns: [],
        optimalTimings: [],
        energyWeather: 'Unknown'
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
        primaryStyle: 'gentle-empath',
        intensity: 'moderate',
        appropriatenessLevel: 'balanced',
        contextualAdaptation: {
          coaching: 'gentle-empath',
          guidance: 'gentle-empath',
          casual: 'gentle-empath'
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
          questionAsking: 'exploratory',
          responseLength: 'thorough',
          personalSharing: 'relevant'
        },
        signaturePhrases: [],
        greetingStyles: [],
        transitionWords: []
      }
    };

    console.log('✅ UNIFIED SERVICE: Conversion complete:', {
      sunSign: layered.publicArchetype?.sunSign,
      mbtiType: layered.cognitiveTemperamental?.mbtiType,
      hdType: layered.energyDecisionStrategy?.humanDesignType,
      lifePath: layered.coreValuesNarrative?.lifePath
    });

    return layered;
  }

  static validateBlueprint(blueprint: LayeredBlueprint | null): {
    isValid: boolean;
    isComplete: boolean;
    completionPercentage: number;
    missingFields: string[];
    hasEssentialData: boolean;
    availableData: {
      hasPersonalInfo: boolean;
      hasCognitive: boolean;
      hasEnergy: boolean;
      hasValues: boolean;
      hasArchetype: boolean;
      hasGenerational: boolean;
    };
  } {
    if (!blueprint) {
      return {
        isValid: false,
        isComplete: false,
        completionPercentage: 0,
        missingFields: ['entire blueprint'],
        hasEssentialData: false,
        availableData: {
          hasPersonalInfo: false,
          hasCognitive: false,
          hasEnergy: false,
          hasValues: false,
          hasArchetype: false,
          hasGenerational: false
        }
      };
    }

    const missingFields: string[] = [];
    let completedFields = 0;
    const totalFields = 7;

    // Check essential fields and build availableData
    const hasPersonalInfo = !!(blueprint.user_meta?.full_name);
    const hasCognitive = !!(blueprint.cognitiveTemperamental?.mbtiType && blueprint.cognitiveTemperamental.mbtiType !== 'Unknown');
    const hasEnergy = !!(blueprint.energyDecisionStrategy?.humanDesignType && blueprint.energyDecisionStrategy.humanDesignType !== 'Unknown');
    const hasValues = !!(blueprint.coreValuesNarrative?.lifePath && Number(blueprint.coreValuesNarrative.lifePath) > 0);
    const hasArchetype = !!(blueprint.publicArchetype?.sunSign && blueprint.publicArchetype.sunSign !== 'Unknown');
    const hasGenerational = !!(blueprint.generationalCode?.chineseZodiac && blueprint.generationalCode.chineseZodiac !== 'Unknown');

    if (!hasArchetype) {
      missingFields.push('Sun Sign');
    } else {
      completedFields++;
    }

    if (!hasCognitive) {
      missingFields.push('MBTI Type');
    } else {
      completedFields++;
    }

    if (!hasEnergy) {
      missingFields.push('Human Design Type');
    } else {
      completedFields++;
    }

    if (!hasValues) {
      missingFields.push('Life Path Number');
    } else {
      completedFields++;
    }

    if (!hasGenerational) {
      missingFields.push('Chinese Zodiac');
    } else {
      completedFields++;
    }

    if (!hasPersonalInfo) {
      missingFields.push('Full Name');
    } else {
      completedFields++;
    }

    if (!blueprint.user_meta?.birth_date) {
      missingFields.push('Birth Date');
    } else {
      completedFields++;
    }

    const completionPercentage = Math.round((completedFields / totalFields) * 100);
    const hasEssentialData = completedFields >= 4;
    const isValid = completedFields >= 6;
    const isComplete = completedFields === totalFields;

    console.log('🔍 BLUEPRINT VALIDATION:', {
      completedFields,
      totalFields,
      completionPercentage,
      hasEssentialData,
      isValid,
      isComplete,
      missingFields
    });

    return {
      isValid,
      isComplete,
      completionPercentage,
      missingFields,
      hasEssentialData,
      availableData: {
        hasPersonalInfo,
        hasCognitive,
        hasEnergy,
        hasValues,
        hasArchetype,
        hasGenerational
      }
    };
  }

  static extractBlueprintSummary(blueprint: LayeredBlueprint): string {
    if (!blueprint) return 'No blueprint data available';

    const traits = [];
    
    if (blueprint.cognitiveTemperamental?.mbtiType && blueprint.cognitiveTemperamental.mbtiType !== 'Unknown') {
      traits.push(blueprint.cognitiveTemperamental.mbtiType);
    }
    
    if (blueprint.publicArchetype?.sunSign && blueprint.publicArchetype.sunSign !== 'Unknown') {
      traits.push(`${blueprint.publicArchetype.sunSign} Sun`);
    }
    
    if (blueprint.energyDecisionStrategy?.humanDesignType && blueprint.energyDecisionStrategy.humanDesignType !== 'Unknown') {
      traits.push(blueprint.energyDecisionStrategy.humanDesignType);
    }
    
    if (blueprint.coreValuesNarrative?.lifePath) {
      traits.push(`Life Path ${blueprint.coreValuesNarrative.lifePath}`);
    }

    return traits.length > 0 ? traits.join(' • ') : 'Unique individual with developing blueprint';
  }

  static formatBlueprintForAI(blueprint: LayeredBlueprint): string {
    if (!blueprint) return 'No blueprint data available';

    const sections = [];

    // Cognitive Section
    if (blueprint.cognitiveTemperamental?.mbtiType && blueprint.cognitiveTemperamental.mbtiType !== 'Unknown') {
      sections.push(`MBTI Type: ${blueprint.cognitiveTemperamental.mbtiType}`);
    }

    // Energy Section
    if (blueprint.energyDecisionStrategy?.humanDesignType && blueprint.energyDecisionStrategy.humanDesignType !== 'Unknown') {
      sections.push(`Human Design: ${blueprint.energyDecisionStrategy.humanDesignType}`);
    }

    // Archetype Section
    if (blueprint.publicArchetype?.sunSign && blueprint.publicArchetype.sunSign !== 'Unknown') {
      sections.push(`Sun Sign: ${blueprint.publicArchetype.sunSign}`);
    }

    // Values Section
    if (blueprint.coreValuesNarrative?.lifePath) {
      sections.push(`Life Path: ${blueprint.coreValuesNarrative.lifePath}`);
    }

    return sections.length > 0 ? sections.join(' | ') : 'Developing personality profile';
  }
}

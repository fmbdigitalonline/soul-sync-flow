
import { BlueprintData } from './blueprint-service';

// Define the LayeredBlueprint interface based on the actual structure
export interface LayeredBlueprint {
  user_meta?: {
    full_name?: string;
    preferred_name?: string;
    birth_date?: string;
    birth_time_local?: string;
    birth_location?: string;
    timezone?: string;
    user_id?: string;
  };
  publicArchetype?: {
    sunSign?: string;
    moonSign?: string;
    risingSign?: string;
    chineseZodiac?: string;
    element?: string;
  };
  cognitiveTemperamental?: {
    mbtiType?: string;
    dominantFunction?: string;
    auxiliaryFunction?: string;
    coreKeywords?: string[];
  };
  energyDecisionStrategy?: {
    humanDesignType?: string;
    authority?: string;
    profile?: string;
    centers?: any;
  };
  coreValuesNarrative?: {
    lifePath?: number;
    expressionNumber?: number;
    soulUrge?: number;
  };
  generationalCode?: {
    chineseZodiac?: string;
    element?: string;
    westernGeneration?: string;
  };
  goal_stack?: any;
  metadata?: any;
}

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
        chineseZodiac: blueprintData.archetype_chinese?.animal || 'Unknown',
        element: blueprintData.archetype_chinese?.element || 'Unknown'
      },
      
      cognitiveTemperamental: {
        mbtiType: blueprintData.cognition_mbti?.type || 
                 blueprintData.mbti?.type || 'Unknown',
        dominantFunction: blueprintData.cognition_mbti?.dominant_function || 'Unknown',
        auxiliaryFunction: blueprintData.cognition_mbti?.auxiliary_function || 'Unknown',
        coreKeywords: blueprintData.cognition_mbti?.core_keywords || []
      },
      
      energyDecisionStrategy: {
        humanDesignType: blueprintData.energy_strategy_human_design?.type || 
                        blueprintData.human_design?.type || 'Unknown',
        authority: blueprintData.energy_strategy_human_design?.authority || 
                  blueprintData.human_design?.authority || 'Unknown',
        profile: blueprintData.energy_strategy_human_design?.profile || 
                blueprintData.human_design?.profile || 'Unknown',
        centers: blueprintData.energy_strategy_human_design?.centers || 
                blueprintData.human_design?.centers || {}
      },
      
      coreValuesNarrative: {
        lifePath: blueprintData.values_life_path?.lifePathNumber || 
                 blueprintData.values_life_path?.life_path_number ||
                 blueprintData.numerology?.lifePathNumber ||
                 blueprintData.numerology?.life_path_number || 1,
        expressionNumber: blueprintData.values_life_path?.expressionNumber || 
                         blueprintData.numerology?.expressionNumber || 1,
        soulUrge: blueprintData.values_life_path?.soulUrge || 
                 blueprintData.numerology?.soulUrge || 1
      },
      
      generationalCode: {
        chineseZodiac: blueprintData.archetype_chinese?.animal || 'Unknown',
        element: blueprintData.archetype_chinese?.element || 'Unknown',
        westernGeneration: 'Unknown' // This would need additional calculation
      },
      
      goal_stack: blueprintData.goal_stack || {},
      metadata: blueprintData.metadata || {}
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
    completionPercentage: number;
    missingFields: string[];
    hasEssentialData: boolean;
  } {
    if (!blueprint) {
      return {
        isValid: false,
        completionPercentage: 0,
        missingFields: ['entire blueprint'],
        hasEssentialData: false
      };
    }

    const missingFields: string[] = [];
    let completedFields = 0;
    const totalFields = 7;

    // Check essential fields
    if (!blueprint.publicArchetype?.sunSign || blueprint.publicArchetype.sunSign === 'Unknown') {
      missingFields.push('Sun Sign');
    } else {
      completedFields++;
    }

    if (!blueprint.cognitiveTemperamental?.mbtiType || blueprint.cognitiveTemperamental.mbtiType === 'Unknown') {
      missingFields.push('MBTI Type');
    } else {
      completedFields++;
    }

    if (!blueprint.energyDecisionStrategy?.humanDesignType || blueprint.energyDecisionStrategy.humanDesignType === 'Unknown') {
      missingFields.push('Human Design Type');
    } else {
      completedFields++;
    }

    if (!blueprint.coreValuesNarrative?.lifePath || blueprint.coreValuesNarrative.lifePath <= 0) {
      missingFields.push('Life Path Number');
    } else {
      completedFields++;
    }

    if (!blueprint.publicArchetype?.chineseZodiac || blueprint.publicArchetype.chineseZodiac === 'Unknown') {
      missingFields.push('Chinese Zodiac');
    } else {
      completedFields++;
    }

    if (!blueprint.user_meta?.full_name) {
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
    const hasEssentialData = completedFields >= 4; // At least half the essential fields
    const isValid = completedFields >= 6; // Most fields present

    console.log('🔍 BLUEPRINT VALIDATION:', {
      completedFields,
      totalFields,
      completionPercentage,
      hasEssentialData,
      isValid,
      missingFields
    });

    return {
      isValid,
      completionPercentage,
      missingFields,
      hasEssentialData
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
}

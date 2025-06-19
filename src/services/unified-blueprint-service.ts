import { LayeredBlueprint } from '@/types/personality-modules';
import { useBlueprintCache } from '@/contexts/BlueprintCacheContext';

export interface BlueprintValidationResult {
  isComplete: boolean;
  completionPercentage: number;
  missingFields: string[];
  availableData: {
    hasPersonalInfo: boolean;
    hasCognitive: boolean;
    hasEnergy: boolean;
    hasValues: boolean;
    hasArchetype: boolean;
    hasGenerational: boolean;
  };
}

export class UnifiedBlueprintService {
  static validateBlueprint(blueprint: LayeredBlueprint | null): BlueprintValidationResult {
    if (!blueprint) {
      return {
        isComplete: false,
        completionPercentage: 0,
        missingFields: ['entire_blueprint'],
        availableData: {
          hasPersonalInfo: false,
          hasCognitive: false,
          hasEnergy: false,
          hasValues: false,
          hasArchetype: false,
          hasGenerational: false,
        }
      };
    }

    console.log('🔍 Blueprint Validation: Analyzing blueprint completeness');
    
    const checks = {
      hasPersonalInfo: !!(blueprint.user_meta?.preferred_name || blueprint.user_meta?.full_name),
      hasCognitive: !!(blueprint.cognitiveTemperamental?.mbtiType && blueprint.cognitiveTemperamental.mbtiType !== 'Unknown'),
      hasEnergy: !!(blueprint.energyDecisionStrategy?.humanDesignType && blueprint.energyDecisionStrategy.humanDesignType !== 'Unknown'),
      hasValues: !!(blueprint.coreValuesNarrative?.lifePath && (
        typeof blueprint.coreValuesNarrative.lifePath === 'number' 
          ? blueprint.coreValuesNarrative.lifePath > 0 
          : blueprint.coreValuesNarrative.lifePath !== 'Unknown' && blueprint.coreValuesNarrative.lifePath.trim() !== ''
      )),
      hasArchetype: !!(blueprint.publicArchetype?.sunSign && blueprint.publicArchetype.sunSign !== 'Unknown'),
      hasGenerational: !!(blueprint.generationalCode?.chineseZodiac && blueprint.generationalCode.chineseZodiac !== 'Unknown'),
    };

    const completedCount = Object.values(checks).filter(Boolean).length;
    const totalCount = Object.keys(checks).length;
    const completionPercentage = Math.round((completedCount / totalCount) * 100);

    const missingFields = Object.entries(checks)
      .filter(([_, isPresent]) => !isPresent)
      .map(([field]) => field);

    const isComplete = completionPercentage >= 80; // At least 80% complete

    console.log('✅ Blueprint Validation Complete:', {
      completionPercentage,
      isComplete,
      missingFields,
      availableData: checks
    });

    return {
      isComplete,
      completionPercentage,
      missingFields,
      availableData: checks
    };
  }

  static extractBlueprintSummary(blueprint: LayeredBlueprint): string {
    const validation = this.validateBlueprint(blueprint);
    
    if (!validation.isComplete) {
      return `Blueprint ${validation.completionPercentage}% complete. Missing: ${validation.missingFields.join(', ')}`;
    }

    const parts = [];
    
    if (validation.availableData.hasPersonalInfo) {
      parts.push(`Name: ${blueprint.user_meta?.preferred_name || blueprint.user_meta?.full_name}`);
    }
    
    if (validation.availableData.hasCognitive) {
      parts.push(`MBTI: ${blueprint.cognitiveTemperamental?.mbtiType}`);
    }
    
    if (validation.availableData.hasEnergy) {
      parts.push(`Human Design: ${blueprint.energyDecisionStrategy?.humanDesignType}`);
      if (blueprint.energyDecisionStrategy?.authority) {
        parts.push(`Authority: ${blueprint.energyDecisionStrategy.authority}`);
      }
    }
    
    if (validation.availableData.hasValues) {
      parts.push(`Life Path: ${blueprint.coreValuesNarrative?.lifePath}`);
      if (blueprint.coreValuesNarrative?.expressionNumber) {
        parts.push(`Expression: ${blueprint.coreValuesNarrative.expressionNumber}`);
      }
    }
    
    if (validation.availableData.hasArchetype) {
      parts.push(`Sun: ${blueprint.publicArchetype?.sunSign}`);
      if (blueprint.publicArchetype?.moonSign && blueprint.publicArchetype.moonSign !== 'Unknown') {
        parts.push(`Moon: ${blueprint.publicArchetype.moonSign}`);
      }
      if (blueprint.publicArchetype?.risingSign && blueprint.publicArchetype.risingSign !== 'Unknown') {
        parts.push(`Rising: ${blueprint.publicArchetype.risingSign}`);
      }
    }
    
    if (validation.availableData.hasGenerational) {
      parts.push(`Chinese: ${blueprint.generationalCode?.chineseZodiac} ${blueprint.generationalCode?.element}`);
    }

    return parts.join(' | ');
  }

  static formatBlueprintForAI(blueprint: LayeredBlueprint, agentType: 'coach' | 'guide' | 'blend' = 'guide'): string {
    const validation = this.validateBlueprint(blueprint);
    
    if (!validation.isComplete) {
      console.log('⚠️ Blueprint incomplete for AI formatting:', validation.missingFields);
    }

    let prompt = `USER BLUEPRINT CONTEXT:\n`;
    
    // Personal Information
    if (validation.availableData.hasPersonalInfo) {
      prompt += `Name: ${blueprint.user_meta?.preferred_name || blueprint.user_meta?.full_name}\n`;
    }

    // Cognitive Profile
    if (validation.availableData.hasCognitive) {
      prompt += `\nCOGNITIVE PROFILE:\n`;
      prompt += `- MBTI Type: ${blueprint.cognitiveTemperamental?.mbtiType}\n`;
      if (blueprint.cognitiveTemperamental?.dominantFunction) {
        prompt += `- Dominant Function: ${blueprint.cognitiveTemperamental.dominantFunction}\n`;
      }
      if (blueprint.cognitiveTemperamental?.auxiliaryFunction) {
        prompt += `- Auxiliary Function: ${blueprint.cognitiveTemperamental.auxiliaryFunction}\n`;
      }
    }

    // Energy & Decision Strategy
    if (validation.availableData.hasEnergy) {
      prompt += `\nENERGY & DECISION STRATEGY:\n`;
      prompt += `- Human Design Type: ${blueprint.energyDecisionStrategy?.humanDesignType}\n`;
      if (blueprint.energyDecisionStrategy?.authority) {
        prompt += `- Authority: ${blueprint.energyDecisionStrategy.authority}\n`;
      }
      if (blueprint.energyDecisionStrategy?.strategy) {
        prompt += `- Strategy: ${blueprint.energyDecisionStrategy.strategy}\n`;
      }
    }

    // Core Values & Life Path
    if (validation.availableData.hasValues) {
      prompt += `\nCORE VALUES & LIFE PATH:\n`;
      prompt += `- Life Path Number: ${blueprint.coreValuesNarrative?.lifePath}\n`;
      if (blueprint.coreValuesNarrative?.lifePathKeyword) {
        prompt += `- Life Path Theme: ${blueprint.coreValuesNarrative.lifePathKeyword}\n`;
      }
      if (blueprint.coreValuesNarrative?.expressionNumber) {
        prompt += `- Expression Number: ${blueprint.coreValuesNarrative.expressionNumber}\n`;
      }
      if (blueprint.coreValuesNarrative?.soulUrgeNumber) {
        prompt += `- Soul Urge Number: ${blueprint.coreValuesNarrative.soulUrgeNumber}\n`;
      }
    }

    // Public Archetype
    if (validation.availableData.hasArchetype) {
      prompt += `\nASTROLOGICAL PROFILE:\n`;
      prompt += `- Sun Sign: ${blueprint.publicArchetype?.sunSign}\n`;
      if (blueprint.publicArchetype?.moonSign && blueprint.publicArchetype.moonSign !== 'Unknown') {
        prompt += `- Moon Sign: ${blueprint.publicArchetype.moonSign}\n`;
      }
      if (blueprint.publicArchetype?.risingSign && blueprint.publicArchetype.risingSign !== 'Unknown') {
        prompt += `- Rising Sign: ${blueprint.publicArchetype.risingSign}\n`;
      }
    }

    // Generational Code
    if (validation.availableData.hasGenerational) {
      prompt += `\nGENERATIONAL INFLUENCES:\n`;
      prompt += `- Chinese Zodiac: ${blueprint.generationalCode?.chineseZodiac} ${blueprint.generationalCode?.element}\n`;
    }

    // Agent-specific instructions
    prompt += `\nAGENT BEHAVIOR INSTRUCTIONS:\n`;
    switch (agentType) {
      case 'coach':
        prompt += `- You are their personal coach. Be direct, motivating, and action-oriented.\n`;
        prompt += `- Use their blueprint to understand their natural strengths and working style.\n`;
        prompt += `- Provide concrete, personalized advice based on their specific personality profile.\n`;
        break;
      case 'guide':
        prompt += `- You are their spiritual guide. Be wise, intuitive, and supportive.\n`;
        prompt += `- Use their blueprint to understand their spiritual path and growth areas.\n`;
        prompt += `- Offer insights that align with their authentic self and purpose.\n`;
        break;
      case 'blend':
        prompt += `- You are their companion. Adapt your style to what they need in the moment.\n`;
        prompt += `- Use their blueprint to understand their communication preferences and needs.\n`;
        prompt += `- Be authentic and personalized in your responses.\n`;
        break;
    }

    prompt += `\nIMPORTANT: Always reference specific aspects of their blueprint when relevant. They want to understand themselves better through this lens.\n`;

    console.log(`🎭 Generated ${agentType} prompt with ${validation.completionPercentage}% complete blueprint`);
    
    return prompt;
  }
}

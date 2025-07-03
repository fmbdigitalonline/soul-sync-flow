
import { ACSConfig } from "@/types/acs-types";

export interface AgentSpecificConfig {
  acs: ACSConfig;
  pie: {
    enabledDataTypes: string[];
    minimumConfidence: number;
    patternSensitivity: 'conservative' | 'moderate' | 'sensitive';
    insightCategories: string[];
    deliveryStyle: 'immediate' | 'contemplative' | 'action_focused';
  };
  behavioral: {
    responseStyle: 'empathetic' | 'direct' | 'balanced';
    pacingMs: number;
    emotionalSensitivity: number;
    focusAreas: string[];
    conversationDepth: 'surface' | 'moderate' | 'deep';
  };
}

class AgentConfigurationService {
  private static readonly GROWTH_CONFIG: AgentSpecificConfig = {
    acs: {
      enableRL: true,
      personalityScaling: true,
      frustrationThreshold: 0.2, // Lower threshold for spiritual work
      sentimentSlopeNeg: -0.15, // More sensitive to negative sentiment
      velocityFloor: 0.05, // Allow for contemplative silence
      maxSilentMs: 240000, // 4 minutes for deeper reflection
      clarificationThreshold: 0.3 // Lower threshold for confusion detection
    },
    pie: {
      enabledDataTypes: ['mood', 'spiritual_growth', 'emotional_state', 'reflection_depth'],
      minimumConfidence: 0.6,
      patternSensitivity: 'sensitive',
      insightCategories: ['spiritual_patterns', 'emotional_cycles', 'growth_opportunities'],
      deliveryStyle: 'contemplative'
    },
    behavioral: {
      responseStyle: 'empathetic',
      pacingMs: 90,
      emotionalSensitivity: 0.9,
      focusAreas: ['emotional_healing', 'spiritual_development', 'inner_wisdom', 'shadow_work'],
      conversationDepth: 'deep'
    }
  };

  private static readonly DREAMS_CONFIG: AgentSpecificConfig = {
    acs: {
      enableRL: true,
      personalityScaling: true,
      frustrationThreshold: 0.4, // Higher tolerance for goal-setting friction
      sentimentSlopeNeg: -0.25,
      velocityFloor: 0.15, // Maintain engagement for productivity
      maxSilentMs: 120000, // 2 minutes for quick decision-making
      clarificationThreshold: 0.4
    },
    pie: {
      enabledDataTypes: ['productivity', 'goal_progress', 'task_completion', 'motivation'],
      minimumConfidence: 0.7,
      patternSensitivity: 'moderate',
      insightCategories: ['productivity_patterns', 'goal_alignment', 'task_optimization'],
      deliveryStyle: 'action_focused'
    },
    behavioral: {
      responseStyle: 'direct',
      pacingMs: 70,
      emotionalSensitivity: 0.6,
      focusAreas: ['goal_breakdown', 'task_management', 'milestone_tracking', 'productivity_optimization'],
      conversationDepth: 'moderate'
    }
  };

  private static readonly SOUL_COMPANION_CONFIG: AgentSpecificConfig = {
    acs: {
      enableRL: true,
      personalityScaling: true,
      frustrationThreshold: 0.3, // Balanced sensitivity for meta-intelligence
      sentimentSlopeNeg: -0.2,
      velocityFloor: 0.1, // Adaptive to conversation needs
      maxSilentMs: 180000, // 3 minutes for integration thinking
      clarificationThreshold: 0.35
    },
    pie: {
      enabledDataTypes: ['mood', 'productivity', 'spiritual_growth', 'life_balance', 'integration_patterns'],
      minimumConfidence: 0.65,
      patternSensitivity: 'moderate',
      insightCategories: ['cross_mode_patterns', 'life_integration', 'holistic_insights', 'balance_opportunities'],
      deliveryStyle: 'immediate'
    },
    behavioral: {
      responseStyle: 'balanced',
      pacingMs: 80,
      emotionalSensitivity: 0.75,
      focusAreas: ['meta_intelligence', 'cross_mode_integration', 'holistic_wisdom', 'life_balance'],
      conversationDepth: 'deep'
    }
  };

  static getConfig(agentType: 'growth' | 'dreams' | 'soul_companion'): AgentSpecificConfig {
    switch (agentType) {
      case 'growth':
        return this.GROWTH_CONFIG;
      case 'dreams':
        return this.DREAMS_CONFIG;
      case 'soul_companion':
        return this.SOUL_COMPANION_CONFIG;
      default:
        return this.SOUL_COMPANION_CONFIG;
    }
  }

  static getACSConfig(agentType: 'growth' | 'dreams' | 'soul_companion'): ACSConfig {
    return this.getConfig(agentType).acs;
  }

  static getPIEConfig(agentType: 'growth' | 'dreams' | 'soul_companion') {
    return this.getConfig(agentType).pie;
  }

  static getBehavioralConfig(agentType: 'growth' | 'dreams' | 'soul_companion') {
    return this.getConfig(agentType).behavioral;
  }

  // Helper method to create a deep copy of configuration
  private static deepCopy<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
  }

  // Method to get personalized config based on user's blueprint
  static getPersonalizedConfig(
    agentType: 'growth' | 'dreams' | 'soul_companion',
    userBlueprint?: any
  ): AgentSpecificConfig {
    const baseConfig = this.getConfig(agentType);
    
    if (!userBlueprint) {
      return baseConfig;
    }

    // Create a deep copy to avoid mutating the original configuration
    const personalizedConfig = this.deepCopy(baseConfig);

    // Track changes made for debugging
    const changes: string[] = [];

    // Adjust based on MBTI preferences
    const mbtiType = userBlueprint.cognition_mbti?.type;
    if (mbtiType) {
      // Introverts get longer silence tolerance
      if (mbtiType.includes('I')) {
        const originalMaxSilent = personalizedConfig.acs.maxSilentMs;
        personalizedConfig.acs.maxSilentMs *= 1.5;
        personalizedConfig.behavioral.pacingMs += 10;
        changes.push(`MBTI-I: maxSilentMs ${originalMaxSilent} -> ${personalizedConfig.acs.maxSilentMs}, pacingMs +10`);
      }
      
      // Feeling types get higher emotional sensitivity
      if (mbtiType.includes('F')) {
        const originalFrustration = personalizedConfig.acs.frustrationThreshold;
        const originalEmotional = personalizedConfig.behavioral.emotionalSensitivity;
        personalizedConfig.acs.frustrationThreshold *= 0.8;
        personalizedConfig.behavioral.emotionalSensitivity = Math.min(1.0, personalizedConfig.behavioral.emotionalSensitivity + 0.1);
        changes.push(`MBTI-F: frustrationThreshold ${originalFrustration} -> ${personalizedConfig.acs.frustrationThreshold}, emotionalSensitivity ${originalEmotional} -> ${personalizedConfig.behavioral.emotionalSensitivity}`);
      }
      
      // Perceiving types get more flexible thresholds
      if (mbtiType.includes('P')) {
        const originalClarification = personalizedConfig.acs.clarificationThreshold;
        personalizedConfig.acs.clarificationThreshold += 0.1;
        personalizedConfig.pie.patternSensitivity = 'sensitive';
        changes.push(`MBTI-P: clarificationThreshold ${originalClarification} -> ${personalizedConfig.acs.clarificationThreshold}, patternSensitivity -> sensitive`);
      }
    }

    // Adjust based on Human Design type
    const hdType = userBlueprint.energy_strategy_human_design?.type;
    if (hdType === 'Reflector') {
      const originalMaxSilent = personalizedConfig.acs.maxSilentMs;
      personalizedConfig.acs.maxSilentMs *= 2; // Reflectors need more processing time
      personalizedConfig.behavioral.conversationDepth = 'deep';
      changes.push(`HD-Reflector: maxSilentMs ${originalMaxSilent} -> ${personalizedConfig.acs.maxSilentMs}, conversationDepth -> deep`);
    } else if (hdType === 'Manifestor') {
      const originalVelocity = personalizedConfig.acs.velocityFloor;
      personalizedConfig.behavioral.responseStyle = 'direct';
      personalizedConfig.acs.velocityFloor += 0.05; // Manifestors prefer faster pace
      changes.push(`HD-Manifestor: responseStyle -> direct, velocityFloor ${originalVelocity} -> ${personalizedConfig.acs.velocityFloor}`);
    }

    // Log changes for debugging
    if (changes.length > 0) {
      console.log(`Personalization changes for ${agentType}:`, changes);
    }

    return personalizedConfig;
  }
}

export const agentConfigurationService = AgentConfigurationService;

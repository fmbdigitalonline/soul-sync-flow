// Autonomous Orchestrator - Coordinates All HACS Systems for Intelligent Autonomous Behavior
// SoulSync Engineering Protocol: Pure orchestration, no duplication

import { PersonalityEngine } from './personality-engine';
import { unifiedBrainContext, VPGBlueprint } from './unified-brain-context';
import { hacsRoutingService } from './hacs-routing-service';
import { VoiceTokenGenerator } from './voice-token-generator';

export interface InterventionDecision {
  shouldIntervene: boolean;
  interventionType: 'micro_learning' | 'insight' | 'guidance' | 'none';
  confidence: number;
  timing: {
    delayMinutes: number;
    reason: string;
  };
  style: {
    tone: string;
    approach: string;
    personalization: string;
  };
}

export interface AutonomousResponse {
  id: string;
  text: string;
  type: 'oracle_wisdom' | 'gentle_insight' | 'direct_guidance';
  personalityAlignment: number;
  timestamp: Date;
}

/**
 * Autonomous Orchestrator - The conductor of intelligent autonomous behavior
 * Coordinates between existing systems without duplicating functionality
 */
export class AutonomousOrchestrator {
  private personalityEngine: PersonalityEngine;

  constructor() {
    this.personalityEngine = new PersonalityEngine();
  }

  /**
   * Decide optimal intervention based on user patterns and personality
   * Uses ALL existing systems in harmony
   */
  async decideOptimalIntervention(userId: string): Promise<InterventionDecision> {
    try {
      console.log('🎭 Autonomous Orchestrator: Analyzing optimal intervention');
      
      // Load personality context from unified brain
      const blueprint = await unifiedBrainContext.loadBlueprint(userId);
      const timingPattern = unifiedBrainContext.getPersonalityTimingPattern(userId);
      const interventionStyle = unifiedBrainContext.getOptimalInterventionStyle(userId);
      
      if (!blueprint || !timingPattern) {
        return this.getDefaultDecision();
      }

      // Use personality engine for timing preferences
      this.personalityEngine.updateBlueprint(blueprint.raw);
      const timingPrefs = this.personalityEngine.extractTimingPreferences();
      
      // Calculate intervention decision
      const shouldIntervene = this.calculateInterventionProbability(blueprint, timingPattern);
      const interventionType = this.selectInterventionType(blueprint, interventionStyle);
      
      return {
        shouldIntervene,
        interventionType,
        confidence: 0.85,
        timing: {
          delayMinutes: timingPrefs.intervalMinutes,
          reason: `Optimized for ${blueprint.personality.traits.energySignature} energy pattern`
        },
        style: {
          tone: timingPrefs.style,
          approach: interventionStyle,
          personalization: blueprint.user.name
        }
      };

    } catch (error) {
      console.error('❌ Autonomous Orchestrator: Decision error:', error);
      return this.getDefaultDecision();
    }
  }

  /**
   * Orchestrate autonomous response using all existing systems
   * No duplication - pure coordination
   */
  async orchestrateAutonomousResponse(
    userId: string,
    trigger: string,
    context: any
  ): Promise<AutonomousResponse | null> {
    try {
      console.log('🎭 Autonomous Orchestrator: Orchestrating response');
      
      // Get decision from decision engine
      const decision = await this.decideOptimalIntervention(userId);
      if (!decision.shouldIntervene) {
        return null;
      }

      // Load personality context
      const blueprint = await unifiedBrainContext.loadBlueprint(userId);
      if (!blueprint) return null;

      // Generate oracle-style prompt using personality engine
      const oraclePrompt = this.personalityEngine.generateOracleStylePrompt(
        decision.interventionType,
        { trigger, context, blueprint: blueprint.raw }
      );

      // Generate personalized phrase using voice token generator
      const personalizedPhrase = VoiceTokenGenerator.generateAutonomousPhrase(
        decision.interventionType,
        blueprint.raw,
        trigger
      );

      // Route through HACS for intelligence learning
      const response = await hacsRoutingService.routeAutonomousInsight(
        {
          type: decision.interventionType,
          trigger,
          context,
          oraclePrompt,
          personalizedPhrase
        },
        blueprint,
        `autonomous_${Date.now()}`
      );

      // Calculate personality alignment score
      const personalityAlignment = this.calculatePersonalityAlignment(
        personalizedPhrase,
        blueprint
      );

      return {
        id: `autonomous_${Date.now()}`,
        text: personalizedPhrase,
        type: this.mapToResponseType(decision.interventionType),
        personalityAlignment,
        timestamp: new Date()
      };

    } catch (error) {
      console.error('❌ Autonomous Orchestrator: Response error:', error);
      return null;
    }
  }

  // PRIVATE HELPER METHODS

  private calculateInterventionProbability(
    blueprint: VPGBlueprint,
    timingPattern: any
  ): boolean {
    // Base probability on personality traits
    const energySignature = blueprint.personality.traits.energySignature;
    const communicationStyle = blueprint.personality.traits.communicationStyle;
    
    let probability = 0.3; // Base 30% chance
    
    // Adjust based on energy signature
    if (energySignature.includes('high-intensity')) {
      probability += 0.2;
    } else if (energySignature.includes('calm')) {
      probability -= 0.1;
    }
    
    // Adjust based on communication style
    if (communicationStyle === 'direct and clear') {
      probability += 0.15;
    } else if (communicationStyle === 'gentle and exploratory') {
      probability -= 0.1;
    }
    
    return Math.random() < Math.min(0.7, Math.max(0.1, probability));
  }

  private selectInterventionType(
    blueprint: VPGBlueprint,
    interventionStyle: string
  ): InterventionDecision['interventionType'] {
    const cognitiveStyle = blueprint.personality.traits.cognitiveStyle;
    const random = Math.random();
    
    // Adjust probabilities based on cognitive style
    if (cognitiveStyle === 'conceptual and abstract') {
      return random < 0.6 ? 'insight' : 'micro_learning';
    } else if (cognitiveStyle === 'concrete and detailed') {
      return random < 0.6 ? 'micro_learning' : 'guidance';
    } else {
      return random < 0.4 ? 'insight' : random < 0.8 ? 'micro_learning' : 'guidance';
    }
  }

  private mapToResponseType(interventionType: string): AutonomousResponse['type'] {
    switch (interventionType) {
      case 'insight':
        return 'oracle_wisdom';
      case 'micro_learning':
        return 'gentle_insight';
      case 'guidance':
        return 'direct_guidance';
      default:
        return 'gentle_insight';
    }
  }

  private calculatePersonalityAlignment(
    response: string,
    blueprint: VPGBlueprint
  ): number {
    // Simple alignment calculation based on response characteristics
    let alignment = 0.5; // Base alignment
    
    const preferences = blueprint.user.preferences;
    const traits = blueprint.personality.traits;
    
    // Check tone alignment
    if (preferences.tone === 'direct' && response.includes('!')) {
      alignment += 0.2;
    } else if (preferences.tone === 'gentle' && response.includes('?')) {
      alignment += 0.2;
    }
    
    // Check communication style alignment
    if (traits.communicationStyle === 'gentle and exploratory' && response.includes('explore')) {
      alignment += 0.15;
    } else if (traits.communicationStyle === 'direct and clear' && response.length < 100) {
      alignment += 0.15;
    }
    
    return Math.min(1.0, Math.max(0.0, alignment));
  }

  private getDefaultDecision(): InterventionDecision {
    return {
      shouldIntervene: false,
      interventionType: 'none',
      confidence: 0.1,
      timing: {
        delayMinutes: 120,
        reason: 'Default timing - personality data unavailable'
      },
      style: {
        tone: 'gentle',
        approach: 'adaptive',
        personalization: 'friend'
      }
    };
  }
}
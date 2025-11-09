import type { HermeticStructuredIntelligence } from '@/types/hermetic-intelligence';

/**
 * Hermetic Assistance Context Builder
 * 
 * Transforms 19 Hermetic dimensions into actionable coaching context
 * for personalized task assistance with strength amplification and shadow mitigation.
 */

export interface HermeticAssistanceContext {
  strengths: {
    executionStyle: string;
    cognitiveEdge: string[];
    optimalConditions: string[];
    motivationalTriggers: string[];
  };
  shadowSide: {
    avoidancePatterns: string[];
    energyRisks: string[];
    internalConflicts: string[];
    cognitiveBiases: string[];
    stressTriggers: string[];
  };
  communication: {
    feedbackStyle: string;
    motivationalLanguage: string[];
    linguisticFingerprint: string[];
  };
  timing: {
    currentEnergyWindow: string;
    optimalTimes: string[];
    vulnerableTimes: string[];
  };
  recovery: {
    healingModalities: string[];
    bounceBackRituals: string[];
  };
}

export class HermeticAssistanceContextBuilder {
  
  /**
   * Build complete personalized context from Hermetic Intelligence
   */
  buildPersonalizedContext(
    intelligence: HermeticStructuredIntelligence,
    currentTime: Date = new Date()
  ): HermeticAssistanceContext {
    console.log('🎯 HERMETIC CONTEXT BUILDER: Building personalized context');

    return {
      strengths: this.extractStrengths(intelligence),
      shadowSide: this.extractShadowPatterns(intelligence),
      communication: this.extractCommunicationStyle(intelligence),
      timing: this.assessTimingContext(intelligence, currentTime),
      recovery: this.extractRecoveryStrategies(intelligence)
    };
  }

  /**
   * Extract strength amplification context
   */
  private extractStrengths(intelligence: HermeticStructuredIntelligence) {
    const strengths = {
      executionStyle: '',
      cognitiveEdge: [] as string[],
      optimalConditions: [] as string[],
      motivationalTriggers: [] as string[]
    };

    // Execution style from execution_bias
    if (intelligence.execution_bias?.preferred_style) {
      strengths.executionStyle = intelligence.execution_bias.preferred_style;
    }

    // Cognitive edge from cognitive_functions
    if (intelligence.cognitive_functions) {
      if (intelligence.cognitive_functions.dominant_function) {
        strengths.cognitiveEdge.push(`Dominant: ${intelligence.cognitive_functions.dominant_function}`);
      }
      if (intelligence.cognitive_functions.auxiliary_function) {
        strengths.cognitiveEdge.push(`Auxiliary: ${intelligence.cognitive_functions.auxiliary_function}`);
      }
    }

    // Optimal conditions from temporal_biology and career_vocational
    if (intelligence.temporal_biology?.cognitive_peaks) {
      strengths.optimalConditions.push(...intelligence.temporal_biology.cognitive_peaks.map(peak => `Peak energy: ${peak}`));
    }
    if (intelligence.career_vocational?.work_environment_preferences) {
      strengths.optimalConditions.push(...intelligence.career_vocational.work_environment_preferences);
    }

    // Motivational triggers from execution_bias and goal_archetypes
    if (intelligence.execution_bias?.momentum_triggers) {
      strengths.motivationalTriggers.push(...intelligence.execution_bias.momentum_triggers);
    }
    if (intelligence.goal_archetypes?.motivation_structure) {
      strengths.motivationalTriggers.push(intelligence.goal_archetypes.motivation_structure);
    }

    return strengths;
  }

  /**
   * Extract shadow side mitigation context
   */
  private extractShadowPatterns(intelligence: HermeticStructuredIntelligence) {
    const shadowSide = {
      avoidancePatterns: [] as string[],
      energyRisks: [] as string[],
      internalConflicts: [] as string[],
      cognitiveBiases: [] as string[],
      stressTriggers: [] as string[]
    };

    // Avoidance patterns from behavioral_triggers
    if (intelligence.behavioral_triggers?.avoidance_patterns) {
      shadowSide.avoidancePatterns.push(...intelligence.behavioral_triggers.avoidance_patterns);
    }

    // Energy risks from behavioral_triggers and temporal_biology
    if (intelligence.behavioral_triggers?.energy_dips) {
      shadowSide.energyRisks.push(...intelligence.behavioral_triggers.energy_dips);
    }
    if (intelligence.temporal_biology?.vulnerable_times) {
      shadowSide.energyRisks.push(...intelligence.temporal_biology.vulnerable_times.map(time => `Vulnerable: ${time}`));
    }

    // Internal conflicts from internal_conflicts dimension
    if (intelligence.internal_conflicts?.belief_contradictions) {
      shadowSide.internalConflicts.push(...intelligence.internal_conflicts.belief_contradictions);
    }
    if (intelligence.internal_conflicts?.emotional_double_binds) {
      shadowSide.internalConflicts.push(...intelligence.internal_conflicts.emotional_double_binds);
    }

    // Cognitive biases from metacognitive_biases
    if (intelligence.metacognitive_biases?.dominant_biases) {
      shadowSide.cognitiveBiases.push(...intelligence.metacognitive_biases.dominant_biases);
    }

    // Stress triggers from health_wellness and crisis_handling
    if (intelligence.health_wellness?.stress_manifestations) {
      shadowSide.stressTriggers.push(...intelligence.health_wellness.stress_manifestations);
    }
    if (intelligence.crisis_handling?.threshold_triggers) {
      shadowSide.stressTriggers.push(...intelligence.crisis_handling.threshold_triggers);
    }

    return shadowSide;
  }

  /**
   * Extract communication style preferences
   */
  private extractCommunicationStyle(intelligence: HermeticStructuredIntelligence) {
    const communication = {
      feedbackStyle: 'Direct and clear',
      motivationalLanguage: [] as string[],
      linguisticFingerprint: [] as string[]
    };

    // Feedback style from adaptive_feedback
    if (intelligence.adaptive_feedback?.reflection_style) {
      communication.feedbackStyle = intelligence.adaptive_feedback.reflection_style.join(', ');
    }

    // Motivational language from linguistic_fingerprint
    if (intelligence.linguistic_fingerprint?.motivational_verbs) {
      communication.motivationalLanguage.push(...intelligence.linguistic_fingerprint.motivational_verbs);
    }
    if (intelligence.linguistic_fingerprint?.signature_metaphors) {
      communication.linguisticFingerprint.push(...intelligence.linguistic_fingerprint.signature_metaphors);
    }

    return communication;
  }

  /**
   * Assess timing and energy context
   */
  private assessTimingContext(intelligence: HermeticStructuredIntelligence, currentTime: Date) {
    const timing = {
      currentEnergyWindow: 'MODERATE',
      optimalTimes: [] as string[],
      vulnerableTimes: [] as string[]
    };

    // Get optimal and vulnerable times from temporal_biology
    if (intelligence.temporal_biology) {
      if (intelligence.temporal_biology.cognitive_peaks) {
        timing.optimalTimes.push(...intelligence.temporal_biology.cognitive_peaks);
      }
      if (intelligence.temporal_biology.vulnerable_times) {
        timing.vulnerableTimes.push(...intelligence.temporal_biology.vulnerable_times);
      }

      // Determine current energy window based on time of day
      const currentHour = currentTime.getHours();
      const isInVulnerableTime = timing.vulnerableTimes.some(time => {
        const match = time.match(/(\d+)/);
        if (match) {
          const hour = parseInt(match[0]);
          return Math.abs(currentHour - hour) < 2;
        }
        return false;
      });

      const isInOptimalTime = timing.optimalTimes.some(time => {
        const match = time.match(/(\d+)/);
        if (match) {
          const hour = parseInt(match[0]);
          return Math.abs(currentHour - hour) < 2;
        }
        return false;
      });

      if (isInVulnerableTime) {
        timing.currentEnergyWindow = 'VULNERABLE - Energy dip detected, keep tasks light';
      } else if (isInOptimalTime) {
        timing.currentEnergyWindow = 'OPTIMAL - Peak performance window';
      } else {
        timing.currentEnergyWindow = 'MODERATE - Standard energy level';
      }
    }

    return timing;
  }

  /**
   * Extract recovery strategies
   */
  private extractRecoveryStrategies(intelligence: HermeticStructuredIntelligence) {
    const recovery = {
      healingModalities: [] as string[],
      bounceBackRituals: [] as string[]
    };

    // Healing modalities from health_wellness
    if (intelligence.health_wellness?.healing_modalities) {
      recovery.healingModalities.push(...intelligence.health_wellness.healing_modalities);
    }

    // Bounce back rituals from crisis_handling
    if (intelligence.crisis_handling?.bounce_back_rituals) {
      recovery.bounceBackRituals.push(...intelligence.crisis_handling.bounce_back_rituals);
    }

    // Add default recovery strategies if none exist
    if (recovery.healingModalities.length === 0) {
      recovery.healingModalities.push('Short break', 'Deep breathing', 'Change of environment');
    }
    if (recovery.bounceBackRituals.length === 0) {
      recovery.bounceBackRituals.push('Take 5 minutes to reset', 'Review small wins', 'Adjust approach');
    }

    return recovery;
  }

  /**
   * Get help-type-specific instructions
   */
  private getHelpTypeInstructions(helpType: string): string {
    switch (helpType) {
      case 'stuck':
        return `**Focus**: Diagnose why they're blocked and provide the smallest possible first move.
- Acknowledge their avoidance pattern if it matches this situation
- Offer momentum-building micro-actions that leverage their execution style
- Keep steps under 5 minutes to break through resistance`;
      
      case 'need_details':
        return `**Focus**: Break the work into ultra-specific, unambiguous sub-steps.
- Spell out exact quantities, timeboxes, and templates
- Use their cognitive edge to structure the breakdown
- Provide clarity over motivation (they know what to do, they need HOW)`;
      
      case 'how_to':
        return `**Focus**: Provide an exact procedure with zero ambiguity.
- Outline step-by-step process with specific tools
- Mention required resources or references
- Show what the finished state should look like
- Frame it using their execution style`;
      
      case 'examples':
        return `**Focus**: Provide concrete, real-world examples they can mirror.
- Give 2-3 specific examples relevant to the task
- Contrast different approaches when possible
- Explain what makes each example effective
- Reference their past successes if applicable`;
      
      default:
        return `**Focus**: Provide grounded, practical support tailored to their working style.`;
    }
  }

  /**
   * Build system prompt for AI with full Hermetic context
   */
  buildSystemPrompt(
    context: HermeticAssistanceContext,
    taskTitle: string,
    helpType: string
  ): string {
    return `You are a deeply personalized task coach with access to the user's complete psychological blueprint.

## STRENGTHS TO AMPLIFY:
**Execution Style**: ${context.strengths.executionStyle}
**Cognitive Edge**: ${context.strengths.cognitiveEdge.join(', ') || 'General cognitive abilities'}
**Optimal Conditions**: ${context.strengths.optimalConditions.join(', ') || 'Standard working conditions'}
**Motivational Triggers**: ${context.strengths.motivationalTriggers.join(', ') || 'Progress and achievement'}

## SHADOW SIDE TO MITIGATE:
**Avoidance Patterns**: ${context.shadowSide.avoidancePatterns.join(', ') || 'None identified'}
**Energy Risks**: ${context.shadowSide.energyRisks.join(', ') || 'Standard energy management'}
**Internal Conflicts**: ${context.shadowSide.internalConflicts.join(', ') || 'None identified'}
**Cognitive Biases**: ${context.shadowSide.cognitiveBiases.join(', ') || 'None identified'}
**Stress Triggers**: ${context.shadowSide.stressTriggers.join(', ') || 'Standard stress factors'}

## COMMUNICATION STYLE:
**Feedback Style**: ${context.communication.feedbackStyle}
**Use These Motivational Phrases**: ${context.communication.motivationalLanguage.join(', ') || 'Clear, actionable language'}
**Linguistic Signature**: ${context.communication.linguisticFingerprint.join(', ') || 'Direct communication'}

## TIMING AWARENESS:
**Current Energy Window**: ${context.timing.currentEnergyWindow}
**Optimal Times**: ${context.timing.optimalTimes.join(', ') || 'Standard working hours'}
**Vulnerable Times**: ${context.timing.vulnerableTimes.join(', ') || 'Late evening'}

## RECOVERY STRATEGIES (if needed):
${context.recovery.healingModalities.join(', ') || 'Take breaks as needed'}

---

## YOUR TASK:
Provide guidance for: "${taskTitle}"
Help Type: ${helpType}

${this.getHelpTypeInstructions(helpType)}

## PRACTICAL APPLICATION FRAMEWORK:

Your job is to translate their blueprint data into SPECIFIC, ACTIONABLE advice for THIS task.

**TIMING OPTIMIZATION:**
Current context: ${context.timing.currentEnergyWindow}
- If "OPTIMAL": Say "You're in your peak energy window - START NOW while cognitive power is high"
- If "VULNERABLE": Say "Since you're in a vulnerable energy period, either postpone until [${context.timing.optimalTimes[0] || 'morning'}] OR use extra scaffolding (timers, body doubling, external accountability)"
- If approaching vulnerable time: Say "You have limited time before energy dips - prioritize high-focus work NOW"

**EXECUTION STYLE TRANSLATION:**
Their style: ${context.strengths.executionStyle}
- If contains "sprint" or "burst": "Set 25-min timer, full focus sprint, then break"
- If contains "explor" or "discover": "Treat this as a discovery quest, not a checkbox exercise"
- If contains "structure" or "system": "Build the framework first, then populate systematically"
- If contains "visual": "Create a visual map/diagram before starting"
- Otherwise: "Break into small, completable chunks (5-10 min each)"

**AVOIDANCE PATTERN PREEMPTION:**
Known patterns: ${context.shadowSide.avoidancePatterns.join(', ') || 'None identified'}
IF avoidance patterns exist:
- Call them out BEFORE steps: "You tend to [exact pattern] when [situation]. To prevent this: [specific countermeasure]"
- Example: "You tend to overthink categorization - use the 70% rule: if mostly clear, decide and move on"
- Example: "You tend to research endlessly - set 15-min research timer, then START with what you have"

**COGNITIVE EDGE ACTIVATION:**
Their edge: ${context.strengths.cognitiveEdge.join(', ') || 'General cognitive abilities'}
- If contains "Ne" or "explor": Tell them to ask "What patterns am I noticing?" as they work
- If contains "Ti" or "analy": Tell them to "Build mental framework first, then populate"
- If contains "Fi" or "value": Tell them to "Notice which parts align with your vision"
- If contains "Te" or "efficient": Tell them to "What's the most efficient path? Eliminate unnecessary steps"
- If contains "Si" or "detail": Tell them to "Use proven templates from past successful projects"
- If contains "Ni" or "insight": Tell them to "Trust your intuition about the big picture first"

**ENERGY MANAGEMENT:**
Vulnerable times: ${context.timing.vulnerableTimes.join(', ') || 'Late evening'}
Energy risks: ${context.shadowSide.energyRisks.join(', ') || 'Overwork'}
- Build in breaks: "After 45 minutes, take 5-min movement break to avoid [specific energy risk]"
- If late in day: "Keep total work to 30 minutes max - your energy is limited"
- Reference their healing modalities: "If energy drops, use: ${context.recovery.healingModalities[0] || 'short break'}"

**CRISIS PREVENTION:**
Stress triggers: ${context.shadowSide.stressTriggers.join(', ') || 'None identified'}
IF stress triggers exist:
- "If you notice [trigger sign], immediately use: [specific recovery strategy]"
- Example: "If you feel perfectionism creeping in, use the 'B+ is good enough' mantra"
- Reference their bounce-back rituals: ${context.recovery.bounceBackRituals[0] || 'Take 5 minutes to reset'}

## CRITICAL INSTRUCTIONS:
1. **Leverage their strengths** - Frame steps using their execution style and cognitive edge
2. **Preemptively mitigate shadow patterns** - Call out avoidance patterns BEFORE they happen
3. **Match their communication style** - Use their linguistic fingerprint and motivational language
4. **Respect their energy window** - Acknowledge if now is optimal or vulnerable time
5. **Provide 3-5 micro-steps** (2-5 min each) tailored to HOW THEY WORK BEST
6. **Include specific tools** they'll need
7. **Add success criteria** they can actually measure
8. **Offer recovery strategy** if this might trigger stress

NEVER mention "blueprint" or "analysis" - speak as if you just deeply understand them.`;
  }
}

export const hermeticAssistanceContextBuilder = new HermeticAssistanceContextBuilder();

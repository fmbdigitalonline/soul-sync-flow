import type { HermeticStructuredIntelligence } from '@/types/hermetic-intelligence';

/**
 * Agentic Mini-Tools for Task Assistance
 * 
 * These tools provide personalized micro-coaching and execution support
 * for journey tasks, leveraging deep hermetic intelligence.
 */
export class JourneyAgenticTools {
  /**
   * Generate a personalized task decomposition mini-program
   */
  static async generateTaskAssistant(
    task: any,
    hermeticData: HermeticStructuredIntelligence | null,
    blueprintData: any
  ): Promise<{
    checklistSteps: string[];
    anticipatedBlockers: string[];
    motivationalFraming: string;
    timeOptimization: string;
  }> {
    if (!hermeticData) {
      // Fallback to blueprint-based assistance
      return this.generateBlueprintBasedAssistant(task, blueprintData);
    }

    const executionBias = hermeticData.execution_bias;
    const behavioralTriggers = hermeticData.behavioral_triggers;
    const temporalBiology = hermeticData.temporal_biology;

    return {
      checklistSteps: this.generatePersonalizedChecklist(task, executionBias),
      anticipatedBlockers: behavioralTriggers?.avoidance_patterns || [],
      motivationalFraming: this.frameForMotivation(task, hermeticData.identity_constructs),
      timeOptimization: this.suggestOptimalTime(task, temporalBiology)
    };
  }

  /**
   * Generate milestone completion celebration tool
   */
  static async generateCelebrationRitual(
    milestone: any,
    hermeticData: HermeticStructuredIntelligence | null
  ): Promise<string> {
    if (!hermeticData?.identity_constructs) {
      return `🎉 Celebrate completing "${milestone.title}"! Take a moment to acknowledge your progress.`;
    }

    const celebrationStyle = hermeticData.identity_constructs.celebration_preferences || 
      'Reflect on your achievement and share it with someone who matters';

    return `🎉 ${celebrationStyle}\n\nMilestone Completed: ${milestone.title}\n\nThis achievement honors your journey and aligns with your unique path.`;
  }

  /**
   * Generate obstacle navigation support
   */
  static generateObstacleNavigator(
    task: any,
    hermeticData: HermeticStructuredIntelligence | null
  ): {
    commonObstacles: string[];
    personalizedStrategies: string[];
    recoveryProtocol: string;
  } {
    if (!hermeticData) {
      return {
        commonObstacles: ['Procrastination', 'Lack of clarity', 'Low motivation'],
        personalizedStrategies: ['Break task into smaller steps', 'Set a timer for 25 minutes', 'Reward yourself after completion'],
        recoveryProtocol: 'Take a break, reassess, and start with the easiest subtask'
      };
    }

    const avoidancePatterns = hermeticData.behavioral_triggers?.avoidance_patterns || [];
    const crisisHandling = hermeticData.crisis_handling || {};

    return {
      commonObstacles: avoidancePatterns,
      personalizedStrategies: this.createAvoidanceStrategies(avoidancePatterns, hermeticData.execution_bias),
      recoveryProtocol: crisisHandling.recovery_protocol || 'Pause, breathe, and reconnect with your why'
    };
  }

  // ============================================
  // PRIVATE HELPER METHODS
  // ============================================

  private static generatePersonalizedChecklist(task: any, executionBias: any): string[] {
    const baseSteps = [
      'Review task objective and success criteria',
      'Gather necessary resources and tools',
      'Create focused work environment',
      'Execute core task activities',
      'Review and validate completion'
    ];

    if (executionBias?.completion_patterns?.includes('iterative')) {
      baseSteps.splice(3, 0, 'Complete first iteration', 'Gather feedback and refine');
    }

    if (executionBias?.momentum_triggers?.includes('early_wins')) {
      baseSteps.unshift('Identify and complete one quick win first');
    }

    return baseSteps;
  }

  private static frameForMotivation(task: any, identityConstructs: any): string {
    if (!identityConstructs?.core_narratives || identityConstructs.core_narratives.length === 0) {
      return `This task moves you closer to your goal: ${task.title}`;
    }

    const primaryNarrative = identityConstructs.core_narratives[0];
    return `${task.title} aligns with your nature as someone who ${primaryNarrative.toLowerCase()}. Each step forward is authentic to who you are.`;
  }

  private static suggestOptimalTime(task: any, temporalBiology: any): string {
    if (!temporalBiology?.cognitive_peaks || temporalBiology.cognitive_peaks.length === 0) {
      return 'Schedule during your natural energy peaks';
    }

    const peakTimes = temporalBiology.cognitive_peaks.join(', ');
    const energyLevel = task.energy_level_required || 'medium';

    if (energyLevel === 'high') {
      return `Best during peak cognitive times: ${peakTimes}`;
    } else if (energyLevel === 'low') {
      return `Can be done during lower energy periods, outside of: ${peakTimes}`;
    }

    return `Ideal during steady focus periods, consider: ${peakTimes}`;
  }

  private static generateBlueprintBasedAssistant(task: any, blueprintData: any): {
    checklistSteps: string[];
    anticipatedBlockers: string[];
    motivationalFraming: string;
    timeOptimization: string;
  } {
    const mbtiType = blueprintData?.cognition_mbti?.type || 'Unknown';
    const hdStrategy = blueprintData?.energy_strategy_human_design?.strategy || 'trust your instincts';

    return {
      checklistSteps: [
        'Clarify task objective',
        'Gather resources',
        'Execute with focus',
        'Review completion'
      ],
      anticipatedBlockers: ['Perfectionism', 'Overthinking', 'Distraction'],
      motivationalFraming: `This task honors your ${mbtiType} approach and ${hdStrategy} strategy.`,
      timeOptimization: 'Schedule during your natural energy peaks'
    };
  }

  private static createAvoidanceStrategies(avoidancePatterns: string[], executionBias: any): string[] {
    const strategies: string[] = [];

    if (avoidancePatterns.includes('analysis_paralysis')) {
      strategies.push('Set 10-minute research timer, then move to action');
    }

    if (avoidancePatterns.includes('perfectionism')) {
      strategies.push('Commit to "good enough" first draft, refine later');
    }

    if (avoidancePatterns.includes('procrastination')) {
      const momentumTriggers = executionBias?.momentum_triggers || [];
      if (momentumTriggers.includes('social_accountability')) {
        strategies.push('Share your commitment with someone and set check-in time');
      } else {
        strategies.push('Use 2-minute rule: start with smallest possible first step');
      }
    }

    if (strategies.length === 0) {
      strategies.push('Break task into 15-minute focused work blocks');
    }

    return strategies;
  }
}

export const journeyAgenticTools = JourneyAgenticTools;

/**
 * Adaptive Context Scheduler - Finite State Machine Implementation
 * Patent Enhancement: Formal FSM with multi-armed bandit parameter tuning
 */

export type ACSState = 'NORMAL' | 'STUCK' | 'FRUSTRATED' | 'IDLE' | 'EXCITED' | 'CONFUSED';

export interface ACSMetrics {
  conversationVelocity: number; // tokens per minute
  tokenExchangeRate: number; // user tokens / assistant tokens
  sentimentSlope: number; // trend over last 5 messages
  repetitionFrequency: number; // how often user repeats concepts
  engagementLevel: number;
}

export interface ACSTransition {
  from: ACSState;
  to: ACSState;
  condition: (metrics: ACSMetrics) => boolean;
  confidence: number;
  learnedThreshold: number;
}

export interface ACSStateConfig {
  promptTemplate: string;
  systemMessage: string;
  personalityModulation: {
    humor: number; // -1 to 1
    formality: number; // -1 to 1
    empathy: number; // -1 to 1
    directness: number; // -1 to 1
  };
}

export class AdaptiveContextSchedulerFSM {
  private currentState: ACSState = 'NORMAL';
  private stateHistory: Array<{ state: ACSState; timestamp: number; metrics: ACSMetrics }> = [];
  private transitions: ACSTransition[] = [];
  private stateConfigs: Map<ACSState, ACSStateConfig> = new Map();
  private banditArms: Map<string, { pulls: number; reward: number }> = new Map();
  private learningRate: number = 0.05;

  constructor() {
    this.initializeStateConfigs();
    this.initializeTransitions();
  }

  /**
   * Patent Claim Element: Formal finite-state machine with learnable thresholds
   */
  private initializeTransitions(): void {
    this.transitions = [
      {
        from: 'NORMAL',
        to: 'STUCK',
        condition: (m) => m.repetitionFrequency > this.getLearnedThreshold('normal_to_stuck'),
        confidence: 0.8,
        learnedThreshold: 0.6
      },
      {
        from: 'NORMAL',
        to: 'FRUSTRATED',
        condition: (m) => m.sentimentSlope < this.getLearnedThreshold('normal_to_frustrated'),
        confidence: 0.75,
        learnedThreshold: -0.3
      },
      {
        from: 'NORMAL',
        to: 'IDLE',
        condition: (m) => m.conversationVelocity < this.getLearnedThreshold('normal_to_idle'),
        confidence: 0.9,
        learnedThreshold: 5.0
      },
      {
        from: 'STUCK',
        to: 'NORMAL',
        condition: (m) => m.tokenExchangeRate > this.getLearnedThreshold('stuck_to_normal'),
        confidence: 0.85,
        learnedThreshold: 1.2
      },
      {
        from: 'FRUSTRATED',
        to: 'NORMAL',
        condition: (m) => m.sentimentSlope > this.getLearnedThreshold('frustrated_to_normal'),
        confidence: 0.8,
        learnedThreshold: 0.1
      },
      // Additional transitions...
    ];
  }

  /**
   * Patent Claim Element: Multi-armed bandit threshold tuning
   */
  private getLearnedThreshold(transitionKey: string): number {
    const arm = this.banditArms.get(transitionKey);
    if (!arm) {
      // Initialize with default threshold
      const defaultThresholds: Record<string, number> = {
        'normal_to_stuck': 0.6,
        'normal_to_frustrated': -0.3,
        'normal_to_idle': 5.0,
        'stuck_to_normal': 1.2,
        'frustrated_to_normal': 0.1
      };
      const defaultValue = defaultThresholds[transitionKey] || 0.5;
      this.banditArms.set(transitionKey, { pulls: 1, reward: 0.5 });
      return defaultValue;
    }
    
    // UCB1 algorithm for threshold selection
    const totalPulls = Array.from(this.banditArms.values())
      .reduce((sum, a) => sum + a.pulls, 0);
    
    const avgReward = arm.reward / arm.pulls;
    const confidenceInterval = Math.sqrt((2 * Math.log(totalPulls)) / arm.pulls);
    
    return avgReward + confidenceInterval;
  }

  /**
   * Patent Claim Element: State transition with metrics evaluation
   */
  processMetrics(metrics: ACSMetrics): { stateChanged: boolean; newState: ACSState } {
    const previousState = this.currentState;
    
    // Find applicable transitions
    const validTransitions = this.transitions.filter(t => t.from === this.currentState);
    
    for (const transition of validTransitions) {
      if (transition.condition(metrics)) {
        this.currentState = transition.to;
        
        // Record state change for learning
        this.recordStateTransition(previousState, this.currentState, metrics, transition);
        
        console.log(`🤖 ACS State Transition: ${previousState} → ${this.currentState}`);
        console.log(`📊 Triggering Metrics:`, {
          velocity: metrics.conversationVelocity,
          exchange: metrics.tokenExchangeRate,
          sentiment: metrics.sentimentSlope,
          repetition: metrics.repetitionFrequency
        });
        
        return { stateChanged: true, newState: this.currentState };
      }
    }
    
    return { stateChanged: false, newState: this.currentState };
  }

  /**
   * Patent Claim Element: Dynamic prompt template switching
   */
  private initializeStateConfigs(): void {
    this.stateConfigs.set('NORMAL', {
      promptTemplate: "Continue our conversation naturally, building on the context.",
      systemMessage: "You are a balanced AI coach providing thoughtful guidance.",
      personalityModulation: { humor: 0, formality: 0, empathy: 0, directness: 0 }
    });
    
    this.stateConfigs.set('STUCK', {
      promptTemplate: "The user seems stuck. Provide gentle redirection and new perspectives.",
      systemMessage: "You are a patient guide helping someone work through challenges.",
      personalityModulation: { humor: -0.2, formality: -0.3, empathy: 0.4, directness: 0.3 }
    });
    
    this.stateConfigs.set('FRUSTRATED', {
      promptTemplate: "The user appears frustrated. Acknowledge their feelings and offer support.",
      systemMessage: "You are an empathetic counselor focused on emotional support.",
      personalityModulation: { humor: -0.4, formality: -0.5, empathy: 0.7, directness: -0.2 }
    });
    
    this.stateConfigs.set('IDLE', {
      promptTemplate: "Re-engage the user with a thought-provoking question or insight.",
      systemMessage: "You are an engaging conversationalist sparking new ideas.",
      personalityModulation: { humor: 0.3, formality: -0.2, empathy: 0.1, directness: 0.4 }
    });
    
    // Additional state configurations...
  }

  getCurrentStateConfig(): ACSStateConfig | undefined {
    return this.stateConfigs.get(this.currentState);
  }

  /**
   * Patent Claim Element: Feedback-based learning for threshold adjustment
   */
  recordFeedback(wasHelpful: boolean, transitionKey?: string): void {
    if (transitionKey) {
      const arm = this.banditArms.get(transitionKey);
      if (arm) {
        const reward = wasHelpful ? 1.0 : 0.0;
        arm.reward = arm.reward * (1 - this.learningRate) + reward * this.learningRate;
        arm.pulls += 1;
        
        console.log(`🎯 ACS Bandit Learning: ${transitionKey} → reward: ${reward}, avg: ${(arm.reward / arm.pulls).toFixed(3)}`);
      }
    }
  }

  private recordStateTransition(
    from: ACSState,
    to: ACSState,
    metrics: ACSMetrics,
    transition: ACSTransition
  ): void {
    this.stateHistory.push({
      state: to,
      timestamp: Date.now(),
      metrics: { ...metrics }
    });
    
    // Keep history bounded
    if (this.stateHistory.length > 100) {
      this.stateHistory = this.stateHistory.slice(-50);
    }
  }

  getStateHistory(): Array<{ state: ACSState; timestamp: number; metrics: ACSMetrics }> {
    return [...this.stateHistory];
  }

  getCurrentState(): ACSState {
    return this.currentState;
  }
}

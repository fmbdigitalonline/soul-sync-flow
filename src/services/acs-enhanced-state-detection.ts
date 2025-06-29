import { DialogueState, DialogueHealthMetrics, ACSConfig, StateTransition } from "@/types/acs-types";

export class ACSEnhancedStateDetection {
  private stateHistory: StateTransition[] = [];
  private idleTimer: NodeJS.Timeout | null = null;
  private silenceStartTime: number | null = null;

  detectState(metrics: DialogueHealthMetrics, config: ACSConfig, currentState: DialogueState): {
    newState: DialogueState;
    confidence: number;
    trigger: string;
  } {
    console.log("🔍 ACS Enhanced State Detection - Analyzing metrics:", metrics);
    console.log("⚙️ Config thresholds:", config);
    
    // Enhanced frustration detection with multiple indicators
    if (this.detectFrustrationState(metrics, config)) {
      return {
        newState: 'FRUSTRATION_DETECTED',
        confidence: 0.9,
        trigger: `Frustration score ${metrics.frustrationScore.toFixed(3)} >= threshold ${config.frustrationThreshold}`
      };
    }
    
    // Enhanced clarification detection
    if (this.detectClarificationNeeded(metrics, config)) {
      return {
        newState: 'CLARIFICATION_NEEDED',
        confidence: 0.8,
        trigger: `Sentiment slope ${metrics.sentimentSlope.toFixed(3)} <= threshold ${config.sentimentSlopeNeg} or confusion signals detected`
      };
    }
    
    // Idle state detection (checked separately via timer)
    if (this.detectIdleState(metrics, config)) {
      return {
        newState: 'IDLE',
        confidence: 0.95,
        trigger: `Silent duration ${metrics.silentDuration}ms >= threshold ${config.maxSilentMs}ms`
      };
    }
    
    // High engagement detection
    if (this.detectHighEngagement(metrics, config)) {
      return {
        newState: 'HIGH_ENGAGEMENT',
        confidence: 0.7,
        trigger: `Conversation velocity ${metrics.conversationVelocity.toFixed(3)} >= ${config.velocityFloor * 2}`
      };
    }
    
    return {
      newState: 'NORMAL',
      confidence: 0.6,
      trigger: 'No specific state triggers detected'
    };
  }

  private detectFrustrationState(metrics: DialogueHealthMetrics, config: ACSConfig): boolean {
    // Multi-factor frustration detection
    const frustrationFactors = [];
    
    // Direct frustration score
    if (metrics.frustrationScore >= config.frustrationThreshold) {
      frustrationFactors.push('High frustration score');
    }
    
    // Negative sentiment combined with help signals
    if (metrics.sentimentSlope < -0.3 && metrics.helpSignals.length > 0) {
      frustrationFactors.push('Negative sentiment with help signals');
    }
    
    // Repetitive negative feedback patterns
    const negativeSignals = metrics.helpSignals.filter(signal => 
      signal.type === 'negative_feedback' && signal.confidence > 0.7
    );
    if (negativeSignals.length >= 2) {
      frustrationFactors.push('Multiple negative feedback signals');
    }
    
    console.log("😤 Frustration factors detected:", frustrationFactors);
    return frustrationFactors.length > 0;
  }

  private detectClarificationNeeded(metrics: DialogueHealthMetrics, config: ACSConfig): boolean {
    // Enhanced clarification detection
    const clarificationFactors = [];
    
    // Sentiment slope threshold
    if (metrics.sentimentSlope <= config.sentimentSlopeNeg) {
      clarificationFactors.push('Sentiment slope below threshold');
    }
    
    // Confusion patterns
    const confusionSignals = metrics.helpSignals.filter(signal => 
      signal.type === 'confusion_pattern' && signal.confidence > config.clarificationThreshold
    );
    if (confusionSignals.length > 0) {
      clarificationFactors.push('Confusion patterns detected');
    }
    
    // Low conversation velocity with questions
    if (metrics.conversationVelocity < config.velocityFloor * 0.5 && metrics.helpSignals.length > 0) {
      clarificationFactors.push('Low engagement with help signals');
    }
    
    console.log("❓ Clarification factors detected:", clarificationFactors);
    return clarificationFactors.length > 0;
  }

  private detectIdleState(metrics: DialogueHealthMetrics, config: ACSConfig): boolean {
    return metrics.silentDuration >= config.maxSilentMs;
  }

  private detectHighEngagement(metrics: DialogueHealthMetrics, config: ACSConfig): boolean {
    return metrics.conversationVelocity >= config.velocityFloor * 2 && 
           metrics.sentimentSlope > 0.2;
  }

  // Real-time idle monitoring
  startIdleMonitoring(config: ACSConfig, onIdleDetected: () => void): void {
    this.resetIdleTimer();
    this.silenceStartTime = Date.now();
    
    this.idleTimer = setTimeout(() => {
      console.log("⏰ ACS Idle State Detected - No user activity for", config.maxSilentMs, "ms");
      onIdleDetected();
    }, config.maxSilentMs);
  }

  resetIdleTimer(): void {
    if (this.idleTimer) {
      clearTimeout(this.idleTimer);
      this.idleTimer = null;
    }
    this.silenceStartTime = null;
  }

  getCurrentSilentDuration(): number {
    if (!this.silenceStartTime) return 0;
    return Date.now() - this.silenceStartTime;
  }

  recordStateTransition(from: DialogueState, to: DialogueState, trigger: string, confidence: number): void {
    const transition: StateTransition = {
      fromState: from,
      toState: to,
      trigger,
      timestamp: Date.now(),
      confidence
    };
    
    this.stateHistory.push(transition);
    console.log("🔄 State transition recorded:", transition);
    
    // Keep only recent transitions (last 50)
    if (this.stateHistory.length > 50) {
      this.stateHistory = this.stateHistory.slice(-50);
    }
  }

  getStateTransitionHistory(): StateTransition[] {
    return [...this.stateHistory];
  }

  getStateTransitionCount(): number {
    return this.stateHistory.length;
  }
}

export const acsEnhancedStateDetection = new ACSEnhancedStateDetection();

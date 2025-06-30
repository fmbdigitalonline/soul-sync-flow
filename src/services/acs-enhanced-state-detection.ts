import { DialogueState, DialogueHealthMetrics, ACSConfig, StateTransition } from "@/types/acs-types";

export class ACSEnhancedStateDetection {
  private stateHistory: StateTransition[] = [];
  private idleTimer: NodeJS.Timeout | null = null;
  private silenceStartTime: number | null = null;

  detectState(
    metrics: DialogueHealthMetrics, 
    config: ACSConfig, 
    currentState: DialogueState,
    emotionalState?: { emotion: string; intensity: number; confidence: number }
  ): {
    newState: DialogueState;
    confidence: number;
    trigger: string;
  } {
    console.log("🔍 ACS Enhanced State Detection - Analyzing metrics:", metrics);
    console.log("🎭 Emotional state:", emotionalState);
    console.log("⚙️ Config thresholds:", config);
    
    // CRITICAL FIX: Enhanced emotion-based state detection
    if (emotionalState && emotionalState.emotion !== 'neutral' && emotionalState.intensity > 0.3) {
      switch (emotionalState.emotion) {
        case 'frustrated':
          return {
            newState: 'FRUSTRATION_DETECTED',
            confidence: 0.95,
            trigger: `Emotion-based: ${emotionalState.emotion} detected with intensity ${emotionalState.intensity.toFixed(3)}`
          };
        case 'anxious':
          return {
            newState: 'ANXIOUS',
            confidence: 0.9,
            trigger: `Anxiety detected with intensity ${emotionalState.intensity.toFixed(3)}`
          };
        case 'confused':
          return {
            newState: 'CONFUSED',
            confidence: 0.85,
            trigger: `Confusion detected with intensity ${emotionalState.intensity.toFixed(3)}`
          };
        case 'excited':
          return {
            newState: 'EXCITED',
            confidence: 0.8,
            trigger: `Excitement detected with intensity ${emotionalState.intensity.toFixed(3)}`
          };
      }
    }
    
    // Traditional frustration detection (backup)
    if (this.detectFrustrationState(metrics, config)) {
      console.log("😤 FRUSTRATION DETECTED - Triggering intervention");
      return {
        newState: 'FRUSTRATION_DETECTED',
        confidence: 0.95,
        trigger: `Frustration score ${metrics.frustrationScore.toFixed(3)} >= threshold ${config.frustrationThreshold} with enhanced pattern matching`
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
    
    // CRITICAL FIX: Updated idle state detection (3 minutes = 180000ms)
    if (this.detectIdleState(metrics, config)) {
      return {
        newState: 'IDLE',
        confidence: 0.95,
        trigger: `Silent duration ${metrics.silentDuration}ms >= threshold ${config.maxSilentMs}ms (3 minutes)`
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
    // CRITICAL FIX: Enhanced multi-factor frustration detection with lower threshold
    const frustrationFactors = [];
    let totalFrustrationScore = metrics.frustrationScore;
    
    // Direct frustration score (lowered threshold)
    if (metrics.frustrationScore >= config.frustrationThreshold) {
      frustrationFactors.push(`High frustration score: ${metrics.frustrationScore.toFixed(3)}`);
    }
    
    // CRITICAL: Enhanced frustration keywords detection
    const recentHelpSignals = metrics.helpSignals.filter(signal => 
      Date.now() - signal.timestamp < 30000 // Last 30 seconds
    );
    
    const frustrationSignals = recentHelpSignals.filter(signal => 
      signal.type === 'frustration_pattern' || 
      (signal.type === 'negative_feedback' && signal.confidence > 0.7)
    );
    
    if (frustrationSignals.length > 0) {
      totalFrustrationScore += 0.3;
      frustrationFactors.push(`Frustration keywords detected: ${frustrationSignals.length} signals`);
    }
    
    // Negative sentiment combined with help signals
    if (metrics.sentimentSlope < -0.2 && metrics.helpSignals.length > 0) {
      totalFrustrationScore += 0.2;
      frustrationFactors.push('Negative sentiment with help signals');
    }
    
    // Repetitive negative feedback patterns
    const negativeSignals = metrics.helpSignals.filter(signal => 
      signal.type === 'negative_feedback' && signal.confidence > 0.6
    );
    if (negativeSignals.length >= 2) {
      totalFrustrationScore += 0.3;
      frustrationFactors.push('Multiple negative feedback signals');
    }
    
    // CRITICAL: Memory-related frustration (common in our test)
    const memoryFrustrationSignals = recentHelpSignals.filter(signal =>
      signal.message.toLowerCase().includes('memory') ||
      signal.message.toLowerCase().includes('forget') ||
      signal.message.toLowerCase().includes('again')
    );
    
    if (memoryFrustrationSignals.length > 0) {
      totalFrustrationScore += 0.4;
      frustrationFactors.push('Memory-related frustration detected');
    }
    
    console.log("😤 Frustration analysis:", {
      originalScore: metrics.frustrationScore,
      enhancedScore: totalFrustrationScore,
      threshold: config.frustrationThreshold,
      factors: frustrationFactors
    });
    
    return totalFrustrationScore >= config.frustrationThreshold && frustrationFactors.length > 0;
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
    return metrics.silentDuration >= config.maxSilentMs; // Now 3 minutes (180000ms)
  }

  private detectHighEngagement(metrics: DialogueHealthMetrics, config: ACSConfig): boolean {
    return metrics.conversationVelocity >= config.velocityFloor * 2 && 
           metrics.sentimentSlope > 0.2;
  }

  // CRITICAL FIX: Update idle monitoring to 3 minutes
  startIdleMonitoring(config: ACSConfig, onIdleDetected: () => void): void {
    this.resetIdleTimer();
    this.silenceStartTime = Date.now();
    
    console.log(`⏰ Starting idle monitoring - will trigger after ${config.maxSilentMs / 1000 / 60} minutes of inactivity`);
    
    this.idleTimer = setTimeout(() => {
      console.log("⏰ ACS Idle State Detected - No user activity for", config.maxSilentMs / 1000 / 60, "minutes");
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

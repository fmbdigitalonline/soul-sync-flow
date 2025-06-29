import { ACSConfig, DialogueHealthMetrics, DialogueState, StateTransition, PromptStrategyConfig, ACSMetrics, HelpSignal } from '@/types/acs-types';
import { supabase } from '@/integrations/supabase/client';

class AdaptiveContextScheduler {
  private config: ACSConfig;
  private currentState: DialogueState = 'NORMAL';
  private conversationHistory: Array<{
    message: string;
    sentiment: number;
    timestamp: number;
    tokenCount: number;
    sender: 'user' | 'assistant';
  }> = [];
  private stateTransitions: StateTransition[] = [];
  private metrics: ACSMetrics = {
    stateTransitions: 0,
    averageLatency: 0,
    userRepairRate: 0,
    conversationVelocity: 0,
    sentimentTrend: 0,
    successRate: 0
  };
  private isEnabled: boolean = true;
  private userId: string | null = null;
  private lastUserInput: number = Date.now();
  private personalityVector: Float32Array | null = null;

  constructor(config?: Partial<ACSConfig>) {
    this.config = {
      velocityFloor: 0.15,           // tokens per second
      sentimentSlopeNeg: -0.05,      // negative sentiment threshold
      maxSilentMs: 45000,            // 45 seconds idle
      frustrationThreshold: 0.7,     // frustration detection
      clarificationThreshold: 0.6,   // confusion detection
      enableRL: true,                // reinforcement learning
      personalityScaling: true,      // VFP-Graph scaling
      ...config
    };
  }

  async initialize(userId: string, personalityVector?: Float32Array): Promise<void> {
    this.userId = userId;
    this.personalityVector = personalityVector || null;
    
    // Load hot-reloadable config from database
    await this.loadConfigFromDatabase();
    
    console.log('🎯 ACS initialized with config:', this.config);
  }

  private async loadConfigFromDatabase(): Promise<void> {
    try {
      if (!this.userId) return;

      const { data, error } = await supabase
        .from('acs_config')
        .select('config')
        .eq('user_id', this.userId)
        .eq('is_active', true)
        .maybeSingle();

      if (data && !error) {
        this.config = { ...this.config, ...(data.config as Partial<ACSConfig>) };
        console.log('✅ Hot-reloaded ACS config from database');
      }
    } catch (error) {
      console.warn('⚠️ Could not load ACS config, using defaults:', error);
    }
  }

  async updateConfig(newConfig: Partial<ACSConfig>): Promise<void> {
    this.config = { ...this.config, ...newConfig };
    
    // Save to database for hot-reloading
    if (this.userId) {
      try {
        await supabase
          .from('acs_config')
          .upsert({
            user_id: this.userId,
            config: this.config,
            is_active: true,
            updated_at: new Date().toISOString()
          });
        console.log('✅ ACS config updated in database');
      } catch (error) {
        console.error('❌ Failed to save ACS config:', error);
      }
    }
  }

  enable(): void {
    this.isEnabled = true;
    console.log('✅ ACS enabled');
  }

  disable(): void {
    this.isEnabled = false;
    console.log('⚠️ ACS disabled - fallback to static logic');
  }

  addMessage(message: string, sender: 'user' | 'assistant', sentiment?: number): void {
    if (!this.isEnabled) return;

    const timestamp = Date.now();
    const tokenCount = this.estimateTokenCount(message);
    const computedSentiment = sentiment ?? this.analyzeSentiment(message);

    this.conversationHistory.push({
      message,
      sentiment: computedSentiment,
      timestamp,
      tokenCount,
      sender
    });

    if (sender === 'user') {
      this.lastUserInput = timestamp;
    }

    // Keep sliding window of last 10 messages for efficiency
    if (this.conversationHistory.length > 10) {
      this.conversationHistory = this.conversationHistory.slice(-10);
    }

    // Evaluate state transition
    this.evaluateStateTransition();
  }

  private evaluateStateTransition(): void {
    const startTime = performance.now();
    
    try {
      const metrics = this.computeDialogueHealthMetrics();
      const newState = this.selectDialogueState(metrics);
      
      if (newState !== this.currentState) {
        this.transitionToState(newState, metrics);
      }
      
      // Update metrics
      const latency = performance.now() - startTime;
      this.updateMetrics(latency);
      
    } catch (error) {
      console.error('❌ ACS evaluation error, falling back to NORMAL state:', error);
      this.currentState = 'NORMAL';
    }
  }

  private computeDialogueHealthMetrics(): DialogueHealthMetrics {
    const now = Date.now();
    const recentMessages = this.conversationHistory.slice(-5);
    
    // Conversation velocity (tokens per second)
    const conversationVelocity = this.calculateConversationVelocity(recentMessages);
    
    // Sentiment slope (first derivative)
    const sentimentSlope = this.calculateSentimentSlope(recentMessages);
    
    // Silent duration
    const silentDuration = now - this.lastUserInput;
    
    // Frustration score
    const frustrationScore = this.calculateFrustrationScore(recentMessages);
    
    // Help signals
    const helpSignals = this.detectHelpSignals(recentMessages);

    return {
      conversationVelocity,
      sentimentSlope,
      silentDuration,
      frustrationScore,
      helpSignals,
      timestamp: now
    };
  }

  private calculateConversationVelocity(messages: typeof this.conversationHistory): number {
    if (messages.length < 2) return 1.0; // Default high velocity for new conversations
    
    const timeSpan = messages[messages.length - 1].timestamp - messages[0].timestamp;
    const totalTokens = messages.reduce((sum, msg) => sum + msg.tokenCount, 0);
    
    return timeSpan > 0 ? (totalTokens / (timeSpan / 1000)) : 1.0; // tokens per second
  }

  private calculateSentimentSlope(messages: typeof this.conversationHistory): number {
    const userMessages = messages.filter(msg => msg.sender === 'user');
    if (userMessages.length < 2) return 0;
    
    // Linear regression over sliding window of 3 most recent user messages
    const recent = userMessages.slice(-3);
    if (recent.length < 2) return 0;
    
    const n = recent.length;
    const sumX = recent.reduce((sum, _, i) => sum + i, 0);
    const sumY = recent.reduce((sum, msg) => sum + msg.sentiment, 0);
    const sumXY = recent.reduce((sum, msg, i) => sum + i * msg.sentiment, 0);
    const sumX2 = recent.reduce((sum, _, i) => sum + i * i, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    return isNaN(slope) ? 0 : slope;
  }

  private calculateFrustrationScore(messages: typeof this.conversationHistory): number {
    const userMessages = messages.filter(msg => msg.sender === 'user');
    let frustrationScore = 0;
    
    userMessages.forEach(msg => {
      const message = msg.message.toLowerCase();
      
      // Detect frustration patterns
      if (message.includes('help') || message.includes("don't understand")) {
        frustrationScore += 0.3;
      }
      if (message.includes('confus') || message.includes('unclear')) {
        frustrationScore += 0.3;
      }
      if (message.includes('wrong') || message.includes('error')) {
        frustrationScore += 0.2;
      }
      if (msg.sentiment < -0.3) {
        frustrationScore += 0.4;
      }
    });
    
    return Math.min(frustrationScore, 1.0);
  }

  private detectHelpSignals(messages: typeof this.conversationHistory): HelpSignal[] {
    const signals: HelpSignal[] = [];
    const userMessages = messages.filter(msg => msg.sender === 'user');
    
    // Detect repetitive queries
    const queries = userMessages.map(msg => msg.message.toLowerCase());
    for (let i = 0; i < queries.length - 1; i++) {
      for (let j = i + 1; j < queries.length; j++) {
        if (this.similarity(queries[i], queries[j]) > 0.8) {
          signals.push({
            type: 'repetitive_query',
            confidence: 0.9,
            message: 'User repeating similar queries',
            timestamp: Date.now()
          });
        }
      }
    }
    
    // Detect confusion patterns
    userMessages.forEach(msg => {
      const message = msg.message.toLowerCase();
      if (message.includes('what') && message.includes('mean') ||
          message.includes('how') && message.includes('work') ||
          message.includes('explain') || message.includes('clarify')) {
        signals.push({
          type: 'confusion_pattern',
          confidence: 0.7,
          message: 'Confusion pattern detected',
          timestamp: msg.timestamp
        });
      }
    });
    
    return signals;
  }

  private selectDialogueState(metrics: DialogueHealthMetrics): DialogueState {
    // Apply personality scaling if available
    const scaledConfig = this.applyPersonalityScaling(this.config);
    
    // State selection logic with configurable thresholds
    if (metrics.silentDuration > scaledConfig.maxSilentMs) {
      return 'IDLE';
    }
    
    if (metrics.frustrationScore > scaledConfig.frustrationThreshold) {
      return 'FRUSTRATION_DETECTED';
    }
    
    if (metrics.conversationVelocity < scaledConfig.velocityFloor && 
        metrics.sentimentSlope < scaledConfig.sentimentSlopeNeg) {
      return 'CLARIFICATION_NEEDED';
    }
    
    if (metrics.helpSignals.length > 0) {
      return 'CLARIFICATION_NEEDED';
    }
    
    if (metrics.conversationVelocity > 1.0 && metrics.sentimentSlope > 0.1) {
      return 'HIGH_ENGAGEMENT';
    }
    
    return 'NORMAL';
  }

  private applyPersonalityScaling(config: ACSConfig): ACSConfig {
    if (!config.personalityScaling || !this.personalityVector) {
      return config;
    }
    
    // Extract personality traits from vector for threshold scaling
    const vector = this.personalityVector;
    const patience = this.extractPersonalityTrait(vector, 'patience');
    const sensitivity = this.extractPersonalityTrait(vector, 'sensitivity');
    
    return {
      ...config,
      velocityFloor: config.velocityFloor * (1 + patience * 0.3),
      sentimentSlopeNeg: config.sentimentSlopeNeg * (1 + sensitivity * 0.2),
      maxSilentMs: config.maxSilentMs * (1 + patience * 0.5)
    };
  }

  private extractPersonalityTrait(vector: Float32Array, trait: string): number {
    // Simplified trait extraction - in production this would be more sophisticated
    const traitMap = {
      'patience': Array.from(vector.slice(0, 8)).reduce((sum, val) => sum + val, 0) / 8,
      'sensitivity': Array.from(vector.slice(8, 16)).reduce((sum, val) => sum + val, 0) / 8
    };
    
    return Math.max(-1, Math.min(1, traitMap[trait] || 0));
  }

  private transitionToState(newState: DialogueState, metrics: DialogueHealthMetrics): void {
    const transition: StateTransition = {
      fromState: this.currentState,
      toState: newState,
      trigger: this.getTransitionTrigger(metrics),
      timestamp: Date.now(),
      confidence: this.calculateTransitionConfidence(metrics)
    };
    
    this.stateTransitions.push(transition);
    this.currentState = newState;
    this.metrics.stateTransitions++;
    
    console.log(`🔄 ACS State transition: ${transition.fromState} → ${transition.toState} (${transition.trigger})`);
    
    // Emit metrics to Supabase for monitoring
    this.emitMetrics(transition);
  }

  private getTransitionTrigger(metrics: DialogueHealthMetrics): string {
    if (metrics.silentDuration > this.config.maxSilentMs) return 'idle_timeout';
    if (metrics.frustrationScore > this.config.frustrationThreshold) return 'frustration_detected';
    if (metrics.conversationVelocity < this.config.velocityFloor) return 'slow_velocity';
    if (metrics.sentimentSlope < this.config.sentimentSlopeNeg) return 'negative_sentiment';
    if (metrics.helpSignals.length > 0) return 'help_signals';
    return 'positive_engagement';
  }

  private calculateTransitionConfidence(metrics: DialogueHealthMetrics): number {
    // Confidence based on how strongly metrics exceed thresholds
    let confidence = 0.5;
    
    if (metrics.conversationVelocity < this.config.velocityFloor) {
      confidence += (this.config.velocityFloor - metrics.conversationVelocity) * 2;
    }
    
    if (metrics.sentimentSlope < this.config.sentimentSlopeNeg) {
      confidence += Math.abs(metrics.sentimentSlope - this.config.sentimentSlopeNeg) * 5;
    }
    
    confidence += metrics.frustrationScore * 0.3;
    confidence += metrics.helpSignals.length * 0.2;
    
    return Math.min(1.0, confidence);
  }

  getPromptStrategyConfig(): PromptStrategyConfig {
    const strategies: Record<DialogueState, PromptStrategyConfig> = {
      'NORMAL': {
        personaStyle: 'neutral',
        temperatureAdjustment: 0
      },
      
      'CLARIFICATION_NEEDED': {
        systemPromptModifier: `If the user seems confused, rephrase your answer more simply and ask if clarification helps. Use shorter sentences and provide examples.`,
        temperatureAdjustment: -0.1,
        personaStyle: 'clarifying',
        maxTokens: 300
      },
      
      'FRUSTRATION_DETECTED': {
        systemPromptModifier: `The user appears frustrated. Begin with an empathetic acknowledgment. Use a gentler tone and ask how you can better help.`,
        temperatureAdjustment: -0.2, // Lower temperature for more focused responses
        personaStyle: 'empathetic',
        apologyPrefix: true,
        maxTokens: 250
      },
      
      'IDLE': {
        systemPromptModifier: `The user has been quiet. Gently check in and offer assistance or summarize progress.`,
        personaStyle: 'encouraging',
        checkInEnabled: true,
        maxTokens: 150
      },
      
      'HIGH_ENGAGEMENT': {
        personaStyle: 'encouraging',
        temperatureAdjustment: 0.1
      }
    };
    
    return strategies[this.currentState];
  }

  recordUserFeedback(feedback: 'positive' | 'negative' | 'neutral', message?: string): void {
    if (!this.config.enableRL) return;
    
    // Update user repair rate metric
    if (feedback === 'negative') {
      this.metrics.userRepairRate = (this.metrics.userRepairRate * 0.9) + 0.1;
    } else if (feedback === 'positive') {
      this.metrics.userRepairRate = this.metrics.userRepairRate * 0.95;
    }
    
    // RL optimization with L2-norm regularization
    this.optimizeThresholds(feedback);
  }

  private optimizeThresholds(feedback: 'positive' | 'negative' | 'neutral'): void {
    if (!this.config.enableRL) return;
    
    const learningRate = 0.01;
    const l2Lambda = 0.001; // L2 regularization parameter
    
    // Simplified RL update - adjust thresholds based on feedback
    if (feedback === 'negative' && this.stateTransitions.length > 0) {
      const lastTransition = this.stateTransitions[this.stateTransitions.length - 1];
      
      // If transition was wrong, adjust thresholds with regularization
      if (lastTransition.toState === 'FRUSTRATION_DETECTED') {
        this.config.frustrationThreshold += learningRate;
        // Apply L2 regularization
        this.config.frustrationThreshold *= (1 - l2Lambda);
      }
      
      if (lastTransition.toState === 'CLARIFICATION_NEEDED') {
        this.config.clarificationThreshold += learningRate;
        this.config.clarificationThreshold *= (1 - l2Lambda);
      }
    }
    
    // Constrain thresholds to reasonable bounds
    this.config.frustrationThreshold = Math.max(0.1, Math.min(0.9, this.config.frustrationThreshold));
    this.config.clarificationThreshold = Math.max(0.1, Math.min(0.9, this.config.clarificationThreshold));
  }

  private updateMetrics(latency: number): void {
    this.metrics.averageLatency = (this.metrics.averageLatency * 0.9) + (latency * 0.1);
    
    // Update conversation velocity
    if (this.conversationHistory.length > 1) {
      this.metrics.conversationVelocity = this.calculateConversationVelocity(this.conversationHistory);
    }
    
    // Update sentiment trend
    const recentSentiments = this.conversationHistory.slice(-3).map(msg => msg.sentiment);
    if (recentSentiments.length > 1) {
      this.metrics.sentimentTrend = recentSentiments[recentSentiments.length - 1] - recentSentiments[0];
    }
  }

  private async emitMetrics(transition: StateTransition): Promise<void> {
    try {
      await supabase
        .from('acs_metrics')
        .insert({
          user_id: this.userId,
          state_transition: `${transition.fromState}_to_${transition.toState}`,
          delta_latency: this.metrics.averageLatency,
          user_repair_rate: this.metrics.userRepairRate,
          conversation_velocity: this.metrics.conversationVelocity,
          sentiment_trend: this.metrics.sentimentTrend,
          trigger: transition.trigger,
          confidence: transition.confidence,
          timestamp: new Date().toISOString()
        });
    } catch (error) {
      console.warn('⚠️ Could not emit ACS metrics:', error);
    }
  }

  getCurrentState(): DialogueState {
    return this.currentState;
  }

  getMetrics(): ACSMetrics {
    return { ...this.metrics };
  }

  // Utility methods
  private estimateTokenCount(text: string): number {
    return Math.ceil(text.length / 4); // Rough estimation
  }

  private analyzeSentiment(text: string): number {
    // Simplified sentiment analysis - in production use proper NLP
    const positive = ['good', 'great', 'excellent', 'happy', 'love', 'perfect', 'amazing'];
    const negative = ['bad', 'terrible', 'hate', 'awful', 'wrong', 'confused', 'frustrated'];
    
    const words = text.toLowerCase().split(/\s+/);
    let score = 0;
    
    words.forEach(word => {
      if (positive.some(p => word.includes(p))) score += 0.1;
      if (negative.some(n => word.includes(n))) score -= 0.1;
    });
    
    return Math.max(-1, Math.min(1, score));
  }

  private similarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const distance = this.levenshteinDistance(longer, shorter);
    return (longer.length - distance) / longer.length;
  }

  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
    
    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
    
    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + indicator
        );
      }
    }
    
    return matrix[str2.length][str1.length];
  }
}

export const adaptiveContextScheduler = new AdaptiveContextScheduler();

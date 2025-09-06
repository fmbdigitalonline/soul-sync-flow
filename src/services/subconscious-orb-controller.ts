import { RealTimeShadowDetector, LivePatternResult } from './real-time-shadow-detector';
import { HermeticPatternCache } from './hermetic-pattern-cache';
import { PatternBuffer } from './pattern-buffer';
import { ShadowPattern } from './conversation-shadow-detector';

export interface SubconsciousOrbState {
  mode: 'dormant' | 'detecting' | 'pattern_found' | 'thinking' | 'advice_ready';
  pattern: ShadowPattern | null;
  hermeticAdvice: string | null;
  confidence: number;
  timestamp: number;
  processingTime: number;
}

export interface OrbPerformanceMetrics {
  averageDetectionTime: number;
  cacheHitRate: number;
  totalPatternsDetected: number;
  memoryUsage: number;
  circuitBreakerTriggered: boolean;
}

/**
 * SubconsciousOrbController - Main coordinator for real-time shadow detection
 * Integrates pattern detection, hermetic advice, and orb state management
 */
export class SubconsciousOrbController {
  private static currentState: SubconsciousOrbState = {
    mode: 'dormant',
    pattern: null,
    hermeticAdvice: null,
    confidence: 0,
    timestamp: Date.now(),
    processingTime: 0
  };
  
  private static listeners = new Set<(state: SubconsciousOrbState) => void>();
  private static performanceMetrics: OrbPerformanceMetrics = {
    averageDetectionTime: 0,
    cacheHitRate: 0,
    totalPatternsDetected: 0,
    memoryUsage: 0,
    circuitBreakerTriggered: false
  };
  
  private static detectionTimes: number[] = [];
  private static maxMetricsHistory = 50; // Keep last 50 detection times
  private static isInitialized = false;

  /**
   * Initialize the subconscious orb system
   */
  static async initialize(): Promise<void> {
    if (this.isInitialized) return;
    
    console.log('🚀 SubconsciousOrbController: Initializing subconscious orb system');
    
    try {
      // Initialize hermetic pattern cache
      await HermeticPatternCache.initialize();
      
      // Set up automatic cleanup every 30 minutes
      setInterval(() => {
        this.performMaintenance();
      }, 30 * 60 * 1000);
      
      this.isInitialized = true;
      console.log('✅ SubconsciousOrbController: Initialization complete');
      
    } catch (error) {
      console.error('🚨 SubconsciousOrbController initialization error:', error);
      this.isInitialized = true; // Don't block app
    }
  }

  /**
   * Process incoming message for shadow patterns
   * Target: <100ms response time with orb state update
   */
  static async processMessage(messageContent: string, messageId: string): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }
    
    const startTime = performance.now();
    
    try {
      // Set detecting state immediately for visual feedback
      this.setState({
        mode: 'detecting',
        pattern: null,
        hermeticAdvice: null,
        confidence: 0,
        timestamp: Date.now(),
        processingTime: 0
      });

      // Real-time pattern detection
      const result: LivePatternResult = await RealTimeShadowDetector.detectLivePattern(messageContent);
      
      const detectionTime = performance.now() - startTime;
      this.recordDetectionTime(detectionTime);

      if (result.pattern && result.confidence > 0.6) {
        // Check for duplicate recent patterns
        if (!PatternBuffer.hasSimilarRecentPattern(result.pattern)) {
          // Add to pattern buffer
          PatternBuffer.addPattern(result.pattern, messageId);
          
          // Set pattern found state
          this.setState({
            mode: 'pattern_found',
            pattern: result.pattern,
            hermeticAdvice: null,
            confidence: result.confidence,
            timestamp: Date.now(),
            processingTime: detectionTime
          });
          
          // Background hermetic advice retrieval (don't block UI)
          this.retrieveHermeticAdviceAsync(result.pattern);
          
          console.log(`🔍 SubconsciousOrb: Pattern detected - ${result.pattern.type} (${Math.round(result.confidence * 100)}% confidence, ${Math.round(detectionTime)}ms)`);
        } else {
          // Similar pattern already exists, return to dormant
          this.returnToDormant(detectionTime);
        }
      } else {
        // No significant pattern, return to dormant
        this.returnToDormant(detectionTime);
      }
      
      // Update performance metrics
      this.updatePerformanceMetrics();
      
    } catch (error) {
      console.error('🚨 SubconsciousOrbController processing error:', error);
      this.returnToDormant(performance.now() - startTime);
    }
  }

  /**
   * Background hermetic advice retrieval
   */
  private static async retrieveHermeticAdviceAsync(pattern: ShadowPattern): Promise<void> {
    try {
      // Set thinking state
      this.setState({
        ...this.currentState,
        mode: 'thinking'
      });

      // Get hermetic advice (cached or fetched)
      const hermeticPattern = await HermeticPatternCache.getHermeticAdvice(pattern.pattern);
      
      if (hermeticPattern && hermeticPattern.hermetic_advice) {
        // Advice ready
        this.setState({
          ...this.currentState,
          mode: 'advice_ready',
          hermeticAdvice: hermeticPattern.hermetic_advice
        });
        
        console.log(`💡 SubconsciousOrb: Hermetic advice ready for pattern: ${pattern.type}`);
        
        // Auto-return to dormant after 30 seconds if not interacted with
        setTimeout(() => {
          if (this.currentState.mode === 'advice_ready') {
            this.returnToDormant(0);
          }
        }, 30000);
        
      } else {
        // No hermetic advice available, return to pattern_found state
        this.setState({
          ...this.currentState,
          mode: 'pattern_found'
        });
      }
      
    } catch (error) {
      console.error('🚨 Hermetic advice retrieval error:', error);
      // Keep pattern_found state on error
      this.setState({
        ...this.currentState,
        mode: 'pattern_found'
      });
    }
  }

  /**
   * Return orb to dormant state
   */
  private static returnToDormant(processingTime: number): void {
    this.setState({
      mode: 'dormant',
      pattern: null,
      hermeticAdvice: null,
      confidence: 0,
      timestamp: Date.now(),
      processingTime
    });
  }

  /**
   * Set orb state and notify listeners
   */
  private static setState(newState: SubconsciousOrbState): void {
    this.currentState = { ...newState };
    this.notifyListeners();
  }

  /**
   * Handle orb click interaction
   */
  static handleOrbClick(): string | null {
    if (this.currentState.mode === 'advice_ready' && this.currentState.hermeticAdvice) {
      const advice = this.currentState.hermeticAdvice;
      
      // Return to dormant after delivering advice
      this.returnToDormant(0);
      
      return advice;
    }
    
    if (this.currentState.mode === 'pattern_found' && this.currentState.pattern) {
      // Return basic actionable steps if no hermetic advice
      const steps = this.getBasicActionableSteps(this.currentState.pattern);
      this.returnToDormant(0);
      
      return steps.join('\n• ');
    }
    
    return null;
  }

  /**
   * Get basic actionable steps for patterns (fallback when hermetic advice unavailable)
   */
  private static getBasicActionableSteps(pattern: ShadowPattern): string[] {
    const steps: Record<ShadowPattern['type'], string[]> = {
      emotional_trigger: [
        'Notice when this emotion arises without judgment',
        'Take three deep breaths before responding',
        'Ask: "What is this feeling trying to teach me?"'
      ],
      projection: [
        'Consider how this quality might exist within you',
        'Practice owning your projections when they arise',
        'Ask: "How am I like what I\'m describing?"'
      ],
      resistance: [
        'Explore what you\'re resisting and why',
        'Practice accepting what is before changing it',
        'Ask: "What would happen if I stopped resisting?"'
      ],
      blind_spot: [
        'Question the complete truth of this belief',
        'Look for evidence that contradicts this belief',
        'Practice self-compassion when this arises'
      ]
    };
    
    return steps[pattern.type] || ['Notice this pattern with gentle awareness', 'Breathe and observe without judgment'];
  }

  /**
   * Record detection time for performance monitoring
   */
  private static recordDetectionTime(time: number): void {
    this.detectionTimes.push(time);
    
    // Keep only recent times
    if (this.detectionTimes.length > this.maxMetricsHistory) {
      this.detectionTimes.shift();
    }
  }

  /**
   * Update performance metrics
   */
  private static updatePerformanceMetrics(): void {
    if (this.detectionTimes.length > 0) {
      this.performanceMetrics.averageDetectionTime = 
        this.detectionTimes.reduce((a, b) => a + b, 0) / this.detectionTimes.length;
    }
    
    const cacheStats = HermeticPatternCache.getStats();
    this.performanceMetrics.cacheHitRate = cacheStats.hitRate;
    
    const bufferStats = PatternBuffer.getStats();
    this.performanceMetrics.memoryUsage = bufferStats.memoryUsage + cacheStats.memoryUsage;
    
    this.performanceMetrics.totalPatternsDetected = bufferStats.totalPatterns;
    
    const shadowStats = RealTimeShadowDetector.getSessionStats();
    this.performanceMetrics.circuitBreakerTriggered = shadowStats.circuitBreakerOpen;
  }

  /**
   * Perform automatic maintenance
   */
  private static performMaintenance(): void {
    console.log('🧹 SubconsciousOrbController: Performing maintenance');
    
    // Clear old session data
    RealTimeShadowDetector.clearSessionData();
    
    // Cleanup pattern buffer
    PatternBuffer.forceCleanup();
    
    // Manage cache size
    HermeticPatternCache.manageCacheSize();
    
    // Reset performance metrics
    this.detectionTimes = [];
    
    console.log('✅ SubconsciousOrbController: Maintenance complete');
  }

  /**
   * Add state change listener
   */
  static addStateListener(listener: (state: SubconsciousOrbState) => void): () => void {
    this.listeners.add(listener);
    
    // Send current state immediately
    listener(this.currentState);
    
    return () => this.listeners.delete(listener);
  }

  /**
   * Notify all listeners of state changes
   */
  private static notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener(this.currentState);
      } catch (error) {
        console.error('🚨 Listener error:', error);
      }
    });
  }

  /**
   * Get current orb state
   */
  static getCurrentState(): SubconsciousOrbState {
    return { ...this.currentState };
  }

  /**
   * Get performance metrics
   */
  static getPerformanceMetrics(): OrbPerformanceMetrics {
    this.updatePerformanceMetrics();
    return { ...this.performanceMetrics };
  }

  /**
   * Get session insights for user
   */
  static getSessionInsights(): {
    totalPatterns: number;
    topPatterns: string[];
    recommendations: string[];
  } {
    const summary = PatternBuffer.getSessionSummary();
    
    const topPatterns = summary.topPatterns.map(entry => 
      `${entry.pattern.type}: ${entry.pattern.pattern}`
    );
    
    const recommendations = [
      'Notice patterns without judgment',
      'Practice mindful awareness of triggers',
      'Explore the wisdom in your reactions'
    ];
    
    return {
      totalPatterns: summary.totalPatterns,
      topPatterns: topPatterns.slice(0, 3),
      recommendations
    };
  }
}

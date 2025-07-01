
// PIE (Proactive Insight Engine) Types and Interfaces
// Patent-critical elements included for claims compliance

// Patent Claim 4: Hard suppression gate constant
export const PIE_CONFIDENCE_THRESHOLD = 0.7; // Confidence below this suppresses notifications

// Patent Claim: Statistical significance threshold
export const PIE_STATISTICAL_SIGNIFICANCE_THRESHOLD = 0.05; // p-value threshold for pattern detection

// Patent Claim 1(d): Predictive rule object
export interface PIEPredictiveRule {
  id: string;
  eventType: string; // e.g., "mercury_retrograde", "full_moon", "mars_opposition"
  direction: 'positive' | 'negative' | 'neutral'; // Expected impact direction
  magnitude: number; // Expected impact magnitude (0-1 scale)
  confidence: number; // Rule confidence based on historical data (0-1)
  conditions: {
    windowHours: number; // Time window around event
    minimumOccurrences: number; // Minimum past occurrences for rule validity
    userDataTypes: string[]; // Types of user data this rule applies to
  };
  creationDate: string;
  lastValidated: string;
  statisticalSignificance: number; // p-value from correlation analysis
}

export interface PIEPattern {
  id: string;
  userId: string;
  patternType: 'cyclic' | 'event_triggered' | 'correlation' | 'seasonal';
  dataType: 'mood' | 'productivity' | 'energy' | 'sleep' | 'sentiment';
  
  // Statistical backing
  significance: number; // p-value
  confidence: number; // 0-1 confidence score
  sampleSize: number; // Number of data points used
  
  // Pattern characteristics
  cyclePeriod?: number; // For cyclic patterns (in days)
  eventTrigger?: string; // For event-triggered patterns
  correlationStrength: number; // -1 to 1
  
  // Timing
  detectedAt: string;
  lastUpdated: string;
  validUntil?: string;
  
  // Associated predictive rules
  predictiveRules: PIEPredictiveRule[];
}

export interface PIEDataPoint {
  id: string;
  userId: string;
  timestamp: string;
  dataType: 'mood' | 'productivity' | 'energy' | 'sleep' | 'sentiment' | 'activity';
  value: number; // Normalized 0-1 or -1 to 1 scale
  rawValue?: any; // Original value for reference
  source: 'user_input' | 'conversation_analysis' | 'activity_log' | 'external_api';
  confidence: number; // Confidence in the data point accuracy
  metadata?: Record<string, any>;
}

export interface AstrologicalEvent {
  id: string;
  eventType: string; // e.g., "mercury_retrograde", "full_moon", "mars_square_venus"
  startTime: string;
  endTime?: string; // For events with duration
  intensity: number; // 0-1 scale of astrological intensity
  personalRelevance: number; // 0-1 scale based on user's birth chart
  description: string;
  category: 'planetary' | 'lunar' | 'aspect' | 'transit';
}

export interface PIEInsight {
  id: string;
  userId: string;
  patternId: string;
  predictiveRuleId: string;
  
  // Insight content
  title: string;
  message: string;
  insightType: 'warning' | 'opportunity' | 'preparation' | 'awareness';
  priority: 'low' | 'medium' | 'high' | 'critical';
  
  // Timing and delivery
  triggerEvent: string;
  triggerTime: string;
  deliveryTime: string;
  expirationTime: string;
  
  // Validation and feedback
  confidence: number;
  delivered: boolean;
  acknowledged: boolean;
  userFeedback?: 'helpful' | 'somewhat_helpful' | 'not_helpful' | 'inaccurate';
  
  // Personalization
  communicationStyle: string; // Based on VFP-Graph
  personalizedForBlueprint: boolean;
}

export interface PIEConfiguration {
  userId: string;
  enabled: boolean;
  
  // Sensitivity settings
  minimumConfidence: number; // Minimum confidence for insight delivery
  patternSensitivity: 'conservative' | 'moderate' | 'sensitive';
  
  // Delivery preferences
  deliveryMethods: ('conversation' | 'notification' | 'email')[];
  deliveryTiming: 'immediate' | 'daily_digest' | 'weekly_summary';
  quietHours: { start: string; end: string };
  
  // Content preferences
  includeAstrology: boolean;
  includeStatistics: boolean;
  communicationStyle: 'analytical' | 'intuitive' | 'balanced';
  
  // Data collection
  dataTypes: string[]; // Which data types to collect and analyze
  retentionPeriod: number; // Days to retain data
}

// Utility types for pattern analysis
export interface PatternAnalysisResult {
  patterns: PIEPattern[];
  confidence: number;
  dataQuality: number;
  recommendedActions: string[];
}

export interface CorrelationResult {
  eventType: string;
  correlation: number;
  significance: number;
  sampleSize: number;
  recommendation: 'create_rule' | 'monitor_more' | 'dismiss';
}

// Constants for pattern detection
export const PIE_MINIMUM_DATA_POINTS = 10;
export const PIE_MINIMUM_PATTERN_OCCURRENCES = 3;
export const PIE_DEFAULT_CONFIDENCE_THRESHOLD = 0.6;
export const PIE_HIGH_PRIORITY_THRESHOLD = 0.8;

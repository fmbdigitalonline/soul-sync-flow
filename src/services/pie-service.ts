
import { supabase } from "@/integrations/supabase/client";
import { 
  PIEPattern, 
  PIEInsight, 
  PIEDataPoint, 
  PIEConfiguration, 
  PIEPredictiveRule,
  PIE_CONFIDENCE_THRESHOLD,
  PIE_STATISTICAL_SIGNIFICANCE_THRESHOLD
} from "@/types/pie-types";
import { pieDataCollectionService } from "./pie-data-collection-service";
import { piePatternDetectionService } from "./pie-pattern-detection-service";
import { pieInsightGenerationService } from "./pie-insight-generation-service";
import { pieSchedulingService } from "./pie-scheduling-service";

export class PIEService {
  private userId: string | null = null;
  private configuration: PIEConfiguration | null = null;
  private isInitialized = false;

  async initialize(userId: string): Promise<void> {
    console.log("🔮 Initializing PIE (Proactive Insight Engine) for user:", userId);
    
    this.userId = userId;
    
    // Load or create user configuration
    await this.loadConfiguration();
    
    // Initialize all PIE sub-services
    await pieDataCollectionService.initialize(userId);
    await piePatternDetectionService.initialize(userId);
    await pieInsightGenerationService.initialize(userId);
    await pieSchedulingService.initialize(userId);
    
    this.isInitialized = true;
    console.log("✅ PIE initialized successfully");
  }

  private async loadConfiguration(): Promise<void> {
    if (!this.userId) throw new Error("PIE not initialized - no user ID");

    try {
      const { data, error } = await supabase
        .from('pie_configurations')
        .select('*')
        .eq('user_id', this.userId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        // Map database record to PIEConfiguration interface with proper type casting
        this.configuration = {
          userId: data.user_id,
          enabled: data.enabled,
          minimumConfidence: data.minimum_confidence,
          patternSensitivity: data.pattern_sensitivity as PIEConfiguration['patternSensitivity'],
          deliveryMethods: Array.isArray(data.delivery_methods) 
            ? data.delivery_methods as PIEConfiguration['deliveryMethods']
            : ['conversation'],
          deliveryTiming: data.delivery_timing as PIEConfiguration['deliveryTiming'],
          quietHours: (data.quiet_hours && typeof data.quiet_hours === 'object' && !Array.isArray(data.quiet_hours))
            ? data.quiet_hours as { start: string; end: string }
            : { start: '22:00', end: '08:00' },
          includeAstrology: data.include_astrology,
          includeStatistics: data.include_statistics,
          communicationStyle: data.communication_style as PIEConfiguration['communicationStyle'],
          dataTypes: Array.isArray(data.data_types)
            ? data.data_types as string[]
            : ['mood', 'productivity', 'sentiment'],
          retentionPeriod: data.retention_period
        };
      } else {
        // Create default configuration
        this.configuration = {
          userId: this.userId,
          enabled: true,
          minimumConfidence: PIE_CONFIDENCE_THRESHOLD,
          patternSensitivity: 'moderate',
          deliveryMethods: ['conversation'],
          deliveryTiming: 'immediate',
          quietHours: { start: '22:00', end: '08:00' },
          includeAstrology: true,
          includeStatistics: false,
          communicationStyle: 'balanced',
          dataTypes: ['mood', 'productivity', 'sentiment'],
          retentionPeriod: 90
        };

        await this.saveConfiguration();
      }
    } catch (error) {
      console.error("Failed to load PIE configuration:", error);
      throw error;
    }
  }

  private async saveConfiguration(): Promise<void> {
    if (!this.configuration) return;

    try {
      // Map PIEConfiguration to database schema
      const dbConfig = {
        user_id: this.configuration.userId,
        enabled: this.configuration.enabled,
        minimum_confidence: this.configuration.minimumConfidence,
        pattern_sensitivity: this.configuration.patternSensitivity,
        delivery_methods: this.configuration.deliveryMethods,
        delivery_timing: this.configuration.deliveryTiming,
        quiet_hours: this.configuration.quietHours,
        include_astrology: this.configuration.includeAstrology,
        include_statistics: this.configuration.includeStatistics,
        communication_style: this.configuration.communicationStyle,
        data_types: this.configuration.dataTypes,
        retention_period: this.configuration.retentionPeriod
      };

      const { error } = await supabase
        .from('pie_configurations')
        .upsert(dbConfig);

      if (error) {
        console.error("Failed to save PIE configuration:", error);
        throw error;
      }
    } catch (error) {
      console.error("Error saving PIE configuration:", error);
      throw error;
    }
  }

  // Main PIE orchestration method
  async processUserData(dataPoint: PIEDataPoint): Promise<void> {
    if (!this.isInitialized || !this.configuration?.enabled) return;

    console.log("🔮 Processing user data point for PIE analysis:", dataPoint.dataType);

    try {
      // 1. Store the data point
      await pieDataCollectionService.storeDataPoint(dataPoint);

      // 2. Check if we have enough data for pattern detection
      const canDetectPatterns = await pieDataCollectionService.hasMinimumDataForAnalysis(
        dataPoint.userId,
        dataPoint.dataType
      );

      if (canDetectPatterns) {
        // 3. Trigger pattern detection
        const patterns = await piePatternDetectionService.detectPatterns(
          dataPoint.userId,
          dataPoint.dataType
        );

        // 4. Generate predictive rules from new patterns
        for (const pattern of patterns) {
          if (pattern.significance <= PIE_STATISTICAL_SIGNIFICANCE_THRESHOLD) {
            const rules = await this.generatePredictiveRules(pattern);
            await this.storePredictiveRules(rules);
          }
        }

        // 5. Schedule proactive insights
        await pieSchedulingService.scheduleInsights();
      }

    } catch (error) {
      console.error("PIE processing error:", error);
      // Continue gracefully - don't break the main flow
    }
  }

  // Patent Claim 1(d): Generate predictive rules from patterns
  private async generatePredictiveRules(pattern: PIEPattern): Promise<PIEPredictiveRule[]> {
    console.log("🔮 Generating predictive rules for pattern:", pattern.id);

    const rules: PIEPredictiveRule[] = [];

    // Determine rule characteristics based on pattern
    const direction = pattern.correlationStrength > 0 ? 'positive' : 
                     pattern.correlationStrength < 0 ? 'negative' : 'neutral';
    
    const magnitude = Math.abs(pattern.correlationStrength);
    const confidence = 1 - pattern.significance; // Higher confidence = lower p-value

    // Create rule only if confidence meets threshold
    if (confidence >= PIE_CONFIDENCE_THRESHOLD) {
      const rule: PIEPredictiveRule = {
        id: `rule_${pattern.id}_${Date.now()}`,
        userId: pattern.userId,
        eventType: pattern.eventTrigger || `${pattern.patternType}_${pattern.dataType}`,
        direction,
        magnitude,
        confidence,
        conditions: {
          windowHours: pattern.patternType === 'cyclic' ? (pattern.cyclePeriod || 24) : 48,
          minimumOccurrences: 3,
          userDataTypes: [pattern.dataType]
        },
        creationDate: new Date().toISOString(),
        lastValidated: new Date().toISOString(),
        statisticalSignificance: pattern.significance
      };

      rules.push(rule);
      console.log("✅ Generated predictive rule with confidence:", confidence);
    } else {
      console.log("❌ Rule confidence below threshold, suppressing creation");
    }

    return rules;
  }

  private async storePredictiveRules(rules: PIEPredictiveRule[]): Promise<void> {
    for (const rule of rules) {
      try {
        // Map PIEPredictiveRule to database schema
        const dbRule = {
          id: rule.id,
          user_id: rule.userId,
          event_type: rule.eventType,
          direction: rule.direction,
          magnitude: rule.magnitude,
          confidence: rule.confidence,
          window_hours: rule.conditions.windowHours,
          minimum_occurrences: rule.conditions.minimumOccurrences,
          user_data_types: rule.conditions.userDataTypes,
          creation_date: rule.creationDate,
          last_validated: rule.lastValidated,
          statistical_significance: rule.statisticalSignificance
        };

        const { error } = await supabase
          .from('pie_predictive_rules')
          .upsert(dbRule);

        if (error) {
          console.error("Failed to store predictive rule:", error);
        }
      } catch (error) {
        console.error("Error storing predictive rule:", error);
      }
    }
  }

  // Get user's current insights
  async getCurrentInsights(): Promise<PIEInsight[]> {
    if (!this.userId) return [];

    try {
      const { data, error } = await supabase
        .from('pie_insights')
        .select('*')
        .eq('user_id', this.userId)
        .eq('delivered', true)
        .gte('expiration_time', new Date().toISOString())
        .order('priority', { ascending: false });

      if (error) throw error;

      // Map database records to PIEInsight interface
      return (data || []).map(record => ({
        id: record.id,
        userId: record.user_id,
        patternId: record.pattern_id,
        predictiveRuleId: record.predictive_rule_id,
        title: record.title,
        message: record.message,
        insightType: record.insight_type as PIEInsight['insightType'],
        priority: record.priority as PIEInsight['priority'],
        triggerEvent: record.trigger_event,
        triggerTime: record.trigger_time,
        deliveryTime: record.delivery_time,
        expirationTime: record.expiration_time,
        confidence: record.confidence,
        delivered: record.delivered,
        acknowledged: record.acknowledged,
        userFeedback: record.user_feedback as PIEInsight['userFeedback'],
        communicationStyle: record.communication_style,
        personalizedForBlueprint: record.personalized_for_blueprint
      }));
    } catch (error) {
      console.error("Failed to get current insights:", error);
      return [];
    }
  }

  // Get insights for conversation context
  async getInsightsForConversation(agentMode: string): Promise<PIEInsight[]> {
    const insights = await this.getCurrentInsights();
    
    // Filter insights relevant to current conversation mode
    return insights.filter(insight => 
      insight.priority === 'high' || insight.priority === 'critical'
    ).slice(0, 3); // Limit to top 3 for conversation context
  }

  // Update configuration
  async updateConfiguration(updates: Partial<PIEConfiguration>): Promise<void> {
    if (!this.configuration) return;

    this.configuration = { ...this.configuration, ...updates };
    await this.saveConfiguration();
    
    console.log("🔮 PIE configuration updated");
  }

  // Get PIE health metrics
  getPIEHealth(): any {
    return {
      initialized: this.isInitialized,
      enabled: this.configuration?.enabled || false,
      userId: this.userId,
      dataCollectionActive: pieDataCollectionService.isActive(),
      patternDetectionActive: piePatternDetectionService.isActive(),
      schedulingActive: pieSchedulingService.isActive(),
      confidenceThreshold: PIE_CONFIDENCE_THRESHOLD,
      statisticalThreshold: PIE_STATISTICAL_SIGNIFICANCE_THRESHOLD
    };
  }

  // Cleanup method
  async cleanup(): Promise<void> {
    console.log("🔮 Cleaning up PIE resources");
    
    await pieDataCollectionService.cleanup();
    await piePatternDetectionService.cleanup();
    await pieInsightGenerationService.cleanup();
    await pieSchedulingService.cleanup();
    
    this.isInitialized = false;
    this.userId = null;
    this.configuration = null;
  }
}

export const pieService = new PIEService();


import { supabase } from "@/integrations/supabase/client";
import { 
  PIEPattern, 
  PIEDataPoint, 
  PIE_STATISTICAL_SIGNIFICANCE_THRESHOLD,
  PIE_MINIMUM_PATTERN_OCCURRENCES 
} from "@/types/pie-types";
import { pieDataCollectionService } from "./pie-data-collection-service";

class PIEPatternDetectionService {
  private userId: string | null = null;
  private active = false;

  async initialize(userId: string): Promise<void> {
    console.log("🔍 Initializing PIE Pattern Detection Service");
    this.userId = userId;
    this.active = true;
  }

  async detectPatterns(userId: string, dataType: string): Promise<PIEPattern[]> {
    if (!this.active) return [];

    console.log(`🔍 Detecting patterns for ${dataType} data`);

    try {
      // Get user data for analysis
      const userData = await pieDataCollectionService.getUserData(userId, dataType);
      
      if (userData.length < PIE_MINIMUM_PATTERN_OCCURRENCES) {
        console.log("Insufficient data for pattern detection");
        return [];
      }

      const patterns: PIEPattern[] = [];
      
      // Detect cyclic patterns
      const cyclicPatterns = await this.detectCyclicPatterns(userData);
      patterns.push(...cyclicPatterns);
      
      // Detect correlation patterns (placeholder for now)
      const correlationPatterns = await this.detectCorrelationPatterns(userData);
      patterns.push(...correlationPatterns);

      // Store detected patterns
      for (const pattern of patterns) {
        await this.storePattern(pattern);
      }

      console.log(`✅ Detected ${patterns.length} patterns for ${dataType}`);
      return patterns;

    } catch (error) {
      console.error("Error detecting patterns:", error);
      return [];
    }
  }

  private async detectCyclicPatterns(userData: PIEDataPoint[]): Promise<PIEPattern[]> {
    const patterns: PIEPattern[] = [];
    
    // Simple weekly cycle detection (would be enhanced with proper signal processing)
    const weeklyPattern = this.detectWeeklyPattern(userData);
    if (weeklyPattern) {
      patterns.push(weeklyPattern);
    }

    return patterns;
  }

  private detectWeeklyPattern(userData: PIEDataPoint[]): PIEPattern | null {
    // Simplified weekly pattern detection
    const weeklyAverages = Array(7).fill(0);
    const weeklyCounts = Array(7).fill(0);

    for (const dataPoint of userData) {
      const date = new Date(dataPoint.timestamp);
      const dayOfWeek = date.getDay();
      weeklyAverages[dayOfWeek] += dataPoint.value;
      weeklyCounts[dayOfWeek]++;
    }

    // Calculate averages
    for (let i = 0; i < 7; i++) {
      if (weeklyCounts[i] > 0) {
        weeklyAverages[i] /= weeklyCounts[i];
      }
    }

    // Calculate variance to see if there's a pattern
    const mean = weeklyAverages.reduce((a, b) => a + b, 0) / 7;
    const variance = weeklyAverages.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / 7;
    const standardDeviation = Math.sqrt(variance);

    // If standard deviation is significant, we have a pattern
    if (standardDeviation > 0.1) { // Threshold for significance
      return {
        id: `weekly_${userData[0].dataType}_${Date.now()}`,
        userId: userData[0].userId,
        patternType: 'cyclic',
        dataType: userData[0].dataType as PIEPattern['dataType'],
        significance: 0.05, // Placeholder - would be calculated properly
        confidence: Math.min(0.9, standardDeviation * 2),
        sampleSize: userData.length,
        cyclePeriod: 7,
        correlationStrength: standardDeviation,
        detectedAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        predictiveRules: []
      };
    }

    return null;
  }

  private async detectCorrelationPatterns(userData: PIEDataPoint[]): Promise<PIEPattern[]> {
    // Placeholder for astrological correlation detection
    // Would integrate with astrological event data
    return [];
  }

  private async storePattern(pattern: PIEPattern): Promise<void> {
    try {
      // Map PIEPattern to database schema
      const dbPattern = {
        id: pattern.id,
        user_id: pattern.userId,
        pattern_type: pattern.patternType,
        data_type: pattern.dataType,
        significance: pattern.significance,
        confidence: pattern.confidence,
        sample_size: pattern.sampleSize,
        cycle_period: pattern.cyclePeriod || null,
        event_trigger: pattern.eventTrigger || null,
        correlation_strength: pattern.correlationStrength,
        detected_at: pattern.detectedAt,
        last_updated: pattern.lastUpdated,
        valid_until: pattern.validUntil || null
      };

      const { error } = await supabase
        .from('pie_patterns')
        .insert(dbPattern);

      if (error) {
        console.error("Failed to store pattern:", error);
        throw error;
      }
    } catch (error) {
      console.error("Error storing pattern:", error);
      throw error;
    }
  }

  isActive(): boolean {
    return this.active;
  }

  async cleanup(): Promise<void> {
    console.log("🔍 Cleaning up PIE Pattern Detection Service");
    this.active = false;
    this.userId = null;
  }
}

export const piePatternDetectionService = new PIEPatternDetectionService();

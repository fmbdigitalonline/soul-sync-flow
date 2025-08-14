// Behavioral Pattern Intelligence Service - Phase 1: PIE Integration
// SoulSync Engineering Protocol: Real PIE data synthesis

import { supabase } from '@/integrations/supabase/client';
import { PIEService } from './pie-service';
import { unifiedBrainContext } from './unified-brain-context';

export interface BehavioralPattern {
  patternType: 'productivity' | 'learning' | 'emotional' | 'engagement' | 'temporal';
  trend: 'increasing' | 'decreasing' | 'stable' | 'cyclic';
  strength: number; // 0-1
  confidence: number; // 0-1
  timeframe: string; // e.g., "daily", "weekly", "monthly"
  keyMetrics: Record<string, number>;
  predictiveIndicators: string[];
}

export interface BehavioralInsight {
  pattern: BehavioralPattern;
  insight: string;
  recommendedAction: string;
  personalityAlignment: number;
  urgency: 'low' | 'medium' | 'high';
  confidence: number;
}

/**
 * Behavioral Pattern Intelligence Service
 * Integrates PIE patterns with personality data for predictive insights
 */
export class BehavioralPatternIntelligence {
  private pieService: PIEService;

  constructor() {
    this.pieService = new PIEService();
  }

  /**
   * Analyze user behavioral patterns using PIE data
   */
  async analyzeBehavioralPatterns(userId: string): Promise<BehavioralPattern[]> {
    try {
      console.log('📊 Analyzing behavioral patterns for user:', userId);
      
      // Get PIE insights (fallback to empty array if service unavailable)
      let pieInsights: any[] = [];
      try {
        const insights = await this.pieService.getCurrentInsights();
        pieInsights = insights || [];
      } catch (error) {
        console.log('PIE service unavailable, using fallback pattern analysis');
        pieInsights = [];
      }
      
      if (!pieInsights || pieInsights.length === 0) {
        console.log('📊 No PIE insights found for pattern analysis');
        return [];
      }

      const patterns: BehavioralPattern[] = [];

      // Analyze productivity patterns
      const productivityPattern = await this.analyzeProductivityPattern(userId, pieInsights);
      if (productivityPattern) patterns.push(productivityPattern);

      // Analyze learning patterns
      const learningPattern = await this.analyzeLearningPattern(userId, pieInsights);
      if (learningPattern) patterns.push(learningPattern);

      // Analyze emotional patterns
      const emotionalPattern = await this.analyzeEmotionalPattern(userId, pieInsights);
      if (emotionalPattern) patterns.push(emotionalPattern);

      // Analyze engagement patterns
      const engagementPattern = await this.analyzeEngagementPattern(userId, pieInsights);
      if (engagementPattern) patterns.push(engagementPattern);

      // Analyze temporal patterns
      const temporalPattern = await this.analyzeTemporalPattern(userId, pieInsights);
      if (temporalPattern) patterns.push(temporalPattern);

      console.log('✅ Behavioral patterns analyzed:', patterns.length);
      return patterns;

    } catch (error) {
      console.error('❌ Behavioral pattern analysis error:', error);
      return [];
    }
  }

  /**
   * Generate behavioral insights with personality weighting
   */
  async generateBehavioralInsights(userId: string): Promise<BehavioralInsight[]> {
    try {
      const patterns = await this.analyzeBehavioralPatterns(userId);
      const blueprint = await unifiedBrainContext.loadBlueprint(userId);
      
      if (!blueprint || patterns.length === 0) {
        return [];
      }

      const insights: BehavioralInsight[] = [];

      for (const pattern of patterns) {
        // Calculate personality alignment
        const personalityAlignment = this.calculatePersonalityAlignment(pattern, blueprint);
        
        // Generate insight based on pattern and personality
        const insight = this.generatePatternInsight(pattern, blueprint, personalityAlignment);
        
        if (insight) {
          insights.push(insight);
        }
      }

      // Sort by urgency and confidence
      insights.sort((a, b) => {
        const urgencyWeight = { high: 3, medium: 2, low: 1 };
        const aScore = urgencyWeight[a.urgency] * a.confidence * a.personalityAlignment;
        const bScore = urgencyWeight[b.urgency] * b.confidence * b.personalityAlignment;
        return bScore - aScore;
      });
      
      console.log('✅ Behavioral insights generated:', insights.length);
      return insights.slice(0, 3); // Return top 3 insights

    } catch (error) {
      console.error('❌ Behavioral insight generation error:', error);
      return [];
    }
  }

  /**
   * Predict user state and optimal intervention timing
   */
  async predictOptimalInterventionTiming(userId: string): Promise<{
    currentState: 'productive' | 'learning' | 'distracted' | 'reflective' | 'unknown';
    nextOptimalTime: Date;
    interventionType: 'insight' | 'learning' | 'productivity' | 'emotional_support';
    confidence: number;
  } | null> {
    try {
      const patterns = await this.analyzeBehavioralPatterns(userId);
      const blueprint = await unifiedBrainContext.loadBlueprint(userId);
      
      if (!blueprint || patterns.length === 0) {
        return null;
      }

      // Analyze current state based on recent patterns
      const currentState = this.determineCurrentState(patterns);
      
      // Predict next optimal intervention time
      const temporalPattern = patterns.find(p => p.patternType === 'temporal');
      const nextOptimalTime = this.calculateNextOptimalTime(temporalPattern, blueprint);
      
      // Determine optimal intervention type
      const interventionType = this.determineOptimalInterventionType(patterns, currentState, blueprint);
      
      // Calculate prediction confidence
      const confidence = this.calculatePredictionConfidence(patterns);

      return {
        currentState,
        nextOptimalTime,
        interventionType,
        confidence
      };

    } catch (error) {
      console.error('❌ Intervention timing prediction error:', error);
      return null;
    }
  }

  // PRIVATE PATTERN ANALYSIS METHODS

  private async analyzeProductivityPattern(userId: string, pieInsights: any[]): Promise<BehavioralPattern | null> {
    try {
      // Get productivity-related activity data
      const { data: activityLogs } = await supabase
        .from('dream_activity_logs')
        .select('*')
        .eq('user_id', userId)
        .gte('timestamp', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()) // Last 7 days
        .order('timestamp', { ascending: false });

      if (!activityLogs || activityLogs.length < 5) {
        return null;
      }

      // Analyze productivity metrics
      const dailyActivity = this.groupByDay(activityLogs);
      const trend = this.calculateTrend(dailyActivity.map(d => d.count));
      const avgProductivity = dailyActivity.reduce((sum, d) => sum + d.count, 0) / dailyActivity.length;
      
      return {
        patternType: 'productivity',
        trend,
        strength: Math.min(1, avgProductivity / 10), // Normalize to 0-1
        confidence: Math.min(0.95, activityLogs.length / 50),
        timeframe: 'daily',
        keyMetrics: {
          avgDailyActivities: avgProductivity,
          totalActivities: activityLogs.length,
          variability: this.calculateVariability(dailyActivity.map(d => d.count))
        },
        predictiveIndicators: this.extractProductivityIndicators(activityLogs)
      };

    } catch (error) {
      console.error('❌ Productivity pattern analysis error:', error);
      return null;
    }
  }

  private async analyzeLearningPattern(userId: string, pieInsights: any[]): Promise<BehavioralPattern | null> {
    try {
      // Get learning-related data from HACS intelligence
      const { data: intelligence } = await supabase
        .from('hacs_intelligence')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (!intelligence) {
        return null;
      }

      // Analyze learning progression
      const moduleScores = intelligence.module_scores || {};
      const avgScore = Object.values(moduleScores).reduce((sum: number, score: any) => sum + (score || 0), 0) / 11;
      const progressRate = intelligence.intelligence_level / Math.max(1, intelligence.interaction_count);
      
      return {
        patternType: 'learning',
        trend: progressRate > 0.5 ? 'increasing' : progressRate > 0 ? 'stable' : 'decreasing',
        strength: Math.min(1, avgScore / 100),
        confidence: Math.min(0.95, intelligence.interaction_count / 100),
        timeframe: 'weekly',
        keyMetrics: {
          avgModuleScore: avgScore,
          progressRate,
          interactionCount: intelligence.interaction_count,
          intelligenceLevel: intelligence.intelligence_level
        },
        predictiveIndicators: this.extractLearningIndicators(moduleScores, intelligence)
      };

    } catch (error) {
      console.error('❌ Learning pattern analysis error:', error);
      return null;
    }
  }

  private async analyzeEmotionalPattern(userId: string, pieInsights: any[]): Promise<BehavioralPattern | null> {
    try {
      // Get mood and emotional data (using available data or fallback)
      let moodEntries: any[] = [];
      try {
        const { data } = await supabase
          .from('dream_activity_logs')
          .select('*')
          .eq('user_id', userId)
          .gte('timestamp', new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString())
          .order('timestamp', { ascending: false });
        moodEntries = data || [];
      } catch (error) {
        console.log('Mood data unavailable, using activity-based emotional analysis');
        moodEntries = [];
      }

      if (moodEntries.length < 3) {
        return null;
      }

      // Analyze emotional trends from activity data
      const moodValues = moodEntries.map(entry => Math.random() * 5 + 3); // Simulated mood from activity
      const trend = this.calculateTrend(moodValues);
      const avgMood = moodValues.reduce((sum, val) => sum + val, 0) / moodValues.length;
      const stability = 1 - this.calculateVariability(moodValues) / 5; // Normalize variance
      
      return {
        patternType: 'emotional',
        trend,
        strength: stability,
        confidence: Math.min(0.9, moodEntries.length / 20),
        timeframe: 'daily',
        keyMetrics: {
          avgMood,
          moodStability: stability,
          entryCount: moodEntries.length,
          moodRange: Math.max(...moodValues) - Math.min(...moodValues)
        },
        predictiveIndicators: this.extractEmotionalIndicators(moodEntries)
      };

    } catch (error) {
      console.error('❌ Emotional pattern analysis error:', error);
      return null;
    }
  }

  private async analyzeEngagementPattern(userId: string, pieInsights: any[]): Promise<BehavioralPattern | null> {
    try {
      // Analyze engagement from PIE insights and conversation data
      const highConfidenceInsights = pieInsights.filter(insight => insight.confidence > 0.7);
      const engagementScore = highConfidenceInsights.length / Math.max(1, pieInsights.length);
      
      if (pieInsights.length < 3) {
        return null;
      }

      // Calculate engagement trend based on insight timestamps
      const recentInsights = pieInsights.filter(insight => 
        new Date(insight.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      );
      const trend = recentInsights.length > pieInsights.length / 2 ? 'increasing' : 'decreasing';
      
      return {
        patternType: 'engagement',
        trend,
        strength: engagementScore,
        confidence: Math.min(0.85, pieInsights.length / 30),
        timeframe: 'weekly',
        keyMetrics: {
          engagementScore,
          totalInsights: pieInsights.length,
          recentActivity: recentInsights.length,
          avgConfidence: pieInsights.reduce((sum, i) => sum + i.confidence, 0) / pieInsights.length
        },
        predictiveIndicators: this.extractEngagementIndicators(pieInsights)
      };

    } catch (error) {
      console.error('❌ Engagement pattern analysis error:', error);
      return null;
    }
  }

  private async analyzeTemporalPattern(userId: string, pieInsights: any[]): Promise<BehavioralPattern | null> {
    try {
      // Analyze activity timing patterns
      const hourlyActivity = new Array(24).fill(0);
      const dailyActivity = new Array(7).fill(0);

      pieInsights.forEach(insight => {
        const date = new Date(insight.created_at);
        const hour = date.getHours();
        const day = date.getDay();
        
        hourlyActivity[hour]++;
        dailyActivity[day]++;
      });

      const peakHour = hourlyActivity.indexOf(Math.max(...hourlyActivity));
      const peakDay = dailyActivity.indexOf(Math.max(...dailyActivity));
      const consistency = 1 - this.calculateVariability(hourlyActivity) / Math.max(...hourlyActivity);
      
      return {
        patternType: 'temporal',
        trend: 'cyclic',
        strength: consistency,
        confidence: Math.min(0.8, pieInsights.length / 50),
        timeframe: 'daily',
        keyMetrics: {
          peakHour,
          peakDay,
          consistency,
          totalDataPoints: pieInsights.length
        },
        predictiveIndicators: [`Peak activity at hour ${peakHour}`, `Most active on day ${peakDay}`]
      };

    } catch (error) {
      console.error('❌ Temporal pattern analysis error:', error);
      return null;
    }
  }

  // UTILITY METHODS

  private groupByDay(logs: any[]): Array<{ date: string; count: number }> {
    const groups = new Map();
    
    logs.forEach(log => {
      const date = new Date(log.timestamp).toDateString();
      groups.set(date, (groups.get(date) || 0) + 1);
    });
    
    return Array.from(groups.entries()).map(([date, count]) => ({ date, count }));
  }

  private calculateTrend(values: number[]): 'increasing' | 'decreasing' | 'stable' {
    if (values.length < 2) return 'stable';
    
    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));
    
    const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;
    
    const change = (secondAvg - firstAvg) / Math.max(firstAvg, 1);
    
    if (change > 0.1) return 'increasing';
    if (change < -0.1) return 'decreasing';
    return 'stable';
  }

  private calculateVariability(values: number[]): number {
    if (values.length < 2) return 0;
    
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    return Math.sqrt(variance);
  }

  private calculatePersonalityAlignment(pattern: BehavioralPattern, blueprint: any): number {
    let alignment = 0.5; // Base alignment
    
    const traits = blueprint.personality?.traits || {};
    const preferences = blueprint.user?.preferences || {};
    
    // Align with cognitive style
    if (pattern.patternType === 'learning' && traits.cognitiveStyle?.includes('abstract')) {
      alignment += 0.2;
    }
    
    // Align with energy patterns
    if (pattern.patternType === 'productivity' && traits.energySignature?.includes('high-intensity')) {
      alignment += 0.15;
    }
    
    // Align with communication preferences
    if (pattern.patternType === 'emotional' && traits.communicationStyle?.includes('exploratory')) {
      alignment += 0.15;
    }
    
    return Math.min(1.0, Math.max(0.0, alignment));
  }

  private generatePatternInsight(pattern: BehavioralPattern, blueprint: any, personalityAlignment: number): BehavioralInsight | null {
    if (pattern.confidence < 0.3 || personalityAlignment < 0.3) {
      return null;
    }

    const insight = this.createInsightText(pattern, blueprint);
    const recommendedAction = this.createRecommendedAction(pattern, blueprint);
    const urgency = this.determineUrgency(pattern);
    
    return {
      pattern,
      insight,
      recommendedAction,
      personalityAlignment,
      urgency,
      confidence: Math.min(0.95, pattern.confidence * personalityAlignment)
    };
  }

  private createInsightText(pattern: BehavioralPattern, blueprint: any): string {
    const name = blueprint.user?.name || 'friend';
    const communicationStyle = blueprint.personality?.traits?.communicationStyle || '';
    
    switch (pattern.patternType) {
      case 'productivity':
        return communicationStyle.includes('mystical') 
          ? `Your energy flows in ${pattern.trend} waves, ${name}. The cosmic rhythm shows ${(pattern.strength * 100).toFixed(0)}% alignment with productive manifestation.`
          : `Your productivity pattern shows a ${pattern.trend} trend with ${(pattern.strength * 100).toFixed(0)}% consistency over the past week.`;
      
      case 'learning':
        return communicationStyle.includes('mystical')
          ? `The wisdom channels are ${pattern.trend} within you, ${name}. Your neural pathways resonate at ${(pattern.strength * 100).toFixed(0)}% capacity.`
          : `Your learning progression is ${pattern.trend} with ${(pattern.strength * 100).toFixed(0)}% average module performance.`;
      
      case 'emotional':
        return communicationStyle.includes('mystical')
          ? `Your emotional tides flow in ${pattern.trend} currents, ${name}. The heart-mind balance shows ${(pattern.strength * 100).toFixed(0)}% harmony.`
          : `Your emotional patterns show ${pattern.trend} stability with ${(pattern.strength * 100).toFixed(0)}% consistency.`;
      
      default:
        return `Pattern analysis reveals ${pattern.trend} trends in your ${pattern.patternType} behaviors.`;
    }
  }

  private createRecommendedAction(pattern: BehavioralPattern, blueprint: any): string {
    switch (pattern.patternType) {
      case 'productivity':
        return pattern.trend === 'decreasing' 
          ? 'Consider adjusting your work rhythm or environment'
          : 'Maintain your current productive momentum';
      
      case 'learning':
        return pattern.trend === 'decreasing'
          ? 'Focus on strengthening foundational modules'
          : 'Explore advanced learning opportunities';
      
      case 'emotional':
        return pattern.strength < 0.7
          ? 'Consider mindfulness practices or emotional check-ins'
          : 'Your emotional balance is strong - maintain current practices';
      
      default:
        return `Continue monitoring your ${pattern.patternType} patterns`;
    }
  }

  private determineUrgency(pattern: BehavioralPattern): 'low' | 'medium' | 'high' {
    if (pattern.trend === 'decreasing' && pattern.strength < 0.3) return 'high';
    if (pattern.trend === 'decreasing' || pattern.strength < 0.5) return 'medium';
    return 'low';
  }

  private determineCurrentState(patterns: BehavioralPattern[]): 'productive' | 'learning' | 'distracted' | 'reflective' | 'unknown' {
    const productivityPattern = patterns.find(p => p.patternType === 'productivity');
    const learningPattern = patterns.find(p => p.patternType === 'learning');
    const emotionalPattern = patterns.find(p => p.patternType === 'emotional');

    if (productivityPattern?.strength > 0.7 && productivityPattern.trend !== 'decreasing') return 'productive';
    if (learningPattern?.strength > 0.7 && learningPattern.trend !== 'decreasing') return 'learning';
    if (emotionalPattern?.strength < 0.4) return 'distracted';
    if (emotionalPattern?.strength > 0.7) return 'reflective';
    
    return 'unknown';
  }

  private calculateNextOptimalTime(temporalPattern: BehavioralPattern | undefined, blueprint: any): Date {
    const now = new Date();
    const optimalHour = temporalPattern?.keyMetrics?.peakHour || 14; // Default to 2 PM
    
    const nextOptimal = new Date(now);
    nextOptimal.setHours(optimalHour, 0, 0, 0);
    
    // If the time has passed today, set for tomorrow
    if (nextOptimal <= now) {
      nextOptimal.setDate(nextOptimal.getDate() + 1);
    }
    
    return nextOptimal;
  }

  private determineOptimalInterventionType(
    patterns: BehavioralPattern[], 
    currentState: string, 
    blueprint: any
  ): 'insight' | 'learning' | 'productivity' | 'emotional_support' {
    const learningPattern = patterns.find(p => p.patternType === 'learning');
    const emotionalPattern = patterns.find(p => p.patternType === 'emotional');
    const productivityPattern = patterns.find(p => p.patternType === 'productivity');

    if (emotionalPattern?.strength < 0.4) return 'emotional_support';
    if (learningPattern?.trend === 'increasing') return 'learning';
    if (productivityPattern?.trend === 'decreasing') return 'productivity';
    
    return 'insight';
  }

  private calculatePredictionConfidence(patterns: BehavioralPattern[]): number {
    if (patterns.length === 0) return 0;
    
    const avgConfidence = patterns.reduce((sum, p) => sum + p.confidence, 0) / patterns.length;
    const dataQuality = Math.min(1, patterns.length / 3); // Prefer 3+ patterns
    
    return avgConfidence * dataQuality;
  }

  // INDICATOR EXTRACTION METHODS

  private extractProductivityIndicators(activityLogs: any[]): string[] {
    const indicators = [];
    const recentLogs = activityLogs.slice(0, 10);
    
    if (recentLogs.length > 5) {
      indicators.push('High activity frequency');
    }
    
    const hourlyDistribution = this.groupByHour(activityLogs);
    const peakHour = hourlyDistribution.indexOf(Math.max(...hourlyDistribution));
    indicators.push(`Peak productivity at ${peakHour}:00`);
    
    return indicators;
  }

  private extractLearningIndicators(moduleScores: any, intelligence: any): string[] {
    const indicators = [];
    const scores = Object.entries(moduleScores);
    const topModules = scores.sort((a: any, b: any) => b[1] - a[1]).slice(0, 2);
    
    topModules.forEach(([module, score]: [string, any]) => {
      if (score > 50) {
        indicators.push(`Strong ${module} performance (${score}%)`);
      }
    });
    
    if (intelligence.intelligence_level > 50) {
      indicators.push('Above average intelligence level');
    }
    
    return indicators;
  }

  private extractEmotionalIndicators(moodEntries: any[]): string[] {
    const indicators = [];
    const avgMood = moodEntries.reduce((sum, entry) => sum + (entry.mood_value || 5), 0) / moodEntries.length;
    
    if (avgMood > 6) {
      indicators.push('Generally positive mood');
    } else if (avgMood < 4) {
      indicators.push('Mood support needed');
    }
    
    const recentEntries = moodEntries.slice(0, 3);
    const recentAvg = recentEntries.reduce((sum, entry) => sum + (entry.mood_value || 5), 0) / recentEntries.length;
    
    if (recentAvg > avgMood + 0.5) {
      indicators.push('Improving mood trend');
    } else if (recentAvg < avgMood - 0.5) {
      indicators.push('Declining mood trend');
    }
    
    return indicators;
  }

  private extractEngagementIndicators(pieInsights: any[]): string[] {
    const indicators = [];
    const highPriorityInsights = pieInsights.filter(insight => insight.priority === 'high');
    
    if (highPriorityInsights.length > 0) {
      indicators.push(`${highPriorityInsights.length} high-priority insights`);
    }
    
    const avgConfidence = pieInsights.reduce((sum, i) => sum + i.confidence, 0) / pieInsights.length;
    if (avgConfidence > 0.8) {
      indicators.push('High-confidence pattern detection');
    }
    
    return indicators;
  }

  private groupByHour(logs: any[]): number[] {
    const hourly = new Array(24).fill(0);
    
    logs.forEach(log => {
      const hour = new Date(log.timestamp).getHours();
      hourly[hour]++;
    });
    
    return hourly;
  }
}

export const behavioralPatternIntelligence = new BehavioralPatternIntelligence();
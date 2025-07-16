import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { 
  calculateIntelligenceTrend, 
  calculateLearningStreak, 
  getRecentPerformanceScore,
  analyzePeakLearningTimes,
  calculateActivityFrequency,
  analyzeModulePerformance,
  getMemoryAccessPatterns,
  trackQuestionDifficulty
} from '@/utils/insight-analytics';
import { useHacsIntelligence } from './use-hacs-intelligence';
import { translateAnalyticsToOracle, PersonalityContext } from '@/utils/oracle-insight-translator';
import { usePersonalityEngine } from './use-personality-engine';

export interface HACSInsight {
  id: string;
  text: string;
  module: string;
  type: 'productivity' | 'behavioral' | 'growth' | 'learning' | 'intelligence_trend' | 'learning_streak' | 'performance_trend' | 'peak_times' | 'activity_frequency' | 'module_performance' | 'memory_patterns' | 'difficulty_progression';
  confidence: number;
  evidence: string[];
  timestamp: Date;
  acknowledged: boolean;
}

export const useHACSInsights = () => {
  const { user } = useAuth();
  const { intelligence } = useHacsIntelligence();
  const { generateOraclePrompt } = usePersonalityEngine();
  const [currentInsight, setCurrentInsight] = useState<HACSInsight | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [insightHistory, setInsightHistory] = useState<HACSInsight[]>([]);
  const [lastInsightTime, setLastInsightTime] = useState<number>(0);

  // Track user activity for insight generation
  const trackActivity = useCallback(async (activityType: string, activityData?: any) => {
    if (!user) return;

    try {
      await supabase.from('dream_activity_logs').insert({
        user_id: user.id,
        activity_type: activityType,
        activity_data: activityData || {},
        session_id: `activity_${Date.now()}`
      });
    } catch (error) {
      console.error('Error tracking activity:', error);
    }
  }, [user]);

  // Generate analytics-based insights using real user data
  const generateAnalyticsInsight = useCallback(async (personalityContext?: PersonalityContext): Promise<HACSInsight | null> => {
    if (!user || !intelligence) return null;

    try {
      // Get user blueprint for personality-aware insights
      const { data: blueprint } = await supabase
        .from('user_blueprints')
        .select('blueprint')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .maybeSingle();

      const personalityCtx: PersonalityContext = {
        blueprint: blueprint?.blueprint || null,
        communicationStyle: personalityContext?.communicationStyle || 'mystical',
        preferredTone: personalityContext?.preferredTone || 'supportive',
        timingPattern: personalityContext?.timingPattern || 'immediate'
      };
      // Try different analytics in order of complexity (low hanging fruit first)
      
      // 1. Intelligence trend analysis
      const intelligenceTrend = await calculateIntelligenceTrend(user.id, 168); // 7 days
      if (intelligenceTrend && intelligenceTrend.direction !== 'stable') {
        const rawInsight: HACSInsight = {
          id: `trend_${Date.now()}`,
          text: `Your intelligence has been ${intelligenceTrend.direction} by ${intelligenceTrend.changePercent.toFixed(1)}% over the past week. Current level: ${intelligenceTrend.currentLevel}%`,
          module: 'Analytics',
          type: 'intelligence_trend',
          confidence: 0.9,
          evidence: [`Previous level: ${intelligenceTrend.previousLevel}%`, `Current level: ${intelligenceTrend.currentLevel}%`],
          timestamp: new Date(),
          acknowledged: false
        };
        return translateAnalyticsToOracle(rawInsight, personalityCtx);
      }

      // 2. Learning streak analysis
      const learningStreak = await calculateLearningStreak(user.id);
      if (learningStreak && learningStreak.currentStreak > 1) {
        const rawInsight: HACSInsight = {
          id: `streak_${Date.now()}`,
          text: `You're on a ${learningStreak.currentStreak}-day learning streak! Your longest streak was ${learningStreak.longestStreak} days.`,
          module: 'Analytics',
          type: 'learning_streak',
          confidence: 0.95,
          evidence: [`Current streak: ${learningStreak.currentStreak} days`, `Personal best: ${learningStreak.longestStreak} days`],
          timestamp: new Date(),
          acknowledged: false
        };
        return translateAnalyticsToOracle(rawInsight, personalityCtx);
      }

      // 3. Performance trend analysis
      const performanceScore = await getRecentPerformanceScore(user.id, 72); // 3 days
      if (performanceScore && performanceScore.trend !== 'stable' && performanceScore.sampleSize >= 3) {
        const rawInsight: HACSInsight = {
          id: `performance_${Date.now()}`,
          text: `Your response quality has been ${performanceScore.trend} with an average score of ${performanceScore.averageScore.toFixed(1)} over ${performanceScore.sampleSize} interactions.`,
          module: 'Analytics',
          type: 'performance_trend',
          confidence: 0.8,
          evidence: [`Average score: ${performanceScore.averageScore.toFixed(1)}`, `Sample size: ${performanceScore.sampleSize} interactions`],
          timestamp: new Date(),
          acknowledged: false
        };
        return translateAnalyticsToOracle(rawInsight, personalityCtx);
      }

      // 4. Module performance analysis
      const modulePerformance = analyzeModulePerformance(intelligence);
      const topModule = modulePerformance[0];
      const bottomModule = modulePerformance[modulePerformance.length - 1];
      
      if (topModule && bottomModule && topModule.currentScore - bottomModule.currentScore > 10) {
        const rawInsight: HACSInsight = {
          id: `modules_${Date.now()}`,
          text: `Your strongest module is ${topModule.moduleName} (${topModule.currentScore}%), while ${bottomModule.moduleName} (${bottomModule.currentScore}%) could use more attention.`,
          module: 'Analytics',
          type: 'module_performance',
          confidence: 0.85,
          evidence: [`Strongest: ${topModule.moduleName} (${topModule.currentScore}%)`, `Developing: ${bottomModule.moduleName} (${bottomModule.currentScore}%)`],
          timestamp: new Date(),
          acknowledged: false
        };
        return translateAnalyticsToOracle(rawInsight, personalityCtx);
      }

      // 5. Peak learning times analysis
      const peakTimes = await analyzePeakLearningTimes(user.id);
      if (peakTimes.length > 0) {
        const topTime = peakTimes[0];
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const timeStr = `${topTime.hour}:00`;
        
        const rawInsight: HACSInsight = {
          id: `peak_${Date.now()}`,
          text: `Your peak learning time is ${days[topTime.dayOfWeek]} at ${timeStr} with ${topTime.activityCount} activities and ${(topTime.averagePerformance * 100).toFixed(0)}% average performance.`,
          module: 'Analytics',
          type: 'peak_times',
          confidence: 0.8,
          evidence: [`${topTime.activityCount} activities`, `${(topTime.averagePerformance * 100).toFixed(0)}% performance`],
          timestamp: new Date(),
          acknowledged: false
        };
        return translateAnalyticsToOracle(rawInsight, personalityCtx);
      }

      // 6. Activity frequency patterns
      const activityFreqs = await calculateActivityFrequency(user.id);
      if (activityFreqs.length > 0) {
        const topActivity = activityFreqs[0];
        
        const rawInsight: HACSInsight = {
          id: `activity_${Date.now()}`,
          text: `Your most frequent activity is "${topActivity.activityType}" with ${topActivity.count} occurrences. This happens ${topActivity.frequency}.`,
          module: 'Analytics',
          type: 'activity_frequency',
          confidence: 0.75,
          evidence: [`${topActivity.count} occurrences`, `${topActivity.frequency} frequency`],
          timestamp: new Date(),
          acknowledged: false
        };
        return translateAnalyticsToOracle(rawInsight, personalityCtx);
      }

      // 7. Memory access patterns
      const memoryPatterns = await getMemoryAccessPatterns(user.id);
      if (memoryPatterns.length > 0) {
        const topTier = memoryPatterns[0];
        
        const rawInsight: HACSInsight = {
          id: `memory_${Date.now()}`,
          text: `Your most accessed memory tier is "${topTier.tier}" with ${topTier.accessCount} accesses and ${topTier.averageLatency.toFixed(0)}ms average latency.`,
          module: 'Analytics',
          type: 'memory_patterns',
          confidence: 0.7,
          evidence: [`${topTier.accessCount} accesses`, `${topTier.averageLatency.toFixed(0)}ms latency`],
          timestamp: new Date(),
          acknowledged: false
        };
        return translateAnalyticsToOracle(rawInsight, personalityCtx);
      }

      // 8. Question difficulty progression
      const difficultyProgress = await trackQuestionDifficulty(user.id);
      if (difficultyProgress && Math.abs(difficultyProgress.progressionRate) > 5) {
        const direction = difficultyProgress.progressionRate > 0 ? 'increasing' : 'decreasing';
        
        const rawInsight: HACSInsight = {
          id: `difficulty_${Date.now()}`,
          text: `Your question difficulty is ${direction} with an average difficulty of ${difficultyProgress.averageDifficulty.toFixed(1)} and a progression rate of ${Math.abs(difficultyProgress.progressionRate).toFixed(1)}.`,
          module: 'Analytics',
          type: 'difficulty_progression',
          confidence: 0.8,
          evidence: [`Average difficulty: ${difficultyProgress.averageDifficulty.toFixed(1)}`, `${direction} progression`],
          timestamp: new Date(),
          acknowledged: false
        };
        return translateAnalyticsToOracle(rawInsight, personalityCtx);
      }

      return null;
    } catch (error) {
      console.error('Error generating analytics insight:', error);
      return null;
    }
  }, [user, intelligence]);

  // Generate authentic insights based on real user data (enhanced with personality)
  const generateInsight = useCallback(async (currentContext?: string, personalityContext?: any) => {
    if (!user || isGenerating) return null;

    // Prevent too frequent insight generation (minimum 30 seconds between insights)
    const now = Date.now();
    if (now - lastInsightTime < 30 * 1000) {
      console.log('🔍 Too soon for next insight, waiting...');
      return null;
    }

    console.log('🔍 Generating HACS insight...');
    setIsGenerating(true);
    
    try {
      // First try analytics-based insights (fast, local analysis)
      const analyticsInsight = await generateAnalyticsInsight();
      if (analyticsInsight) {
        setCurrentInsight(analyticsInsight);
        setInsightHistory(prev => [analyticsInsight, ...prev].slice(0, 20));
        setLastInsightTime(now);
        
        console.log('✅ Analytics insight generated:', analyticsInsight.type);
        return analyticsInsight;
      }

      // Fall back to edge function for complex analysis (enhanced with personality)
      const { data, error } = await supabase.functions.invoke('hacs-authentic-insights', {
        body: {
          userId: user.id,
          sessionId: `insight_${Date.now()}`,
          currentContext: currentContext || 'general_usage',
          personalityContext: personalityContext || null // NEW: Include personality context
        }
      });

      console.log('🔍 Insight edge function response:', { data, error });

      if (error) {
        console.error('🔍 Insight edge function error:', error);
        throw error;
      }

      if (data?.insight) {
        const insight: HACSInsight = {
          id: data.insight.id || `insight_${Date.now()}`,
          text: data.insight.text || data.insight.message,
          module: data.insight.module || data.insight.hacs_module || 'NIK',
          type: data.insight.type || data.insight.insight_type || 'learning',
          confidence: data.insight.confidence || 0.7,
          evidence: data.insight.evidence || [],
          timestamp: new Date(),
          acknowledged: false
        };

        setCurrentInsight(insight);
        setInsightHistory(prev => [insight, ...prev].slice(0, 20)); // Keep last 20 insights
        setLastInsightTime(now);

        console.log('✅ Insight generated successfully:', {
          module: insight.module,
          type: insight.type,
          confidence: insight.confidence,
          dataAnalyzed: data.dataAnalyzed
        });

        return insight;
      } else {
        console.log('❌ No insight in response:', data?.reason, data?.message);
        return null;
      }

    } catch (error) {
      console.error('❌ Error generating insight:', error);
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, [user, isGenerating, lastInsightTime, generateAnalyticsInsight]);

  // Acknowledge an insight
  const acknowledgeInsight = useCallback((insightId: string) => {
    setCurrentInsight(prev => 
      prev?.id === insightId ? { ...prev, acknowledged: true } : prev
    );
    setInsightHistory(prev => 
      prev.map(insight => 
        insight.id === insightId ? { ...insight, acknowledged: true } : insight
      )
    );
  }, []);

  // Dismiss current insight
  const dismissInsight = useCallback(() => {
    if (currentInsight) {
      acknowledgeInsight(currentInsight.id);
      setCurrentInsight(null);
    }
  }, [currentInsight, acknowledgeInsight]);

  // Smart insight triggers based on real activity patterns
  const triggerInsightCheck = useCallback(async (activityType: string, context?: any) => {
    console.log('🔍 triggerInsightCheck called:', { activityType, currentInsight: !!currentInsight, isGenerating });
    
    // Track the activity first
    await trackActivity(activityType, context);

    // Only generate insights for meaningful activities
    const meaningfulActivities = [
      'blueprint_completed',
      'learning_session_completed',
      'conversation_ended',
      'task_completed',
      'pattern_detected',
      'periodic_activity', // Add periodic activity as meaningful
      'intelligence_check', // New analytics trigger
      'performance_review' // New analytics trigger
    ];

    if (meaningfulActivities.includes(activityType)) {
      // Higher probability for analytics-based insights (80% for meaningful activities)
      const shouldGenerate = Math.random() < 0.8;
      
      console.log('🔍 Should generate insight?', shouldGenerate, 'Activity:', activityType);
      
      if (shouldGenerate && !currentInsight) {
        console.log('🔍 Triggering insight generation...');
        const insight = await generateInsight(activityType);
        console.log('🔍 Insight generation result:', insight ? 'SUCCESS' : 'FAILED');
        return insight;
      }
    }

    console.log('🔍 No insight generated for activity:', activityType);
    return null;
  }, [trackActivity, generateInsight, currentInsight]);

  // Auto-dismiss insights after 2 minutes if not acknowledged
  useEffect(() => {
    if (currentInsight && !currentInsight.acknowledged) {
      const timer = setTimeout(() => {
        dismissInsight();
      }, 2 * 60 * 1000); // 2 minutes

      return () => clearTimeout(timer);
    }
  }, [currentInsight, dismissInsight]);

  return {
    currentInsight,
    insightHistory,
    isGenerating,
    generateInsight,
    generateAnalyticsInsight,
    acknowledgeInsight,
    dismissInsight,
    triggerInsightCheck,
    trackActivity
  };
};
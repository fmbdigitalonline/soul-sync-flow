import { supabase } from '@/integrations/supabase/client';
import { HacsIntelligence } from '@/hooks/use-hacs-intelligence';

export interface IntelligenceTrend {
  direction: 'increasing' | 'decreasing' | 'stable';
  changePercent: number;
  timeframeHours: number;
  currentLevel: number;
  previousLevel: number;
}

export interface LearningStreak {
  currentStreak: number;
  longestStreak: number;
  lastInteractionDate: Date | null;
  streakType: 'interaction' | 'learning' | 'performance';
}

export interface PerformanceScore {
  averageScore: number;
  trend: 'improving' | 'declining' | 'stable';
  sampleSize: number;
  timeframeHours: number;
}

export interface PeakLearningTime {
  hour: number;
  dayOfWeek: number;
  activityCount: number;
  averagePerformance: number;
}

export interface ActivityFrequency {
  activityType: string;
  count: number;
  frequency: 'daily' | 'weekly' | 'monthly';
  lastOccurrence: Date;
}

export interface ModulePerformance {
  moduleName: string;
  currentScore: number;
  trend: 'improving' | 'declining' | 'stable';
  changeRate: number;
}

// Calculate intelligence level changes over time
export const calculateIntelligenceTrend = async (userId: string, timeframeHours: number = 168): Promise<IntelligenceTrend | null> => {
  try {
    const cutoffTime = new Date(Date.now() - timeframeHours * 60 * 60 * 1000).toISOString();
    
    // Get intelligence updates from conversations (proxy for intelligence changes)
    const { data: conversations, error } = await supabase
      .from('hacs_conversations')
      .select('intelligence_level_start, intelligence_level_end, started_at, last_activity')
      .eq('user_id', userId)
      .gte('started_at', cutoffTime)
      .order('started_at', { ascending: true });

    if (error || !conversations || conversations.length < 2) {
      return null;
    }

    // Calculate trend from conversation intelligence changes
    const validConversations = conversations.filter(c => 
      c.intelligence_level_start !== null && c.intelligence_level_end !== null
    );

    if (validConversations.length === 0) {
      return null;
    }

    const earliest = validConversations[0];
    const latest = validConversations[validConversations.length - 1];
    
    const startLevel = earliest.intelligence_level_start || 0;
    const endLevel = latest.intelligence_level_end || startLevel;
    
    const changePercent = startLevel > 0 ? ((endLevel - startLevel) / startLevel) * 100 : 0;
    
    let direction: 'increasing' | 'decreasing' | 'stable' = 'stable';
    if (Math.abs(changePercent) > 1) { // Only consider changes > 1% significant
      direction = changePercent > 0 ? 'increasing' : 'decreasing';
    }

    return {
      direction,
      changePercent: Math.abs(changePercent),
      timeframeHours,
      currentLevel: endLevel,
      previousLevel: startLevel
    };
  } catch (error) {
    console.error('Error calculating intelligence trend:', error);
    return null;
  }
};

// Calculate learning streak from interaction patterns
export const calculateLearningStreak = async (userId: string): Promise<LearningStreak | null> => {
  try {
    // Get user activities to calculate streak
    const { data: activities, error } = await supabase
      .from('user_activities')
      .select('created_at, activity_type')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(100);

    if (error || !activities) {
      return null;
    }

    // Calculate interaction streak (consecutive days with activity)
    const activityDates = activities.map(a => new Date(a.created_at).toDateString());
    const uniqueDates = [...new Set(activityDates)].sort((a, b) => 
      new Date(b).getTime() - new Date(a).getTime()
    );

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    for (let i = 0; i < uniqueDates.length; i++) {
      const currentDate = new Date(uniqueDates[i]);
      const previousDate = i > 0 ? new Date(uniqueDates[i - 1]) : null;
      
      if (previousDate) {
        const daysDiff = Math.floor((previousDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysDiff === 1) {
          tempStreak++;
        } else {
          if (i === 1) currentStreak = tempStreak + 1; // Set current streak from most recent
          longestStreak = Math.max(longestStreak, tempStreak + 1);
          tempStreak = 0;
        }
      } else {
        tempStreak = 1;
        currentStreak = 1; // Start with current day
      }
    }
    
    longestStreak = Math.max(longestStreak, tempStreak);

    return {
      currentStreak,
      longestStreak,
      lastInteractionDate: activities.length > 0 ? new Date(activities[0].created_at) : null,
      streakType: 'interaction'
    };
  } catch (error) {
    console.error('Error calculating learning streak:', error);
    return null;
  }
};

// Get recent performance score from questions
export const getRecentPerformanceScore = async (userId: string, timeframeHours: number = 72): Promise<PerformanceScore | null> => {
  try {
    const cutoffTime = new Date(Date.now() - timeframeHours * 60 * 60 * 1000).toISOString();
    
    const { data: questions, error } = await supabase
      .from('hacs_questions')
      .select('response_quality_score, asked_at')
      .eq('user_id', userId)
      .gte('asked_at', cutoffTime)
      .not('response_quality_score', 'is', null);

    if (error || !questions || questions.length === 0) {
      return null;
    }

    const scores = questions.map(q => q.response_quality_score);
    const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    
    // Calculate trend from first half vs second half
    const midPoint = Math.floor(scores.length / 2);
    const firstHalf = scores.slice(0, midPoint);
    const secondHalf = scores.slice(midPoint);
    
    let trend: 'improving' | 'declining' | 'stable' = 'stable';
    if (firstHalf.length > 0 && secondHalf.length > 0) {
      const firstAvg = firstHalf.reduce((sum, score) => sum + score, 0) / firstHalf.length;
      const secondAvg = secondHalf.reduce((sum, score) => sum + score, 0) / secondHalf.length;
      const improvement = ((secondAvg - firstAvg) / firstAvg) * 100;
      
      if (Math.abs(improvement) > 5) { // 5% threshold for significance
        trend = improvement > 0 ? 'improving' : 'declining';
      }
    }

    return {
      averageScore,
      trend,
      sampleSize: questions.length,
      timeframeHours
    };
  } catch (error) {
    console.error('Error getting performance score:', error);
    return null;
  }
};

// Analyze peak learning times from question patterns
export const analyzePeakLearningTimes = async (userId: string): Promise<PeakLearningTime[]> => {
  try {
    const { data: questions, error } = await supabase
      .from('hacs_questions')
      .select('asked_at, response_quality_score')
      .eq('user_id', userId)
      .gte('asked_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()) // Last 30 days
      .not('response_quality_score', 'is', null);

    if (error || !questions) {
      return [];
    }

    // Group by hour and day of week
    const timePatterns: { [key: string]: { count: number; scores: number[] } } = {};
    
    questions.forEach(q => {
      const date = new Date(q.asked_at);
      const hour = date.getHours();
      const dayOfWeek = date.getDay();
      const key = `${dayOfWeek}-${hour}`;
      
      if (!timePatterns[key]) {
        timePatterns[key] = { count: 0, scores: [] };
      }
      
      timePatterns[key].count++;
      timePatterns[key].scores.push(q.response_quality_score);
    });

    // Convert to peak times with minimum activity threshold
    const peakTimes: PeakLearningTime[] = [];
    Object.entries(timePatterns).forEach(([key, data]) => {
      if (data.count >= 2) { // Minimum 2 activities for significance
        const [dayOfWeek, hour] = key.split('-').map(Number);
        const averagePerformance = data.scores.reduce((sum, score) => sum + score, 0) / data.scores.length;
        
        peakTimes.push({
          hour,
          dayOfWeek,
          activityCount: data.count,
          averagePerformance
        });
      }
    });

    // Sort by activity count descending
    return peakTimes.sort((a, b) => b.activityCount - a.activityCount).slice(0, 10);
  } catch (error) {
    console.error('Error analyzing peak learning times:', error);
    return [];
  }
};

// Calculate activity frequency patterns
export const calculateActivityFrequency = async (userId: string): Promise<ActivityFrequency[]> => {
  try {
    const { data: activities, error } = await supabase
      .from('user_activities')
      .select('activity_type, created_at')
      .eq('user_id', userId)
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()) // Last 30 days
      .order('created_at', { ascending: false });

    if (error || !activities) {
      return [];
    }

    // Group by activity type
    const activityCounts: { [key: string]: { count: number; dates: Date[] } } = {};
    
    activities.forEach(activity => {
      const type = activity.activity_type;
      if (!activityCounts[type]) {
        activityCounts[type] = { count: 0, dates: [] };
      }
      activityCounts[type].count++;
      activityCounts[type].dates.push(new Date(activity.created_at));
    });

    // Calculate frequency patterns
    const frequencies: ActivityFrequency[] = [];
    Object.entries(activityCounts).forEach(([type, data]) => {
      if (data.count >= 2) { // Minimum threshold
        const daySpan = 30; // 30 days
        let frequency: 'daily' | 'weekly' | 'monthly' = 'monthly';
        
        if (data.count >= daySpan * 0.8) frequency = 'daily';
        else if (data.count >= 4) frequency = 'weekly';
        
        frequencies.push({
          activityType: type,
          count: data.count,
          frequency,
          lastOccurrence: data.dates[0] // Most recent
        });
      }
    });

    return frequencies.sort((a, b) => b.count - a.count);
  } catch (error) {
    console.error('Error calculating activity frequency:', error);
    return [];
  }
};

// Get memory access patterns
export const getMemoryAccessPatterns = async (userId: string): Promise<{ tier: string; accessCount: number; averageLatency: number }[]> => {
  try {
    const { data: metrics, error } = await supabase
      .from('memory_metrics')
      .select('memory_tier, latency_ms, access_type')
      .eq('user_id', userId)
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()) // Last 7 days
      .not('latency_ms', 'is', null);

    if (error || !metrics) {
      return [];
    }

    // Group by memory tier
    const tierPatterns: { [key: string]: { count: number; latencies: number[] } } = {};
    
    metrics.forEach(metric => {
      const tier = metric.memory_tier;
      if (!tierPatterns[tier]) {
        tierPatterns[tier] = { count: 0, latencies: [] };
      }
      tierPatterns[tier].count++;
      if (metric.latency_ms) {
        tierPatterns[tier].latencies.push(metric.latency_ms);
      }
    });

    return Object.entries(tierPatterns).map(([tier, data]) => ({
      tier,
      accessCount: data.count,
      averageLatency: data.latencies.length > 0 
        ? data.latencies.reduce((sum, lat) => sum + lat, 0) / data.latencies.length 
        : 0
    })).sort((a, b) => b.accessCount - a.accessCount);
  } catch (error) {
    console.error('Error getting memory access patterns:', error);
    return [];
  }
};

// Track question difficulty progression
export const trackQuestionDifficulty = async (userId: string): Promise<{ averageDifficulty: number; progressionRate: number } | null> => {
  try {
    const { data: questions, error } = await supabase
      .from('hacs_questions')
      .select('intelligence_level_when_asked, response_quality_score, asked_at')
      .eq('user_id', userId)
      .not('response_quality_score', 'is', null)
      .order('asked_at', { ascending: true })
      .limit(50); // Last 50 questions

    if (error || !questions || questions.length < 5) {
      return null;
    }

    // Calculate difficulty as inverse of success rate at each intelligence level
    const difficulties = questions.map(q => {
      const baseLevel = q.intelligence_level_when_asked || 0;
      const successRate = q.response_quality_score || 0;
      // Higher intelligence level + lower success rate = higher difficulty
      return baseLevel * (1 - successRate);
    });

    const averageDifficulty = difficulties.reduce((sum, diff) => sum + diff, 0) / difficulties.length;
    
    // Calculate progression rate (change in difficulty over time)
    if (difficulties.length >= 10) {
      const firstQuartile = difficulties.slice(0, Math.floor(difficulties.length / 4));
      const lastQuartile = difficulties.slice(-Math.floor(difficulties.length / 4));
      
      const firstAvg = firstQuartile.reduce((sum, diff) => sum + diff, 0) / firstQuartile.length;
      const lastAvg = lastQuartile.reduce((sum, diff) => sum + diff, 0) / lastQuartile.length;
      
      const progressionRate = lastAvg - firstAvg; // Positive = increasing difficulty
      
      return {
        averageDifficulty,
        progressionRate
      };
    }

    return {
      averageDifficulty,
      progressionRate: 0
    };
  } catch (error) {
    console.error('Error tracking question difficulty:', error);
    return null;
  }
};

// Analyze module performance trends
export const analyzeModulePerformance = (intelligence: HacsIntelligence): ModulePerformance[] => {
  try {
    const moduleInfo = [
      { key: 'NIK', name: 'Neural Integration Kernel' },
      { key: 'CPSR', name: 'Cognitive Pattern Recognition' },
      { key: 'TWS', name: 'Temporal Wisdom Synthesis' },
      { key: 'HFME', name: 'Framework Management' },
      { key: 'DPEM', name: 'Personality Expression' },
      { key: 'CNR', name: 'Conflict Navigation' },
      { key: 'BPSC', name: 'Blueprint Sync' },
      { key: 'ACS', name: 'Conversation System' },
      { key: 'PIE', name: 'Predictive Intelligence' },
      { key: 'VFP', name: 'Vector Fusion' },
      { key: 'TMG', name: 'Temporal Memory' },
    ];

    return moduleInfo.map(module => {
      const currentScore = intelligence.module_scores[module.key as keyof typeof intelligence.module_scores] || 0;
      
      // Simple trend calculation based on score relative to average
      const allScores = Object.values(intelligence.module_scores);
      const averageScore = allScores.reduce((sum, score) => sum + score, 0) / allScores.length;
      
      const relativePerformance = currentScore - averageScore;
      let trend: 'improving' | 'declining' | 'stable' = 'stable';
      
      if (Math.abs(relativePerformance) > 5) {
        trend = relativePerformance > 0 ? 'improving' : 'declining';
      }

      return {
        moduleName: module.name,
        currentScore: Math.round(currentScore * 10) / 10, // Fix floating point precision
        trend,
        changeRate: Math.round(relativePerformance * 10) / 10 // Fix floating point precision
      };
    }).sort((a, b) => b.currentScore - a.currentScore);
  } catch (error) {
    console.error('Error analyzing module performance:', error);
    return [];
  }
};
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface MilestoneTracking {
  id: string;
  milestone_id: string;
  user_id: string;
  progress_score: number;
  completion_indicators: string[];
  user_activities: any[];
  auto_detected_progress: boolean;
  last_calculated: string;
  created_at: string;
  updated_at: string;
}

interface MilestoneProgressMetrics {
  task_completion_rate: number;
  time_consistency: number;
  engagement_quality: number;
  reflection_depth: number;
  conversation_insights: number;
  overall_progress: number;
}

export const useMilestoneTracker = () => {
  const [milestoneTrackings, setMilestoneTrackings] = useState<MilestoneTracking[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const calculateMilestoneProgress = async (milestoneId: string): Promise<MilestoneProgressMetrics> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      // Get user activities related to this milestone
      const { data: activities } = await supabase
        .from('user_activities')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()) // Last 7 days
        .order('created_at', { ascending: false });

      // Get conversation data for engagement quality
      const { data: conversations } = await supabase
        .from('conversation_memory')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false });

      // Get productivity data
      const { data: productivityJourney } = await supabase
        .from('productivity_journey')
        .select('*')
        .eq('user_id', user.id)
        .single();

      // Get growth data
      const { data: growthJourney } = await supabase
        .from('growth_journey')
        .select('*')
        .eq('user_id', user.id)
        .single();

      // Calculate real metrics
      const metrics: MilestoneProgressMetrics = {
        task_completion_rate: calculateTaskCompletionRate(productivityJourney, activities || []),
        time_consistency: calculateTimeConsistency(activities || []),
        engagement_quality: calculateEngagementQuality(conversations || []),
        reflection_depth: calculateReflectionDepth(growthJourney),
        conversation_insights: calculateConversationInsights(conversations || []),
        overall_progress: 0
      };

      // Calculate weighted overall progress
      metrics.overall_progress = (
        metrics.task_completion_rate * 0.25 +
        metrics.time_consistency * 0.20 +
        metrics.engagement_quality * 0.20 +
        metrics.reflection_depth * 0.20 +
        metrics.conversation_insights * 0.15
      );

      return metrics;
    } catch (error) {
      console.error('Error calculating milestone progress:', error);
      return {
        task_completion_rate: 0,
        time_consistency: 0,
        engagement_quality: 0,
        reflection_depth: 0,
        conversation_insights: 0,
        overall_progress: 0
      };
    }
  };

  const calculateTaskCompletionRate = (productivityJourney: any, activities: any[]): number => {
    if (!productivityJourney) return 0;

    const completedTasks = productivityJourney.completed_tasks || [];
    const currentTasks = productivityJourney.current_goals?.[0]?.tasks || [];
    
    if (currentTasks.length === 0) return 0;
    
    const completedCount = completedTasks.length;
    const totalTasks = completedCount + currentTasks.length;
    
    return totalTasks > 0 ? (completedCount / totalTasks) * 100 : 0;
  };

  const calculateTimeConsistency = (activities: any[]): number => {
    if (activities.length === 0) return 0;

    // Check for consistent daily activity over the past week
    const dailyActivityCounts = new Map<string, number>();
    
    activities.forEach(activity => {
      const date = new Date(activity.created_at).toDateString();
      dailyActivityCounts.set(date, (dailyActivityCounts.get(date) || 0) + 1);
    });

    const activeDays = dailyActivityCounts.size;
    const maxPossibleDays = 7; // Last 7 days
    
    return (activeDays / maxPossibleDays) * 100;
  };

  const calculateEngagementQuality = (conversations: any[]): number => {
    if (conversations.length === 0) return 0;

    let totalEngagement = 0;
    let conversationCount = 0;

    conversations.forEach(conv => {
      const messages = conv.messages || [];
      if (messages.length > 0) {
        // Quality based on message length, frequency, and depth
        const messageCount = messages.length;
        const avgMessageLength = messages.reduce((sum: number, msg: any) => {
          return sum + (msg.content?.length || 0);
        }, 0) / messageCount;

        // Score based on message count and average length
        const qualityScore = Math.min(100, (messageCount * 10) + (avgMessageLength / 10));
        totalEngagement += qualityScore;
        conversationCount++;
      }
    });

    return conversationCount > 0 ? totalEngagement / conversationCount : 0;
  };

  const calculateReflectionDepth = (growthJourney: any): number => {
    if (!growthJourney) return 0;

    const reflections = growthJourney.reflection_entries || [];
    const insights = growthJourney.insight_entries || [];
    const moods = growthJourney.mood_entries || [];

    // Recent reflections (last 7 days)
    const recentReflections = reflections.filter((r: any) => {
      const reflectionDate = new Date(r.timestamp);
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return reflectionDate >= weekAgo;
    });

    const recentInsights = insights.filter((i: any) => {
      const insightDate = new Date(i.timestamp);
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return insightDate >= weekAgo;
    });

    const recentMoods = moods.filter((m: any) => {
      const moodDate = new Date(m.timestamp);
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return moodDate >= weekAgo;
    });

    // Score based on quantity and quality indicators
    const reflectionScore = recentReflections.length * 20; // Up to 100 for 5+ reflections
    const insightScore = recentInsights.length * 15; // Insights are valuable
    const moodScore = recentMoods.length * 5; // Mood tracking consistency

    return Math.min(100, reflectionScore + insightScore + moodScore);
  };

  const calculateConversationInsights = (conversations: any[]): number => {
    if (conversations.length === 0) return 0;

    let insightScore = 0;
    
    conversations.forEach(conv => {
      const messages = conv.messages || [];
      
      // Look for insight indicators in messages
      messages.forEach((msg: any) => {
        const content = msg.content?.toLowerCase() || '';
        
        // Score based on insight-related keywords and patterns
        if (content.includes('insight') || content.includes('realize') || content.includes('understand')) {
          insightScore += 10;
        }
        if (content.includes('pattern') || content.includes('connection') || content.includes('clarity')) {
          insightScore += 8;
        }
        if (content.includes('breakthrough') || content.includes('aha') || content.includes('discovery')) {
          insightScore += 15;
        }
      });
    });

    return Math.min(100, insightScore);
  };

  const detectMilestoneCompletion = async (milestoneId: string): Promise<boolean> => {
    const metrics = await calculateMilestoneProgress(milestoneId);
    
    // Milestone is considered complete if:
    // - Overall progress > 80%
    // - At least 3 out of 5 metrics are > 70%
    const highPerformingMetrics = [
      metrics.task_completion_rate,
      metrics.time_consistency,
      metrics.engagement_quality,
      metrics.reflection_depth,
      metrics.conversation_insights
    ].filter(score => score > 70).length;

    return metrics.overall_progress > 80 && highPerformingMetrics >= 3;
  };

  const updateMilestoneTracking = async (milestoneId: string) => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const metrics = await calculateMilestoneProgress(milestoneId);
      const isCompleted = await detectMilestoneCompletion(milestoneId);

      // Update or create milestone tracking record
      const { error } = await supabase
        .from('user_activities')
        .insert({
          user_id: user.id,
          activity_type: 'milestone_tracking',
          activity_data: {
            milestone_id: milestoneId,
            metrics: {
              task_completion_rate: metrics.task_completion_rate,
              time_consistency: metrics.time_consistency,
              engagement_quality: metrics.engagement_quality,
              reflection_depth: metrics.reflection_depth,
              conversation_insights: metrics.conversation_insights,
              overall_progress: metrics.overall_progress
            },
            auto_detected_completion: isCompleted,
            timestamp: new Date().toISOString()
          },
          points_earned: isCompleted ? 50 : Math.round(metrics.overall_progress / 10)
        });

      if (error) {
        console.error('Error updating milestone tracking:', error);
        return;
      }

      if (isCompleted) {
        toast({
          title: "Milestone Achievement Detected! 🎉",
          description: `You've made significant progress with ${metrics.overall_progress.toFixed(1)}% completion rate.`,
        });
      }

    } catch (error) {
      console.error('Error in updateMilestoneTracking:', error);
    } finally {
      setLoading(false);
    }
  };

  const getProgressInsights = async (milestoneId: string) => {
    const metrics = await calculateMilestoneProgress(milestoneId);
    
    const insights = [];
    
    if (metrics.task_completion_rate < 30) {
      insights.push("Focus on completing more tasks to build momentum");
    }
    if (metrics.time_consistency < 50) {
      insights.push("Try to maintain more consistent daily engagement");
    }
    if (metrics.engagement_quality < 40) {
      insights.push("Consider deeper conversations with your AI coach");
    }
    if (metrics.reflection_depth < 30) {
      insights.push("Regular reflection can accelerate your progress");
    }
    if (metrics.conversation_insights < 25) {
      insights.push("Look for patterns and insights in your conversations");
    }

    return {
      metrics,
      insights,
      overallStatus: metrics.overall_progress > 80 ? 'excellent' : 
                     metrics.overall_progress > 60 ? 'good' : 
                     metrics.overall_progress > 40 ? 'progressing' : 'needs_attention'
    };
  };

  return {
    calculateMilestoneProgress,
    detectMilestoneCompletion,
    updateMilestoneTracking,
    getProgressInsights,
    loading
  };
};
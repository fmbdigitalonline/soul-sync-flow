import { useState, useEffect } from 'react';
import { useJourneyTracking } from './use-journey-tracking';
import { useMilestoneTracker } from './use-milestone-tracker';
import { supabase } from '@/integrations/supabase/client';

interface EnhancedJourneyMetrics {
  totalGoals: number;
  activeGoals: number;
  completedGoals: number;
  totalMilestones: number;
  completedMilestones: number;
  totalTasks: number;
  completedTasks: number;
  weeklyActivity: number;
  engagementScore: number;
  progressVelocity: number;
  consistencyScore: number;
  lastActivityDate: string;
}

interface JourneyInsight {
  type: 'achievement' | 'suggestion' | 'milestone' | 'warning';
  title: string;
  description: string;
  actionable: boolean;
  timestamp: string;
}

export const useEnhancedJourneyTracking = () => {
  const { productivityJourney, growthJourney, loading: baseLoading } = useJourneyTracking();
  const { calculateMilestoneProgress, getProgressInsights } = useMilestoneTracker();
  
  const [enhancedMetrics, setEnhancedMetrics] = useState<EnhancedJourneyMetrics | null>(null);
  const [journeyInsights, setJourneyInsights] = useState<JourneyInsight[]>([]);
  const [loading, setLoading] = useState(false);

  const calculateEnhancedMetrics = async (): Promise<EnhancedJourneyMetrics> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      // Get recent user activities
      const { data: activities } = await supabase
        .from('user_activities')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()) // Last 30 days
        .order('created_at', { ascending: false });

      // Get conversation data for engagement
      const { data: conversations } = await supabase
        .from('conversation_memory')
        .select('*')
        .eq('user_id', user.id)
        .gte('last_activity', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .order('last_activity', { ascending: false });

      // Calculate metrics from real data
      const currentGoals = productivityJourney?.current_goals || [];
      const completedGoals = productivityJourney?.completed_goals || [];
      
      // Extract tasks from current goals
      const allCurrentTasks = currentGoals.flatMap(goal => goal.tasks || []);
      const completedTasks = allCurrentTasks.filter(task => task.completed);
      
      // Extract milestones from current goals
      const allMilestones = currentGoals.flatMap(goal => goal.milestones || []);
      const completedMilestones = allMilestones.filter(milestone => milestone.completed);

      // Calculate activity metrics
      const weeklyActivities = activities?.filter(activity => {
        const activityDate = new Date(activity.created_at);
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        return activityDate >= weekAgo;
      }) || [];

      // Calculate engagement score based on conversation quality and frequency
      const engagementScore = calculateEngagementScore(conversations || [], activities || []);
      
      // Calculate progress velocity (tasks completed per week)
      const progressVelocity = calculateProgressVelocity(activities || []);
      
      // Calculate consistency score (how regular the user is)
      const consistencyScore = calculateConsistencyScore(activities || []);

      // Get last activity date
      const lastActivityDate = activities?.[0]?.created_at || new Date().toISOString();

      return {
        totalGoals: currentGoals.length + completedGoals.length,
        activeGoals: currentGoals.length,
        completedGoals: completedGoals.length,
        totalMilestones: allMilestones.length,
        completedMilestones: completedMilestones.length,
        totalTasks: allCurrentTasks.length,
        completedTasks: completedTasks.length,
        weeklyActivity: weeklyActivities.length,
        engagementScore,
        progressVelocity,
        consistencyScore,
        lastActivityDate
      };

    } catch (error) {
      console.error('Error calculating enhanced metrics:', error);
      return {
        totalGoals: 0,
        activeGoals: 0,
        completedGoals: 0,
        totalMilestones: 0,
        completedMilestones: 0,
        totalTasks: 0,
        completedTasks: 0,
        weeklyActivity: 0,
        engagementScore: 0,
        progressVelocity: 0,
        consistencyScore: 0,
        lastActivityDate: new Date().toISOString()
      };
    }
  };

  const calculateEngagementScore = (conversations: any[], activities: any[]): number => {
    let score = 0;
    
    // Base score from conversation frequency and quality
    const recentConversations = conversations.filter(conv => {
      const convDate = new Date(conv.last_activity);
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return convDate >= weekAgo;
    });

    // Score from conversation quality
    recentConversations.forEach(conv => {
      const messages = conv.messages || [];
      if (messages.length > 5) score += 15; // Good conversation length
      if (messages.length > 10) score += 10; // Extended conversation
      
      // Check for quality indicators in messages
      messages.forEach((msg: any) => {
        const content = msg.content?.toLowerCase() || '';
        if (content.includes('insight') || content.includes('understand')) score += 5;
        if (content.includes('plan') || content.includes('goal')) score += 3;
      });
    });

    // Score from activity diversity
    const activityTypes = new Set(activities.map(a => a.activity_type));
    score += activityTypes.size * 10; // Bonus for diverse activities

    return Math.min(100, score);
  };

  const calculateProgressVelocity = (activities: any[]): number => {
    const taskCompletions = activities.filter(a => 
      a.activity_type === 'task_completed' || 
      a.activity_type === 'milestone_tracking'
    );

    const weeksActive = Math.max(1, Math.ceil(activities.length / 7)); // Estimate weeks active
    return taskCompletions.length / weeksActive;
  };

  const calculateConsistencyScore = (activities: any[]): number => {
    if (activities.length === 0) return 0;

    // Group activities by day
    const dailyActivity = new Map<string, number>();
    
    activities.forEach(activity => {
      const date = new Date(activity.created_at).toDateString();
      dailyActivity.set(date, (dailyActivity.get(date) || 0) + 1);
    });

    const activeDays = dailyActivity.size;
    const maxPossibleDays = 30; // Last 30 days
    
    return (activeDays / maxPossibleDays) * 100;
  };

  const generateJourneyInsights = async (metrics: EnhancedJourneyMetrics): Promise<JourneyInsight[]> => {
    const insights: JourneyInsight[] = [];
    const now = new Date().toISOString();

    // Achievement insights
    if (metrics.completedGoals > 0) {
      insights.push({
        type: 'achievement',
        title: `🎉 ${metrics.completedGoals} Goal${metrics.completedGoals > 1 ? 's' : ''} Completed!`,
        description: `You've successfully completed ${metrics.completedGoals} goal${metrics.completedGoals > 1 ? 's' : ''}. Your dedication is paying off!`,
        actionable: false,
        timestamp: now
      });
    }

    if (metrics.completedMilestones > 0) {
      insights.push({
        type: 'milestone',
        title: `🚀 ${metrics.completedMilestones} Milestone${metrics.completedMilestones > 1 ? 's' : ''} Achieved`,
        description: `You've reached ${metrics.completedMilestones} important milestone${metrics.completedMilestones > 1 ? 's' : ''} on your journey.`,
        actionable: false,
        timestamp: now
      });
    }

    // Suggestion insights based on metrics
    if (metrics.engagementScore < 30) {
      insights.push({
        type: 'suggestion',
        title: 'Boost Your Engagement',
        description: 'Consider having more detailed conversations with your AI coach to deepen insights.',
        actionable: true,
        timestamp: now
      });
    }

    if (metrics.consistencyScore < 40) {
      insights.push({
        type: 'suggestion',
        title: 'Build Consistency',
        description: 'Try to engage with your journey daily, even if just for a few minutes.',
        actionable: true,
        timestamp: now
      });
    }

    if (metrics.progressVelocity < 1) {
      insights.push({
        type: 'suggestion',
        title: 'Accelerate Progress',
        description: 'Focus on completing tasks regularly to build momentum.',
        actionable: true,
        timestamp: now
      });
    }

    // Warning insights
    const daysSinceLastActivity = Math.floor(
      (Date.now() - new Date(metrics.lastActivityDate).getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysSinceLastActivity > 7) {
      insights.push({
        type: 'warning',
        title: 'Journey Needs Attention',
        description: `It's been ${daysSinceLastActivity} days since your last activity. Let's get back on track!`,
        actionable: true,
        timestamp: now
      });
    }

    // Positive momentum insights
    if (metrics.weeklyActivity > 10) {
      insights.push({
        type: 'achievement',
        title: 'High Activity Week! 🔥',
        description: `You've been very active this week with ${metrics.weeklyActivity} actions taken.`,
        actionable: false,
        timestamp: now
      });
    }

    return insights.slice(0, 5); // Limit to 5 most relevant insights
  };

  const refreshEnhancedData = async () => {
    if (baseLoading) return;
    
    try {
      setLoading(true);
      const metrics = await calculateEnhancedMetrics();
      const insights = await generateJourneyInsights(metrics);
      
      setEnhancedMetrics(metrics);
      setJourneyInsights(insights);
    } catch (error) {
      console.error('Error refreshing enhanced data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!baseLoading && (productivityJourney || growthJourney)) {
      refreshEnhancedData();
    }
  }, [baseLoading, productivityJourney, growthJourney]);

  return {
    enhancedMetrics,
    journeyInsights,
    loading: loading || baseLoading,
    refreshEnhancedData,
    calculateMilestoneProgress,
    getProgressInsights
  };
};
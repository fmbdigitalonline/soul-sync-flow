import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface DashboardStats {
  tasksCompleted: number;
  focusSessions: number;
  currentStreak: number;
  totalPoints: number;
}

interface RecentActivity {
  id: string;
  type: string;
  description: string;
  timestamp: Date;
  points: number;
}

interface WeeklyProgress {
  productivity: number;
  focusTime: string;
  goalsProgress: { completed: number; total: number };
  consistency: number;
}

export const useDashboardData = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    tasksCompleted: 0,
    focusSessions: 0,
    currentStreak: 0,
    totalPoints: 0,
  });
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [weeklyProgress, setWeeklyProgress] = useState<WeeklyProgress>({
    productivity: 0,
    focusTime: '0h 0m',
    goalsProgress: { completed: 0, total: 0 },
    consistency: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;

    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Fetch user statistics
        const { data: statsData } = await supabase
          .from('user_statistics')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (statsData) {
          setStats({
            tasksCompleted: statsData.tasks_completed || 0,
            focusSessions: statsData.focus_sessions_completed || 0,
            currentStreak: statsData.current_streak || 0,
            totalPoints: statsData.total_points || 0,
          });
        }

        // Fetch recent activities (last 5)
        const { data: activitiesData } = await supabase
          .from('user_activities')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5);

        if (activitiesData) {
          const activities = activitiesData.map(activity => ({
            id: activity.id,
            type: activity.activity_type,
            description: getActivityDescription(activity.activity_type),
            timestamp: new Date(activity.created_at),
            points: activity.points_earned || 0,
          }));
          setRecentActivities(activities);
        }

        // Fetch goals for weekly progress
        const { data: goalsData } = await supabase
          .from('user_goals')
          .select('*')
          .eq('user_id', user.id);

        const completedGoals = goalsData?.filter(g => g.status === 'completed').length || 0;
        const totalGoals = goalsData?.length || 0;

        // Calculate weekly productivity and focus time
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);

        const { data: weekActivities } = await supabase
          .from('user_activities')
          .select('*')
          .eq('user_id', user.id)
          .gte('created_at', weekAgo.toISOString());

        const focusSessionsThisWeek = weekActivities?.filter(
          a => a.activity_type === 'focus_session'
        ).length || 0;

        const focusMinutes = focusSessionsThisWeek * 25; // Assuming 25min pomodoro
        const focusHours = Math.floor(focusMinutes / 60);
        const focusMins = focusMinutes % 60;

        const productivity = totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 0;

        setWeeklyProgress({
          productivity: Math.round(productivity),
          focusTime: `${focusHours}h ${focusMins}m`,
          goalsProgress: { completed: completedGoals, total: totalGoals },
          consistency: statsData?.current_streak || 0,
        });

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user?.id]);

  return { stats, recentActivities, weeklyProgress, loading };
};

const getActivityDescription = (activityType: string): string => {
  const descriptions: Record<string, string> = {
    task_completed: 'Completed a task',
    focus_session: 'Focus session completed',
    coach_conversation: 'AI Coach session',
    goal_set: 'New goal created',
    habit_completed: 'Habit completed',
  };
  return descriptions[activityType] || activityType;
};

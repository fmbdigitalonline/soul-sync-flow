
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface UserProfile {
  id: string;
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserStatistics {
  id: string;
  user_id: string;
  tasks_completed: number;
  focus_sessions_completed: number;
  coach_conversations: number;
  total_points: number;
  current_streak: number;
  longest_streak: number;
  most_productive_day: string | null;
  preferred_focus_time: string | null;
  updated_at: string;
}

export interface UserGoal {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  progress: number;
  status: 'active' | 'completed' | 'paused';
  aligned_traits: string[];
  milestones: any[];
  target_date: string | null;
  category: string;
  created_at: string;
  updated_at: string;
}

export const useUserProfile = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [statistics, setStatistics] = useState<UserStatistics | null>(null);
  const [goals, setGoals] = useState<UserGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setError('No authenticated user');
        return;
      }

      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Error fetching profile:', profileError);
        setError('Failed to fetch profile');
        return;
      }

      // Fetch user statistics
      const { data: statsData, error: statsError } = await supabase
        .from('user_statistics')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (statsError && statsError.code !== 'PGRST116') {
        console.error('Error fetching statistics:', statsError);
        setError('Failed to fetch statistics');
        return;
      }

      // Fetch user goals
      const { data: goalsData, error: goalsError } = await supabase
        .from('user_goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (goalsError) {
        console.error('Error fetching goals:', goalsError);
        setError('Failed to fetch goals');
        return;
      }

      setProfile(profileData);
      setStatistics(statsData);
      setGoals(goalsData || []);
      setError(null);
    } catch (err) {
      console.error('Error in fetchUserData:', err);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const logActivity = async (activityType: string, activityData: any = {}, pointsEarned: number = 0) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('user_activities')
        .insert({
          user_id: user.id,
          activity_type: activityType,
          activity_data: activityData,
          points_earned: pointsEarned
        });

      if (error) {
        console.error('Error logging activity:', error);
        return;
      }

      // Refresh data after logging activity
      await fetchUserData();
    } catch (err) {
      console.error('Error in logActivity:', err);
    }
  };

  const updateGoalProgress = async (goalId: string, progress: number) => {
    try {
      const { error } = await supabase
        .from('user_goals')
        .update({ 
          progress,
          status: progress >= 100 ? 'completed' : 'active',
          updated_at: new Date().toISOString()
        })
        .eq('id', goalId);

      if (error) {
        console.error('Error updating goal:', error);
        toast({
          title: "Error",
          description: "Failed to update goal progress",
          variant: "destructive"
        });
        return;
      }

      // Log activity if goal completed
      if (progress >= 100) {
        await logActivity('goal_completed', { goalId }, 50);
      }

      await fetchUserData();
      
      toast({
        title: "Success",
        description: progress >= 100 ? "Goal completed!" : "Goal progress updated",
      });
    } catch (err) {
      console.error('Error in updateGoalProgress:', err);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  return {
    profile,
    statistics,
    goals,
    loading,
    error,
    refetch: fetchUserData,
    logActivity,
    updateGoalProgress
  };
};

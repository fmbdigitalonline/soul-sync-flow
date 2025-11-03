/**
 * Hook for managing goals with database persistence using React Query.
 * Ensures data stays fresh across reconnects and focus changes.
 */

import { useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface GoalMilestone {
  id: string;
  title: string;
  completed: boolean;
  order_index: number;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  deadline?: string;
  category: string;
  progress: number;
  alignedWith: string[];
  milestones: GoalMilestone[];
}

const GOALS_QUERY_KEY = ['goals'];

const transformGoals = (goalsData: any[]): Goal[] => {
  return goalsData.map((goal: any) => ({
    id: goal.id,
    title: goal.title,
    description: goal.description || '',
    deadline: goal.target_date,
    category: goal.category,
    progress: goal.progress,
    alignedWith: (goal.aligned_traits as string[]) || [],
    milestones: (goal.goal_milestones || [])
      .sort((a: any, b: any) => a.order_index - b.order_index)
      .map((m: any) => ({
        id: m.id,
        title: m.title,
        completed: m.is_completed,
        order_index: m.order_index
      }))
  }));
};

export function useGoals() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const fetchGoals = useCallback(async (): Promise<Goal[]> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.warn('⚠️ No authenticated user - goals will not load');
      return [];
    }

    const { data: goalsData, error } = await supabase
      .from('user_goals')
      .select(`
        *,
        goal_milestones (*)
      `)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) throw error;

    if (!goalsData || goalsData.length === 0) {
      console.log('ℹ️ No goals found for user');
      return [];
    }

    return transformGoals(goalsData);
  }, []);

  const {
    data: goals = [],
    isLoading,
    isFetching,
    error,
    refetch
  } = useQuery<Goal[]>({
    queryKey: GOALS_QUERY_KEY,
    queryFn: fetchGoals,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    onError: (err) => {
      const message = err instanceof Error ? err.message : 'Failed to load goals';
      toast({
        title: 'Failed to load goals',
        description: message,
        variant: 'destructive'
      });
    }
  });

  const addGoal = useCallback(async (
    goalData: Omit<Goal, 'id' | 'progress'>,
    milestones: { title: string }[]
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: 'Authentication Required',
          description: 'Please sign in to create goals',
          variant: 'destructive'
        });
        return null;
      }

      const { data: newGoal, error: goalError } = await supabase
        .from('user_goals')
        .insert({
          user_id: user.id,
          title: goalData.title,
          description: goalData.description,
          category: goalData.category,
          target_date: goalData.deadline || null,
          progress: 0,
          aligned_traits: goalData.alignedWith,
          status: 'active'
        })
        .select()
        .single();

      if (goalError) throw goalError;

      if (milestones.length > 0 && newGoal) {
        const milestonesData = milestones.map((m, index) => ({
          goal_id: newGoal.id,
          user_id: user.id,
          title: m.title,
          order_index: index,
          is_completed: false
        }));

        const { error: milestonesError } = await supabase
          .from('goal_milestones')
          .insert(milestonesData);

        if (milestonesError) throw milestonesError;
      }

      await queryClient.invalidateQueries({ queryKey: GOALS_QUERY_KEY });
      console.log(`✅ Created goal: ${goalData.title}`);

      return newGoal?.id ?? null;
    } catch (err) {
      console.error('❌ Error creating goal:', err);
      toast({
        title: 'Failed to create goal',
        description: 'Could not save your goal. Please try again.',
        variant: 'destructive'
      });
      return null;
    }
  }, [queryClient, toast]);

  const toggleMilestone = useCallback(async (goalId: string, milestoneId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const goal = goals.find(g => g.id === goalId);
      if (!goal) return;

      const milestone = goal.milestones.find(m => m.id === milestoneId);
      if (!milestone) return;

      const newCompletedState = !milestone.completed;

      const { error: updateError } = await supabase
        .from('goal_milestones')
        .update({
          is_completed: newCompletedState,
          completed_at: newCompletedState ? new Date().toISOString() : null
        })
        .eq('id', milestoneId);

      if (updateError) throw updateError;

      const updatedMilestones = goal.milestones.map(m =>
        m.id === milestoneId ? { ...m, completed: newCompletedState } : m
      );
      const completedCount = updatedMilestones.filter(m => m.completed).length;
      const newProgress = updatedMilestones.length > 0
        ? Math.round((completedCount / updatedMilestones.length) * 100)
        : 0;

      const { error: progressError } = await supabase
        .from('user_goals')
        .update({ progress: newProgress })
        .eq('id', goalId);

      if (progressError) throw progressError;

      queryClient.setQueryData<Goal[]>(GOALS_QUERY_KEY, (current) => {
        if (!current) return current;
        return current.map(existingGoal =>
          existingGoal.id === goalId
            ? { ...existingGoal, milestones: updatedMilestones, progress: newProgress }
            : existingGoal
        );
      });

      await queryClient.invalidateQueries({ queryKey: GOALS_QUERY_KEY });
      console.log(`✅ Milestone ${milestoneId} toggled`);

    } catch (err) {
      console.error('❌ Error toggling milestone:', err);
      toast({
        title: 'Failed to update milestone',
        description: 'Could not save changes. Please try again.',
        variant: 'destructive'
      });
    }
  }, [goals, queryClient, toast]);

  const deleteGoal = useCallback(async (goalId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error: deleteError } = await supabase
        .from('user_goals')
        .update({ status: 'inactive' })
        .eq('id', goalId)
        .eq('user_id', user.id);

      if (deleteError) throw deleteError;

      queryClient.setQueryData<Goal[]>(GOALS_QUERY_KEY, (current) => {
        if (!current) return current;
        return current.filter(goal => goal.id !== goalId);
      });

      await queryClient.invalidateQueries({ queryKey: GOALS_QUERY_KEY });
      console.log(`✅ Goal ${goalId} deleted (soft delete)`);

    } catch (err) {
      console.error('❌ Error deleting goal:', err);
      toast({
        title: 'Failed to delete goal',
        description: 'Could not delete goal. Please try again.',
        variant: 'destructive'
      });
    }
  }, [queryClient, toast]);

  const queryError = error instanceof Error ? error.message : error ? String(error) : null;

  return {
    goals,
    isLoading: isLoading || isFetching,
    error: queryError,
    addGoal,
    toggleMilestone,
    deleteGoal,
    reloadGoals: refetch
  };
}

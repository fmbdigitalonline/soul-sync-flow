/**
 * Hook for managing goals with database persistence
 * Following SoulSync Engineering Protocol:
 * - Principle #2: No Hardcoded Data - all goals from database
 * - Principle #7: Build Transparently - loading states and error handling
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

const GOALS_QUERY_KEY = ['goals'] as const;

const fetchGoals = async (): Promise<Goal[]> => {
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    console.warn('⚠️ No authenticated user - goals will not load');
    return [];
  }

  const { data: goalsData, error: goalsError } = await supabase
    .from('user_goals')
    .select(`
      *,
      goal_milestones (*)
    `)
    .eq('user_id', user.id)
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  if (goalsError) {
    console.error('❌ Error loading goals:', goalsError);
    throw new Error(goalsError.message || 'Failed to load goals');
  }

  if (!goalsData || goalsData.length === 0) {
    console.log('ℹ️ No goals found for user');
    return [];
  }

  const transformedGoals: Goal[] = goalsData.map((goal: any) => ({
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

  console.log(`✅ Loaded ${transformedGoals.length} goals`);
  return transformedGoals;
};

export function useGoals() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: goals = [],
    isPending,
    isFetching,
    error,
    refetch
  } = useQuery<Goal[], Error>({
    queryKey: GOALS_QUERY_KEY,
    queryFn: fetchGoals,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true
  });

  const isLoading = isPending || isFetching;

  // Add a new goal
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

      // Insert goal - match actual DB schema
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

      // Insert milestones
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

      return newGoal.id;
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

  // Toggle milestone completion
  const toggleMilestone = useCallback(async (goalId: string, milestoneId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Find current milestone state
      const goal = goals.find(g => g.id === goalId);
      if (!goal) return;

      const milestone = goal.milestones.find(m => m.id === milestoneId);
      if (!milestone) return;

      const newCompletedState = !milestone.completed;

      // Update milestone
      const { error: updateError } = await supabase
        .from('goal_milestones')
        .update({
          is_completed: newCompletedState,
          completed_at: newCompletedState ? new Date().toISOString() : null
        })
        .eq('id', milestoneId);

      if (updateError) throw updateError;

      // Recalculate progress
      const updatedMilestones = goal.milestones.map(m =>
        m.id === milestoneId ? { ...m, completed: newCompletedState } : m
      );
      const completedCount = updatedMilestones.filter(m => m.completed).length;
      const newProgress = updatedMilestones.length > 0
        ? Math.round((completedCount / updatedMilestones.length) * 100)
        : 0;

      // Update goal progress
      const { error: progressError } = await supabase
        .from('user_goals')
        .update({ progress: newProgress })
        .eq('id', goalId);

      if (progressError) throw progressError;

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

  // Delete a goal
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

  const reloadGoals = useCallback(async () => {
    await refetch();
  }, [refetch]);

  return {
    goals,
    isLoading,
    error: error ? error.message : null,
    addGoal,
    toggleMilestone,
    deleteGoal,
    reloadGoals
  };
}

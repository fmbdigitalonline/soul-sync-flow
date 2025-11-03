/**
 * Hook for managing goals with database persistence
 * Following SoulSync Engineering Protocol:
 * - Principle #2: No Hardcoded Data - all goals from database
 * - Principle #7: Build Transparently - loading states and error handling
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface GoalTask {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'stuck' | 'completed';
  completed?: boolean;
  due_date?: string;
  estimated_duration: string;
  energy_level_required: string;
  category: string;
  optimal_time_of_day: string[];
}

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
  tasks: GoalTask[];
}

export function useGoals() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Load goals from database
  const loadGoals = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.warn('⚠️ No authenticated user - goals will not load');
        setGoals([]);
        setIsLoading(false);
        return;
      }

      // Fetch goals with milestones - match actual DB schema
      const { data: goalsData, error: goalsError } = await supabase
        .from('user_goals')
        .select(`
          *,
          goal_milestones (*),
          tasks (*)
        `)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (goalsError) throw goalsError;

      if (!goalsData || goalsData.length === 0) {
        console.log('ℹ️ No goals found for user');
        setGoals([]);
        setIsLoading(false);
        return;
      }

      // Transform database records to Goal type - match actual DB schema
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
          })),
        tasks: Array.isArray(goal.tasks)
          ? goal.tasks.map((t: any) => ({
              id: t.id,
              title: t.title,
              description: t.description || '',
              status: t.status,
              completed: t.completed,
              due_date: t.due_date,
              estimated_duration: t.estimated_duration,
              energy_level_required: t.energy_level_required,
              category: t.category,
              optimal_time_of_day: Array.isArray(t.optimal_time_of_day)
                ? t.optimal_time_of_day
                : typeof t.optimal_time_of_day === 'string'
                ? [t.optimal_time_of_day]
                : []
            }))
          : []
      }));

      setGoals(transformedGoals);
      console.log(`✅ Loaded ${transformedGoals.length} goals`);
      
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to load goals';
      console.error('❌ Error loading goals:', err);
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGoals();
  }, [loadGoals]);

  // Add a new goal
  const addGoal = useCallback(async (
    goalData: Omit<Goal, 'id' | 'progress' | 'tasks'>,
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

      await loadGoals();
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
  }, [loadGoals, toast]);

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

      await loadGoals();
      console.log(`✅ Milestone ${milestoneId} toggled`);
      
    } catch (err) {
      console.error('❌ Error toggling milestone:', err);
      toast({
        title: 'Failed to update milestone',
        description: 'Could not save changes. Please try again.',
        variant: 'destructive'
      });
    }
  }, [goals, loadGoals, toast]);

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

      await loadGoals();
      console.log(`✅ Goal ${goalId} deleted (soft delete)`);
      
    } catch (err) {
      console.error('❌ Error deleting goal:', err);
      toast({
        title: 'Failed to delete goal',
        description: 'Could not delete goal. Please try again.',
        variant: 'destructive'
      });
    }
  }, [loadGoals, toast]);

  return {
    goals,
    isLoading,
    error,
    addGoal,
    toggleMilestone,
    deleteGoal,
    reloadGoals: loadGoals
  };
}

/**
 * Unified hook for managing goals from productivity_journey.current_goals
 * Following SoulSync Engineering Protocol:
 * - Single source of truth: productivity_journey.current_goals JSONB
 * - No hardcoded data - all goals from database
 * - Transparent error handling and loading states
 */

import { useState, useEffect, useCallback } from 'react';
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

export function useJourneyGoals() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

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

      // Fetch from productivity_journey.current_goals JSONB
      const { data: journeyData, error: journeyError } = await supabase
        .from('productivity_journey')
        .select('current_goals')
        .eq('user_id', user.id)
        .single();

      if (journeyError) {
        if (journeyError.code === 'PGRST116') {
          console.log('ℹ️ No productivity journey found - user has no goals yet');
          setGoals([]);
          setIsLoading(false);
          return;
        }
        throw journeyError;
      }

      const currentGoals = journeyData?.current_goals || [];

      if (!Array.isArray(currentGoals) || currentGoals.length === 0) {
        console.log('ℹ️ No goals found in productivity journey');
        setGoals([]);
        setIsLoading(false);
        return;
      }

      // Deduplicate by ID and by normalized content signature so legacy duplicates are hidden
      const normalize = (value: unknown) =>
        typeof value === 'string' ? value.trim().toLowerCase() : '';

      const seenGoalIds = new Set<string>();
      const seenGoalSignatures = new Set<string>();

      const dedupedGoals = currentGoals.reduce((acc: any[], goal: any) => {
        if (!goal) return acc;

        const rawIdentifier = goal.id || goal.goal_id;
        const goalIdKey = rawIdentifier ? String(rawIdentifier) : null;

        const signatureParts = [
          normalize(goal.title),
          normalize(goal.description),
          normalize(goal.category),
          normalize(goal.target_completion || goal.deadline)
        ];
        const hasMeaningfulSignature = signatureParts.some(Boolean);
        const signatureKey = hasMeaningfulSignature ? signatureParts.join('|') : null;

        const isDuplicateById = goalIdKey ? seenGoalIds.has(goalIdKey) : false;
        const isDuplicateBySignature = signatureKey ? seenGoalSignatures.has(signatureKey) : false;

        if (isDuplicateById || isDuplicateBySignature) {
          console.warn('⚠️ Duplicate goal detected in productivity journey - ignoring duplicate', {
            goalId: goalIdKey,
            signature: signatureKey,
            title: goal.title
          });
          return acc;
        }

        if (goalIdKey) {
          seenGoalIds.add(goalIdKey);
        }
        if (signatureKey) {
          seenGoalSignatures.add(signatureKey);
        }

        return [...acc, goal];
      }, [] as any[]);

      // Transform journey goals to Goal type
      const transformedGoals: Goal[] = dedupedGoals
        .filter((goal: any) => goal && goal.id)
        .map((goal: any) => {
          const milestones = Array.isArray(goal.milestones) ? goal.milestones : [];
          const completedMilestones = milestones.filter((m: any) => m.completed).length;
          const totalMilestones = milestones.length;
          const calculatedProgress = totalMilestones > 0 
            ? Math.round((completedMilestones / totalMilestones) * 100) 
            : 0;

          return {
            id: goal.id,
            title: goal.title || 'Untitled Goal',
            description: goal.description || '',
            deadline: goal.target_completion || goal.deadline,
            category: goal.category || 'personal',
            progress: goal.progress ?? calculatedProgress,
            alignedWith: Array.isArray(goal.blueprint_insights) 
              ? goal.blueprint_insights 
              : [],
            milestones: milestones.map((m: any, index: number) => ({
              id: m.id || `milestone-${index}`,
              title: m.title || `Milestone ${index + 1}`,
              completed: m.completed || false,
              order_index: m.order ?? index
            }))
          };
        });

      setGoals(transformedGoals);
      console.log(`✅ Loaded ${transformedGoals.length} goals from productivity journey`);
      
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to load goals';
      console.error('❌ Error loading journey goals:', err);
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGoals();
  }, [loadGoals]);

  const deleteGoal = useCallback(async (goalId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch current goals
      const { data: journeyData } = await supabase
        .from('productivity_journey')
        .select('current_goals')
        .eq('user_id', user.id)
        .single();

      const currentGoals = Array.isArray(journeyData?.current_goals) 
        ? journeyData.current_goals 
        : [];
      const updatedGoals = currentGoals.filter((g: any) => g.id !== goalId);

      // Update productivity_journey
      const { error: updateError } = await supabase
        .from('productivity_journey')
        .update({ current_goals: updatedGoals })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      await loadGoals();
      console.log(`✅ Goal ${goalId} deleted from journey`);
      
    } catch (err) {
      console.error('❌ Error deleting goal:', err);
      toast({
        title: 'Failed to delete goal',
        description: 'Could not delete goal. Please try again.',
        variant: 'destructive'
      });
      throw err;
    }
  }, [loadGoals, toast]);

  return {
    goals,
    isLoading,
    error,
    deleteGoal,
    reloadGoals: loadGoals
  };
}

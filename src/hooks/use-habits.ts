/**
 * Hook for managing habits with database persistence
 * Following SoulSync Engineering Protocol:
 * - Principle #2: No Hardcoded Data - all habits from database
 * - Principle #7: Build Transparently - loading states and error handling
 * - Principle #3: No Fallbacks That Mask Errors - surface issues clearly
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Habit {
  id: string;
  title: string;
  description?: string;
  frequency: 'daily' | 'weekly';
  streak: number;
  completedToday: boolean;
  target: number;
  category: string;
}

export function useHabits() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Load habits from database
  const loadHabits = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.warn('⚠️ No authenticated user - habits will not load');
        setHabits([]);
        setIsLoading(false);
        return;
      }

      // Fetch active habits
      const { data: habitsData, error: habitsError } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: true });

      if (habitsError) throw habitsError;

      if (!habitsData || habitsData.length === 0) {
        console.log('ℹ️ No habits found for user');
        setHabits([]);
        setIsLoading(false);
        return;
      }

      // Get today's date for completion check
      const today = new Date().toISOString().split('T')[0];

      // Fetch completion data and calculate streaks
      const habitsWithProgress = await Promise.all(
        habitsData.map(async (habit) => {
          // Check today's completion
          const { data: todayCompletion } = await supabase
            .from('habit_completions')
            .select('id')
            .eq('habit_id', habit.id)
            .eq('completed_date', today)
            .maybeSingle();

          // Calculate streak using database function
          const { data: streakData } = await supabase
            .rpc('calculate_habit_streak', {
              p_habit_id: habit.id,
              p_user_id: user.id
            });

          return {
            id: habit.id,
            title: habit.title,
            description: habit.description,
            frequency: habit.frequency as 'daily' | 'weekly',
            streak: streakData || 0,
            completedToday: !!todayCompletion,
            target: habit.target_days,
            category: habit.category
          };
        })
      );

      setHabits(habitsWithProgress);
      console.log(`✅ Loaded ${habitsWithProgress.length} habits`);
      
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to load habits';
      console.error('❌ Error loading habits:', err);
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHabits();
  }, [loadHabits]);

  // Mark habit as complete for today
  const markHabitComplete = useCallback(async (habitId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: 'Authentication Required',
          description: 'Please sign in to track your habits',
          variant: 'destructive'
        });
        return;
      }

      const today = new Date().toISOString().split('T')[0];

      // Insert completion record
      const { error: insertError } = await supabase
        .from('habit_completions')
        .insert({
          habit_id: habitId,
          user_id: user.id,
          completed_date: today,
          completed_at: new Date().toISOString()
        });

      if (insertError) {
        // If already completed today, that's okay (unique constraint violation)
        if (insertError.code !== '23505') {
          throw insertError;
        }
      }

      // Reload habits to get updated streak
      await loadHabits();
      
      console.log(`✅ Habit ${habitId} marked complete for ${today}`);
      
    } catch (err) {
      console.error('❌ Error marking habit complete:', err);
      toast({
        title: 'Failed to update habit',
        description: 'Could not mark habit as complete. Please try again.',
        variant: 'destructive'
      });
    }
  }, [loadHabits, toast]);

  return {
    habits,
    isLoading,
    error,
    markHabitComplete,
    reloadHabits: loadHabits
  };
}

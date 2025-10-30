/**
 * Hook for managing task instruction completion progress with database persistence
 * Following SoulSync Engineering Protocol:
 * - Principle #2: No Hardcoded Data - all progress stored in database
 * - Principle #7: Build Transparently - loading states and error handling
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface InstructionProgress {
  task_id: string;
  instruction_id: string;
  is_completed: boolean;
  completed_at?: string;
}

export function useInstructionProgress(taskId: string, initialCompletedIds: string[] = []) {
  const [completedInstructions, setCompletedInstructions] = useState<Set<string>>(
    () => new Set(initialCompletedIds)
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const latestInitialCompletedIdsRef = useRef(initialCompletedIds);
  const hasLoadedFromDbRef = useRef(false);

  useEffect(() => {
    latestInitialCompletedIdsRef.current = initialCompletedIds;
  }, [initialCompletedIds]);

  // Keep track of the initial completion ids to merge with database state
  useEffect(() => {
    if (hasLoadedFromDbRef.current) return;
    if (initialCompletedIds.length === 0) return;

    setCompletedInstructions(prev => {
      const merged = new Set(prev);
      initialCompletedIds.forEach(id => merged.add(id));
      return merged;
    });
  }, [initialCompletedIds]);

  // Load instruction progress from database
  useEffect(() => {
    if (!taskId) return;

    const loadProgress = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          console.warn('No authenticated user - instruction progress will not persist');
          setIsLoading(false);
          return;
        }

        const { data, error: fetchError } = await supabase
          .from('task_instruction_progress')
          .select('instruction_id, is_completed')
          .eq('user_id', user.id)
          .eq('task_id', taskId)
          .eq('is_completed', true);

        if (fetchError) throw fetchError;

        const completedFromDb = new Set(data?.map(item => item.instruction_id) || []);

        if (completedFromDb.size > 0) {
          setCompletedInstructions(completedFromDb);
        } else {
          const mergedFallback = new Set<string>();
          latestInitialCompletedIdsRef.current.forEach(id => mergedFallback.add(id));
          setCompletedInstructions(mergedFallback);
        }

        hasLoadedFromDbRef.current = true;

        console.log(`✅ Loaded ${completedFromDb.size} completed instructions for task ${taskId}`);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to load instruction progress';
        console.error('❌ Error loading instruction progress:', err);
        setError(errorMsg);
      } finally {
        setIsLoading(false);
      }
    };

    loadProgress();
  }, [taskId]);

  // Toggle instruction completion
  const toggleInstruction = useCallback(async (instructionId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: 'Authentication Required',
          description: 'Please sign in to save your progress',
          variant: 'destructive'
        });
        return;
      }

      const isCurrentlyCompleted = completedInstructions.has(instructionId);
      const newCompletedState = !isCurrentlyCompleted;

      // Optimistic update
      setCompletedInstructions(prev => {
        const updated = new Set(prev);
        if (newCompletedState) {
          updated.add(instructionId);
        } else {
          updated.delete(instructionId);
        }
        return updated;
      });

      // Persist to database using upsert
      const { error: upsertError } = await supabase
        .from('task_instruction_progress')
        .upsert({
          user_id: user.id,
          task_id: taskId,
          instruction_id: instructionId,
          is_completed: newCompletedState,
          completed_at: newCompletedState ? new Date().toISOString() : null,
          uncompleted_at: !newCompletedState ? new Date().toISOString() : null
        }, {
          onConflict: 'user_id,task_id,instruction_id'
        });

      if (upsertError) throw upsertError;

      console.log(`✅ Instruction ${instructionId} marked as ${newCompletedState ? 'completed' : 'incomplete'}`);
      
    } catch (err) {
      console.error('❌ Error toggling instruction:', err);
      
      // Revert optimistic update on error
      setCompletedInstructions(prev => {
        const reverted = new Set(prev);
        if (completedInstructions.has(instructionId)) {
          reverted.add(instructionId);
        } else {
          reverted.delete(instructionId);
        }
        return reverted;
      });

      toast({
        title: 'Failed to save progress',
        description: 'Your progress could not be saved. Please try again.',
        variant: 'destructive'
      });
    }
  }, [taskId, completedInstructions, toast]);

  return {
    completedInstructions,
    isLoading,
    error,
    toggleInstruction
  };
}

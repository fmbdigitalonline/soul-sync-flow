import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useHelpPanelStepProgress(
  assistanceResponseDbId: string | undefined,
  totalSteps: number
) {
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProgress = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user || !assistanceResponseDbId) {
      setCompletedSteps(new Set());
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('assistance_step_progress')
        .select('step_index, is_completed')
        .eq('user_id', user.id)
        .eq('assistance_response_id', assistanceResponseDbId);

      if (fetchError) throw fetchError;

      const completed = new Set(
        data
          ?.filter(d => d.is_completed)
          .map(d => d.step_index) || []
      );

      setCompletedSteps(completed);
    } catch (err) {
      console.error('[useHelpPanelStepProgress] Load error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load step progress');
    } finally {
      setIsLoading(false);
    }
  }, [assistanceResponseDbId]);

  useEffect(() => {
    loadProgress();
  }, [loadProgress]);

  const toggleStep = useCallback(async (stepIndex: number, stepContent: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user || !assistanceResponseDbId) {
      toast.error('You must be logged in to save progress');
      return;
    }

    const isCurrentlyCompleted = completedSteps.has(stepIndex);
    const newCompleted = new Set(completedSteps);

    // Optimistic update
    if (isCurrentlyCompleted) {
      newCompleted.delete(stepIndex);
    } else {
      newCompleted.add(stepIndex);
    }
    setCompletedSteps(newCompleted);

    try {
      // Check if record exists
      const { data: existing } = await supabase
        .from('assistance_step_progress')
        .select('id')
        .eq('user_id', user.id)
        .eq('assistance_response_id', assistanceResponseDbId)
        .eq('step_index', stepIndex)
        .maybeSingle();

      if (existing) {
        // Update existing record
        const { error: updateError } = await supabase
          .from('assistance_step_progress')
          .update({
            is_completed: !isCurrentlyCompleted,
            completed_at: !isCurrentlyCompleted ? new Date().toISOString() : null,
            uncompleted_at: isCurrentlyCompleted ? new Date().toISOString() : null,
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id);

        if (updateError) throw updateError;
      } else {
        // Insert new record
        const { error: insertError } = await supabase
          .from('assistance_step_progress')
          .insert({
            user_id: user.id,
            assistance_response_id: assistanceResponseDbId,
            step_index: stepIndex,
            step_content: stepContent,
            is_completed: !isCurrentlyCompleted,
            completed_at: !isCurrentlyCompleted ? new Date().toISOString() : null
          });

        if (insertError) throw insertError;
      }
    } catch (err) {
      console.error('[useHelpPanelStepProgress] Toggle error:', err);
      
      // Revert optimistic update
      setCompletedSteps(completedSteps);
      
      toast.error('Failed to save step progress');
      throw err;
    }
  }, [assistanceResponseDbId, completedSteps]);

  return {
    completedSteps,
    isLoading,
    error,
    toggleStep
  };
}

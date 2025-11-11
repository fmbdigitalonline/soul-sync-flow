/**
 * Unified Working Instructions State Hook
 * 
 * Single source of truth for assistance responses and step progress.
 * Handles ATOMIC updates: database write + local state sync happen together.
 * 
 * Protocol Compliance:
 * - Principle #2: No hardcoded data - loads from real database
 * - Principle #3: No silent fallbacks - errors surface explicitly  
 * - Principle #6: Modular functions in service + hook layers
 */

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { assistanceResponsePersistenceService } from '@/services/assistance-response-persistence-service';
import { AssistanceResponse } from '@/services/interactive-assistance-service';

export function useWorkingInstructionsState(goalId: string, taskId: string) {
  const [assistanceResponses, setAssistanceResponses] = useState<Map<string, AssistanceResponse[]>>(new Map());
  const [stepProgress, setStepProgress] = useState<Map<string, Set<number>>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load all assistance responses and step progress on mount
  useEffect(() => {
    async function loadAll() {
      try {
        setIsLoading(true);
        setError(null);

        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          console.log('⚠️ WORKING INSTRUCTIONS STATE: No authenticated user');
          setIsLoading(false);
          return;
        }

        console.log('📖 WORKING INSTRUCTIONS STATE: Loading persisted data', {
          goalId,
          taskId,
          userId: user.id
        });

        // Load responses and step progress in parallel
        const [responses, progress] = await Promise.all([
          assistanceResponsePersistenceService.loadAllAssistanceResponsesForTask(
            user.id,
            goalId,
            taskId
          ),
          assistanceResponsePersistenceService.loadStepProgressForTask(
            user.id,
            goalId,
            taskId
          )
        ]);

        setAssistanceResponses(responses);
        setStepProgress(progress);

        console.log('✅ WORKING INSTRUCTIONS STATE: Data loaded', {
          responsesCount: Array.from(responses.values()).flat().length,
          instructionsWithResponses: responses.size,
          responsesWithProgress: progress.size
        });
      } catch (err) {
        console.error('❌ WORKING INSTRUCTIONS STATE: Failed to load data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load assistance data');
      } finally {
        setIsLoading(false);
      }
    }

    loadAll();
  }, [goalId, taskId]);

  /**
   * Save new assistance response (ATOMIC: database + state)
   */
  const saveResponse = async (
    instructionId: string,
    response: AssistanceResponse
  ): Promise<void> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User must be authenticated to save assistance response');
      }

      console.log('💾 WORKING INSTRUCTIONS STATE: Saving response', {
        instructionId,
        responseId: response.id,
        assistanceType: response.assistanceType
      });

      // 1. Save to database and get DB ID
      const dbId = await assistanceResponsePersistenceService.saveAssistanceResponse(
        user.id,
        goalId,
        taskId,
        instructionId,
        response
      );

      // 2. CRITICAL: Update local state immediately with dbId
      setAssistanceResponses(prev => {
        const updated = new Map(prev);
        const existing = updated.get(instructionId) || [];
        const responseWithDbId = { ...response, dbId };
        updated.set(instructionId, [...existing, responseWithDbId]);
        return updated;
      });

      console.log('✅ WORKING INSTRUCTIONS STATE: Response saved and state updated', {
        dbId,
        instructionId
      });
    } catch (err) {
      console.error('❌ WORKING INSTRUCTIONS STATE: Failed to save response:', err);
      throw err;
    }
  };

  /**
   * Toggle step completion (ATOMIC: database + state)
   */
  const toggleStep = async (
    responseDbId: string,
    stepIndex: number,
    stepContent: string
  ): Promise<void> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User must be authenticated to toggle step progress');
      }

      // Determine new completion state
      const currentSteps = stepProgress.get(responseDbId) || new Set();
      const isCompleted = !currentSteps.has(stepIndex);

      console.log('💾 WORKING INSTRUCTIONS STATE: Toggling step', {
        responseDbId,
        stepIndex,
        isCompleted
      });

      // 1. Save to database
      await assistanceResponsePersistenceService.saveStepProgress(
        user.id,
        responseDbId,
        stepIndex,
        stepContent,
        isCompleted
      );

      // 2. Update local state
      setStepProgress(prev => {
        const updated = new Map(prev);
        const steps = new Set(updated.get(responseDbId) || new Set());
        
        if (isCompleted) {
          steps.add(stepIndex);
        } else {
          steps.delete(stepIndex);
        }
        
        updated.set(responseDbId, steps);
        return updated;
      });

      console.log('✅ WORKING INSTRUCTIONS STATE: Step toggled', {
        responseDbId,
        stepIndex,
        isCompleted
      });
    } catch (err) {
      console.error('❌ WORKING INSTRUCTIONS STATE: Failed to toggle step:', err);
      throw err;
    }
  };

  /**
   * Clear all responses for an instruction
   */
  const clearResponsesForInstruction = async (instructionId: string): Promise<void> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User must be authenticated to clear responses');
      }

      console.log('🗑️ WORKING INSTRUCTIONS STATE: Clearing responses', {
        instructionId
      });

      // 1. Delete from database
      await assistanceResponsePersistenceService.deleteResponsesForInstruction(
        user.id,
        goalId,
        taskId,
        instructionId
      );

      // 2. Update local state
      setAssistanceResponses(prev => {
        const updated = new Map(prev);
        
        // Get response IDs for this instruction to clean up step progress
        const responses = updated.get(instructionId) || [];
        responses.forEach(response => {
          if (response.dbId) {
            setStepProgress(prevProgress => {
              const updatedProgress = new Map(prevProgress);
              updatedProgress.delete(response.dbId!);
              return updatedProgress;
            });
          }
        });
        
        updated.delete(instructionId);
        return updated;
      });

      console.log('✅ WORKING INSTRUCTIONS STATE: Responses cleared', {
        instructionId
      });
    } catch (err) {
      console.error('❌ WORKING INSTRUCTIONS STATE: Failed to clear responses:', err);
      throw err;
    }
  };

  /**
   * Refresh all data from database
   */
  const refreshAll = async (): Promise<void> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      console.log('🔄 WORKING INSTRUCTIONS STATE: Refreshing all data');

      const [responses, progress] = await Promise.all([
        assistanceResponsePersistenceService.loadAllAssistanceResponsesForTask(
          user.id,
          goalId,
          taskId
        ),
        assistanceResponsePersistenceService.loadStepProgressForTask(
          user.id,
          goalId,
          taskId
        )
      ]);

      setAssistanceResponses(responses);
      setStepProgress(progress);

      console.log('✅ WORKING INSTRUCTIONS STATE: Data refreshed');
    } catch (err) {
      console.error('❌ WORKING INSTRUCTIONS STATE: Failed to refresh data:', err);
      throw err;
    }
  };

  return {
    assistanceResponses,
    stepProgress,
    isLoading,
    error,
    saveResponse,
    toggleStep,
    clearResponsesForInstruction,
    refreshAll
  };
}

/**
 * Unified Task Completion Hook
 * Pillar I: Preserve existing hooks, add integration layer
 * Pillar II: Ground Truth - Surface real completion states
 * Pillar III: Intentional Craft - Polished UX with feedback
 */

import { useState, useCallback, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { unifiedTaskCompletionService } from '@/services/unified-task-completion-service';
import { useJourneyTracking } from '@/hooks/use-journey-tracking';
import { 
  TaskCompletionEvent, 
  TaskCompletionContext, 
  TaskCompletionResult,
  TaskCompletionState 
} from '@/types/task-completion';

interface UseTaskCompletionOptions {
  showFeedback?: boolean;
  autoNavigate?: boolean;
  returnRoute?: string;
}

export const useTaskCompletion = (options: UseTaskCompletionOptions = {}) => {
  const { 
    showFeedback = true, 
    autoNavigate = true, 
    returnRoute 
  } = options;

  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { refetch: refetchJourney } = useJourneyTracking();

  // Pillar II: Ground Truth - Real completion state
  const [completionState, setCompletionState] = useState<TaskCompletionState>(
    unifiedTaskCompletionService.getCompletionState()
  );

  // Pillar I: Preserve reactive updates
  useEffect(() => {
    const unsubscribe = unifiedTaskCompletionService.onTaskCompletion(
      async (event: TaskCompletionEvent) => {
        console.log('🎉 Task completion event received:', event.taskTitle);
        
        // Pillar III: Intentional Craft - Show success feedback
        if (showFeedback) {
          toast({
            title: "Task Completed! 🎉",
            description: `"${event.taskTitle}" has been completed successfully.`,
            duration: 4000,
          });
        }

        // Pillar I: Preserve journey data sync
        await refetchJourney();

        // Update local state with real completion state
        setCompletionState(unifiedTaskCompletionService.getCompletionState());
      }
    );

    return unsubscribe;
  }, [showFeedback, toast, refetchJourney]);

  // Pillar II: Ground Truth - Monitor real state changes
  useEffect(() => {
    const interval = setInterval(() => {
      const currentState = unifiedTaskCompletionService.getCompletionState();
      if (JSON.stringify(currentState) !== JSON.stringify(completionState)) {
        setCompletionState(currentState);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [completionState]);

  /**
   * Pillar I: Preserve existing completion logic, add orchestration
   */
  const completeTask = useCallback(async (
    taskId: string,
    completionMethod: TaskCompletionEvent['completionMethod'] = 'task_card',
    sessionData?: TaskCompletionEvent['sessionData']
  ): Promise<TaskCompletionResult> => {
    console.log('🎯 useTaskCompletion: Initiating task completion for:', taskId);

    // Pillar II: Ground Truth - Build real context
    const context: TaskCompletionContext = {
      user_id: '', // Will be set by service
      currentRoute: location.pathname,
      returnRoute,
      shouldNavigate: autoNavigate,
      shouldShowFeedback: showFeedback,
      shouldUpdateAnalytics: true
    };

    try {
      const result = await unifiedTaskCompletionService.completeTask(
        taskId,
        completionMethod,
        context,
        sessionData
      );

      // Pillar III: Intentional Craft - Handle navigation
      if (result.success && autoNavigate && result.navigationTarget) {
        console.log('🧭 Navigating to:', result.navigationTarget);
        setTimeout(() => navigate(result.navigationTarget!), 1500); // Delay for feedback
      }

      // Pillar II: No masking - surface errors
      if (!result.success && showFeedback) {
        toast({
          title: "Task Completion Failed",
          description: result.message,
          variant: "destructive",
        });
      }

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ useTaskCompletion: Completion failed:', errorMessage);

      // Pillar II: Surface real error
      if (showFeedback) {
        toast({
          title: "Task Completion Error",
          description: errorMessage,
          variant: "destructive",
        });
      }

      return {
        success: false,
        message: errorMessage
      };
    }
  }, [location.pathname, returnRoute, autoNavigate, showFeedback, navigate, toast]);

  /**
   * Pillar III: Intentional Craft - Convenient completion methods
   */
  const completeTaskFromCoach = useCallback((
    taskId: string, 
    sessionData: TaskCompletionEvent['sessionData']
  ) => {
    return completeTask(taskId, 'coach_interface', sessionData);
  }, [completeTask]);

  const completeTaskFromCard = useCallback((taskId: string) => {
    return completeTask(taskId, 'task_card');
  }, [completeTask]);

  const completeTaskFromKanban = useCallback((taskId: string) => {
    return completeTask(taskId, 'kanban_board');
  }, [completeTask]);

  const completeTaskFromJourney = useCallback((taskId: string) => {
    return completeTask(taskId, 'journey_map');
  }, [completeTask]);

  /**
   * Pillar II: Ground Truth - Clear error state
   */
  const clearError = useCallback(() => {
    unifiedTaskCompletionService.clearError();
    setCompletionState(unifiedTaskCompletionService.getCompletionState());
  }, []);

  /**
   * Pillar II: Ground Truth - Check completion status
   */
  const isTaskCompleting = useCallback((taskId: string): boolean => {
    return unifiedTaskCompletionService.isTaskCompleting(taskId);
  }, []);

  return {
    // Core completion function
    completeTask,
    
    // Specialized completion methods
    completeTaskFromCoach,
    completeTaskFromCard,
    completeTaskFromKanban,
    completeTaskFromJourney,
    
    // State management
    completionState,
    isCompleting: completionState.isCompleting,
    error: completionState.error,
    lastCompletedTask: completionState.lastCompletedTask,
    
    // Utilities
    clearError,
    isTaskCompleting
  };
};
/**
 * Unified Task Completion Service
 * Pillar I: Preserve Core Intelligence - Integrates all existing services
 * Pillar II: Ground Truth - No masking, surface real completion states
 * Pillar III: Intentional Craft - Polished completion experience
 */

import { taskCoachIntegrationService } from './task-coach-integration-service';
import { dreamActivityLogger } from './dream-activity-logger';
import { supabase } from '@/integrations/supabase/client';
import { 
  TaskCompletionEvent, 
  TaskCompletionContext, 
  TaskCompletionResult, 
  TaskCompletionListener,
  TaskCompletionState 
} from '@/types/task-completion';

class UnifiedTaskCompletionService {
  private listeners: Set<TaskCompletionListener> = new Set();
  private completionState: TaskCompletionState = {
    isCompleting: false,
    error: null,
    lastCompletedTask: null,
    pendingUpdates: new Set()
  };

  /**
   * Pillar I: Preserve Core Intelligence
   * Register completion listener for event-driven updates
   */
  onTaskCompletion(listener: TaskCompletionListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Pillar II: Ground Truth - Surface real completion state
   */
  getCompletionState(): Readonly<TaskCompletionState> {
    return { ...this.completionState };
  }

  /**
   * Core completion orchestrator - connects all isolated systems
   * Pillar I: Preserve existing functionality, add integration
   */
  async completeTask(
    taskId: string, 
    completionMethod: TaskCompletionEvent['completionMethod'],
    context: TaskCompletionContext,
    sessionData?: TaskCompletionEvent['sessionData']
  ): Promise<TaskCompletionResult> {
    console.log('🎯 UnifiedTaskCompletion: Starting completion process for task:', taskId);
    
    // Pillar II: No masking - set real completion state
    this.completionState.isCompleting = true;
    this.completionState.error = null;
    this.completionState.pendingUpdates.add(taskId);

    try {
      // Step 1: Get current task context from existing service
      const currentTask = taskCoachIntegrationService.getCurrentTask();
      if (!currentTask || currentTask.id !== taskId) {
        throw new Error(`Task context mismatch: expected ${taskId}, got ${currentTask?.id || 'null'}`);
      }

      // Step 2: Execute core completion via existing service
      console.log('🔄 UnifiedTaskCompletion: Executing core completion');
      const coreResult = await taskCoachIntegrationService.executeTaskAction({
        type: 'complete_task',
        payload: {}
      });

      if (!coreResult.success) {
        throw new Error(`Core completion failed: ${coreResult.message}`);
      }

      // Step 3: Create completion event (Pillar II: Ground Truth)
      const completionEvent: TaskCompletionEvent = {
        taskId,
        taskTitle: currentTask.title,
        completionMethod,
        progress: 100,
        completedAt: new Date(),
        sessionData,
        goalId: currentTask.goal_id,
        subtasksCompleted: currentTask.sub_tasks?.filter(st => st.completed).length || 0,
        totalSubtasks: currentTask.sub_tasks?.length || 0
      };

      // Step 4: Execute parallel integrations (Pillar I: Preserve all systems)
      await Promise.all([
        this.updateJourneyTrackingSystem(taskId, completionEvent, context),
        this.updateAnalyticsSystem(completionEvent, context),
        this.updateGoalProgress(currentTask.goal_id, completionEvent),
        this.logCompletionActivity(completionEvent, context)
      ]);

      // Step 5: Notify all listeners (Pillar I: Preserve reactive updates)
      console.log('📡 UnifiedTaskCompletion: Notifying listeners');
      await this.notifyListeners(completionEvent);

      // Step 6: Success state update (Pillar II: Ground Truth)
      this.completionState.isCompleting = false;
      this.completionState.lastCompletedTask = taskId;
      this.completionState.pendingUpdates.delete(taskId);

      console.log('✅ UnifiedTaskCompletion: Task completion successful');
      
      return {
        success: true,
        message: `Task "${currentTask.title}" completed successfully!`,
        updatedTask: { ...currentTask, status: 'completed', progress: 100 },
        completionEvent,
        navigationTarget: this.determineNavigationTarget(context)
      };

    } catch (error) {
      // Pillar II: No masking - surface real errors
      const errorMessage = error instanceof Error ? error.message : 'Unknown completion error';
      console.error('❌ UnifiedTaskCompletion: Completion failed:', errorMessage);
      
      this.completionState.isCompleting = false;
      this.completionState.error = errorMessage;
      this.completionState.pendingUpdates.delete(taskId);

      await dreamActivityLogger.logError('unified_task_completion_error', {
        task_id: taskId,
        completion_method: completionMethod,
        error: errorMessage,
        context: context.currentRoute
      });

      return {
        success: false,
        message: `Task completion failed: ${errorMessage}`
      };
    }
  }

  /**
   * Pillar I: Preserve existing journey tracking functionality
   */
  private async updateJourneyTrackingSystem(
    taskId: string, 
    event: TaskCompletionEvent, 
    context: TaskCompletionContext
  ): Promise<void> {
    try {
      console.log('🔄 UnifiedTaskCompletion: Updating journey tracking system');
      
      // Get user's productivity journey
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: journey } = await supabase
        .from('productivity_journey')
        .select('current_goals, completed_tasks')
        .eq('user_id', user.id)
        .single();

      if (journey) {
        const completedTasks = Array.isArray(journey.completed_tasks) ? journey.completed_tasks : [];
        const updatedCompletedTasks = [...completedTasks, {
          id: taskId,
          title: event.taskTitle,
          completed_at: event.completedAt.toISOString(),
          completion_method: event.completionMethod,
          session_data: event.sessionData
        }];

        await supabase
          .from('productivity_journey')
          .update({ 
            completed_tasks: updatedCompletedTasks,
            last_activity_date: new Date().toISOString()
          })
          .eq('user_id', user.id);
      }
    } catch (error) {
      console.error('Failed to update journey tracking:', error);
      // Don't throw - keep other integrations working
    }
  }

  /**
   * Pillar I: Preserve existing analytics functionality
   */
  private async updateAnalyticsSystem(
    event: TaskCompletionEvent, 
    context: TaskCompletionContext
  ): Promise<void> {
    try {
      console.log('📊 UnifiedTaskCompletion: Updating analytics system');
      
      await dreamActivityLogger.logActivity('unified_task_completion', {
        task_id: event.taskId,
        completion_method: event.completionMethod,
        completion_time: event.completedAt.toISOString(),
        session_duration: event.sessionData?.duration,
        message_count: event.sessionData?.messageCount,
        action_count: event.sessionData?.actionCount,
        subtasks_completed: event.subtasksCompleted,
        total_subtasks: event.totalSubtasks,
        context: context.currentRoute
      });
    } catch (error) {
      console.error('Failed to update analytics:', error);
      // Don't throw - keep other integrations working
    }
  }

  /**
   * Pillar I: Preserve goal progress functionality
   */
  private async updateGoalProgress(
    goalId: string | undefined, 
    event: TaskCompletionEvent
  ): Promise<void> {
    if (!goalId) return;

    try {
      console.log('🎯 UnifiedTaskCompletion: Updating goal progress for goal:', goalId);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: journey } = await supabase
        .from('productivity_journey')
        .select('current_goals')
        .eq('user_id', user.id)
        .single();

      if (journey?.current_goals) {
        const currentGoals = Array.isArray(journey.current_goals) ? journey.current_goals : [];
        const updatedGoals = currentGoals.map((goal: any) => {
          if (goal.id === goalId && goal.tasks) {
            const updatedTasks = goal.tasks.map((task: any) => 
              task.id === event.taskId 
                ? { ...task, status: 'completed', progress: 100, completed_at: event.completedAt.toISOString() }
                : task
            );
            
            // Calculate goal progress
            const completedTasks = updatedTasks.filter((task: any) => task.status === 'completed').length;
            const totalTasks = updatedTasks.length;
            const goalProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
            
            return {
              ...goal,
              tasks: updatedTasks,
              progress: goalProgress,
              updated_at: new Date().toISOString()
            };
          }
          return goal;
        });

        await supabase
          .from('productivity_journey')
          .update({ current_goals: updatedGoals })
          .eq('user_id', user.id);
      }
    } catch (error) {
      console.error('Failed to update goal progress:', error);
      // Don't throw - keep other integrations working
    }
  }

  /**
   * Pillar II: Ground Truth - Log real completion activity
   */
  private async logCompletionActivity(
    event: TaskCompletionEvent, 
    context: TaskCompletionContext
  ): Promise<void> {
    await dreamActivityLogger.logActivity('task_completion_orchestrated', {
      task_id: event.taskId,
      task_title: event.taskTitle,
      completion_method: event.completionMethod,
      completion_timestamp: event.completedAt.toISOString(),
      user_context: context.currentRoute,
      session_data: event.sessionData,
      goal_context: event.goalId,
      subtask_completion_rate: event.totalSubtasks ? (event.subtasksCompleted! / event.totalSubtasks) : 1
    });
  }

  /**
   * Pillar III: Intentional Craft - Smart navigation logic
   */
  private determineNavigationTarget(context: TaskCompletionContext): string | undefined {
    if (!context.shouldNavigate) return undefined;
    
    // Return to previous route if specified
    if (context.returnRoute) return context.returnRoute;
    
    // Smart navigation based on current context
    switch (context.currentRoute) {
      case '/dreams':
        return '/dreams'; // Stay on dreams for journey continuation
      case '/tasks':
        return '/tasks'; // Return to task list
      default:
        return '/tasks'; // Default fallback
    }
  }

  /**
   * Pillar I: Preserve reactive architecture
   */
  private async notifyListeners(event: TaskCompletionEvent): Promise<void> {
    const notificationPromises = Array.from(this.listeners).map(async (listener) => {
      try {
        await listener(event);
      } catch (error) {
        console.error('Completion listener error:', error);
        // Don't throw - keep other listeners working
      }
    });

    await Promise.all(notificationPromises);
  }

  /**
   * Pillar II: Ground Truth - Clear error state
   */
  clearError(): void {
    this.completionState.error = null;
  }

  /**
   * Pillar II: Ground Truth - Check if task is completing
   */
  isTaskCompleting(taskId: string): boolean {
    return this.completionState.pendingUpdates.has(taskId);
  }
}

export const unifiedTaskCompletionService = new UnifiedTaskCompletionService();

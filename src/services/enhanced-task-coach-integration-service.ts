
import { dreamActivityLogger } from "./dream-activity-logger";
import { taskCoachIntegrationService, TaskContext, TaskAction } from "./task-coach-integration-service";

class EnhancedTaskCoachIntegrationService {
  private actionExecutionCount = new Map<string, number>();
  private lastExecutionTime = new Map<string, number>();
  private maxActionsPerMinute = 10;
  private cooldownPeriod = 60000; // 1 minute
  
  constructor() {
    this.setupLogging();
  }

  private setupLogging() {
    // Log service initialization
    dreamActivityLogger.logActivity('task_coach_service_initialized', {
      service: 'EnhancedTaskCoachIntegrationService',
      features: ['anti_loop_protection', 'comprehensive_logging', 'rate_limiting']
    });
  }

  private generateActionKey(action: TaskAction): string {
    return `${action.type}_${JSON.stringify(action.payload)}`;
  }

  private isRateLimited(action: TaskAction): boolean {
    const actionKey = this.generateActionKey(action);
    const now = Date.now();
    const lastTime = this.lastExecutionTime.get(actionKey);
    const executionCount = this.actionExecutionCount.get(actionKey) || 0;

    // Reset count if cooldown period has passed
    if (lastTime && (now - lastTime) > this.cooldownPeriod) {
      this.actionExecutionCount.set(actionKey, 0);
    }

    // Check if rate limited
    if (executionCount >= this.maxActionsPerMinute) {
      dreamActivityLogger.logActivity('action_rate_limited', {
        action_type: action.type,
        execution_count: executionCount,
        cooldown_remaining: this.cooldownPeriod - (now - (lastTime || 0))
      });
      return true;
    }

    return false;
  }

  private incrementActionCount(action: TaskAction): void {
    const actionKey = this.generateActionKey(action);
    const current = this.actionExecutionCount.get(actionKey) || 0;
    this.actionExecutionCount.set(actionKey, current + 1);
    this.lastExecutionTime.set(actionKey, Date.now());
  }

  async executeTaskAction(action: TaskAction, triggeredBy: 'user_action' | 'auto_execution' | 'coach_response' = 'user_action') {
    const startTime = Date.now();
    
    try {
      // Log action attempt
      await dreamActivityLogger.logActivity('task_action_attempt', {
        action_type: action.type,
        action_payload: action.payload,
        triggered_by: triggeredBy
      });

      // Check for rate limiting
      if (this.isRateLimited(action)) {
        const result = {
          success: false,
          message: 'Action rate limited to prevent loops',
          data: null
        };

        await dreamActivityLogger.logCoachAction({
          session_id: dreamActivityLogger.getCurrentSessionId(),
          action_type: action.type,
          action_payload: action.payload,
          execution_result: result,
          execution_time_ms: Date.now() - startTime,
          triggered_by: triggeredBy,
          duplicate_detection: {
            rate_limited: true,
            execution_count: this.actionExecutionCount.get(this.generateActionKey(action))
          }
        });

        return result;
      }

      // Increment action count for rate limiting
      this.incrementActionCount(action);

      // Execute the actual action using the original service
      const result = await taskCoachIntegrationService.executeTaskAction(action);
      
      const executionTime = Date.now() - startTime;

      // Log successful execution
      await dreamActivityLogger.logCoachAction({
        session_id: dreamActivityLogger.getCurrentSessionId(),
        action_type: action.type,
        action_payload: action.payload,
        execution_result: result,
        execution_time_ms: executionTime,
        triggered_by: triggeredBy
      });

      // Log specific action results
      if (result.success) {
        await dreamActivityLogger.logActivity('task_action_success', {
          action_type: action.type,
          execution_time_ms: executionTime,
          result_data: result.data
        });
      } else {
        await dreamActivityLogger.logActivity('task_action_failure', {
          action_type: action.type,
          error_message: result.message,
          execution_time_ms: executionTime
        });
      }

      return result;
    } catch (error) {
      const executionTime = Date.now() - startTime;
      
      // Log error
      await dreamActivityLogger.logError('task_action_error', {
        action_type: action.type,
        action_payload: action.payload,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        execution_time_ms: executionTime,
        triggered_by: triggeredBy
      });

      return {
        success: false,
        message: `Action failed: ${error instanceof Error ? error.message : String(error)}`,
        data: null
      };
    }
  }

  // Enhanced methods with logging
  async setCurrentTask(task: TaskContext) {
    await dreamActivityLogger.logActivity('task_context_set', {
      task_id: task.id,
      task_title: task.title,
      task_status: task.status,
      progress: task.progress
    });

    return taskCoachIntegrationService.setCurrentTask(task);
  }

  generateCoachContext(): string {
    const context = taskCoachIntegrationService.generateCoachContext();
    
    dreamActivityLogger.logActivity('coach_context_generated', {
      context_length: context.length,
      has_current_task: context.includes('Current Task:'),
      has_subtasks: context.includes('Sub-tasks:')
    });

    return context;
  }

  onTaskUpdate(callback: (task: TaskContext) => void): () => void {
    const wrappedCallback = (task: TaskContext) => {
      dreamActivityLogger.logActivity('task_update_received', {
        task_id: task.id,
        task_title: task.title,
        progress: task.progress,
        status: task.status,
        subtasks_count: task.sub_tasks?.length || 0
      });
      
      callback(task);
    };

    // Call the original service and return its unsubscribe function (or create a no-op if it returns void)
    const unsubscribe = taskCoachIntegrationService.onTaskUpdate(wrappedCallback);
    return typeof unsubscribe === 'function' ? unsubscribe : () => {};
  }

  onTaskComplete(callback: (taskId: string) => void): () => void {
    const wrappedCallback = (taskId: string) => {
      dreamActivityLogger.logActivity('task_completion_received', {
        task_id: taskId,
        completion_timestamp: new Date().toISOString()
      });
      
      callback(taskId);
    };

    // Call the original service and return its unsubscribe function (or create a no-op if it returns void)
    const unsubscribe = taskCoachIntegrationService.onTaskComplete(wrappedCallback);
    return typeof unsubscribe === 'function' ? unsubscribe : () => {};
  }

  // Circuit breaker methods
  resetRateLimits() {
    this.actionExecutionCount.clear();
    this.lastExecutionTime.clear();
    
    dreamActivityLogger.logActivity('rate_limits_reset', {
      reset_timestamp: new Date().toISOString(),
      reason: 'manual_reset'
    });
  }

  getActionStats() {
    const stats = {
      total_actions: Array.from(this.actionExecutionCount.values()).reduce((sum, count) => sum + count, 0),
      unique_actions: this.actionExecutionCount.size,
      actions_by_type: Object.fromEntries(this.actionExecutionCount),
      last_execution_times: Object.fromEntries(this.lastExecutionTime)
    };

    dreamActivityLogger.logActivity('action_stats_requested', stats);
    return stats;
  }
}

export const enhancedTaskCoachIntegrationService = new EnhancedTaskCoachIntegrationService();

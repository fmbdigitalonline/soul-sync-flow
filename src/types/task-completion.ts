/**
 * Task Completion Event Types
 * Pillar II: Ground Truth - No simulation, real state representation
 */

export interface TaskCompletionEvent {
  taskId: string;
  taskTitle: string;
  completionMethod: 'coach_interface' | 'task_card' | 'kanban_board' | 'journey_map';
  progress: number;
  completedAt: Date;
  sessionData?: {
    duration: number;
    messageCount: number;
    actionCount: number;
    focusTime?: number;
  };
  goalId?: string;
  subtasksCompleted?: number;
  totalSubtasks?: number;
}

export interface TaskCompletionContext {
  user_id: string;
  currentRoute: string;
  returnRoute?: string;
  shouldNavigate: boolean;
  shouldShowFeedback: boolean;
  shouldUpdateAnalytics: boolean;
}

export interface TaskCompletionResult {
  success: boolean;
  message: string;
  updatedTask?: any;
  goalProgress?: number;
  completionEvent?: TaskCompletionEvent;
  navigationTarget?: string;
}

export type TaskCompletionListener = (event: TaskCompletionEvent) => void | Promise<void>;

export interface TaskCompletionState {
  isCompleting: boolean;
  error: string | null;
  lastCompletedTask: string | null;
  pendingUpdates: Set<string>;
}
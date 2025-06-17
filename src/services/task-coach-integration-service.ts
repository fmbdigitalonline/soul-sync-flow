
import { supabase } from "@/integrations/supabase/client";

export interface TaskContext {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'stuck' | 'completed';
  estimated_duration: string;
  energy_level_required: string;
  category: string;
  goal_id?: string;
  sub_tasks?: SubTask[];
  progress: number;
}

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
  order: number;
}

export interface TaskAction {
  type: 'complete_subtask' | 'complete_task' | 'update_progress' | 'add_subtask' | 'get_next_task';
  payload: any;
}

interface Goal {
  id: string;
  title: string;
  description?: string;
  tasks?: TaskContext[];
}

// Helper functions for safe type conversion
const isValidGoal = (obj: any): obj is Goal => {
  return obj && typeof obj === 'object' && 
         typeof obj.id === 'string' && 
         typeof obj.title === 'string';
};

const isValidTask = (obj: any): obj is TaskContext => {
  return obj && typeof obj === 'object' && 
         typeof obj.id === 'string' && 
         typeof obj.title === 'string' && 
         typeof obj.status === 'string';
};

const parseGoalsFromJson = (json: any): Goal[] => {
  if (!Array.isArray(json)) return [];
  return json.filter(isValidGoal);
};

const parseTasksFromJson = (json: any): TaskContext[] => {
  if (!Array.isArray(json)) return [];
  return json.filter(isValidTask);
};

const serializeGoalsToJson = (goals: Goal[]): any => {
  return goals.map(goal => ({
    id: goal.id,
    title: goal.title,
    description: goal.description,
    tasks: goal.tasks ? goal.tasks.map(task => ({
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status,
      estimated_duration: task.estimated_duration,
      energy_level_required: task.energy_level_required,
      category: task.category,
      goal_id: task.goal_id,
      progress: task.progress,
      sub_tasks: task.sub_tasks || [],
      completed: task.status === 'completed'
    })) : []
  }));
};

class TaskCoachIntegrationService {
  private currentTask: TaskContext | null = null;
  private onTaskUpdateCallback?: (task: TaskContext) => void;
  private onTaskCompleteCallback?: (taskId: string) => void;

  // Set the current task context for the coach
  setCurrentTask(task: TaskContext) {
    console.log('🔗 TaskCoach Integration: Setting current task:', task.title);
    this.currentTask = task;
  }

  // Get current task context
  getCurrentTask(): TaskContext | null {
    return this.currentTask;
  }

  // Register callbacks for task updates
  onTaskUpdate(callback: (task: TaskContext) => void) {
    this.onTaskUpdateCallback = callback;
  }

  onTaskComplete(callback: (taskId: string) => void) {
    this.onTaskCompleteCallback = callback;
  }

  // Coach actions on tasks
  async executeTaskAction(action: TaskAction): Promise<{ success: boolean; message: string; data?: any }> {
    if (!this.currentTask) {
      return { success: false, message: 'No active task context' };
    }

    console.log('🎯 TaskCoach Integration: Executing action:', action.type, action.payload);

    try {
      switch (action.type) {
        case 'complete_subtask':
          return await this.completeSubTask(action.payload.subTaskId);

        case 'complete_task':
          return await this.completeCurrentTask();

        case 'update_progress':
          return await this.updateTaskProgress(action.payload.progress);

        case 'add_subtask':
          return await this.addSubTask(action.payload.title);

        case 'get_next_task':
          return await this.getNextTask();

        default:
          return { success: false, message: 'Unknown action type' };
      }
    } catch (error) {
      console.error('❌ TaskCoach Integration: Action failed:', error);
      return { success: false, message: error instanceof Error ? error.message : 'Action failed' };
    }
  }

  private async completeSubTask(subTaskId: string): Promise<{ success: boolean; message: string }> {
    if (!this.currentTask?.sub_tasks) {
      return { success: false, message: 'No sub-tasks available' };
    }

    // Update sub-task status
    const updatedSubTasks = this.currentTask.sub_tasks.map(subTask =>
      subTask.id === subTaskId ? { ...subTask, completed: true } : subTask
    );

    // Calculate new progress
    const completedCount = updatedSubTasks.filter(st => st.completed).length;
    const newProgress = Math.round((completedCount / updatedSubTasks.length) * 100);

    // Update current task
    this.currentTask = {
      ...this.currentTask,
      sub_tasks: updatedSubTasks,
      progress: newProgress
    };

    // Update in database
    await this.updateTaskInDatabase(this.currentTask);

    // Notify callbacks
    if (this.onTaskUpdateCallback) {
      this.onTaskUpdateCallback(this.currentTask);
    }

    console.log('✅ TaskCoach Integration: Sub-task completed:', subTaskId);
    return { 
      success: true, 
      message: `Sub-task completed! Progress: ${newProgress}%` 
    };
  }

  private async completeCurrentTask(): Promise<{ success: boolean; message: string }> {
    if (!this.currentTask) {
      return { success: false, message: 'No active task' };
    }

    // Update task status
    this.currentTask = {
      ...this.currentTask,
      status: 'completed',
      progress: 100
    };

    // Update in database
    await this.updateTaskInDatabase(this.currentTask);

    // Notify completion callback
    if (this.onTaskCompleteCallback) {
      this.onTaskCompleteCallback(this.currentTask.id);
    }

    console.log('🎉 TaskCoach Integration: Task completed:', this.currentTask.title);
    return { 
      success: true, 
      message: `Task "${this.currentTask.title}" completed successfully!` 
    };
  }

  private async updateTaskProgress(progress: number): Promise<{ success: boolean; message: string }> {
    if (!this.currentTask) {
      return { success: false, message: 'No active task' };
    }

    this.currentTask = {
      ...this.currentTask,
      progress: Math.min(100, Math.max(0, progress))
    };

    // Update in database
    await this.updateTaskInDatabase(this.currentTask);

    if (this.onTaskUpdateCallback) {
      this.onTaskUpdateCallback(this.currentTask);
    }

    return { 
      success: true, 
      message: `Progress updated to ${this.currentTask.progress}%` 
    };
  }

  private async addSubTask(title: string): Promise<{ success: boolean; message: string }> {
    if (!this.currentTask) {
      return { success: false, message: 'No active task' };
    }

    const newSubTask: SubTask = {
      id: `subtask_${Date.now()}`,
      title,
      completed: false,
      order: (this.currentTask.sub_tasks?.length || 0) + 1
    };

    this.currentTask = {
      ...this.currentTask,
      sub_tasks: [...(this.currentTask.sub_tasks || []), newSubTask]
    };

    // Update in database
    await this.updateTaskInDatabase(this.currentTask);

    if (this.onTaskUpdateCallback) {
      this.onTaskUpdateCallback(this.currentTask);
    }

    return { 
      success: true, 
      message: `Sub-task "${title}" added successfully` 
    };
  }

  private async getNextTask(): Promise<{ success: boolean; message: string; data?: any }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, message: 'User not authenticated' };
      }

      // Get user's productivity journey
      const { data: journey } = await supabase
        .from('productivity_journey')
        .select('current_goals')
        .eq('user_id', user.id)
        .single();

      if (!journey?.current_goals) {
        return { success: false, message: 'No goals found' };
      }

      // Safely parse goals from database
      const currentGoals = parseGoalsFromJson(journey.current_goals);

      // Find next incomplete task
      for (const goal of currentGoals) {
        if (goal.tasks && goal.tasks.length > 0) {
          const nextTask = goal.tasks.find((task: TaskContext) => 
            task.status !== 'completed' && task.id !== this.currentTask?.id
          );
          
          if (nextTask) {
            return {
              success: true,
              message: `Next task: "${nextTask.title}"`,
              data: nextTask
            };
          }
        }
      }

      return { success: false, message: 'No more tasks available' };
    } catch (error) {
      console.error('Failed to get next task:', error);
      return { success: false, message: 'Failed to get next task' };
    }
  }

  private async updateTaskInDatabase(task: TaskContext) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: journey } = await supabase
        .from('productivity_journey')
        .select('current_goals')
        .eq('user_id', user.id)
        .single();

      if (journey?.current_goals) {
        // Safely parse and update goals
        const currentGoals = parseGoalsFromJson(journey.current_goals);
        
        const updatedGoals = currentGoals.map((goal: Goal) => ({
          ...goal,
          tasks: goal.tasks ? goal.tasks.map((t: TaskContext) => 
            t.id === task.id ? {
              ...t,
              status: task.status,
              progress: task.progress,
              sub_tasks: task.sub_tasks
            } : t
          ) : []
        }));

        // Serialize goals for database storage
        const serializedGoals = serializeGoalsToJson(updatedGoals);

        await supabase
          .from('productivity_journey')
          .update({ current_goals: serializedGoals })
          .eq('user_id', user.id);

        console.log('🔄 TaskCoach Integration: Task updated in database');
      }
    } catch (error) {
      console.error('Failed to update task in database:', error);
    }
  }

  // Generate coach context for current task
  generateCoachContext(): string {
    if (!this.currentTask) {
      return 'No active task context available.';
    }

    const subTasksInfo = this.currentTask.sub_tasks?.length 
      ? `\nSub-tasks (${this.currentTask.sub_tasks.filter(st => st.completed).length}/${this.currentTask.sub_tasks.length} completed):\n${
          this.currentTask.sub_tasks.map(st => 
            `- ${st.completed ? '✅' : '⭕'} ${st.title}`
          ).join('\n')
        }`
      : '\nNo sub-tasks defined yet.';

    return `
Current Task Context:
- Task: "${this.currentTask.title}"
- Description: ${this.currentTask.description || 'No description'}
- Status: ${this.currentTask.status}
- Progress: ${this.currentTask.progress}%
- Energy Required: ${this.currentTask.energy_level_required}
- Estimated Duration: ${this.currentTask.estimated_duration}
- Category: ${this.currentTask.category}${subTasksInfo}

Available Actions:
- complete_subtask: Mark a sub-task as complete
- complete_task: Mark the entire task as complete
- update_progress: Update task progress percentage
- add_subtask: Add a new sub-task
- get_next_task: Get the next task in the sequence
    `;
  }
}

export const taskCoachIntegrationService = new TaskCoachIntegrationService();

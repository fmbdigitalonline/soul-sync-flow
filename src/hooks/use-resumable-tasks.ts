import { useMemo } from 'react';

import { useJourneyTracking } from '@/hooks/use-journey-tracking';
import { getTaskSessionType, TaskSessionType } from '@/utils/task-session';

export type TaskStatus = 'todo' | 'in_progress' | 'stuck' | 'completed';

export interface ResumableTask {
  id: string;
  title: string;
  description?: string;
  short_description?: string;
  status: TaskStatus;
  due_date?: string;
  estimated_duration: string;
  energy_level_required: string;
  category: string;
  optimal_time_of_day: string[];
  goal_id?: string;
  completed?: boolean;
}

function normalizeTask(goalId: string, rawTask: any): ResumableTask | null {
  if (!rawTask) {
    return null;
  }

  const rawId = rawTask.id ?? rawTask.task_id ?? rawTask.uuid;
  if (!rawId) {
    return null;
  }

  const id = String(rawId);
  const status: TaskStatus = rawTask.completed
    ? 'completed'
    : (rawTask.status as TaskStatus) ?? 'todo';

  return {
    id,
    title: typeof rawTask.title === 'string' ? rawTask.title : 'Untitled Task',
    description: typeof rawTask.description === 'string' ? rawTask.description : undefined,
    short_description: typeof rawTask.short_description === 'string' ? rawTask.short_description : undefined,
    status,
    due_date: typeof rawTask.due_date === 'string' ? rawTask.due_date : undefined,
    estimated_duration: typeof rawTask.estimated_duration === 'string' ? rawTask.estimated_duration : '30 min',
    energy_level_required: typeof rawTask.energy_level_required === 'string' ? rawTask.energy_level_required : 'medium',
    category: typeof rawTask.category === 'string' ? rawTask.category : 'execution',
    optimal_time_of_day: Array.isArray(rawTask.optimal_time_of_day) && rawTask.optimal_time_of_day.length > 0
      ? rawTask.optimal_time_of_day
      : ['morning'],
    goal_id: typeof goalId === 'string' ? goalId : String(goalId),
    completed: Boolean(rawTask.completed)
  };
}

export function useResumableTasks(sessionRefreshKey = 0) {
  const { productivityJourney } = useJourneyTracking();

  const resumableTasksByGoal = useMemo(() => {
    const map = new Map<string, ResumableTask[]>();

    const goals = Array.isArray(productivityJourney?.current_goals)
      ? productivityJourney?.current_goals
      : [];

    goals.forEach((goal: any) => {
      const goalId = goal?.id ? String(goal.id) : undefined;
      if (!goalId) {
        return;
      }

      const rawTasks = Array.isArray(goal?.tasks) ? goal.tasks : [];

      rawTasks.forEach((rawTask: any) => {
        const task = normalizeTask(goalId, rawTask);
        if (!task) {
          return;
        }

        const sessionType = getTaskSessionType(task.id);
        if (sessionType === TaskSessionType.WORK_INSTRUCTION_SESSION) {
          if (!map.has(goalId)) {
            map.set(goalId, []);
          }

          map.get(goalId)!.push(task);
        }
      });
    });

    return map;
  }, [productivityJourney?.current_goals, sessionRefreshKey]);

  return { resumableTasksByGoal };
}


import { useEffect, useMemo, useState } from 'react';

import { useJourneyTracking } from '@/hooks/use-journey-tracking';
import { getTaskSessionType, getTaskSessionTypeAsync, TaskSessionType } from '@/utils/task-session';

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
  const [resumableTasksByGoal, setResumableTasksByGoal] = useState<Map<string, ResumableTask[]>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const determineResumableTasks = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const goals = Array.isArray(productivityJourney?.current_goals)
          ? productivityJourney.current_goals
          : [];

        const sessionChecks: Promise<{ goalId: string; task: ResumableTask } | null>[] = [];

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

            const immediateType = getTaskSessionType(task.id);
            if (immediateType === TaskSessionType.WORK_INSTRUCTION_SESSION) {
              sessionChecks.push(Promise.resolve({ goalId, task }));
              return;
            }

            sessionChecks.push(
              getTaskSessionTypeAsync(task.id)
                .then(sessionType => {
                  if (sessionType === TaskSessionType.WORK_INSTRUCTION_SESSION) {
                    return { goalId, task };
                  }
                  return null;
                })
                .catch(error => {
                  console.error('Failed to evaluate task session type', error);
                  return null;
                })
            );
          });
        });

        const results = await Promise.all(sessionChecks);
        if (!isMounted) {
          return;
        }

        const map = new Map<string, ResumableTask[]>();
        results.forEach(result => {
          if (!result) {
            return;
          }

          if (!map.has(result.goalId)) {
            map.set(result.goalId, []);
          }

          map.get(result.goalId)!.push(result.task);
        });

        setResumableTasksByGoal(map);
      } catch (err) {
        if (!isMounted) {
          return;
        }

        const message = err instanceof Error ? err.message : 'Failed to load resumable tasks';
        setError(message);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    determineResumableTasks();

    return () => {
      isMounted = false;
    };
  }, [productivityJourney?.current_goals, sessionRefreshKey]);

  return useMemo(() => ({
    resumableTasksByGoal,
    isLoading,
    error
  }), [resumableTasksByGoal, isLoading, error]);
}


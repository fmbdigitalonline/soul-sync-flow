/**
 * use-task-board — the panel's task status machine (Wave 1).
 *
 * Reads every task across active programs from
 * productivity_journey.current_goals and writes status changes through
 * updateProductivityJourney — the ONE existing task-status write path
 * (previously reachable only from the Dreams page's TaskViews; this hook
 * replicates that exact update shape so the panel closes the loop).
 */

import { useCallback, useMemo } from 'react';
import { useJourneyTracking } from '@/hooks/use-journey-tracking';

export type BoardTaskStatus = 'todo' | 'in_progress' | 'stuck' | 'completed';

export interface BoardTask {
  id: string;
  title: string;
  status: BoardTaskStatus;
  goalId: string;
  goalTitle: string;
  estimated_duration?: string;
  energy_level_required?: string;
  due_date?: string;
  raw: any;
}

export function useTaskBoard() {
  const { productivityJourney, updateProductivityJourney } = useJourneyTracking();

  const tasks: BoardTask[] = useMemo(() => {
    const rawGoals = productivityJourney?.current_goals;
    const goals: any[] = Array.isArray(rawGoals) ? rawGoals : [];
    const out: BoardTask[] = [];
    for (const goal of goals) {
      const goalId = String(goal?.id ?? goal?.goal_id ?? '');
      if (!goalId) continue;
      const goalTasks: any[] = Array.isArray(goal?.tasks) ? goal.tasks : [];
      goalTasks.forEach((task, index) => {
        out.push({
          id: task?.id ? String(task.id) : `${goalId}-${index}`,
          title: task?.title ?? 'Untitled Task',
          status: task?.completed ? 'completed' : ((task?.status as BoardTaskStatus) || 'todo'),
          goalId,
          goalTitle: goal?.title ?? '',
          estimated_duration: task?.estimated_duration,
          energy_level_required: task?.energy_level_required,
          due_date: task?.due_date,
          raw: task,
        });
      });
    }
    return out;
  }, [productivityJourney?.current_goals]);

  const updateTaskStatus = useCallback(
    async (goalId: string, taskId: string, newStatus: BoardTaskStatus) => {
      const rawGoals = productivityJourney?.current_goals;
      const currentGoals: any[] = Array.isArray(rawGoals) ? rawGoals : [];
      const updatedGoals = currentGoals.map((goal: any) => {
        const gid = String(goal?.id ?? goal?.goal_id ?? '');
        if (gid !== goalId) return goal;
        const goalTasks = Array.isArray(goal?.tasks) ? goal.tasks : [];
        return {
          ...goal,
          tasks: goalTasks.map((task: any) => {
            const tid = task?.id ? String(task.id) : null;
            if (tid !== taskId) return task;
            return { ...task, status: newStatus, completed: newStatus === 'completed' };
          }),
        };
      });
      return updateProductivityJourney({ current_goals: updatedGoals });
    },
    [productivityJourney?.current_goals, updateProductivityJourney],
  );

  return { tasks, updateTaskStatus };
}

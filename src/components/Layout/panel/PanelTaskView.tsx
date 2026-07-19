/**
 * PanelTaskView — the REAL task-collaboration room, embedded (founder
 * correction, Jul 19).
 *
 * Wave 1 built a lookalike dock and missed the deepest built features:
 * the Start Task Collaboration gate, Werkinstructies (parsed working
 * instructions with per-step progress), per-step help chips (Ik zit
 * vast / Meer details nodig / Hoe doe ik…? / Toon voorbeelden), the
 * interactive Help History with step-by-step action checklists, the
 * session timer, sidebar session tools — all living in the built
 * TaskCoachInterface. Reimplementation drifts; embedding doesn't:
 * this view now hosts the real interface, complete.
 *
 * Coach register fix: TaskCoachInterface runs the TASK-AWARE coach —
 * the spiritual-growth (program-aware guide) register no longer touches
 * micro-task contexts anywhere in the panel.
 *
 * Completion syncs through the board's write path so the kanban, the
 * Dreams page, and the panel agree.
 */

import React, { useMemo } from 'react';
import { TaskCoachInterface } from '@/components/task/TaskCoachInterface';
import { useTaskBoard } from '@/hooks/use-task-board';
import { toast } from 'sonner';

interface PanelTaskViewProps {
  task: any;
  goalId?: string;
  goalTitle?: string;
  onBack: () => void;
  /** When true, render only the chat surface (moment shell owns chrome). */
  compact?: boolean;
}

export const PanelTaskView: React.FC<PanelTaskViewProps> = ({ task, goalId, onBack, compact = false }) => {
  const { tasks: boardTasks, updateTaskStatus } = useTaskBoard();
  const boardTask = boardTasks.find(
    (t) => t.id === String(task?.id ?? '') && (!goalId || t.goalId === goalId),
  );

  // TaskCoachInterface expects the full task shape; normalize defensively
  // from board data first (live), the passed task second.
  const coachTask = useMemo(() => {
    const src = boardTask?.raw ?? task ?? {};
    return {
      id: String(src.id ?? task?.id ?? 'unknown'),
      title: src.title ?? 'Untitled task',
      description: src.description ?? '',
      status: (src.completed ? 'completed' : src.status ?? 'todo') as
        | 'todo'
        | 'in_progress'
        | 'stuck'
        | 'completed',
      due_date: src.due_date,
      estimated_duration: src.estimated_duration ?? '30 min',
      energy_level_required: src.energy_level_required ?? 'medium',
      category: src.category ?? 'execution',
      optimal_time_of_day: Array.isArray(src.optimal_time_of_day)
        ? src.optimal_time_of_day
        : ['morning'],
      goal_id: goalId ?? boardTask?.goalId,
      sub_tasks: Array.isArray(src.sub_tasks) ? src.sub_tasks : [],
    };
  }, [boardTask?.raw, task, goalId]);

  const handleComplete = async (taskId: string) => {
    const gid = goalId ?? boardTask?.goalId;
    if (gid) {
      const res = await updateTaskStatus(gid, taskId, 'completed');
      if (res?.success === false) {
        toast.error('Could not mark the task complete.');
        return;
      }
    }
    onBack();
  };

  return (
    // The interface is h-full/flex — give it a real height inside the
    // scrolling panel so its own internal scroll areas work.
    <div className={`h-[70vh] min-h-[420px] overflow-hidden bg-background ${compact ? '' : 'rounded-lg border border-border/60'}`}>
      <TaskCoachInterface
        task={coachTask as any}
        onBack={onBack}
        onTaskComplete={(taskId) => void handleComplete(taskId)}
        compact={compact}
      />
    </div>
  );
};

export default PanelTaskView;

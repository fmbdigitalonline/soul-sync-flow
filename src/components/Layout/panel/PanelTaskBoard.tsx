/**
 * PanelTaskBoard — the kanban's status machine, compressed for the panel
 * (Wave 1). Four status groups as compact rows (no drag-drop — status
 * changes are one tap via the existing TaskStatusSelector), each group
 * capped at 3 with Show more (Three-Pieces). Row tap opens the task
 * drill-in (Level 3) with its coach.
 */

import React, { useMemo, useState } from 'react';
import { List, Play, Pause, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useTaskBoard, type BoardTask, type BoardTaskStatus } from '@/hooks/use-task-board';
import { TaskStatusSelector } from '@/components/task/TaskStatusSelector';
import { toast } from 'sonner';

const MAX = 3;

const GROUPS: Array<{ status: BoardTaskStatus; label: string; icon: React.ElementType; tone: string }> = [
  { status: 'in_progress', label: 'Doing', icon: Play, tone: 'text-blue-600 dark:text-blue-400' },
  { status: 'stuck', label: 'Stuck', icon: Pause, tone: 'text-amber-600 dark:text-amber-400' },
  { status: 'todo', label: 'To do', icon: List, tone: 'text-muted-foreground' },
  { status: 'completed', label: 'Done', icon: CheckCircle2, tone: 'text-emerald-600 dark:text-emerald-400' },
];

interface PanelTaskBoardProps {
  onOpenTask: (task: BoardTask) => void;
}

export const PanelTaskBoard: React.FC<PanelTaskBoardProps> = ({ onOpenTask }) => {
  const { tasks, updateTaskStatus } = useTaskBoard();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const byStatus = useMemo(() => {
    const map: Record<BoardTaskStatus, BoardTask[]> = {
      todo: [], in_progress: [], stuck: [], completed: [],
    };
    for (const t of tasks) map[t.status].push(t);
    return map;
  }, [tasks]);

  if (tasks.length === 0) return null;

  const handleStatusChange = async (task: BoardTask, status: BoardTaskStatus) => {
    const res = await updateTaskStatus(task.goalId, task.id, status);
    if (res?.success === false) {
      toast.error('Could not update the task status.');
    }
  };

  return (
    <div className="space-y-3 pt-1">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        Tasks
      </p>
      {GROUPS.map(({ status, label, icon: Icon, tone }) => {
        const items = byStatus[status];
        if (items.length === 0) return null;
        const isOpen = !!expanded[status];
        const visible = isOpen ? items : items.slice(0, MAX);
        const hidden = Math.max(0, items.length - MAX);
        return (
          <div key={status} className="space-y-1">
            <div className="flex items-center gap-1.5">
              <Icon className={cn('h-3.5 w-3.5', tone)} />
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {label}
              </span>
              <span className="text-[10px] text-muted-foreground/70">({items.length})</span>
            </div>
            <ul className="space-y-1">
              {visible.map((task) => (
                <li key={`${task.goalId}_${task.id}`} className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onOpenTask(task)}
                    className="min-w-0 flex-1 text-left rounded-md px-2 py-1.5 hover:bg-muted/40 transition-colors"
                  >
                    <p
                      className={cn(
                        'text-xs truncate',
                        task.status === 'completed'
                          ? 'line-through text-muted-foreground'
                          : 'text-foreground',
                      )}
                      title={task.title}
                    >
                      {task.title}
                    </p>
                    <p className="text-[10px] text-muted-foreground/70 truncate" title={task.goalTitle}>
                      {task.goalTitle}
                    </p>
                  </button>
                  <div className="shrink-0">
                    <TaskStatusSelector
                      currentStatus={task.status}
                      onStatusChange={(s) => void handleStatusChange(task, s)}
                    />
                  </div>
                </li>
              ))}
            </ul>
            {hidden > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setExpanded((p) => ({ ...p, [status]: !isOpen }))}
                className="h-6 px-2 text-[10px] text-muted-foreground hover:text-foreground"
              >
                {isOpen ? 'Show less' : `Show ${hidden} more`}
              </Button>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default PanelTaskBoard;

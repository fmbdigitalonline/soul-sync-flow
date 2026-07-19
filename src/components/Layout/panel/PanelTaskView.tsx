/**
 * PanelTaskView — task detail inside the Coach side panel.
 *
 * Starts from real generated task data only. It does not fabricate working
 * instructions; when the user wants guidance, it explicitly hands off to the
 * Twin through the existing conversation bridge.
 */

import React, { useState } from 'react';
import { ArrowLeft, Clock, MessageCircle, Zap, ListChecks } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { PanelTaskCoachDock } from './PanelTaskCoachDock';
import { TaskStatusSelector } from '@/components/task/TaskStatusSelector';
import { useTaskBoard, type BoardTaskStatus } from '@/hooks/use-task-board';
import { toast } from 'sonner';

interface PanelTaskViewProps {
  task: any;
  goalId?: string;
  goalTitle?: string;
  onBack: () => void;
}

const MAX_ITEMS = 3;

export const PanelTaskView: React.FC<PanelTaskViewProps> = ({
  task,
  goalId,
  goalTitle,
  onBack,
}) => {
  const [showAllPrerequisites, setShowAllPrerequisites] = useState(false);
  // Status machine (Wave 1): live status from the board so changes made
  // here or on the board stay in sync; writes go through the one path.
  const { tasks: boardTasks, updateTaskStatus } = useTaskBoard();
  const boardTask = boardTasks.find(
    (t) => t.id === String(task?.id ?? '') && (!goalId || t.goalId === goalId),
  );
  const currentStatus: BoardTaskStatus = boardTask?.status
    ?? (task?.completed ? 'completed' : ((task?.status as BoardTaskStatus) || 'todo'));
  const handleStatusChange = async (status: BoardTaskStatus) => {
    const gid = goalId ?? boardTask?.goalId;
    if (!gid || !task?.id) {
      toast.error('This task is not linked to a program yet.');
      return;
    }
    const res = await updateTaskStatus(gid, String(task.id), status);
    if (res?.success === false) toast.error('Could not update the task status.');
  };
  const prerequisites = Array.isArray(task?.prerequisites) ? task.prerequisites : [];
  const visiblePrerequisites = showAllPrerequisites
    ? prerequisites
    : prerequisites.slice(0, MAX_ITEMS);
  const hiddenPrerequisites = Math.max(0, prerequisites.length - MAX_ITEMS);

  return (
    <div className="space-y-3">
      <Button
        variant="ghost"
        size="sm"
        onClick={onBack}
        className="h-7 px-2 text-[11px] text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="mr-1 h-3.5 w-3.5" />
        Back to actions
      </Button>

      <Card className="p-3 border-primary/30 bg-primary/5">
        <div className="space-y-2">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-primary/80">
              Active Task
            </p>
            <p className="text-sm font-medium text-foreground mt-0.5 leading-snug">
              {task?.title ?? 'Untitled task'}
            </p>
            {goalTitle && (
              <p className="text-[11px] text-muted-foreground mt-0.5 truncate" title={goalTitle}>
                {goalTitle}
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-1.5">
            {task?.estimated_duration && (
              <Badge variant="outline" className="text-[10px] gap-1">
                <Clock className="h-3 w-3" />
                {task.estimated_duration}
              </Badge>
            )}
            {task?.energy_level_required && (
              <Badge variant="outline" className="text-[10px] gap-1">
                <Zap className="h-3 w-3" />
                {task.energy_level_required} energy
              </Badge>
            )}
            {task?.category && (
              <Badge variant="secondary" className="text-[10px]">
                {task.category}
              </Badge>
            )}
          </div>

          {/* Status machine — one tap, same write path as the kanban */}
          <div className="flex items-center justify-between gap-2 pt-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Status
            </span>
            <TaskStatusSelector currentStatus={currentStatus} onStatusChange={(s) => void handleStatusChange(s)} />
          </div>
        </div>
      </Card>

      {task?.description && (
        <section className="space-y-1.5">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Task Brief
          </p>
          <p className="text-xs text-foreground leading-relaxed rounded-md bg-muted/30 px-3 py-2">
            {task.description}
          </p>
        </section>
      )}

      {task?.blueprint_reasoning && (
        <section className="space-y-1.5">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Why this fits
          </p>
          <p className="text-xs text-foreground leading-relaxed rounded-md bg-primary/5 px-3 py-2 border border-primary/15">
            {task.blueprint_reasoning}
          </p>
        </section>
      )}

      {prerequisites.length > 0 && (
        <section className="space-y-1.5">
          <div className="flex items-center gap-1.5">
            <ListChecks className="h-3.5 w-3.5 text-primary" />
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Before you start
            </span>
          </div>
          <ul className="space-y-1">
            {visiblePrerequisites.map((item: string, index: number) => (
              <li key={`${item}-${index}`} className="text-xs text-foreground rounded-md bg-muted/30 px-3 py-1.5">
                {item}
              </li>
            ))}
          </ul>
          {hiddenPrerequisites > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAllPrerequisites((v) => !v)}
              className="h-6 px-2 text-[10px] text-muted-foreground hover:text-foreground"
            >
              {showAllPrerequisites ? 'Show less' : `Show ${hiddenPrerequisites} more`}
            </Button>
          )}
        </section>
      )}

      {/* Wave 1: the TASK-AWARE coach (was mis-wired to the program-aware
          engine) — with session persistence shared with the Dreams task
          coach and the built quick-action chips. */}
      <PanelTaskCoachDock task={task} goalId={goalId ?? boardTask?.goalId} />
    </div>
  );
};

export default PanelTaskView;
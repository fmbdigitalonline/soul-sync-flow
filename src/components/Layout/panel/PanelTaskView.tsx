/**
 * PanelTaskView — task detail inside the Coach side panel.
 *
 * Starts from real generated task data only. It does not fabricate working
 * instructions; when the user wants guidance, it explicitly hands off to the
 * Twin through the existing conversation bridge.
 */

import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Clock, Zap, ListChecks, Wand2, LifeBuoy } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { PanelTaskCoachDock } from './PanelTaskCoachDock';
import { TaskStatusSelector } from '@/components/task/TaskStatusSelector';
import { useTaskBoard, type BoardTaskStatus } from '@/hooks/use-task-board';
import { SubTaskManager } from '@/components/task/SubTaskManager';
import { SessionProgress } from '@/components/task/SessionProgress';
import { JourneyAgenticTools } from '@/services/journey-agentic-tools';
import { useBlueprintCache } from '@/contexts/BlueprintCacheContext';
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

  // ── Wave 1 round 2: subtasks (durable), session progress, and the
  // never-called agentic engines surfaced honestly. ──
  const { blueprintData } = useBlueprintCache();
  const { updateTaskSubtasks } = useTaskBoard();
  const effectiveGoalId = goalId ?? boardTask?.goalId;

  const subTasks: any[] = useMemo(() => {
    const raw = boardTask?.raw?.sub_tasks ?? task?.sub_tasks;
    return Array.isArray(raw) ? raw : [];
  }, [boardTask?.raw?.sub_tasks, task?.sub_tasks]);

  const persistSubtasks = async (next: any[]) => {
    if (!effectiveGoalId || !task?.id) {
      toast.error('This task is not linked to a program yet.');
      return;
    }
    const res = await updateTaskSubtasks(effectiveGoalId, String(task.id), next);
    if (res?.success === false) toast.error('Could not save subtasks.');
  };

  const handleSubTaskComplete = (subTaskId: string) => {
    void persistSubtasks(
      subTasks.map((st) => (String(st.id) === subTaskId ? { ...st, completed: !st.completed } : st)),
    );
  };
  const handleSubTaskAdd = (title: string, metadata?: any) => {
    void persistSubtasks([
      ...subTasks,
      { id: `st_${Date.now()}`, title, completed: false, order: subTasks.length, metadata },
    ]);
  };
  const handleAllSubTasksComplete = async () => {
    const ritual = await JourneyAgenticTools.generateCelebrationRitual(
      { title: task?.title ?? 'this task' },
      null,
    );
    toast.success(ritual.split('\n')[0], { duration: 5000 });
  };

  const taskProgress = subTasks.length > 0
    ? Math.round((subTasks.filter((st) => st.completed).length / subTasks.length) * 100)
    : currentStatus === 'completed' ? 100 : 0;

  // Focus time: minutes with this task open (session-local, honest label).
  const [focusTime, setFocusTime] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setFocusTime((v) => v + 1), 60000);
    return () => clearInterval(t);
  }, [task?.id]);

  // "Prepare this task" — the built generateTaskAssistant engine
  // (blueprint-based path; hermetic typed shape pending upstream fix).
  const [assistant, setAssistant] = useState<null | {
    checklistSteps: string[]; anticipatedBlockers: string[];
    motivationalFraming: string; timeOptimization: string;
  }>(null);
  const [preparing, setPreparing] = useState(false);
  const handlePrepare = async () => {
    setPreparing(true);
    try {
      const res = await JourneyAgenticTools.generateTaskAssistant(task, null, blueprintData);
      setAssistant(res);
    } catch (e) {
      console.error('Task assistant failed:', e);
      toast.error('Could not prepare the task right now.');
    } finally {
      setPreparing(false);
    }
  };
  const adoptChecklistAsSubtasks = () => {
    if (!assistant) return;
    void persistSubtasks([
      ...subTasks,
      ...assistant.checklistSteps.map((step, i) => ({
        id: `st_${Date.now()}_${i}`,
        title: step,
        completed: false,
        order: subTasks.length + i,
        metadata: { source: 'task_assistant' },
      })),
    ]);
    setAssistant(null);
    toast.success('Checklist added as subtasks.');
  };

  // Obstacle navigator surfaces when the task is STUCK — deterministic,
  // honest fallback content when hermetic typed data is absent.
  const obstacleHelp = useMemo(
    () => (currentStatus === 'stuck' ? JourneyAgenticTools.generateObstacleNavigator(task, null) : null),
    [currentStatus, task?.id],
  );

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

      {/* Session progress — focus time, duration, energy, subtask % */}
      <SessionProgress
        focusTime={focusTime}
        estimatedDuration={task?.estimated_duration ?? '30 min'}
        energyLevel={task?.energy_level_required ?? 'medium'}
        taskProgress={taskProgress}
      />

      {/* Stuck? The obstacle navigator appears exactly when needed. */}
      {obstacleHelp && (
        <Card className="p-3 border-amber-400/40 bg-amber-500/5 space-y-1.5">
          <div className="flex items-center gap-1.5">
            <LifeBuoy className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Getting unstuck
            </span>
          </div>
          <ul className="space-y-1">
            {obstacleHelp.personalizedStrategies.slice(0, 3).map((strategy, i) => (
              <li key={i} className="text-xs text-foreground rounded-md bg-background/60 px-2.5 py-1.5">
                {strategy}
              </li>
            ))}
          </ul>
          <p className="text-[11px] text-muted-foreground italic">{obstacleHelp.recoveryProtocol}</p>
        </Card>
      )}

      {/* Subtasks — durable via the same write path as status */}
      {subTasks.length > 0 && (
        <SubTaskManager
          taskTitle={task?.title ?? 'Task'}
          subTasks={subTasks}
          onSubTaskComplete={handleSubTaskComplete}
          onSubTaskAdd={handleSubTaskAdd}
          onAllComplete={() => void handleAllSubTasksComplete()}
        />
      )}

      {/* Prepare — the built task-assistant engine, surfaced */}
      {subTasks.length === 0 && !assistant && (
        <Button
          variant="outline"
          size="sm"
          className="w-full h-8 text-xs"
          disabled={preparing}
          onClick={() => void handlePrepare()}
        >
          <Wand2 className="h-3.5 w-3.5 mr-1.5" />
          {preparing ? 'Preparing…' : 'Prepare this task'}
        </Button>
      )}
      {assistant && (
        <Card className="p-3 border-primary/20 bg-primary/5 space-y-2">
          <p className="text-xs text-foreground italic">{assistant.motivationalFraming}</p>
          <ul className="space-y-1">
            {assistant.checklistSteps.map((step, i) => (
              <li key={i} className="text-xs text-foreground rounded-md bg-background/60 px-2.5 py-1.5">
                {i + 1}. {step}
              </li>
            ))}
          </ul>
          <p className="text-[11px] text-muted-foreground">{assistant.timeOptimization}</p>
          <div className="flex gap-2">
            <Button size="sm" className="h-7 flex-1 text-xs" onClick={adoptChecklistAsSubtasks}>
              Add as subtasks
            </Button>
            <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setAssistant(null)}>
              Dismiss
            </Button>
          </div>
        </Card>
      )}

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
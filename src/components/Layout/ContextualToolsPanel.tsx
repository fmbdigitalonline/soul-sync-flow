import React, { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Sparkles,
  Target,
  Clock,
  Zap,
  NotebookPen,
  Mic,
  FileDown,
  Cloud,
  CalendarClock,
  ShieldCheck,
  TimerReset,
  Play,
  Pause,
  ListTodo,
  Plus
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ContextualToolsPanelProps {
  context?: 'journey' | 'task-coach' | 'focus' | 'tasks' | 'milestones' | 'hub' | 'chat' | 'create';
  activeGoal?: any;
  focusedMilestone?: any;
  selectedTask?: any;
  className?: string;
}

export const ContextualToolsPanel: React.FC<ContextualToolsPanelProps> = ({
  context,
  activeGoal,
  focusedMilestone,
  selectedTask,
  className
}) => {
  const location = useLocation();

  // Auto-detect context from route if not provided
  const detectedContext = context || detectContextFromRoute(location.pathname);

  return (
    <div className={cn("h-full p-6 space-y-6", className)}>
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-subheading font-semibold text-foreground">
            Tools & Insights
          </h3>
          <Badge variant="outline" className="text-xs">
            {detectedContext}
          </Badge>
        </div>
        <p className="text-caption text-muted-foreground">
          Context-aware assistance for your current view
        </p>
      </div>

      {/* Context-specific tools */}
      {renderToolsForContext(detectedContext, { activeGoal, focusedMilestone, selectedTask })}
    </div>
  );
};

// Helper: Detect context from route
function detectContextFromRoute(pathname: string): string {
  if (pathname.includes('/journey')) return 'journey';
  if (pathname.includes('/tasks')) return 'tasks';
  if (pathname.includes('/focus')) return 'focus';
  if (pathname.includes('/habits')) return 'habits';
  if (pathname.includes('/discover') || pathname.includes('/chat')) return 'chat';
  if (pathname.includes('/create')) return 'create';
  if (pathname.includes('/coach')) return 'task-coach';
  return 'hub';
}

// Helper: Render tools based on context (Principle #2: No Hardcoded Data)
function renderToolsForContext(
  context: string,
  data: { activeGoal?: any; focusedMilestone?: any; selectedTask?: any }
) {
  switch (context) {
    case 'journey':
      return <JourneyTools activeGoal={data.activeGoal} />;
    
    case 'task-coach':
      return <TaskCoachTools selectedTask={data.selectedTask} />;
    
    case 'focus':
      return <FocusTools focusedMilestone={data.focusedMilestone} />;
    
    case 'tasks':
      return <TasksTools />;
    
    case 'chat':
      return <DiscoveryTools />;
    
    case 'create':
      return <CreateTools />;
    
    case 'hub':
    default:
      return <HubTools />;
  }
}

// Context-specific tool widgets
function JourneyTools({ activeGoal }: { activeGoal?: any }) {
  const [activeModule, setActiveModule] = useState<'workspace' | 'agenda' | 'actions' | 'progress' | 'insights'>('workspace');
  const [workspaceNotes, setWorkspaceNotes] = useState<string[]>(() => {
    if (typeof window === 'undefined') {
      return [];
    }
    try {
      const stored = window.localStorage.getItem('journey-workspace-notes');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to parse journey workspace notes', error);
      return [];
    }
  });
  const [noteDraft, setNoteDraft] = useState('');
  const [agendaItems, setAgendaItems] = useState<
    Array<{ id: string; text: string; scheduledFor: string; locked: boolean; completed: boolean }>
  >(() => {
    if (typeof window === 'undefined') {
      return [];
    }
    try {
      const stored = window.localStorage.getItem('journey-agenda-items');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to parse journey agenda items', error);
      return [];
    }
  });
  const [agendaInput, setAgendaInput] = useState('');
  const [agendaTime, setAgendaTime] = useState('');
  const [lockAgendaBlock, setLockAgendaBlock] = useState(false);
  const [focusTimer, setFocusTimer] = useState<{ isRunning: boolean; elapsed: number; duration: number }>(() => {
    const defaultTimer = { isRunning: false, elapsed: 0, duration: 25 * 60 };
    if (typeof window === 'undefined') {
      return defaultTimer;
    }
    try {
      const stored = window.localStorage.getItem('journey-focus-timer');
      return stored ? { ...defaultTimer, ...JSON.parse(stored) } : defaultTimer;
    } catch (error) {
      console.error('Failed to parse journey focus timer', error);
      return defaultTimer;
    }
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem('journey-workspace-notes', JSON.stringify(workspaceNotes));
  }, [workspaceNotes]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem('journey-agenda-items', JSON.stringify(agendaItems));
  }, [agendaItems]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem('journey-focus-timer', JSON.stringify(focusTimer));
  }, [focusTimer]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!focusTimer.isRunning) return;

    const interval = window.setInterval(() => {
      setFocusTimer(prev => {
        const nextElapsed = Math.min(prev.duration, prev.elapsed + 1);
        if (nextElapsed >= prev.duration) {
          return { ...prev, elapsed: nextElapsed, isRunning: false };
        }
        return { ...prev, elapsed: nextElapsed };
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [focusTimer.isRunning, focusTimer.duration]);

  const completedMilestones = activeGoal?.completedMilestones ?? 0;
  const totalMilestones = activeGoal?.totalMilestones ?? 0;
  const milestoneProgress = totalMilestones
    ? Math.min(100, (completedMilestones / totalMilestones) * 100)
    : 0;

  const completedTasks = activeGoal?.completedTasks ?? 0;
  const totalTasks = activeGoal?.totalTasks ?? 0;
  const taskProgress = totalTasks
    ? Math.min(100, (completedTasks / totalTasks) * 100)
    : 0;

  const timeSpent = activeGoal?.timeSpent ?? 0;
  const scheduledTime = activeGoal?.scheduledTime ?? 0;
  const timeAllocation = scheduledTime
    ? Math.min(100, (timeSpent / scheduledTime) * 100)
    : 0;

  const activeStreak = activeGoal?.focusStreak ?? 0;

  const pendingAgendaCount = agendaItems.filter(item => !item.completed).length;
  const remainingSeconds = Math.max(0, focusTimer.duration - focusTimer.elapsed);

  const formattedTimer = `${String(Math.floor(remainingSeconds / 60)).padStart(2, '0')}:${String(
    remainingSeconds % 60
  ).padStart(2, '0')}`;

  const insights = useMemo(() => {
    const archetype = activeGoal?.personalityProfile?.archetype;
    const guidanceSource = archetype ? `${archetype} archetype` : 'personal blueprint';

    const baseInsights = [
      {
        id: 'flow',
        title: 'Sustain your flow state',
        body:
          'Use micro-reflections after each work session to capture emotional and energetic shifts. This keeps the AI workspace attuned to your current momentum.'
      },
      {
        id: 'alignment',
        title: 'Re-align with your vision',
        body: `Review your blueprint insights at the start of each week and adjust your agenda blocks to reflect emerging priorities from your ${guidanceSource}.`
      },
      {
        id: 'celebrate',
        title: 'Celebrate micro-wins',
        body:
          'When the progress module shows milestone momentum, share a quick gratitude note in the workspace to reinforce motivation.'
      }
    ];

    if (activeStreak >= 3) {
      baseInsights.unshift({
        id: 'streak',
        title: 'Channel your streak',
        body: 'Your recent focus streak is a signal to tackle a bold task. Reserve a locked agenda block to protect that momentum.'
      });
    }

    return baseInsights;
  }, [activeGoal?.personalityProfile?.archetype, activeStreak]);

  const modules = useMemo(
    () => [
      {
        id: 'workspace' as const,
        label: 'Workspace',
        icon: NotebookPen,
        badge: workspaceNotes.length ? `${workspaceNotes.length}` : undefined,
        description: 'Capture AI output and notes.'
      },
      {
        id: 'agenda' as const,
        label: 'Agenda',
        icon: CalendarClock,
        badge: pendingAgendaCount ? `${pendingAgendaCount}` : undefined,
        description: 'Schedule and lock focus blocks.'
      },
      {
        id: 'actions' as const,
        label: 'Quick Actions',
        icon: Zap,
        badge: focusTimer.isRunning ? formattedTimer : undefined,
        description: 'Launch timers and shortcuts.'
      },
      {
        id: 'progress' as const,
        label: 'Progress',
        icon: Target,
        badge: totalMilestones ? `${Math.round(milestoneProgress)}%` : undefined,
        description: 'Track milestone momentum.'
      },
      {
        id: 'insights' as const,
        label: 'Insights',
        icon: Sparkles,
        badge: insights.length ? `${insights.length}` : undefined,
        description: 'Blueprint-aligned guidance.'
      }
    ], [workspaceNotes.length, pendingAgendaCount, focusTimer.isRunning, formattedTimer, totalMilestones, milestoneProgress, insights.length]);

  const addWorkspaceNote = () => {
    if (!noteDraft.trim()) return;
    setWorkspaceNotes(prev => [noteDraft.trim(), ...prev]);
    setNoteDraft('');
  };

  const handleAddAgendaItem = () => {
    if (!agendaInput.trim()) return;

    const item = {
      id: `agenda-${Date.now()}`,
      text: agendaInput.trim(),
      scheduledFor: agendaTime || 'Next available block',
      locked: lockAgendaBlock,
      completed: false
    };

    setAgendaItems(prev => [item, ...prev]);
    setAgendaInput('');
    setAgendaTime('');
    setLockAgendaBlock(false);
  };

  const toggleAgendaCompletion = (id: string) => {
    setAgendaItems(prev =>
      prev.map(item =>
        item.id === id
          ? {
              ...item,
              completed: !item.completed
            }
          : item
      )
    );
  };

  const importGoalTasksToAgenda = () => {
    const goalTasks: Array<{ id?: string; title?: string }> = Array.isArray(activeGoal?.tasks)
      ? activeGoal.tasks
      : [];

    if (!goalTasks.length) return;

    setAgendaItems(prev => {
      const existingIds = new Set(prev.map(item => item.id));
      const imported = goalTasks.slice(0, 3).map((task, index) => ({
        id: `goal-${task.id ?? index}`,
        text: task.title ?? `Goal task ${index + 1}`,
        scheduledFor: 'Goal alignment',
        locked: true,
        completed: false
      }));

      const newItems = imported.filter(item => !existingIds.has(item.id));
      return [...newItems, ...prev];
    });
  };

  const updateFocusDuration = (minutes: number) => {
    setFocusTimer(prev => ({ ...prev, duration: minutes * 60, elapsed: 0, isRunning: false }));
  };

  const toggleFocusTimer = () => {
    setFocusTimer(prev => ({ ...prev, isRunning: !prev.isRunning }));
  };

  const resetFocusTimer = () => {
    setFocusTimer(prev => ({ ...prev, elapsed: 0, isRunning: false }));
  };

  const activeGoalTitle = activeGoal?.title || 'Active Journey Goal';

  return (
    <div className="space-y-4">
      <Card className="p-4 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h4 className="text-sm font-semibold text-foreground">Journey contextual tools</h4>
            <p className="text-xs text-muted-foreground">Switch between live modules to support your current flow.</p>
          </div>
          <Badge variant="outline" className="rounded-full px-2 py-0 text-[10px] uppercase tracking-wide">
            {activeModule}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
          {modules.map(module => {
            const Icon = module.icon;
            const isActive = activeModule === module.id;
            return (
              <button
                key={module.id}
                type="button"
                onClick={() => setActiveModule(module.id)}
                className={cn(
                  'group relative flex h-full flex-col items-start gap-2 rounded-lg border p-3 text-left transition-colors',
                  isActive
                    ? 'border-primary bg-primary/10 text-primary shadow-sm'
                    : 'border-transparent bg-muted/60 text-muted-foreground hover:border-border hover:bg-background'
                )}
              >
                <div className="flex w-full items-center justify-between">
                  <div className={cn('rounded-md p-1.5', isActive ? 'bg-primary text-primary-foreground' : 'bg-background')}>
                    <Icon className="h-4 w-4" />
                  </div>
                  {module.badge ? (
                    <Badge className="ml-auto rounded-full bg-background text-[10px] font-semibold uppercase tracking-wide">
                      {module.badge}
                    </Badge>
                  ) : null}
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-semibold leading-none text-foreground">
                    {module.label}
                  </span>
                  <p className="text-[11px] leading-tight text-muted-foreground">{module.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      </Card>

      {activeModule === 'workspace' ? (
        <Card className="space-y-4 p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <NotebookPen className="h-4 w-4 text-primary" />
              <div>
                <h4 className="text-sm font-semibold text-foreground">AI workspace</h4>
                <p className="text-xs text-muted-foreground">Capture and export insights while you iterate.</p>
              </div>
            </div>
            {workspaceNotes.length ? (
              <Badge variant="secondary" className="rounded-full text-[10px] uppercase tracking-wide">
                {workspaceNotes.length} notes saved
              </Badge>
            ) : null}
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-foreground" htmlFor="workspace-note">
              Note capture
            </label>
            <textarea
              id="workspace-note"
              value={noteDraft}
              onChange={event => setNoteDraft(event.target.value)}
              placeholder="Capture your latest download, AI output, or voice transcription..."
              className="min-h-[90px] w-full rounded-md border border-border bg-background px-3 py-2 text-xs outline-none focus:border-primary"
            />
            <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted-foreground">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={addWorkspaceNote}
                  className="inline-flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Save to workspace
                </button>
                <span className="inline-flex items-center gap-1 rounded-md border border-dashed border-primary/40 px-2 py-1 text-[10px] text-primary">
                  <Mic className="h-3 w-3" />
                  Voice ready
                </span>
              </div>
              <span>Autosaves locally for continuity.</span>
            </div>
          </div>

          {workspaceNotes.length ? (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-foreground">Recent notes</p>
              <div className="space-y-2">
                {workspaceNotes.map((note, index) => (
                  <div
                    key={`${note}-${index}`}
                    className="rounded-md border border-border/60 bg-muted/40 p-3 text-xs text-muted-foreground"
                  >
                    {note}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">
              Your saved notes and AI co-creations will appear here for quick reference and export.
            </p>
          )}

          <div className="grid gap-2 sm:grid-cols-2">
            <div className="flex items-start gap-3 rounded-lg border border-border/60 bg-background/70 p-3">
              <FileDown className="mt-0.5 h-4 w-4 text-primary" />
              <div className="space-y-1">
                <p className="text-xs font-semibold text-foreground">Flexible exports</p>
                <p className="text-[11px] leading-tight text-muted-foreground">
                  Download notes in TXT, PDF, DOCX, or Markdown to move insights wherever you work.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-lg border border-border/60 bg-background/70 p-3">
              <Cloud className="mt-0.5 h-4 w-4 text-primary" />
              <div className="space-y-1">
                <p className="text-xs font-semibold text-foreground">Cross-platform syncing</p>
                <p className="text-[11px] leading-tight text-muted-foreground">
                  Stay in sync across desktop and mobile so your workspace context travels with you.
                </p>
              </div>
            </div>
          </div>
        </Card>
      ) : null}

      {activeModule === 'agenda' ? (
        <Card className="space-y-4 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <CalendarClock className="h-4 w-4 text-secondary" />
              <div>
                <h4 className="text-sm font-semibold text-foreground">Adaptive agenda</h4>
                <p className="text-xs text-muted-foreground">Lock deep work blocks and queue goal-aligned tasks.</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={importGoalTasksToAgenda}
                className="inline-flex items-center gap-1 rounded-md border border-dashed border-secondary px-3 py-1.5 text-[11px] font-medium text-secondary transition-colors hover:bg-secondary/10"
              >
                <ListTodo className="h-3.5 w-3.5" />
                Import goal tasks
              </button>
              {pendingAgendaCount ? (
                <Badge variant="secondary" className="rounded-full text-[10px] uppercase tracking-wide">
                  {pendingAgendaCount} open
                </Badge>
              ) : null}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto]">
            <input
              type="text"
              value={agendaInput}
              onChange={event => setAgendaInput(event.target.value)}
              placeholder="Add an agenda item or intention"
              className="rounded-md border border-border bg-background px-3 py-2 text-xs outline-none focus:border-primary"
            />
            <input
              type="time"
              value={agendaTime}
              onChange={event => setAgendaTime(event.target.value)}
              className="rounded-md border border-border bg-background px-3 py-2 text-xs text-muted-foreground outline-none focus:border-primary"
            />
            <label className="flex items-center gap-2 rounded-md border border-dashed border-border px-3 py-2 text-[11px] text-muted-foreground">
              <input
                type="checkbox"
                checked={lockAgendaBlock}
                onChange={event => setLockAgendaBlock(event.target.checked)}
                className="h-3.5 w-3.5 rounded border-border text-primary focus:ring-primary"
              />
              Lock focus block
            </label>
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleAddAgendaItem}
              className="inline-flex items-center gap-2 rounded-md bg-secondary px-4 py-1.5 text-xs font-semibold text-secondary-foreground transition-colors hover:bg-secondary/90"
            >
              <Plus className="h-3.5 w-3.5" />
              Add to agenda
            </button>
          </div>

          {agendaItems.length ? (
            <div className="space-y-2">
              {agendaItems.map(item => (
                <div
                  key={item.id}
                  className={cn(
                    'flex flex-col gap-2 rounded-lg border border-border/60 bg-muted/40 p-3 text-xs transition-colors sm:flex-row sm:items-center sm:justify-between',
                    item.completed ? 'opacity-70' : ''
                  )}
                >
                  <div className="space-y-1">
                    <p className={cn('font-medium text-foreground', item.completed ? 'line-through' : undefined)}>
                      {item.text}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                      <span className="inline-flex items-center gap-1 rounded-md bg-background px-2 py-1">
                        <Clock className="h-3 w-3" />
                        {item.scheduledFor}
                      </span>
                      {item.locked ? (
                        <span className="inline-flex items-center gap-1 rounded-md bg-secondary/10 px-2 py-1 text-secondary">
                          <ShieldCheck className="h-3 w-3" />
                          Locked
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleAgendaCompletion(item.id)}
                    className={cn(
                      'inline-flex items-center gap-1 self-start rounded-md px-3 py-1.5 text-[11px] font-semibold transition-colors sm:self-auto',
                      item.completed
                        ? 'bg-muted text-muted-foreground hover:bg-muted/80'
                        : 'bg-primary text-primary-foreground hover:bg-primary/90'
                    )}
                  >
                    {item.completed ? 'Completed' : 'Mark done'}
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">
              Build a living schedule that reflects your goals. Locked blocks help guard your peak focus time.
            </p>
          )}
        </Card>
      ) : null}

      {activeModule === 'actions' ? (
        <Card className="space-y-4 p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              <div>
                <h4 className="text-sm font-semibold text-foreground">Quick actions</h4>
                <p className="text-xs text-muted-foreground">Launch focus mode, log progress, or jump to key areas.</p>
              </div>
            </div>
            <Badge variant="outline" className="rounded-full text-[10px] uppercase tracking-wide">
              {formattedTimer}
            </Badge>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2 rounded-lg border border-border/60 bg-muted/40 p-3">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Focus timer</span>
                <span>{focusTimer.isRunning ? 'In progress' : 'Paused'}</span>
              </div>
              <div className="flex items-baseline justify-between">
                <p className="text-2xl font-semibold text-foreground">{formattedTimer}</p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={toggleFocusTimer}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    {focusTimer.isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </button>
                  <button
                    type="button"
                    onClick={resetFocusTimer}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:bg-background"
                  >
                    <TimerReset className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                {[15, 25, 45].map(minutes => (
                  <button
                    key={minutes}
                    type="button"
                    onClick={() => updateFocusDuration(minutes)}
                    className={cn(
                      'inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 font-medium transition-colors',
                      focusTimer.duration === minutes * 60
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'hover:border-primary hover:text-primary'
                    )}
                  >
                    {minutes}m
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2 rounded-lg border border-border/60 bg-background p-3 text-xs">
              <p className="font-semibold text-foreground">{activeGoalTitle}</p>
              <div className="space-y-2 text-muted-foreground">
                <button className="w-full rounded-md bg-primary/10 px-3 py-2 text-left font-medium text-primary transition-colors hover:bg-primary/20">
                  Review journey timeline
                </button>
                <button className="w-full rounded-md bg-secondary/10 px-3 py-2 text-left font-medium text-secondary transition-colors hover:bg-secondary/20">
                  Log a progress note
                </button>
                <button className="w-full rounded-md bg-accent/10 px-3 py-2 text-left font-medium text-accent-foreground transition-colors hover:bg-accent/20">
                  Open deep focus mode
                </button>
              </div>
              <p className="text-[11px] leading-tight text-muted-foreground">
                These shortcuts adapt as your goal evolves so you can move instantly from insight to action.
              </p>
            </div>
          </div>
        </Card>
      ) : null}

      {activeModule === 'progress' ? (
        <Card className="space-y-4 p-4">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-secondary" />
            <div>
              <h4 className="text-sm font-semibold text-foreground">Progress overview</h4>
              <p className="text-xs text-muted-foreground">Monitor milestone momentum and time investment.</p>
            </div>
          </div>

          {activeGoal ? (
            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Milestones</span>
                  <span className="font-medium text-foreground">
                    {completedMilestones}/{totalMilestones}
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-muted">
                  <div className="h-1.5 rounded-full bg-primary" style={{ width: `${milestoneProgress}%` }} />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tasks</span>
                  <span className="font-medium text-foreground">
                    {completedTasks}/{totalTasks}
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-muted">
                  <div className="h-1.5 rounded-full bg-secondary" style={{ width: `${taskProgress}%` }} />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Time spent vs. scheduled</span>
                  <span className="font-medium text-foreground">
                    {timeSpent}h / {scheduledTime}h
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-muted">
                  <div className="h-1.5 rounded-full bg-primary/70" style={{ width: `${timeAllocation}%` }} />
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <div className="flex-1 rounded-md bg-muted/40 px-3 py-2">
                  <span className="text-[11px] text-muted-foreground">Recent streak</span>
                  <p className="text-sm font-semibold text-foreground">{activeStreak} days</p>
                </div>
                <div className="flex-1 rounded-md bg-muted/40 px-3 py-2">
                  <span className="text-[11px] text-muted-foreground">Focus allocation</span>
                  <p className="text-sm font-semibold text-foreground">{Math.round(timeAllocation)}%</p>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">
              Select a journey goal to unlock live progress analytics and completion metrics.
            </p>
          )}
        </Card>
      ) : null}

      {activeModule === 'insights' ? (
        <Card className="space-y-4 p-4 bg-gradient-to-br from-primary/5 to-secondary/5">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <div>
              <h4 className="text-sm font-semibold text-foreground">Blueprint insights</h4>
              <p className="text-xs text-muted-foreground">Personality-aligned prompts to guide your next move.</p>
            </div>
          </div>

          <div className="space-y-3">
            {insights.map(insight => (
              <div key={insight.id} className="space-y-1 rounded-lg border border-border/40 bg-background/70 p-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-foreground">{insight.title}</p>
                  <Badge variant="outline" className="rounded-full text-[10px] uppercase tracking-wide">
                    Insight
                  </Badge>
                </div>
                <p className="text-[11px] leading-tight text-muted-foreground">{insight.body}</p>
              </div>
            ))}
          </div>

          <p className="text-[11px] text-muted-foreground">
            Rotate through modules as needed—your selections persist so you can jump back into the right context instantly.
          </p>
        </Card>
      ) : null}
    </div>
  );
}

function TaskCoachTools({ selectedTask }: { selectedTask?: any }) {
  return (
    <div className="space-y-4">
      <Card className="p-4 space-y-3">
        <div className="flex items-center space-x-2">
          <Clock className="h-4 w-4 text-primary" />
          <h4 className="font-semibold text-sm">Current Task</h4>
        </div>
        {selectedTask ? (
          <div className="space-y-2">
            <p className="text-xs font-medium">{selectedTask.title}</p>
            <p className="text-xs text-muted-foreground">
              {selectedTask.description || 'No description'}
            </p>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">
            No task selected
          </p>
        )}
      </Card>

      <Card className="p-4 space-y-3">
        <h4 className="font-semibold text-sm">Task Notes</h4>
        <p className="text-xs text-muted-foreground">
          Quick notes and reminders will appear here
        </p>
      </Card>
    </div>
  );
}

function FocusTools({ focusedMilestone }: { focusedMilestone?: any }) {
  return (
    <div className="space-y-4">
      <Card className="p-4 space-y-3">
        <div className="flex items-center space-x-2">
          <Target className="h-4 w-4 text-secondary" />
          <h4 className="font-semibold text-sm">Current Milestone</h4>
        </div>
        {focusedMilestone ? (
          <div className="space-y-2">
            <p className="text-xs font-medium">{focusedMilestone.title}</p>
            <p className="text-xs text-muted-foreground">
              {focusedMilestone.description || 'No description'}
            </p>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">
            No milestone in focus
          </p>
        )}
      </Card>
    </div>
  );
}

function TasksTools() {
  return (
    <div className="space-y-4">
      <Card className="p-4 space-y-3">
        <h4 className="font-semibold text-sm">Task Filters</h4>
        <p className="text-xs text-muted-foreground">
          Filter and sort options will appear here
        </p>
      </Card>
    </div>
  );
}

function DiscoveryTools() {
  return (
    <div className="space-y-4">
      <Card className="p-4 space-y-3 bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="flex items-center space-x-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <h4 className="font-semibold text-sm">Discovery Tips</h4>
        </div>
        <p className="text-xs text-muted-foreground">
          Tips for dream discovery conversations will appear here
        </p>
      </Card>
    </div>
  );
}

function CreateTools() {
  return (
    <div className="space-y-4">
      <Card className="p-4 space-y-3">
        <h4 className="font-semibold text-sm">Creation Guide</h4>
        <p className="text-xs text-muted-foreground">
          Helpful hints for creating your dream will appear here
        </p>
      </Card>
    </div>
  );
}

function HubTools() {
  return (
    <div className="space-y-4">
      <Card className="p-4 space-y-3">
        <div className="flex items-center space-x-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <h4 className="font-semibold text-sm">Welcome</h4>
        </div>
        <p className="text-xs text-muted-foreground">
          Navigate to any view to see context-specific tools and insights
        </p>
      </Card>
    </div>
  );
}

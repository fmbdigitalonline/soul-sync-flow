import React, { useEffect, useMemo, useState } from 'react';
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
  Plus,
  Trash2,
  Download
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { interpolateTranslation } from '@/utils/translation-utils';

interface WorkspaceNote {
  id: string;
  content: string;
  createdAt: string;
  priority: 'low' | 'medium' | 'high';
  attachment?: {
    name: string;
    dataUrl: string;
  };
}

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
  const { t } = useLanguage();

  // Keep the Journey contextual tools available everywhere by default
  const detectedContext = context || 'journey';

  return (
    <div className={cn("h-full p-6 space-y-6", className)}>
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-subheading font-semibold text-foreground">
            {t('contextualTools.toolsAndInsights')}
          </h3>
          <Badge variant="outline" className="text-xs">
            {detectedContext}
          </Badge>
        </div>
        <p className="text-caption text-muted-foreground">
          {t('contextualTools.contextAwareAssistance')}
        </p>
      </div>

      {/* Context-specific tools */}
      {renderToolsForContext(detectedContext, { activeGoal, focusedMilestone, selectedTask })}
    </div>
  );
};

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
  const { t } = useLanguage();
  const [activeModule, setActiveModule] = useState<'workspace' | 'agenda' | 'actions' | 'progress' | 'insights'>('workspace');
  const [workspaceNotes, setWorkspaceNotes] = useState<WorkspaceNote[]>(() => {
    if (typeof window === 'undefined') {
      return [];
    }
    try {
      const stored = window.localStorage.getItem('journey-workspace-notes');
      if (!stored) return [];

      const parsed = JSON.parse(stored);
      if (!Array.isArray(parsed)) {
        return [];
      }

      const fallbackTimestamp = new Date().toISOString();
      if (parsed.every((note: unknown) => typeof note === 'string')) {
        return parsed.map((note: string, index: number) => ({
          id: `legacy-note-${index}-${Date.now()}`,
          content: note,
          createdAt: fallbackTimestamp,
          priority: 'medium'
        }));
      }

      return parsed
        .filter((note: any): note is WorkspaceNote =>
          note && typeof note === 'object' && 'content' in note
        )
        .map((note: any, index: number) => ({
          id: typeof note.id === 'string' ? note.id : `note-${Date.now()}-${index}`,
          content: typeof note.content === 'string' ? note.content : String(note.content ?? ''),
          createdAt: typeof note.createdAt === 'string' ? note.createdAt : fallbackTimestamp,
          priority: note.priority === 'low' || note.priority === 'high' ? note.priority : 'medium',
          attachment: note.attachment && typeof note.attachment === 'object'
            ? {
              name: typeof note.attachment.name === 'string' ? note.attachment.name : 'attachment',
              dataUrl: typeof note.attachment.dataUrl === 'string' ? note.attachment.dataUrl : ''
            }
            : undefined
        }));
    } catch (error) {
      console.error('Failed to parse journey workspace notes', error);
      return [];
    }
  });
  const [noteDraft, setNoteDraft] = useState('');
  const [notePriority, setNotePriority] = useState<WorkspaceNote['priority']>('medium');
  const [noteAttachment, setNoteAttachment] = useState<WorkspaceNote['attachment']>();
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
        title: t('contextualTools.sustainFlowState.title'),
        body: t('contextualTools.sustainFlowState.body')
      },
      {
        id: 'alignment',
        title: t('contextualTools.realignVision.title'),
        body: interpolateTranslation(t('contextualTools.realignVision.body'), { guidanceSource })
      },
      {
        id: 'celebrate',
        title: t('contextualTools.celebrateMicroWins.title'),
        body: t('contextualTools.celebrateMicroWins.body')
      }
    ];

    if (activeStreak >= 3) {
      baseInsights.unshift({
        id: 'streak',
        title: t('contextualTools.channelStreak.title'),
        body: t('contextualTools.channelStreak.body')
      });
    }

    return baseInsights;
  }, [activeGoal?.personalityProfile?.archetype, activeStreak, t]);

  const modules = useMemo(
    () => [
      {
        id: 'workspace' as const,
        label: t('contextualTools.workspace.label'),
        icon: NotebookPen,
        badge: workspaceNotes.length ? `${workspaceNotes.length}` : undefined,
        description: t('contextualTools.workspace.description')
      },
      {
        id: 'agenda' as const,
        label: t('contextualTools.agenda.label'),
        icon: CalendarClock,
        badge: pendingAgendaCount ? `${pendingAgendaCount}` : undefined,
        description: t('contextualTools.agenda.description')
      },
      {
        id: 'actions' as const,
        label: t('contextualTools.quickActions.label'),
        icon: Zap,
        badge: focusTimer.isRunning ? formattedTimer : undefined,
        description: t('contextualTools.quickActions.description')
      },
      {
        id: 'progress' as const,
        label: t('contextualTools.progress.label'),
        icon: Target,
        badge: totalMilestones ? `${Math.round(milestoneProgress)}%` : undefined,
        description: t('contextualTools.progress.description')
      },
      {
        id: 'insights' as const,
        label: t('contextualTools.insights.label'),
        icon: Sparkles,
        badge: insights.length ? `${insights.length}` : undefined,
        description: t('contextualTools.insights.description')
      }
    ], [workspaceNotes.length, pendingAgendaCount, focusTimer.isRunning, formattedTimer, totalMilestones, milestoneProgress, insights.length, t]);

  const addWorkspaceNote = () => {
    const trimmedNote = noteDraft.trim();
    if (!trimmedNote) return;

    const newNote: WorkspaceNote = {
      id: `note-${Date.now()}`,
      content: trimmedNote,
      createdAt: new Date().toISOString(),
      priority: notePriority,
      attachment: noteAttachment?.dataUrl ? noteAttachment : undefined
    };

    setWorkspaceNotes(prev => [newNote, ...prev]);
    setNoteDraft('');
    setNotePriority('medium');
    setNoteAttachment(undefined);
  };

  const removeWorkspaceNote = (idToRemove: string) => {
    setWorkspaceNotes(prev => prev.filter(note => note.id !== idToRemove));
  };

  const downloadWorkspaceNote = (note: WorkspaceNote) => {
    try {
      const content = [
        `${t('contextualTools.notePriority')}: ${t(
          `contextualTools.priorityOptions.${note.priority}` as const
        )}`,
        `${t('contextualTools.capturedOn')}: ${formatNoteTimestamp(note.createdAt)}`,
        '',
        note.content
      ].join('\n');

      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `workspace-note-${new Date(note.createdAt).getTime()}.txt`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download note', error);
    }
  };

  const downloadWorkspaceAttachment = (attachment?: WorkspaceNote['attachment']) => {
    if (!attachment?.dataUrl) return;

    try {
      const link = document.createElement('a');
      link.href = attachment.dataUrl;
      link.download = attachment.name || 'attachment';
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Failed to download attachment', error);
    }
  };

  const formatNoteTimestamp = (timestamp: string) => {
    try {
      return new Intl.DateTimeFormat(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short'
      }).format(new Date(timestamp));
    } catch (error) {
      return timestamp;
    }
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

  const activeGoalTitle = activeGoal?.title || t('contextualTools.activeJourneyGoal');

  return (
    <div className="space-y-4">
      <Card className="p-4 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h4 className="text-sm font-semibold text-foreground">{t('contextualTools.journeyContextualTools')}</h4>
            <p className="text-xs text-muted-foreground">{t('contextualTools.switchBetweenModules')}</p>
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
                <h4 className="text-sm font-semibold text-foreground">{t('contextualTools.aiWorkspace')}</h4>
                <p className="text-xs text-muted-foreground">{t('contextualTools.captureAndExport')}</p>
              </div>
            </div>
            {workspaceNotes.length ? (
              <Badge variant="secondary" className="rounded-full text-[10px] uppercase tracking-wide">
                {interpolateTranslation(t('contextualTools.notesSaved'), { count: workspaceNotes.length.toString() })}
              </Badge>
            ) : null}
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-foreground" htmlFor="workspace-note">
              {t('contextualTools.noteCapture')}
            </label>
            <textarea
              id="workspace-note"
              value={noteDraft}
              onChange={event => setNoteDraft(event.target.value)}
              placeholder={t('contextualTools.notePlaceholder')}
              className="min-h-[90px] w-full rounded-md border border-border bg-background px-3 py-2 text-xs outline-none focus:border-primary"
            />
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-foreground" htmlFor="workspace-priority">
                  {t('contextualTools.notePriority')}
                </label>
                <select
                  id="workspace-priority"
                  value={notePriority}
                  onChange={event => setNotePriority(event.target.value as WorkspaceNote['priority'])}
                  className="w-full rounded-md border border-border bg-background px-2 py-1 text-xs"
                >
                  <option value="low">{t('contextualTools.priorityOptions.low')}</option>
                  <option value="medium">{t('contextualTools.priorityOptions.medium')}</option>
                  <option value="high">{t('contextualTools.priorityOptions.high')}</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-foreground" htmlFor="workspace-attachment">
                  {t('contextualTools.addAttachment')}
                </label>
                <input
                  id="workspace-attachment"
                  type="file"
                  accept="image/*"
                  className="w-full text-xs"
                  onChange={event => {
                    const file = event.target.files?.[0];
                    if (!file) {
                      setNoteAttachment(undefined);
                      return;
                    }

                    const reader = new FileReader();
                    reader.onload = e => {
                      const dataUrl = e.target?.result;
                      if (typeof dataUrl === 'string') {
                        setNoteAttachment({ name: file.name, dataUrl });
                      }
                    };
                    reader.readAsDataURL(file);
                  }}
                />
                {noteAttachment?.dataUrl ? (
                  <div className="flex items-center justify-between rounded-md border border-dashed border-primary/50 bg-primary/5 px-2 py-1 text-[11px] text-foreground">
                    <span className="truncate" title={noteAttachment.name}>{noteAttachment.name}</span>
                    <button
                      type="button"
                      className="text-destructive"
                      onClick={() => setNoteAttachment(undefined)}
                    >
                      {t('contextualTools.removeAttachment')}
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted-foreground">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={addWorkspaceNote}
                  className="inline-flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  <Plus className="h-3.5 w-3.5" />
                  {t('contextualTools.saveToWorkspace')}
                </button>
                <span className="inline-flex items-center gap-1 rounded-md border border-dashed border-primary/40 px-2 py-1 text-[10px] text-primary">
                  <Mic className="h-3 w-3" />
                  {t('contextualTools.voiceReady')}
                </span>
              </div>
              <span>{t('contextualTools.autosavesLocally')}</span>
            </div>
          </div>

          {workspaceNotes.length ? (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-foreground">{t('contextualTools.recentNotes')}</p>
              <div className="space-y-2">
                {workspaceNotes.map(note => (
                  <div
                    key={note.id}
                    className="rounded-md border border-border/60 bg-muted/40 p-3 text-xs text-muted-foreground flex items-start justify-between gap-3"
                  >
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
                            note.priority === 'high' && 'bg-destructive/10 text-destructive border border-destructive/40',
                            note.priority === 'medium' && 'bg-amber-50 text-amber-700 border border-amber-200',
                            note.priority === 'low' && 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          )}
                        >
                          {t(`contextualTools.priorityOptions.${note.priority}` as const)}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {formatNoteTimestamp(note.createdAt)}
                        </span>
                      </div>
                      <span className="flex-1 whitespace-pre-wrap break-words text-foreground text-xs">
                        {note.content}
                      </span>
                      {note.attachment?.dataUrl ? (
                        <div className="mt-1 overflow-hidden rounded-md border border-border/50 bg-background">
                          <img
                            src={note.attachment.dataUrl}
                            alt={note.attachment.name}
                            className="max-h-40 w-full object-cover"
                          />
                          <div className="flex items-center justify-between px-2 py-1 text-[10px] text-muted-foreground">
                            <span className="truncate" title={note.attachment.name}>
                              {note.attachment.name}
                            </span>
                            <span>{t('contextualTools.attachmentPreview')}</span>
                          </div>
                        </div>
                      ) : null}
                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                        <button
                          type="button"
                          onClick={() => downloadWorkspaceNote(note)}
                          className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-foreground transition-colors hover:bg-muted"
                        >
                          <Download className="h-3.5 w-3.5" />
                          {t('contextualTools.downloadNote')}
                        </button>
                        {note.attachment?.dataUrl ? (
                          <button
                            type="button"
                            onClick={() => downloadWorkspaceAttachment(note.attachment)}
                            className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-foreground transition-colors hover:bg-muted"
                          >
                            <FileDown className="h-3.5 w-3.5" />
                            {t('contextualTools.downloadAttachment')}
                          </button>
                        ) : null}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeWorkspaceNote(note.id)}
                      className="inline-flex items-center rounded-md p-1 text-muted-foreground transition-colors hover:text-destructive"
                      aria-label={t('contextualTools.deleteNote')}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">
              {t('contextualTools.notesWillAppear')}
            </p>
          )}

          <div className="grid gap-2 sm:grid-cols-2">
            <div className="flex items-start gap-3 rounded-lg border border-border/60 bg-background/70 p-3">
              <FileDown className="mt-0.5 h-4 w-4 text-primary" />
              <div className="space-y-1">
                <p className="text-xs font-semibold text-foreground">{t('contextualTools.flexibleExports')}</p>
                <p className="text-[11px] leading-tight text-muted-foreground">
                  {t('contextualTools.flexibleExportsDesc')}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-lg border border-border/60 bg-background/70 p-3">
              <Cloud className="mt-0.5 h-4 w-4 text-primary" />
              <div className="space-y-1">
                <p className="text-xs font-semibold text-foreground">{t('contextualTools.crossPlatformSyncing')}</p>
                <p className="text-[11px] leading-tight text-muted-foreground">
                  {t('contextualTools.crossPlatformSyncingDesc')}
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
                <h4 className="text-sm font-semibold text-foreground">{t('contextualTools.adaptiveAgenda')}</h4>
                <p className="text-xs text-muted-foreground">{t('contextualTools.lockDeepWorkBlocks')}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={importGoalTasksToAgenda}
                className="inline-flex items-center gap-1 rounded-md border border-dashed border-secondary px-3 py-1.5 text-[11px] font-medium text-secondary transition-colors hover:bg-secondary/10"
              >
                <ListTodo className="h-3.5 w-3.5" />
                {t('contextualTools.importGoalTasks')}
              </button>
              {pendingAgendaCount ? (
                <Badge variant="secondary" className="rounded-full text-[10px] uppercase tracking-wide">
                  {interpolateTranslation(t('contextualTools.open'), { count: pendingAgendaCount.toString() })}
                </Badge>
              ) : null}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto]">
            <input
              type="text"
              value={agendaInput}
              onChange={event => setAgendaInput(event.target.value)}
              placeholder={t('contextualTools.agendaPlaceholder')}
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
              {t('contextualTools.lockFocusBlock')}
            </label>
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleAddAgendaItem}
              className="inline-flex items-center gap-2 rounded-md bg-secondary px-4 py-1.5 text-xs font-semibold text-secondary-foreground transition-colors hover:bg-secondary/90"
            >
              <Plus className="h-3.5 w-3.5" />
              {t('contextualTools.addToAgenda')}
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
                          {t('contextualTools.locked')}
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
                    {item.completed ? t('contextualTools.completed') : t('contextualTools.markDone')}
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">
              {t('contextualTools.buildLivingSchedule')}
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
                <h4 className="text-sm font-semibold text-foreground">{t('contextualTools.quickActionsTitle')}</h4>
                <p className="text-xs text-muted-foreground">{t('contextualTools.launchFocusMode')}</p>
              </div>
            </div>
            <Badge variant="outline" className="rounded-full text-[10px] uppercase tracking-wide">
              {formattedTimer}
            </Badge>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2 rounded-lg border border-border/60 bg-muted/40 p-3">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{t('contextualTools.focusTimer')}</span>
                <span>{focusTimer.isRunning ? t('contextualTools.inProgress') : t('contextualTools.paused')}</span>
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
                  {t('contextualTools.reviewJourneyTimeline')}
                </button>
                <button className="w-full rounded-md bg-secondary/10 px-3 py-2 text-left font-medium text-secondary transition-colors hover:bg-secondary/20">
                  {t('contextualTools.logProgressNote')}
                </button>
                <button className="w-full rounded-md bg-accent/10 px-3 py-2 text-left font-medium text-accent-foreground transition-colors hover:bg-accent/20">
                  {t('contextualTools.openDeepFocusMode')}
                </button>
              </div>
              <p className="text-[11px] leading-tight text-muted-foreground">
                {t('contextualTools.shortcutsAdapt')}
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
              <h4 className="text-sm font-semibold text-foreground">{t('contextualTools.progressOverview')}</h4>
              <p className="text-xs text-muted-foreground">{t('contextualTools.monitorMilestone')}</p>
            </div>
          </div>

          {activeGoal ? (
            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('contextualTools.milestones')}</span>
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
                  <span className="text-muted-foreground">{t('contextualTools.tasks')}</span>
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
                  <span className="text-muted-foreground">{t('contextualTools.timeSpentVsScheduled')}</span>
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
                  <span className="text-[11px] text-muted-foreground">{t('contextualTools.recentStreak')}</span>
                  <p className="text-sm font-semibold text-foreground">{activeStreak} {t('contextualTools.days')}</p>
                </div>
                <div className="flex-1 rounded-md bg-muted/40 px-3 py-2">
                  <span className="text-[11px] text-muted-foreground">{t('contextualTools.focusAllocation')}</span>
                  <p className="text-sm font-semibold text-foreground">{Math.round(timeAllocation)}%</p>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">
              {t('contextualTools.selectJourneyGoal')}
            </p>
          )}
        </Card>
      ) : null}

      {activeModule === 'insights' ? (
        <Card className="space-y-4 p-4 bg-gradient-to-br from-primary/5 to-secondary/5">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <div>
              <h4 className="text-sm font-semibold text-foreground">{t('contextualTools.blueprintInsights')}</h4>
              <p className="text-xs text-muted-foreground">{t('contextualTools.personalityAlignedPrompts')}</p>
            </div>
          </div>

          <div className="space-y-3">
            {insights.map(insight => (
              <div key={insight.id} className="space-y-1 rounded-lg border border-border/40 bg-background/70 p-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-foreground">{insight.title}</p>
                  <Badge variant="outline" className="rounded-full text-[10px] uppercase tracking-wide">
                    {t('contextualTools.insight')}
                  </Badge>
                </div>
                <p className="text-[11px] leading-tight text-muted-foreground">{insight.body}</p>
              </div>
            ))}
          </div>

          <p className="text-[11px] text-muted-foreground">
            {t('contextualTools.rotateThrough')}
          </p>
        </Card>
      ) : null}
    </div>
  );
}

function TaskCoachTools({ selectedTask }: { selectedTask?: any }) {
  const { t } = useLanguage();
  
  return (
    <div className="space-y-4">
      <Card className="p-4 space-y-3">
        <div className="flex items-center space-x-2">
          <Clock className="h-4 w-4 text-primary" />
          <h4 className="font-semibold text-sm">{t('contextualTools.currentTask')}</h4>
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
            {t('contextualTools.noTaskSelected')}
          </p>
        )}
      </Card>

      <Card className="p-4 space-y-3">
        <h4 className="font-semibold text-sm">{t('contextualTools.taskNotes')}</h4>
        <p className="text-xs text-muted-foreground">
          {t('contextualTools.quickNotesReminders')}
        </p>
      </Card>
    </div>
  );
}

function FocusTools({ focusedMilestone }: { focusedMilestone?: any }) {
  const { t } = useLanguage();
  
  return (
    <div className="space-y-4">
      <Card className="p-4 space-y-3">
        <div className="flex items-center space-x-2">
          <Target className="h-4 w-4 text-secondary" />
          <h4 className="font-semibold text-sm">{t('contextualTools.currentMilestone')}</h4>
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
            {t('contextualTools.noMilestoneInFocus')}
          </p>
        )}
      </Card>
    </div>
  );
}

function TasksTools() {
  const { t } = useLanguage();
  
  return (
    <div className="space-y-4">
      <Card className="p-4 space-y-3">
        <h4 className="font-semibold text-sm">{t('contextualTools.taskFilters')}</h4>
        <p className="text-xs text-muted-foreground">
          {t('contextualTools.filterSortOptions')}
        </p>
      </Card>
    </div>
  );
}

function DiscoveryTools() {
  const { t } = useLanguage();
  
  return (
    <div className="space-y-4">
      <Card className="p-4 space-y-3 bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="flex items-center space-x-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <h4 className="font-semibold text-sm">{t('contextualTools.discoveryTips')}</h4>
        </div>
        <p className="text-xs text-muted-foreground">
          {t('contextualTools.tipsForDiscovery')}
        </p>
      </Card>
    </div>
  );
}

function CreateTools() {
  const { t } = useLanguage();
  
  return (
    <div className="space-y-4">
      <Card className="p-4 space-y-3">
        <h4 className="font-semibold text-sm">{t('contextualTools.creationGuide')}</h4>
        <p className="text-xs text-muted-foreground">
          {t('contextualTools.helpfulHints')}
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

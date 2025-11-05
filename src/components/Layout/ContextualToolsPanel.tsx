import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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
  Link2
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ContextualToolsPanelProps {
  context?: 'journey' | 'task-coach' | 'focus' | 'tasks' | 'milestones' | 'hub' | 'chat' | 'create';
  activeGoal?: any;
  focusedMilestone?: any;
  selectedTask?: any;
  className?: string;
}

interface WorkspaceNote {
  id: string;
  type: 'text' | 'voice';
  content: string;
  createdAt: string;
  durationSeconds?: number;
}

interface AgendaItem {
  id: string;
  title: string;
  startTime: string;
  durationMinutes: number;
  locked: boolean;
  completed: boolean;
  createdAt: string;
  sourceId?: string;
}

type FocusTimerStatus = 'idle' | 'running' | 'paused';

interface FocusTimerState {
  status: FocusTimerStatus;
  remainingSeconds: number;
}

interface BlueprintInsight {
  id: string;
  title: string;
  description: string;
}

const FOCUS_DEFAULT_DURATION = 25 * 60; // 25 minutes in seconds
const isBrowser = typeof window !== 'undefined';

type JourneyFeatureId = 'workspace' | 'agenda' | 'quick-actions' | 'progress' | 'insights';

const loadFromStorage = <T,>(key: string, fallback: T): T => {
  if (!isBrowser) {
    return fallback;
  }

  const storedValue = window.localStorage.getItem(key);

  if (!storedValue) {
    return fallback;
  }

  try {
    return JSON.parse(storedValue) as T;
  } catch (error) {
    console.warn('ContextualToolsPanel: Failed to parse storage value', { key, error });
    return fallback;
  }
};

const persistToStorage = (key: string, value: unknown) => {
  if (!isBrowser) {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
};

const formatRelativeTime = (isoString: string | null | undefined): string => {
  if (!isoString) {
    return 'just now';
  }

  const parsed = new Date(isoString);

  if (Number.isNaN(parsed.getTime())) {
    return 'just now';
  }

  const diffMs = Date.now() - parsed.getTime();
  const diffMinutes = Math.round(diffMs / 60000);

  if (diffMinutes <= 0) {
    return 'moments ago';
  }

  if (diffMinutes < 60) {
    return `${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`;
  }

  const diffHours = Math.round(diffMinutes / 60);

  if (diffHours < 24) {
    return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  }

  const diffDays = Math.round(diffHours / 24);

  if (diffDays < 7) {
    return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
  }

  return parsed.toLocaleDateString();
};

const formatMinutes = (minutes: number): string => {
  if (minutes <= 0) {
    return '0m';
  }

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours > 0) {
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  }

  return `${mins}m`;
};

const formatSecondsAsClock = (seconds: number): string => {
  const safeSeconds = Math.max(0, Math.floor(seconds));
  const mins = Math.floor(safeSeconds / 60)
    .toString()
    .padStart(2, '0');
  const secs = (safeSeconds % 60)
    .toString()
    .padStart(2, '0');
  return `${mins}:${secs}`;
};

const safeDownload = (url: string, filename: string) => {
  if (!isBrowser) {
    return;
  }

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const blobToBase64 = (blob: Blob): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve(typeof reader.result === 'string' ? reader.result : '');
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });

const getDefaultStartTime = () => {
  const now = new Date();
  const minutes = now.getMinutes();
  const roundedMinutes = Math.ceil(minutes / 5) * 5;
  now.setMinutes(roundedMinutes, 0, 0);
  return now.toTimeString().slice(0, 5);
};

const getNextAgendaStart = (items: AgendaItem[]): string => {
  if (!items.length) {
    return getDefaultStartTime();
  }

  const sorted = [...items].sort((a, b) => a.startTime.localeCompare(b.startTime));
  const lastItem = sorted[sorted.length - 1];
  const [hours, minutes] = lastItem.startTime.split(':').map(value => Number.parseInt(value, 10));

  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return getDefaultStartTime();
  }

  const endDate = new Date();
  endDate.setHours(hours, minutes, 0, 0);
  endDate.setMinutes(endDate.getMinutes() + lastItem.durationMinutes);
  return endDate.toTimeString().slice(0, 5);
};

const toTimeRangeLabel = (start: string, durationMinutes: number) => {
  const [hours, minutes] = start.split(':').map(value => Number.parseInt(value, 10));

  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return start;
  }

  const startDate = new Date();
  startDate.setHours(hours, minutes, 0, 0);
  const endDate = new Date(startDate.getTime() + durationMinutes * 60000);

  const format = (date: Date) =>
    date.toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit'
    });

  return `${format(startDate)} – ${format(endDate)}`;
};

const deriveTaskDuration = (task: any): number => {
  const candidates = [
    task?.estimatedMinutes,
    task?.estimatedDuration,
    task?.estimated_duration,
    task?.estimated_duration_minutes,
    task?.duration,
    task?.expected_duration
  ];

  for (const candidate of candidates) {
    if (!candidate) {
      continue;
    }

    const numeric = typeof candidate === 'number' ? candidate : Number.parseInt(String(candidate), 10);

    if (!Number.isNaN(numeric) && numeric > 0) {
      return numeric;
    }
  }

  return 45;
};

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

  return (
    <div className="space-y-4">
      {/* AI Output & Tool Workspace */}
      <Card className="p-4 space-y-4 bg-muted/40">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <div>
            <h4 className="font-semibold text-sm">AI Output &amp; Tool Workspace</h4>
            <p className="text-xs text-muted-foreground">
              Capture insights, craft plans, and surface AI-generated support.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-start gap-3 rounded-lg border border-border/60 p-3 bg-background/80">
            <NotebookPen className="mt-0.5 h-4 w-4 text-primary" />
            <div className="space-y-1">
              <p className="text-xs font-semibold">Multimodal note-taking</p>
              <p className="text-xs text-muted-foreground">
                Switch between written inputs and quick voice capture to build living notes as you work.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-lg border border-border/60 p-3 bg-background/80">
            <FileDown className="mt-0.5 h-4 w-4 text-primary" />
            <div className="space-y-1">
              <p className="text-xs font-semibold">Flexible exports</p>
              <p className="text-xs text-muted-foreground">
                Download outputs in TXT, PDF, DOCX, or Markdown for easy sharing and archival.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-lg border border-border/60 p-3 bg-background/80">
            <Cloud className="mt-0.5 h-4 w-4 text-primary" />
            <div className="space-y-1">
              <p className="text-xs font-semibold">Cross-platform syncing</p>
              <p className="text-xs text-muted-foreground">
                Keep your saved notes and insights synced across devices for uninterrupted momentum.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-md bg-primary/5 px-3 py-2 text-xs text-primary">
          <Mic className="h-4 w-4" />
          <span>Enable voice mode to capture a new insight.</span>
        </div>
      </Card>

      {/* Agenda Management */}
      <Card className="p-4 space-y-4">
        <div className="flex items-center gap-2">
          <CalendarClock className="h-4 w-4 text-secondary" />
          <h4 className="font-semibold text-sm">Agenda Management</h4>
        </div>
        <div className="space-y-3 text-xs text-muted-foreground">
          <div className="flex items-start gap-2">
            <Sparkles className="mt-0.5 h-3.5 w-3.5 text-primary" />
            <p>
              <span className="font-medium text-foreground">Adaptive agenda</span> automatically builds and adjusts tasks to stay aligned with your goals.
            </p>
          </div>
          <div className="flex items-start gap-2">
            <ShieldCheck className="mt-0.5 h-3.5 w-3.5 text-primary" />
            <p>
              <span className="font-medium text-foreground">Locked agenda time</span> protects deep work blocks by preventing double-booking or interruptions.
            </p>
          </div>
          <div className="flex items-start gap-2">
            <Link2 className="mt-0.5 h-3.5 w-3.5 text-primary" />
            <p>
              <span className="font-medium text-foreground">Integration hooks</span> connect to calendars and productivity APIs for automated scheduling.
            </p>
          </div>
        </div>
      </Card>

      {/* Quick Actions */}
      <Card className="p-4 space-y-3">
        <div className="flex items-center space-x-2">
          <Zap className="h-4 w-4 text-primary" />
          <h4 className="font-semibold text-sm">Quick Actions</h4>
        </div>

        {activeFeature === 'workspace' && (
          <Card className="p-4 space-y-4 bg-muted/40">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <div>
                <h4 className="font-semibold text-sm">AI Output &amp; Tool Workspace</h4>
                <p className="text-xs text-muted-foreground">
                  Capture insights, craft plans, and surface AI-generated support.
                </p>
              </div>
            </div>

            <Textarea
              value={currentNote}
              onChange={event => setCurrentNote(event.target.value)}
              placeholder="Drop your next idea, insight, or summary here..."
              className="min-h-[96px] text-sm"
            />

            <div className="flex flex-wrap items-center gap-2">
              <Button size="sm" onClick={handleAddNote}>
                <NotebookPen className="mr-2 h-3.5 w-3.5" /> Save note
              </Button>
              <Button
                size="sm"
                variant={isRecording ? 'destructive' : 'secondary'}
                onClick={isRecording ? stopRecording : startRecording}
              >
                {isRecording ? (
                  <>
                    <Square className="mr-2 h-3.5 w-3.5" /> Stop recording ({formatSecondsAsClock(recordingDuration)})
                  </>
                ) : (
                  <>
                    <Mic className="mr-2 h-3.5 w-3.5" /> Capture voice note
                  </>
                )}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => exportNotes('txt')}>
                <FileDown className="mr-2 h-3.5 w-3.5" /> Export TXT
              </Button>
              <Button size="sm" variant="ghost" onClick={() => exportNotes('md')}>
                <Download className="mr-2 h-3.5 w-3.5" /> Export Markdown
              </Button>
              <Button size="sm" variant="ghost" onClick={() => exportNotes('json')}>
                <Download className="mr-2 h-3.5 w-3.5" /> Export JSON
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  if (notes.length) {
                    handleCopyNote(notes[0]);
                  } else {
                    toast({
                      title: 'No notes yet',
                      description: 'Capture a note before copying.',
                      variant: 'destructive'
                    });
                  }
                }}
              >
                <ClipboardCopy className="mr-2 h-3.5 w-3.5" /> Copy latest note
              </Button>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <Switch id="workspace-auto-sync" checked={autoSync} onCheckedChange={setAutoSync} />
                <label htmlFor="workspace-auto-sync" className="text-muted-foreground">
                  Auto-sync workspace for this goal
                </label>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                {lastSyncedAt && <span>Synced {formatRelativeTime(lastSyncedAt)}</span>}
                <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={handleManualSync}>
                  <Cloud className="mr-1.5 h-3.5 w-3.5" /> Sync now
                </Button>
              </div>
            </div>

            <ScrollArea className="max-h-48 rounded-lg border border-border/60 bg-background/60">
              <div className="p-3 space-y-3">
                {notes.length === 0 ? (
                  <p className="text-xs text-muted-foreground">
                    Notes you capture—text or voice—will appear here for quick reference.
                  </p>
                ) : (
                  notes.map(note => (
                    <div
                      key={note.id}
                      className="flex items-start justify-between gap-3 rounded-lg border border-border/60 bg-background/80 p-3"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          {note.type === 'text' ? (
                            <NotebookPen className="h-3.5 w-3.5 text-primary" />
                          ) : (
                            <AudioLines className="h-3.5 w-3.5 text-primary" />
                          )}
                          <div>
                            <p className="text-xs font-semibold text-foreground">
                              {note.type === 'text' ? 'Text note' : 'Voice note'}
                            </p>
                            <p className="text-[11px] text-muted-foreground">{formatRelativeTime(note.createdAt)}</p>
                          </div>
                        </div>
                        {note.type === 'text' ? (
                          <p className="text-xs text-muted-foreground whitespace-pre-wrap">{note.content}</p>
                        ) : (
                          <audio controls src={note.content} className="mt-1 w-full" />
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        {note.type === 'text' ? (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleCopyNote(note)}>
                                <ClipboardCopy className="h-3.5 w-3.5" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Copy note</TooltipContent>
                          </Tooltip>
                        ) : (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleDownloadVoiceNote(note)}
                              >
                                <Download className="h-3.5 w-3.5" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Download voice note</TooltipContent>
                          </Tooltip>
                        )}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => handleDeleteNote(note.id)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Delete</TooltipContent>
                        </Tooltip>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </Card>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">
            Select a goal to see quick actions.
          </p>
        )}

      {/* Progress Overview */}
      <Card className="p-4 space-y-3">
        <div className="flex items-center space-x-2">
          <Target className="h-4 w-4 text-secondary" />
          <h4 className="font-semibold text-sm">Progress Overview</h4>
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
                <div
                  className="h-1.5 rounded-full bg-primary"
                  style={{ width: `${milestoneProgress}%` }}
                />
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
                <div
                  className="h-1.5 rounded-full bg-secondary"
                  style={{ width: `${taskProgress}%` }}
                />
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
                <div
                  className="h-1.5 rounded-full bg-primary/70"
                  style={{ width: `${timeAllocation}%` }}
                />
              </div>
            </div>

            <div className="flex justify-between rounded-md bg-muted/40 px-3 py-2">
              <span className="text-muted-foreground">Recent streak</span>
              <span className="font-medium text-foreground">{activeStreak} days</span>
            </div>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">
            No active goal selected.
          </p>
        )}

        {activeFeature === 'progress' && (
          <Card className="p-4 space-y-3">
            <div className="flex items-center space-x-2">
              <Target className="h-4 w-4 text-secondary" />
              <h4 className="font-semibold text-sm">Progress Overview</h4>
            </div>
            <div className="space-y-4 text-xs">
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Milestones</span>
                  <span className="font-medium text-foreground">
                    {completedMilestones}/{totalMilestones}
                  </span>
                </div>
                <Progress value={milestoneProgress} className="h-1.5" />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tasks</span>
                  <span className="font-medium text-foreground">
                    {completedTasks}/{totalTasks}
                  </span>
                </div>
                <Progress value={taskProgress} className="h-1.5" />
              </div>
              <Separator />
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Agenda completion</span>
                    <span className="font-medium text-foreground">{Math.round(agendaProgress)}%</span>
                  </div>
                  <Progress value={agendaProgress} className="h-1.5" />
                  <p className="text-[11px] text-muted-foreground">
                    {formatMinutes(completedAgendaMinutes)} of {formatMinutes(totalAgendaMinutes)} logged today
                  </p>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Locked focus time</span>
                    <span className="font-medium text-foreground">{Math.round(lockedRatio)}%</span>
                  </div>
                  <Progress value={lockedRatio} className="h-1.5" />
                  <p className="text-[11px] text-muted-foreground">
                    {formatMinutes(lockedMinutes)} protected from interruptions
                  </p>
                </div>
              </div>
              <Separator />
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Focus session</span>
                    <span className="font-medium text-foreground">{formatSecondsAsClock(focusTimer.remainingSeconds)}</span>
                  </div>
                  <Progress value={focusProgress} className="h-1.5" />
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost" className="h-7 text-[11px]" onClick={resetFocusSession}>
                      Reset
                    </Button>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Workspace notes</span>
                    <span className="font-medium text-foreground">{notesCount}</span>
                  </div>
                  <Progress value={notesCount ? Math.min(100, notesCount * 10) : 0} className="h-1.5" />
                  <p className="text-[11px] text-muted-foreground">
                    {voiceNoteCount} voice • {notesCount - voiceNoteCount} text entries captured
                  </p>
                </div>
              </div>
              {upcomingAgenda.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[11px] font-semibold text-muted-foreground">Up next</p>
                  <ul className="space-y-1">
                    {upcomingAgenda.map(item => (
                      <li key={item.id} className="flex justify-between text-[11px] text-muted-foreground">
                        <span>{item.title}</span>
                        <span>{toTimeRangeLabel(item.startTime, item.durationMinutes)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="flex justify-between rounded-md bg-muted/40 px-3 py-2">
                <span className="text-muted-foreground">Recent streak</span>
                <span className="font-medium text-foreground">{activeStreak} days</span>
              </div>
            </div>
          </Card>
        )}

        {activeFeature === 'insights' && <BlueprintInsightsCard />}
      </div>
    </TooltipProvider>
  );
}


const BlueprintInsightsCard: React.FC = () => {
  const { blueprintData, loading, error, getDisplayName } = useBlueprintData();
  const displayName = useMemo(() => getDisplayName(), [getDisplayName]);
  const friendlyName = displayName && displayName !== 'User' ? displayName : 'You';

  const insights = useMemo<BlueprintInsight[]>(() => {
    if (!blueprintData) {
      return [];
    }

    const items: BlueprintInsight[] = [];
    const mbtiType = blueprintData.cognition_mbti?.type;
    const dominant = blueprintData.cognition_mbti?.dominant_function;
    const auxiliary = blueprintData.cognition_mbti?.auxiliary_function;

    if (mbtiType && mbtiType !== 'Unknown') {
      items.push({
        id: 'mbti',
        title: `${mbtiType} focus strategy`,
        description: `${friendlyName} thrives when leading with ${dominant || 'your dominant function'}. Pair sessions with ${auxiliary || 'supportive reflection'} to stay balanced.`
      });
    }

    const hdStrategy = blueprintData.energy_strategy_human_design?.strategy;
    const hdAuthority = blueprintData.energy_strategy_human_design?.authority;

    if (hdStrategy) {
      const strategyCue = typeof hdStrategy === 'string' ? hdStrategy.toLowerCase() : 'respond';
      items.push({
        id: 'human-design',
        title: `${hdStrategy} energy rhythm`,
        description: `Guard time to ${strategyCue} and make decisions using your ${hdAuthority || 'inner authority'} before committing to new work.`
      });
    }

    const sunSign = blueprintData.archetype_western?.sun_sign;
    if (sunSign && sunSign !== 'Unknown') {
      items.push({
        id: 'astrology',
        title: `${sunSign} momentum boost`,
        description: `Align demanding tasks with periods when you feel most expressive to channel your ${sunSign} creativity into progress updates.`
      });
    }

    const lifePath = blueprintData.values_life_path?.life_path_number;
    if (lifePath) {
      items.push({
        id: 'numerology',
        title: `Life Path ${lifePath}`,
        description: `Revisit your agenda weekly to ensure it reflects the bigger ${lifePath}-year theme guiding you right now.`
      });
    }

    return items;
  }, [blueprintData, displayName]);

  return (
    <Card className="p-4 space-y-3 bg-gradient-to-br from-primary/5 to-secondary/5">
      <div className="flex items-center space-x-2">
        <Sparkles className="h-4 w-4 text-primary" />
        <h4 className="font-semibold text-sm">Blueprint Insights</h4>
      </div>
      {loading ? (
        <p className="text-xs text-muted-foreground animate-pulse">Loading personality-aligned guidance…</p>
      ) : error ? (
        <p className="text-xs text-destructive">Unable to load blueprint insights right now.</p>
      ) : insights.length ? (
        <div className="space-y-2">
          {insights.map(insight => (
            <div key={insight.id} className="rounded-lg border border-primary/20 bg-background/60 p-3">
              <p className="text-xs font-semibold text-foreground">{insight.title}</p>
              <p className="text-xs text-muted-foreground">{insight.description}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">
          Personality-based tips and guidance will appear here.
        </p>
      )}
    </Card>
  );
};


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

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/components/ui/use-toast';
import { useBlueprintData } from '@/hooks/use-blueprint-data';
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
  Play,
  Pause,
  Square,
  Trash2,
  Download,
  ClipboardCopy,
  ListTodo,
  Lock,
  Unlock,
  CheckCircle2,
  History,
  AudioLines
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
  const { toast } = useToast();
  const navigate = useNavigate();

  const goalIdentifier = activeGoal?.id ?? activeGoal?.goal_id ?? 'default';
  const storageNamespace = useMemo(() => `contextual-tools/${goalIdentifier}`, [goalIdentifier]);

  const notesKey = `${storageNamespace}/notes`;
  const agendaKey = `${storageNamespace}/agenda`;
  const autoSyncKey = `${storageNamespace}/auto-sync`;
  const syncedAtKey = `${storageNamespace}/synced-at`;

  const notesInitRef = useRef(true);
  const agendaInitRef = useRef(true);
  const autoSyncInitRef = useRef(true);
  const syncedAtInitRef = useRef(true);

  const [notes, setNotes] = useState<WorkspaceNote[]>(() => loadFromStorage(notesKey, []));
  useEffect(() => {
    if (!isBrowser) {
      return;
    }
    notesInitRef.current = false;
    setNotes(loadFromStorage(notesKey, []));
  }, [notesKey]);
  useEffect(() => {
    if (!isBrowser) {
      return;
    }
    if (!notesInitRef.current) {
      notesInitRef.current = true;
      return;
    }
    persistToStorage(notesKey, notes);
  }, [notes, notesKey]);

  const [agendaItems, setAgendaItems] = useState<AgendaItem[]>(() => loadFromStorage(agendaKey, []));
  useEffect(() => {
    if (!isBrowser) {
      return;
    }
    agendaInitRef.current = false;
    setAgendaItems(loadFromStorage(agendaKey, []));
  }, [agendaKey]);
  useEffect(() => {
    if (!isBrowser) {
      return;
    }
    if (!agendaInitRef.current) {
      agendaInitRef.current = true;
      return;
    }
    persistToStorage(agendaKey, agendaItems);
  }, [agendaItems, agendaKey]);

  const [autoSync, setAutoSync] = useState<boolean>(() => loadFromStorage(autoSyncKey, true));
  useEffect(() => {
    if (!isBrowser) {
      return;
    }
    autoSyncInitRef.current = false;
    setAutoSync(loadFromStorage(autoSyncKey, true));
  }, [autoSyncKey]);
  useEffect(() => {
    if (!isBrowser) {
      return;
    }
    if (!autoSyncInitRef.current) {
      autoSyncInitRef.current = true;
      return;
    }
    persistToStorage(autoSyncKey, autoSync);
  }, [autoSync, autoSyncKey]);

  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(() => loadFromStorage(syncedAtKey, null));
  useEffect(() => {
    if (!isBrowser) {
      return;
    }
    syncedAtInitRef.current = false;
    setLastSyncedAt(loadFromStorage(syncedAtKey, null));
  }, [syncedAtKey]);
  useEffect(() => {
    if (!isBrowser) {
      return;
    }
    if (!syncedAtInitRef.current) {
      syncedAtInitRef.current = true;
      return;
    }
    persistToStorage(syncedAtKey, lastSyncedAt);
  }, [lastSyncedAt, syncedAtKey]);

  useEffect(() => {
    if (!autoSync) {
      return;
    }
    setLastSyncedAt(new Date().toISOString());
  }, [notes, agendaItems, autoSync]);

  const [currentNote, setCurrentNote] = useState('');
  const [newAgendaTitle, setNewAgendaTitle] = useState('');
  const [newAgendaStart, setNewAgendaStart] = useState(() => getDefaultStartTime());
  const [newAgendaDuration, setNewAgendaDuration] = useState('45');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<number | null>(null);
  const recordingStartedAtRef = useRef<number | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);

  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current?.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
      if (recordingTimerRef.current) {
        window.clearInterval(recordingTimerRef.current);
      }
    };
  }, []);

  const startRecording = useCallback(async () => {
    if (isRecording) {
      return;
    }

    if (!isBrowser || !navigator.mediaDevices?.getUserMedia) {
      toast({
        title: 'Microphone unavailable',
        description: 'Enable microphone access to capture voice notes.',
        variant: 'destructive'
      });
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      recordingChunksRef.current = [];

      recorder.ondataavailable = event => {
        if (event.data.size > 0) {
          recordingChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(recordingChunksRef.current, { type: 'audio/webm' });
        recordingChunksRef.current = [];

        try {
          const content = await blobToBase64(audioBlob);
          const durationSeconds = recordingStartedAtRef.current
            ? Math.round((Date.now() - recordingStartedAtRef.current) / 1000)
            : undefined;

          setNotes(prev => [
            {
              id: `voice-${Date.now()}`,
              type: 'voice',
              content,
              createdAt: new Date().toISOString(),
              durationSeconds
            },
            ...prev
          ]);

          toast({
            title: 'Voice note captured',
            description: 'Audio insight saved to your workspace.'
          });
        } catch (error) {
          console.error('Failed to persist voice note', error);
          toast({
            title: 'Recording error',
            description: 'We could not save this voice note.',
            variant: 'destructive'
          });
        }

        stream.getTracks().forEach(track => track.stop());
        recordingStartedAtRef.current = null;
        setRecordingDuration(0);
      };

      recorder.start();
      mediaRecorderRef.current = recorder;
      recordingStartedAtRef.current = Date.now();
      setIsRecording(true);
      setRecordingDuration(0);
      recordingTimerRef.current = window.setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);

      toast({
        title: 'Recording started',
        description: 'Speak freely—stop when your insight is complete.'
      });
    } catch (error) {
      console.error('Unable to start recording', error);
      toast({
        title: 'Unable to access microphone',
        description: 'Check your browser permissions and try again.',
        variant: 'destructive'
      });
    }
  }, [isRecording, toast]);

  const stopRecording = useCallback(() => {
    if (!isRecording) {
      return;
    }

    mediaRecorderRef.current?.stop();
    setIsRecording(false);

    if (recordingTimerRef.current) {
      window.clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }

    toast({
      title: 'Finishing recording',
      description: 'Processing your voice note now.'
    });
  }, [isRecording, toast]);

  const handleAddNote = useCallback(() => {
    if (!currentNote.trim()) {
      toast({
        title: 'Add a note',
        description: 'Type your insight before saving.',
        variant: 'destructive'
      });
      return;
    }

    setNotes(prev => [
      {
        id: `note-${Date.now()}`,
        type: 'text',
        content: currentNote.trim(),
        createdAt: new Date().toISOString()
      },
      ...prev
    ]);
    setCurrentNote('');

    toast({
      title: 'Note saved',
      description: 'Captured in your AI workspace.'
    });
  }, [currentNote, toast]);

  const handleDeleteNote = useCallback(
    (id: string) => {
      setNotes(prev => prev.filter(note => note.id !== id));
      toast({
        title: 'Removed',
        description: 'The note has been deleted.'
      });
    },
    [toast]
  );

  const handleCopyNote = useCallback(
    async (note: WorkspaceNote) => {
      if (!isBrowser) {
        return;
      }

      const text = note.type === 'text' ? note.content : 'Voice note attached (download to listen).';

      try {
        await navigator.clipboard.writeText(text);
        toast({
          title: 'Copied to clipboard',
          description: 'Ready to paste into any document.'
        });
      } catch (error) {
        console.error('Clipboard write failed', error);
        toast({
          title: 'Copy failed',
          description: 'We could not copy that note.',
          variant: 'destructive'
        });
      }
    },
    [toast]
  );

  const handleDownloadVoiceNote = useCallback(
    (note: WorkspaceNote) => {
      if (note.type !== 'voice') {
        return;
      }

      safeDownload(note.content, `${note.id}.webm`);
      toast({
        title: 'Download started',
        description: 'Voice note saved to your device.'
      });
    },
    [toast]
  );

  const exportNotes = useCallback(
    (format: 'txt' | 'md' | 'json') => {
      if (!notes.length && !agendaItems.length) {
        toast({
          title: 'Nothing to export',
          description: 'Capture a note or add agenda time first.',
          variant: 'destructive'
        });
        return;
      }

      let data = '';
      let mime = 'text/plain';
      let extension = format;

      if (format === 'json') {
        data = JSON.stringify({ notes, agenda: agendaItems }, null, 2);
        mime = 'application/json';
      } else {
        const lines: string[] = [];

        lines.push(`# Workspace notes`);
        notes.forEach(note => {
          if (note.type === 'text') {
            lines.push(`- (${new Date(note.createdAt).toLocaleString()}) ${note.content}`);
          } else {
            lines.push(`- (${new Date(note.createdAt).toLocaleString()}) Voice note saved as ${note.id}.webm`);
          }
        });

        if (agendaItems.length) {
          lines.push('\n# Agenda');
          agendaItems.forEach(item => {
            lines.push(`- ${item.title} — ${toTimeRangeLabel(item.startTime, item.durationMinutes)}${item.locked ? ' 🔒' : ''}${item.completed ? ' ✅' : ''}`);
          });
        }

        data = lines.join('\n');
        mime = format === 'md' ? 'text/markdown' : 'text/plain';
        extension = format === 'md' ? 'md' : 'txt';
      }

      const blob = new Blob([data], { type: mime });
      const url = URL.createObjectURL(blob);
      safeDownload(url, `ai-workspace-export.${extension}`);
      URL.revokeObjectURL(url);

      toast({
        title: 'Export ready',
        description: `Downloaded as .${extension}.`
      });
    },
    [agendaItems, notes, toast]
  );

  const handleManualSync = useCallback(() => {
    const timestamp = new Date().toISOString();
    setLastSyncedAt(timestamp);
    toast({
      title: 'Workspace synced',
      description: 'Stored locally for quick recovery.'
    });
  }, [toast]);

  const handleAddAgendaItem = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      if (!newAgendaTitle.trim()) {
        toast({
          title: 'Name your focus block',
          description: 'Add a label so you know what to work on.',
          variant: 'destructive'
        });
        return;
      }

      const parsedDuration = Number.parseInt(newAgendaDuration, 10);
      const durationMinutes = Number.isNaN(parsedDuration) ? 45 : Math.max(5, parsedDuration);
      const startTime = newAgendaStart || getDefaultStartTime();

      const newItem: AgendaItem = {
        id: `agenda-${Date.now()}`,
        title: newAgendaTitle.trim(),
        startTime,
        durationMinutes,
        locked: false,
        completed: false,
        createdAt: new Date().toISOString()
      };

      setAgendaItems(prev => [newItem, ...prev]);
      setNewAgendaTitle('');
      setNewAgendaDuration(String(durationMinutes));
      setNewAgendaStart(getNextAgendaStart([newItem, ...agendaItems]));

      toast({
        title: 'Focus block scheduled',
        description: `${newItem.title} added for ${formatMinutes(durationMinutes)}.`
      });
    },
    [agendaItems, newAgendaDuration, newAgendaStart, newAgendaTitle, toast]
  );

  const handleToggleLock = useCallback((id: string) => {
    setAgendaItems(prev =>
      prev.map(item =>
        item.id === id
          ? {
              ...item,
              locked: !item.locked
            }
          : item
      )
    );
  }, []);

  const handleToggleComplete = useCallback((id: string) => {
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
  }, []);

  const handleRemoveAgendaItem = useCallback(
    (id: string) => {
      setAgendaItems(prev => prev.filter(item => item.id !== id));
      toast({
        title: 'Removed from agenda',
        description: 'The focus block was cleared.'
      });
    },
    [toast]
  );

  const handleClearCompletedAgenda = useCallback(() => {
    setAgendaItems(prev => prev.filter(item => !item.completed));
    toast({
      title: 'Agenda refreshed',
      description: 'Cleared completed focus blocks.'
    });
  }, [toast]);

  const goalTasks = useMemo(() => {
    const tasks = activeGoal?.tasks;
    return Array.isArray(tasks) ? tasks : [];
  }, [activeGoal]);

  const unscheduledGoalTasks = useMemo(() => {
    if (!goalTasks.length) {
      return [];
    }

    return goalTasks.filter(task => {
      const taskId = String(task?.id ?? task?.task_id ?? task?.taskId ?? task?.title ?? '');

      if (!taskId) {
        return true;
      }

      return !agendaItems.some(item => item.sourceId === taskId);
    });
  }, [agendaItems, goalTasks]);

  const handleAddNextGoalTaskToAgenda = useCallback(() => {
    if (!unscheduledGoalTasks.length) {
      toast({
        title: 'All caught up',
        description: 'Every task from this goal is already scheduled.'
      });
      return;
    }

    const task = unscheduledGoalTasks[0];
    const taskId = String(task?.id ?? task?.task_id ?? task?.taskId ?? Date.now());
    const durationMinutes = deriveTaskDuration(task);

    const newItem: AgendaItem = {
      id: `agenda-${taskId}`,
      title: task?.title || 'Goal task',
      startTime: getNextAgendaStart(agendaItems),
      durationMinutes,
      locked: true,
      completed: false,
      createdAt: new Date().toISOString(),
      sourceId: taskId
    };

    setAgendaItems(prev => [newItem, ...prev]);

    toast({
      title: 'Task scheduled',
      description: `${newItem.title} blocked for ${formatMinutes(durationMinutes)}.`
    });
  }, [agendaItems, toast, unscheduledGoalTasks]);

  const [focusTimer, setFocusTimer] = useState<FocusTimerState>({
    status: 'idle',
    remainingSeconds: FOCUS_DEFAULT_DURATION
  });

  useEffect(() => {
    if (focusTimer.status !== 'running') {
      return;
    }

    const interval = window.setInterval(() => {
      setFocusTimer(prev => {
        if (prev.status !== 'running') {
          window.clearInterval(interval);
          return prev;
        }

        if (prev.remainingSeconds <= 1) {
          window.clearInterval(interval);
          toast({
            title: 'Focus session complete',
            description: 'Log your progress while it is fresh.'
          });
          return {
            status: 'idle',
            remainingSeconds: FOCUS_DEFAULT_DURATION
          };
        }

        return {
          ...prev,
          remainingSeconds: prev.remainingSeconds - 1
        };
      });
    }, 1000);

    return () => {
      window.clearInterval(interval);
    };
  }, [focusTimer.status, toast]);

  const startFocusSession = useCallback(() => {
    setFocusTimer({ status: 'running', remainingSeconds: FOCUS_DEFAULT_DURATION });
    toast({
      title: 'Focus session started',
      description: 'Stay with one task until the timer ends.'
    });
  }, [toast]);

  const pauseFocusSession = useCallback(() => {
    setFocusTimer(prev => ({ ...prev, status: 'paused' }));
    toast({
      title: 'Focus paused',
      description: 'Resume when you are ready.'
    });
  }, [toast]);

  const resumeFocusSession = useCallback(() => {
    setFocusTimer(prev => ({ ...prev, status: 'running' }));
    toast({
      title: 'Focus resumed',
      description: 'Deep work timer is ticking again.'
    });
  }, [toast]);

  const resetFocusSession = useCallback(() => {
    setFocusTimer({ status: 'idle', remainingSeconds: FOCUS_DEFAULT_DURATION });
  }, []);

  const toggleFocusSession = useCallback(() => {
    if (focusTimer.status === 'running') {
      pauseFocusSession();
      return;
    }

    if (focusTimer.status === 'paused') {
      resumeFocusSession();
      return;
    }

    startFocusSession();
  }, [focusTimer.status, pauseFocusSession, resumeFocusSession, startFocusSession]);

  const focusProgress = useMemo(() => {
    if (focusTimer.status === 'idle') {
      return 0;
    }

    return Math.min(100, ((FOCUS_DEFAULT_DURATION - focusTimer.remainingSeconds) / FOCUS_DEFAULT_DURATION) * 100);
  }, [focusTimer]);

  const goalMilestones = useMemo(
    () => (Array.isArray(activeGoal?.milestones) ? activeGoal.milestones : []),
    [activeGoal]
  );

  const completedMilestones =
    activeGoal?.completedMilestones ?? goalMilestones.filter((milestone: any) => milestone?.completed).length;
  const totalMilestones = activeGoal?.totalMilestones ?? goalMilestones.length;
  const milestoneProgress = totalMilestones
    ? Math.min(100, (completedMilestones / totalMilestones) * 100)
    : 0;

  const completedTasks =
    activeGoal?.completedTasks ?? goalTasks.filter((task: any) => task?.completed).length;
  const totalTasks = activeGoal?.totalTasks ?? goalTasks.length;
  const taskProgress = totalTasks ? Math.min(100, (completedTasks / totalTasks) * 100) : 0;

  const completedAgendaMinutes = useMemo(
    () =>
      agendaItems.reduce((acc, item) => {
        if (item.completed) {
          return acc + item.durationMinutes;
        }
        return acc;
      }, 0),
    [agendaItems]
  );

  const totalAgendaMinutes = useMemo(
    () => agendaItems.reduce((acc, item) => acc + item.durationMinutes, 0),
    [agendaItems]
  );

  const lockedMinutes = useMemo(
    () =>
      agendaItems.reduce((acc, item) => {
        if (item.locked) {
          return acc + item.durationMinutes;
        }
        return acc;
      }, 0),
    [agendaItems]
  );

  const agendaProgress = totalAgendaMinutes
    ? Math.min(100, (completedAgendaMinutes / totalAgendaMinutes) * 100)
    : 0;
  const lockedRatio = totalAgendaMinutes
    ? Math.min(100, (lockedMinutes / totalAgendaMinutes) * 100)
    : 0;

  const timeSpent = activeGoal?.timeSpent ?? Math.round(completedAgendaMinutes / 60);
  const scheduledTime = activeGoal?.scheduledTime ?? Math.round(totalAgendaMinutes / 60);
  const timeAllocation = scheduledTime
    ? Math.min(100, (timeSpent / scheduledTime) * 100)
    : 0;
  const activeStreak = activeGoal?.focusStreak ?? activeGoal?.streak ?? 0;

  const notesCount = notes.length;
  const voiceNoteCount = notes.filter(note => note.type === 'voice').length;
  const pendingAgendaCount = agendaItems.filter(item => !item.completed).length;

  const sortedAgenda = useMemo(
    () => [...agendaItems].sort((a, b) => a.startTime.localeCompare(b.startTime)),
    [agendaItems]
  );

  const upcomingAgenda = useMemo(
    () => sortedAgenda.filter(item => !item.completed).slice(0, 3),
    [sortedAgenda]
  );

  const quickActionStatusLabel =
    focusTimer.status === 'running'
      ? 'Pause focus sprint'
      : focusTimer.status === 'paused'
      ? 'Resume focus sprint'
      : 'Start 25-minute focus sprint';

  const featureTabs = useMemo(
    () => [
      {
        id: 'workspace' as JourneyFeatureId,
        label: 'AI Output Workspace',
        icon: NotebookPen,
        badge: notesCount > 0 ? Math.min(notesCount, 99).toString() : undefined
      },
      {
        id: 'agenda' as JourneyFeatureId,
        label: 'Agenda Management',
        icon: CalendarClock,
        badge: agendaItems.length > 0 ? Math.min(agendaItems.length, 99).toString() : undefined
      },
      {
        id: 'quick-actions' as JourneyFeatureId,
        label: 'Quick Actions',
        icon: Zap,
        badge: focusTimer.status !== 'idle' ? '•' : undefined
      },
      {
        id: 'progress' as JourneyFeatureId,
        label: 'Progress Overview',
        icon: Target,
        badge: pendingAgendaCount > 0 ? pendingAgendaCount.toString() : undefined
      },
      {
        id: 'insights' as JourneyFeatureId,
        label: 'Blueprint Insights',
        icon: Sparkles
      }
    ],
    [agendaItems.length, focusTimer.status, notesCount, pendingAgendaCount]
  );

  const [activeFeature, setActiveFeature] = useState<JourneyFeatureId>('workspace');

  return (
    <TooltipProvider>
      <div className="space-y-4">
        <div className="rounded-2xl border border-border/60 bg-background/80 p-3">
          <div className="flex flex-wrap items-center gap-2">
            {featureTabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeFeature === tab.id;

              return (
                <Tooltip key={tab.id}>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant={isActive ? 'default' : 'outline'}
                      size="icon"
                      className={cn(
                        'relative h-10 w-10 shrink-0 rounded-xl',
                        isActive ? 'shadow-md' : 'bg-background'
                      )}
                      onClick={() => setActiveFeature(tab.id)}
                      aria-label={tab.label}
                      aria-pressed={isActive}
                    >
                      <Icon className="h-4 w-4" />
                      {tab.badge ? (
                        <span
                          className={cn(
                            'absolute -top-1 -right-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground',
                            tab.badge === '•' && 'min-w-[10px] px-0 text-base leading-none'
                          )}
                        >
                          {tab.badge}
                        </span>
                      ) : null}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{tab.label}</TooltipContent>
                </Tooltip>
              );
            })}
          </div>
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
        )}

        {activeFeature === 'agenda' && (
          <Card className="p-4 space-y-4">
            <div className="flex items-center gap-2">
              <CalendarClock className="h-4 w-4 text-secondary" />
              <h4 className="font-semibold text-sm">Agenda Management</h4>
            </div>

            <form onSubmit={handleAddAgendaItem} className="space-y-3">
              <div className="grid gap-2 sm:grid-cols-3">
                <Input
                  value={newAgendaTitle}
                  onChange={event => setNewAgendaTitle(event.target.value)}
                  placeholder="Focus activity"
                  className="text-sm"
                />
                <Input
                  type="time"
                  value={newAgendaStart}
                  onChange={event => setNewAgendaStart(event.target.value)}
                  className="text-sm"
                />
                <Input
                  type="number"
                  min={5}
                  value={newAgendaDuration}
                  onChange={event => setNewAgendaDuration(event.target.value)}
                  className="text-sm"
                  placeholder="Duration (min)"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Button type="submit" size="sm">
                  <CalendarClock className="mr-2 h-3.5 w-3.5" /> Schedule block
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleAddNextGoalTaskToAgenda}
                  disabled={!unscheduledGoalTasks.length}
                >
                  <ListTodo className="mr-2 h-3.5 w-3.5" /> Import next goal task
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={handleClearCompletedAgenda}
                  disabled={!agendaItems.some(item => item.completed)}
                >
                  <History className="mr-2 h-3.5 w-3.5" /> Clear completed
                </Button>
              </div>
            </form>

            <ScrollArea className="max-h-60 rounded-lg border border-border/60 bg-background/60">
              <div className="p-3 space-y-3">
                {agendaItems.length === 0 ? (
                  <p className="text-xs text-muted-foreground">
                    Build your day by scheduling focused blocks tied to your goals.
                  </p>
                ) : (
                  sortedAgenda.map(item => (
                    <div
                      key={item.id}
                      className={cn(
                        'rounded-lg border border-border/60 bg-background/80 p-3 transition-opacity',
                        item.completed && 'opacity-70'
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1 text-xs font-semibold text-foreground">
                              {item.completed ? (
                                <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                              ) : (
                                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                              )}
                              <span>{item.title}</span>
                            </div>
                            {item.locked && <Lock className="h-3.5 w-3.5 text-primary" />}
                          </div>
                          <p className="text-[11px] text-muted-foreground">
                            {toTimeRangeLabel(item.startTime, item.durationMinutes)} • {formatMinutes(item.durationMinutes)}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8"
                                onClick={() => handleToggleComplete(item.id)}
                              >
                                <CheckCircle2
                                  className={cn(
                                    'h-3.5 w-3.5',
                                    item.completed ? 'text-primary' : 'text-muted-foreground'
                                  )}
                                />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>{item.completed ? 'Mark as in progress' : 'Mark complete'}</TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8"
                                onClick={() => handleToggleLock(item.id)}
                              >
                                {item.locked ? (
                                  <Unlock className="h-3.5 w-3.5" />
                                ) : (
                                  <Lock className="h-3.5 w-3.5" />
                                )}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>{item.locked ? 'Unlock time block' : 'Lock to prevent changes'}</TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 text-destructive hover:text-destructive"
                                onClick={() => handleRemoveAgendaItem(item.id)}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Remove block</TooltipContent>
                          </Tooltip>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </Card>
        )}

        {activeFeature === 'quick-actions' && (
          <Card className="p-4 space-y-3">
            <div className="flex items-center space-x-2">
              <Zap className="h-4 w-4 text-primary" />
              <h4 className="font-semibold text-sm">Quick Actions</h4>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <Button variant="secondary" className="justify-start text-left" onClick={toggleFocusSession}>
                {focusTimer.status === 'running' ? (
                  <Pause className="mr-2 h-3.5 w-3.5" />
                ) : (
                  <Play className="mr-2 h-3.5 w-3.5" />
                )}
                <div className="flex flex-col items-start">
                  <span className="text-xs font-semibold">{quickActionStatusLabel}</span>
                  <span className="text-[11px] text-muted-foreground">
                    {focusTimer.status === 'idle'
                      ? 'Ready for your next deep work sprint'
                      : `${formatSecondsAsClock(focusTimer.remainingSeconds)} remaining`}
                  </span>
                </div>
              </Button>
              <Button variant="secondary" className="justify-start text-left" onClick={() => navigate('/dreams')}>
                <Target className="mr-2 h-3.5 w-3.5" />
                <div className="flex flex-col items-start">
                  <span className="text-xs font-semibold">Review journey timeline</span>
                  <span className="text-[11px] text-muted-foreground">Jump to your dream dashboard</span>
                </div>
              </Button>
              <Button variant="outline" className="justify-start text-left" onClick={() => exportNotes('md')}>
                <Download className="mr-2 h-3.5 w-3.5" />
                <div className="flex flex-col items-start">
                  <span className="text-xs font-semibold">Export workspace summary</span>
                  <span className="text-[11px] text-muted-foreground">Markdown file with notes and agenda</span>
                </div>
              </Button>
              <Button
                variant="outline"
                className="justify-start text-left"
                onClick={handleAddNextGoalTaskToAgenda}
                disabled={!unscheduledGoalTasks.length}
              >
                <ListTodo className="mr-2 h-3.5 w-3.5" />
                <div className="flex flex-col items-start">
                  <span className="text-xs font-semibold">Queue next goal task</span>
                  <span className="text-[11px] text-muted-foreground">
                    {unscheduledGoalTasks.length
                      ? `${unscheduledGoalTasks.length} remaining`
                      : 'All current tasks scheduled'}
                  </span>
                </div>
              </Button>
            </div>
            {!activeGoal && (
              <p className="text-xs text-muted-foreground">
                Select a goal in the main view to unlock contextual automations.
              </p>
            )}
          </Card>
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
          Personality-based tips and guidance will appear here once your blueprint is synced.
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

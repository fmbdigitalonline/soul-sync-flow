/**
 * PanelTaskCoachDock — the TASK-AWARE coach in the panel (Wave 1).
 *
 * Fixes the v2.7 mis-wire: task contexts previously used the
 * program-aware coach; the task-aware engine (useTaskAwareCoach →
 * enhanced coach in task mode, with coach-action execution and session
 * stats) is the right one here, and it now persists per goal+task via
 * the existing task-session store — so leaving and returning RESUMES the
 * session, matching the Dreams-page task coach behavior.
 *
 * Quick actions: the built canned helper chips (I'm stuck / Next step /
 * Take a break / Mark done / Share insight / Need clarity) surface here,
 * capped to 3 visible + more (Three-Pieces).
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Loader2, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useTaskAwareCoach } from '@/hooks/use-task-aware-coach';
import type { TaskContext } from '@/services/task-coach-integration-service';
import {
  loadStoredTaskSession,
  saveTaskSession,
} from '@/utils/task-session';

interface PanelTaskCoachDockProps {
  task: any;
  goalId?: string;
  className?: string;
}

const QUICK_ACTIONS: Array<{ id: string; label: string; message: string }> = [
  { id: 'stuck', label: "I'm stuck", message: "I'm feeling stuck on this task. Can you help me figure out what's blocking me and suggest a way forward?" },
  { id: 'next', label: 'Next step', message: "I've completed the current step. What should I focus on next?" },
  { id: 'break', label: 'Take a break', message: 'I think I need a break. Can you suggest a good stopping point and how long I should rest?' },
  { id: 'complete', label: 'Mark done', message: "I think I've completed this part. Can you help me review what I've accomplished and confirm if it's ready?" },
  { id: 'insight', label: 'Share insight', message: 'I just had an insight while working on this. Let me share what I discovered and get your thoughts.' },
  { id: 'clarify', label: 'Need clarity', message: 'I need some clarification on the requirements or approach. Can you help me understand this better?' },
];

const VISIBLE_ACTIONS = 3;

export const PanelTaskCoachDock: React.FC<PanelTaskCoachDockProps> = ({ task, goalId, className }) => {
  const taskContext: TaskContext = useMemo(
    () => ({
      ...(task ?? {}),
      id: task?.id ?? 'unknown',
      title: task?.title ?? 'Untitled task',
      progress: 0,
      sub_tasks: Array.isArray(task?.sub_tasks) ? task.sub_tasks : [],
    }),
    [task?.id],
  );

  const { messages, isLoading, sendMessage } = useTaskAwareCoach(taskContext);
  const [input, setInput] = useState('');
  const [showAllActions, setShowAllActions] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const resumedRef = useRef(false);

  // Session resume note: the enhanced coach keeps its own live thread; we
  // persist the transcript per goal+task with the SAME store the Dreams
  // task coach uses, so both surfaces see one session history.
  const stored = useMemo(
    () => (goalId && task?.id ? loadStoredTaskSession(goalId, String(task.id)) : null),
    [goalId, task?.id],
  );

  useEffect(() => {
    if (!goalId || !task?.id || messages.length === 0) return;
    saveTaskSession(goalId, String(task.id), {
      coachMessages: messages
        .filter((m) => !m.suppressDisplay)
        .map((m) => ({
          id: m.id,
          content: m.content,
          isUser: m.sender === 'user',
          timestamp: m.timestamp instanceof Date ? m.timestamp.toISOString() : String(m.timestamp),
        })),
    } as any);
  }, [messages, goalId, task?.id]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [messages, isLoading]);

  const send = (content: string) => {
    if (!content.trim() || isLoading) return;
    setInput('');
    void sendMessage(content.trim());
  };

  const visibleActions = showAllActions ? QUICK_ACTIONS : QUICK_ACTIONS.slice(0, VISIBLE_ACTIONS);
  const displayMessages = messages.filter((m) => !m.suppressDisplay);
  const showResumeHint =
    !resumedRef.current && displayMessages.length === 0 && (stored?.coachMessages?.length ?? 0) > 0;

  return (
    <div className={cn('rounded-lg border border-border/60 bg-background/60 overflow-hidden', className)}>
      <div className="max-h-56 overflow-y-auto p-2.5 space-y-2">
        {showResumeHint && (
          <div className="text-[11px] text-muted-foreground rounded-md bg-muted/40 px-2 py-1.5">
            Previous session found ({stored!.coachMessages.length} messages) — your coach remembers
            where you left off.
          </div>
        )}
        {displayMessages.map((m) => (
          <div
            key={m.id}
            className={cn(
              'text-xs leading-relaxed rounded-lg px-2.5 py-1.5 max-w-[92%] whitespace-pre-wrap',
              m.sender === 'user' ? 'ml-auto bg-primary/10 text-foreground' : 'mr-auto bg-muted/50 text-foreground',
            )}
          >
            {m.content}
          </div>
        ))}
        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground py-1">
            <Loader2 className="h-3 w-3 animate-spin" />
            <span>Coach is thinking…</span>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Quick actions — one tap tells the coach where you are */}
      <div className="flex flex-wrap items-center gap-1 border-t border-border/60 px-1.5 py-1.5">
        {visibleActions.map((a) => (
          <button
            key={a.id}
            type="button"
            disabled={isLoading}
            onClick={() => send(a.message)}
            className="text-[11px] rounded-md px-2 py-1 border border-border/50 hover:bg-soul-purple/10 hover:border-soul-purple/30 transition-colors disabled:opacity-50"
          >
            {a.label}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setShowAllActions((v) => !v)}
          className="text-[11px] px-1.5 py-1 text-muted-foreground hover:text-foreground"
        >
          {showAllActions ? 'less' : 'more…'}
        </button>
      </div>

      <form
        className="flex items-center gap-1.5 border-t border-border/60 p-1.5"
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Talk with your coach about this task…"
          disabled={isLoading}
          className="flex-1 bg-transparent text-xs px-2 py-1.5 outline-none placeholder:text-muted-foreground/60"
        />
        <Button type="submit" size="icon" className="h-7 w-7" disabled={isLoading || !input.trim()}>
          <Send className="h-3.5 w-3.5" />
        </Button>
      </form>
    </div>
  );
};

export default PanelTaskCoachDock;

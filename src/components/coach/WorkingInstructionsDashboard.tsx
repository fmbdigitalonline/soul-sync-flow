import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, AlertCircle, ListChecks, Clock, RefreshCw } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { WorkingInstructionsPanel } from './WorkingInstructionsPanel';
import type { WorkingInstruction } from '@/services/coach-message-parser';

interface StoredInstructionRow {
  task_id: string;
  instruction_id: string;
  title: string;
  description: string;
  time_estimate: string | null;
  tools_needed: unknown;
  order_index: number;
  updated_at: string;
}

interface TaskSessionLogRow {
  task_id: string;
  task_title: string;
  session_start: string | null;
}

interface TaskInstructionEntry {
  taskId: string;
  title: string;
  lastUpdated: string | null;
  instructionCount: number;
  instructions: WorkingInstruction[];
}

function toInstruction(row: StoredInstructionRow): WorkingInstruction {
  return {
    id: row.instruction_id,
    title: row.title,
    description: row.description,
    timeEstimate: row.time_estimate ?? undefined,
      toolsNeeded: Array.isArray(row.tools_needed)
        ? row.tools_needed.map(tool => String(tool))
      : undefined,
    completed: false
  };
}

function getRelativeTime(timestamp: string | null): string {
  if (!timestamp) {
    return 'Recently saved';
  }

  try {
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
  } catch (error) {
    console.warn('Failed to format timestamp', timestamp, error);
    return 'Recently saved';
  }
}

export const WorkingInstructionsDashboard: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [entries, setEntries] = useState<TaskInstructionEntry[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const loadInstructions = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('You need to be signed in to view your work instructions.');
      }

      const { data, error: fetchError } = await supabase
        .from('task_working_instructions')
        .select('task_id, instruction_id, title, description, time_estimate, tools_needed, order_index, updated_at')
        .eq('user_id', user.id)
        .order('task_id', { ascending: true })
        .order('order_index', { ascending: true });

      if (fetchError) {
        throw fetchError;
      }

      const grouped = new Map<string, { instructions: WorkingInstruction[]; lastUpdated: string | null }>();

      (data || []).forEach((row: StoredInstructionRow) => {
        const existing = grouped.get(row.task_id) || { instructions: [], lastUpdated: null };
        existing.instructions.push(toInstruction(row));

        if (!existing.lastUpdated || new Date(row.updated_at).getTime() > new Date(existing.lastUpdated).getTime()) {
          existing.lastUpdated = row.updated_at;
        }

        grouped.set(row.task_id, existing);
      });

      const taskIds = Array.from(grouped.keys());
      const titleMap = new Map<string, { title: string; lastSession: string | null }>();

      if (taskIds.length > 0) {
        const { data: sessionLogs, error: sessionError } = await supabase
          .from('task_coach_session_logs')
          .select('task_id, task_title, session_start')
          .eq('user_id', user.id)
          .in('task_id', taskIds)
          .order('session_start', { ascending: false });

        if (sessionError) {
          console.warn('Failed to load task session metadata', sessionError);
        } else {
          (sessionLogs || []).forEach((log: TaskSessionLogRow) => {
            if (!titleMap.has(log.task_id)) {
              titleMap.set(log.task_id, {
                title: log.task_title,
                lastSession: log.session_start
              });
            }
          });
        }
      }

      const nextEntries: TaskInstructionEntry[] = taskIds.map(taskId => {
        const groupedEntry = grouped.get(taskId)!;
        const titleEntry = titleMap.get(taskId);

        return {
          taskId,
          title: titleEntry?.title || `Task ${taskId.slice(0, 8)}`,
          lastUpdated: groupedEntry.lastUpdated || titleEntry?.lastSession || null,
          instructionCount: groupedEntry.instructions.length,
          instructions: groupedEntry.instructions
        };
      }).sort((a, b) => {
        const aTime = a.lastUpdated ? new Date(a.lastUpdated).getTime() : 0;
        const bTime = b.lastUpdated ? new Date(b.lastUpdated).getTime() : 0;
        return bTime - aTime;
      });

      setEntries(nextEntries);
      setSelectedTaskId(prev => {
        if (prev && nextEntries.some(entry => entry.taskId === prev)) {
          return prev;
        }
        return nextEntries[0]?.taskId || null;
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load your work instructions.';
      console.error('❌ Failed to load working instruction dashboard', err);
      setError(message);
      setEntries([]);
      setSelectedTaskId(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInstructions();
  }, [loadInstructions]);

  const selectedEntry = useMemo(() => {
    if (!selectedTaskId) return null;
    return entries.find(entry => entry.taskId === selectedTaskId) || null;
  }, [entries, selectedTaskId]);

  if (isLoading) {
    return (
      <Card className="p-8 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-green-600" />
        <p className="text-sm text-gray-600">Loading your saved work instructions…</p>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6 border-red-200 bg-red-50">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="space-y-2">
            <div>
              <h4 className="font-medium text-red-900">Unable to load instructions</h4>
              <p className="text-sm text-red-700">{error}</p>
            </div>
            <Button size="sm" onClick={loadInstructions} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try again
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  if (entries.length === 0) {
    return (
      <Card className="p-8 text-center border-dashed border-green-200 bg-green-50/60">
        <ListChecks className="h-10 w-10 mx-auto text-green-500 mb-3" />
        <h3 className="text-base font-semibold text-gray-800">No saved work instructions yet</h3>
        <p className="text-sm text-gray-600 mt-1">
          Ask your coach for a plan and your steps will be saved here automatically.
        </p>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[280px,1fr]">
      <Card className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ListChecks className="h-5 w-5 text-green-600" />
            <div>
              <h3 className="text-sm font-semibold text-gray-800">Saved work instructions</h3>
              <p className="text-xs text-gray-500">Pick a task to continue where you left off.</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="text-xs" onClick={loadInstructions}>
            <RefreshCw className="h-4 w-4 mr-1" />
            Refresh
          </Button>
        </div>

        <div className="space-y-2">
          {entries.map(entry => {
            const isSelected = entry.taskId === selectedTaskId;
            return (
              <button
                key={entry.taskId}
                type="button"
                onClick={() => setSelectedTaskId(entry.taskId)}
                className={`w-full text-left p-3 rounded-lg border transition-all ${
                  isSelected
                    ? 'border-green-500 bg-green-50/70 shadow-sm'
                    : 'border-gray-200 hover:border-green-400 hover:bg-green-50/40'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-sm font-medium text-gray-800 truncate">{entry.title}</h4>
                  <Badge variant={isSelected ? 'default' : 'outline'} className="text-xs">
                    {entry.instructionCount} {entry.instructionCount === 1 ? 'step' : 'steps'}
                  </Badge>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Updated {getRelativeTime(entry.lastUpdated)}
                </p>
              </button>
            );
          })}
        </div>
      </Card>

      <div className="space-y-3">
        {selectedEntry ? (
          <>
            <Card className="p-4 bg-white/90 border-green-200/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-600 to-green-500 flex items-center justify-center">
                  <ListChecks className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-800">{selectedEntry.title}</h4>
                  <p className="text-xs text-gray-600">
                    {selectedEntry.instructionCount} {selectedEntry.instructionCount === 1 ? 'step' : 'steps'} · Updated {getRelativeTime(selectedEntry.lastUpdated)}
                  </p>
                </div>
              </div>
            </Card>

            <WorkingInstructionsPanel
              instructions={selectedEntry.instructions}
              taskId={selectedEntry.taskId}
              onInstructionComplete={() => {}}
              onAllInstructionsComplete={() => {}}
              originalText={`Here are the saved working instructions for "${selectedEntry.title}".`}
              initialSource="stored"
            />
          </>
        ) : (
          <Card className="p-6 text-center">
            <Clock className="h-8 w-8 mx-auto text-green-500 mb-3" />
            <h4 className="text-sm font-semibold text-gray-800">Select a task</h4>
            <p className="text-xs text-gray-600">Choose a task from the list to view its work instructions.</p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default WorkingInstructionsDashboard;

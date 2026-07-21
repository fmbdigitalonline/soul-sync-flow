/**
 * PanelDecompositionCard — Slice F.
 *
 * Live progress card rendered inside the Coach panel while a
 * decompose_goal action is in flight. Listens on
 * `coach-workspace:decomposition` for start/complete/error phases.
 * The 4-stage animation mirrors the legacy DreamDecompositionPage,
 * compressed for the side panel. No new work is performed here —
 * the actual decomposition runs server-side via the oracle tool.
 */

import React, { useEffect, useMemo, useState } from 'react';
import { Brain, Target, MapPin, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
  onCoachDecomposition,
  type CoachDecompositionPhase,
} from '@/lib/coach-workspace-bus';

const STAGES = [
  { id: 'analyzing', label: 'Analyzing', icon: Brain, ms: 3000 },
  { id: 'milestones', label: 'Creating', icon: Target, ms: 5000 },
  { id: 'tasks', label: 'Designing', icon: MapPin, ms: 4000 },
  { id: 'finalizing', label: 'Preparing', icon: Sparkles, ms: 3000 },
] as const;

interface State {
  phase: CoachDecompositionPhase | 'idle';
  dreamTitle: string;
  error?: string;
  startedAt: number;
}

export const PanelDecompositionCard: React.FC = () => {
  const [state, setState] = useState<State>({ phase: 'idle', dreamTitle: '', startedAt: 0 });
  const [tick, setTick] = useState(0);

  useEffect(() => {
    return onCoachDecomposition((d) => {
      if (d.phase === 'start') {
        setState({ phase: 'start', dreamTitle: d.dreamTitle, startedAt: Date.now() });
      } else {
        setState((prev) => ({ ...prev, phase: d.phase, error: d.error }));
      }
    });
  }, []);

  useEffect(() => {
    if (state.phase !== 'start') return;
    const int = setInterval(() => setTick((v) => v + 1), 500);
    return () => clearInterval(int);
  }, [state.phase]);

  const { currentIndex, progress } = useMemo(() => {
    if (state.phase === 'complete') return { currentIndex: STAGES.length, progress: 100 };
    if (state.phase !== 'start') return { currentIndex: 0, progress: 0 };
    const elapsed = Date.now() - state.startedAt;
    let acc = 0;
    for (let i = 0; i < STAGES.length; i++) {
      const next = acc + STAGES[i].ms;
      if (elapsed < next) {
        const local = (elapsed - acc) / STAGES[i].ms;
        const overall = ((i + local) / STAGES.length) * 100;
        return { currentIndex: i, progress: Math.min(overall, 95) };
      }
      acc = next;
    }
    // If server is still working past total budget, hold at last stage at 95%.
    return { currentIndex: STAGES.length - 1, progress: 95 };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.phase, state.startedAt, tick]);

  if (state.phase === 'idle') return null;

  const isError = state.phase === 'error';
  const isDone = state.phase === 'complete';

  return (
    <Card className="p-3 ss-flow">
      <div className="flex items-start gap-3">
        <div
          className={cn(
            'mt-0.5 h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0',
            isError ? 'bg-destructive/10' : isDone ? 'bg-emerald-500/10' : 'bg-primary/10',
          )}
        >
          {isError ? (
            <AlertCircle className="h-4 w-4 text-destructive" />
          ) : isDone ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          ) : (
            <Sparkles className="h-4 w-4 text-primary animate-pulse" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            {isError ? 'Journey Error' : isDone ? 'Journey Ready' : 'Preparing Journey'}
          </p>
          <p className="text-sm font-medium text-foreground mt-0.5 truncate" title={state.dreamTitle}>
            {state.dreamTitle || 'Your dream'}
          </p>
          {isError && (
            <p className="text-xs text-destructive mt-1">{state.error ?? 'Something went wrong.'}</p>
          )}
          {!isError && (
            <>
              <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className={cn(
                    'h-full transition-all duration-500 ease-out',
                    isDone ? 'bg-emerald-500' : 'bg-primary',
                  )}
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="mt-2 flex items-center justify-between gap-1">
                {STAGES.map((s, i) => {
                  const active = i === currentIndex && !isDone;
                  const done = i < currentIndex || isDone;
                  const Icon = s.icon;
                  return (
                    <div key={s.id} className="flex flex-col items-center flex-1 min-w-0">
                      <div
                        className={cn(
                          'h-6 w-6 rounded-full flex items-center justify-center transition-colors',
                          done
                            ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                            : active
                              ? 'bg-primary/20 text-primary animate-pulse'
                              : 'bg-muted text-muted-foreground/50',
                        )}
                      >
                        {done ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Icon className="h-3 w-3" />}
                      </div>
                      <span
                        className={cn(
                          'text-[9px] mt-1 truncate w-full text-center',
                          active ? 'text-primary font-medium' : 'text-muted-foreground/70',
                        )}
                      >
                        {s.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </Card>
  );
};

export default PanelDecompositionCard;
/**
 * ActionHub — Slice B of the Coach Workspace panel (v2.5 IA).
 *
 * Compressed three-column kanban rendered inside the Action Hub section
 * of the CoachWorkspaceShell. Reads real state from useJourneyGoals; no
 * mock data (Directive 1). Applies the Three-Pieces Rule per column:
 * maximum 3 items visible, then "Show more" reveals the rest inline.
 *
 * Columns:
 *   - Focus  → active, incomplete milestones from the primary program.
 *   - Next   → upcoming milestones from other in-progress programs.
 *   - Done   → recently completed milestones (latest first).
 *
 * Non-destructive: reads only, no writes, no side effects.
 */

import React, { useMemo, useState } from 'react';
import { CheckCircle2, Circle, Flag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type { Goal, GoalMilestone } from '@/hooks/use-journey-goals';

interface ActionHubProps {
  goals: Goal[];
  isLoading: boolean;
  /** When set, milestone rows become buttons dispatching this callback. */
  onSelectMilestone?: (goalId: string, milestoneId: string) => void;
}

interface ColumnItem {
  id: string;
  goalId: string;
  title: string;
  goalTitle: string;
  completed: boolean;
}

const MAX_VISIBLE = 3;

export const ActionHub: React.FC<ActionHubProps> = ({ goals, isLoading, onSelectMilestone }) => {
  const { focus, next, done } = useMemo(() => partitionMilestones(goals), [goals]);

  if (isLoading) {
    return <p className="text-xs text-muted-foreground italic">Loading action hub…</p>;
  }

  if (focus.length === 0 && next.length === 0 && done.length === 0) {
    return (
      <p className="text-xs text-muted-foreground italic">
        No milestones yet. Start a coaching program from the conversation.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <Column label="Focus" icon={Flag} tone="primary" items={focus} onSelect={onSelectMilestone} />
      <Column label="Next" icon={Circle} tone="muted" items={next} onSelect={onSelectMilestone} />
      <Column label="Done" icon={CheckCircle2} tone="success" items={done} onSelect={onSelectMilestone} />
    </div>
  );
};

interface ColumnProps {
  label: string;
  icon: React.ElementType;
  tone: 'primary' | 'muted' | 'success';
  items: ColumnItem[];
  onSelect?: (goalId: string, milestoneId: string) => void;
}

const Column: React.FC<ColumnProps> = ({ label, icon: Icon, tone, items, onSelect }) => {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? items : items.slice(0, MAX_VISIBLE);
  const hidden = Math.max(0, items.length - MAX_VISIBLE);

  const toneClass =
    tone === 'primary'
      ? 'text-primary'
      : tone === 'success'
        ? 'text-emerald-600 dark:text-emerald-400'
        : 'text-muted-foreground';

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5">
        <Icon className={cn('h-3.5 w-3.5', toneClass)} />
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        <span className="text-[10px] text-muted-foreground/70">({items.length})</span>
      </div>
      {items.length === 0 ? (
        <p className="text-xs text-muted-foreground/70 italic pl-5">Nothing here yet.</p>
      ) : (
        <ul className="space-y-1">
          {visible.map((item) => {
            const clickable = !!onSelect && !item.completed;
            const inner = (
              <>
                <p
                  className={cn(
                    'text-xs font-medium truncate',
                    item.completed ? 'line-through text-muted-foreground' : 'text-foreground',
                  )}
                  title={item.title}
                >
                  {item.title}
                </p>
                <p className="text-[10px] text-muted-foreground/70 truncate" title={item.goalTitle}>
                  {item.goalTitle}
                </p>
              </>
            );
            return (
              <li key={item.id}>
                {clickable ? (
                  <button
                    type="button"
                    onClick={() => onSelect!(item.goalId, item.id)}
                    className="w-full text-left pl-5 pr-2 py-1.5 rounded-md hover:bg-muted/40 transition-colors"
                  >
                    {inner}
                  </button>
                ) : (
                  <div className="pl-5 pr-2 py-1.5 rounded-md">{inner}</div>
                )}
              </li>
            );
          })}
        </ul>
      )}
      {hidden > 0 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setExpanded((v) => !v)}
          className="h-6 px-2 ml-5 text-[10px] text-muted-foreground hover:text-foreground"
        >
          {expanded ? 'Show less' : `Show ${hidden} more`}
        </Button>
      )}
    </div>
  );
};

function partitionMilestones(goals: Goal[]): {
  focus: ColumnItem[];
  next: ColumnItem[];
  done: ColumnItem[];
} {
  const focus: ColumnItem[] = [];
  const next: ColumnItem[] = [];
  const done: ColumnItem[] = [];

  // Sort goals: active (progress<100) first, then by progress desc for priority.
  const active = goals
    .filter((g) => (g.progress ?? 0) < 100 && (g.milestones?.length ?? 0) > 0)
    .sort((a, b) => (b.progress ?? 0) - (a.progress ?? 0));
  const completedGoals = goals.filter((g) => (g.progress ?? 0) >= 100);

  // Primary program = highest-progress active goal → its incomplete milestones go to Focus.
  const primary = active[0];
  if (primary) {
    for (const m of sortMilestones(primary.milestones)) {
      if (!m.completed) {
        focus.push(toItem(m, primary));
      } else {
        done.push(toItem(m, primary));
      }
    }
  }

  // Other active goals → incomplete milestones go to Next; completed to Done.
  for (const g of active.slice(1)) {
    for (const m of sortMilestones(g.milestones)) {
      if (!m.completed) {
        next.push(toItem(m, g));
      } else {
        done.push(toItem(m, g));
      }
    }
  }

  // Fully completed goals → all milestones to Done.
  for (const g of completedGoals) {
    for (const m of sortMilestones(g.milestones)) {
      done.push(toItem(m, g));
    }
  }

  // Done: latest-first (reverse order_index proxy). Cap surface size implicitly via Show more.
  done.reverse();

  return { focus, next, done };
}

function sortMilestones(ms: GoalMilestone[]): GoalMilestone[] {
  return [...ms].sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0));
}

function toItem(m: GoalMilestone, goal: Goal): ColumnItem {
  return { id: m.id, goalId: goal.id, title: m.title, goalTitle: goal.title, completed: m.completed };
}

export default ActionHub;
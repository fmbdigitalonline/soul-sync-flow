/**
 * PanelMilestoneView — Slice G+H.
 *
 * Single-milestone detail rendered inside the Actions section of the
 * Coach panel. Three-Pieces Rule: 3 blueprint traits + up to 3 sibling
 * milestones surfaced as "next steps", then "Show more".
 *
 * Reads real data from useJourneyGoals — no fabricated tasks (Directive 1).
 * The "Continue in chat" button hands off to the Twin, keeping the panel
 * as the acting surface only.
 */

import React, { useMemo, useState } from 'react';
import { Calendar, Sparkles, ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Goal, GoalMilestone } from '@/hooks/use-journey-goals';
import { useTaskBoard, type BoardTask } from '@/hooks/use-task-board';

interface PanelMilestoneViewProps {
  goal: Goal;
  milestone: GoalMilestone;
  onSelectMilestone: (milestoneId: string) => void;
  onOpenTask?: (task: BoardTask) => void;
}

const MAX = 3;

export const PanelMilestoneView: React.FC<PanelMilestoneViewProps> = ({
  goal,
  milestone,
  onSelectMilestone,
  onOpenTask,
}) => {
  const [showAllTraits, setShowAllTraits] = useState(false);
  const [showAllNext, setShowAllNext] = useState(false);
  const [showAllTasks, setShowAllTasks] = useState(false);
  // Focus mode (Wave 3): the milestone's own tasks, right here.
  const { tasks: boardTasks } = useTaskBoard();
  const milestoneTasks = useMemo(
    () =>
      boardTasks.filter(
        (t) => t.goalId === goal.id && (!t.milestone_id || t.milestone_id === milestone.id),
      ),
    [boardTasks, goal.id, milestone.id],
  );
  const visibleTasks = showAllTasks ? milestoneTasks : milestoneTasks.slice(0, MAX);
  const hiddenTasks = Math.max(0, milestoneTasks.length - MAX);

  const traits = goal.alignedWith ?? [];
  const visibleTraits = showAllTraits ? traits : traits.slice(0, MAX);
  const hiddenTraits = Math.max(0, traits.length - MAX);

  const siblings = useMemo(
    () =>
      [...goal.milestones]
        .sort((a, b) => a.order_index - b.order_index)
        .filter((m) => m.id !== milestone.id && !m.completed),
    [goal.milestones, milestone.id],
  );
  const visibleNext = showAllNext ? siblings : siblings.slice(0, MAX);
  const hiddenNext = Math.max(0, siblings.length - MAX);

  return (
    <div className="space-y-3">
      {/* Milestone header */}
      <Card className="p-3 ss-flow">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-primary/80">
              Current Milestone
            </p>
            <p className="text-sm font-medium text-foreground mt-0.5">{milestone.title}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5 truncate" title={goal.title}>
              {goal.title}
            </p>
            {goal.deadline && (
              <div className="flex items-center gap-1 mt-2 text-[11px] text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>{new Date(goal.deadline).toLocaleDateString()}</span>
              </div>
            )}
          </div>
          <Badge variant="outline" className="text-[10px] flex-shrink-0">
            {milestone.completed ? 'Done' : 'In progress'}
          </Badge>
        </div>
      </Card>

      {/* Blueprint alignment — Three-Pieces */}
      {traits.length > 0 && (
        <section className="space-y-1.5">
          <div className="flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Blueprint Alignment
            </span>
          </div>
          <ul className="space-y-1">
            {visibleTraits.map((t, i) => (
              <li
                key={`${t}-${i}`}
                className="text-xs text-foreground pl-5 pr-2 py-1 rounded-md bg-muted/30"
              >
                {t}
              </li>
            ))}
          </ul>
          {hiddenTraits > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAllTraits((v) => !v)}
              className="h-6 px-2 ml-5 text-[10px] text-muted-foreground hover:text-foreground"
            >
              {showAllTraits ? 'Show less' : `Show ${hiddenTraits} more`}
            </Button>
          )}
        </section>
      )}

      {/* Focus mode (Wave 3): this milestone's tasks, workable in place */}
      {milestoneTasks.length > 0 && onOpenTask && (
        <section className="space-y-1.5">
          <div className="flex items-center gap-1.5">
            <ArrowRight className="h-3.5 w-3.5 text-primary" />
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Tasks
            </span>
            <span className="text-[10px] text-muted-foreground/70">
              ({milestoneTasks.filter((t) => t.status === 'completed').length}/{milestoneTasks.length})
            </span>
          </div>
          <ul className="space-y-1">
            {visibleTasks.map((t) => (
              <li key={t.id}>
                <button
                  type="button"
                  onClick={() => onOpenTask(t)}
                  className="w-full text-left pl-5 pr-2 py-1.5 rounded-md hover:bg-muted/40 transition-colors"
                >
                  <p
                    className={
                      t.status === 'completed'
                        ? 'text-xs truncate line-through text-muted-foreground'
                        : 'text-xs text-foreground truncate'
                    }
                  >
                    {t.title}
                  </p>
                </button>
              </li>
            ))}
          </ul>
          {hiddenTasks > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAllTasks((v) => !v)}
              className="h-6 px-2 ml-5 text-[10px] text-muted-foreground hover:text-foreground"
            >
              {showAllTasks ? 'Show less' : `Show ${hiddenTasks} more`}
            </Button>
          )}
        </section>
      )}

      {/* Next steps = sibling milestones in the same program */}
      <section className="space-y-1.5">
        <div className="flex items-center gap-1.5">
          <ArrowRight className="h-3.5 w-3.5 text-primary" />
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Next Steps
          </span>
        </div>
        {siblings.length === 0 ? (
          <p className="text-xs text-muted-foreground/70 italic pl-5">
            No further milestones queued.
          </p>
        ) : (
          <ul className="space-y-1">
            {visibleNext.map((m) => (
              <li key={m.id}>
                <button
                  type="button"
                  onClick={() => onSelectMilestone(m.id)}
                  className="w-full text-left pl-5 pr-2 py-1.5 rounded-md hover:bg-muted/40 transition-colors"
                >
                  <p className="text-xs text-foreground truncate">{m.title}</p>
                </button>
              </li>
            ))}
          </ul>
        )}
        {hiddenNext > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAllNext((v) => !v)}
            className="h-6 px-2 ml-5 text-[10px] text-muted-foreground hover:text-foreground"
          >
            {showAllNext ? 'Show less' : `Show ${hiddenNext} more`}
          </Button>
        )}
      </section>

      {/* Founder correction Jul 19: the program-aware (spiritual-growth
          register) dock was the WRONG coach for achievement contexts and
          is removed. Coaching happens per task, in the real
          TaskCoachInterface, one tap away in the Tasks list above. */}
    </div>
  );
};

export default PanelMilestoneView;
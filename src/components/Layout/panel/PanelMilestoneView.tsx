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
import { PanelCoachDock } from './PanelCoachDock';

interface PanelMilestoneViewProps {
  goal: Goal;
  milestone: GoalMilestone;
  onSelectMilestone: (milestoneId: string) => void;
}

const MAX = 3;

export const PanelMilestoneView: React.FC<PanelMilestoneViewProps> = ({
  goal,
  milestone,
  onSelectMilestone,
}) => {
  const [showAllTraits, setShowAllTraits] = useState(false);
  const [showAllNext, setShowAllNext] = useState(false);

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
      <Card className="p-3 border-primary/30 bg-primary/5">
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

      {/* The Coach's own dialogue, in the panel (v2.7: twin chat stays
          clean — no prompt handoffs to the Twin's stream) */}
      <PanelCoachDock
        contextKey={`milestone_${goal.id}_${milestone.id}`}
        seedPrompt={`I want to work on the milestone "${milestone.title}" (part of "${goal.title}"). Coach me into it.`}
        placeholder="Talk with your coach about this milestone…"
      />
    </div>
  );
};

export default PanelMilestoneView;
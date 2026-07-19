/**
 * PanelHabits — the rhythm layer, compressed (Wave 3).
 *
 * The built habit engine (use-habits, DB-backed) surfaced in the Action
 * Hub: today's habits with one-tap completion and streaks. Three-Pieces:
 * capped at 3 + Show more; renders nothing when the user has no habits
 * (no dead empty state inside a shared drawer).
 */

import React, { useState } from 'react';
import { CheckCircle2, Circle, Flame } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useHabits } from '@/hooks/use-habits';

const MAX = 3;

export const PanelHabits: React.FC = () => {
  const { habits, isLoading, markHabitComplete } = useHabits();
  const [showAll, setShowAll] = useState(false);

  if (isLoading || habits.length === 0) return null;

  const doneToday = habits.filter((h) => h.completedToday).length;
  const visible = showAll ? habits : habits.slice(0, MAX);
  const hidden = Math.max(0, habits.length - MAX);

  return (
    <div className="space-y-1.5 pt-1">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Habits
        </p>
        <span className="text-[10px] text-muted-foreground/70">
          {doneToday}/{habits.length} today
        </span>
      </div>
      <ul className="space-y-1">
        {visible.map((h) => (
          <li key={h.id} className="flex items-center gap-2">
            <button
              type="button"
              disabled={h.completedToday}
              onClick={() => void markHabitComplete(h.id)}
              className={cn(
                'flex items-center gap-2 min-w-0 flex-1 text-left rounded-md px-2 py-1.5 transition-colors',
                h.completedToday ? 'opacity-70' : 'hover:bg-muted/40',
              )}
              title={h.title}
            >
              {h.completedToday ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              ) : (
                <Circle className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              )}
              <span
                className={cn(
                  'text-xs truncate',
                  h.completedToday ? 'line-through text-muted-foreground' : 'text-foreground',
                )}
              >
                {h.title}
              </span>
            </button>
            {h.streak > 0 && (
              <span className="flex items-center gap-0.5 text-[10px] text-amber-600 dark:text-amber-400 shrink-0">
                <Flame className="h-3 w-3" />
                {h.streak}
              </span>
            )}
          </li>
        ))}
      </ul>
      {hidden > 0 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowAll((v) => !v)}
          className="h-6 px-2 text-[10px] text-muted-foreground hover:text-foreground"
        >
          {showAll ? 'Show less' : `Show ${hidden} more`}
        </Button>
      )}
    </div>
  );
};

export default PanelHabits;

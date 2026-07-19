/**
 * PanelProgramsSection — both program kinds, side by side, each speaking
 * its own progress language (Constitution v2.6 two-engine law; v2.7
 * twin-chat-clean: transformation coaching happens in the in-panel dock).
 *
 * 🎯 Achievement programs (user_goals via useJourneyGoals): outcome
 *    language — progress %, milestones done. Tap = state navigation to
 *    the next open milestone in Actions (which hosts its own coach dock).
 * 🌱 Transformation programs (growth_programs, active): inner-change
 *    language — week N of M, the pattern that seeded it. Expanding opens
 *    the program's own coach dock (same transform_<id> session the
 *    intake started — the conversation continues, not restarts).
 *
 * Three-Pieces Rule: each kind capped at 3 with Show more; honest empty
 * states with no dead text.
 */

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { Goal } from '@/hooks/use-journey-goals';
import { DOMAIN_LABELS } from '@/services/transformation-intake-service';
import { PanelCoachDock } from './PanelCoachDock';
import { useResumableTasks, type ResumableTask } from '@/hooks/use-resumable-tasks';
import { Play } from 'lucide-react';

const MAX = 3;

interface PanelProgramsSectionProps {
  goals: Goal[];
  isLoading: boolean;
  onOpenMilestone: (goalId: string, milestoneId: string) => void;
  onResumeTask?: (goalId: string, task: ResumableTask) => void;
}

export const PanelProgramsSection: React.FC<PanelProgramsSectionProps> = ({
  goals,
  isLoading,
  onOpenMilestone,
  onResumeTask,
}) => {
  const { user } = useAuth();
  // Resume chips (Wave 1 round 2): tasks with a saved coach session get a
  // one-tap way back in — the built resumable-tasks machinery, surfaced.
  const { resumableTasksByGoal } = useResumableTasks();
  const [showAllAchievement, setShowAllAchievement] = useState(false);
  const [showAllTransformation, setShowAllTransformation] = useState(false);
  const [openTransformId, setOpenTransformId] = useState<string | null>(null);

  const { data: transformPrograms = [], isLoading: loadingTransform } = useQuery({
    queryKey: ['panel-transform-programs', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('growth_programs')
        .select('id, domain, current_week, total_weeks, blueprint_params, created_at')
        .eq('user_id', user!.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const visibleGoals = showAllAchievement ? goals : goals.slice(0, MAX);
  const visibleTransforms = showAllTransformation
    ? transformPrograms
    : transformPrograms.slice(0, MAX);

  const nothingYet =
    !isLoading && !loadingTransform && goals.length === 0 && transformPrograms.length === 0;

  if (nothingYet) {
    return (
      <p className="text-xs text-muted-foreground italic">
        No programs yet — select a sentence in the conversation to start one.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {/* 🎯 Achievement — outcome language */}
      {goals.length > 0 && (
        <section className="space-y-1">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            🎯 Achievement
          </p>
          <ul className="space-y-1">
            {visibleGoals.map((g) => {
              const nextMilestone = g.milestones.find((m) => !m.completed);
              const done = g.milestones.filter((m) => m.completed).length;
              const resumable = resumableTasksByGoal.get(g.id) ?? [];
              const resumeTask = resumable[0];
              return (
                <li key={g.id}>
                  <button
                    type="button"
                    disabled={!nextMilestone}
                    onClick={() => nextMilestone && onOpenMilestone(g.id, nextMilestone.id)}
                    className="w-full text-left rounded-md px-2 py-1.5 hover:bg-muted/40 transition-colors disabled:opacity-70"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-medium text-foreground truncate">{g.title}</p>
                      <span className="text-[11px] text-muted-foreground shrink-0">{g.progress}%</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      {done}/{g.milestones.length} milestones
                      {nextMilestone ? ` · next: ${nextMilestone.title}` : ' · complete'}
                    </p>
                  </button>
                  {resumeTask && onResumeTask && (
                    <button
                      type="button"
                      onClick={() => onResumeTask(g.id, resumeTask)}
                      className="ml-2 mt-0.5 flex items-center gap-1.5 text-[11px] rounded-md px-2 py-1 border border-primary/25 bg-primary/5 hover:bg-primary/10 transition-colors text-foreground"
                      title={resumeTask.title}
                    >
                      <Play className="h-3 w-3 text-primary" />
                      <span className="truncate max-w-[200px]">Resume: {resumeTask.title}</span>
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
          {goals.length > MAX && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAllAchievement((v) => !v)}
              className="h-6 px-2 text-[10px] text-muted-foreground hover:text-foreground"
            >
              {showAllAchievement ? 'Show less' : `Show ${goals.length - MAX} more`}
            </Button>
          )}
        </section>
      )}

      {/* 🌱 Transformation — inner-change language */}
      {transformPrograms.length > 0 && (
        <section className="space-y-1">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            🌱 Transformation
          </p>
          <ul className="space-y-1">
            {visibleTransforms.map((p: any) => {
              const pattern = p.blueprint_params?.pattern_seed as string | undefined;
              const label = pattern || DOMAIN_LABELS[p.domain as keyof typeof DOMAIN_LABELS] || p.domain;
              const isOpen = openTransformId === p.id;
              return (
                <li key={p.id} className="rounded-md overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setOpenTransformId(isOpen ? null : p.id)}
                    className="w-full text-left rounded-md px-2 py-1.5 hover:bg-muted/40 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-medium text-foreground truncate">“{label}”</p>
                      {isOpen ? (
                        <ChevronDown className="h-3 w-3 text-muted-foreground shrink-0" />
                      ) : (
                        <ChevronRight className="h-3 w-3 text-muted-foreground shrink-0" />
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Week {p.current_week} of {p.total_weeks}
                      {pattern ? ` · ${DOMAIN_LABELS[p.domain as keyof typeof DOMAIN_LABELS] ?? p.domain}` : ''}
                    </p>
                  </button>
                  {isOpen && (
                    <div className="px-1 pb-1">
                      {/* Same transform_<id> session the intake opened —
                          the coaching conversation continues. */}
                      <PanelCoachDock
                        contextKey={`transform_${p.id}`}
                        seedPrompt={`I'm continuing my transformation program around "${label}" — week ${p.current_week} of ${p.total_weeks}. Where were we, and what's this week asking of me?`}
                        placeholder="Talk with your coach about this program…"
                      />
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
          {transformPrograms.length > MAX && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAllTransformation((v) => !v)}
              className="h-6 px-2 text-[10px] text-muted-foreground hover:text-foreground"
            >
              {showAllTransformation ? 'Show less' : `Show ${transformPrograms.length - MAX} more`}
            </Button>
          )}
        </section>
      )}

      {(isLoading || loadingTransform) && goals.length === 0 && transformPrograms.length === 0 && (
        <p className="text-xs text-muted-foreground">Loading your programs…</p>
      )}
    </div>
  );
};

export default PanelProgramsSection;

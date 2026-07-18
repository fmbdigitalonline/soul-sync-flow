/**
 * PanelDreamFlow — panel-hosted dream composition flow.
 *
 * Renders the existing dream engine (DreamDecompositionPage + success
 * components) inside the Coach side panel when the WorkspaceContext has
 * a `pendingIntake`. Per the two-surface law: the conversation triggers,
 * the workspace executes. Per the intake-frozen ruling: the card values
 * are the intake — we skip the form and go straight to staged build.
 *
 * Three-Pieces Rule: milestones and tasks are capped at 3 with a
 * "Show more" affordance so the panel never overwhelms.
 */

import React, { useMemo, useState } from 'react';
import { X, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useBlueprintCache } from '@/contexts/BlueprintCacheContext';
import { DreamDecompositionPage } from '@/components/dream/DreamDecompositionPage';
import { MilestonesRoadmap } from '@/components/dream/success/MilestonesRoadmap';
import { RecommendedTask } from '@/components/dream/success/RecommendedTask';
import { emitCoachDecomposition } from '@/lib/coach-workspace-bus';
import { toast } from 'sonner';

type Phase = 'building' | 'ready';

const MAX_ITEMS = 3;

export const PanelDreamFlow: React.FC = () => {
  const { pendingIntake, clearPendingIntake } = useWorkspace();
  const { blueprintData } = useBlueprintCache();
  const [phase, setPhase] = useState<Phase>('building');
  const [decomposedGoal, setDecomposedGoal] = useState<any>(null);
  const [showAllMilestones, setShowAllMilestones] = useState(false);

  if (!pendingIntake) return null;

  const handleComplete = (goal: any) => {
    setDecomposedGoal(goal);
    setPhase('ready');
    emitCoachDecomposition({
      phase: 'complete',
      dreamTitle: goal?.title ?? pendingIntake.title,
    });
  };

  const handleDismiss = () => {
    setDecomposedGoal(null);
    setPhase('building');
    setShowAllMilestones(false);
    clearPendingIntake();
  };

  const milestones: any[] = decomposedGoal?.milestones ?? [];
  const tasks: any[] = decomposedGoal?.tasks ?? [];
  const visibleMilestones = showAllMilestones ? milestones : milestones.slice(0, MAX_ITEMS);
  const hiddenMilestoneCount = Math.max(0, milestones.length - MAX_ITEMS);
  const firstTask = tasks[0];

  return (
    <Card className="p-3 border-primary/30 bg-primary/5 space-y-3">
      <div className="flex items-center justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            {phase === 'building' ? 'Building your journey' : 'Journey ready'}
          </p>
          <p
            className="text-sm font-medium text-foreground mt-0.5 truncate"
            title={pendingIntake.title}
          >
            {pendingIntake.title}
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 flex-shrink-0"
          onClick={handleDismiss}
          aria-label="Close dream flow"
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>

      {phase === 'building' && (
        <div className="relative rounded-lg overflow-hidden bg-background/60 [&_.min-h-screen]:min-h-0 [&_.min-h-screen]:p-3">
          <DreamDecompositionPage
            dreamTitle={pendingIntake.title}
            dreamCategory={pendingIntake.category}
            dreamTimeframe={pendingIntake.timeframe}
            blueprintData={blueprintData}
            onComplete={handleComplete}
          />
        </div>
      )}

      {phase === 'ready' && (
        <div className="space-y-3">
          {milestones.length > 0 && (
            <div className="space-y-2">
              <div className="[&_.rounded-2xl]:rounded-lg [&_.shadow-lg]:shadow-none">
                <MilestonesRoadmap
                  milestones={visibleMilestones}
                  isHighlighted={false}
                  onMilestoneClick={(m) => {
                    // Handoff to Twin: ask the coach about this milestone.
                    if (typeof window !== 'undefined') {
                      window.dispatchEvent(
                        new CustomEvent('coach-workspace:ask', {
                          detail: { prompt: `Tell me more about the milestone "${m.title}".` },
                        }),
                      );
                    }
                  }}
                />
              </div>
              {hiddenMilestoneCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAllMilestones((v) => !v)}
                  className="h-7 px-2 text-[11px] text-muted-foreground hover:text-foreground w-full justify-start"
                >
                  {showAllMilestones ? 'Show less' : `Show ${hiddenMilestoneCount} more`}
                  <ChevronRight className="ml-1 h-3 w-3" />
                </Button>
              )}
            </div>
          )}

          {firstTask && (
            <div className="[&_.rounded-2xl]:rounded-lg">
              <RecommendedTask
                task={firstTask}
                isHighlighted={false}
                onStartTask={(task) => {
                  toast.success(`Starting "${task.title}"`);
                  if (typeof window !== 'undefined') {
                    window.dispatchEvent(
                      new CustomEvent('coach-workspace:ask', {
                        detail: { prompt: `Help me start: "${task.title}".` },
                      }),
                    );
                  }
                }}
              />
            </div>
          )}

          {milestones.length === 0 && !firstTask && (
            <p className="text-xs text-muted-foreground italic">
              Journey created. Ask your companion what to do next.
            </p>
          )}
        </div>
      )}
    </Card>
  );
};

export default PanelDreamFlow;
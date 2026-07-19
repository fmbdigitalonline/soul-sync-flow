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

import React from 'react';
import { X, ChevronRight, RotateCcw, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useBlueprintCache } from '@/contexts/BlueprintCacheContext';
import { DreamDecompositionPage } from '@/components/dream/DreamDecompositionPage';
import { MilestonesRoadmap } from '@/components/dream/success/MilestonesRoadmap';
import { RecommendedTask } from '@/components/dream/success/RecommendedTask';
import { emitCoachDecomposition } from '@/lib/coach-workspace-bus';
import { toast } from 'sonner';

const MAX_ITEMS = 3;

export const PanelDreamFlow: React.FC = () => {
  const {
    pendingIntake,
    clearPendingIntake,
    dreamFlow,
    patchDreamFlow,
    setActionSelection,
    setSelectedTask,
    openWorkspaceSection,
  } = useWorkspace();
  const { blueprintData } = useBlueprintCache();

  if (!pendingIntake) return null;

  const { phase, decomposedGoal, showAllMilestones, dismissed } = dreamFlow;

  // Non-destructive close: collapse to a chip so the built goal survives.
  if (dismissed) {
    return (
      <Card className="p-2 border-primary/20 bg-primary/5 flex items-center gap-2">
        <p className="text-[11px] text-muted-foreground flex-1 truncate">
          Journey card hidden{decomposedGoal ? ` · ${pendingIntake.title}` : ''}
        </p>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 px-2 text-[11px]"
          onClick={() => patchDreamFlow({ dismissed: false })}
        >
          Reopen
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={() => {
            clearPendingIntake();
          }}
          aria-label="Discard journey"
          title="Discard and start over"
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      </Card>
    );
  }

  const handleComplete = (goal: any) => {
    patchDreamFlow({ decomposedGoal: goal, phase: 'ready' });
    emitCoachDecomposition({
      phase: 'complete',
      dreamTitle: goal?.title ?? pendingIntake.title,
    });
  };

  // × collapses the card; state is preserved. "Start a new journey" fully clears.
  const handleCollapse = () => patchDreamFlow({ dismissed: true });
  const handleNewJourney = () => clearPendingIntake();

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
        <div className="flex items-center gap-1 flex-shrink-0">
          {phase === 'ready' && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={handleNewJourney}
              aria-label="Start a new journey"
              title="Start a new journey"
            >
              <Plus className="h-3.5 w-3.5" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={handleCollapse}
            aria-label="Hide journey card"
            title="Hide (keeps journey)"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {phase === 'building' && !decomposedGoal && (
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
          {/* Wave 2: the success moment gets its celebration back */}
          <p className="text-xs text-foreground rounded-md bg-primary/10 px-2.5 py-1.5">
            🎉 Your journey is designed — {milestones.length} milestones, shaped by your blueprint.
          </p>
          {milestones.length > 0 && (
            <div className="space-y-2">
              <div className="[&_.rounded-2xl]:rounded-lg [&_.shadow-lg]:shadow-none">
                <MilestonesRoadmap
                  milestones={visibleMilestones}
                  isHighlighted={false}
                  onMilestoneClick={(m) => {
                    if (decomposedGoal?.id && m?.id) {
                      setActionSelection({ goalId: String(decomposedGoal.id), milestoneId: String(m.id) });
                      openWorkspaceSection('actions');
                      toast.message('Milestone opened in Action Hub', { duration: 1200 });
                    } else {
                      console.error('PanelDreamFlow: cannot open milestone without goal and milestone IDs', {
                        goalId: decomposedGoal?.id,
                        milestoneId: m?.id,
                      });
                      toast.error('Could not open this milestone yet.');
                    }
                  }}
                />
              </div>
              {hiddenMilestoneCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => patchDreamFlow({ showAllMilestones: !showAllMilestones })}
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
                  setSelectedTask({ goalId: decomposedGoal?.id ? String(decomposedGoal.id) : undefined, task });
                  openWorkspaceSection('actions');
                  toast.success(`Task opened: ${task.title}`);
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
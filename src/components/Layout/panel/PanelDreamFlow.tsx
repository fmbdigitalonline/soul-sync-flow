/**
 * PanelDreamFlow — the "Help me achieve this" guided sequence (v2.9).
 *
 * One moment at a time. At any point the panel shows ONE thing the user
 * can do next; everything else is either already done, tucked behind
 * "See the plan", or waits until the current moment is complete.
 *
 *   building  → decomposition feedback (unavoidable, engine is thinking)
 *   milestone → "Here's where I suggest we start" + Start today's step
 *   task      → "Here's your first step" + Start
 *   working   → real TaskCoachInterface (Mark done handles completion)
 *   done      → calm acknowledgement + What's next / See progress / See plan
 *
 * Explicit rule (developer note, Jul 19): "Show more" reveals context
 * for the CURRENT moment only — never the full six-section IA. That is
 * enforced structurally: this component does not render section drawers.
 */

import React from 'react';
import { X, ChevronLeft, Clock, Sunrise } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useBlueprintCache } from '@/contexts/BlueprintCacheContext';
import { DreamDecompositionPage } from '@/components/dream/DreamDecompositionPage';
import { MilestonesRoadmap } from '@/components/dream/success/MilestonesRoadmap';
import { PanelTaskView } from './PanelTaskView';
import { emitCoachDecomposition } from '@/lib/coach-workspace-bus';

export const PanelDreamFlow: React.FC = () => {
  const {
    pendingIntake,
    clearPendingIntake,
    dreamFlow,
    patchDreamFlow,
  } = useWorkspace();
  const { blueprintData } = useBlueprintCache();

  if (!pendingIntake) return null;

  const { phase, decomposedGoal, dismissed, momentStage, showPlan } = dreamFlow;

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
    patchDreamFlow({ decomposedGoal: goal, phase: 'ready', momentStage: 'milestone' });
    emitCoachDecomposition({
      phase: 'complete',
      dreamTitle: goal?.title ?? pendingIntake.title,
    });
  };

  // ─── Moment 0 — still building. Unavoidable feedback: the engine is
  // thinking, and the user needs to know something is happening. ────
  if (phase === 'building' || !decomposedGoal) {
    return (
      <Card className="p-3 border-primary/30 bg-primary/5 space-y-2">
        <MomentHeader
          eyebrow="Creating your plan"
          onClose={() => patchDreamFlow({ dismissed: true })}
        />
        <div className="relative rounded-lg overflow-hidden bg-background/60 [&_.min-h-screen]:min-h-0 [&_.min-h-screen]:p-3">
          <DreamDecompositionPage
            dreamTitle={pendingIntake.title}
            dreamCategory={pendingIntake.category}
            dreamTimeframe={pendingIntake.timeframe}
            blueprintData={blueprintData}
            onComplete={handleComplete}
          />
        </div>
      </Card>
    );
  }

  const milestones: any[] = Array.isArray(decomposedGoal?.milestones) ? decomposedGoal.milestones : [];
  const tasks: any[] = Array.isArray(decomposedGoal?.tasks) ? decomposedGoal.tasks : [];
  const firstMilestone = milestones.find((m: any) => !m?.completed) ?? milestones[0];
  const firstTask = tasks[0];

  // Local disclosure: "See the plan" reveals the roadmap without exiting
  // the current moment. Rule from developer: Show more = current-moment
  // context only, not the full workspace IA.
  if (showPlan) {
    return (
      <Card className="p-3 border-primary/30 bg-primary/5 space-y-3">
        <MomentHeader
          eyebrow="Your plan"
          title={pendingIntake.title}
          onClose={() => patchDreamFlow({ dismissed: true })}
          onBack={() => patchDreamFlow({ showPlan: false })}
        />
        <div className="[&_.rounded-2xl]:rounded-lg [&_.shadow-lg]:shadow-none">
          <MilestonesRoadmap milestones={milestones} isHighlighted={false} />
        </div>
      </Card>
    );
  }

  // ─── Moment 1 — one recommended starting milestone. ─────────────
  if (momentStage === 'milestone') {
    return (
      <Card className="p-4 border-primary/30 bg-primary/5 space-y-4">
        <MomentHeader
          eyebrow="Here's where I suggest we start"
          onClose={() => patchDreamFlow({ dismissed: true })}
        />
        <p className="text-base font-medium text-foreground leading-snug">
          {firstMilestone?.title ?? pendingIntake.title}
        </p>
        {firstMilestone?.description && (
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
            {firstMilestone.description}
          </p>
        )}
        <div className="pt-1 space-y-1.5">
          <Button
            className="w-full h-10"
            onClick={() => patchDreamFlow({ momentStage: 'task' })}
          >
            Start today's step
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="w-full h-8 text-xs text-muted-foreground"
            onClick={() => patchDreamFlow({ showPlan: true })}
          >
            See the plan
          </Button>
        </div>
      </Card>
    );
  }

  // ─── Moment 2 — today's task. The bridge sentence lives here: it
  // introduces the STEP after the milestone, so nothing is said twice.
  if (momentStage === 'task') {
    if (!firstTask) {
      return (
        <Card className="p-4 border-primary/30 bg-primary/5 space-y-3">
          <MomentHeader
            eyebrow="Ready when you are"
            onClose={() => patchDreamFlow({ dismissed: true })}
            onBack={() => patchDreamFlow({ momentStage: 'milestone' })}
          />
          <p className="text-sm text-muted-foreground">
            No task is queued yet. Ask your companion what to do next.
          </p>
        </Card>
      );
    }
    const duration = firstTask.estimated_duration ?? '30 min';
    const timeOfDay = Array.isArray(firstTask.optimal_time_of_day)
      ? firstTask.optimal_time_of_day[0]
      : firstTask.optimal_time_of_day;
    return (
      <Card className="p-4 border-primary/30 bg-primary/5 space-y-4">
        <MomentHeader
          eyebrow="Here's your first step"
          onClose={() => patchDreamFlow({ dismissed: true })}
          onBack={() => patchDreamFlow({ momentStage: 'milestone' })}
        />
        <p className="text-base font-medium text-foreground leading-snug">
          {firstTask.title}
        </p>
        <div className="flex flex-wrap gap-2 text-[11px] text-muted-foreground">
          <span className="inline-flex items-center gap-1 rounded-full bg-muted/50 px-2 py-0.5">
            <Clock className="h-3 w-3" /> {duration}
          </span>
          {timeOfDay && (
            <span className="inline-flex items-center gap-1 rounded-full bg-muted/50 px-2 py-0.5 capitalize">
              <Sunrise className="h-3 w-3" /> {timeOfDay}
            </span>
          )}
        </div>
        <div className="pt-1 space-y-1.5">
          <Button
            className="w-full h-10"
            onClick={() => patchDreamFlow({ momentStage: 'working' })}
          >
            Start
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="w-full h-8 text-xs text-muted-foreground"
            onClick={() => patchDreamFlow({ momentStage: 'milestone' })}
          >
            Not today
          </Button>
        </div>
      </Card>
    );
  }

  // ─── Moment 3 — work together. Real TaskCoachInterface. ─────────
  if (momentStage === 'working') {
    return (
      <div className="space-y-2">
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-[11px] text-muted-foreground"
          onClick={() => patchDreamFlow({ momentStage: 'task' })}
        >
          <ChevronLeft className="mr-1 h-3.5 w-3.5" />
          Pause
        </Button>
        <PanelTaskView
          task={firstTask ?? { id: 'unknown', title: firstMilestone?.title ?? pendingIntake.title }}
          goalId={decomposedGoal?.id ? String(decomposedGoal.id) : undefined}
          goalTitle={pendingIntake.title}
          onBack={() => patchDreamFlow({ momentStage: 'done' })}
        />
      </div>
    );
  }

  // ─── Moment 4 — done. Calm completion; user chooses one destination.
  return (
    <Card className="p-4 border-primary/30 bg-primary/5 space-y-4">
      <MomentHeader
        eyebrow="Nice work"
        onClose={() => patchDreamFlow({ dismissed: true })}
      />
      <p className="text-sm text-foreground leading-relaxed">
        That's today handled. {firstTask?.title ? `"${firstTask.title}" complete.` : ''}
      </p>
      <div className="pt-1 space-y-1.5">
        <Button
          className="w-full h-10"
          onClick={() => patchDreamFlow({ momentStage: 'milestone' })}
        >
          What's next
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="w-full h-8 text-xs text-muted-foreground"
          onClick={() => patchDreamFlow({ showPlan: true })}
        >
          See the plan
        </Button>
      </div>
    </Card>
  );
};

// ─── Header — one eyebrow, optional title, minimal chrome. ─────────
const MomentHeader: React.FC<{
  eyebrow: string;
  title?: string;
  onClose: () => void;
  onBack?: () => void;
}> = ({ eyebrow, title, onClose, onBack }) => (
  <div className="flex items-start gap-2">
    {onBack && (
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 -ml-1"
        onClick={onBack}
        aria-label="Back"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
    )}
    <div className="min-w-0 flex-1">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {eyebrow}
      </p>
      {title && (
        <p className="text-sm font-medium text-foreground mt-0.5 truncate" title={title}>
          {title}
        </p>
      )}
    </div>
    <Button
      variant="ghost"
      size="icon"
      className="h-6 w-6"
      onClick={onClose}
      aria-label="Hide"
      title="Hide (keeps journey)"
    >
      <X className="h-3.5 w-3.5" />
    </Button>
  </div>
);

export default PanelDreamFlow;
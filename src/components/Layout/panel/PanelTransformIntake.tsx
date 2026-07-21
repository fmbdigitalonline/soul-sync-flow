/**
 * PanelTransformIntake — thin router for the "Help me transform this"
 * journey (Constitution v2.8).
 *
 * Owns two things only:
 *   1. The provenance header (the sentence, kept verbatim — no new card).
 *   2. The route chooser: three "Help me…" options that route to
 *      TransformImmediate / TransformProgramFlow / TransformPatternScope.
 *
 * Each route owns its own stages. Sheet close/reopen resumes via
 * WorkspaceContext.transformFlow (sessionStorage-backed).
 */

import React from 'react';
import { X, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useWorkspace, type TransformRoute } from '@/contexts/WorkspaceContext';
import { TransformImmediate } from './transform/TransformImmediate';
import { TransformProgramFlow } from './transform/TransformProgramFlow';
import { TransformPatternScope } from './transform/TransformPatternScope';

export const PanelTransformIntake: React.FC = () => {
  const {
    pendingTransformIntake,
    clearPendingTransformIntake,
    transformFlow,
    patchTransformFlow,
    resetTransformFlow,
  } = useWorkspace();

  if (!pendingTransformIntake) return null;
  const pattern = pendingTransformIntake.pattern ?? '';

  const handleDismiss = () => {
    resetTransformFlow();
    clearPendingTransformIntake();
  };

  const pickRoute = (route: TransformRoute) => {
    patchTransformFlow({ route, stage: 'chooser' });
  };

  const backToChooser = () => patchTransformFlow({ route: 'intake', stage: 'chooser' });

  return (
    <Card className="p-3 ss-flow-green space-y-3">
      {/* Header: provenance — the sentence that started this */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
            🌱 Help me transform this
          </p>
          <p className="text-sm font-medium text-foreground mt-1 leading-snug">“{pattern}”</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 flex-shrink-0"
          onClick={handleDismiss}
          aria-label="Dismiss"
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Route chooser — the single decision point. Three "Help me…" depths. */}
      {transformFlow.route === 'intake' && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">What would you like help with?</p>
          <div className="flex flex-col gap-1.5">
            <ChooserButton
              title="Help me with this now"
              hint="Understand and shift what is happening in the moment."
              onClick={() => pickRoute('immediate')}
            />
            <ChooserButton
              title="Help me transform this pattern"
              hint="Work on the underlying pattern over time."
              onClick={() => pickRoute('program')}
            />
            <ChooserButton
              title="Help me see the bigger pattern"
              hint="Explore where this appears across your life."
              onClick={() => pickRoute('pattern_scope')}
            />
          </div>
        </div>
      )}

      {transformFlow.route !== 'intake' && (
        <>
          <Button
            size="sm"
            variant="ghost"
            className="h-6 px-2 text-[11px] text-muted-foreground hover:text-foreground -ml-1"
            onClick={backToChooser}
          >
            <ChevronLeft className="h-3 w-3 mr-1" />
            Choose a different depth
          </Button>
          {transformFlow.route === 'immediate' && <TransformImmediate />}
          {transformFlow.route === 'program' && <TransformProgramFlow />}
          {transformFlow.route === 'pattern_scope' && <TransformPatternScope />}
        </>
      )}
    </Card>
  );
};

const ChooserButton: React.FC<{ title: string; hint: string; onClick: () => void }> = ({
  title,
  hint,
  onClick,
}) => (
  <button
    type="button"
    onClick={onClick}
    className="text-left rounded-lg px-3 py-2 border border-emerald-500/30 bg-background/60 hover:bg-emerald-500/10 transition-colors"
  >
    <div className="text-xs font-semibold text-foreground">{title}</div>
    <div className="text-[11px] text-muted-foreground leading-snug mt-0.5">{hint}</div>
  </button>
);

export default PanelTransformIntake;

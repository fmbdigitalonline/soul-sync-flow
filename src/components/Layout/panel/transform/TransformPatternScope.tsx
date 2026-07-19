/**
 * TransformPatternScope — the wider-pattern route (v2.8).
 *
 * Route: "Help me see the bigger pattern".
 *
 * Three contextual choices (Rule of Three) that mount existing Life OS
 * components inline in the panel. LifeOperatingSystemChoices is
 * intentionally NOT used — the Coach picks the right depth for the seed.
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { LifeOperatingSystemDomainFocus } from '@/components/dashboard/LifeOperatingSystemDomainFocus';
import { ConversationalAssessment } from '@/components/dashboard/ConversationalAssessment';
import { LifeOperatingSystemDashboard } from '@/components/dashboard/LifeOperatingSystemDashboard';
import { TransformScopeInterpretation } from './TransformScopeInterpretation';
import { inferDomains } from '@/services/transformation-intake-service';

export const TransformPatternScope: React.FC = () => {
  const { transformFlow, patchTransformFlow, pendingTransformIntake } = useWorkspace();
  const stage = transformFlow.stage;
  const pattern = pendingTransformIntake?.pattern ?? '';
  const hasInterpretation = pattern.length > 0 && inferDomains(pattern).length > 0;

  // Back returns to the Coach interpretation when available so the
  // conversational frame is preserved; otherwise to the plain chooser.
  const backTarget = hasInterpretation ? 'scope_interpretation' : 'scope_menu';
  const back = () => patchTransformFlow({ stage: backTarget });

  // Default landing for this route: interpretation first (if we have
  // signal), else fall straight through to the chooser.
  const effectiveStage =
    stage === 'chooser'
      ? (hasInterpretation ? 'scope_interpretation' : 'scope_menu')
      : stage;

  const LeadIn: React.FC = () => (
    <p className="text-[11px] text-muted-foreground italic">
      Here's how this pattern connects to your Life OS.
    </p>
  );

  return (
    <div className="space-y-3">
      {effectiveStage === 'scope_interpretation' && (
        <TransformScopeInterpretation pattern={pattern} />
      )}

      {effectiveStage === 'scope_menu' && (
        <div className="space-y-2">
          <p className="text-[11px] uppercase tracking-wider text-emerald-700 dark:text-emerald-400 font-semibold">
            See where this pattern appears
          </p>
          <div className="flex flex-col gap-1.5">
            <button
              type="button"
              onClick={() => patchTransformFlow({ stage: 'scope_domain_focus' })}
              className="text-left text-xs rounded-lg px-3 py-2 border border-emerald-500/25 bg-background/60 hover:bg-emerald-500/10"
            >
              Check this life area
            </button>
            <button
              type="button"
              onClick={() => patchTransformFlow({ stage: 'scope_guided' })}
              className="text-left text-xs rounded-lg px-3 py-2 border border-emerald-500/25 bg-background/60 hover:bg-emerald-500/10"
            >
              Explore it through conversation
            </button>
            <button
              type="button"
              onClick={() => patchTransformFlow({ stage: 'scope_full' })}
              className="text-left text-xs rounded-lg px-3 py-2 border border-emerald-500/25 bg-background/60 hover:bg-emerald-500/10"
            >
              Review my full Life OS
            </button>
          </div>
          {hasInterpretation && (
            <Button
              size="sm"
              variant="ghost"
              className="w-full h-7 text-[11px]"
              onClick={() => patchTransformFlow({ stage: 'scope_interpretation' })}
            >
              Back to interpretation
            </Button>
          )}
        </div>
      )}

      {effectiveStage === 'scope_domain_focus' && (
        <div className="space-y-2">
          <LeadIn />
          <LifeOperatingSystemDomainFocus
            onBack={back}
            onComplete={() => patchTransformFlow({ stage: backTarget })}
          />
        </div>
      )}

      {effectiveStage === 'scope_guided' && (
        <div className="space-y-2">
          <LeadIn />
          <ConversationalAssessment
            onBack={back}
            onComplete={() => patchTransformFlow({ stage: backTarget })}
          />
        </div>
      )}

      {effectiveStage === 'scope_full' && (
        <div className="space-y-2">
          <LeadIn />
          <LifeOperatingSystemDashboard onCreateProgram={() => patchTransformFlow({ stage: backTarget })} />
          <Button size="sm" variant="ghost" className="w-full h-7 text-[11px]" onClick={back}>
            Back
          </Button>
        </div>
      )}
    </div>
  );
};

export default TransformPatternScope;
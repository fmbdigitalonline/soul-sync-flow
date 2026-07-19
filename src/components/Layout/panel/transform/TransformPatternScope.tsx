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

export const TransformPatternScope: React.FC = () => {
  const { transformFlow, patchTransformFlow } = useWorkspace();
  const stage = transformFlow.stage;

  const back = () => patchTransformFlow({ stage: 'scope_menu' });

  return (
    <div className="space-y-3">
      {(stage === 'chooser' || stage === 'scope_menu') && (
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
        </div>
      )}

      {stage === 'scope_domain_focus' && (
        <div className="space-y-2">
          <LifeOperatingSystemDomainFocus
            onBack={back}
            onComplete={() => patchTransformFlow({ stage: 'scope_menu' })}
          />
        </div>
      )}

      {stage === 'scope_guided' && (
        <div className="space-y-2">
          <ConversationalAssessment
            onBack={back}
            onComplete={() => patchTransformFlow({ stage: 'scope_menu' })}
          />
        </div>
      )}

      {stage === 'scope_full' && (
        <div className="space-y-2">
          <LifeOperatingSystemDashboard onCreateProgram={() => patchTransformFlow({ stage: 'scope_menu' })} />
          <Button size="sm" variant="ghost" className="w-full h-7 text-[11px]" onClick={back}>
            Back
          </Button>
        </div>
      )}
    </div>
  );
};

export default TransformPatternScope;
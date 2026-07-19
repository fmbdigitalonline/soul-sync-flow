/**
 * TransformScopeInterpretation — Coach interpretation layer that appears
 * before any Life OS dashboard in the "Help me see the bigger pattern"
 * route (v2.8 refinement).
 *
 * Data source is deliberately narrow and honest: we use
 * transformation-intake-service.inferDomains(passage) — a keyword-based
 * relevance signal derived from the SELECTED SENTENCE, not from Life OS
 * assessment data. Copy is written to reflect exactly that: "areas most
 * connected to this passage", never "areas this affects most" or
 * cross-domain impact claims.
 *
 * If inference yields nothing usable, this screen renders nothing and
 * the parent falls through to the plain chooser (fail-visible per
 * SoulSync protocol — no fake "Coach says…").
 */

import React, { useMemo, useState } from 'react';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { DOMAIN_LABELS, inferDomains } from '@/services/transformation-intake-service';
import type { LifeDomain } from '@/types/growth-program';

interface Props {
  pattern: string;
}

export const TransformScopeInterpretation: React.FC<Props> = ({ pattern }) => {
  const { patchTransformFlow } = useWorkspace();
  const [showWhy, setShowWhy] = useState(false);

  const domains = useMemo<LifeDomain[]>(() => {
    if (!pattern) return [];
    // Ranked, best first, deduped. Take up to 3 (Rule of Three).
    return inferDomains(pattern).slice(0, 3);
  }, [pattern]);

  if (domains.length === 0) return null;

  const primary = domains[0];
  const primaryLabel = DOMAIN_LABELS[primary];

  const startHere = () =>
    patchTransformFlow({ stage: 'scope_domain_focus' });

  const showAll = () => patchTransformFlow({ stage: 'scope_menu' });

  return (
    <div className="space-y-3">
      <p className="text-[11px] uppercase tracking-wider text-emerald-700 dark:text-emerald-400 font-semibold">
        Here's what I'm seeing
      </p>
      <p className="text-xs text-muted-foreground">
        This passage appears most connected to:
      </p>
      <ul className="space-y-1">
        {domains.map((d) => (
          <li
            key={d}
            className="text-xs rounded-lg px-3 py-2 border border-emerald-500/25 bg-background/60"
          >
            {DOMAIN_LABELS[d]}
          </li>
        ))}
      </ul>
      <p className="text-xs text-muted-foreground">
        I'd suggest starting with <span className="font-medium text-foreground">{primaryLabel}</span> — it appears most closely connected to what you selected.
      </p>

      {showWhy && (
        <p className="text-[11px] text-muted-foreground italic border-l-2 border-emerald-500/30 pl-2">
          This is based on how the passage reads, not yet on your Life OS results.
          Opening an area below lets us look at it together with your assessment data.
        </p>
      )}

      <div className="flex flex-col gap-1.5 pt-1">
        <button
          type="button"
          onClick={startHere}
          className="text-left text-xs rounded-lg px-3 py-2 border border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/15 font-medium"
        >
          Yes, start with {primaryLabel}
        </button>
        <button
          type="button"
          onClick={showAll}
          className="text-left text-xs rounded-lg px-3 py-2 border border-emerald-500/25 bg-background/60 hover:bg-emerald-500/10"
        >
          Show me all areas
        </button>
        <button
          type="button"
          onClick={() => setShowWhy((v) => !v)}
          className="text-left text-xs rounded-lg px-3 py-2 border border-emerald-500/20 bg-background/60 hover:bg-emerald-500/10 text-muted-foreground"
        >
          {showWhy ? 'Hide reasoning' : 'Tell me why'}
        </button>
      </div>
    </div>
  );
};

export default TransformScopeInterpretation;
/**
 * TransformProgramFlow — the structured transformation program path (v2.8).
 *
 * Route: "Help me transform this pattern over time".
 *
 * Owns the confirm → building → ready → error phases that used to live
 * in PanelTransformIntake directly. Now hosted under the thin router so
 * the parent can also mount immediate/pattern-scope siblings.
 *
 * The engine call (createTransformationProgram) is unchanged — this is a
 * presentation refactor. pattern_seed provenance and program activation
 * are preserved.
 */

import React, { useMemo, useState } from 'react';
import { ChevronRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useBlueprintCache } from '@/contexts/BlueprintCacheContext';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { PanelCoachDock } from '../PanelCoachDock';
import {
  DOMAIN_LABELS,
  createTransformationProgram,
  inferDomains,
} from '@/services/transformation-intake-service';
import type { GrowthProgram, LifeDomain, ProgramWeek } from '@/types/growth-program';

type Phase = 'interpret' | 'confirm' | 'building' | 'ready' | 'error';

const MAX_GUESSES = 3;
const MAX_WEEKS_SHOWN = 3;

const THEME_LABELS: Record<string, string> = {
  foundation: 'Foundation',
  belief_excavation: 'Belief work',
  blueprint_activation: 'Blueprint activation',
  domain_deep_dive: 'Deep dive',
  integration: 'Integration',
  graduation: 'Graduation',
};

export const TransformProgramFlow: React.FC = () => {
  const { pendingTransformIntake } = useWorkspace();
  const { blueprintData } = useBlueprintCache();
  const { user } = useAuth();

  const pattern = pendingTransformIntake?.pattern ?? '';
  const guesses = useMemo(() => inferDomains(pattern), [pattern]);
  const topGuess = (pendingTransformIntake?.inferredDomain as LifeDomain) || guesses[0];

  // If we have an inferred domain, start with the Coach interpretation card;
  // otherwise jump straight to the chip picker (backward compatible).
  const [phase, setPhase] = useState<Phase>(topGuess ? 'interpret' : 'confirm');
  const [showAllDomains, setShowAllDomains] = useState(false);
  const [showAllWeeks, setShowAllWeeks] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [result, setResult] = useState<{ program: GrowthProgram; weeks: ProgramWeek[] } | null>(null);
  const [coachOpen, setCoachOpen] = useState(false);

  if (!pendingTransformIntake) return null;

  const allDomains = Object.keys(DOMAIN_LABELS) as LifeDomain[];
  const visibleDomains = showAllDomains ? allDomains : guesses.slice(0, MAX_GUESSES);

  const runCreate = async (domain: LifeDomain) => {
    if (!user) {
      setErrorMsg('Not signed in.');
      setPhase('error');
      return;
    }
    setPhase('building');
    try {
      const res = await createTransformationProgram(user.id, pattern, domain, blueprintData);
      setResult(res);
      setPhase('ready');
    } catch (e) {
      console.error('❌ Transformation program creation failed:', e);
      setErrorMsg(e instanceof Error ? e.message : 'Program creation failed.');
      setPhase('error');
    }
  };

  const weeks = result?.weeks ?? [];
  const visibleWeeks = showAllWeeks ? weeks : weeks.slice(0, MAX_WEEKS_SHOWN);
  const firstWeek = weeks[0];

  return (
    <div className="space-y-3">
      {phase === 'interpret' && topGuess && (
        <div className="space-y-2 rounded-lg border border-emerald-500/20 bg-background/50 p-2.5">
          <p className="text-[11px] uppercase tracking-wider text-emerald-700 dark:text-emerald-400 font-semibold">
            Here's what I think you want to transform
          </p>
          <ul className="text-xs text-foreground space-y-1">
            {pendingTransformIntake.inferredPattern && (
              <li>• Pattern: {pendingTransformIntake.inferredPattern}</li>
            )}
            <li>• Likely domain: {DOMAIN_LABELS[topGuess] ?? topGuess}</li>
            {pendingTransformIntake.inferredBelief && (
              <li>• Possible belief: {pendingTransformIntake.inferredBelief}</li>
            )}
          </ul>
          <div className="flex flex-wrap gap-1.5 pt-1">
            <Button size="sm" className="h-7 text-xs" onClick={() => runCreate(topGuess)}>
              Yes, continue
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              onClick={() => setPhase('confirm')}
            >
              Adjust this
            </Button>
          </div>
        </div>
      )}

      {phase === 'confirm' && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">
            Which part of life does this pattern live in?
          </p>
          <div className="flex flex-wrap gap-1.5">
            {visibleDomains.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => runCreate(d)}
                className="text-xs rounded-lg px-2.5 py-1.5 border border-emerald-500/30 bg-background/60 hover:bg-emerald-500/10 transition-colors"
              >
                {DOMAIN_LABELS[d]}
              </button>
            ))}
            {!showAllDomains && (
              <button
                type="button"
                onClick={() => setShowAllDomains(true)}
                className="text-xs rounded-lg px-2.5 py-1.5 text-muted-foreground hover:text-foreground transition-colors"
              >
                More…
              </button>
            )}
          </div>
        </div>
      )}

      {phase === 'building' && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground py-1">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          <span>Building your transformation program from your blueprint…</span>
        </div>
      )}

      {phase === 'ready' && result && (
        <div className="space-y-2.5">
          <p className="text-xs text-muted-foreground">
            {result.program.total_weeks} weeks · {DOMAIN_LABELS[result.program.domain] ?? result.program.domain}
            {firstWeek ? ` · starts with ${THEME_LABELS[firstWeek.theme] ?? firstWeek.theme}` : ''}
          </p>

          <ul className="space-y-1">
            {visibleWeeks.map((w) => (
              <li
                key={w.week_number}
                className="flex items-start gap-2 text-xs rounded-md bg-background/50 px-2 py-1.5"
              >
                <span className="font-semibold text-emerald-700 dark:text-emerald-400 shrink-0">
                  W{w.week_number}
                </span>
                <span className="min-w-0">
                  <span className="text-foreground">{THEME_LABELS[w.theme] ?? w.theme}</span>
                  <span className="text-muted-foreground"> — {w.focus_area}</span>
                </span>
              </li>
            ))}
          </ul>
          {weeks.length > MAX_WEEKS_SHOWN && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAllWeeks((v) => !v)}
              className="h-6 px-2 text-[11px] text-muted-foreground hover:text-foreground"
            >
              {showAllWeeks ? 'Show less' : `Show ${weeks.length - MAX_WEEKS_SHOWN} more`}
              <ChevronRight className="ml-1 h-3 w-3" />
            </Button>
          )}

          {coachOpen ? (
            <PanelCoachDock
              contextKey={`transform_${result.program.id}`}
              seedPrompt={`I just started a transformation program around this pattern: "${pattern}". Week 1 is ${
                firstWeek ? `${THEME_LABELS[firstWeek.theme] ?? firstWeek.theme} — ${firstWeek.focus_area}` : 'Foundation'
              }. Guide me into it.`}
              placeholder="Talk with your coach about week 1…"
            />
          ) : (
            <Button
              size="sm"
              className="w-full h-8 text-xs font-semibold"
              onClick={() => setCoachOpen(true)}
            >
              Begin week 1 with your coach
              <ChevronRight className="ml-1 h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      )}

      {phase === 'error' && (
        <div className="space-y-2">
          <p className="text-xs text-destructive">{errorMsg}</p>
          <PanelCoachDock
            contextKey={`transform_pattern_${pattern.slice(0, 40)}`}
            seedPrompt={`Help me work on this pattern: "${pattern}". Where does it come from, and what would changing it ask of me?`}
            placeholder="Talk with your coach about this pattern…"
          />
        </div>
      )}
    </div>
  );
};

export default TransformProgramFlow;
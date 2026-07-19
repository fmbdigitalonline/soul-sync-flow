/**
 * PanelTransformIntake — "Help me change this pattern" → a real
 * transformation program in the Coach panel (Constitution v2.6 Step 3).
 *
 * Flow (Three-Pieces at every phase, chips over thinking, no theater):
 *   confirm  — the pattern verbatim (provenance) + inferred life-area
 *              chips, one tap to confirm.
 *   building — a single honest line while the deterministic engine
 *              creates + activates the program (fast; no fake stages).
 *   ready    — the program summary: weekly arc capped at 3 (+ show more)
 *              and ONE primary action: begin week 1 with the coach.
 *   error    — the real error, and the conversation as fallback.
 *
 * Engine: growth-program-service via transformation-intake-service — the
 * clean spine, not the stubbed agent path (see audit note in the service).
 */

import React, { useMemo, useState } from 'react';
import { X, MessageCircle, ChevronRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useBlueprintCache } from '@/contexts/BlueprintCacheContext';
import { useAuth } from '@/contexts/AuthContext';
import {
  inferDomains,
  createTransformationProgram,
  DOMAIN_LABELS,
} from '@/services/transformation-intake-service';
import type { GrowthProgram, LifeDomain, ProgramWeek } from '@/types/growth-program';

type Phase = 'confirm' | 'building' | 'ready' | 'error';

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

export const PanelTransformIntake: React.FC = () => {
  const { pendingTransformIntake, clearPendingTransformIntake } = useWorkspace();
  const { blueprintData } = useBlueprintCache();
  const { user } = useAuth();

  const [phase, setPhase] = useState<Phase>('confirm');
  const [showAllDomains, setShowAllDomains] = useState(false);
  const [showAllWeeks, setShowAllWeeks] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [result, setResult] = useState<{ program: GrowthProgram; weeks: ProgramWeek[] } | null>(null);

  const pattern = pendingTransformIntake?.pattern ?? '';
  const guesses = useMemo(() => inferDomains(pattern), [pattern]);

  if (!pendingTransformIntake) return null;

  const allDomains = Object.keys(DOMAIN_LABELS) as LifeDomain[];
  const visibleDomains = showAllDomains
    ? allDomains
    : guesses.slice(0, MAX_GUESSES);

  const handleConfirm = async (domain: LifeDomain) => {
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

  const askTwin = (prompt: string) => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('coach-workspace:ask', { detail: { prompt } }));
    }
  };

  const handleDismiss = () => {
    setResult(null);
    setPhase('confirm');
    setShowAllDomains(false);
    setShowAllWeeks(false);
    clearPendingTransformIntake();
  };

  const weeks = result?.weeks ?? [];
  const visibleWeeks = showAllWeeks ? weeks : weeks.slice(0, MAX_WEEKS_SHOWN);
  const firstWeek = weeks[0];

  return (
    <Card className="p-3 border-emerald-500/30 bg-emerald-500/5 space-y-3">
      {/* Header: provenance — the sentence that started this */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
            🌱 Transformation
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
                onClick={() => handleConfirm(d)}
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

          <Button
            size="sm"
            className="w-full h-8 text-xs font-semibold"
            onClick={() =>
              askTwin(
                `I just started a transformation program around this pattern: "${pattern}". Week 1 is ${
                  firstWeek ? `${THEME_LABELS[firstWeek.theme] ?? firstWeek.theme} — ${firstWeek.focus_area}` : 'Foundation'
                }. Guide me into it.`,
              )
            }
          >
            Begin week 1 with your coach
            <ChevronRight className="ml-1 h-3.5 w-3.5" />
          </Button>
        </div>
      )}

      {phase === 'error' && (
        <div className="space-y-2">
          <p className="text-xs text-destructive">{errorMsg}</p>
          <Button
            variant="outline"
            size="sm"
            className="w-full h-8 text-xs"
            onClick={() =>
              askTwin(
                `Help me work on this pattern: "${pattern}". Where does it come from, and what would changing it ask of me?`,
              )
            }
          >
            <MessageCircle className="h-3.5 w-3.5 mr-1.5" />
            Work on it in conversation instead
          </Button>
        </div>
      )}
    </Card>
  );
};

export default PanelTransformIntake;

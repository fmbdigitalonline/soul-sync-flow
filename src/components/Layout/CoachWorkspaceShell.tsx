/**
 * CoachWorkspaceShell — v2.5 six-section IA for the Coach side panel.
 *
 * Two-surface law (SOULSYNC_CONSTITUTION §2, v2.5):
 *   The conversation is the Twin (thinking). The panel is the Coach
 *   (acting). This shell is the outer skeleton of the Coach workspace.
 *
 * UX law: Three-Pieces Rule.
 *   Every section shows 1 primary + 2 supporting items, then "Show more".
 *   Overview is ALWAYS 3 cards. Everything else is progressive disclosure.
 *
 * Non-destructive: existing context-specific tool trees are preserved and
 * rendered inside the collapsed "Tools" section via the `legacyTools` slot.
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, ChevronRight, Target, MessageCircle, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { useJourneyGoals, type Goal, type GoalMilestone } from '@/hooks/use-journey-goals';
import { ActionHub } from './ActionHub';
import {
  onCoachOpen,
  onCoachDecomposition,
  emitCoachDecomposition,
  type CoachSectionId,
} from '@/lib/coach-workspace-bus';
import { PanelDecompositionCard } from './panel/PanelDecompositionCard';
import { PanelMilestoneView } from './panel/PanelMilestoneView';
import { PanelBreadcrumb } from './panel/PanelBreadcrumb';
import { PanelDreamFlow } from './panel/PanelDreamFlow';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useHelpHistory } from '@/hooks/use-help-history';

interface CoachWorkspaceShellProps {
  /** Legacy context tools slot — rendered inside the Tools section drawer. */
  legacyTools?: React.ReactNode;
  className?: string;
}

type SectionId = 'actions' | 'insights' | 'memories' | 'tools' | 'history';

const SECTION_ORDER: SectionId[] = ['actions', 'insights', 'memories', 'tools', 'history'];

interface ActionSelection {
  goalId: string;
  milestoneId: string;
}

export const CoachWorkspaceShell: React.FC<CoachWorkspaceShellProps> = ({ legacyTools, className }) => {
  const { t } = useLanguage();
  const { goals, isLoading, reloadGoals } = useJourneyGoals();
  const { pendingIntake } = useWorkspace();
  const [selection, setSelection] = useState<ActionSelection | null>(null);
  const [decompActive, setDecompActive] = useState(false);
  const knownGoalIdsRef = useRef<Set<string>>(new Set());
  const [openSections, setOpenSections] = useState<Record<SectionId, boolean>>({
    actions: false,
    insights: false,
    memories: false,
    tools: false,
    history: false,
  });

  // Slice C: auto-expand the requested section when the twin dispatches
  // a handshake event (e.g. decompose_goal confirmed).
  useEffect(() => {
    return onCoachOpen((detail) => {
      const section = (detail.section ?? 'actions') as CoachSectionId;
      setOpenSections((prev) => ({ ...prev, [section]: true }));
    });
  }, []);

  // Track decomposition lifecycle so the shell can auto-complete when a new
  // goal lands in useJourneyGoals — the actual work happens server-side.
  useEffect(() => {
    return onCoachDecomposition((d) => {
      if (d.phase === 'start') {
        setDecompActive(true);
        // Snapshot known goal IDs so we can detect the new one.
        knownGoalIdsRef.current = new Set(goals.map((g) => g.id));
        // Poll once shortly to catch fast completions.
        setTimeout(() => reloadGoals(), 4000);
        setTimeout(() => reloadGoals(), 10000);
      } else {
        setDecompActive(false);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fire complete when a new goal shows up mid-decomposition.
  useEffect(() => {
    if (!decompActive) return;
    const newGoal = goals.find((g) => !knownGoalIdsRef.current.has(g.id));
    if (newGoal) {
      emitCoachDecomposition({ phase: 'complete', dreamTitle: newGoal.title });
      knownGoalIdsRef.current.add(newGoal.id);
    }
  }, [goals, decompActive]);

  const toggleSection = (id: SectionId) =>
    setOpenSections((prev) => ({ ...prev, [id]: !prev[id] }));

  // Derive Overview data from real state — no mock data (Directive 1).
  const overview = useMemo(() => deriveOverview(goals, isLoading), [goals, isLoading]);

  const selectedGoal = useMemo(
    () => (selection ? goals.find((g) => g.id === selection.goalId) ?? null : null),
    [goals, selection],
  );
  const selectedMilestone = useMemo(
    () =>
      selectedGoal && selection
        ? selectedGoal.milestones.find((m) => m.id === selection.milestoneId) ?? null
        : null,
    [selectedGoal, selection],
  );

  const askCoach = (prompt: string) => {
    // Handoff to Twin — post into the conversation input if the page listens.
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('coach-workspace:ask', { detail: { prompt } }));
    }
  };

  const helpHistory = useHelpHistory();

  const sectionLabels: Record<SectionId, string> = {
    actions: 'Action Hub',
    insights: 'Insights',
    memories: 'Memories',
    tools: 'Tools',
    history: 'History',
  };

  return (
    <div className={cn('h-full p-6 space-y-6 overflow-y-auto', className)}>
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-foreground">Coach Workspace</h3>
          <Badge variant="outline" className="text-[10px] uppercase tracking-wide">
            v2.5
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">
          What can we do with what was just discussed?
        </p>
      </div>

      {/* OVERVIEW — always three cards (Three-Pieces Rule) */}
      <section aria-label="Overview" className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Overview
          </h4>
        </div>
        {pendingIntake ? <PanelDreamFlow /> : <PanelDecompositionCard />}
        <div className="space-y-2">
          <OverviewCard
            icon={Target}
            label="Today's Focus"
            title={overview.focus.title}
            hint={overview.focus.hint}
            emptyCta={overview.focus.emptyCta}
          />
          <OverviewCard
            icon={MessageCircle}
            label="Current Thread"
            title={overview.thread.title}
            hint={overview.thread.hint}
            emptyCta={overview.thread.emptyCta}
          />
          <OverviewCard
            icon={Sparkles}
            label="Suggested Next Action"
            title={overview.suggestion.title}
            hint={overview.suggestion.hint}
            emptyCta={overview.suggestion.emptyCta}
          />
        </div>
      </section>

      {/* Six-section IA — collapsed by default, progressive disclosure */}
      <div className="space-y-2">
        {SECTION_ORDER.map((id) => (
          <SectionDrawer
            key={id}
            label={sectionLabels[id]}
            isOpen={openSections[id]}
            onToggle={() => toggleSection(id)}
          >
            {id === 'tools' ? (
              legacyTools ?? <EmptySlot label="No tools surfaced for this moment." />
            ) : id === 'actions' ? (
              selectedGoal && selectedMilestone ? (
                <div className="space-y-2">
                  <PanelBreadcrumb
                    crumbs={[{ label: 'Actions', onClick: () => setSelection(null) }]}
                    current={selectedMilestone.title}
                  />
                  <PanelMilestoneView
                    goal={selectedGoal}
                    milestone={selectedMilestone}
                    onSelectMilestone={(mid) =>
                      setSelection({ goalId: selectedGoal.id, milestoneId: mid })
                    }
                    onAskCoach={askCoach}
                  />
                </div>
              ) : (
                <ActionHub
                  goals={goals}
                  isLoading={isLoading}
                  onSelectMilestone={(goalId, milestoneId) =>
                    setSelection({ goalId, milestoneId })
                  }
                />
              )
            ) : id === 'insights' ? (
              <InsightsList entries={helpHistory} />
            ) : (
              <EmptySlot label={placeholderFor(id)} />
            )}
          </SectionDrawer>
        ))}
      </div>
    </div>
  );
};

// ————————————————————————————————————————————————————————————
// Overview data derivation — reads real state, honest empty states.
// ————————————————————————————————————————————————————————————

interface OverviewSlot {
  title: string;
  hint?: string;
  emptyCta?: string;
}

interface OverviewData {
  focus: OverviewSlot;
  thread: OverviewSlot;
  suggestion: OverviewSlot;
}

function deriveOverview(goals: Goal[], loading: boolean): OverviewData {
  if (loading) {
    return {
      focus: { title: 'Loading…' },
      thread: { title: 'Loading…' },
      suggestion: { title: 'Loading…' },
    };
  }

  // Today's Focus: first active program with an incomplete milestone.
  const activeGoal = goals.find((g) => (g.progress ?? 0) < 100 && g.milestones?.length > 0);
  const activeMilestone: GoalMilestone | undefined = activeGoal?.milestones.find((m) => !m.completed);
  const focus: OverviewSlot = activeMilestone
    ? {
        title: activeMilestone.title,
        hint: activeGoal ? activeGoal.title : undefined,
      }
    : {
        title: 'No active program yet',
        emptyCta: 'Start a coaching program from the conversation.',
      };

  // Current Thread: last conversation subject, set by the Coach page.
  const lastSubject = readLastConversationSubject();
  const thread: OverviewSlot = lastSubject
    ? { title: lastSubject.title, hint: lastSubject.hint }
    : {
        title: 'No recent conversation',
        emptyCta: 'Open the companion to start talking.',
      };

  // Suggested Next Action: derived from the next incomplete milestone
  // across other active programs (not the primary focus). Honest empty
  // state when nothing queued.
  const otherActive = goals.filter(
    (g) => g !== activeGoal && (g.progress ?? 0) < 100 && (g.milestones?.length ?? 0) > 0,
  );
  const nextMilestone = otherActive
    .flatMap((g) => g.milestones.map((m) => ({ m, g })))
    .find(({ m }) => !m.completed);
  const suggestion: OverviewSlot = nextMilestone
    ? { title: nextMilestone.m.title, hint: nextMilestone.g.title }
    : {
        title: 'No suggestion right now',
        emptyCta: 'The twin will suggest when the moment is right.',
      };

  return { focus, thread, suggestion };
}

function readLastConversationSubject(): { title: string; hint?: string } | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem('coach-workspace:last-thread');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed.title === 'string' && parsed.title.trim()) {
      return { title: parsed.title, hint: typeof parsed.hint === 'string' ? parsed.hint : undefined };
    }
    return null;
  } catch {
    return null;
  }
}

// ————————————————————————————————————————————————————————————
// Presentational primitives
// ————————————————————————————————————————————————————————————

interface OverviewCardProps {
  icon: React.ElementType;
  label: string;
  title: string;
  hint?: string;
  emptyCta?: string;
}

const OverviewCard: React.FC<OverviewCardProps> = ({ icon: Icon, label, title, hint, emptyCta }) => (
  <Card className="p-3 border-border/60">
    <div className="flex items-start gap-3">
      <div className="mt-0.5 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <p className="text-sm font-medium text-foreground mt-0.5 truncate">{title}</p>
        {hint && <p className="text-xs text-muted-foreground mt-0.5 truncate">{hint}</p>}
        {emptyCta && !hint && (
          <p className="text-xs text-muted-foreground/80 mt-0.5">{emptyCta}</p>
        )}
      </div>
    </div>
  </Card>
);

interface SectionDrawerProps {
  label: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

const SectionDrawer: React.FC<SectionDrawerProps> = ({ label, isOpen, onToggle, children }) => (
  <div className="border border-border/60 rounded-lg overflow-hidden bg-card/40">
    <Button
      variant="ghost"
      onClick={onToggle}
      className="w-full h-9 px-3 flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:bg-muted/40 rounded-none"
    >
      <span>{label}</span>
      {isOpen ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
    </Button>
    {isOpen && <div className="p-3 border-t border-border/60">{children}</div>}
  </div>
);

const EmptySlot: React.FC<{ label: string }> = ({ label }) => (
  <p className="text-xs text-muted-foreground italic">{label}</p>
);

const MAX_INSIGHTS = 3;

const InsightsList: React.FC<{ entries: { id: string; title: string; when: string }[] }> = ({
  entries,
}) => {
  const [expanded, setExpanded] = useState(false);
  if (entries.length === 0) {
    return <EmptySlot label="No help history yet." />;
  }
  const visible = expanded ? entries : entries.slice(0, MAX_INSIGHTS);
  const hidden = Math.max(0, entries.length - MAX_INSIGHTS);
  return (
    <div className="space-y-1">
      <ul className="space-y-1">
        {visible.map((e) => (
          <li key={e.id} className="pl-2 pr-2 py-1.5 rounded-md hover:bg-muted/40">
            <p className="text-xs font-medium text-foreground truncate" title={e.title}>
              {e.title}
            </p>
            <p className="text-[10px] text-muted-foreground/70">{e.when}</p>
          </li>
        ))}
      </ul>
      {hidden > 0 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setExpanded((v) => !v)}
          className="h-6 px-2 text-[10px] text-muted-foreground hover:text-foreground"
        >
          {expanded ? 'Show less' : `Show ${hidden} more`}
        </Button>
      )}
    </div>
  );
};

function placeholderFor(id: SectionId): string {
  switch (id) {
    case 'actions':
      return 'Action Hub arrives in Slice B (compressed kanban).';
    case 'insights':
      return 'Insights the twin has noticed will appear here.';
    case 'memories':
      return 'Saved insights and memories from the conversation.';
    case 'history':
      return 'Recent conversation threads.';
    default:
      return '';
  }
}

export default CoachWorkspaceShell;
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
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
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
import { PanelTaskView } from './panel/PanelTaskView';
import { PanelBreadcrumb } from './panel/PanelBreadcrumb';
import { PanelDreamFlow } from './panel/PanelDreamFlow';
import { PanelTransformIntake } from './panel/PanelTransformIntake';
import { PanelProgramsSection } from './panel/PanelProgramsSection';
import { PanelTaskBoard } from './panel/PanelTaskBoard';
import { PanelDiscoveryFlow } from './panel/PanelDiscoveryFlow';
import { PanelHabits } from './panel/PanelHabits';
import { PanelJourneyView } from './panel/PanelJourneyView';
import { PanelProactivitySettings } from './panel/PanelProactivitySettings';
import { PanelEpisodeHistory } from './panel/PanelEpisodeHistory';
import { PanelMyJourney } from './panel/PanelMyJourney';
import DreamAchievementDashboard from '@/components/journey/DreamAchievementDashboard';
import { useJourneyTracking } from '@/hooks/use-journey-tracking';
import { WeeklySummary } from '@/components/productivity/WeeklySummary';
import { useXPProgression } from '@/hooks/use-xp-progression';
import { useWorkspace, type WorkspaceSectionId } from '@/contexts/WorkspaceContext';
import { useHelpHistory } from '@/hooks/use-help-history';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { DOMAIN_LABELS } from '@/services/transformation-intake-service';

interface CoachWorkspaceShellProps {
  /** Legacy context tools slot — rendered inside the Tools section drawer. */
  legacyTools?: React.ReactNode;
  className?: string;
}

type SectionId = WorkspaceSectionId;

const SECTION_ORDER: SectionId[] = ['programs', 'actions', 'insights', 'memories', 'tools', 'history'];

export const CoachWorkspaceShell: React.FC<CoachWorkspaceShellProps> = ({ legacyTools, className }) => {
  const { goals, isLoading, reloadGoals } = useJourneyGoals();
  const {
    pendingIntake,
    pendingTransformIntake,
    dreamFlow,
    selection,
    setActionSelection,
    selectedTask,
    setSelectedTask,
    openSections,
    openWorkspaceSection,
    toggleWorkspaceSection,
  } = useWorkspace();
  const [decompActive, setDecompActive] = useState(false);
  const { user } = useAuth();
  // Progressive workspace (v2.7 rule 2b): drawers hide behind ONE
  // "Show more"; they auto-reveal when navigation opens a section.
  const [drawersRevealed, setDrawersRevealed] = useState(false);
  // Wave 2: the discovery door — for the user who doesn't know the goal
  // yet. When open, discovery IS the one primary container.
  const [discoveryOpen, setDiscoveryOpen] = useState(false);
  // Wave 4: visual journey map/timeline drill-in (raw journey goal).
  const [journeyViewGoal, setJourneyViewGoal] = useState<any | null>(null);
  const [achievementsOpen, setAchievementsOpen] = useState(false);
  const { productivityJourney } = useJourneyTracking();
  const rawJourneyGoalById = (goalId?: string): any | null => {
    const rawGoals = productivityJourney?.current_goals;
    const list: any[] = Array.isArray(rawGoals) ? rawGoals : [];
    if (!goalId) return list[0] ?? null;
    return list.find((g) => String(g?.id ?? g?.goal_id ?? '') === goalId) ?? null;
  };
  // Wave 2: XP surfaced — the ledger existed, invisible until now.
  const { progress: xpProgress } = useXPProgression();
  const { data: transformPrograms = [] } = useQuery({
    queryKey: ['shell-transform-programs', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('growth_programs')
        .select('id, domain, current_week, total_weeks, blueprint_params')
        .eq('user_id', user!.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
  const knownGoalIdsRef = useRef<Set<string>>(new Set());
  const sectionRefs = useRef<Record<SectionId, HTMLDivElement | null>>({
    programs: null,
    actions: null,
    insights: null,
    memories: null,
    tools: null,
    history: null,
  });

  // Slice C: auto-expand the requested section when the twin dispatches
  // a handshake event (e.g. decompose_goal confirmed).
  useEffect(() => {
    return onCoachOpen((detail) => {
      const section = (detail.section ?? 'actions') as CoachSectionId;
      openWorkspaceSection(section as SectionId);
      setDrawersRevealed(true);
    });
  }, [openWorkspaceSection]);

  useEffect(() => {
    if (selection || selectedTask) setDrawersRevealed(true);
  }, [selection, selectedTask]);

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

  const toggleSection = (id: SectionId) => toggleWorkspaceSection(id);

  // Level 1: ONE journey overview — where am I / what matters now / what's
  // next (v2.7 rule 2b). Real state only (Directive 1).
  const journey = useMemo(
    () => deriveJourneyOverview(goals, transformPrograms, isLoading),
    [goals, transformPrograms, isLoading],
  );

  const selectedGoal = useMemo(
    () => {
      if (!selection) return null;
      const persistedGoal = goals.find((g) => g.id === selection.goalId);
      if (persistedGoal) return persistedGoal;
      const panelGoal = dreamFlow.decomposedGoal;
      return panelGoal && String(panelGoal.id) === selection.goalId ? normalizePanelGoal(panelGoal) : null;
    },
    [goals, selection, dreamFlow.decomposedGoal],
  );
  const selectedMilestone = useMemo(
    () =>
      selectedGoal && selection
        ? selectedGoal.milestones.find((m) => m.id === selection.milestoneId) ?? null
        : null,
    [selectedGoal, selection],
  );

  const selectedTaskGoalTitle = useMemo(() => {
    if (!selectedTask?.goalId) return undefined;
    const persistedGoal = goals.find((g) => g.id === selectedTask.goalId);
    if (persistedGoal) return persistedGoal.title;
    const panelGoal = dreamFlow.decomposedGoal;
    return panelGoal && String(panelGoal.id) === selectedTask.goalId ? panelGoal.title : undefined;
  }, [selectedTask?.goalId, goals, dreamFlow.decomposedGoal]);

  useEffect(() => {
    if (!selection && !selectedTask) return;
    window.requestAnimationFrame(() => {
      sectionRefs.current.actions?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }, [selection, selectedTask]);

  const helpHistory = useHelpHistory();

  const sectionLabels: Record<SectionId, string> = {
    programs: 'Programs',
    actions: 'Action Hub',
    insights: 'Insights',
    memories: 'Memories',
    tools: 'Tools',
    history: 'History',
  };

  return (
    <div className={cn('h-full p-6 space-y-6 overflow-y-auto', className)}>
      {/* Header — no dev badges (eliminate what adds no user value) */}
      <div className="space-y-1">
        <h3 className="text-base font-semibold text-foreground">Coach Workspace</h3>
        <p className="text-xs text-muted-foreground">
          What can we do with what was just discussed?
        </p>
      </div>

      {/* LEVEL 1 (v2.7 rule 2b): during an intake flow that flow IS the one
          primary container; otherwise the single Journey Overview answers
          where am I / what matters now / what's next. Nothing competes. */}
      {pendingTransformIntake ? (
        <PanelTransformIntake />
      ) : pendingIntake ? (
        <PanelDreamFlow />
      ) : discoveryOpen ? (
        <PanelDiscoveryFlow onClose={() => setDiscoveryOpen(false)} />
      ) : (
        <>
          <PanelDecompositionCard />
          <JourneyOverviewCard
            journey={journey}
            xp={xpProgress}
            onDiscover={() => setDiscoveryOpen(true)}
            onWorkOnThis={() => {
              if (journey.goalId && journey.milestoneId) {
                setActionSelection({ goalId: journey.goalId, milestoneId: journey.milestoneId });
              } else {
                openWorkspaceSection(journey.kind === 'transformation' ? 'programs' : 'actions');
                setDrawersRevealed(true);
              }
            }}
            onSeeRoadmap={() => {
              const raw = rawJourneyGoalById(journey.goalId);
              if (raw) {
                setJourneyViewGoal(raw);
                openWorkspaceSection('actions');
              } else {
                openWorkspaceSection('programs');
              }
              setDrawersRevealed(true);
            }}
          />
        </>
      )}

      {/* LEVELS 2-3 live behind ONE "Show more"; navigation auto-reveals. */}
      {pendingIntake && dreamFlow.momentStage !== 'done' ? (
        // v2.9 "one moment at a time": while a guided achievement flow is
        // active, the six-section IA is structurally hidden. Complexity
        // reappears only when the user finishes the current moment.
        null
      ) : !drawersRevealed ? (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setDrawersRevealed(true)}
          className="w-full h-8 text-xs text-muted-foreground hover:text-foreground justify-center"
        >
          Show more
          <ChevronDown className="ml-1 h-3.5 w-3.5" />
        </Button>
      ) : (
      <div className="space-y-2">
        {SECTION_ORDER.map((id) => (
          <div key={id} ref={(node) => { sectionRefs.current[id] = node; }}>
            <SectionDrawer
              label={sectionLabels[id]}
              isOpen={openSections[id]}
              onToggle={() => toggleSection(id)}
            >
            {id === 'programs' ? (
              <PanelProgramsSection
                goals={goals}
                isLoading={isLoading}
                onOpenMilestone={(goalId, milestoneId) =>
                  setActionSelection({ goalId, milestoneId })
                }
                onResumeTask={(goalId, task) => setSelectedTask({ goalId, task })}
                onOpenMap={(rawGoal) => {
                  setJourneyViewGoal(rawGoal);
                  openWorkspaceSection('actions');
                }}
              />
            ) : id === 'tools' ? (
              <div className="space-y-3">
                {/* v3.0: the proactive layer's one user-facing control */}
                <PanelProactivitySettings />
                {legacyTools ?? null}
              </div>
            ) : id === 'actions' ? (
              journeyViewGoal ? (
                <PanelJourneyView
                  goal={journeyViewGoal}
                  onBack={() => setJourneyViewGoal(null)}
                  onOpenMilestone={(mid) => {
                    const gid = String(journeyViewGoal?.id ?? journeyViewGoal?.goal_id ?? '');
                    if (gid) {
                      setJourneyViewGoal(null);
                      setActionSelection({ goalId: gid, milestoneId: mid });
                    }
                  }}
                  onOpenTask={(t) => {
                    const gid = String(journeyViewGoal?.id ?? journeyViewGoal?.goal_id ?? '');
                    setJourneyViewGoal(null);
                    setSelectedTask({ goalId: gid || undefined, task: t });
                  }}
                />
              ) : selectedGoal && selectedMilestone ? (
                <div className="space-y-2">
                  <PanelBreadcrumb
                    crumbs={[{ label: 'Actions', onClick: () => setActionSelection(null) }]}
                    current={selectedMilestone.title}
                  />
                  <PanelMilestoneView
                    goal={selectedGoal}
                    milestone={selectedMilestone}
                    onSelectMilestone={(mid) =>
                      setActionSelection({ goalId: selectedGoal.id, milestoneId: mid })
                    }
                    onOpenTask={(t) => setSelectedTask({ goalId: t.goalId, task: t.raw ?? t })}
                  />
                </div>
              ) : selectedTask?.task ? (
                <PanelTaskView
                  task={selectedTask.task}
                  goalId={selectedTask.goalId}
                  goalTitle={selectedTaskGoalTitle}
                  onBack={() => setSelectedTask(null)}
                />
              ) : (
                <div className="space-y-3">
                  <ActionHub
                    goals={goals}
                    isLoading={isLoading}
                    onSelectMilestone={(goalId, milestoneId) =>
                      setActionSelection({ goalId, milestoneId })
                    }
                  />
                  {/* Wave 1: the kanban's status machine, compressed —
                      status changes write through the one existing path. */}
                  <PanelTaskBoard
                    onOpenTask={(t) => setSelectedTask({ goalId: t.goalId, task: t.raw ?? t })}
                  />
                  {/* Wave 3: the rhythm layer — habits with streaks */}
                  <PanelHabits />
                </div>
              )
            ) : id === 'insights' ? (
              <InsightsList entries={helpHistory} />
            ) : id === 'history' ? (
              <div className="space-y-2 [&_.rounded-2xl]:rounded-lg [&_.shadow-lg]:shadow-none">
                {/* v3.4: My Journey — the perspective level, entered
                    deliberately (collapsed), composed from existing stores */}
                <PanelMyJourney />
                {/* v3.2 Slice 2: conversation episodes as the user thinks of
                    them — the first brick of the "My Journey" horizon */}
                <PanelEpisodeHistory />
                {/* Wave 3: the built weekly retrospective, self-contained */}
                <WeeklySummary />
                {/* Wave 4: the built achievement dashboard, one reveal away */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setAchievementsOpen((v) => !v)}
                  className="h-7 px-2 text-[11px] text-muted-foreground hover:text-foreground w-full justify-start"
                >
                  {achievementsOpen ? 'Hide achievements' : 'Show achievements →'}
                </Button>
                {achievementsOpen && <DreamAchievementDashboard />}
              </div>
            ) : (
              <EmptySlot label={placeholderFor(id)} />
            )}
            </SectionDrawer>
          </div>
        ))}
      </div>
      )}
    </div>
  );
};

// ————————————————————————————————————————————————————————————
// Overview data derivation — reads real state, honest empty states.
// ————————————————————————————————————————————————————————————

// ————————————————————————————————————————————————————————————
// Level 1: the ONE Journey Overview (v2.7 rule 2b) — where am I /
// what matters now / what's next. Real state, honest empty state.
// ————————————————————————————————————————————————————————————

interface JourneyOverview {
  kind: 'achievement' | 'transformation' | 'empty' | 'loading';
  title: string;
  /** 0-100 for achievement; week-based for transformation. */
  progressPct: number | null;
  progressLabel: string;
  todayLine: string | null;
  nextLine: string | null;
  goalId?: string;
  milestoneId?: string;
}

function deriveJourneyOverview(
  goals: Goal[],
  transformPrograms: any[],
  loading: boolean,
): JourneyOverview {
  if (loading && goals.length === 0 && transformPrograms.length === 0) {
    return { kind: 'loading', title: 'Loading…', progressPct: null, progressLabel: '', todayLine: null, nextLine: null };
  }

  // Primary journey: the first active achievement program with open work;
  // otherwise the newest transformation program.
  const activeGoal = goals.find((g) => (g.progress ?? 0) < 100 && g.milestones?.length > 0);
  const activeMilestone: GoalMilestone | undefined = activeGoal?.milestones.find((m) => !m.completed);

  if (activeGoal && activeMilestone) {
    const idx = activeGoal.milestones.findIndex((m) => m.id === activeMilestone.id);
    const after = activeGoal.milestones.slice(idx + 1).find((m) => !m.completed);
    return {
      kind: 'achievement',
      title: activeGoal.title,
      progressPct: activeGoal.progress ?? 0,
      progressLabel: `${activeGoal.progress ?? 0}% · step ${idx + 1} of ${activeGoal.milestones.length}`,
      todayLine: activeMilestone.title,
      nextLine: after ? after.title : null,
      goalId: activeGoal.id,
      milestoneId: activeMilestone.id,
    };
  }

  const tp = transformPrograms[0];
  if (tp) {
    const pattern = tp.blueprint_params?.pattern_seed as string | undefined;
    return {
      kind: 'transformation',
      title: pattern ? `“${pattern}”` : (DOMAIN_LABELS[tp.domain as keyof typeof DOMAIN_LABELS] ?? tp.domain),
      progressPct: tp.total_weeks ? Math.round(((tp.current_week - 1) / tp.total_weeks) * 100) : null,
      progressLabel: `Week ${tp.current_week} of ${tp.total_weeks}`,
      todayLine: DOMAIN_LABELS[tp.domain as keyof typeof DOMAIN_LABELS] ?? tp.domain,
      nextLine: null,
    };
  }

  return {
    kind: 'empty',
    title: 'No journey yet',
    progressPct: null,
    progressLabel: '',
    todayLine: null,
    nextLine: 'Select a sentence in the conversation to start one.',
  };
}

function normalizePanelGoal(goal: any): Goal {
  const milestones = Array.isArray(goal?.milestones) ? goal.milestones : [];
  const completedMilestones = milestones.filter((m: any) => !!m?.completed).length;
  const progress = milestones.length > 0 ? Math.round((completedMilestones / milestones.length) * 100) : 0;

  return {
    id: String(goal.id),
    title: typeof goal.title === 'string' ? goal.title : 'Untitled Goal',
    description: typeof goal.description === 'string' ? goal.description : '',
    deadline: goal.target_completion ?? goal.deadline,
    category: goal.category ?? 'personal',
    progress: goal.progress ?? progress,
    alignedWith: Array.isArray(goal.blueprint_insights) ? goal.blueprint_insights : [],
    milestones: milestones.map((m: any, index: number) => ({
      id: String(m?.id ?? `milestone-${index}`),
      title: typeof m?.title === 'string' ? m.title : `Milestone ${index + 1}`,
      completed: !!m?.completed,
      order_index: typeof m?.order_index === 'number' ? m.order_index : typeof m?.order === 'number' ? m.order : index,
    })),
  };
}

const JourneyOverviewCard: React.FC<{
  journey: JourneyOverview;
  xp?: { xpTotal: number; nextMilestone: { milestone: number; xpNeeded: number } | null } | null;
  onDiscover: () => void;
  onWorkOnThis: () => void;
  onSeeRoadmap: () => void;
}> = ({ journey, xp, onDiscover, onWorkOnThis, onSeeRoadmap }) => (
  <Card className="p-4 border-primary/30 bg-primary/5 space-y-2.5">
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-primary/80">
        {journey.kind === 'transformation' ? '🌱 Journey' : 'Journey'}
      </p>
      <p className="text-base font-semibold text-foreground mt-0.5 leading-snug">{journey.title}</p>
    </div>

    {journey.progressPct !== null && (
      <div className="space-y-1">
        <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${journey.progressPct}%` }}
          />
        </div>
        <p className="text-[11px] text-muted-foreground">{journey.progressLabel}</p>
      </div>
    )}

    {journey.todayLine && (
      <p className="text-xs text-foreground">
        <span className="text-muted-foreground">Today · </span>
        {journey.todayLine}
      </p>
    )}
    {journey.nextLine && (
      <p className="text-xs text-muted-foreground">
        <span>Next · </span>
        {journey.nextLine}
      </p>
    )}

    {journey.kind !== 'loading' && (
      <div className="flex items-center gap-2 pt-0.5">
        {journey.kind === 'empty' ? (
          <Button size="sm" onClick={onDiscover} className="h-8 flex-1 text-xs font-semibold">
            ✨ Discover your dream
            <ChevronRight className="ml-1 h-3.5 w-3.5" />
          </Button>
        ) : (
          <Button size="sm" onClick={onWorkOnThis} className="h-8 flex-1 text-xs font-semibold">
            Work on this
            <ChevronRight className="ml-1 h-3.5 w-3.5" />
          </Button>
        )}
        {journey.kind !== 'empty' && (
          <button
            type="button"
            onClick={onSeeRoadmap}
            className="text-[11px] text-muted-foreground hover:text-foreground shrink-0"
          >
            Full roadmap →
          </button>
        )}
      </div>
    )}

    {/* Wave 2: XP surfaced — quiet, one line, real ledger data only */}
    {xp && xp.xpTotal > 0 && (
      <p className="text-[11px] text-muted-foreground pt-0.5">
        ◆ {xp.xpTotal} XP
        {xp.nextMilestone ? ` · ${xp.nextMilestone.xpNeeded} to milestone ${xp.nextMilestone.milestone}` : ''}
      </p>
    )}
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
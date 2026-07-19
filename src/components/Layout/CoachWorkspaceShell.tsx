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
import { useWorkspace, type WorkspaceSectionId } from '@/contexts/WorkspaceContext';
import { useHelpHistory } from '@/hooks/use-help-history';

interface CoachWorkspaceShellProps {
  /** Legacy context tools slot — rendered inside the Tools section drawer. */
  legacyTools?: React.ReactNode;
  className?: string;
}

type SectionId = WorkspaceSectionId;

const SECTION_ORDER: SectionId[] = ['actions', 'insights', 'memories', 'tools', 'history'];

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
  const knownGoalIdsRef = useRef<Set<string>>(new Set());
  const sectionRefs = useRef<Record<SectionId, HTMLDivElement | null>>({
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
    });
  }, [openWorkspaceSection]);

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

  // Derive Overview data from real state — no mock data (Directive 1).
  const overview = useMemo(() => deriveOverview(goals, isLoading), [goals, isLoading]);

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
      {/* Header — no dev badges (eliminate what adds no user value) */}
      <div className="space-y-1">
        <h3 className="text-base font-semibold text-foreground">Coach Workspace</h3>
        <p className="text-xs text-muted-foreground">
          What can we do with what was just discussed?
        </p>
      </div>

      {/* OVERVIEW — three pieces with real hierarchy: Focus is THE primary
          card and carries the panel's one action; thread + suggestion are
          quiet supporting rows (UX deck: one primary action per screen,
          hierarchy on the data, actionable empty states). */}
      <section aria-label="Overview" className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Overview
          </h4>
        </div>
        {pendingTransformIntake ? (
          <PanelTransformIntake />
        ) : pendingIntake ? (
          <PanelDreamFlow />
        ) : (
          <PanelDecompositionCard />
        )}
        <div className="space-y-2">
          <FocusCard
            title={overview.focus.title}
            hint={overview.focus.hint}
            emptyCta={overview.focus.emptyCta}
            action={
              overview.focus.milestoneTitle
                ? {
                    label: 'Continue in chat',
                    onClick: () =>
                      askCoach(
                        `Help me work on "${overview.focus.milestoneTitle}"${
                          overview.focus.hint ? ` (part of "${overview.focus.hint}")` : ''
                        }.`,
                      ),
                  }
                : {
                    label: 'Where should I start?',
                    onClick: () => askCoach('Where should I start today?'),
                  }
            }
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
          <div key={id} ref={(node) => { sectionRefs.current[id] = node; }}>
            <SectionDrawer
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
                    crumbs={[{ label: 'Actions', onClick: () => setActionSelection(null) }]}
                    current={selectedMilestone.title}
                  />
                  <PanelMilestoneView
                    goal={selectedGoal}
                    milestone={selectedMilestone}
                    onSelectMilestone={(mid) =>
                      setActionSelection({ goalId: selectedGoal.id, milestoneId: mid })
                    }
                    onAskCoach={askCoach}
                  />
                </div>
              ) : selectedTask?.task ? (
                <PanelTaskView
                  task={selectedTask.task}
                  goalTitle={selectedTaskGoalTitle}
                  onBack={() => setSelectedTask(null)}
                  onAskCoach={askCoach}
                />
              ) : (
                <ActionHub
                  goals={goals}
                  isLoading={isLoading}
                  onSelectMilestone={(goalId, milestoneId) =>
                    setActionSelection({ goalId, milestoneId })
                  }
                />
              )
            ) : id === 'insights' ? (
              <InsightsList entries={helpHistory} />
            ) : (
              <EmptySlot label={placeholderFor(id)} />
            )}
            </SectionDrawer>
          </div>
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
  /** Set when the slot represents a real milestone the user can act on. */
  milestoneTitle?: string;
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
  // Dynamic personal context (UX deck: "you slept 2 hours longer than
  // yesterday" beats a static count): step position inside the program.
  const stepIndex = activeGoal && activeMilestone
    ? activeGoal.milestones.findIndex((m) => m.id === activeMilestone.id)
    : -1;
  const focus: OverviewSlot = activeMilestone
    ? {
        title: activeMilestone.title,
        hint: activeGoal
          ? `${activeGoal.title}${stepIndex >= 0 ? ` · step ${stepIndex + 1} of ${activeGoal.milestones.length}` : ''}`
          : undefined,
        milestoneTitle: activeMilestone.title,
      }
    : {
        title: 'Nothing on the table yet',
        emptyCta: 'Select a sentence in the conversation to start a program — or ask below.',
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

/**
 * FocusCard — the Overview's PRIMARY piece. Bigger type on the data (the
 * milestone), tinted surface, and the panel's single action button. Empty
 * state is an invitation with a tap, never dead text.
 */
const FocusCard: React.FC<{
  title: string;
  hint?: string;
  emptyCta?: string;
  action: { label: string; onClick: () => void };
}> = ({ title, hint, emptyCta, action }) => (
  <Card className="p-4 border-primary/30 bg-primary/5">
    <div className="flex items-start gap-3">
      <div className="mt-0.5 h-9 w-9 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0">
        <Target className="h-4.5 w-4.5 text-primary" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-primary/80">
          Today's Focus
        </p>
        <p className="text-base font-semibold text-foreground mt-0.5 leading-snug">{title}</p>
        {hint && <p className="text-xs text-muted-foreground mt-0.5">{hint}</p>}
        {emptyCta && !hint && (
          <p className="text-xs text-muted-foreground/80 mt-0.5">{emptyCta}</p>
        )}
        <Button
          size="sm"
          onClick={action.onClick}
          className="mt-3 h-8 w-full text-xs font-semibold"
        >
          {action.label}
          <ChevronRight className="ml-1 h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  </Card>
);

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
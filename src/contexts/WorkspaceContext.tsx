/**
 * WorkspaceContext — panel intake handoff store (v2.5).
 *
 * The conversation (Twin) triggers; the workspace (Coach panel) executes.
 * When a sentence-selection OfferCard is confirmed in chat, we stash a
 * `pendingIntake` here and auto-open the panel. The panel-hosted dream
 * flow reads this store and drives the existing decomposition engine.
 *
 * Additive only — this does not replace `coach-workspace-bus`; it uses it.
 */

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { emitCoachOpen, emitCoachDecomposition } from '@/lib/coach-workspace-bus';

export interface PendingIntake {
  title: string;
  category: string;
  timeframe: string;
  source: 'sentence' | 'offer';
  /**
   * AUTHORSHIP GATE (Runtime Constitution, deterministic behaviour).
   *
   * A goal is a claim about what the user wants. Only the user may make it.
   * Sentence selection runs on the Twin's own messages — InteractiveSentenceText
   * renders on assistant messages only — so every title arriving from that path
   * is text the Twin wrote, and one of them became a `user_goals` row reading
   * "Kortom: je bent niet alleen chaotisch…".
   *
   * `false` means proposed but not yet adopted: the flow stops and asks the user
   * to author the title. Authorship has three equally valid forms — type a new
   * one, edit the suggestion, or accept it unchanged — because all three are an
   * intentional adoption. Nothing downstream of this gate may create a goal
   * while it is false.
   */
  authored?: boolean;
}

/**
 * v2.6 "Help me change this pattern": the selected passage becomes the
 * seed of a TRANSFORMATION program (growth engine), routed to the panel
 * exactly like the achievement intake. Additive — parallel to
 * pendingIntake; one operational flow is active at a time.
 *
 * v2.8: the seed carries the full structured context the router needs
 * (inferred domain/pattern/belief) so the panel can present a Coach
 * interpretation instead of a raw domain grid. Backward-compatible —
 * only `pattern` is required.
 */
export interface PendingTransformIntake {
  /** The selected passage, verbatim — input and provenance. */
  pattern: string;
  sourceMessageId?: string;
  conversationContext?: string;
  inferredDomain?: string;
  inferredPattern?: string;
  inferredBelief?: string;
  blueprintEvidence?: string[];
  relatedProgramId?: string;
}

export type DreamFlowPhase = 'building' | 'ready';

/**
 * v2.9 "one moment at a time" — the achievement side-panel is a
 * linear sequence, not a dashboard. Persisted alongside the rest of
 * dreamFlow so a Sheet close/reopen resumes on the same moment.
 *
 *   milestone → task → working → done
 *
 * `showPlan` is a local disclosure: the "See the plan" secondary from
 * any moment reveals the roadmap without exiting the current moment.
 */
export type DreamMomentStage = 'milestone' | 'task' | 'working' | 'done';

/**
 * v2.8 Transformation router. "Help me transform this" is one journey with
 * three depths — the panel decides *route* first, then walks *stage*.
 * Persisted alongside the seed so a Sheet close/reopen resumes exactly.
 */
export type TransformRoute = 'intake' | 'immediate' | 'program' | 'pattern_scope';
export type TransformStage =
  // shared
  | 'chooser'
  // immediate
  | 'reflect'
  | 'help_menu'
  | 'tool_mood'
  | 'tool_reflection'
  | 'tool_insight'
  // program
  | 'program_confirm'
  | 'program_belief'
  | 'program_root'
  | 'program_generate'
  | 'program_workspace'
  // pattern scope
  | 'scope_menu'
  | 'scope_domain_focus'
  | 'scope_guided'
  | 'scope_full'
  | 'scope_interpretation';

export interface TransformFlowState {
  route: TransformRoute;
  stage: TransformStage;
}

const DEFAULT_TRANSFORM_FLOW: TransformFlowState = {
  route: 'intake',
  stage: 'chooser',
};

export type WorkspaceSectionId = 'programs' | 'actions' | 'insights' | 'memories' | 'tools' | 'history';

export interface ActionSelection {
  goalId: string;
  milestoneId: string;
}

export interface WorkspaceTaskSelection {
  goalId?: string;
  task: any;
}

export interface DreamFlowState {
  phase: DreamFlowPhase;
  decomposedGoal: any | null;
  showAllMilestones: boolean;
  dismissed: boolean;
  momentStage: DreamMomentStage;
  showPlan: boolean;
}

const DEFAULT_DREAM_FLOW: DreamFlowState = {
  phase: 'building',
  decomposedGoal: null,
  showAllMilestones: false,
  dismissed: false,
  momentStage: 'milestone',
  showPlan: false,
};

const DEFAULT_OPEN_SECTIONS: Record<WorkspaceSectionId, boolean> = {
  programs: false,
  actions: false,
  insights: false,
  memories: false,
  tools: false,
  history: false,
};

const STORAGE_KEY = 'coach-workspace:state:v1';

interface WorkspaceContextValue {
  pendingIntake: PendingIntake | null;
  openPanelWithIntake: (intake: PendingIntake) => void;
  adoptPendingIntake: (title: string) => void;
  clearPendingIntake: () => void;
  pendingTransformIntake: PendingTransformIntake | null;
  openPanelWithTransformIntake: (intake: PendingTransformIntake) => void;
  clearPendingTransformIntake: () => void;
  transformFlow: TransformFlowState;
  patchTransformFlow: (patch: Partial<TransformFlowState>) => void;
  resetTransformFlow: () => void;
  dreamFlow: DreamFlowState;
  patchDreamFlow: (patch: Partial<DreamFlowState>) => void;
  resetDreamFlow: () => void;
  selection: ActionSelection | null;
  setActionSelection: (selection: ActionSelection | null) => void;
  selectedTask: WorkspaceTaskSelection | null;
  setSelectedTask: (selection: WorkspaceTaskSelection | null) => void;
  openSections: Record<WorkspaceSectionId, boolean>;
  openWorkspaceSection: (id: WorkspaceSectionId) => void;
  toggleWorkspaceSection: (id: WorkspaceSectionId) => void;
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

function loadPersisted(): {
  pendingIntake: PendingIntake | null;
  dreamFlow: DreamFlowState;
  selection: ActionSelection | null;
  selectedTask: WorkspaceTaskSelection | null;
  openSections: Record<WorkspaceSectionId, boolean>;
} {
  if (typeof window === 'undefined') {
    return {
      pendingIntake: null,
      dreamFlow: DEFAULT_DREAM_FLOW,
      selection: null,
      selectedTask: null,
      openSections: DEFAULT_OPEN_SECTIONS,
    };
  }
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {
        pendingIntake: null,
        dreamFlow: DEFAULT_DREAM_FLOW,
        selection: null,
        selectedTask: null,
        openSections: DEFAULT_OPEN_SECTIONS,
      };
    }
    const parsed = JSON.parse(raw);
    return {
      pendingIntake: parsed?.pendingIntake ?? null,
      dreamFlow: { ...DEFAULT_DREAM_FLOW, ...(parsed?.dreamFlow ?? {}) },
      selection: parsed?.selection ?? null,
      selectedTask: parsed?.selectedTask ?? null,
      openSections: { ...DEFAULT_OPEN_SECTIONS, ...(parsed?.openSections ?? {}) },
    };
  } catch {
    return {
      pendingIntake: null,
      dreamFlow: DEFAULT_DREAM_FLOW,
      selection: null,
      selectedTask: null,
      openSections: DEFAULT_OPEN_SECTIONS,
    };
  }
}

export const WorkspaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const initial = useMemo(loadPersisted, []);
  const [pendingIntake, setPendingIntake] = useState<PendingIntake | null>(initial.pendingIntake);
  const [pendingTransformIntake, setPendingTransformIntake] = useState<PendingTransformIntake | null>(
    typeof window !== 'undefined'
      ? (() => {
          try {
            const raw = window.sessionStorage.getItem(STORAGE_KEY);
            return raw ? (JSON.parse(raw)?.pendingTransformIntake ?? null) : null;
          } catch {
            return null;
          }
        })()
      : null,
  );
  const [transformFlow, setTransformFlow] = useState<TransformFlowState>(
    typeof window !== 'undefined'
      ? (() => {
          try {
            const raw = window.sessionStorage.getItem(STORAGE_KEY);
            const parsed = raw ? JSON.parse(raw) : null;
            return { ...DEFAULT_TRANSFORM_FLOW, ...(parsed?.transformFlow ?? {}) };
          } catch {
            return DEFAULT_TRANSFORM_FLOW;
          }
        })()
      : DEFAULT_TRANSFORM_FLOW,
  );
  const [dreamFlow, setDreamFlow] = useState<DreamFlowState>(initial.dreamFlow);
  const [selection, setSelection] = useState<ActionSelection | null>(initial.selection);
  const [selectedTask, setSelectedTaskState] = useState<WorkspaceTaskSelection | null>(initial.selectedTask);
  const [openSections, setOpenSections] = useState<Record<WorkspaceSectionId, boolean>>(initial.openSections);

  // Persist on every change so a Sheet unmount/remount does not lose state.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ pendingIntake, pendingTransformIntake, transformFlow, dreamFlow, selection, selectedTask, openSections }),
      );
    } catch {
      /* ignore quota errors */
    }
  }, [pendingIntake, pendingTransformIntake, transformFlow, dreamFlow, selection, selectedTask, openSections]);

  const openPanelWithIntake = useCallback((intake: PendingIntake) => {
    setPendingIntake(intake);
    setPendingTransformIntake(null);
    // New intake ⇒ fresh build cycle. Preserve until user completes/dismisses.
    setDreamFlow(DEFAULT_DREAM_FLOW);
    setSelection(null);
    setSelectedTaskState(null);
    setOpenSections((prev) => ({ ...prev, actions: true }));
    // Auto-open the Coach panel on the Actions section so the flow lands
    // visibly. Bus is idempotent — safe to call regardless of panel state.
    emitCoachOpen({ section: 'actions', view: 'decomposition', reason: `intake:${intake.source}` });
  }, []);

  /**
   * The user adopted the title — the ONE place `authored` may become true, and
   * the point at which the build may start. Typing a new title, editing the
   * suggestion and accepting it unchanged all arrive here, because all three
   * are an intentional adoption.
   */
  const adoptPendingIntake = useCallback((title: string) => {
    let adoptedTitle = '';
    setPendingIntake((prev) => {
      if (!prev) return prev;
      adoptedTitle = title.trim() || prev.title;
      return { ...prev, title: adoptedTitle, authored: true };
    });
    // Emitted outside the updater — StrictMode invokes updaters twice, and the
    // build must start exactly once.
    if (adoptedTitle) emitCoachDecomposition({ phase: 'start', dreamTitle: adoptedTitle });
  }, []);

  const clearPendingIntake = useCallback(() => {
    setPendingIntake(null);
    setDreamFlow(DEFAULT_DREAM_FLOW);
    setSelection(null);
    setSelectedTaskState(null);
  }, []);

  // v2.6: transformation intake — parallel operational flow; opening one
  // clears the other (one program build at a time in the panel).
  const openPanelWithTransformIntake = useCallback((intake: PendingTransformIntake) => {
    setPendingTransformIntake(intake);
    setPendingIntake(null);
    setDreamFlow(DEFAULT_DREAM_FLOW);
    setTransformFlow(DEFAULT_TRANSFORM_FLOW);
    setSelection(null);
    setSelectedTaskState(null);
    setOpenSections((prev) => ({ ...prev, actions: true }));
    emitCoachOpen({ section: 'actions', view: 'transformation', reason: 'intake:sentence' });
  }, []);

  const clearPendingTransformIntake = useCallback(() => {
    setPendingTransformIntake(null);
    setTransformFlow(DEFAULT_TRANSFORM_FLOW);
  }, []);

  const patchTransformFlow = useCallback(
    (patch: Partial<TransformFlowState>) => setTransformFlow((prev) => ({ ...prev, ...patch })),
    [],
  );
  const resetTransformFlow = useCallback(() => setTransformFlow(DEFAULT_TRANSFORM_FLOW), []);

  const patchDreamFlow = useCallback(
    (patch: Partial<DreamFlowState>) => setDreamFlow((prev) => ({ ...prev, ...patch })),
    [],
  );
  const resetDreamFlow = useCallback(() => setDreamFlow(DEFAULT_DREAM_FLOW), []);
  const setActionSelection = useCallback((next: ActionSelection | null) => {
    setSelection(next);
    if (next) {
      setSelectedTaskState(null);
      setOpenSections((prev) => ({ ...prev, actions: true }));
    }
  }, []);
  const setSelectedTask = useCallback((next: WorkspaceTaskSelection | null) => {
    setSelectedTaskState(next);
    if (next) {
      setSelection(null);
      setOpenSections((prev) => ({ ...prev, actions: true }));
    }
  }, []);
  const openWorkspaceSection = useCallback((id: WorkspaceSectionId) => {
    setOpenSections((prev) => ({ ...prev, [id]: true }));
  }, []);
  const toggleWorkspaceSection = useCallback((id: WorkspaceSectionId) => {
    setOpenSections((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const value = useMemo(
    () => ({
      pendingIntake,
      openPanelWithIntake,
      adoptPendingIntake,
      clearPendingIntake,
      pendingTransformIntake,
      openPanelWithTransformIntake,
      clearPendingTransformIntake,
      transformFlow,
      patchTransformFlow,
      resetTransformFlow,
      dreamFlow,
      patchDreamFlow,
      resetDreamFlow,
      selection,
      setActionSelection,
      selectedTask,
      setSelectedTask,
      openSections,
      openWorkspaceSection,
      toggleWorkspaceSection,
    }),
    [
      pendingIntake,
      openPanelWithIntake,
      adoptPendingIntake,
      clearPendingIntake,
      pendingTransformIntake,
      openPanelWithTransformIntake,
      clearPendingTransformIntake,
      transformFlow,
      patchTransformFlow,
      resetTransformFlow,
      dreamFlow,
      patchDreamFlow,
      resetDreamFlow,
      selection,
      setActionSelection,
      selectedTask,
      setSelectedTask,
      openSections,
      openWorkspaceSection,
      toggleWorkspaceSection,
    ],
  );

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
};

export function useWorkspace(): WorkspaceContextValue {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) {
    throw new Error('useWorkspace must be used inside <WorkspaceProvider>');
  }
  return ctx;
}
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
import { emitCoachOpen } from '@/lib/coach-workspace-bus';

export interface PendingIntake {
  title: string;
  category: string;
  timeframe: string;
  source: 'sentence' | 'offer';
}

/**
 * v2.6 "Help me change this pattern": the selected passage becomes the
 * seed of a TRANSFORMATION program (growth engine), routed to the panel
 * exactly like the achievement intake. Additive — parallel to
 * pendingIntake; one operational flow is active at a time.
 */
export interface PendingTransformIntake {
  /** The selected passage, verbatim — input and provenance. */
  pattern: string;
}

export type DreamFlowPhase = 'building' | 'ready';

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
}

const DEFAULT_DREAM_FLOW: DreamFlowState = {
  phase: 'building',
  decomposedGoal: null,
  showAllMilestones: false,
  dismissed: false,
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
  clearPendingIntake: () => void;
  pendingTransformIntake: PendingTransformIntake | null;
  openPanelWithTransformIntake: (intake: PendingTransformIntake) => void;
  clearPendingTransformIntake: () => void;
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
        JSON.stringify({ pendingIntake, pendingTransformIntake, dreamFlow, selection, selectedTask, openSections }),
      );
    } catch {
      /* ignore quota errors */
    }
  }, [pendingIntake, pendingTransformIntake, dreamFlow, selection, selectedTask, openSections]);

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
    setSelection(null);
    setSelectedTaskState(null);
    setOpenSections((prev) => ({ ...prev, actions: true }));
    emitCoachOpen({ section: 'actions', view: 'transformation', reason: 'intake:sentence' });
  }, []);

  const clearPendingTransformIntake = useCallback(() => {
    setPendingTransformIntake(null);
  }, []);

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
      clearPendingIntake,
      pendingTransformIntake,
      openPanelWithTransformIntake,
      clearPendingTransformIntake,
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
      clearPendingIntake,
      pendingTransformIntake,
      openPanelWithTransformIntake,
      clearPendingTransformIntake,
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
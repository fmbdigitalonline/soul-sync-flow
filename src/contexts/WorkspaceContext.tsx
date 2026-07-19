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

import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { useEffect } from 'react';
import { emitCoachOpen } from '@/lib/coach-workspace-bus';

export interface PendingIntake {
  title: string;
  category: string;
  timeframe: string;
  source: 'sentence' | 'offer';
}

export type DreamFlowPhase = 'building' | 'ready';

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

const STORAGE_KEY = 'coach-workspace:state:v1';

interface WorkspaceContextValue {
  pendingIntake: PendingIntake | null;
  openPanelWithIntake: (intake: PendingIntake) => void;
  clearPendingIntake: () => void;
  dreamFlow: DreamFlowState;
  patchDreamFlow: (patch: Partial<DreamFlowState>) => void;
  resetDreamFlow: () => void;
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

function loadPersisted(): {
  pendingIntake: PendingIntake | null;
  dreamFlow: DreamFlowState;
} {
  if (typeof window === 'undefined') {
    return { pendingIntake: null, dreamFlow: DEFAULT_DREAM_FLOW };
  }
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return { pendingIntake: null, dreamFlow: DEFAULT_DREAM_FLOW };
    const parsed = JSON.parse(raw);
    return {
      pendingIntake: parsed?.pendingIntake ?? null,
      dreamFlow: { ...DEFAULT_DREAM_FLOW, ...(parsed?.dreamFlow ?? {}) },
    };
  } catch {
    return { pendingIntake: null, dreamFlow: DEFAULT_DREAM_FLOW };
  }
}

export const WorkspaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const initial = useMemo(loadPersisted, []);
  const [pendingIntake, setPendingIntake] = useState<PendingIntake | null>(initial.pendingIntake);
  const [dreamFlow, setDreamFlow] = useState<DreamFlowState>(initial.dreamFlow);

  // Persist on every change so a Sheet unmount/remount does not lose state.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ pendingIntake, dreamFlow }),
      );
    } catch {
      /* ignore quota errors */
    }
  }, [pendingIntake, dreamFlow]);

  const openPanelWithIntake = useCallback((intake: PendingIntake) => {
    setPendingIntake(intake);
    // New intake ⇒ fresh build cycle. Preserve until user completes/dismisses.
    setDreamFlow(DEFAULT_DREAM_FLOW);
    // Auto-open the Coach panel on the Actions section so the flow lands
    // visibly. Bus is idempotent — safe to call regardless of panel state.
    emitCoachOpen({ section: 'actions', view: 'decomposition', reason: `intake:${intake.source}` });
  }, []);

  const clearPendingIntake = useCallback(() => {
    setPendingIntake(null);
    setDreamFlow(DEFAULT_DREAM_FLOW);
  }, []);

  const patchDreamFlow = useCallback(
    (patch: Partial<DreamFlowState>) => setDreamFlow((prev) => ({ ...prev, ...patch })),
    [],
  );
  const resetDreamFlow = useCallback(() => setDreamFlow(DEFAULT_DREAM_FLOW), []);

  const value = useMemo(
    () => ({
      pendingIntake,
      openPanelWithIntake,
      clearPendingIntake,
      dreamFlow,
      patchDreamFlow,
      resetDreamFlow,
    }),
    [pendingIntake, openPanelWithIntake, clearPendingIntake, dreamFlow, patchDreamFlow, resetDreamFlow],
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
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
import { emitCoachOpen } from '@/lib/coach-workspace-bus';

export interface PendingIntake {
  title: string;
  category: string;
  timeframe: string;
  source: 'sentence' | 'offer';
}

interface WorkspaceContextValue {
  pendingIntake: PendingIntake | null;
  openPanelWithIntake: (intake: PendingIntake) => void;
  clearPendingIntake: () => void;
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

export const WorkspaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [pendingIntake, setPendingIntake] = useState<PendingIntake | null>(null);

  const openPanelWithIntake = useCallback((intake: PendingIntake) => {
    setPendingIntake(intake);
    // Auto-open the Coach panel on the Actions section so the flow lands
    // visibly. Bus is idempotent — safe to call regardless of panel state.
    emitCoachOpen({ section: 'actions', view: 'decomposition', reason: `intake:${intake.source}` });
  }, []);

  const clearPendingIntake = useCallback(() => setPendingIntake(null), []);

  const value = useMemo(
    () => ({ pendingIntake, openPanelWithIntake, clearPendingIntake }),
    [pendingIntake, openPanelWithIntake, clearPendingIntake],
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
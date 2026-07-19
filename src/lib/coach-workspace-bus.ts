/**
 * Coach Workspace event bus — Slice C handshake polish.
 *
 * When the twin (conversation) fires a multi-step tool such as a
 * decompose_goal confirmation, we want the Coach (side panel) to
 * open automatically so the user can see the acting surface land.
 *
 * This module is deliberately tiny and framework-agnostic: it emits a
 * DOM CustomEvent that both the panel container (MainLayout) and the
 * workspace shell (CoachWorkspaceShell) subscribe to. No writes, no
 * global mutable state, no side effects beyond dispatching an event.
 */

export type CoachSectionId = 'actions' | 'insights' | 'memories' | 'tools' | 'history';

/** Panel-local views navigated inside a section (Slice J). */
export type CoachPanelView =
  | 'kanban'
  | 'roadmap'
  | 'milestone'
  | 'decomposition'
  | 'transformation';

export interface CoachOpenDetail {
  section?: CoachSectionId;
  view?: CoachPanelView;
  goalId?: string;
  milestoneId?: string;
  reason?: string;
}

export type CoachDecompositionPhase = 'start' | 'complete' | 'error';

export interface CoachDecompositionDetail {
  phase: CoachDecompositionPhase;
  dreamTitle: string;
  error?: string;
}

const OPEN_EVENT = 'coach-workspace:open';
const CLOSE_EVENT = 'coach-workspace:close';
const DECOMP_EVENT = 'coach-workspace:decomposition';

export function emitCoachOpen(detail: CoachOpenDetail = {}): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent<CoachOpenDetail>(OPEN_EVENT, { detail }));
}

export function onCoachOpen(cb: (detail: CoachOpenDetail) => void): () => void {
  if (typeof window === 'undefined') return () => {};
  const handler = (e: Event) => cb(((e as CustomEvent<CoachOpenDetail>).detail) ?? {});
  window.addEventListener(OPEN_EVENT, handler);
  return () => window.removeEventListener(OPEN_EVENT, handler);
}

export function emitCoachClose(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(CLOSE_EVENT));
}

export function onCoachClose(cb: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener(CLOSE_EVENT, cb);
  return () => window.removeEventListener(CLOSE_EVENT, cb);
}

export function emitCoachDecomposition(detail: CoachDecompositionDetail): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent<CoachDecompositionDetail>(DECOMP_EVENT, { detail }));
}

export function onCoachDecomposition(
  cb: (detail: CoachDecompositionDetail) => void,
): () => void {
  if (typeof window === 'undefined') return () => {};
  const handler = (e: Event) => {
    const d = (e as CustomEvent<CoachDecompositionDetail>).detail;
    if (d) cb(d);
  };
  window.addEventListener(DECOMP_EVENT, handler);
  return () => window.removeEventListener(DECOMP_EVENT, handler);
}
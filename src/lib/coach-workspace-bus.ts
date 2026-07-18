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

export interface CoachOpenDetail {
  /** Which section to auto-expand once the panel is open. */
  section?: CoachSectionId;
  /** Optional origin marker for debugging (e.g. 'decompose_goal'). */
  reason?: string;
}

const EVENT = 'coach-workspace:open';

export function emitCoachOpen(detail: CoachOpenDetail = {}): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent<CoachOpenDetail>(EVENT, { detail }));
}

export function onCoachOpen(cb: (detail: CoachOpenDetail) => void): () => void {
  if (typeof window === 'undefined') return () => {};
  const handler = (e: Event) => {
    const ce = e as CustomEvent<CoachOpenDetail>;
    cb(ce.detail ?? {});
  };
  window.addEventListener(EVENT, handler);
  return () => window.removeEventListener(EVENT, handler);
}
/**
 * useCoachAskBridge — app-level receiver for `coach-workspace:ask` events.
 *
 * The Coach side panel (any route) dispatches `coach-workspace:ask` when a
 * user taps "Continue in chat", a milestone row, or "Start task". Before
 * this bridge, only /companion listened, so taps from other routes did
 * nothing. The bridge:
 *   1. Queues the prompt in sessionStorage (so it survives a route change).
 *   2. Toasts immediate feedback ("Sending to your Twin…").
 *   3. Navigates to /companion if the user isn't already there.
 *   4. Re-dispatches `coach-workspace:deliver-asks` so Coach.tsx drains.
 *
 * Coach.tsx owns the send: it drains the queue on mount and on the deliver
 * event, calling handleSendMessage for each. This keeps conversation logic
 * in one place.
 */

import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { emitCoachClose } from '@/lib/coach-workspace-bus';

export const ASK_QUEUE_KEY = 'coach-workspace:asks';
export const DELIVER_EVENT = 'coach-workspace:deliver-asks';

function pushToQueue(prompt: string): void {
  if (typeof window === 'undefined') return;
  try {
    const raw = window.sessionStorage.getItem(ASK_QUEUE_KEY);
    const list: string[] = raw ? JSON.parse(raw) : [];
    list.push(prompt);
    window.sessionStorage.setItem(ASK_QUEUE_KEY, JSON.stringify(list));
  } catch {
    /* ignore */
  }
}

export function drainAskQueue(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.sessionStorage.getItem(ASK_QUEUE_KEY);
    if (!raw) return [];
    window.sessionStorage.removeItem(ASK_QUEUE_KEY);
    const list = JSON.parse(raw);
    return Array.isArray(list) ? list.filter((x): x is string => typeof x === 'string' && x.trim().length > 0) : [];
  } catch {
    return [];
  }
}

export const useCoachAskBridge = (): void => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{ prompt?: string }>).detail;
      const prompt = detail?.prompt?.trim();
      if (!prompt) return;

      pushToQueue(prompt);
      toast.message('Sending to your Twin…', { duration: 1200 });
      emitCoachClose();

      const onCompanion = location.pathname.startsWith('/companion') || location.pathname.startsWith('/coach');
      if (!onCompanion) {
        navigate('/companion');
        // Coach.tsx drains on mount, so no explicit deliver dispatch needed.
      } else {
        // Already on the conversation surface — tell it to drain now.
        window.setTimeout(() => window.dispatchEvent(new CustomEvent(DELIVER_EVENT)), 0);
      }
    };
    window.addEventListener('coach-workspace:ask', handler);
    return () => window.removeEventListener('coach-workspace:ask', handler);
  }, [navigate, location.pathname]);
};

export default useCoachAskBridge;
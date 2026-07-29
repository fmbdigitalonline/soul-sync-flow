/**
 * useTurningPoints — the kept timeline and the one open question.
 *
 * Cache-first so the timeline paints instantly, then the candidate search runs
 * against the real episode history. Re-renders on the decisions event, so a
 * keep made anywhere is reflected everywhere.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  turningPointService, TURNING_POINTS_EVENT,
  type TurningPoint, type TurningPointCandidate, type TurningPointDecisions,
} from '@/services/turning-point-service';

export interface UseTurningPoints {
  kept: TurningPoint[];
  /** The single episode the Twin is asking about, if any. */
  proposal: TurningPointCandidate | null;
  loading: boolean;
  keep: () => void;
  decline: () => void;
  forget: (sessionId: string) => void;
}

const EMPTY: TurningPointDecisions = { kept: [], declined: [] };

export function useTurningPoints(): UseTurningPoints {
  const { user } = useAuth();
  const [decisions, setDecisions] = useState<TurningPointDecisions>(
    () => (user ? turningPointService.readCached(user.id) : null) ?? EMPTY,
  );
  const [proposal, setProposal] = useState<TurningPointCandidate | null>(null);
  const [loading, setLoading] = useState(true);
  const latest = useRef(decisions);
  latest.current = decisions;

  useEffect(() => {
    let cancelled = false;
    if (!user) { setDecisions(EMPTY); setProposal(null); setLoading(false); return; }

    const cached = turningPointService.readCached(user.id);
    if (cached) setDecisions(cached);

    turningPointService.getDecisions().then((res) => {
      if (cancelled || !res) { if (!cancelled) setLoading(false); return; }
      setDecisions(res.decisions);
      return turningPointService.findCandidate(res.userId, res.decisions).then((c) => {
        if (cancelled) return;
        setProposal(c);
        setLoading(false);
      });
    }).catch(() => { if (!cancelled) setLoading(false); });

    const onChange = (e: Event) => {
      const detail = (e as CustomEvent).detail as TurningPointDecisions | undefined;
      if (detail) setDecisions(detail);
    };
    window.addEventListener(TURNING_POINTS_EVENT, onChange);
    return () => {
      cancelled = true;
      window.removeEventListener(TURNING_POINTS_EVENT, onChange);
    };
  }, [user]);

  // After an answer, look for the next episode worth asking about — but only
  // one question is ever on screen at a time.
  const advance = useCallback((userId: string, next: TurningPointDecisions) => {
    setProposal(null);
    turningPointService.findCandidate(userId, next).then(setProposal).catch(() => setProposal(null));
  }, []);

  const keep = useCallback(() => {
    if (!user || !proposal) return;
    const c = proposal;
    turningPointService.keep(user.id, latest.current, c).then((next) => advance(user.id, next));
  }, [user, proposal, advance]);

  const decline = useCallback(() => {
    if (!user || !proposal) return;
    const id = proposal.sessionId;
    turningPointService.decline(user.id, latest.current, id).then((next) => advance(user.id, next));
  }, [user, proposal, advance]);

  const forget = useCallback((sessionId: string) => {
    if (!user) return;
    turningPointService.forget(user.id, latest.current, sessionId);
  }, [user]);

  return { kept: decisions.kept, proposal, loading, keep, decline, forget };
}

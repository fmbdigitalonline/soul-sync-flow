/**
 * useLifeBalance — reactive read of the Life Domains wheel (v3.7).
 *
 * The wheel is drawn by the system's read of real evidence (the all-seeing
 * read), which the user can override with their own manual ratings. This
 * hook blends the two: a manual read wins; otherwise the system read is
 * shown; and when neither exists yet it triggers the analysis (once), so the
 * wheel fills itself. Cache-first for instant paint; re-renders on either
 * the manual event or the system-read event.
 */

import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { lifeBalanceService, LIFE_BALANCE_EVENT, type LifeBalance } from '@/services/life-balance-service';
import {
  lifeBalanceAnalysisService, LIFE_BALANCE_READ_EVENT,
  type DomainRationale, type LifeBalanceRead,
} from '@/services/life-balance-analysis-service';

export type BalanceSource = 'user' | 'system' | null;

export interface UseLifeBalance {
  balance: LifeBalance | null;
  source: BalanceSource;
  rationale: DomainRationale;
  loading: boolean;
  analyzing: boolean;
  /** Re-read the domains from the latest evidence (the all-seeing read). */
  refresh: () => void;
}

export function useLifeBalance(): UseLifeBalance {
  const { user } = useAuth();
  const { language } = useLanguage();
  const lang = language === 'nl' ? 'nl' : 'en';

  const [manual, setManual] = useState<LifeBalance | null>(() =>
    user ? lifeBalanceService.readCached(user.id) : null,
  );
  const [read, setRead] = useState<LifeBalanceRead | null>(() =>
    user ? lifeBalanceAnalysisService.readCached(user.id) : null,
  );
  const [loading, setLoading] = useState(!manual && !read);
  const [analyzing, setAnalyzing] = useState(false);
  const attempted = useRef(false);

  const runAnalysis = (userId: string) => {
    if (analyzing) return;
    setAnalyzing(true);
    lifeBalanceAnalysisService
      .analyze(userId, lang)
      .then((r) => { if (r) setRead(r); })
      .catch(() => { /* honest: leave it unread */ })
      .finally(() => setAnalyzing(false));
  };

  useEffect(() => {
    let cancelled = false;
    if (!user) { setManual(null); setRead(null); setLoading(false); return; }

    setManual(lifeBalanceService.readCached(user.id));
    setRead(lifeBalanceAnalysisService.readCached(user.id));

    Promise.all([
      lifeBalanceService.getLifeBalance(),
      lifeBalanceAnalysisService.getStoredRead(),
    ]).then(([m, r]) => {
      if (cancelled) return;
      setManual(m);
      setRead(r);
      setLoading(false);
      // Fill the wheel itself: only when the user has no manual read, and the
      // system read is missing or stale. Once per mount.
      const hasManual = !!m && Object.keys(m).length > 0;
      if (!hasManual && lifeBalanceAnalysisService.isStale(r) && !attempted.current) {
        attempted.current = true;
        runAnalysis(user.id);
      }
    });

    const onManual = (e: Event) => {
      const detail = (e as CustomEvent).detail as LifeBalance | undefined;
      if (detail) setManual(detail);
    };
    const onRead = (e: Event) => {
      const detail = (e as CustomEvent).detail as LifeBalanceRead | undefined;
      if (detail) setRead(detail);
    };
    window.addEventListener(LIFE_BALANCE_EVENT, onManual);
    window.addEventListener(LIFE_BALANCE_READ_EVENT, onRead);
    return () => {
      cancelled = true;
      window.removeEventListener(LIFE_BALANCE_EVENT, onManual);
      window.removeEventListener(LIFE_BALANCE_READ_EVENT, onRead);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, lang]);

  const hasManual = !!manual && Object.keys(manual).length > 0;
  const balance = hasManual ? manual : read?.scores ?? null;
  const source: BalanceSource = hasManual ? 'user' : read ? 'system' : null;
  const rationale = hasManual ? {} : read?.rationale ?? {};

  const refresh = () => { if (user) { attempted.current = true; runAnalysis(user.id); } };

  return { balance, source, rationale, loading, analyzing, refresh };
}

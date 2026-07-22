/**
 * useLifeBalance — reactive read of the user's life-wheel ratings (v3.4).
 * Cache-first for instant paint, metadata-confirmed, re-renders when the
 * user updates a rating (via LIFE_BALANCE_EVENT).
 */

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { lifeBalanceService, LIFE_BALANCE_EVENT, type LifeBalance } from '@/services/life-balance-service';

export function useLifeBalance(): { balance: LifeBalance | null; loading: boolean } {
  const { user } = useAuth();
  const [balance, setBalance] = useState<LifeBalance | null>(() =>
    user ? lifeBalanceService.readCached(user.id) : null,
  );
  const [loading, setLoading] = useState(!balance);

  useEffect(() => {
    let cancelled = false;
    if (!user) {
      setBalance(null);
      setLoading(false);
      return;
    }
    setBalance(lifeBalanceService.readCached(user.id));
    lifeBalanceService.getLifeBalance().then((b) => {
      if (!cancelled) { setBalance(b); setLoading(false); }
    });
    const onChange = (e: Event) => {
      const detail = (e as CustomEvent).detail as LifeBalance | undefined;
      if (detail) setBalance(detail);
    };
    window.addEventListener(LIFE_BALANCE_EVENT, onChange);
    return () => { cancelled = true; window.removeEventListener(LIFE_BALANCE_EVENT, onChange); };
  }, [user]);

  return { balance, loading };
}

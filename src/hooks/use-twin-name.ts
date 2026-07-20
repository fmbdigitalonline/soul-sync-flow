/**
 * useTwinName — reactive read of the current user's Twin name (v3.3).
 * Reads the localStorage cache synchronously for an instant first paint,
 * confirms against user_metadata, and re-renders when the name is chosen
 * or changed (via the TWIN_NAME_EVENT).
 */

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { twinNamingService, TWIN_NAME_EVENT, type TwinName } from '@/services/twin-naming-service';

export function useTwinName(): { twinName: TwinName | null; loading: boolean } {
  const { user } = useAuth();
  const [twinName, setTwinName] = useState<TwinName | null>(() =>
    user ? twinNamingService.readCached(user.id) : null,
  );
  const [loading, setLoading] = useState(!twinName);

  useEffect(() => {
    let cancelled = false;
    if (!user) {
      setTwinName(null);
      setLoading(false);
      return;
    }
    setTwinName(twinNamingService.readCached(user.id));
    twinNamingService.getTwinName().then((n) => {
      if (!cancelled) {
        setTwinName(n);
        setLoading(false);
      }
    });
    const onChange = (e: Event) => {
      const detail = (e as CustomEvent).detail as TwinName | undefined;
      if (detail) setTwinName(detail);
    };
    window.addEventListener(TWIN_NAME_EVENT, onChange);
    return () => {
      cancelled = true;
      window.removeEventListener(TWIN_NAME_EVENT, onChange);
    };
  }, [user]);

  return { twinName, loading };
}

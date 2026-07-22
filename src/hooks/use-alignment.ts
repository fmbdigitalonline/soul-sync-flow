/**
 * useAlignment — reactive read of the user's alignment reflections (v3.6),
 * with the trend interpreted for a chosen window. Cache-first, re-renders
 * when a new reflection is recorded.
 */

import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { alignmentService, ALIGNMENT_EVENT, type AlignmentReflection } from '@/services/alignment-service';

export function useAlignment(windowDays = 90) {
  const { user } = useAuth();
  const [reflections, setReflections] = useState<AlignmentReflection[]>(() =>
    user ? alignmentService.readCached(user.id) ?? [] : [],
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    if (!user) { setReflections([]); setLoading(false); return; }
    setReflections(alignmentService.readCached(user.id) ?? []);
    alignmentService.getReflections().then((r) => { if (!cancelled) { setReflections(r); setLoading(false); } });
    const onChange = (e: Event) => {
      const detail = (e as CustomEvent).detail as AlignmentReflection[] | undefined;
      if (detail) setReflections(detail);
    };
    window.addEventListener(ALIGNMENT_EVENT, onChange);
    return () => { cancelled = true; window.removeEventListener(ALIGNMENT_EVENT, onChange); };
  }, [user]);

  const trend = useMemo(() => alignmentService.computeTrend(reflections, windowDays), [reflections, windowDays]);
  return { reflections, trend, loading, windowDays };
}

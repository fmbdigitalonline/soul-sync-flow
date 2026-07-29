/**
 * useTwinVoice — the one hook any surface uses to ask "how does this person's
 * Twin speak?" (Constitution v3.10).
 *
 * Cache-first so a screen never blocks on it. The profile is composed, not
 * generated: no model call, no latency, deterministic for a given blueprint.
 */

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useOptimizedBlueprintData } from '@/hooks/use-optimized-blueprint-data';
import { twinVoiceService, TWIN_VOICE_EVENT, type TwinVoiceProfile } from '@/services/twin-voice-service';

export function useTwinVoice(): { voice: TwinVoiceProfile | null; loading: boolean } {
  const { user } = useAuth();
  const { blueprintData } = useOptimizedBlueprintData();
  const [voice, setVoice] = useState<TwinVoiceProfile | null>(() =>
    user ? twinVoiceService.readCached(user.id) : null,
  );
  const [loading, setLoading] = useState(!voice);

  useEffect(() => {
    let cancelled = false;
    if (!user) { setVoice(null); setLoading(false); return; }

    setVoice(twinVoiceService.readCached(user.id));
    twinVoiceService
      .getVoiceProfile(user.id, (blueprintData as any) ?? null)
      .then((p) => { if (!cancelled) { setVoice(p); setLoading(false); } })
      .catch(() => { if (!cancelled) setLoading(false); });

    const onChange = (e: Event) => {
      const detail = (e as CustomEvent).detail as TwinVoiceProfile | undefined;
      if (detail) setVoice(detail);
    };
    window.addEventListener(TWIN_VOICE_EVENT, onChange);
    return () => { cancelled = true; window.removeEventListener(TWIN_VOICE_EVENT, onChange); };
  }, [user, blueprintData]);

  return { voice, loading };
}

export default useTwinVoice;

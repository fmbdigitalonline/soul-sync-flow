/**
 * alignment-service — the Alignment narrative (Constitution v3.6).
 *
 * ALIGNMENT IS INTERPRETED, NEVER SCORED. No percentage, no gauge, no
 * battery. A direction and a story: "are you living closer to your
 * Blueprint than before?" The signal is the RELATIONSHIP's — chiefly the
 * user's own periodic self-reports ("more like me / about the same / less
 * like me"), the honest way (their input, like the life-wheel). The trend
 * line shows shape and direction only; it never carries an axis number.
 *
 * Reflections are stored in auth user_metadata (app-writable, no
 * migration), capped, mirrored to a per-user localStorage cache.
 */

import { supabase } from '@/integrations/supabase/client';

export type AlignmentValue = 'more' | 'same' | 'less';
export interface AlignmentReflection { at: string; v: 1 | 0 | -1 }
export type Direction = 'rising' | 'steady' | 'dipping';

export interface AlignmentTrend {
  hasData: boolean;
  /** Normalised points for the line — x and y in 0..1, no axis numbers. */
  points: Array<{ x: number; y: number }>;
  direction: Direction;
  from?: string;
  to?: string;
  count: number;
}

const MAP: Record<AlignmentValue, 1 | 0 | -1> = { more: 1, same: 0, less: -1 };
const CACHE_KEY = (userId: string) => `alignment-reflections:v1:${userId}`;
export const ALIGNMENT_EVENT = 'alignment-changed';
const CAP = 80;
const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

function sanitize(raw: any): AlignmentReflection[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((r) => r && typeof r.at === 'string' && (r.v === 1 || r.v === 0 || r.v === -1))
    .slice(-CAP);
}

export const alignmentService = {
  readCached(userId: string): AlignmentReflection[] | null {
    if (typeof window === 'undefined') return null;
    try {
      const raw = window.localStorage.getItem(CACHE_KEY(userId));
      return raw ? sanitize(JSON.parse(raw)) : null;
    } catch {
      return null;
    }
  },

  async getReflections(): Promise<AlignmentReflection[]> {
    const { data: auth } = await supabase.auth.getUser();
    const user = auth?.user;
    if (!user) return [];
    const cached = this.readCached(user.id);
    if (cached && cached.length) return cached;
    const stored = sanitize((user.user_metadata as any)?.alignment_reflections);
    if (stored.length) {
      try { window.localStorage.setItem(CACHE_KEY(user.id), JSON.stringify(stored)); } catch { /* ignore */ }
    }
    return stored;
  },

  async recordReflection(value: AlignmentValue): Promise<AlignmentReflection[]> {
    const { data: auth } = await supabase.auth.getUser();
    const user = auth?.user;
    if (!user) return [];
    const current = await this.getReflections();
    const next = sanitize([...current, { at: new Date().toISOString(), v: MAP[value] }]);
    try {
      await supabase.auth.updateUser({ data: { alignment_reflections: next } });
    } catch (e) {
      console.warn('Alignment reflection persist failed (cache still set):', e);
    }
    try { window.localStorage.setItem(CACHE_KEY(user.id), JSON.stringify(next)); } catch { /* ignore */ }
    if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent(ALIGNMENT_EVENT, { detail: next }));
    return next;
  },

  /** Interpret the reflections into a trend — shape and direction, no score. */
  computeTrend(reflections: AlignmentReflection[], windowDays = 90): AlignmentTrend {
    const now = Date.now();
    const since = now - windowDays * 86_400_000;
    const recent = reflections
      .map((r) => ({ t: new Date(r.at).getTime(), v: r.v }))
      .filter((r) => Number.isFinite(r.t) && r.t >= since)
      .sort((a, b) => a.t - b.t);

    if (recent.length < 2) {
      return { hasData: false, points: [], direction: 'steady', count: recent.length };
    }

    // A running, smoothed shape (0..1). Deliberately unlabelled — it exists
    // to draw a line, not to be read as a number.
    let s = 0.5;
    const raw = recent.map((r) => {
      s = clamp(s + r.v * 0.09, 0.08, 0.95);
      return { t: r.t, y: s };
    });
    const t0 = raw[0].t, t1 = raw[raw.length - 1].t || t0 + 1;
    const points = raw.map((p) => ({ x: (p.t - t0) / Math.max(1, t1 - t0), y: p.y }));

    const third = Math.max(1, Math.ceil(points.length / 3));
    const avg = (arr: { y: number }[]) => arr.reduce((a, b) => a + b.y, 0) / arr.length;
    const delta = avg(points.slice(-third)) - avg(points.slice(0, third));
    const direction: Direction = delta > 0.05 ? 'rising' : delta < -0.05 ? 'dipping' : 'steady';

    return {
      hasData: true,
      points,
      direction,
      from: new Date(t0).toISOString(),
      to: new Date(t1).toISOString(),
      count: recent.length,
    };
  },

  /** The interpreted line — a sentence, never a number. */
  narrative(trend: AlignmentTrend, windowDays: number, lang: 'en' | 'nl'): string {
    const d = Math.round(windowDays);
    if (!trend.hasData) {
      return lang === 'nl'
        ? 'Naarmate je terugkijkt op hoe afgestemd je je voelt, tekent zich hier een richting af — geen cijfer, maar een verhaal.'
        : 'As you reflect on how aligned you feel, a direction takes shape here — not a number, a story.';
    }
    if (lang === 'nl') {
      if (trend.direction === 'rising') return `De afgelopen ${d} dagen suggereren je reflecties dat je dichter bij leven in lijn met je Blauwdruk komt.`;
      if (trend.direction === 'dipping') return `De afgelopen ${d} dagen voelden sommige delen van je leven minder als jezelf — het waard om samen naar te kijken.`;
      return `De afgelopen ${d} dagen houd je gestaag koers met je Blauwdruk.`;
    }
    if (trend.direction === 'rising') return `Over the past ${d} days, your reflections suggest you're moving closer to living in alignment with your Blueprint.`;
    if (trend.direction === 'dipping') return `Over the past ${d} days, some parts of life have felt less like you — worth looking at together.`;
    return `Over the past ${d} days, you're holding steady with your Blueprint.`;
  },
};

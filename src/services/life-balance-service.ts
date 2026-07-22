/**
 * life-balance-service — the domain-balance signal (Constitution v3.4).
 *
 * The My Journey life-wheel needs a real per-domain score. Rather than
 * fabricate one (perspective, not inventory), it is the USER's own read of
 * their life: a lightweight wheel-of-life check-in where they rate how
 * balanced each domain feels (0–100). That's honest — it's their input, the
 * same way a reflection is — and it's what the radar draws.
 *
 * Stored in auth user_metadata (app-writable, no migration) mirrored to a
 * per-user localStorage cache for instant reads, like the Twin name.
 */

import { supabase } from '@/integrations/supabase/client';

export const LIFE_DOMAINS = ['mind', 'body', 'heart', 'relationships', 'purpose'] as const;
export type LifeDomain = (typeof LIFE_DOMAINS)[number];
export type LifeBalance = Partial<Record<LifeDomain, number>>;

/** Pentagon order for the wheel (matches the study: top, then clockwise). */
export const WHEEL_ORDER: LifeDomain[] = ['mind', 'heart', 'purpose', 'relationships', 'body'];

export const DOMAIN_LABELS: Record<'en' | 'nl', Record<LifeDomain, string>> = {
  en: { mind: 'Mind', body: 'Body', heart: 'Heart', relationships: 'Relationships', purpose: 'Purpose' },
  nl: { mind: 'Geest', body: 'Lichaam', heart: 'Hart', relationships: 'Relaties', purpose: 'Zingeving' },
};

const CACHE_KEY = (userId: string) => `life-balance:v1:${userId}`;
export const LIFE_BALANCE_EVENT = 'life-balance-changed';

function clampScore(n: unknown): number | undefined {
  const v = typeof n === 'number' ? n : Number(n);
  if (!Number.isFinite(v)) return undefined;
  return Math.max(0, Math.min(100, Math.round(v)));
}

function sanitize(raw: any): LifeBalance {
  const out: LifeBalance = {};
  if (raw && typeof raw === 'object') {
    for (const d of LIFE_DOMAINS) {
      const c = clampScore(raw[d]);
      if (c !== undefined) out[d] = c;
    }
  }
  return out;
}

export const lifeBalanceService = {
  readCached(userId: string): LifeBalance | null {
    if (typeof window === 'undefined') return null;
    try {
      const raw = window.localStorage.getItem(CACHE_KEY(userId));
      return raw ? sanitize(JSON.parse(raw)) : null;
    } catch {
      return null;
    }
  },

  async getLifeBalance(): Promise<LifeBalance | null> {
    const { data: auth } = await supabase.auth.getUser();
    const user = auth?.user;
    if (!user) return null;
    const cached = this.readCached(user.id);
    if (cached && Object.keys(cached).length) return cached;
    const meta = user.user_metadata as any;
    const stored = sanitize(meta?.life_balance);
    if (Object.keys(stored).length) {
      try { window.localStorage.setItem(CACHE_KEY(user.id), JSON.stringify(stored)); } catch { /* ignore */ }
      return stored;
    }
    return null;
  },

  /** Merge-write the user's ratings. */
  async setLifeBalance(patch: LifeBalance): Promise<LifeBalance | null> {
    const { data: auth } = await supabase.auth.getUser();
    const user = auth?.user;
    if (!user) return null;
    const current = (await this.getLifeBalance()) ?? {};
    const next = sanitize({ ...current, ...patch });
    try {
      await supabase.auth.updateUser({
        data: { life_balance: next, life_balance_updated_at: new Date().toISOString() },
      });
    } catch (e) {
      console.warn('Life balance persist failed (cache still set):', e);
    }
    try { window.localStorage.setItem(CACHE_KEY(user.id), JSON.stringify(next)); } catch { /* ignore */ }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(LIFE_BALANCE_EVENT, { detail: next }));
    }
    return next;
  },
};

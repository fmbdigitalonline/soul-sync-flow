/**
 * life-balance-analysis-service — the all-seeing read (Constitution v3.7).
 *
 * The Life Domains wheel no longer waits on the user to move sliders. The
 * system reads where the person is across the five domains from the evidence
 * it already holds — the insight ledger, active programs/goals, conversation
 * themes and the blueprint — and draws the wheel itself.
 *
 * INTERPRETED, NEVER FABRICATED. Every read is grounded in the user's own
 * evidence: no evidence, no number. Thin domains rest near the middle rather
 * than guessing. The read is transparent (each domain carries a WHY) and it
 * is the Twin's read of your journey, not a verdict — the user can still
 * adjust, and their own read overrides the system's.
 *
 * The read is produced by the deployed generic analyst endpoint
 * (ai-analyst-call) over a digest of real signals, stored in auth
 * user_metadata (app-writable, no migration) and mirrored to a per-user
 * localStorage cache, like the Twin name and the manual ratings.
 */

import { supabase } from '@/integrations/supabase/client';
import { myJourneyService } from '@/services/my-journey-service';
import { LIFE_DOMAINS, type LifeBalance, type LifeDomain } from '@/services/life-balance-service';

export type DomainRationale = Partial<Record<LifeDomain, string>>;

export interface LifeBalanceRead {
  scores: LifeBalance;
  rationale: DomainRationale;
  at: string; // ISO
  lang: 'en' | 'nl';
}

export const LIFE_BALANCE_READ_EVENT = 'life-balance-read-changed';
const CACHE_KEY = (userId: string) => `life-balance-read:v1:${userId}`;
/** How long a read stays fresh before we offer to read again. */
const STALE_MS = 24 * 60 * 60 * 1000;
/** Below this many independent signals the journey is too thin to read. */
const MIN_SIGNALS = 3;

function clampScore(n: unknown): number | undefined {
  const v = typeof n === 'number' ? n : Number(n);
  if (!Number.isFinite(v)) return undefined;
  return Math.max(0, Math.min(100, Math.round(v)));
}

function sanitizeRead(raw: any): LifeBalanceRead | null {
  if (!raw || typeof raw !== 'object') return null;
  const scores: LifeBalance = {};
  const rationale: DomainRationale = {};
  for (const d of LIFE_DOMAINS) {
    const c = clampScore(raw.scores?.[d]);
    if (c !== undefined) scores[d] = c;
    const why = raw.rationale?.[d];
    if (typeof why === 'string' && why.trim()) rationale[d] = why.trim().slice(0, 120);
  }
  if (Object.keys(scores).length < LIFE_DOMAINS.length) return null;
  const at = typeof raw.at === 'string' ? raw.at : new Date().toISOString();
  const lang = raw.lang === 'nl' ? 'nl' : 'en';
  return { scores, rationale, at, lang };
}

/** Best-effort extraction of the first JSON object in a model reply. */
function parseJsonObject(text: string): any | null {
  if (!text) return null;
  const cleaned = text.replace(/```(?:json)?/gi, '').trim();
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) return null;
  try {
    return JSON.parse(cleaned.slice(start, end + 1));
  } catch {
    return null;
  }
}

export const lifeBalanceAnalysisService = {
  readCached(userId: string): LifeBalanceRead | null {
    if (typeof window === 'undefined') return null;
    try {
      const raw = window.localStorage.getItem(CACHE_KEY(userId));
      return raw ? sanitizeRead(JSON.parse(raw)) : null;
    } catch {
      return null;
    }
  },

  async getStoredRead(): Promise<LifeBalanceRead | null> {
    const { data: auth } = await supabase.auth.getUser();
    const user = auth?.user;
    if (!user) return null;
    const cached = this.readCached(user.id);
    if (cached) return cached;
    const meta = user.user_metadata as any;
    const read = sanitizeRead(meta?.life_balance_read);
    if (read) {
      try { window.localStorage.setItem(CACHE_KEY(user.id), JSON.stringify(read)); } catch { /* ignore */ }
    }
    return read;
  },

  isStale(read: LifeBalanceRead | null): boolean {
    if (!read) return true;
    return Date.now() - new Date(read.at).getTime() > STALE_MS;
  },

  /**
   * Read the domains from real evidence. Returns null (honestly) when the
   * journey is still too thin to read, or when the analysis can't be trusted
   * to parse. Never invents a shape.
   */
  async analyze(userId: string, lang: 'en' | 'nl' = 'en'): Promise<LifeBalanceRead | null> {
    const j = await myJourneyService.getMyJourney(userId, lang).catch(() => null);
    if (!j) return null;

    const patterns = j.patterns.map((p) => p.text).filter(Boolean);
    const programs = j.programs.map((p) => (p.domain ? `${p.title} (${p.domain})` : p.title)).filter(Boolean);
    const themes = j.turningPoints.map((e) => e.title).filter(Boolean);
    const focusDomains = j.domains.filter(Boolean);

    const signalCount = patterns.length + programs.length + themes.length + focusDomains.length;
    if (signalCount < MIN_SIGNALS) return null; // too thin — stay honest

    const langName = lang === 'nl' ? 'Dutch' : 'English';
    const evidence = [
      patterns.length ? `Patterns noticed in their journey:\n- ${patterns.join('\n- ')}` : '',
      programs.length ? `Active work (programs & goals):\n- ${programs.join('\n- ')}` : '',
      focusDomains.length ? `Focus domains: ${focusDomains.join(', ')}` : '',
      themes.length ? `Recent conversation themes:\n- ${themes.join('\n- ')}` : '',
      j.essence ? `Blueprint essence: ${j.essence}` : '',
    ].filter(Boolean).join('\n\n');

    const prompt = [
      'You are reading where a person is across five life domains, from real signals in their SoulSync journey.',
      'Domains: mind, heart, purpose, relationships, body.',
      '',
      'Rules:',
      '- Base every read ONLY on the evidence below. Do not invent facts about them.',
      '- Give each domain a 0-100 read of presence and vitality as reflected in the evidence: 0 = depleted / barely present, 100 = thriving / richly present. This is an interpretation, not a clinical score.',
      '- If the evidence says little about a domain, keep it near the middle (45-55) rather than guessing a flattering high or a dramatic low.',
      `- For each domain give a short "why", max 12 words, grounded in the evidence, written in ${langName}.`,
      '',
      'Reply with ONLY strict JSON, no prose, in this exact shape:',
      '{"mind":{"score":50,"why":"..."},"heart":{"score":50,"why":"..."},"purpose":{"score":50,"why":"..."},"relationships":{"score":50,"why":"..."},"body":{"score":50,"why":"..."}}',
      '',
      'EVIDENCE:',
      evidence,
    ].join('\n');

    let content = '';
    try {
      const { data, error } = await (supabase as any).functions.invoke('ai-analyst-call', {
        body: { prompt, max_tokens: 380, analyst_type: 'life_balance_read' },
      });
      if (error) return null;
      content = data?.content ?? data?.result ?? '';
    } catch {
      return null;
    }

    const obj = parseJsonObject(content);
    if (!obj) return null;

    const scores: LifeBalance = {};
    const rationale: DomainRationale = {};
    for (const d of LIFE_DOMAINS) {
      const c = clampScore(obj[d]?.score);
      if (c === undefined) return null; // incomplete read — don't store a partial shape
      scores[d] = c;
      const why = obj[d]?.why;
      if (typeof why === 'string' && why.trim()) rationale[d] = why.trim().slice(0, 120);
    }

    const read: LifeBalanceRead = { scores, rationale, at: new Date().toISOString(), lang };
    await this.store(userId, read);
    return read;
  },

  async store(userId: string, read: LifeBalanceRead): Promise<void> {
    try {
      await supabase.auth.updateUser({ data: { life_balance_read: read } });
    } catch (e) {
      console.warn('Life-balance read persist failed (cache still set):', e);
    }
    try { window.localStorage.setItem(CACHE_KEY(userId), JSON.stringify(read)); } catch { /* ignore */ }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(LIFE_BALANCE_READ_EVENT, { detail: read }));
    }
  },
};

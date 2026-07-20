/**
 * twin-naming-service — The Naming (Constitution v3.3).
 *
 * The Twin's name is not assigned by us; it is chosen at the birth of the
 * relationship, immediately after the Twin's first message. Three names
 * are LLM-synthesised from the WHOLE blueprint (non-deterministic, distinct
 * archetypes), each with a one-line reason. The chosen name is stored with
 * its story so "Why you're called Lumen" survives.
 *
 * Generation runs through the already-deployed generic `ai-analyst-call`
 * completion endpoint — no new edge function, no Lovable deploy. The choice
 * persists in auth user_metadata (app-writable, no migration) mirrored to a
 * per-user localStorage cache for instant synchronous reads.
 */

import { supabase } from '@/integrations/supabase/client';
import { blueprintService } from '@/services/blueprint-service';

export type TwinNameOrigin = 'blueprint' | 'user';

export interface TwinNameSuggestion {
  name: string;
  reason: string;
}

export interface TwinName {
  name: string;
  origin: TwinNameOrigin;
  reason?: string;
  chosenBy: 'user';
  namedAt: string;
}

type Lang = 'en' | 'nl';

const CACHE_KEY = (userId: string) => `twin-name:v1:${userId}`;
export const TWIN_NAME_EVENT = 'twin-name-changed';

// Distinct-archetype fallbacks if generation fails — the ceremony must
// never dead-end on a network error. Still three, still meaningful.
const FALLBACK: Record<Lang, TwinNameSuggestion[]> = {
  en: [
    { name: 'Lumen', reason: 'For the light you bring to complex ideas.' },
    { name: 'Aster', reason: 'For quiet guidance and a wider perspective.' },
    { name: 'Reson', reason: 'For helping your own truth resonate more clearly.' },
  ],
  nl: [
    { name: 'Lumen', reason: 'Voor het licht dat je op complexe ideeën werpt.' },
    { name: 'Aster', reason: 'Voor rustige begeleiding en een breder perspectief.' },
    { name: 'Reson', reason: 'Om jouw eigen waarheid helderder te laten resoneren.' },
  ],
};

function compactBlueprint(bp: any): string {
  if (!bp) return '';
  const pick = (o: any, keys: string[]) => {
    for (const k of keys) {
      const v = o?.[k];
      if (typeof v === 'string' && v.trim()) return v.trim();
    }
    return undefined;
  };
  const parts: string[] = [];
  const mbti = pick(bp.cognition_mbti, ['type', 'mbti_type', 'likelyType']);
  if (mbti && mbti !== 'Unknown') parts.push(`MBTI ${mbti}`);
  const sun = pick(bp.archetype_western, ['sun_sign', 'sunSign', 'sun']);
  if (sun) parts.push(`Sun ${sun}`);
  const moon = pick(bp.archetype_western, ['moon_sign', 'moonSign', 'moon']);
  if (moon) parts.push(`Moon ${moon}`);
  const hd = pick(bp.energy_strategy_human_design, ['type', 'design_type', 'energyType']);
  if (hd) parts.push(`Human Design ${hd}`);
  const lifePath = bp.values_life_path?.life_path_number ?? bp.values_life_path?.lifePathNumber;
  if (lifePath) parts.push(`Life Path ${lifePath}`);
  const expression = bp.values_life_path?.expression_number ?? bp.values_life_path?.expressionNumber;
  if (expression) parts.push(`Expression ${expression}`);
  const chinese = pick(bp.archetype_chinese, ['animal', 'sign']);
  if (chinese) parts.push(`Chinese Zodiac ${chinese}`);
  return parts.join(', ');
}

function buildPrompt(summary: string, lang: Lang): string {
  const langName = lang === 'nl' ? 'Dutch' : 'English';
  return [
    'You are naming an AI companion (a personal "Twin") for a self-development app.',
    'Invent THREE short, evocative, pronounceable first names — invented or rare, not common human names, not brand names.',
    'Synthesise the WHOLE person below; do NOT map any single trait to a name mechanically.',
    'Give each name a DISTINCT character: one leaning toward reflection/awareness, one toward wisdom/guidance, one toward creativity/expression.',
    `Each reason is ONE short sentence in ${langName}, evocative not analytical, and must NOT name the system (never say "numerology", "Life Path", "MBTI", "Human Design" — speak to the quality, not the source).`,
    '',
    `The person's blueprint themes: ${summary || 'a thoughtful, creative, independent person seeking meaningful growth'}.`,
    '',
    'Respond with ONLY a JSON array, no prose, exactly:',
    '[{"name":"...","reason":"..."},{"name":"...","reason":"..."},{"name":"...","reason":"..."}]',
  ].join('\n');
}

function parseNames(content: string): TwinNameSuggestion[] | null {
  try {
    const match = content.match(/\[[\s\S]*\]/);
    if (!match) return null;
    const arr = JSON.parse(match[0]);
    if (!Array.isArray(arr)) return null;
    const cleaned = arr
      .filter((x) => x && typeof x.name === 'string' && x.name.trim())
      .slice(0, 3)
      .map((x) => ({
        name: String(x.name).trim().slice(0, 24),
        reason: typeof x.reason === 'string' ? x.reason.trim().slice(0, 160) : '',
      }));
    return cleaned.length === 3 ? cleaned : null;
  } catch {
    return null;
  }
}

export const twinNamingService = {
  /** Synchronous cached name read — the instant path for headers/greetings. */
  readCached(userId: string): TwinName | null {
    if (typeof window === 'undefined') return null;
    try {
      const raw = window.localStorage.getItem(CACHE_KEY(userId));
      return raw ? (JSON.parse(raw) as TwinName) : null;
    } catch {
      return null;
    }
  },

  /** Current user's Twin name: cache first, then authoritative user_metadata. */
  async getTwinName(): Promise<TwinName | null> {
    const { data: auth } = await supabase.auth.getUser();
    const user = auth?.user;
    if (!user) return null;
    const cached = this.readCached(user.id);
    if (cached) return cached;
    const meta = user.user_metadata as any;
    if (meta?.twin_name) {
      const stored: TwinName = {
        name: String(meta.twin_name),
        origin: meta.twin_name_origin === 'user' ? 'user' : 'blueprint',
        reason: meta.twin_name_reason,
        chosenBy: 'user',
        namedAt: meta.twin_named_at || new Date().toISOString(),
      };
      try {
        window.localStorage.setItem(CACHE_KEY(user.id), JSON.stringify(stored));
      } catch {
        /* ignore */
      }
      return stored;
    }
    return null;
  },

  /** Generate exactly three blueprint-informed suggestions (never empty). */
  async generateNames(lang: Lang): Promise<TwinNameSuggestion[]> {
    try {
      const bp = await blueprintService.getActiveBlueprintData();
      const summary = compactBlueprint(bp?.data);
      const { data, error } = await supabase.functions.invoke('ai-analyst-call', {
        body: { prompt: buildPrompt(summary, lang), max_tokens: 400, analyst_type: 'twin_naming' },
      });
      if (error) throw error;
      const content: string = data?.content ?? data?.result ?? '';
      return parseNames(content) ?? FALLBACK[lang];
    } catch (e) {
      console.warn('Twin name generation fell back (non-blocking):', e);
      return FALLBACK[lang];
    }
  },

  /** Persist the chosen name with its story. */
  async setTwinName(input: { name: string; origin: TwinNameOrigin; reason?: string }): Promise<TwinName | null> {
    const name = input.name.trim().slice(0, 24);
    if (!name) return null;
    const record: TwinName = {
      name,
      origin: input.origin,
      reason: input.reason,
      chosenBy: 'user',
      namedAt: new Date().toISOString(),
    };
    try {
      await supabase.auth.updateUser({
        data: {
          twin_name: record.name,
          twin_name_origin: record.origin,
          twin_name_reason: record.reason ?? null,
          twin_named_at: record.namedAt,
        },
      });
    } catch (e) {
      console.warn('Twin name persist to user_metadata failed (cache still set):', e);
    }
    try {
      const { data: auth } = await supabase.auth.getUser();
      if (auth?.user) window.localStorage.setItem(CACHE_KEY(auth.user.id), JSON.stringify(record));
    } catch {
      /* ignore */
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(TWIN_NAME_EVENT, { detail: record }));
    }
    return record;
  },
};

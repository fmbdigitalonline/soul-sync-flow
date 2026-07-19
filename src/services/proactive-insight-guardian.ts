/**
 * proactive-insight-guardian — the guardian of attention
 * (Constitution v3.0, Proactive Intelligence Layer).
 *
 * Sits above the built pipeline (ConversationShadowDetector →
 * SmartInsightController) and decides whether ANYTHING deserves the
 * user's attention right now. Five checks per candidate — new? useful
 * now? enough evidence? appropriate moment? worth more than what the
 * user is doing? Most candidates must fail; NO ACTION is the default.
 *
 * The ledger (conversation_insights + status/pattern_key/delivered_at)
 * prevents eternal resurfacing. User controls (proactivity + directness)
 * govern thresholds and phrasing. Detection is not diagnosis: every
 * observation ships as a hypothesis in the chosen directness register.
 */

import { supabase } from '@/integrations/supabase/client';
import { SmartInsightController } from '@/services/smart-insight-controller';

export type ProactivityLevel = 'only_ask' | 'important' | 'observant';
export type DirectnessLevel = 'gentle' | 'clear' | 'direct';

export interface ProactivePrefs {
  proactivity: ProactivityLevel;
  directness: DirectnessLevel;
}

export interface ProactiveMomentCandidate {
  /** Ledger dedupe key. */
  patternKey: string;
  /** Hypothesis-phrased observation in the user's chosen register. */
  observation: string;
  /** The raw pattern core — seeds "Help me change this pattern". */
  patternCore: string;
  confidence: number;
  frequency: number;
  /** Ledger row id once delivered. */
  ledgerId?: string;
}

const PREFS_KEY = 'proactive-prefs:v1';

const DEFAULT_PREFS: ProactivePrefs = { proactivity: 'important', directness: 'gentle' };

export function getProactivePrefs(): ProactivePrefs {
  if (typeof window === 'undefined') return DEFAULT_PREFS;
  try {
    const raw = window.localStorage.getItem(PREFS_KEY);
    return raw ? { ...DEFAULT_PREFS, ...JSON.parse(raw) } : DEFAULT_PREFS;
  } catch {
    return DEFAULT_PREFS;
  }
}

export function setProactivePrefs(patch: Partial<ProactivePrefs>): ProactivePrefs {
  const next = { ...getProactivePrefs(), ...patch };
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(PREFS_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  }
  return next;
}

// Check 4 heuristic: never interrupt a vulnerable disclosure. Bilingual,
// deliberately broad — a false positive only means staying quiet, which
// is the correct failure mode.
const VULNERABLE_RE =
  /\b(suicid|zelfmoord|hopeless|hopeloos|paniek|panic|crisis|grief|rouw|overleden|died|dood|misbruik|abuse|trauma|huilen|crying|wanhopig|desperate)\b/i;

// Cooldowns by proactivity level (minutes between delivered moments).
const COOLDOWN_MIN: Record<ProactivityLevel, number> = {
  only_ask: Infinity,
  important: 120,
  observant: 30,
};

// Evidence thresholds by proactivity level.
const THRESHOLDS: Record<ProactivityLevel, { confidence: number; frequency: number }> = {
  only_ask: { confidence: 1.1, frequency: 999 }, // unreachable
  important: { confidence: 0.8, frequency: 3 },
  observant: { confidence: 0.6, frequency: 2 },
};

function phrase(observationCore: string, directness: DirectnessLevel, frequency: number): string {
  switch (directness) {
    case 'gentle':
      return `I may be noticing a pattern — ${observationCore} Does that feel accurate to you?`;
    case 'clear':
      return `Something has come up ${frequency >= 3 ? 'several times' : 'more than once'} in our conversations: ${observationCore}`;
    case 'direct':
      return `${observationCore} This has appeared ${frequency} times — it may be worth looking at directly.`;
  }
}

export const proactiveInsightGuardian = {
  getProactivePrefs,
  setProactivePrefs,

  /**
   * The five checks. Returns at most ONE candidate, or null (the default).
   */
  async getProactiveMoment(ctx: {
    messageCount: number;
    lastUserMessage?: string;
  }): Promise<ProactiveMomentCandidate | null> {
    try {
      const prefs = getProactivePrefs();
      if (prefs.proactivity === 'only_ask') return null;

      // ── Check 4: is the moment appropriate? ──
      if (ctx.messageCount < 6) return null; // onboarding / thin context
      if (ctx.lastUserMessage && VULNERABLE_RE.test(ctx.lastUserMessage)) return null;

      const { data: auth } = await supabase.auth.getUser();
      const user = auth?.user;
      if (!user) return null;

      // Cooldown + dismissal fatigue from the ledger.
      const since7d = new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString();
      // Cast: the generated types predate the ledger migration
      // (status/pattern_key/delivered_at added in 20260719120000).
      const { data: recent } = await supabase
        .from('conversation_insights')
        .select('id, status, delivered_at, pattern_key' as any)
        .eq('user_id', user.id)
        .gte('created_at', since7d)
        .not('delivered_at', 'is', null);
      const rows: any[] = (recent as any[]) ?? [];

      const lastDelivered = rows
        .map((r) => (r.delivered_at ? new Date(r.delivered_at).getTime() : 0))
        .sort((a, b) => b - a)[0];
      if (lastDelivered) {
        const minutesSince = (Date.now() - lastDelivered) / 60000;
        if (minutesSince < COOLDOWN_MIN[prefs.proactivity]) return null;
      }
      const recentDismissals = rows.filter((r) => r.status === 'dismissed').length;
      if (recentDismissals >= 3) return null; // repeated dismissal = stay quiet

      // ── Candidates from the built pipeline ──
      const candidates = await SmartInsightController.generateConversationInsights(user.id);
      if (!candidates || candidates.length === 0) return null;

      const { confidence: minConf, frequency: minFreq } = THRESHOLDS[prefs.proactivity];
      const deliveredKeys = new Set(rows.map((r) => r.pattern_key).filter(Boolean));

      for (const c of candidates) {
        const freq = c.shadowPattern?.frequency ?? 1;
        const patternKey = `${c.type}:${c.shadowPattern?.type ?? 'unknown'}`;
        // Check 3: enough evidence?
        if ((c.confidence ?? 0) < minConf || freq < minFreq) continue;
        // Check 1: is it new? (30-day ledger dedupe)
        if (deliveredKeys.has(patternKey)) continue;
        // Check 2: useful now? — there must be a real next step; the
        // pipeline's candidates carry actionable advice, so a candidate
        // without pattern core text fails.
        const core = (c.shadowPattern?.pattern || c.message || '').trim();
        if (!core) continue;

        // Check 5 is structural: we return at most one, and the caller
        // renders it as one quiet moment — never over the user's work.
        const coreSentence = core.endsWith('.') || core.endsWith('?') ? core : `${core}.`;
        return {
          patternKey,
          observation: phrase(coreSentence, prefs.directness, freq),
          patternCore: coreSentence,
          confidence: c.confidence ?? 0,
          frequency: freq,
        };
      }
      return null;
    } catch (e) {
      console.warn('Guardian check failed (staying quiet — correct failure mode):', e);
      return null;
    }
  },

  /** Ledger write on delivery. */
  async recordDelivery(cand: ProactiveMomentCandidate): Promise<string | null> {
    try {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth?.user) return null;
      const { data, error } = await supabase
        .from('conversation_insights')
        .insert({
          user_id: auth.user.id,
          session_id: 'proactive_moment',
          insight_type: 'proactive_pattern',
          insight_data: {
            observation: cand.observation,
            pattern_core: cand.patternCore,
            confidence: cand.confidence,
            frequency: cand.frequency,
          },
          status: 'delivered',
          pattern_key: cand.patternKey,
          delivered_at: new Date().toISOString(),
        } as any)
        .select('id')
        .single();
      if (error) {
        console.warn('Ledger delivery write failed (non-blocking):', error.message);
        return null;
      }
      return data?.id ?? null;
    } catch {
      return null;
    }
  },

  /** Ledger outcome update. */
  async recordOutcome(ledgerId: string | null | undefined, status: 'accepted' | 'dismissed' | 'acted_on'): Promise<void> {
    if (!ledgerId) return;
    try {
      await supabase
        .from('conversation_insights')
        .update({ status, ...(status === 'dismissed' ? { dismissed_at: new Date().toISOString() } : {}) } as any)
        .eq('id', ledgerId);
    } catch {
      /* non-blocking */
    }
  },
};

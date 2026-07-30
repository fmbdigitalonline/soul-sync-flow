/**
 * turning-point-service — the Twin proposes, you confirm.
 *
 * A turning point is a claim about someone's life. The system is not allowed
 * to make that claim on its own: an episode being long, or recent, or dense is
 * evidence that something MIGHT have happened, never proof that it did. So the
 * Twin only ever asks — "this felt like a turning point, keep it?" — and the
 * timeline shows exactly what the person answered yes to. Nothing else.
 *
 * What makes an episode worth asking about is measured against the person's
 * own baseline, never an absolute:
 *
 *   recognised   an insight from that episode was accepted or acted on
 *   depth        the episode ran far longer than their own median
 *   return       they came back to it after a long quiet stretch
 *
 * No model call. The rules are structural and inspectable, so a proposal can
 * be wrong about significance (that is what the question is for) but can never
 * be wrong about the facts it cites.
 *
 * Decisions live in auth user_metadata (app-writable, no migration) mirrored
 * to a per-user localStorage cache, like the Twin name and the life-balance
 * read.
 */

import { supabase } from '@/integrations/supabase/client';
import { conversationEpisodeService, type EpisodeSummary } from '@/services/conversation-episode-service';

export type TurningPointReason = 'recognised' | 'acted' | 'depth' | 'return';

export interface TurningPoint {
  sessionId: string;
  /** The title as it read when the person kept it — episodes get re-titled. */
  title: string;
  /** When the episode happened (ISO). */
  at: string;
  /** Why the Twin asked. Kept with the answer so the card stays honest. */
  reason: TurningPointReason;
  /** When the person answered. */
  decidedAt: string;
}

export interface TurningPointCandidate {
  sessionId: string;
  title: string;
  at: string;
  reason: TurningPointReason;
}

interface Decisions {
  kept: TurningPoint[];
  /** Session ids the person said no to — never proposed again. */
  declined: string[];
}

export const TURNING_POINTS_EVENT = 'turning-points-changed';
const CACHE_KEY = (userId: string) => `turning-points:v1:${userId}`;

/** Below this an episode is too short to have been anything, however dense. */
const MIN_DEPTH_MESSAGES = 8;
/** Depth counts when the episode is this many times the person's own median. */
const DEPTH_FACTOR = 2;
/** Silence before an episode that makes returning to it notable. */
const RETURN_GAP_DAYS = 14;
/** How far back we look for episodes worth asking about. */
const EPISODE_WINDOW = 30;

const STRENGTH: Record<TurningPointReason, number> = { acted: 4, recognised: 3, depth: 2, return: 1 };

const EMPTY: Decisions = { kept: [], declined: [] };

function sanitize(raw: any): Decisions {
  if (!raw || typeof raw !== 'object') return EMPTY;
  const kept: TurningPoint[] = Array.isArray(raw.kept)
    ? raw.kept
        .filter((k: any) => k && typeof k.sessionId === 'string' && typeof k.title === 'string' && typeof k.at === 'string')
        .map((k: any) => ({
          sessionId: k.sessionId,
          title: String(k.title).slice(0, 120),
          at: k.at,
          reason: (['recognised', 'acted', 'depth', 'return'] as const).includes(k.reason) ? k.reason : 'depth',
          decidedAt: typeof k.decidedAt === 'string' ? k.decidedAt : k.at,
        }))
    : [];
  const declined: string[] = Array.isArray(raw.declined)
    ? raw.declined.filter((s: any) => typeof s === 'string')
    : [];
  return { kept, declined };
}

function median(values: number[]): number {
  const v = values.filter((n) => Number.isFinite(n) && n > 0).sort((a, b) => a - b);
  if (!v.length) return 0;
  const mid = Math.floor(v.length / 2);
  return v.length % 2 ? v[mid] : (v[mid - 1] + v[mid]) / 2;
}

export const turningPointService = {
  readCached(userId: string): Decisions | null {
    if (typeof window === 'undefined') return null;
    try {
      const raw = window.localStorage.getItem(CACHE_KEY(userId));
      return raw ? sanitize(JSON.parse(raw)) : null;
    } catch {
      return null;
    }
  },

  async getDecisions(): Promise<{ userId: string; decisions: Decisions } | null> {
    const { data: auth } = await supabase.auth.getUser();
    const user = auth?.user;
    if (!user) return null;
    const cached = this.readCached(user.id);
    if (cached) return { userId: user.id, decisions: cached };
    const decisions = sanitize((user.user_metadata as any)?.turning_points);
    try { window.localStorage.setItem(CACHE_KEY(user.id), JSON.stringify(decisions)); } catch { /* ignore */ }
    return { userId: user.id, decisions };
  },

  /**
   * The one episode most worth asking about, or null when nothing in the
   * person's history has earned a question yet. Never returns something
   * already kept or already declined, and never the open episode — a
   * conversation still in progress cannot be looked back on.
   */
  async findCandidate(userId: string, decisions: Decisions): Promise<TurningPointCandidate | null> {
    const episodes = await conversationEpisodeService.listEpisodes(userId, EPISODE_WINDOW).catch(() => []);
    if (!episodes.length) return null;

    const decided = new Set<string>([...decisions.kept.map((k) => k.sessionId), ...decisions.declined]);
    const open = episodes.filter((e) => !e.isCurrent && !decided.has(e.sessionId));
    if (!open.length) return null;

    // Which episodes produced an insight the person recognised or acted on.
    const sessionIds = open.map((e) => e.sessionId);
    let recognised = new Map<string, TurningPointReason>();
    try {
      const { data } = await (supabase as any)
        .from('conversation_insights')
        .select('session_id, status')
        .eq('user_id', userId)
        .in('session_id', sessionIds)
        .in('status', ['accepted', 'acted_on']);
      for (const row of (data as any[]) ?? []) {
        const reason: TurningPointReason = row.status === 'acted_on' ? 'acted' : 'recognised';
        const held = recognised.get(row.session_id);
        if (!held || STRENGTH[reason] > STRENGTH[held]) recognised.set(row.session_id, reason);
      }
    } catch {
      recognised = new Map();
    }

    // Depth is relative to this person's own conversations, not a fixed number.
    const med = median(episodes.map((e) => e.messageCount));

    // Episodes ascending in time, so the gap before each one can be measured.
    const chronological = [...episodes].sort(
      (a, b) => new Date(a.lastActivity).getTime() - new Date(b.lastActivity).getTime(),
    );
    const gapDays = new Map<string, number>();
    chronological.forEach((e, i) => {
      if (i === 0) return;
      const prev = new Date(chronological[i - 1].lastActivity).getTime();
      const here = new Date(e.lastActivity).getTime();
      if (Number.isFinite(prev) && Number.isFinite(here)) gapDays.set(e.sessionId, (here - prev) / 86_400_000);
    });

    const reasonFor = (e: EpisodeSummary): TurningPointReason | null => {
      const r = recognised.get(e.sessionId);
      if (r) return r;
      if (med > 0 && e.messageCount >= MIN_DEPTH_MESSAGES && e.messageCount >= med * DEPTH_FACTOR) return 'depth';
      if ((gapDays.get(e.sessionId) ?? 0) >= RETURN_GAP_DAYS) return 'return';
      return null;
    };

    const candidates = open
      .map((e) => ({ e, reason: reasonFor(e) }))
      .filter((c): c is { e: EpisodeSummary; reason: TurningPointReason } => c.reason !== null)
      .sort((a, b) => {
        const s = STRENGTH[b.reason] - STRENGTH[a.reason];
        if (s !== 0) return s;
        return new Date(b.e.lastActivity).getTime() - new Date(a.e.lastActivity).getTime();
      });

    const top = candidates[0];
    if (!top) return null;
    return {
      sessionId: top.e.sessionId,
      // The enriched title if one was already generated, else the derived one.
      title: conversationEpisodeService.readCachedTitle(top.e.sessionId) || top.e.title,
      at: top.e.lastActivity,
      reason: top.reason,
    };
  },

  async keep(userId: string, decisions: Decisions, c: TurningPointCandidate): Promise<Decisions> {
    const next: Decisions = {
      kept: [
        ...decisions.kept.filter((k) => k.sessionId !== c.sessionId),
        { sessionId: c.sessionId, title: c.title, at: c.at, reason: c.reason, decidedAt: new Date().toISOString() },
      ].sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime()),
      declined: decisions.declined.filter((s) => s !== c.sessionId),
    };
    await this.store(userId, next);
    return next;
  },

  async decline(userId: string, decisions: Decisions, sessionId: string): Promise<Decisions> {
    const next: Decisions = {
      kept: decisions.kept.filter((k) => k.sessionId !== sessionId),
      declined: decisions.declined.includes(sessionId) ? decisions.declined : [...decisions.declined, sessionId],
    };
    await this.store(userId, next);
    return next;
  },

  /** Undo a keep — a turning point is the person's to withdraw as well as give. */
  async forget(userId: string, decisions: Decisions, sessionId: string): Promise<Decisions> {
    const next: Decisions = {
      kept: decisions.kept.filter((k) => k.sessionId !== sessionId),
      declined: decisions.declined,
    };
    await this.store(userId, next);
    return next;
  },

  async store(userId: string, decisions: Decisions): Promise<void> {
    try {
      await supabase.auth.updateUser({ data: { turning_points: decisions } });
    } catch (e) {
      console.warn('Turning-point persist failed (cache still set):', e);
    }
    try { window.localStorage.setItem(CACHE_KEY(userId), JSON.stringify(decisions)); } catch { /* ignore */ }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(TURNING_POINTS_EVENT, { detail: decisions }));
    }
  },
};

export type { Decisions as TurningPointDecisions };

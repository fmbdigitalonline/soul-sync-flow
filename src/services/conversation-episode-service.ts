/**
 * conversation-episode-service — Conversation Episodes (Constitution v3.2).
 *
 * Continuity belongs to the user's enduring relationship with the Twin,
 * not to one eternal visible transcript. Conversations are bounded
 * episodes with distinct session IDs. The boundary is evaluated when
 * the user RETURNS (chat mount) — never by a background timer:
 *
 *   new episode when the local date has changed AND ≥2h have passed
 *   since the last meaningful interaction, OR after ≥8h of absence
 *   regardless of date. Local date uses the device timezone (the
 *   application's current timezone authority).
 *
 * Legacy compatibility: existing messages are not rewritten. The old
 * eternal thread (session_id `companion_<userId>`) is simply the most
 * recent episode until a boundary passes; after that it is never
 * resumed again and remains a read-only legacy episode in the stores.
 *
 * Relationship note: today every user has exactly one Twin, so the
 * relationship owner is the userId. Keep episode logic keyed through
 * this service (not hard-coded to userId semantics) so an explicit
 * relationship identifier can be introduced if the product ever
 * supports more than one relationship per user.
 */

import { supabase } from '@/integrations/supabase/client';

const DATE_CHANGE_MIN_HOURS = 2;
const ABSENCE_HOURS = 8;

export interface EpisodeResolution {
  sessionId: string;
  /** True when a boundary passed and this is a fresh conversational space. */
  isFresh: boolean;
}

export interface EpisodeSummary {
  sessionId: string;
  /** Human-ish title derived from the episode's opening (no LLM in Slice 2). */
  title: string;
  lastActivity: string;
  messageCount: number;
  /** True for the most recent episode (the one still open / resumable). */
  isCurrent: boolean;
}

export interface EpisodeMessage {
  role: 'user' | 'hacs';
  content: string;
}

const HIDDEN_PREFIX = '[CONTEXT:';

function deriveTitle(messages: any[]): string {
  const firstUser = messages.find(
    (m) =>
      (m?.role === 'user' || m?.isUser) &&
      typeof m.content === 'string' &&
      m.content.trim() &&
      !m.content.trim().startsWith(HIDDEN_PREFIX),
  );
  const source = firstUser?.content ?? messages.find((m) => typeof m?.content === 'string')?.content;
  if (!source) return 'A conversation';
  const clean = String(source).replace(/\s+/g, ' ').trim();
  return clean.length <= 60 ? clean : `${clean.slice(0, 59).replace(/\s+\S*$/, '')}…`;
}

function newEpisodeId(): string {
  return `episode_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function isEpisodeBoundary(lastInteraction: number, now: Date = new Date()): boolean {
  const hoursAway = (now.getTime() - lastInteraction) / 3_600_000;
  if (hoursAway >= ABSENCE_HOURS) return true;
  const dateChanged = new Date(lastInteraction).toDateString() !== now.toDateString();
  return dateChanged && hoursAway >= DATE_CHANGE_MIN_HOURS;
}

export const conversationEpisodeService = {
  newEpisodeId,
  isEpisodeBoundary,

  /**
   * Return-time resolution: resume the latest episode when the user is
   * still inside it, otherwise open a fresh one. Errors resolve to the
   * legacy id — continuity is the safer failure mode than a false
   * fresh room.
   */
  async resolveEpisode(userId: string): Promise<EpisodeResolution> {
    try {
      const { data } = await supabase
        .from('conversation_memory')
        .select('session_id, last_activity, created_at')
        .eq('user_id', userId)
        .eq('mode', 'companion')
        .order('last_activity', { ascending: false })
        .limit(1);
      const latest = data?.[0];
      if (!latest) return { sessionId: newEpisodeId(), isFresh: true };
      const lastTs = new Date(latest.last_activity || latest.created_at).getTime();
      if (!Number.isFinite(lastTs) || isEpisodeBoundary(lastTs)) {
        return { sessionId: newEpisodeId(), isFresh: true };
      }
      return { sessionId: latest.session_id, isFresh: false };
    } catch (e) {
      console.warn('Episode resolution failed — resuming legacy thread:', e);
      return { sessionId: `companion_${userId}`, isFresh: false };
    }
  },

  /**
   * Closed (and current) episodes for the History surface, newest first.
   * Titles are derived from each episode's own opening — no LLM in Slice 2,
   * per "validate the fresh-episode feel before investing in generated
   * summaries". LLM titles/summaries are a later enrichment.
   */
  async listEpisodes(userId: string, limit = 30): Promise<EpisodeSummary[]> {
    try {
      const { data } = await supabase
        .from('conversation_memory')
        .select('session_id, messages, last_activity, created_at')
        .eq('user_id', userId)
        .eq('mode', 'companion')
        .order('last_activity', { ascending: false })
        .limit(limit);
      const rows = data ?? [];
      return rows.map((r, i) => {
        const msgs = Array.isArray(r.messages) ? (r.messages as any[]) : [];
        const visible = msgs.filter(
          (m) => typeof m?.content === 'string' && !m.content.trim().startsWith(HIDDEN_PREFIX),
        );
        return {
          sessionId: r.session_id,
          title: deriveTitle(msgs),
          lastActivity: r.last_activity || r.created_at,
          messageCount: visible.length,
          isCurrent: i === 0,
        };
      });
    } catch (e) {
      console.warn('Episode list failed:', e);
      return [];
    }
  },

  /** Read-only transcript of one episode (hidden routing prompts filtered). */
  async getEpisodeTranscript(userId: string, sessionId: string): Promise<EpisodeMessage[]> {
    try {
      const { data } = await supabase
        .from('conversation_memory')
        .select('messages')
        .eq('user_id', userId)
        .eq('session_id', sessionId)
        .maybeSingle();
      const msgs = Array.isArray(data?.messages) ? (data!.messages as any[]) : [];
      return msgs
        .filter(
          (m) =>
            typeof m?.content === 'string' &&
            m.content.trim() &&
            !m.content.trim().startsWith(HIDDEN_PREFIX),
        )
        .map((m) => ({
          role: m.role === 'user' || m.isUser ? 'user' : 'hacs',
          content: String(m.content),
        }));
    } catch (e) {
      console.warn('Episode transcript failed:', e);
      return [];
    }
  },
};

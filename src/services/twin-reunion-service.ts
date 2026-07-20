/**
 * twin-reunion-service — the Reunion (Constitution v3.1).
 *
 * The Twin conversation is the primary entry experience, and the Twin
 * speaks first: ONE composed message drawn from what already exists —
 * the last conversation (remember me), a blueprint reminder in place of
 * the quote (remind me), and unfinished work (continue me). The message
 * is built from whichever ingredients earned their place; a missing
 * source simply drops its line.
 *
 * The reunion is a DELIVERY MODE, not a second detection system: the
 * "surprise me" ingredient (a noticed pattern) is NOT composed here —
 * it stays with the guardian's in-conversation ProactiveMoment so
 * detection, ledger, and cooldowns have exactly one authority.
 *
 * Precompute contract: an SPA has no reliable "conversation closed"
 * event, so the reunion is recomputed in the background after each
 * completed assistant turn and cached locally. Opening the app is a
 * synchronous cache read — instant — with a background refresh for
 * fresh devices and staleness.
 */

import { supabase } from '@/integrations/supabase/client';
import { personalizedQuotesService } from '@/services/personalized-quotes-service';

export interface TwinReunion {
  greeting: string;
  /** Continuity line from the last conversation. */
  remember?: string;
  /** Blueprint reminder — the personal quote, no longer called a quote. */
  reminder?: string;
  /** Unfinished work outside the conversation itself. */
  continueLine?: string;
  /** Closing "how are you" line, localized. */
  howAreYou?: string;
  generatedAt: string;
}

const CACHE_KEY = (userId: string) => `twin-reunion:v1:${userId}`;

type Lang = 'en' | 'nl';

function activeLang(): Lang {
  if (typeof window === 'undefined') return 'en';
  try {
    return window.localStorage.getItem('soulsync-language') === 'nl' ? 'nl' : 'en';
  } catch {
    return 'en';
  }
}

// Copy templates per language — the reunion is the Twin's own voice, so
// it must speak the user's app language, not a hardcoded English string.
const COPY: Record<Lang, {
  greet: (part: string, name?: string) => string;
  parts: [string, string, string, string]; // night, morning, afternoon, evening
  remember: (excerpt: string) => string;
  reminder: (quote: string) => string;
  continueTitled: (title: string) => string;
  continueBare: string;
  howAreYou: string;
}> = {
  en: {
    greet: (part, name) => (name ? `${part}, ${name}.` : `${part}.`),
    parts: ['Hello', 'Good morning', 'Good afternoon', 'Good evening'],
    remember: (e) => `Last time, we were exploring: "${e}"`,
    reminder: (q) => `A reminder from your blueprint: ${q}`,
    continueTitled: (t) => `When you're ready, "${t}" is still waiting for us in the workspace.`,
    continueBare: `There's unfinished work waiting for us in the workspace whenever you're ready.`,
    howAreYou: 'How are you today?',
  },
  nl: {
    greet: (part, name) => (name ? `${part}, ${name}.` : `${part}.`),
    parts: ['Hallo', 'Goedemorgen', 'Goedemiddag', 'Goedenavond'],
    remember: (e) => `Vorige keer verkenden we: "${e}"`,
    reminder: (q) => `Een herinnering uit je blauwdruk: ${q}`,
    continueTitled: (t) => `Wanneer je er klaar voor bent, wacht "${t}" nog op ons in de werkruimte.`,
    continueBare: `Er wacht nog werk op ons in de werkruimte wanneer je er klaar voor bent.`,
    howAreYou: 'Hoe gaat het vandaag met je?',
  },
};

function timeGreeting(lang: Lang, name?: string): string {
  const h = new Date().getHours();
  const idx = h < 5 ? 0 : h < 12 ? 1 : h < 18 ? 2 : 3;
  return COPY[lang].greet(COPY[lang].parts[idx], name);
}

function firstName(user: { user_metadata?: Record<string, unknown> } | null | undefined): string | undefined {
  const meta = user?.user_metadata ?? {};
  const raw = (meta.preferred_name || meta.full_name || meta.name) as string | undefined;
  return raw?.trim().split(/\s+/)[0];
}

function excerpt(text: string, max = 110): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  return clean.length <= max ? clean : `${clean.slice(0, max - 1).replace(/\s+\S*$/, '')}…`;
}

// Internal routing prompts (sentence intents, proactive-moment context)
// are stored as user-role messages but prefixed and hidden from the chat
// UI. The reunion must apply the SAME filter — quoting "[CONTEXT: …]"
// back at the user leaks the plumbing and breaks the invisibility law.
function isHiddenContent(content: string): boolean {
  return content.trim().startsWith('[CONTEXT:');
}

/** Last *visible* user message of the most recent conversation → continuity. */
async function rememberLine(userId: string, lang: Lang): Promise<string | undefined> {
  const { data } = await supabase
    .from('hacs_conversations')
    .select('conversation_data, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1);
  const conv = data?.[0];
  const msgs = Array.isArray(conv?.conversation_data) ? (conv!.conversation_data as any[]) : [];
  const lastUser = [...msgs]
    .reverse()
    .find(
      (m) =>
        m?.role === 'user' &&
        typeof m.content === 'string' &&
        m.content.trim() &&
        !isHiddenContent(m.content),
    );
  if (!lastUser) return undefined;
  return COPY[lang].remember(excerpt(lastUser.content));
}

/** One rotating blueprint quote, reframed as a personal reminder. */
async function reminderLine(userId: string, lang: Lang): Promise<string | undefined> {
  const result = await personalizedQuotesService.getRotatingQuotes(userId, 1);
  const q = result.success ? result.quotes?.[0]?.quote_text : undefined;
  return q ? COPY[lang].reminder(q) : undefined;
}

/**
 * Most recent unfinished task/dream activity. Conversation continuity is
 * deliberately excluded — the reunion already IS the conversation.
 */
async function continueLine(userId: string, lang: Lang): Promise<string | undefined> {
  const { data } = await supabase
    .from('user_activities')
    .select('activity_type, activity_data, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(8);
  const act = (data ?? []).find((a) => {
    const t = String(a.activity_type || '').toLowerCase();
    return t.includes('task') || t.includes('dream') || t.includes('milestone');
  });
  if (!act) return undefined;
  const title = (act.activity_data as any)?.title;
  return title
    ? COPY[lang].continueTitled(excerpt(String(title), 60))
    : COPY[lang].continueBare;
}

export const twinReunionService = {
  /** Synchronous cache read — the instant path at app open. */
  readCached(userId: string): TwinReunion | null {
    if (typeof window === 'undefined') return null;
    try {
      const raw = window.localStorage.getItem(CACHE_KEY(userId));
      return raw ? (JSON.parse(raw) as TwinReunion) : null;
    } catch {
      return null;
    }
  },

  /** Cache read for the current session's user — the app-open fast path. */
  async loadForOpen(): Promise<TwinReunion | null> {
    const { data } = await supabase.auth.getSession();
    const userId = data?.session?.user?.id;
    return userId ? this.readCached(userId) : null;
  },

  store(userId: string, reunion: TwinReunion): void {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(CACHE_KEY(userId), JSON.stringify(reunion));
    } catch {
      /* ignore */
    }
  },

  /** Compose from live sources. Each ingredient fails independently. */
  async compose(): Promise<TwinReunion | null> {
    const { data: auth } = await supabase.auth.getUser();
    const user = auth?.user;
    if (!user) return null;
    const lang = activeLang();
    const [remember, reminder, cont] = await Promise.all([
      rememberLine(user.id, lang).catch(() => undefined),
      reminderLine(user.id, lang).catch(() => undefined),
      continueLine(user.id, lang).catch(() => undefined),
    ]);
    return {
      greeting: timeGreeting(lang, firstName(user)),
      remember,
      reminder,
      continueLine: cont,
      howAreYou: COPY[lang].howAreYou,
      generatedAt: new Date().toISOString(),
    };
  },

  /** Background precompute: compose and cache for the next open. */
  async refresh(): Promise<TwinReunion | null> {
    try {
      const reunion = await this.compose();
      if (reunion) {
        const { data: auth } = await supabase.auth.getUser();
        if (auth?.user) this.store(auth.user.id, reunion);
      }
      return reunion;
    } catch {
      return null; // quiet failure — the reunion simply stays as it was
    }
  },
};

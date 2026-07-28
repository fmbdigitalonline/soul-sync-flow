/**
 * user-name — the ONE place the user's name is resolved.
 *
 * The app had several competing answers: the blueprint's preferred_name, the
 * profile's display_name (which is seeded from the account and often reads as
 * an email handle), and `email.split('@')[0]` scattered through hooks. That is
 * why one screen said "Feurion" and another said an email handle.
 *
 * Priority: preferred_name → first_name → first word of full_name →
 * display_name → the account handle → a neutral fallback. Anything that looks
 * like an email address or a bare handle is rejected: we would rather say
 * nothing personal than call someone by their login.
 */

export const NAME_FALLBACK_EN = 'Friend';
export const NAME_FALLBACK_NL = 'Vriend';

/** A value we are willing to call a person. */
function usable(v: unknown): string | null {
  if (typeof v !== 'string') return null;
  const s = v.trim();
  if (!s) return null;
  if (s.includes('@')) return null;              // an email, not a name
  if (s.length < 2) return null;                 // an initial
  if (/^[a-z0-9._-]+$/.test(s) && !/\s/.test(s) && s.length <= 3) return null; // a handle like "gog"
  return s;
}

export interface NameSources {
  /** blueprint.user_meta */
  userMeta?: {
    preferred_name?: unknown;
    first_name?: unknown;
    full_name?: unknown;
    display_name?: unknown;
  } | null;
  /** user_profiles.display_name */
  profileDisplayName?: unknown;
  /** auth email — used only as a last resort before the fallback */
  email?: unknown;
}

/**
 * Resolve the user's name. Returns null when nothing trustworthy exists, so
 * callers can decide between a neutral fallback and saying nothing at all.
 */
export function resolveUserName(sources: NameSources): string | null {
  const m = sources.userMeta || {};

  const preferred = usable(m.preferred_name);
  if (preferred) return preferred;

  const first = usable(m.first_name);
  if (first) return first;

  const full = usable(m.full_name);
  if (full) {
    const firstWord = full.split(/\s+/)[0];
    if (usable(firstWord)) return firstWord;
  }

  const metaDisplay = usable(m.display_name);
  if (metaDisplay) return metaDisplay;

  const profileDisplay = usable(sources.profileDisplayName);
  if (profileDisplay) return profileDisplay;

  return null;
}

/** Resolve with a language-appropriate neutral fallback. */
export function resolveUserNameOr(sources: NameSources, language?: string): string {
  return resolveUserName(sources) ?? (language === 'nl' ? NAME_FALLBACK_NL : NAME_FALLBACK_EN);
}

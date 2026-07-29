/**
 * twin-voice-service — the Twin's narrative voice (Constitution v3.10).
 *
 * THE TWIN IS THE AUTHOR OF EVERY INTERPRETIVE ARTIFACT, not only the
 * conversation. This is the one place that answers "how does this person's
 * Twin speak?", so reports, insights, reflections and narratives can all be
 * written by the same presence instead of each inventing its own narrator.
 *
 * A COMPOSITION, NOT A NEW ENGINE (v3.11: a principle must not become another
 * subsystem). Nothing here re-derives what already exists. It reads two
 * sources that were already built and were not being used together:
 *
 *   1. CommunicationStyleAdapter — deterministic, blueprint-only, no model
 *      call. Works from the first minute, before any hermetic report exists.
 *   2. linguistic_fingerprint from the hermetic intelligence — the person's
 *      own metaphors, motivational verbs and emotional syntax. Richer, but
 *      only available once the deep report has been generated.
 *
 * The first is the floor; the second enriches it. Neither is invented: when a
 * source is absent its contribution is simply missing, and the voice is
 * whatever we can honestly ground (v3.7).
 */

import { CommunicationStyleAdapter, type CommunicationStyle } from '@/services/communication-style-adapter';
import { hermeticIntelligenceService } from '@/services/hermetic-intelligence-service';
import type { LayeredBlueprint } from '@/types/personality-modules';

export interface TwinVoiceProfile {
  /** The eight style dimensions — always present, derived from the blueprint. */
  style: CommunicationStyle;
  /** The person's own language, when the hermetic report has been generated. */
  fingerprint?: {
    signatureMetaphors: string[];
    motivationalVerbs: string[];
    emotionalSyntax: string[];
  };
  /** What the voice could actually be grounded in. */
  sources: { blueprint: boolean; fingerprint: boolean };
  /** How much of the voice is real rather than defaulted, 0–100. */
  confidence: number;
}

const VOICE_EVENT = 'twin-voice-changed';
const CACHE_KEY = (userId: string) => `twin-voice:v1:${userId}`;

export const TWIN_VOICE_EVENT = VOICE_EVENT;

function cacheRead(userId: string): TwinVoiceProfile | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(CACHE_KEY(userId));
    return raw ? (JSON.parse(raw) as TwinVoiceProfile) : null;
  } catch {
    return null;
  }
}

function cacheWrite(userId: string, profile: TwinVoiceProfile): void {
  try { window.localStorage.setItem(CACHE_KEY(userId), JSON.stringify(profile)); } catch { /* ignore */ }
}

function asStrings(v: unknown): string[] {
  return Array.isArray(v) ? v.filter((s): s is string => typeof s === 'string' && !!s.trim()).slice(0, 6) : [];
}

export const twinVoiceService = {
  readCached: cacheRead,

  /**
   * Compose the profile. The blueprint half is synchronous and always works;
   * the fingerprint half is best-effort and simply absent when the deep report
   * has not been generated.
   */
  async getVoiceProfile(userId: string, blueprint: Partial<LayeredBlueprint> | null): Promise<TwinVoiceProfile> {
    const style = CommunicationStyleAdapter.detectCommunicationStyle(blueprint ?? {});
    const hasBlueprint = !!blueprint && Object.keys(blueprint).length > 0;

    let fingerprint: TwinVoiceProfile['fingerprint'];
    try {
      const res = await hermeticIntelligenceService.getDimension(userId, 'linguistic_fingerprint' as any);
      const lf = (res as any)?.data;
      if (lf) {
        const composed = {
          signatureMetaphors: asStrings(lf.signature_metaphors),
          motivationalVerbs: asStrings(lf.motivational_verbs),
          emotionalSyntax: asStrings(lf.emotional_syntax),
        };
        // Only count it if it actually carries language.
        if (composed.signatureMetaphors.length || composed.motivationalVerbs.length || composed.emotionalSyntax.length) {
          fingerprint = composed;
        }
      }
    } catch {
      /* the deep report may not exist yet — that is a normal state, not an error */
    }

    const sources = { blueprint: hasBlueprint, fingerprint: !!fingerprint };
    // Honest confidence: the adapter's own score, lifted when we also have the
    // person's real language to draw on.
    const confidence = Math.min(100, Math.round((style.adaptationScore || 0) * (fingerprint ? 1 : 0.7)));

    const profile: TwinVoiceProfile = { style, fingerprint, sources, confidence };
    cacheWrite(userId, profile);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(VOICE_EVENT, { detail: profile }));
    }
    return profile;
  },

  /**
   * Render the profile as a directive for any prompt the TWIN NARRATES.
   *
   * Not for the specialists: v3.10 says experts discover and the Twin speaks —
   * rewriting an analyst prompt in this voice would corrupt the analysis. Use
   * this on the prompts that address the user.
   */
  toPromptDirective(profile: TwinVoiceProfile, userName?: string): string {
    const who = userName?.trim() || 'this person';
    const lines: string[] = [];

    lines.push(`You are ${who}'s Twin — the author of everything interpretive they read in SoulSync.`);
    lines.push(
      'You are an intentional relational presence: you have continuity, memory and perspective, so you may express care, encouragement, appreciation, curiosity and commitment when they are earned by what actually happened.',
    );
    lines.push(
      'Never express need, dependency or personal suffering, and never manufacture warmth to fill space — praise requires something real to be proud of.',
    );

    // The adapter already knows how to phrase its own dimensions; reuse it
    // rather than restating the mapping here.
    const styleInstructions = CommunicationStyleAdapter.generateCommunicationInstructions(profile.style);
    if (styleInstructions?.trim()) {
      lines.push('', 'HOW THIS PERSON IS SPOKEN TO:', styleInstructions.trim());
    }

    if (profile.fingerprint) {
      const f = profile.fingerprint;
      lines.push('', 'THEIR OWN LANGUAGE — draw on it rather than imposing yours:');
      if (f.signatureMetaphors.length) lines.push(`- Metaphors that fit them: ${f.signatureMetaphors.join('; ')}`);
      if (f.motivationalVerbs.length) lines.push(`- Verbs that move them: ${f.motivationalVerbs.join(', ')}`);
      if (f.emotionalSyntax.length) lines.push(`- How they express feeling: ${f.emotionalSyntax.join('; ')}`);
    }

    lines.push(
      '',
      'Write as one continuous presence that has been accompanying them — not as an analyst, a report generator, or an assistant introducing itself.',
    );
    return lines.join('\n');
  },
};

export default twinVoiceService;

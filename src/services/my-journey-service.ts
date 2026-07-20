/**
 * my-journey-service — My Journey, the perspective level (Constitution v3.4).
 *
 * PERSPECTIVE, NOT INVENTORY. This composes understanding the system
 * already holds into one coherent reflection — it creates no new
 * intelligence, runs no model, adds no store. Every piece is read from
 * where it already lives: the blueprint, the two engines' programs, the
 * insight ledger, and the conversation episodes.
 *
 * Trajectory is reflection, not prediction — phrased in appears/seems,
 * derived from what is present, never a claim about the future.
 */

import { supabase } from '@/integrations/supabase/client';
import { blueprintService } from '@/services/blueprint-service';
import { conversationEpisodeService, type EpisodeSummary } from '@/services/conversation-episode-service';

export interface JourneyProgram {
  title: string;
  domain?: string;
  kind: 'transformation' | 'achievement';
}

export interface JourneyPattern {
  text: string;
}

export interface MyJourney {
  essence?: string;
  domains: string[];
  patterns: JourneyPattern[];
  programs: JourneyProgram[];
  turningPoints: EpisodeSummary[];
  trajectory?: string;
}

type Lang = 'en' | 'nl';

// Raw goal/program titles sometimes carry generated Hermetic phrasing
// ("… because your Hermetic blueprint shows a natural avoidance pattern").
// The invisibility law says the user never sees that language — reduce a
// raw title to its human core (the clause before the mechanism) and cap it.
const RAW_MARKERS = /hermetic|blueprint shows|identity constructs|temporal biology|avoidance pattern|cognitive|because your/i;
function humanizeTitle(raw: string): string {
  let s = raw.replace(/\s+/g, ' ').trim();
  if (RAW_MARKERS.test(s)) {
    // keep the lead clause before the explanatory pivot
    s = s.split(/\s+(?:because|triggers?|when your|that your|so that|due to)\b/i)[0].trim();
  }
  if (s.length > 52) s = `${s.slice(0, 51).replace(/\s+\S*$/, '')}…`;
  // Sentence-case a bare lowercase lead.
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function blueprintEssence(bp: any, lang: Lang): string | undefined {
  if (!bp) return undefined;
  const pick = (o: any, keys: string[]) => {
    for (const k of keys) {
      const v = o?.[k];
      if (typeof v === 'string' && v.trim() && v.trim() !== 'Unknown') return v.trim();
    }
    return undefined;
  };
  const sun = pick(bp.archetype_western, ['sun_sign', 'sunSign', 'sun']);
  const hd = pick(bp.energy_strategy_human_design, ['type', 'design_type', 'energyType']);
  const lifePath = bp.values_life_path?.life_path_number ?? bp.values_life_path?.lifePathNumber;
  const bits = [sun, hd, lifePath ? (lang === 'nl' ? `Levenspad ${lifePath}` : `Life Path ${lifePath}`) : undefined].filter(
    Boolean,
  );
  return bits.length ? bits.join(' · ') : undefined;
}

export const myJourneyService = {
  async getMyJourney(userId: string, lang: Lang = 'en'): Promise<MyJourney> {
    const readRows = async (build: () => any): Promise<any[]> => {
      try {
        const { data } = await build();
        return (data as any[]) ?? [];
      } catch {
        return [];
      }
    };

    const [bpRes, growth, goals, insights, episodes] = await Promise.all([
      blueprintService.getActiveBlueprintData().catch(() => null),
      readRows(() =>
        supabase
          .from('growth_programs')
          .select('title, domain, status')
          .eq('user_id', userId)
          .eq('status', 'active'),
      ),
      readRows(() =>
        supabase.from('user_goals').select('title, status').eq('user_id', userId).eq('status', 'active'),
      ),
      readRows(() =>
        (supabase as any)
          .from('conversation_insights')
          .select('insight_data, pattern_key, status, delivered_at')
          .eq('user_id', userId)
          .in('status', ['delivered', 'accepted', 'acted_on'])
          .order('delivered_at', { ascending: false })
          .limit(20),
      ),
      conversationEpisodeService.listEpisodes(userId, 5).catch(() => []),
    ]);

    const rawPrograms: JourneyProgram[] = [
      ...((growth as any[]) ?? []).map((p) => ({
        title: humanizeTitle(String(p.title ?? '')),
        domain: p.domain ? String(p.domain) : undefined,
        kind: 'transformation' as const,
      })),
      ...((goals as any[]) ?? []).map((g) => ({
        title: humanizeTitle(String(g.title ?? '')),
        kind: 'achievement' as const,
      })),
    ].filter((p) => p.title);
    // De-duplicate by humanized title (case-insensitive) — the same goal can
    // exist as more than one row.
    const seenTitles = new Set<string>();
    const programs = rawPrograms.filter((p) => {
      const k = p.title.toLowerCase();
      if (seenTitles.has(k)) return false;
      seenTitles.add(k);
      return true;
    });

    const domains = Array.from(
      new Set(programs.map((p) => p.domain).filter((d): d is string => !!d)),
    );

    // De-duplicate patterns by pattern_key; keep the most recent phrasing.
    const seen = new Set<string>();
    const patterns: JourneyPattern[] = [];
    for (const row of (insights as any[]) ?? []) {
      const key = row.pattern_key || row.insight_data?.pattern_core;
      const text = row.insight_data?.pattern_core || row.insight_data?.observation;
      if (!text || typeof text !== 'string') continue;
      if (key && seen.has(key)) continue;
      if (key) seen.add(key);
      patterns.push({ text: text.trim() });
      if (patterns.length >= 4) break;
    }

    const essence = blueprintEssence((bpRes as any)?.data, lang);
    const trajectory = composeTrajectory({ domains, patterns, programs, episodes }, lang);

    return { essence, domains, patterns, programs, turningPoints: episodes, trajectory };
  },
};

/**
 * A reflective line — reflection, not prediction. Derived from what is
 * present; deliberately tentative (appears/seems). No model call.
 */
function composeTrajectory(
  j: { domains: string[]; patterns: JourneyPattern[]; programs: JourneyProgram[]; episodes: EpisodeSummary[] },
  lang: Lang,
): string | undefined {
  const hasWork = j.programs.length > 0;
  const hasPatterns = j.patterns.length > 0;
  const hasHistory = j.episodes.length > 1;
  if (!hasWork && !hasPatterns && !hasHistory) return undefined;

  if (lang === 'nl') {
    if (hasWork && hasPatterns)
      return 'Je lijkt te bewegen van het herkennen van patronen naar er bewust mee werken — de richting oogt er een van groeiend zelfinzicht.';
    if (hasWork) return 'Je richting lijkt er een van actief bouwen aan wat je belangrijk vindt.';
    if (hasPatterns) return 'Er lijkt een thema te ontstaan dat de moeite waard is om te blijven volgen.';
    return 'Jullie gesprekken beginnen een eigen lijn te tekenen.';
  }
  if (hasWork && hasPatterns)
    return 'You seem to be moving from noticing patterns toward working with them deliberately — the direction appears to be one of deepening self-understanding.';
  if (hasWork) return 'Your direction appears to be one of actively building toward what matters to you.';
  if (hasPatterns) return 'A theme seems to be emerging that may be worth continuing to follow.';
  return 'Your conversations are beginning to trace a line of their own.';
}

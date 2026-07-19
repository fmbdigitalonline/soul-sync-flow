/**
 * transformation-intake-service — "Help me change this pattern" → a real
 * transformation program (Constitution v2.6 Step 3).
 *
 * Routes the selected passage into the CLEAN growth-engine spine:
 * growth-program-service directly (deterministic structure calculator).
 * Deliberately NOT via agent-growth-integration: its "agent mode" path is
 * the audited stub stack (hardcoded program type, fake alignment scores) —
 * INTELLIGENCE_WIRING_MAP §4 / PHASE2 map, do not inherit.
 *
 * Provenance: the pattern is frozen into blueprint_params.pattern_seed so
 * the program always remembers the sentence that started it.
 */

import { growthProgramService } from '@/services/growth-program-service';
import type { GrowthProgram, LifeDomain, ProgramWeek } from '@/types/growth-program';

export const DOMAIN_LABELS: Record<LifeDomain, string> = {
  career: 'Career',
  relationships: 'Relationships',
  finances: 'Money',
  wellbeing: 'Wellbeing',
  creativity: 'Creativity',
  spirituality: 'Spirituality',
  home_family: 'Home & family',
  health: 'Health',
  energy: 'Energy',
  personal_growth: 'Personal growth',
  productivity: 'Productivity',
  stress: 'Stress',
};

// Deterministic keyword → domain inference over the selected passage.
// Bilingual (EN/NL) since the twin speaks both. First match set wins the
// ranking; personal_growth is always the fallback.
const DOMAIN_KEYWORDS: Array<{ domain: LifeDomain; re: RegExp }> = [
  { domain: 'relationships', re: /\b(relatie|relationship|partner|conflict|vriend|friend|love|liefde|connection|verbinding|alone|eenzaam|intimacy)\b/i },
  { domain: 'career', re: /\b(werk|work|job|career|carrière|baas|boss|collega|colleague|business|onderneming)\b/i },
  { domain: 'finances', re: /\b(geld|money|financ|inkomen|income|schuld|debt|sparen|saving|miljoen|million)\b/i },
  { domain: 'stress', re: /\b(stress|burnout|overwhelm|overweldig|pressure|druk|anxious|angst|paniek|panic)\b/i },
  { domain: 'health', re: /\b(gezond|health|slaap|sleep|eten|eating|weight|gewicht|pijn|pain|conditie)\b/i },
  { domain: 'energy', re: /\b(energie|energy|moe|tired|uitgeput|exhausted|drained|opgebrand)\b/i },
  { domain: 'creativity', re: /\b(creati|create|maken|schrijven|writing|kunst|art|muziek|music|expressie)\b/i },
  { domain: 'spirituality', re: /\b(spiritu|ziel|soul|meaning|zingeving|purpose|bezieling|meditat)\b/i },
  { domain: 'home_family', re: /\b(familie|family|gezin|kinderen|children|ouders|parents|thuis|home)\b/i },
  { domain: 'productivity', re: /\b(uitstel|procrastinat|focus|afmaken|finish|discipline|planning|afleiding|distract)\b/i },
  { domain: 'wellbeing', re: /\b(geluk|happy|happiness|welzijn|wellbeing|balans|balance|rust|calm|zelfzorg|self.?care)\b/i },
];

/** Ranked domain guesses for a pattern, best first, always ≥1. */
export function inferDomains(pattern: string): LifeDomain[] {
  const hits = DOMAIN_KEYWORDS.filter(({ re }) => re.test(pattern)).map(({ domain }) => domain);
  const ranked = [...new Set([...hits, 'personal_growth' as LifeDomain])];
  return ranked;
}

/**
 * Create + activate a transformation program from a pattern seed.
 * The raw blueprint (BlueprintCache shape) is mapped to the fields the
 * engine's param extractor actually reads — passing it raw would silently
 * degrade every parameter to defaults.
 */
export async function createTransformationProgram(
  userId: string,
  pattern: string,
  domain: LifeDomain,
  rawBlueprint: any,
): Promise<{ program: GrowthProgram; weeks: ProgramWeek[] }> {
  const bp = rawBlueprint || {};
  const engineBlueprint: any = {
    cognitiveTemperamental: {
      mbtiType: bp.user_meta?.personality?.likelyType || bp.cognition_mbti?.type || undefined,
    },
    energyDecisionStrategy: {
      humanDesignType: bp.energy_strategy_human_design?.type || undefined,
      authority: bp.energy_strategy_human_design?.authority || undefined,
    },
    coreValuesNarrative: {
      lifePath: bp.values_life_path?.life_path_number ?? bp.values_life_path?.lifePathNumber ?? undefined,
      expressionNumber: bp.values_life_path?.expression_number ?? bp.values_life_path?.expressionNumber ?? undefined,
    },
  };

  const program = await growthProgramService.createProgram(userId, domain, engineBlueprint);

  // Activate (createProgram writes 'pending'; getCurrentProgram only finds
  // 'active') and freeze the pattern seed as provenance.
  await growthProgramService.updateProgramProgress(program.id, {
    status: 'active',
    blueprint_params: {
      ...(program.blueprint_params as any),
      pattern_seed: pattern,
    } as any,
  });

  const weeks = await growthProgramService.generateWeeklyProgram({ ...program, status: 'active' });
  return { program: { ...program, status: 'active' }, weeks };
}

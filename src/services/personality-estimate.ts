/**
 * The three-question personality estimate.
 *
 * Five of the six frameworks are computed from birth data. MBTI is the one that
 * has to be asked — and asking someone to name their own four-letter type only
 * works for the minority who already know it. Three ordinary behavioural
 * choices infer it instead.
 *
 * The maths lived inside PersonalityFusion, the component from the retired
 * 9-step wizard. It is pure, so it lives here where the onboarding form can
 * reach it without dragging in that component's page-per-question UI.
 *
 * PersonalityFusion still carries its own copy. It is unrouted — its only
 * consumer is the equally unrouted src/pages/Onboarding.tsx — so the two cannot
 * disagree in front of a user today. Deleting both is the right end state and
 * is deliberately not bundled into a UI change.
 */

import { NumerologyCalculator } from './numerology-calculator';

export interface BigFive {
  openness: number;
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  neuroticism: number;
}

export interface PersonalityEstimate {
  bigFive: BigFive;
  confidence: BigFive;
  mbtiProbabilities: Record<string, number>;
  likelyType: string;
  description: string;
}

export interface MicroQuestion {
  id: string;
  /** Which Big Five trait this choice moves. */
  trait: keyof BigFive;
  /** How far one answer moves it. */
  weight: number;
  left: { key: string; value: -1 | 1 };
  right: { key: string; value: -1 | 1 };
}

/**
 * The same three questions, traits and weights the wizard used. Labels are not
 * here — they are translated at the call site, so this stays language-free.
 */
export const MICRO_QUESTIONS: MicroQuestion[] = [
  {
    id: 'energy_source',
    trait: 'extraversion',
    weight: 0.3,
    left: { key: 'personality.beingAlone', value: -1 },
    right: { key: 'personality.beingWithPeople', value: 1 },
  },
  {
    id: 'workspace_style',
    trait: 'conscientiousness',
    weight: 0.25,
    left: { key: 'personality.tidyOrganized', value: 1 },
    right: { key: 'personality.creativeChaos', value: -1 },
  },
  {
    id: 'planning_style',
    trait: 'conscientiousness',
    weight: 0.25,
    left: { key: 'personality.bookInAdvance', value: 1 },
    right: { key: 'personality.seeWhatHappens', value: -1 },
  },
];

export const MICRO_QUESTION_TITLE_KEYS: Record<string, string> = {
  energy_source: 'personality.energySource',
  workspace_style: 'personality.workspaceStyle',
  planning_style: 'personality.planningStyle',
};

/** Optional chart-derived nudges. */
export interface EstimateSeed {
  sunSign?: string;
  humanDesignType?: string;
  lifePath?: number;
}

const SUN_SIGN_BOUNDS: Array<[month: number, day: number, sign: string]> = [
  [1, 20, 'Aquarius'], [2, 19, 'Pisces'], [3, 21, 'Aries'], [4, 20, 'Taurus'],
  [5, 21, 'Gemini'], [6, 21, 'Cancer'], [7, 23, 'Leo'], [8, 23, 'Virgo'],
  [9, 23, 'Libra'], [10, 23, 'Scorpio'], [11, 22, 'Sagittarius'], [12, 22, 'Capricorn'],
];

/**
 * Sun sign from a birth date, for seeding the estimate only.
 *
 * This is NOT the chart. The real sun position comes from the ephemeris in the
 * backend, and on a cusp day it can disagree with this by one sign. That is
 * acceptable here and nowhere else: this value never reaches the blueprint, it
 * only stops two Big Five traits from sitting at exactly 0.5 while the estimate
 * is computed — see the note on `mbtiProbabilities`.
 *
 * @param birthDate ISO `YYYY-MM-DD`.
 */
export function sunSignFromBirthDate(birthDate: string): string | undefined {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(birthDate ?? '');
  if (!m) return undefined;
  const month = Number(m[2]);
  const day = Number(m[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return undefined;

  const [boundDay, sign] = [SUN_SIGN_BOUNDS[month - 1][1], SUN_SIGN_BOUNDS[month - 1][2]];
  if (day >= boundDay) return sign;
  // Before this month's cusp the sun is still in the previous month's sign.
  return SUN_SIGN_BOUNDS[(month + 10) % 12][2];
}

/**
 * Life path for seeding, from the same two fields the form already collects.
 *
 * Wrapped because the estimate is computed on the submit path: a malformed name
 * or date must weaken the seed, never stop a registration. `NumerologyCalculator`
 * stays the single owner of the arithmetic — this only reaches in for one number.
 */
export function lifePathFromBirthData(fullName: string, birthDate: string): number | undefined {
  try {
    const n = NumerologyCalculator.calculateNumerology(fullName ?? '', birthDate ?? '').lifePathNumber;
    return Number.isFinite(n) && n > 0 ? n : undefined;
  } catch (e) {
    console.warn('⚠️ Estimate seed: life path could not be derived', e);
    return undefined;
  }
}

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

function seedBase(seed?: EstimateSeed): { base: BigFive; confidence: BigFive } {
  const base: BigFive = {
    openness: 0.5, conscientiousness: 0.5, extraversion: 0.5,
    agreeableness: 0.5, neuroticism: 0.5,
  };
  const confidence: BigFive = {
    openness: 0.3, conscientiousness: 0.3, extraversion: 0.3,
    agreeableness: 0.3, neuroticism: 0.3,
  };

  if (seed?.sunSign) {
    if (['Aries', 'Leo', 'Sagittarius'].includes(seed.sunSign)) {
      base.extraversion += 0.2; base.openness += 0.15; confidence.extraversion = 0.5;
    } else if (['Taurus', 'Virgo', 'Capricorn'].includes(seed.sunSign)) {
      base.conscientiousness += 0.2; base.extraversion -= 0.1; confidence.conscientiousness = 0.5;
    } else if (['Gemini', 'Libra', 'Aquarius'].includes(seed.sunSign)) {
      base.openness += 0.2; base.agreeableness += 0.1; confidence.openness = 0.5;
    } else if (['Cancer', 'Scorpio', 'Pisces'].includes(seed.sunSign)) {
      base.neuroticism += 0.15; base.agreeableness += 0.15; confidence.neuroticism = 0.4;
    }
  }

  if (seed?.humanDesignType === 'Projector') {
    base.extraversion -= 0.15; base.openness += 0.1;
  } else if (seed?.humanDesignType === 'Manifestor') {
    base.extraversion += 0.15; base.conscientiousness += 0.1;
  }

  if (seed?.lifePath) {
    if ([3, 5, 7].includes(seed.lifePath)) base.openness += 0.1;
    if ([4, 8, 22].includes(seed.lifePath)) base.conscientiousness += 0.1;
  }

  return { base, confidence };
}

/**
 * Big Five → a distribution over the sixteen types.
 *
 * KNOWN LIMIT, deliberately left in place. The tests below are `> 0.5` and
 * `<= 0.5`, so a trait sitting at exactly 0.5 — no evidence either way — still
 * casts a full vote for S and for T. The three onboarding questions move only
 * extraversion and conscientiousness, so without a seed openness and
 * agreeableness never leave 0.5 and N and F become mathematically unreachable:
 * every user lands in {ESTP, ESTJ, ISTP, ISTJ}, four of sixteen.
 *
 * The seed is what moves them, which is why the caller must supply one. It does
 * not close the hole completely: `seedBase` leaves openness untouched for earth
 * and water signs and agreeableness untouched for fire and earth, so those
 * users still get a forced letter. Fixing that means deciding what each element
 * says about openness and agreeableness, and that is a content decision for the
 * founder rather than a silent edit here. Parked, with the numbers, in
 * PARKED.md.
 */
export function mbtiProbabilities(bigFive: BigFive): Record<string, number> {
  const types = [
    'INTJ', 'INTP', 'ENTJ', 'ENTP', 'INFJ', 'INFP', 'ENFJ', 'ENFP',
    'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ', 'ISTP', 'ISFP', 'ESTP', 'ESFP',
  ];
  const probs: Record<string, number> = {};
  types.forEach((type) => {
    let prob = 0.0625;
    if (type[0] === 'E' && bigFive.extraversion > 0.5) prob *= 2;
    if (type[0] === 'I' && bigFive.extraversion <= 0.5) prob *= 2;
    if (type[1] === 'N' && bigFive.openness > 0.5) prob *= 1.8;
    if (type[1] === 'S' && bigFive.openness <= 0.5) prob *= 1.8;
    if (type[2] === 'F' && bigFive.agreeableness > 0.5) prob *= 1.6;
    if (type[2] === 'T' && bigFive.agreeableness <= 0.5) prob *= 1.6;
    if (type[3] === 'J' && bigFive.conscientiousness > 0.5) prob *= 1.7;
    if (type[3] === 'P' && bigFive.conscientiousness <= 0.5) prob *= 1.7;
    probs[type] = prob;
  });
  const total = Object.values(probs).reduce((sum, p) => sum + p, 0);
  Object.keys(probs).forEach((t) => { probs[t] = probs[t] / total; });
  return probs;
}

/**
 * @param answers  question id → -1 or 1. Unanswered questions simply don't move
 *                 their trait, so a partial answer set is still usable.
 * @param descriptions  MBTI type → prose, supplied by the caller's translations.
 */
export function estimateFromAnswers(
  answers: Record<string, number>,
  opts: { seed?: EstimateSeed; descriptions?: Record<string, string> } = {},
): PersonalityEstimate {
  const { base, confidence } = seedBase(opts.seed);

  for (const q of MICRO_QUESTIONS) {
    const value = answers[q.id];
    if (value !== -1 && value !== 1) continue;
    base[q.trait] += value * q.weight;
    confidence[q.trait] = Math.max(0.7, confidence[q.trait]);
  }

  (Object.keys(base) as Array<keyof BigFive>).forEach((k) => { base[k] = clamp01(base[k]); });

  const probs = mbtiProbabilities(base);
  const likelyType = Object.keys(probs).reduce((a, b) => (probs[a] > probs[b] ? a : b));

  return {
    bigFive: base,
    confidence,
    mbtiProbabilities: probs,
    likelyType,
    description:
      opts.descriptions?.[likelyType] ||
      'You have a unique personality that combines various traits in interesting ways.',
  };
}

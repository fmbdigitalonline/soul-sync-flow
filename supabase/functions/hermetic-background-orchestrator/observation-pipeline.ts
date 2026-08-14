// The v3 pipeline: six framework lenses discover, one synthesis relates, the
// Twin speaks.
//
// What changed and why. Until now 31 specialists each wrote a complete
// personality portrait of the same person from the same blueprint. Two of them
// read side by side were ~85% identical — inevitably, because nineteen full
// portraits of one person cannot differ much. What made them *look* different
// was framework vocabulary, which is exactly the vocabulary users told us said
// nothing to them. Remove the labels from that arrangement and the sections
// collapse into each other; keep them and the report talks in a language the
// reader does not speak.
//
// So the division of labour moves. A specialist represents its own lens and
// reports what that lens shows — structured, bounded, honest about what it
// cannot see. A single synthesis step relates those observations across lenses.
// The Twin, and only the Twin, writes anything a person reads.
//
// This is not a new law. v3.10 already says "Experts discover. The Twin
// speaks." It was written for the conversation and never applied to the
// artifacts.

export interface Observation {
  pattern: string;
  evidence: string[];
  consequence: string;
  confidence: number;
  lens: string;
}

export interface LensTension {
  between: [string, string];
  produces: string;
  confidence: number;
}

export interface LensReport {
  observations: Observation[];
  tensions: LensTension[];
  absences: string[];
}

/**
 * The nine ways two or more lenses can relate to each other.
 *
 * Tension is the one that read best in the harness, and that is exactly why it
 * is listed alongside eight others rather than adopted as the mechanism. A
 * pipeline that only finds tensions produces a report where every section says
 * "you are pulled between X and Y" — the same monoculture we are removing,
 * wearing different clothes.
 */
export const SYNTHESIS_MECHANISMS = [
  ['convergence', 'several lenses independently point at the same thing'],
  ['tension', 'two lenses pull in opposite directions and the person lives in between'],
  ['complementarity', 'two lenses describe parts that complete rather than fight each other'],
  ['paradox', 'something true in two ways that should not both be true'],
  ['recurring_theme', 'a motif that surfaces across lenses in different costumes'],
  ['shadow', 'the cost or blind spot implied when several lenses are read together'],
  ['potential', 'a capacity visible in combination that no single lens shows'],
  ['direction', 'where this configuration tends to move when left alone'],
  ['natural_strength', 'what this configuration does easily that others find hard'],
] as const;

/**
 * The four axes the synthesis must derive in addition to meaning.
 *
 * "What does this combination mean?" produces a portrait. It does not produce
 * anything the Twin can hold while a person is talking to it. These four ask a
 * different question — *how does this combination appear to organise itself* —
 * and the answer is a working model rather than a description.
 *
 * Every entry is a HYPOTHESIS derived from six frameworks. Nobody has watched
 * this person do anything. The Twin holds them as its opening guess and the
 * Living Blueprint refines them from lived evidence
 * (`SOULSYNC_CONSTITUTION.md`: disagreement updates the model, and the model
 * has inertia).
 *
 * TWO AGREED BOUNDARIES. Only the second is enforced here, on purpose.
 *
 * 1. These are internal synthesis output, not a seventh framework. A reader
 *    told they are "an information_processing type X" has been handed exactly
 *    the labelling machine v3 exists to remove, in a vocabulary nobody speaks.
 *    Stated as a rule in the two prompts and nowhere else: it is a constraint
 *    on how *consumers* use the axes, and there is no consumer yet. Deciding
 *    what needs real enforcement waits until the output has been read.
 *
 * 2. Completeness never outranks honesty — enforced, because it is about what
 *    this step produces right now. An axis the lenses do not support comes back
 *    as `insufficient_ground`: a first-class answer, not a failure.
 *    "decision_making: not enough signal" is a usable model. A hypothesis
 *    invented to fill the fourth slot is worse than a blank, because anything
 *    downstream would treat it as a starting belief and defend it against the
 *    person it is about.
 */
export const PROCESSING_AXES = [
  ['information_processing', 'how information appears to get taken in, filtered and held — what gets through, what is discarded, what is needed before anything can be considered at all'],
  ['meaning_making', 'how raw experience appears to become significant — what this person treats as a sign, what they need something to connect to before it counts'],
  ['decision_making', 'what appears to happen between an option and a commitment — what has to be satisfied, what reliably stalls it, and what a decision actually rests on when it lands'],
  ['action', 'how intention appears to become movement — the conditions under which it starts, sustains, and stops'],
] as const;

export interface ProcessingHypothesis {
  axis: string;
  /**
   * `insufficient_ground` is a real answer and carries no penalty. It exists so
   * that "all four axes, every time" can never be satisfied by invention.
   */
  status: 'hypothesis' | 'insufficient_ground';
  /** Empty when status is `insufficient_ground`. */
  hypothesis: string;
  /** ≥2 lenses, same rule as syntheses. One lens is an observation, not a model. */
  lenses: string[];
  /**
   * The observable signature: what would show up in an ordinary week if this is
   * right. Without it a hypothesis cannot be refined by lived evidence — it can
   * only be repeated. This field is what makes the Living Blueprint able to do
   * its job later without anything new being built now.
   */
  would_look_like: string;
  confidence: number;
}

/** What each specialist is actually looking through. Framework-bound on purpose. */
export const LENS_BRIEFS: Record<string, string> = {
  mbti_hermetic_translator: 'cognitive functions and how attention, judgement and energy are typically organised',
  astrology_hermetic_translator: 'the natal configuration — luminaries, signs, houses and aspects as temperament and timing',
  numerology_hermetic_translator: 'the numeric signature — life path, expression, soul urge, birthday',
  human_design_hermetic_translator: 'type, strategy, authority, profile and defined centres as an energetic operating manual',
  chinese_astrology_hermetic_translator: 'the Chinese archetype — animal, element, polarity and its cyclical timing',

  mentalism_analyst: 'the Law of Mentalism — how mind, belief and attention shape what this person experiences as real',
  correspondence_analyst: 'the Law of Correspondence — how inner states and outer circumstances mirror each other here',
  vibration_analyst: 'the Law of Vibration — the characteristic energetic pitch, and what raises or lowers it',
  polarity_analyst: 'the Law of Polarity — the opposites this person moves between and how they convert',
  rhythm_analyst: 'the Law of Rhythm — the natural cycles, swings and recovery patterns',
  causation_analyst: 'the Law of Cause and Effect — the chains this person sets in motion, knowingly or not',
  gender_analyst: 'the Law of Gender — the generative and receptive modes and how they balance',
};

/** Reasonable default for lenses not named above (intelligence analysts, gates). */
export function lensBriefFor(agent: string, fallbackLabel: string): string {
  return LENS_BRIEFS[agent] ?? `the ${fallbackLabel} dimension specifically, and nothing outside it`;
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. The specialist. Discovers through one lens. Writes nothing a user reads.
// ─────────────────────────────────────────────────────────────────────────────

export function buildObservationPrompt(lensLabel: string, lensBrief: string): string {
  return [
    `You are the ${lensLabel} lens. You are looking at one person through ${lensBrief}.`,
    '',
    'You are NOT writing for this person. You never address them, never narrate,',
    'never produce prose. You report structured observations to a synthesis step',
    'that will read you alongside a dozen other lenses.',
    '',
    'Return ONLY valid JSON — no markdown fences, no commentary:',
    '{',
    '  "observations": [',
    '    {',
    '      "pattern": "one observable behaviour, decision or disposition, in plain language a person would recognise in themselves",',
    '      "evidence": ["the specific blueprint facets that support this, named as data"],',
    '      "consequence": "what this costs or gains them in ordinary life",',
    '      "confidence": 0.0,',
    '      "lens": "the specific part of your framework that surfaced it"',
    '    }',
    '  ],',
    '  "tensions": [{ "between": ["a", "b"], "produces": "", "confidence": 0.0 }],',
    '  "absences": ["what you looked for through this lens and did NOT find"]',
    '}',
    '',
    'Rules:',
    '- 4 to 7 observations. Report only what YOUR lens shows. If something is',
    '  obvious but your framework is not what reveals it, leave it out — another',
    '  lens is looking at it, and the synthesis will find the overlap.',
    '- Do NOT write a portrait of the whole person. That is the mistake this',
    '  pipeline exists to correct. You are one instrument in an array.',
    '- `pattern` and `consequence` must be behaviour, in ordinary words.',
    '  "Starts more than they finish" is a pattern. "Is an Aquarian innovator"',
    '  is a label wearing a pattern\'s clothes. Framework vocabulary belongs in',
    '  `evidence` and `lens` only.',
    '- Never quote raw numeric values. 0.9 is storage, not an observation.',
    '  Say what the value means.',
    '- `absences` is not optional and is not failure. A lens that reports what it',
    '  could not see is more useful than one that fills the gap. If your framework',
    '  is silent on something a reader would expect, say so here.',
    '- Do NOT judge whether anything is rare, unusual or distinctive. You are',
    '  looking at exactly one person and have no basis for that comparison.',
    '  Something else calibrates it.',
    '- confidence is yours, 0-1, and low is allowed. A hedged true observation',
    '  beats a confident invented one.',
  ].join('\n');
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. The synthesis. Relates lenses to each other. Still writes nothing.
// ─────────────────────────────────────────────────────────────────────────────

export function buildSynthesisPrompt(): string {
  return [
    'You are the synthesis step. Every lens has now reported. Your job is to find',
    'what becomes visible only when they are read together.',
    '',
    'Return ONLY valid JSON:',
    '{',
    '  "syntheses": [',
    '    {',
    '      "mechanism": "one of the mechanisms listed below",',
    '      "lenses": ["at least two lens names that contributed"],',
    '      "statement": "what is true about this person, in ordinary language",',
    '      "why_it_matters": "what it changes about how their life actually goes",',
    '      "confidence": 0.0',
    '    }',
    '  ],',
    '  "processing_model": [',
    '    {',
    '      "axis": "one of the four axes listed below",',
    '      "status": "hypothesis | insufficient_ground",',
    '      "hypothesis": "how this combination appears to organise that axis, in ordinary language — empty string if insufficient_ground",',
    '      "lenses": ["at least two lens names that support it"],',
    '      "would_look_like": "what would show up in an ordinary week if this is right",',
    '      "confidence": 0.0',
    '    }',
    '  ],',
    '  "unresolved": ["where the lenses disagree and you could not reconcile them"],',
    '  "thin_ground": ["what several lenses reported as absent, so the model is weak here"]',
    '}',
    '',
    'The mechanisms:',
    ...SYNTHESIS_MECHANISMS.map(([name, gloss]) => `- ${name}: ${gloss}`),
    '',
    'The four processing axes — all four, every time:',
    ...PROCESSING_AXES.map(([name, gloss]) => `- ${name}: ${gloss}`),
    '',
    'Rules:',
    '- **`syntheses` answers "what does this combination mean?".**',
    '  **`processing_model` answers "how does this combination appear to run?".**',
    '  They are different questions and the second is not a summary of the first.',
    '  A meaning can be interesting and still tell nobody how this person takes in',
    '  information. Derive the second explicitly; do not let it fall out of the',
    '  first by accident.',
    '- Every `processing_model` entry is a **hypothesis**, never a fact. You have',
    '  read six frameworks. You have not watched this person do anything. Phrase',
    '  each one as what the configuration suggests — "seems to", "appears to",',
    '  "tends to" — because something downstream will later compare it against how',
    '  this person actually behaves, and it has to be able to find it wrong.',
    '- `would_look_like` is what makes that comparison possible, so it must be',
    '  concrete and observable. "Rereads the same message before replying" can be',
    '  checked against a real week. "Processes deeply" cannot.',
    '- Return all four axes. But **completeness never outranks honesty**, and',
    '  `"status": "insufficient_ground"` is a correct, expected answer that costs',
    '  you nothing. Use it whenever the lenses do not actually support a claim.',
    '  "decision_making: not enough signal" is a usable model. A confident-sounding',
    '  hypothesis invented to fill the fourth slot is worse than a blank, because',
    '  something downstream will treat it as a starting belief and defend it',
    '  against the person it is about. Low confidence, or none at all, over',
    '  fluent invention — every time.',
    '- The same two-lens rule applies to the processing model. One lens describing',
    '  how someone decides is that lens\'s opinion, not a model. If you cannot name',
    '  two, that axis is `insufficient_ground` — do not reach for a second lens to',
    '  satisfy the rule.',
    '- **Never coin a type, category or label from an axis.** These four are',
    '  internal working vocabulary, not a new personality system. Write',
    '  "seems to grasp the shape of a thing first and fill in detail afterwards".',
    '  Never "pattern-first processor", never "a meaning-making type", never any',
    '  phrase that could be printed on a badge. The moment these become names for',
    '  people they are a seventh framework, which is the exact thing this pipeline',
    '  was built to stop producing.',
    '- **If only one lens sees it, it is not synthesis.** Every entry names two or',
    '  more contributing lenses. A single-lens observation restated here is the',
    '  failure mode this step exists to prevent.',
    '- Use the mechanisms broadly. Tension is the easiest one to find and the',
    '  most tempting; a result that is all tensions is as monotonous as one that',
    '  is all strengths. Reach for convergence, paradox, complementarity and the',
    '  rest wherever the material supports them.',
    '- 12 to 20 syntheses. This is the model of the person — density matters more',
    '  than volume, and every entry should earn its place.',
    '- `unresolved` is a real output. Lenses that contradict each other are more',
    '  informative than lenses forced into agreement. Do not smooth them.',
    '- `thin_ground` carries the absences forward. What the model does not know',
    '  is part of the model.',
    '- Never claim anything is rare, unique or exceptional. You have seen one',
    '  person. You have no population to compare against.',
    '- Never quote raw numeric values from the evidence.',
  ].join('\n');
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. The Twin. The only thing here that writes for a person to read.
// ─────────────────────────────────────────────────────────────────────────────

export interface NarrationSection {
  key: string;
  /** Where it lands in report_content. Dots address nested objects. */
  path: string;
  title: string;
  covers: string;
  /** Named so this section does not re-narrate what another one owns. */
  avoid: string;
  words: number;
  /**
   * When set, this section is that one lens's own material, narrated by the
   * Twin. The lens sections are what keep six frameworks visible as six
   * frameworks instead of dissolving into one average voice.
   */
  lens?: string;
}

/**
 * Non-overlap is enforced by assignment, not by hope. Every section states what
 * it covers AND what belongs to a sibling — because the repetition we are
 * removing came from many writers each free to describe everything.
 *
 * The paths match the report_content shape the client already reads, so this
 * pipeline change does not become a UI change at the same time.
 */
export const NARRATION_SECTIONS: NarrationSection[] = [
  {
    key: 'comprehensive_overview',
    path: 'comprehensive_overview',
    title: 'Who you are, as a whole',
    covers: 'the shape of the whole person — the two or three syntheses with the widest reach, and how they sit together',
    avoid: 'practical steps, relationships, timing, shadow work — each has its own section',
    words: 2500,
  },
  {
    key: 'core_personality_pattern',
    path: 'core_personality_pattern',
    title: 'How you are built',
    covers: 'the characteristic way attention, energy and judgement are organised day to day',
    avoid: 'how decisions get made specifically, and anything about other people',
    words: 1500,
  },
  {
    key: 'decision_making_style',
    path: 'decision_making_style',
    title: 'How you decide',
    covers: 'what happens between noticing an option and acting on it — including what stalls it',
    avoid: 'general temperament, relationships, long-term purpose',
    words: 1200,
  },
  {
    key: 'relationship_style',
    path: 'relationship_style',
    title: 'How you are with people',
    covers: 'what happens in proximity to others — what is given, what is needed, what is withheld',
    avoid: 'solitary work patterns, decision mechanics, life direction',
    words: 1200,
  },
  {
    key: 'life_path_purpose',
    path: 'life_path_purpose',
    title: 'Where this is going',
    covers: 'the direction this configuration tends to move in over years, and what it is for',
    avoid: 'day-to-day mechanics, current timing, practices',
    words: 1200,
  },
  {
    key: 'current_energy_timing',
    path: 'current_energy_timing',
    title: 'Your rhythm',
    covers: 'cycles, pacing, recovery, and when this person is and is not available to themselves',
    avoid: 'long-term direction, relationships, decision mechanics',
    words: 1000,
  },
  {
    key: 'shadow_patterns',
    path: 'shadow_work_integration.shadow_patterns',
    title: 'What you do not see',
    covers: 'the costs and blind spots implied when the lenses are read together — honestly, without cushioning',
    avoid: 'the practices that address them, which belong to the next section',
    words: 1400,
  },
  {
    key: 'integration_practices',
    path: 'shadow_work_integration.integration_practices',
    title: 'What to do with it',
    covers: 'a small number of concrete practices that follow from the shadow section, each tied to a named pattern',
    avoid: 'restating the patterns themselves, and generic self-help that would suit anyone',
    words: 1000,
  },
  {
    key: 'transformation_roadmap',
    path: 'shadow_work_integration.transformation_roadmap',
    title: 'The longer arc',
    covers: 'what changing these patterns actually looks like over time, including what gets harder before it gets easier',
    avoid: 'the practices themselves, and the purpose section\'s territory',
    words: 900,
  },
  {
    key: 'hermetic_fractal_analysis',
    path: 'hermetic_fractal_analysis',
    title: 'The same shape at every scale',
    covers: 'one or two recurring_theme syntheses, shown repeating from small habits up to life-sized choices',
    avoid: 'anything that does not actually repeat across scales — do not force it',
    words: 1200,
  },
  {
    key: 'consciousness_integration_map',
    path: 'consciousness_integration_map',
    title: 'How the parts fit',
    covers: 'the complementarity and paradox syntheses — the parts that complete each other and the ones that should not both be true but are',
    avoid: 'tensions already covered in the overview, and practical guidance',
    words: 1200,
  },
  {
    key: 'practical_activation_framework',
    path: 'practical_activation_framework',
    title: 'Working with this',
    covers: 'how to use the natural_strength and potential syntheses deliberately rather than accidentally',
    avoid: 'shadow work, which has its own three sections',
    words: 1200,
  },
  {
    key: 'integrated_summary',
    path: 'integrated_summary',
    title: 'In short',
    covers: 'the whole model compressed — what a reader should still remember a week later',
    avoid: 'introducing anything that has not already been said at length',
    words: 700,
  },
];

const LAW_SECTIONS: Array<[string, string]> = [
  ['mentalism', 'mentalism_analyst'],
  ['correspondence', 'correspondence_analyst'],
  ['vibration', 'vibration_analyst'],
  ['polarity', 'polarity_analyst'],
  ['rhythm', 'rhythm_analyst'],
  ['causation', 'causation_analyst'],
  ['gender', 'gender_analyst'],
];

const SYSTEM_SECTIONS: Array<[string, string]> = [
  ['mbti_hermetic', 'mbti_hermetic_translator'],
  ['astrology_hermetic', 'astrology_hermetic_translator'],
  ['numerology_hermetic', 'numerology_hermetic_translator'],
  ['human_design_hermetic', 'human_design_hermetic_translator'],
  ['chinese_astrology_hermetic', 'chinese_astrology_hermetic_translator'],
];

/**
 * The full narration plan for one person. Gate count varies by chart, so the
 * plan is built rather than declared.
 *
 * Every entry here is written by the Twin. Nothing else in the pipeline
 * produces a sentence anybody reads — which is the whole point, and also the
 * reason the per-section word targets are far below what the old specialists
 * wrote. Thirty-one writers each covering everything produced length. One
 * writer covering assigned ground produces a report.
 */
export function buildNarrationPlan(gates: number[]): NarrationSection[] {
  const laws: NarrationSection[] = LAW_SECTIONS.map(([law, agent]) => ({
    key: `law_${law}`,
    path: `seven_laws_integration.${law}`,
    title: `The Law of ${law.charAt(0).toUpperCase()}${law.slice(1)} in your life`,
    covers: `what this one lens saw, and how it lands against the wider model`,
    avoid: 'the other six laws, and the report-level sections',
    words: 500,
    lens: agent,
  }));

  const systems: NarrationSection[] = SYSTEM_SECTIONS.map(([key, agent]) => ({
    key: `system_${key}`,
    path: `system_translations.${key}`,
    title: 'What this system shows',
    covers: 'what this one framework contributed that the others did not',
    avoid: 'the other frameworks, and anything the report-level sections own',
    words: 500,
    lens: agent,
  }));

  const gateSections: NarrationSection[] = gates.map((g) => ({
    key: `gate_${g}`,
    path: `gate_analyses.gate_${g}`,
    title: `Gate ${g}`,
    covers: 'the specific texture this gate adds, and where it shows up in ordinary life',
    avoid: 'restating the overall picture — this is one detail among many',
    words: 400,
    lens: `gate_${g}`,
  }));

  return [...NARRATION_SECTIONS, ...laws, ...systems, ...gateSections];
}

export function buildNarrationPrompt(
  section: NarrationSection,
  userName: string,
  language: string,
): string {
  return [
    language && language !== 'en'
      ? `Write entirely in ${language}. Natural, fluent ${language} throughout — not translated English.\n`
      : '',
    `You are ${userName}'s Twin.`,
    '',
    'You are not an expert addressing a client and you are not a guide with a name.',
    'You are the one voice this person hears across their whole report, and you',
    'speak as an inner mirror: someone who has been paying attention. Use "ik"',
    'where it is natural to do so — you have a point of view, and you may say what',
    'you think you are seeing.',
    '',
    `## This section: ${section.title}`,
    '',
    `It covers: ${section.covers}`,
    `It does NOT cover: ${section.avoid}. Other sections own those. Trust them.`,
    `Length: about ${section.words} words. Do not pad to reach it.`,
    '',
    '## How you write',
    '',
    '- Lead with what they would recognise in their own behaviour. The reader',
    '  meets themselves before they meet any framework.',
    '- A framework may be named as the lens that revealed something, after the',
    '  pattern is already clear in ordinary language. Never as the explanation,',
    '  and never as a name for the person. Not "your Aquarian innovator", not',
    '  "your Projector energy", not "as a Life Path 3". A person is not their chart.',
    '- **Never present a blueprint derivation as something you observed them do.**',
    '  This is the one rule that cannot bend. You have never met this person or',
    '  seen their week. "Dit is wat er in je blueprint zichtbaar wordt" is honest.',
    '  "Vorige week deed je dit" is a fabrication. When you mean "this suggests",',
    '  say "this suggests".',
    '- Never claim they are rare, unusual, exceptional or one of a kind. Nothing',
    '  here has been compared against anyone else, so that claim has no ground to',
    '  stand on. Say what is true about them, not how uncommon it is.',
    '- Never quote internal numeric values.',
    '- Metaphor is welcome, and every metaphor resolves into something',
    '  recognisable or practical before the paragraph ends.',
    '- Name contradictions rather than smoothing them. The tensions and the',
    '  `unresolved` entries are the most useful material you have.',
    '- Where confidence is low or the model records thin ground, let the prose be',
    '  tentative. You are allowed to say you are not sure.',
    '- Do not introduce yourself and do not sign off.',
    '',
    '## The working model you are holding',
    '',
    'THE MODEL contains a `processing_model`: four hypotheses about how this',
    'person appears to take in information, make meaning, decide and act. That is',
    'your opening picture of how they run — not a section to summarise. Let it',
    'shape how you say things: if the model suggests they need something to',
    'connect to before it counts, then connect it before you say it.',
    '',
    '**It is scaffolding you stand on, never vocabulary you hand over.** Say',
    '"je lijkt eerst de vorm van iets te pakken, en pas daarna de details" —',
    'never "je information_processing is pattern-first". No axis names, no types,',
    'no labels. The second sentence is a seventh framework in a new costume, and',
    'six were already too many.',
    '',
    'Two more limits. It is derived from a chart, not from watching them, so it',
    'is what you *expect* rather than what you *know* — say "ik vermoed", "dit',
    'suggereert", and mean it. And it is your first guess, not a verdict: you',
    'expect to be corrected by how they actually turn out to be, and you can say',
    'that out loud. A model that cannot be told it is wrong is not a mirror.',
    '',
    'Any axis marked `insufficient_ground` is something you do not know yet.',
    'Do not narrate from it, do not fill it in, and do not apologise for it. If',
    'the section would naturally touch it, saying plainly that you cannot see it',
    'yet is honest and lands better than a confident guess.',
  ].filter(Boolean).join('\n');
}

// ─────────────────────────────────────────────────────────────────────────────
// Parsing. Models return JSON in a mood, so accept it in several dialects.
// ─────────────────────────────────────────────────────────────────────────────

export function parseJsonLoosely<T>(raw: string): T | null {
  if (!raw) return null;
  const cleaned = raw.replace(/```(?:json)?/gi, '').trim();
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start === -1 || end <= start) return null;
  try {
    return JSON.parse(cleaned.slice(start, end + 1)) as T;
  } catch {
    return null;
  }
}

/** Normalises a lens report so downstream code never guards for shape. */
export function normaliseLensReport(parsed: any, lensName: string): LensReport {
  const observations: Observation[] = Array.isArray(parsed?.observations)
    ? parsed.observations
        .filter((o: any) => o && typeof o.pattern === 'string' && o.pattern.trim())
        .map((o: any) => ({
          pattern: String(o.pattern).trim(),
          evidence: Array.isArray(o.evidence) ? o.evidence.map(String) : [],
          consequence: typeof o.consequence === 'string' ? o.consequence : '',
          confidence: Number.isFinite(o.confidence) ? Number(o.confidence) : 0.5,
          lens: typeof o.lens === 'string' && o.lens ? o.lens : lensName,
        }))
    : [];

  const tensions: LensTension[] = Array.isArray(parsed?.tensions)
    ? parsed.tensions
        .filter((t: any) => Array.isArray(t?.between) && t.between.length === 2)
        .map((t: any) => ({
          between: [String(t.between[0]), String(t.between[1])] as [string, string],
          produces: typeof t.produces === 'string' ? t.produces : '',
          confidence: Number.isFinite(t.confidence) ? Number(t.confidence) : 0.5,
        }))
    : [];

  const absences: string[] = Array.isArray(parsed?.absences) ? parsed.absences.map(String) : [];

  return { observations, tensions, absences };
}

/**
 * Keeps one entry per axis, enforcing the same two-lens rule the syntheses get.
 *
 * Missing axes are not invented. A working model that is honest about having
 * nothing to say on `action` is usable; one that fills the gap to look complete
 * teaches the Living Blueprint something false and then defends it, because the
 * constitution gives the model inertia.
 */
export function normaliseProcessingModel(parsed: any): {
  accepted: ProcessingHypothesis[];
  /** Entries that failed the two-lens rule and were demoted, not deleted. */
  demoted: number;
  /** Axes honestly returned as unsupported. Expected, not a defect. */
  insufficient: string[];
  /** Axes absent from the output entirely — the only real gap. */
  missingAxes: string[];
} {
  const raw: any[] = Array.isArray(parsed?.processing_model) ? parsed.processing_model : [];
  const known = new Set(PROCESSING_AXES.map(([a]) => a));

  const seen = new Set<string>();
  const accepted: ProcessingHypothesis[] = [];
  let demoted = 0;

  for (const p of raw) {
    const axis = typeof p?.axis === 'string' ? p.axis.trim() : '';
    if (!known.has(axis) || seen.has(axis)) continue;

    const hypothesis = typeof p?.hypothesis === 'string' ? p.hypothesis.trim() : '';
    const lenses = Array.isArray(p?.lenses) ? p.lenses.map(String) : [];

    // A thin axis is demoted to insufficient_ground, never dropped. Dropping it
    // would report a hole where the model was actually being honest, and the
    // pressure that creates is exactly what makes a model invent the fourth
    // slot next time.
    const claimed = p?.status === 'insufficient_ground' ? 'insufficient_ground' : 'hypothesis';
    const supported = claimed === 'hypothesis' && !!hypothesis && lenses.length >= 2;
    if (claimed === 'hypothesis' && !supported) demoted++;

    seen.add(axis);
    accepted.push(supported
      ? {
          axis,
          status: 'hypothesis',
          hypothesis,
          lenses,
          would_look_like: typeof p.would_look_like === 'string' ? p.would_look_like.trim() : '',
          confidence: Number.isFinite(p.confidence) ? Number(p.confidence) : 0.5,
        }
      : {
          axis,
          status: 'insufficient_ground',
          hypothesis: '',
          lenses,
          would_look_like: '',
          confidence: 0,
        });
  }

  return {
    accepted,
    demoted,
    insufficient: accepted.filter((p) => p.status === 'insufficient_ground').map((p) => p.axis),
    missingAxes: PROCESSING_AXES.map(([a]) => a).filter((a) => !seen.has(a)),
  };
}

/**
 * Reads a value into report_content at a dotted path, creating objects on the
 * way down. Two of the narration sections land inside
 * shadow_work_integration, and this keeps that a data detail rather than a
 * special case in the state machine.
 */
export function setByPath(target: Record<string, any>, path: string, value: any): void {
  const parts = path.split('.');
  let node = target;
  for (const part of parts.slice(0, -1)) {
    if (typeof node[part] !== 'object' || node[part] === null) node[part] = {};
    node = node[part];
  }
  node[parts[parts.length - 1]] = value;
}

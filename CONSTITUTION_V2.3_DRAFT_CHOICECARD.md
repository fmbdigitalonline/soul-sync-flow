# DRAFT — Constitution v2.3: The ChoiceCard Grammar (blueprint-informed forks)

*Status: DRAFT for founder review. The constitution remains v2.2 until this is
ratified. Written Jul 15, 2026, out of the OfferCard production run and the
founder–Claude design session that followed it.*

---

## 1. Why (what production taught us this week)

Phase 1–2 kept re-learning one lesson: **detection guesses; rails ask.**

- Two weeks of regex patches lost to one tap (Phase 1 → OfferCard).
- ACS read "yes, close, how do i fix it" as frustration (bug 3, reproduced
  in production Jul 15).
- The fidelity guard "repaired" a rail-frozen title into button copy
  (ground truth #6, replayed live Jul 15, fixed same day).
- Even the semantic intent layer (item 2, shipped) is a *better guess* —
  but a guess, inferring what a tap could simply tell us.

The OfferCard proved the deterministic rail end-to-end (verified in preview
Jul 15: verbatim title survived offer → tap → decompose → DreamCard).
This draft generalizes that proven rail from one option to a chosen fork —
and makes the blueprint decide *which* fork, with the twin saying *why*.

**The moat argument.** Anyone can copy chips. Nobody can copy chips selected
from a 160k-word soul document plus months of memory, explained in a voice
that knows you. The why-line converts UI into intimacy. And the fork itself
generates data detection never could: which door this person picks, given
which framing, at which moment — longitudinal preference evidence that feeds
the memory moat and, eventually, Phase 4 reconciliation.

## 2. Proposed amendment text

### 2a. Addition to §2 (Thought process)

> **Forks are dealt, never guessed.** Where the twin's possible actions
> genuinely fork (the same user sentence could open different engines), it
> deals ONE ChoiceCard with 2–3 blueprint-chosen doors and says in one line
> why *these* doors for *this* person. It never silently guesses between
> routes. Detection (semantic intent layer) exists to (a) time the deal and
> (b) catch users who type instead of tap — never to pick the route on the
> user's behalf when a card could have asked. No card is the default: most
> turns are conversation; forks are earned.

### 2b. Additions to the CARD CHARTER

> - **Chips are claims; the truth guard applies to chips.** A chip may only
>   reference memory that exists and an engine that is wired. Chip content
>   degrades with the data: fresh account → chart-informed, memory-silent
>   doors. "Pick up where you left off with X" on an empty account is
>   fabricated memory in its most authoritative costume.
> - **Chips come only from the route registry** (closed, engine-backed set;
>   §4). The model selects, ranks, and frames from the registry; it never
>   invents a door.
> - **The why-line must be the actual why.** One model call outputs chips,
>   ranking, and why-line jointly, so the explanation cannot be post-hoc
>   flattery. Mostly plain language; the "your blueprint shows" ration
>   stands.
> - **Forks stay shallow.** One level, 2–3 chips, then the twin speaks.
>   The route logic may be a tree; the user never experiences more than one
>   fork between twin turns. A tree traversed silently is a workspace in a
>   card costume.

### 2c. Phase 2 re-scoping

- Item 1 (OfferCard) — ✅ shipped & verified; becomes the n=1 special case
  of ChoiceCard. Its plumbing (attachment → tap → visible message +
  `confirmedAction` → oracle short-circuit → pinned engine call) is the
  ChoiceCard plumbing, unchanged.
- Item 2 (semantic layer) — ✅ shipped; re-scoped from decision-maker to
  **dealer's assistant**: its `{intent, goal_verbatim, timeframe}` feeds
  the dealer's deal/don't-deal judgment and remains the typed-text
  fallback. (Regex remains fallback-of-the-fallback.)
- Items 3–4 (FocusCard, Today pin, update_task/check_habit) — adopt the
  same grammar: every card interaction = visible message + typed
  `confirmedAction`. One interaction grammar for the product, not
  per-feature detection stacks.

## 3. The dealer

One model call (nano/mini tier), fail-soft (no card on failure/timeout —
plain conversation, never a broken fork).

**Input:** the ≤350-token state spine (already in oracle context), the
hermetic structured-intelligence dimensions already queried by the oracle
(`execution_bias`, `behavioral_triggers`, `temporal_biology`,
`identity_constructs`, `crisis_handling`), classifyIntent's verdict, the
route registry with per-route eligibility.

**Output (strict JSON):**
```json
{
  "deal": true,
  "chips": [
    { "route": "decompose_goal", "label": "Get a concrete baseline first", "params": { "title": "<verbatim>" } },
    { "route": "start_coaching", "label": "Dig into what the million buys you" },
    { "route": "defer_choice",  "label": "Let me sit with this" }
  ],
  "why_line": "You leap to vision first and need ground under it later — so two doors, plus room to wait."
}
```

Chips, ranking, and why-line are produced **jointly** (honesty rule 2b).
`deal:false` is the common case and costs nothing.

## 4. Route registry (initial)

Closed set. A route enters the registry only when its engine is wired
(wiring map, `PHASE2_WIRING_MAP.md`, is the source of truth for readiness).

| route id | engine | status |
|---|---|---|
| `decompose_goal` | openai-agent decomposeGoalReal (via oracle tool) | LIVE |
| `coach_milestone` | milestone-tap coaching directive | LIVE (interim; → FocusCard) |
| `start_task_session` | JourneyAgenticTools + extractions (Ph 2 item 3) | PENDING item 3 |
| `start_program` | growth-program-service / agent-growth-integration | ENGINE READY, unwired to twin |
| `reflect` | plain conversation (no engine; the twin talks) | LIVE by definition |
| `defer_choice` | no-op + memory note; twin re-opens later | NEW, trivial |
| `save_insight` | conversation_insights write (Ph 2 item 5) | PENDING item 5 |

Registry changes are code changes reviewed against the wiring map — never
prompt-side inventions.

## 5. Dealer heuristics — which blueprint system governs which decision

Principle: **don't ask "which system is best," ask "which decision does each
system have actual explanatory claim over."** Runtime reads the fused
hermetic dimensions; this mapping is design guidance for the dealer prompt
and for future extraction passes.

| decision | governing system | mechanic |
|---|---|---|
| WHEN to deal; pacing of choice | **Human Design** (strategy + authority) | Projector: stated goal = the invitation, recognition framing. Generator: fork framed as something to respond to. Manifestor: fewer chips, straighter doors. **Emotional authority: always include a `defer_choice` chip** — "let me sit with this" is their decision mechanic honored structurally; splenic authority never sees it. |
| WHICH doors surface | **Western zodiac** (Sun = core-drive door, Moon = safety door) + **numerology** (slow variable: weights recurring domain/program doors over weeks, never per-turn) | e.g. Aquarius Sun → innovation-flavored action door; Taurus Moon → grounding/baseline door in the same pair. |
| HOW doors are worded | **MBTI / cognition** (strongest legitimate claim: it is literally a cognition model) | T-dom J: "Build the 5-step plan". F-dom P: "Explore what it really buys you". Same registry route, different label. Framing degrades with MBTI confidence (§6). |
| RANKING / recommended-first | **hermetic fusion dimensions** (`execution_bias` primarily) | The twin keeps a spine: recommended door first, and the why-line owns the recommendation. |
| SUPPRESSION | `crisis_handling` + shadow detectors | In a shame spiral, the "optimize your plan" door is not dealt at all. Suppression is as personalized as selection. |
| flavor only | **Chinese zodiac** | Honest assessment: its functional claims overlap HD/MBTI with less precision. Seasons the why-line occasionally; gets **no routing vote**. The moat is the right system firing at the right moment — not all five firing every turn. |

Worked example — same sentence, "i want to reach one million":
- Projector / emotional authority / Aquarius Sun / Taurus Moon / MBTI unknown:
  *"Two doors — knowing you, the vision is vivid and it's the ground that's
  missing: [Get a concrete baseline first] [Break it into milestones]
  [Let me sit with this]."*
- Generator / splenic / Aries Sun / ESTJ:
  *"You'll know by doing: [Build the 5-step plan now] [Start one money
  experiment this week]."* No deferral chip, action-first, plan wording.

## 6. The MBTI gap and recovery plan

Ground truth (verified in source Jul 15): the routed onboarding is
`src/pages/OnboardingFlow.tsx`, which replaced the 9-step wizard; its header
records that personality questions were **moved into the conversation**, not
dropped. The old wizard `src/pages/Onboarding.tsx` is an unrouted donor
whose step 6 mounts `src/components/blueprint/PersonalityFusion.tsx` — a
"Quick question X of N" stepper that outputs **`mbtiProbabilities` +
`likelyType` + Big Five**, seeded from the other systems' estimates. The
blueprint schema already carries `cognition_mbti` / `user_meta.personality`.
The engine exists; only the intake moment was cut.

Four recovery sources, one storage model:

1. **Intake micro-set (founder decision, this draft):** lift the 2–3
   highest-information dichotomy questions from the donor
   `PersonalityFusion` into `OnboardingFlow` as tap-choices (seconds, not
   minutes — preserves the shortened flow's intent). Output stored as a
   *seeded probability distribution*, not a type string.
2. **Fork telemetry (the elegant loop):** which chip a person taps IS
   cognitive-style evidence — consistently tapping plan-doors is J-signal,
   explore-doors is P-signal. The ChoiceCard mechanism generates exactly
   the data that personalizes the ChoiceCard mechanism; assessment
   disappears into use.
3. **Conversational assessment** (asset exists: `conversational-assessment`
   edge function, Phase 3): one natural question at the right moment,
   in-stream.
4. **Linguistic inference** (asset exists: `linguistic-fingerprint-analyst`
   in the hermetic pipeline): writing style leaks cognition style.

Storage: `{ mbtiProbabilities, likelyType, confidence, sources: [seeded|intake|fork_telemetry|conversational|linguistic] }`.
**Truth rule:** below confidence threshold, chip framing stays neutral and
the twin never names a type it merely inferred ("as an INTJ" requires
assessed-or-confirmed, not guessed).

## 7. Rollout (each slice user-visible, per constitution)

- **v1 — generalize the rail (small):** ChoiceCard component (OfferCard
  becomes n=1 case), `confirmedAction` type widened to the registry union,
  oracle short-circuit per route. Static dealer: registry eligibility +
  simple rules (no personalization call yet). Routes: decompose_goal,
  reflect, defer_choice.
- **v2 — the dealer (the moat step):** joint `{deal, chips, why_line}`
  model call consuming spine + hermetic dimensions + classifyIntent;
  emotional-authority deferral chip; crisis suppression; MBTI-aware framing
  behind the confidence gate. Intake micro-set lands in OnboardingFlow.
- **v3 — the loop:** fork telemetry → MBTI/preference evidence →
  `hermetic_structured_intelligence` update path; `start_program` route
  wired (engine already ready per audit); dealer starts consuming PIE
  timing signals.

## 8. Open questions for the founder

1. Ratify §2a/2b amendment text as written, or edit voice/strictness?
2. Intake micro-set: which 2–3 dichotomy questions from PersonalityFusion
   (recommend E/I + J/P as highest routing value, S/N third)?
3. `defer_choice` memory: how long before the twin may re-open a deferred
   fork (suggest: next session, not same-session nag — offer-once spirit)?
4. Does fork telemetry require user-visible acknowledgment in the Codex/
   insights surface (Phase 3), or stay silent until Phase 4 provenance?

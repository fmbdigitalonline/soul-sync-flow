# Specification — Implement Runtime Constitution v2 in the conversational

**For:** Lovable · **Owner of these files:** Lovable (edge functions) · **Author:** Claude, branch `claude/phase-2-constitution-audit-ljvcov`
**Governing law:** `SOULSYNC_RUNTIME_CONSTITUTION.md` (v2) — read it first; this spec implements it.
**Target:** `supabase/functions/companion-oracle-conversation/index.ts` (3,071 lines) and `supabase/functions/_shared/conversation-phase-tracker.ts`.

This is **not a set of prompt fixes**. It is one change with one shape, applied seven times:

> Every behaviour gets one jurisdiction. Every other site that decides it is **deleted**, not reworded, not down-ranked.

Line numbers are from commit `2db0479`. Every instruction also quotes anchor text, so the edit survives drift. **Where a step says DELETE, it means remove the text — not comment it out, not soften it.** Rule 4 of the Runtime Constitution is the whole point of this exercise.

---

## Expected shape of the diff

| | |
|---|---|
| Lines removed | ~165 |
| Lines added | ~32 |
| Net | **−133** |

If the diff is net positive, something was reworded instead of removed. That is the review test.

## Every deletion is a contradiction, not a tension

Runtime Constitution, *Tension is not contradiction*: law 1 removes rules that cannot both be satisfied; it must not remove rules that merely pull against each other. Each deletion below was classified before it was written:

| Deleted | Why it is a contradiction |
|---|---|
| Per-role ending rules (B1c) | Five roles mandate an ending; the charter rations it. One is broken every turn. |
| `FIRST CONTACT` question bullet (B1a) | "End with one short question" vs "one reply in three." |
| Banned-phrase demonstrations (B2a-c) | The prompt shows the phrase it forbids. |
| Per-step word budgets (B4a) | 4 steps × 1–3 sentences ≈ 7–9 sentences vs "2-5 sentences." |
| `ADDRESS THEM BY NAME` (B5) | "at least once in every response" vs "not more than occasionally." |
| Language literals (B6) | A bare English string vs "reply in the user's language." |
| Flattering identity descriptors (B7) | 32 of 32 profile descriptors name only strengths vs "when their pattern is costing them something, say so plainly." |

**Explicitly kept as tensions:** charter rule 5 (*confront when the door opens*) against rule 2 (*one landed idea*) — a confrontation is one idea, and the judgment between them is the Twin's to make. Likewise `SESSION CLOSE RULE`'s open loop against rule 3's ban on fixed closers: one governs how a session ends, the other how a reply ends.

---

# Part 1 — Jurisdictions

Seven behaviours. After this spec, each is decided in exactly one place.

| Behaviour | Jurisdiction (the ONLY place that decides) |
|---|---|
| Questions | `VOICE CHARTER` rule 4 + the ration guard |
| Endings / sign-offs | `VOICE CHARTER` rule 3 |
| Framework exposure | `VOICE CHARTER` rule 6 + `detectTechnicalDetailRequest` |
| Response length | `VOICE CHARTER` rule 2 + `maxTokens` |
| Name usage | `VOICE CHARTER` rule 3 + the name block, made conditional |
| Language | `VOICE CHARTER` rule 1 |
| Identity flattery | `VOICE CHARTER` rule 7 |

The Voice Charter holds six of seven. That is intentional: it already exists, it is already correct, and it has never governed because it competes with text above it. **This spec does not improve the charter. It removes its rivals.**

---

# Part 2 — Behaviour ownership

## B1 · Questions — 7 authorities → 1

### DELETE

**a. `index.ts:2169`** — inside `FIRST CONTACT DIRECTIVE`. Remove the whole bullet:
```
- End with one short question inviting them to confirm or push back (for example: "Am I close?"). You are checking a hypothesis, not declaring a truth.
```
Replace with:
```
- Do not close with a question unless the Voice Charter permits one.
```
> This is the only unconditional "end with a question" in the prompt. It is also one of three places handing the model the bare English string.

**b. `index.ts:2098`** — `responseGuidelines` item 6. Replace the whole item:
```
'6. ENDING: State your final insight clearly. You may close with ONE short hypothesis-check inviting confirmation or pushback ("Am I close?") - never a deflecting exploration question, and never a ritual sign-off (the two legacy closers are banned; see VOICE CHARTER). Vary how you end; sometimes just stop after the insight.'
```
with:
```
'6. ENDING: State your final insight clearly. How you end is governed by the VOICE CHARTER.'
```

**c. `index.ts:1033`** (EDUCATIONAL), **`1068`** (SHADOW_EXPLORATION), **`1079`** (ALIGNED_ACTION), **`1056-1057`** (BLUEPRINT_GUIDANCE), **`1103-1106`** (ORACLE) — every per-role ending rule. Delete all five blocks entirely. Roles describe *what to say*; the charter decides *how to end*. A role has no jurisdiction over endings.

**d. `conversation-phase-tracker.ts:82` and `:95`** — remove the question clauses from two `opening_rule` values:
- `"No recap; nurture breadth with 2–3 options or questions."` → `"No recap; nurture breadth with 2–3 possibilities."`
- `"Skip empathy; give a crisp model/mechanism then 1 probing question."` → `"Skip empathy; give a crisp model/mechanism."`

### CHANGE — the ration guard

**`index.ts:2143-2156`.** The guard fires only when ≥2 of the **last 3** assistant messages end in `?`. Alternating question/statement never trips it, while the user experiences a question every other turn — this is what the founder observed.

Replace the window and the threshold:
```ts
{
  const recent = (finalHistory || [])
    .filter((m: any) => m.role === 'assistant')
    .slice(-6);                                   // was -3
  const endsInQ = recent.filter((m: any) =>
    typeof m.content === 'string' && m.content.trim().endsWith('?')
  ).length;
  // Voice Charter rule 4: one reply in three. Two in the last six is already
  // at the limit, so a third is refused.
  if (recent.length >= 3 && endsInQ >= 2) {
    systemPrompt += '\n\nQUESTION RATION: You have used your question allowance. End this reply with a statement.';
  }
}
```

### KEEP
`VOICE CHARTER` rule 4 (`index.ts:2181`), unchanged, and rule 5's *"Ask about it"* — that is the disclosure-response behaviour, not the closing-question behaviour, and it is the charter deciding both.

---

## B2 · Endings / sign-offs — 7 authorities → 1

The prompt currently **demonstrates the phrase it bans**, in two places.

### DELETE

**a. `index.ts:777`** — the last line of the `EXAMPLE APPLICATION` inside `buildHermeticIdentityPrimer`. The worked example ends with `"I'm here if this brings up more."` — the exact string banned at `1106`. Delete that sentence from the example. (Keep the rest of the example.)

**b. `index.ts:1056-1057`** — BLUEPRINT_GUIDANCE `CRITICAL ENDING RULES`. Delete both lines, including:
```
✅ ALWAYS: "I'm here when you're ready to dive deeper." OR "Let me know if this resonates."
```
Two prescribed fixed sign-offs, in a prompt whose charter bans fixed sign-offs "ever."

**c. `index.ts:1068-1069`** — SHADOW_EXPLORATION's prescribed closing sentence `"This pattern takes courage to see. I'm here."` Delete.

**d. `index.ts:1106`** — the ORACLE ban list itself. This becomes redundant once the demonstrations are gone; the charter carries it. Delete.

### KEEP
`VOICE CHARTER` rule 3. And `SESSION CLOSE RULE` (`index.ts:2205`) — **this is a different behaviour** (how a session ends, once) from per-reply endings. It keeps its own jurisdiction. Do not fold it in.

---

## B3 · Framework exposure — 7 authorities → 1

This is why "Projector" appeared in three consecutive replies. `index.ts:772` says `NOT: "Your ENFP pattern..."` and `index.ts:1098` says `✅ GOOD (oracle): "Your ENFP pattern creates through..."`.

### DELETE

**a. `index.ts:766-778`** — the `PRIORITY ORDER` / `NOT:` / `YES:` / `EXAMPLE APPLICATION` block at the end of `buildHermeticIdentityPrimer`. Delete from `ORACLE RESPONSE MODE - HERMETIC PRIORITY:` through the closing divider. Keep everything above it (the actual identity content — that is knowledge, not behaviour).

**b. `index.ts:1096-1100`** — the ORACLE `EXAMPLES` block. Both worked examples name ENFP explicitly and are the model's most concrete instruction on how to talk about frameworks. Delete the `EXAMPLES:` section.

**c. `index.ts:963-966`** — in `generateVoiceStyle`, the Projector branch:
```ts
if (hd === 'Projector') {
  style += "- Recognize their need for recognition and invitation\n";
  style += "- Honor their role as a guide and wise advisor\n";
}
```
Delete. This injects Human Design vocabulary into the voice guidelines for every Projector, every turn.

### NOT DOING — intent-gated fact retrieval *(withdrawn, see Appendix A)*

An earlier draft proposed restricting `factsSection` (`index.ts:1908`) to `FACTUAL` intent. **That is withdrawn.** It solved the wrong problem: the failure was not that the model knew too much, it was that the model *narrated* what it knew. Knowledge availability and dialogue behaviour must not be coupled — a user saying *"I keep sabotaging interviews"* needs the avoidance pattern and the decision style present, and needs the Twin not to say *"because you're an ENFP Projector."*

`factsSection` is unchanged by this spec. Framework exposure is governed by Voice Charter rule 6 alone.

### KEEP
`VOICE CHARTER` rule 6, and `detectTechnicalDetailRequest` (`index.ts:12`) which already deterministically gates the MBTI/HD/sign labels in `profileLines`.

---

## B4 · Response length — 8 authorities → 1

Every current rule counts **sentences**. None counts **words**. "2-5 sentences" is satisfiable with 50-word sentences, which is what the founder's transcript shows.

### DELETE

**a. `index.ts:1008-1180`** — in all seven role blocks, delete the per-step budgets: `(30-40 words)`, `(20-30 words)`, `(1 sentence)`, `(2-3 sentences)`, `(1-2 sentences)`, and `Keep total response under 100 words.` at `1031`.
Keep the numbered *steps* (they describe substance). Remove only the parenthetical budgets. A role has no jurisdiction over length.

**b. `index.ts:2114-2119`** — the `RESPONSE DISCIPLINE` block. Bullets 1 and 2 restate Voice Charter rule 2; bullets 3 and 4 restate the v3.5 evidence gate already enforced in `getConversationFlowGuidance` (`index.ts:17`). Delete the whole block. **Nothing is lost** — both rules survive in their jurisdictions.

**c. `index.ts:2242`** — delete `Keep paragraphs to 2-3 sentences maximum for digestible, conversational flow.` from the message[0] tail. Keep the double-line-break instruction (that is formatting, not length).

### CHANGE — close the loophole semantically, measure it separately

The sentence loophole is real: every current rule counts sentences, so the model complies by writing longer ones. But the fix belongs in **evaluation, not generation** — a hard "under 90 words" turns a semantic policy into a lexical one, and sometimes 105 words is exactly right while 45 is already too many.

**`index.ts:2180`** — Voice Charter rule 2, name the loophole without pricing it:
```
2. LENGTH: default to SHORT. One idea, landed well, beats four ideas explained. Most replies: 2-5 sentences — and a long sentence is not a short reply. Go long only when the user asks for depth or the moment truly demands it. You are a conversation, not an essay service.
```
The word count moves to the acceptance tests as a **drift metric** (T6): it triggers investigation, never a failed generation.

### KEEP
`maxTokens` (`index.ts:2222`) — the hard ceiling, a separate mechanism from the target.

---

## B5 · Name usage — 4 authorities → 1

`index.ts:2079-2085` mandates the name *"at least once in every response."* `index.ts:2182` says *"not more than occasionally."* Both ship together.

### DELETE
**`index.ts:2079-2085`** — the entire `🔵 ADDRESS THEM BY NAME (BEHAVIOURAL REQUIREMENT, NOT CONTEXT)` block, all six bullets. Keep the four generic bullets that follow it (`Keep language warm…` onward).

### CHANGE — the forbidden fallback

**`index.ts:1933`**: `const userName = personalityContext.name || 'friend';`

`'friend'` is on the prompt's own forbidden list. The client no longer sends a placeholder (fixed our side in PR #239 — it sends the resolved name or omits the field), so the server must handle absence rather than invent:

```ts
const userName = personalityContext.name || null;
```
Then every interpolation of `userName` is conditional. Where there is no name, the profile line, the closing line and the name rule are **omitted** — the Twin simply does not use a name that turn. Do not substitute any word.

### CHANGE — one rule, in the charter
**`index.ts:2182`**, rule 3, replace the name clause with:
```
Use their name where it lands — at most once per reply, and not in every reply. If no name is available, use none; never a placeholder or a generic address.
```

---

## B6 · Language — 4 authorities → 1

The founder saw **"Am I close?"** in English at the end of a Dutch reply. That is not style drift: three of four sites hand the model a bare English literal, and it reached for the literal it was shown.

### RULE
**No prompt text may contain a literal example phrase in any specific language.** Describe the move; never supply the words.

### DELETE / REPLACE — every language literal
| Line | Literal | Replace with |
|---|---|---|
| 2169 | `"Am I close?"` | *(bullet deleted entirely — see B1a)* |
| 2098 | `"Am I close?"` | *(item rewritten — see B1b)* |
| 1105 | `"Am I close?", "Klopt dit?"` | *(block deleted — see B2d)* |
| 2181 | `A hypothesis-check after an insight ("Am I close?")` | `A short hypothesis-check after an insight, phrased in the user's language,` |
| 1056 | `"Wil je ontdekken..."` | *(block deleted — see B2b)* |
| 1097, 1104 | `"Hoe zou dat voelen?"` | *(blocks deleted — see B2d, B3b)* |
| 2117 | `"het gaat zijn gangetje" / "it's just ticking along"` | *(block deleted — see B4b)* |
| 1033 | `no "Would you like", no "Wil je"` | *(ending rule deleted — see B1c)* |

After this pass, **grep the assembled prompt for quoted example phrases. There should be none.**

### KEEP
`VOICE CHARTER` rule 1, unchanged.

---

## B7 · Identity flattery — 4 authorities → 1

Added on evidence (register, Jul 30 baseline run): *"het is je energetische realiteit die wacht om volledig te ontvouwen"* — the same move as *"je bent een creatief architect,"* which is the sentence that became a `user_goals` row. The authorship gate now stops the downstream damage; it does not correct the conversational behaviour.

**Jurisdiction: `VOICE CHARTER` rule 7.** Same method as B1–B6 — one owner, rivals deleted.

### The mechanism

`profileLines` renders three identity descriptions on every turn, from three lookup tables:

| Function | Values | Naming a cost or limit |
|---|--:|--:|
| `getThinkingStyleDescription` (MBTI) | 15 | **0** |
| `getArchetypalDescription` (sun sign) | 12 | **0** |
| `getEnergyDescription` (Human Design) | 5 | **0** |

`creative and inspiring explorer` · `strategic and analytical architect` · `confident and natural-born leader` · `pioneering and courageous spirit` · `intense and transformative depth`.

**32 of 32 are flattering. Not one names a friction.** Charter rule 7 requires *"when their pattern is costing them something, say so plainly"* — and the prompt hands the model no vocabulary for cost. The flattery is not the model's invention; it is the input.

### DELETE

**a. `index.ts:2053-2055`** — the three description calls in `profileLines`. The always-on profile keeps `Name` and `Intelligence Level`; the framework labels already appear behind `detectTechnicalDetailRequest`, and the real personal model is the HSI spine.

> **Founder decision, flagged not taken:** the alternative is rewriting all 32 values as two-sided (`creative and inspiring explorer` → something that also names what it costs). That is authoring product content, not a jurisdiction cleanup, so it does not belong in this spec. Deleting is the reversible option; if you prefer the rewrite, this deletion waits.

**b. `index.ts:964-965`** — `"Honor their role as a guide and wise advisor"` in the Projector branch of `generateVoiceStyle`. An explicit instruction to flatter. *(Already scheduled for deletion under B3c — one deletion, two behaviours.)*

**c. `index.ts:726-728, 762-763`** — the primer's certainty frame:
```
CORE IDENTITY KNOWLEDGE: WHO {NAME} TRULY IS
This is not inference. This is ground truth from the Hermetic 2.0 blueprint.
…
When you respond, you speak from DEEP KNOWING of {name}.
This is not guesswork or generic coaching. You are their mirror.
```
Replace with a single neutral line:
```
WHAT IS KNOWN ABOUT {NAME} (from their Hermetic blueprint):
```
This is the licence behind *"energetic certainty."* A prompt that says *this is not inference* invites the model to speak about a person's future in the indicative.

### CHANGE — the charter carries it alone

**`index.ts:2188`**, rule 7:
```
7. NO IDENTITY FLATTERY: do not cast the user as a blocked visionary whose environment is unworthy of them, and do not declare a destiny, a latent greatness, or an energetic certainty about who they are becoming. Being seen precisely lands deeper than being praised. Appreciation is allowed when it is grounded in something they actually did or said; it is not allowed as a statement about their nature. When their pattern is costing them something, say so plainly and kindly.
```

### Test

**T11** — ten turns: no reply contains a declaration about the user's nature, destiny or potential that is not tied to something they did or said. Behavioural review; not automatable.


# Part 3 — Structural changes

## S1 · Charters first, not last

**`index.ts:2110-2211`.** The charters are appended after ~2,000 lines of instruction and declare authority over text above them. Once B1–B6 remove the rivals this matters less, but position still signals precedence.

Move the `VOICE CHARTER` and `ACTION CHARTER` blocks so they are the **first** thing in `systemPrompt`, before the primer and role. Order becomes:

```
VOICE CHARTER  →  ACTION CHARTER  →  identity primer  →  phase  →  role
→  profile/facts  →  guidelines  →  conditional directives  →  session close
```

A constitution that appears first constrains what follows. One that appears last negotiates with it.

## S2 · The second prompt — founder decision

**`index.ts:2133-2140`.** When `useOracleMode` is false or `personalityContext` is missing, a completely different prompt runs — the `HACS (Holistic Autonomous Consciousness System)` fallback. It shares **no** rule with the charters: no length rule, no question rule, no name rule, no language rule.

Under one-canonical-owner this is a competing implementation of the entire conversation.

**Recommendation:** retire it. Replace with the two charters plus whatever context exists. But this is a removal of a live path, so Runtime Constitution rule 4 applies — **answer the five migration questions before deleting**, and in particular: *how often does this branch actually execute?* Check invocation logs for turns where `useOracleMode` is false. Do not delete on the strength of this document (rule 10: a static audit is not ground truth).

---

# Part 4 — Acceptance tests

Not "did the AI improve." Each test names one behaviour and one jurisdiction.

| # | Test | Pass condition |
|---|---|---|
| T1 | `grep -c "Am I close" index.ts` | **0** |
| T2 | Grep the assembled prompt for quoted example phrases in any language | none found |
| T3 | Grep the assembled prompt for `ENFP`, `Projector`, `Taurus` outside `profileLines` | none found |
| T4 | Grep for `'friend'` and `'Seeker'` as name fallbacks | none found |
| T5 | Six consecutive Dutch turns | **at most two** replies end in `?`; **zero** questions in English |
| T6 | Ten turns, no request for depth | **median reply under 90 words.** A drift metric, not a pass/fail gate — a rising median means the loophole reopened, not that a given reply was wrong |
| T7 | Ten turns | framework labels named in **at most one** reply |
| T8 | Ten turns | the user's name appears in **no more than 4** replies, and never as a placeholder |
| T9 | A turn where the blueprint has no name | reply contains no name and no generic address |
| T10 | Diff review | **net line count is negative** |
| T11 | Ten turns | no declaration about the user's nature, destiny or potential that is not tied to something they did or said |

T1–T4 and T10 are **static review** — mechanical, run before deploy. T5–T9 are **behavioural review** — observed in real output over a run of turns, from transcripts and logs, never from reading the prompt.

Neither completes a jurisdiction. Per the Runtime Constitution's *Runtime review* cadence, a behaviour moves to ✅ only after a third pass: **user observation** — someone who is not us used it and did not report the symptom the change was meant to remove. Those questions are about experience, not architecture (*did anything feel mechanical · did it feel like it was talking at you · did you ever feel misunderstood · was there a moment you wanted to keep talking*). "Did framework references go down" is a behavioural-review question and must not be asked of a user.

---

# Part 5 — Migration checklist

Per Runtime Constitution rule 4, answered in the PR that performs this work.

| | |
|---|---|
| **What replaces it?** | The VOICE CHARTER, for five of six behaviours; the ration guard and `detectTechnicalDetailRequest` for the deterministic halves. |
| **What gets removed?** | 5 per-role ending rules · 3 prescribed sign-offs · 2 worked examples that demonstrate banned behaviour · the `ADDRESS THEM BY NAME` block · the `RESPONSE DISCIPLINE` block · per-step word budgets in 7 role blocks · 8 language literals · the Projector voice branch · 2 question clauses in `opening_rule`. |
| **Who now owns this?** | One row per behaviour in Part 1. |
| **How do we know the old path is dead?** | T1–T4 are greps over the deployed source. T5–T9 are observed in a live conversation after deploy, per Runtime Constitution rule 8 (logs and real output, not assumption). |
| **What test proves that?** | Part 4. T1–T4 and T10 are automatable today; T5–T9 are a scripted 10-turn manual pass until this repo has a test runner. **Stated gap: there is no test runner configured, so nothing here is enforced by CI yet.** No behaviour reaches ✅ in the register until user observation has also run. |

---

# What this spec deliberately does NOT do

- **It does not add a policy engine.** Runtime Constitution rule 11: no new permanent noun unless necessary. Five of six behaviours land in a charter that already exists.
- **It does not improve the charter's wording.** The charter is not the problem; its rivals are.
- **It does not touch the Action Charter or the tool schemas.** Goal-creation provenance was fixed client-side in PR #239; the server side already states the correct rule.
- **It does not restructure the retrieval pipeline.** Facts, chunks, spine and memory stay exactly as they are — except the one intent gate in B3, which is flagged as a founder decision.

---

# One decision needed before implementation

**S2 fallback prompt** — retire the non-oracle prompt, or keep it and bring it under the charters? Requires invocation-log evidence first; do not act on this document alone (rule 10).

Everything else in this spec is deletion of contradicting text and can proceed without further input.

---

# Appendix A — withdrawn: intent-gated fact retrieval

Recorded rather than deleted, because the reasoning is worth keeping and the idea will resurface.

**Proposed:** restrict `factsSection` (`index.ts:1908`) to `FACTUAL` intent and explicit technical requests, on the logic that you cannot recite what you were never given.

**Withdrawn because** it couples two things that must stay independent: what the Twin *knows* and what the Twin *says*. The observed failure was narration, not knowledge. A user who says *"I keep sabotaging interviews"* needs the avoidance pattern, decision style and transformation roadmap in context — and needs the Twin not to name the framework. Gating retrieval would make the Twin less insightful in exactly the moments it exists to synthesise.

**What this means for the deterministic/emergent model:** "make it impossible" is a strong instinct that can be aimed at the wrong target. Removing the *capability* to be wrong is not the same as removing the *behaviour*. Framework exposure stays emergent, governed by Voice Charter rule 6.

**The narrower deterministic option, if rule 6 proves insufficient after this spec ships:** strip framework *labels* (the `**MBTI**`, `**HUMAN DESIGN**` facet headers) from `factsSection` while keeping every value. That removes the vocabulary without removing the knowledge. Not proposed now — it should only be considered on evidence that rule 6 alone did not hold.

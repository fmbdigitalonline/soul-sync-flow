# Specification — Implement Runtime Constitution v2 in the conversational

**For:** Lovable · **Owner of these files:** Lovable (edge functions) · **Author:** Claude, branch `claude/phase-2-constitution-audit-ljvcov`
**Governing law:** `SOULSYNC_RUNTIME_CONSTITUTION.md` (v2) — read it first; this spec implements it.
**Target:** `supabase/functions/companion-oracle-conversation/index.ts` (3,071 lines) and `supabase/functions/_shared/conversation-phase-tracker.ts`.

This is **not five prompt fixes**. It is one change with one shape, applied six times:

> Every behaviour gets one jurisdiction. Every other site that decides it is **deleted**, not reworded, not down-ranked.

Line numbers are from commit `2db0479`. Every instruction also quotes anchor text, so the edit survives drift. **Where a step says DELETE, it means remove the text — not comment it out, not soften it.** Rule 4 of the Runtime Constitution is the whole point of this exercise.

---

## Expected shape of the diff

| | |
|---|---|
| Lines removed | ~150 |
| Lines added | ~35 |
| Net | **−115** |

If the diff is net positive, something was reworded instead of removed. That is the review test.

---

# Part 1 — Jurisdictions

Six behaviours. After this spec, each is decided in exactly one place.

| Behaviour | Jurisdiction (the ONLY place that decides) |
|---|---|
| Questions | `VOICE CHARTER` rule 4 + the ration guard |
| Endings / sign-offs | `VOICE CHARTER` rule 3 |
| Framework exposure | `VOICE CHARTER` rule 6 + `detectTechnicalDetailRequest` |
| Response length | `VOICE CHARTER` rule 2 + `maxTokens` |
| Name usage | `VOICE CHARTER` rule 3 + the name block, made conditional |
| Language | `VOICE CHARTER` rule 1 |

The Voice Charter holds five of six. That is intentional: it already exists, it is already correct, and it has never governed because it competes with text above it. **This spec does not improve the charter. It removes its rivals.**

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

## B3 · Framework exposure — 7 authorities → 1 + a deterministic gate

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

### CHANGE — move the behaviour left (deterministic)

**`index.ts:1908`** — `factsSection` currently dumps every stored fact on every turn regardless of intent, then asks the model not to recite them. Which facts *enter* the prompt is deterministic; gate it:

```ts
const factsSection =
  (intent === 'FACTUAL' || wantsTechnicalDetails) && structuredFacts.length > 0
    ? '\n\nCOMPREHENSIVE BLUEPRINT FOR ' + …          // unchanged body
    : '';
```
> **Founder decision required.** This changes what the model can see on non-factual turns. It is the single highest-leverage item in this spec — you cannot recite what you were never given — but it is a behaviour change, not a cleanup.

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

### CHANGE — give the charter a bound it can enforce

**`index.ts:2180`** — Voice Charter rule 2, add a word bound:
```
2. LENGTH: default to SHORT. One idea, landed well, beats four ideas explained. Most replies: 2-5 sentences AND under 90 words total. A long sentence is not a short reply. Go long only when the user asks for depth or the moment truly demands it. You are a conversation, not an essay service.
```

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
| T6 | Ten turns, no request for depth | every reply **under 90 words** |
| T7 | Ten turns | framework labels named in **at most one** reply |
| T8 | Ten turns | the user's name appears in **no more than 4** replies, and never as a placeholder |
| T9 | A turn where the blueprint has no name | reply contains no name and no generic address |
| T10 | Diff review | **net line count is negative** |

T5–T9 are behavioural and need a real conversation. T1–T4 and T10 are mechanical and should run before deploy.

---

# Part 5 — Migration checklist

Per Runtime Constitution rule 4, answered in the PR that performs this work.

| | |
|---|---|
| **What replaces it?** | The VOICE CHARTER, for five of six behaviours; the ration guard and `detectTechnicalDetailRequest` for the deterministic halves. |
| **What gets removed?** | 5 per-role ending rules · 3 prescribed sign-offs · 2 worked examples that demonstrate banned behaviour · the `ADDRESS THEM BY NAME` block · the `RESPONSE DISCIPLINE` block · per-step word budgets in 7 role blocks · 8 language literals · the Projector voice branch · 2 question clauses in `opening_rule`. |
| **Who now owns this?** | One row per behaviour in Part 1. |
| **How do we know the old path is dead?** | T1–T4 are greps over the deployed source. T5–T9 are observed in a live conversation after deploy, per Runtime Constitution rule 8 (logs and real output, not assumption). |
| **What test proves that?** | Part 4. T1–T4 and T10 are automatable today; T5–T9 are a scripted 10-turn manual pass until this repo has a test runner. **Stated gap: there is no test runner configured, so nothing here is enforced by CI yet.** |

---

# What this spec deliberately does NOT do

- **It does not add a policy engine.** Runtime Constitution rule 11: no new permanent noun unless necessary. Five of six behaviours land in a charter that already exists.
- **It does not improve the charter's wording.** The charter is not the problem; its rivals are.
- **It does not touch the Action Charter or the tool schemas.** Goal-creation provenance was fixed client-side in PR #239; the server side already states the correct rule.
- **It does not restructure the retrieval pipeline.** Facts, chunks, spine and memory stay exactly as they are — except the one intent gate in B3, which is flagged as a founder decision.

---

# Two decisions needed before implementation

1. **B3 fact gating** — should the full blueprint fact dump be restricted to `FACTUAL` intent and explicit technical requests? Highest-leverage change here, and a real behaviour change.
2. **S2 fallback prompt** — retire the non-oracle prompt, or keep it and bring it under the charters? Requires invocation-log evidence first.

Everything else in this spec is deletion of contradicting text and can proceed without further input.

# Runtime Defect — Dutch phase detection

**For:** Lovable · **Type:** defect, not architecture · **Governing law:** `SOULSYNC_RUNTIME_CONSTITUTION.md`

A prerequisite fix. Every measurement that depends on conversational phase is currently distorted for Dutch users, so this lands alone and gets its own before/after.

---

## The defect

`supabase/functions/_shared/conversation-phase-tracker.ts` holds `CONVERSATION_STATE_SCHEMA` — `paralinguistic_rules` (line 43), 9 `clusters` with sub-state regexes (line 60), and a `routing_graph` (line 186).

**Every pattern is English.** No Dutch anywhere in the schema.

For a Dutch conversation nothing matches, `clusterScores.size === 0`, and `selectWinningCluster` falls back to **turn count**:

```ts
const turnCount = Math.floor((conversationHistory.length + 1) / 2);
if (turnCount <= 2) return { cluster: 'engagement',    confidence: 0.3 };
if (turnCount <= 5) return { cluster: 'clarification', confidence: 0.3 };
return                     { cluster: 'decision',      confidence: 0.3 };
```

So the conversational phase of a Dutch user is a function of **how many messages have been sent**, not of what was said.

### Observed consequence

In a five-turn Dutch transcript, none of these matched anything:

| User said | Should have hit | Actual |
|---|---|---|
| `ok ik snap het` | `reflection / learning_statement` | nothing |
| `ik ben terug getrokken` | `validation / self_disclosure` | nothing |
| `klinkt als veel werk` | `constraint` or `frustration` | nothing |
| `hoe verzilver ik het concreet?` | `decision / plan_request` | nothing |

Turn count put the run in `clarification`, whose guidance is *"Focus on mechanisms and definitions"* — which is exactly what the replies did, five times over. The repetition users reported was **instructed**, on the basis of message count.

### Second consequence — a ratified law cannot fire

`detectState` computes the v3.5 Emotional Evidence gate only when `EMOTIONAL_CLUSTERS.has(winner.cluster)`. The turn-count fallback returns `engagement`, `clarification` or `decision` — **never `frustration`, never `validation`**. The v3.5 gate is structurally unreachable for every Dutch user and has been since it shipped.

---

## Scope

1. **Bilingual patterns.** Dutch alongside English for `paralinguistic_rules` and every cluster sub-state. Keep one schema with both languages rather than forking per locale — a user who switches mid-conversation must still be detected.
2. **Open bug 2 — RLS.** The `conversation_state_tracking` insert (`companion-oracle-conversation/index.ts:120`) fails every turn. Same code path, already identified. Fix it so detection results actually persist.
3. **Regression tests, Dutch and English.** Per cluster and sub-state, at least one phrase in each language, asserting the detected cluster. Plus one asserting the turn-count fallback is *not* reached for a recognised Dutch phrase.

### Explicitly out of scope

- ❌ Hypothesis evolution / conversation momentum
- ❌ Consuming `conversation_state_tracking` in the prompt — law 4 applies, but the consumer is a **separate** work item
- ❌ HSI repair or extractor fixes
- ❌ Prompt governance, the Voice Charter, `RUNTIME_CONSTITUTION_V2_SPEC.md`
- ❌ Widening the ration guard, changing context budgets, touching retrieval

Bundling any of these makes the before/after unattributable. That has already cost us one metric — T10 became unreadable when two work items landed in one commit.

---

## Acceptance

**The same five-turn Dutch transcript produces the same phase transitions as its English translation.**

Concretely: run both, log the `cluster` and `subState` per turn, and show the sequences match. Any divergence is a missing pattern, not a judgment call.

Secondary: `conversation_state_tracking` gains rows (bug 2 closed), and no turn in the Dutch run reaches the turn-count fallback.

---

## Migration checklist (rule 4)

1. **What replaces it?** — bilingual patterns in the same schema.
2. **What gets removed?** — nothing; this is additive to a schema, and the turn-count fallback stays as the genuine last resort.
3. **Who owns this?** — `CONVERSATION_STATE_SCHEMA` in `conversation-phase-tracker.ts`, sole authority on phase detection.
4. **How do we know the old path is dead?** — the fallback is instrumented: log when `clusterScores.size === 0`, and the Dutch run shows zero occurrences.
5. **What test proves it?** — the regression suite in scope item 3, plus the acceptance comparison.

> Note on 2: this is one of the rare changes where nothing is removed, because the defect is absence rather than duplication. Say so explicitly in the PR rather than leaving the question blank.

---

## After this ships

Do not start anything else. The founder re-runs the same five-turn Dutch transcript, and we re-measure T5–T12 against a valid signal. Some of what currently reads as fixation may resolve once the phase is detected rather than counted — and we cannot tell which until this lands alone.

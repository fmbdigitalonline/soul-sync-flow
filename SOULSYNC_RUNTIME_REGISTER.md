# SoulSync — Runtime Register

*The review log. Governed by `SOULSYNC_RUNTIME_CONSTITUTION.md`; this document
holds no law.*

**Why this is a separate file.** The Constitution changes rarely; the Register
changes constantly. While the register lived inside the Constitution, every
review update was an edit to a constitutional document — which is exactly the
habit the freeze exists to break. Moved out, not copied: it no longer appears in
the Constitution.

**How a row completes.** Three reviews, in order (Runtime Constitution, *Runtime
review*):

- **Static** — the behaviour is decided in one place; every rival site removed.
  Provable by reading the source.
- **Behavioural** — observed in real output over a run of turns. Provable from
  transcripts and logs, never from the prompt text.
- **User** — someone who is not us used it and did not report the symptom the
  change was meant to remove.

✅ passed · ⚠️ passed the letter, missed the intent · ❌ failed · ⏳ not yet · ➖ not started

---

## Conversational behaviours

| Behaviour | Jurisdiction | Static | Behavioural | User | Status |
|---|---|:--:|:--:|:--:|---|
| Goal provenance | `adoptPendingIntake` (Action) | ✅ | ⏳ | ⏳ | In review |
| Memory claims | `MEMORY TRUTH GUARD` + `hasNoMemory` (Read) | ✅ | ⏳ | ⏳ | In review |
| Questions | Voice Charter r4 + ration guard | ✅ | ⚠️ | ⏳ | Over-corrected to zero; rule 5 floor violated |
| Endings / sign-offs | Voice Charter r3 | ✅ | ✅ | ⏳ | No ritual closers in 5 turns |
| Framework exposure | Voice Charter r6 | ✅ | ❌ | ⏳ | 5/5 replies; Appendix A trigger met |
| Response length | Voice Charter r2 + `maxTokens` | ✅ | ⚠️ | ⏳ | Median 91 vs 90 — marginal |
| Name usage | Voice Charter r3 | ✅ | ❌ | ⏳ | 5/5 replies; no ration guard exists |
| Language | Voice Charter r1 | ✅ | ✅ | ⏳ | 0 foreign literals in 5 Dutch turns |
| Identity flattery | Voice Charter r7 | ✅ | ❌ | ⏳ | Destiny declarations persist |
| Emotional tone | v3.5 evidence gate (Read) | ⏳ | ⏳ | ⏳ | 6 sites, gate enforced in 1 |
| Cards & attachments | Action Charter r4 | ⏳ | ⏳ | ⏳ | 5 sites |
| Directness | Voice Charter r5/7/8 | ⏳ | ⏳ | ⏳ | 5 sites |
| Warmth | Voice Charter r6 generated block | ⏳ | ⏳ | ⏳ | 4 sites |

**Nothing is complete, and behavioural review is where it stops.** Nine
behaviours pass static review. Two pass behavioural, three fail it, two pass the
letter and miss the intent, and no user has seen any of it.

That distribution is the most useful thing in this document: **static and
behavioural do not correlate.** The charter is deployed exactly as specified,
singular and uncontested, and four behaviours still miss. Sole jurisdiction
bought one place to change; it did not buy obedience — which is the
deterministic/emergent boundary measured rather than argued, and the answer to
whether a flag is "still prompt text".

### Notes on individual rows

**Goal provenance** — static passed in PR #239: `adoptPendingIntake` is the sole
place `authored` becomes true and the sole place the build starts. Behavioural
review is blocked on a goal actually being created since the change; the
assertion to make is that no `user_goals.title` matches assistant text.

**Memory claims** — the template the other rows are modelled on, but its ✅ is
from reading the source, not from watching output. Honest state: unverified in
production.

**Name usage** — both halves landed: the client sends the resolved name or
omits the field, and the server's `|| 'friend'` fallback is gone.

**The seven specification behaviours** — deployed Jul 30. Static verified
against the deployed source, not accepted on report.

---

## Behavioural observations

### Jul 30 2026 — baseline run, 2 Dutch turns (founder)

Pre-specification baseline. Exercised none of PR #239: no reunion greeting, no
sentence selection, and a name was present so the removed `'Seeker'` path never
fired. Measures the six behaviours still marked ➖.

| Test | Result | Evidence |
|---|---|---|
| T5 language | **fail** | `Am I close?` in English closing a Dutch reply |
| T6 length | **fail** | 81 and 115 words; median 98 (threshold 90) |
| T7 framework | **fail** | blueprint narrated in both replies; r6 rations to once per session |
| T8 name | **fail** | name used in 2 of 2 replies |

**The length result confirms the loophole rather than predicting it.** Both
replies are 4-5 sentences — inside Voice Charter rule 2 — at 20 and 23 words per
sentence. The rule was obeyed and the reply was still too long. This is why the
word count belongs in evaluation.

Two violations no test covers: the question paraphrased back (UNIVERSAL RULES
forbids it) and identity flattery (*"je energetische realiteit die wacht om
volledig te ontvouwen"* — rule 7, the same class as the sentence that became a
goal title).

**Candidate missing law — occurrence 2 of 3.** Asked a concrete question ("how
do I become a millionaire"), the reply carried no concrete step. No rule
anywhere in the prompt requires a concrete referent: the charter governs length,
questions, framework, warmth and honesty, but never whether the answer is
actionable. Under *interpretation before amendment* this looks like a genuinely
missing law rather than a poor application — held for a third occurrence per the
Rule of Three before anything is written.

### Jul 30 2026 — HSI production evidence (Lovable), and a corrected verdict

Reported: 48 users with personality reports · 29 with structured intelligence in
the report blob · **1** in `hermetic_structured_intelligence` · 5 blob reports
carrying scalar error strings in key dimensions.

**Prediction confirmed.** The static audit predicted the table would be "near
zero and only from manual dev-panel use". One row. The static method held.

**Verdict corrected by the evidence.** The audit concluded *wire, then repair*.
The blob path was already wired and serving 29 users; the orphan was the table,
with one row. Wiring it would have wired the wrong source. The verdict narrows
to **repair access; do not wire the table** — which is why the gate existed.

**Consequence that outranks the repair.** Roughly 24 of 48 users have usable
HSI. Partial and missing are not edge cases, they are half the user base, so the
resolution state needs behaviour attached and not merely a status field. The
template already exists: `hasNoMemory` structurally strips the BEHAVIORAL
EVIDENCE step when memory is absent. HSI needs the same guard, or the Twin
speaks with equal confidence to the users it understands and the users it does
not.

Two decisions settled against the code: source-level precedence (Option A) is
already implemented at `index.ts:831-848` — blob column, blob nested, typed
table, whole record, never mixed — so it is ratified rather than introduced. And
scalar error strings are not leaking by accident: `dimProse` at ~857 returns
them deliberately, comment included.

Unreconciled: "25 of 43 structured reports" against 48/29. Raw query output
needed before the 50% figure is trusted (rule 8).

### Jul 30 2026 — Runtime Constitution v2 and the HSI repair deployed (Lovable)

Static review passed on the deployed source, verified rather than accepted:
`Am I close` 0 occurrences; `Klopt dit`, `Wil je ontdekken`, `Hoe zou dat
voelen`, `het gaat zijn gangetje` all 0; both banned sign-offs and the
prescribed shadow closer 0; the three flattery lookup tables deleted, with only
a comment recording why; no `'friend'` or `'Seeker'` fallback; the name block,
`RESPONSE DISCIPLINE`, and all five per-role ending rules gone; ration window
widened to six. The charter header was changed from "any conflicting rule above"
to "below" — the edit S1 required and the specification did not spell out.

**T10 is unreadable as executed.** The oracle file is −12 net, against an
estimate of −165. That estimate covered the prompt specification only; this
commit also carries the HSI Task 5 rewrite, which legitimately adds lines. The
handoff said not to apply both in one PR precisely so this metric stayed
readable. Not a fault in the work — a sequencing instruction that did not
survive contact, recorded so the next handoff states it louder.

**All seven behaviours move to static ✅ and stop there.** None has been
observed in real output; none has been seen by a user. Per *Runtime review*,
static alone moves nothing further.

**Open, flagged by Lovable rather than buried:** the six never-written
dimensions and the 5-of-9 scalar-error rate are **write-time** bugs in the
extractor. The read path now refuses the bad data instead of injecting it, but
the extractor still produces it. That fix is unscoped and unstarted.

Evidence detail worth carrying forward: the blob is better, not clean — 38 of 43
structured, 5 scalar — and `financial_archetype` / `career_vocational` are
missing for 18 of 43. Those two never enter the spine today, but when relevance
selection arrives, **42% of users will not have them**.

### Jul 30 2026 — post-Track-A behavioural review, 5 Dutch turns (founder)

First run after Runtime Constitution v2 deployed. Static tests T1-T4 verified
against the deployed source: `Am I close` 0, all language literals 0, the three
flattery lookup tables deleted, no forbidden name fallback. The jurisdiction
work landed.

| Test | Result |
|---|---|
| T5 language / closer | **pass** — 0 English literals, 0 questions |
| T6 length | median 91 words vs 90 — marginal fail, max 116 |
| T7 framework | **fail** — 5 of 5 replies name the blueprint; rule 6 allows once per session |
| T8 name | **fail** — 5 of 5 replies; rule 3 says not in every reply |
| T11 flattery | **fail** — "je bent dichtbij iets waardevols", "het wordt jouw bron van kracht" |

**The finding is the gap, not the failures.** The charter is deployed exactly as
specified, singular and uncontested, and four behaviours still miss. Sole
jurisdiction bought one place to change; it did not buy obedience. This is the
deterministic/emergent boundary observed rather than argued.

**Appendix A trigger met.** The specification recorded that stripping framework
labels from `factsSection` should be reconsidered "if rule 6 proves insufficient
after this spec ships". It has, at 5/5, with one reply naming two astrological
placements outright. The option is now evidence-backed.

**Questions collapsed to zero — flattening, not success.** B1 removed five
instructions that said ask and none that said don't ask, leaving a ceiling with
no floor. Rule 5 is the only floor and it was violated: the user disclosed
working alone 24/7 and the reply smoothed into reassurance without asking. The
tension the Constitution deliberately preserves collapsed in one direction.

**Zero lived evidence in five replies** — nothing the user has built, done or
said. Cannot be diagnosed from output alone: either the spine is not firing for
this user, or it is firing and losing to framework material. The `SPINE`
breadcrumb (`source`, `lines`, `status`, `omittedDimensions`) and whether the
`STRUCTURED INTELLIGENCE GUARD` fired will separate the two. If the spine is
present and the replies still carry no specifics, the problem is weighting, not
availability.

**Concreteness: occurrence three.** Improved but not resolved — a real
constraint was named and the reply restated the strategy without engaging it.

Noted: the run was three consecutive money questions, and `financial_archetype`
is correctly outside the permanent eight. Intent-based relevance selection now
has an observed case rather than a hypothesis.

### Jul 30 2026 — hypothesis-evolution audit (four questions, answered from code)

| Question | Answer |
|---|---|
| Does the runtime preserve a working hypothesis? | **No.** Searched for `working_hypothesis`, `current_understanding`, `conversation_summary`, a running summary. Every hit for "hypothesis" is prompt vocabulary, not a stored object. |
| Can new evidence update it? | **Nothing to update.** Every turn recomputes from scratch — detect cluster, fetch blueprint, fetch spine, attach last 10 messages. Nothing carries forward but raw text. |
| Where is the update represented? | **Nowhere.** Though `conversation_state_tracking` already stores cluster, subState and confidence per turn, so the home exists. |
| Does the Twin expose the update? | **It cannot.** No prompt text asks it to notice change: *what changed · changed since · shifted · revise · previously said · earlier you* — zero matches in 3,059 lines. |

**The diagnosis is re-derivation, not fixation.** The model is not clinging to an
explanation; it is recomputing the same one from near-identical inputs, five
times. That distinction changes the fix: nothing needs to be argued out of it,
something needs to carry forward.

**Defect underneath the design question.** `conversation-phase-tracker.ts`
contains no Dutch patterns — every regex is English. For a Dutch user
`clusterScores.size === 0` every turn, and `selectWinningCluster` falls back to
**turn count**: ≤2 engagement, ≤5 clarification, >5 decision. So the phase
injected during the observed run was almost certainly *"PHASE: CLARIFICATION —
focus on mechanisms and definitions"*, which is exactly what the replies did.
The rotation was instructed, on the basis of message count.

Consequence: the v3.5 Emotional Evidence gate only runs for emotional clusters,
and the turn-count fallback never returns `frustration` or `validation`. **A
ratified law that cannot fire in the user's language.**

**Design constraints recorded before anything is built** (advisor, endorsed):

- The hypothesis is the **current explanation of the obstacle**, not a summary
  of the topic. *"The obstacle is depleted social energy, not absent contacts"* —
  not *"the conversation is about getting rich."* An interpretation, not a
  transcript.
- Four outcomes per turn, and no more: **reinforced · refined · challenged ·
  replaced**. Enough to be useful, few enough to stop the explanation
  oscillating.
- **Do not persist a free-text hypothesis first.** Prove the behaviour with an
  ephemeral per-request object; persist only if conversations demonstrably
  improve. Law 4 applies to whatever is stored.

**T12 added — the qualitative test.** Across a 10-turn conversation, how many
replies acknowledge that the user's latest message changed or refined the Twin's
understanding? **Baseline from the Jul 30 run: zero of five.** Not a quota; a
fixation detector.

### Jul 31 2026 — Dutch phase detection shipped, and the origin of v3.5

Verified against the deployed schema rather than accepted on report. All four
transcript phrases now resolve, and the resolutions match what was predicted:

| Phrase | Detected |
|---|---|
| `ok ik snap het` | `reflection / learning_statement` |
| `ik ben terug getrokken` | `validation / self_disclosure` |
| `klinkt als veel werk` | `constraint / time_pressure` |
| `hoe verzilver ik het concreet?` | `decision / plan_request` |

Coverage: **29 of 31 sub-states across 10 clusters** carry Dutch. Two do not —
`reflection/summary_request` and `meta_dialogue/rephrasing_request`. Small, named,
not blocking.

### The second defect is the more important one

Lovable found and flagged it rather than burying it: `globals.flags` is `"i"`, and
the shout detector was `[A-Z]{5,}`. Case-folded, that matches **any five
consecutive letters**. Reproduced against the pre-fix schema:

| Message | Scored |
|---|---|
| `vandaag gaat het goed met me` | **frustration +0.6** |
| `hoe verzilver ik het concreet?` | **frustration +0.6** |
| `ik ben terug getrokken` | **frustration +0.6** |
| `hello there` | **frustration +0.6** |

*"Today is going well for me"* scored frustration. Every message of five or more
letters, in every language, for as long as the rule has existed.

**This is the cause of the founder complaint that produced v3.5.** The original
report was that neutral messages were being relabelled as frustration. That
observation produced the `RESPONSE DISCIPLINE` MIRROR THEIR REGISTER block, the
"Founder testing fixes" round, and — the expensive part — **v3.5 Emotional
Evidence, ratified as constitutional law**.

The cause was a missing per-rule flag override.

v3.5 is not wrong; gating emotional claims on evidence is right on its own
merits. But it was ratified in response to a symptom whose cause was a defect,
and *interpretation before amendment* — written yesterday — asks exactly the
question that would have caught it: **missing law, or poor application?** It was
a poor application, and a law was written instead.

The compounding irony, established the day before: v3.5's gate only runs for
emotional clusters, and the turn-count fallback never returned one. **The law
written to fix the symptom could not fire in the language where the symptom was
observed.**

This is the first historical case validating the discipline, and it is worth more
than the discipline's own argument. Nothing about v3.5 is being retracted — but
its origin is now recorded, so a future reader does not treat it as evidence that
laws solve detector bugs.

**Bug 2 CLOSED (Aug 4).** Rows are landing in `conversation_state_tracking` with
real cluster, sub_state, confidence and signal counts. Confirmed by rows, not by
a successful `CREATE POLICY`.

**But the detector is not live.** Four rows from Aug 4 20:11-20:14; two carry
`confidence 0.30` with every signal count at zero — the turn-count fallback,
made visible by the instrumentation added in the same ticket. The bilingual
schema was committed **Aug 3 07:02**, a day and a half earlier, so these turns
ran with the fix in the repo and still fell back. The deployed bundle is stale:
the `_shared` change did not reach it. Redeploy is the fix, not a precaution.

**Two proposed acceptance values were wrong, and one was dangerous.** Computed
against the deployed schema, the full sentences produce
`validation/self_disclosure` and `constraint/time_pressure`, not the expected
`exploration|clarification` and `frustration/venting`. Both actual results are
better reads — a withdrawal is a disclosure, and naming a 24/7 workload is a
resource constraint. Tuning the schema to score that sentence as frustration
would have re-created the over-labelling defect this same ticket removed.
Acceptance corrected before the replay ran.

---

## Open decisions

| Decision | Blocked on | Owner |
|---|---|---|
| Consume `conversation_state_tracking` in the prompt (law 4 applies) | The Dutch detector defect landing first — the signal is invalid until then | Founder |
| Retire the non-oracle fallback prompt (`index.ts:2133`) — a second, ungoverned prompt sharing no rule with the charters | Invocation-log evidence that the branch is dead (rule 4 + rule 10) | Founder |
| Strip framework facet labels from `factsSection`, keeping values | Evidence that Voice Charter r6 alone did not hold after the spec ships | Founder |

---

## Amendment log

| Date | Change | Kind |
|---|---|---|
| Jul 30 2026 | **Law 4 — every persisted state has a canonical consumer** | New law (four observed occurrences; Rule of Three met). Reworded from "reader" to "consumer": events, cache invalidation and scheduling are legitimate consumers. The competing reading — a recurring habit rather than a constitutional gap — is recorded inside the law rather than hidden. |
| Jul 30 2026 | Rule 4 `Never delete services/hooks` → **Replacement completes** | Amendment |
| Jul 30 2026 | §7/§8 moved out of the Product Constitution into the Runtime Constitution | Move |
| Jul 30 2026 | *Tension is not contradiction* added | New law (protects an existing one) |
| Jul 30 2026 | *Runtime review* cadence added | Operational cadence |
| Jul 30 2026 | *Interpretation before amendment* added | Operational cadence |
| Jul 30 2026 | Register moved out of the Runtime Constitution into this file | Move |

Per *Interpretation before amendment*, every future entry states which of the
three it is: an application of an existing law (no entry needed — fix the code),
an amendment, or a genuinely new law. If this log fills with new laws, the
freeze has failed.

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

✅ passed · ⏳ not yet · ➖ not started

---

## Conversational behaviours

| Behaviour | Jurisdiction | Static | Behavioural | User | Status |
|---|---|:--:|:--:|:--:|---|
| Goal provenance | `adoptPendingIntake` (Action) | ✅ | ⏳ | ⏳ | In review |
| Memory claims | `MEMORY TRUTH GUARD` + `hasNoMemory` (Read) | ✅ | ⏳ | ⏳ | In review |
| Name usage | Voice Charter r3 | ⏳ | ⏳ | ⏳ | Client done, server pending |
| Questions | Voice Charter r4 + ration guard | ➖ | ➖ | ➖ | Specified, not implemented |
| Endings / sign-offs | Voice Charter r3 | ➖ | ➖ | ➖ | Specified, not implemented |
| Framework exposure | Voice Charter r6 | ➖ | ➖ | ➖ | Specified, not implemented |
| Response length | Voice Charter r2 + `maxTokens` | ➖ | ➖ | ➖ | Specified, not implemented |
| Language | Voice Charter r1 | ➖ | ➖ | ➖ | Specified, not implemented |
| Emotional tone | v3.5 evidence gate (Read) | ⏳ | ⏳ | ⏳ | 6 sites, gate enforced in 1 |
| Cards & attachments | Action Charter r4 | ⏳ | ⏳ | ⏳ | 5 sites |
| Directness | Voice Charter r5/7/8 | ⏳ | ⏳ | ⏳ | 5 sites |
| Warmth | Voice Charter r6 generated block | ⏳ | ⏳ | ⏳ | 4 sites |

**Nothing is complete.** That is the true state and the reason this table exists:
two behaviours pass static review, none has been observed in real output, and no
user has looked at any of it. Static review alone moves nothing.

### Notes on individual rows

**Goal provenance** — static passed in PR #239: `adoptPendingIntake` is the sole
place `authored` becomes true and the sole place the build starts. Behavioural
review is blocked on a goal actually being created since the change; the
assertion to make is that no `user_goals.title` matches assistant text.

**Memory claims** — the template the other rows are modelled on, but its ✅ is
from reading the source, not from watching output. Honest state: unverified in
production.

**Name usage** — the client no longer sends `'Seeker'`; the server still has
`personalityContext.name || 'friend'`, which is on the prompt's own forbidden
list. Static cannot pass until both halves land.

**Six rows marked ➖** — `docs/RUNTIME_CONSTITUTION_V2_SPEC.md` specifies them;
the work is Lovable's and has not started.

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

---

## Open decisions

| Decision | Blocked on | Owner |
|---|---|---|
| Retire the non-oracle fallback prompt (`index.ts:2133`) — a second, ungoverned prompt sharing no rule with the charters | Invocation-log evidence that the branch is dead (rule 4 + rule 10) | Founder |
| Strip framework facet labels from `factsSection`, keeping values | Evidence that Voice Charter r6 alone did not hold after the spec ships | Founder |

---

## Amendment log

| Date | Change | Kind |
|---|---|---|
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

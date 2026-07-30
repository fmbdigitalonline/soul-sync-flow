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

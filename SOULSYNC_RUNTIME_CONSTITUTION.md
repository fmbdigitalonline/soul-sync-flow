# SoulSync — Runtime Constitution (v2)

*The engineering half. Hand this to any AI developer session together with
SOULSYNC_CONSTITUTION.md.*

**Why this document exists.** The Product Constitution answers *what should the
Twin do*. This one answers a different question: *who is allowed to decide what
the Twin does*. Those were interleaved in one 946-line file, and interleaving
them is part of why the implementation became stratigraphy — an engineering rule
sat between two product laws and nobody read it as governance.

**Why v2, not v1.** These rules already existed as §7 and §8 of the Product
Constitution. This is not a new document; it is the second version of rules that
were already law. Moving them out is a replacement, not a copy — §7 and §8 no
longer exist in the Product Constitution.

---

## The three laws

### 1. One jurisdiction

Every behaviour has exactly one policy that is *allowed* to decide it.

Not "one authority" — jurisdiction. Authority asks who *can* decide; jurisdiction
asks who is *permitted* to. A second place deciding question cadence is not a
competing opinion to be weighed; it is a violation, and it is fixed by removing
the second place, never by ranking them.

The distinction matters because a document that says "the charter wins" produces
a charter that negotiates. A charter that negotiates is the newest voice in an
argument, not a constitution.

### 2. One canonical owner

Every implementation has exactly one canonical owner: one file, one function,
one enforcement point. Where a behaviour is enforced in two places, the two will
diverge — not because anyone is careless, but because each will be edited by
whoever is holding the ticket that day.

The working example already in the codebase is memory claims: one guard
(`MEMORY TRUTH GUARD`), one structural strip (`hasNoMemory` removes the
BEHAVIORAL EVIDENCE steps from the role block), and no third path that could
disagree. It is the only behaviour in the conversational audit that governs
cleanly. It is the template.

### 3. Replacement completes

A replacement is finished when the old path is **gone**, not when the new path
works. See rule 4 of §A below, which this law amends.

---

## Deterministic and emergent

Behaviours divide by **where they can be enforced**, not by what they are.

| Deterministic — enforce | Emergent — generate |
|---|---|
| goal provenance | warmth |
| name resolution | directness |
| memory claims | challenge |
| card routing | question wording |
| which facts enter the prompt | emotional language |

**The boundary is not fixed.** The same behaviour moves columns by moving where
you check it. Question cadence is emergent when you instruct before generation
and deterministic when you validate after it. Framework exposure is emergent in
prose and deterministic in which facts entered the prompt at all.

So the roadmap question is never "which column is this in" — it is **"can this
move left, and what does the move cost?"** Moving left has a real price:
stripping a trailing question after generation produces a reply that ends
mid-thought, which is worse than the question. Deciding whether to move a
behaviour left is itself a judgment, and by law 1 it needs a jurisdiction —
otherwise we will have solved accumulation by inventing a new place to
accumulate.

**Prefer making a thing impossible over persuading against it.** Architecture is
not what you have added; it is what you have successfully made impossible.

---

## Tension is not contradiction

Law 1 removes contradictions. It must not be used to remove tensions, and the
difference is testable:

- A **contradiction** is two rules that cannot both be satisfied in the same
  reply. *"End with a question"* and *"one question in three"* — one of them is
  broken every turn. Contradictions get deleted.
- A **tension** is two rules that are both satisfiable but pull in different
  directions, so the model must exercise judgment. *"Confront when the door
  opens"* and *"one idea, landed well"* — a confrontation IS one idea. Tensions
  get kept.

Good architecture removes contradictions and preserves tensions. A system with
no tension left has not been governed; it has been flattened, and it will
produce replies that are consistent and lifeless. When consolidating a
behaviour, name which of the two you found before deleting anything.

---

## Runtime review

Governance that stops at static analysis produces perfectly owned code that
holds poor conversations. A jurisdiction is not complete until it has passed
three reviews, in order:

1. **Static** — the behaviour is decided in one place; every other site is
   removed. Provable by reading the source.
2. **Behavioural** — the behaviour is observed in real output over a run of
   turns. Provable from logs and transcripts, never from the prompt text.
3. **User observation** — a person who is not us used it and did not report the
   symptom the change was meant to remove.

Only then does the behaviour move to ✅ in the register below. Static review
alone moves nothing.

The questions asked at step 3 are about experience, not architecture: *did
anything feel mechanical · did it feel like it was talking at you · did you ever
feel misunderstood · was there a moment you wanted to keep talking.* "Did the
framework references go down" is a step-2 question and must not be asked of a
user.

---

## The migration checklist

Every replacement answers five questions, in the PR that performs it. A PR that
cannot answer all five is not performing a replacement; it is adding a path.

1. **What replaces it?**
2. **What gets removed?**
3. **Who now owns this behaviour?**
4. **How do we know the old path is dead?**
5. **What test proves that?**

Question 4 is answered from database rows and edge-function invocation logs,
never from a grep — §A rule 8 governs the evidence, and §A rule 10 is explicit
that a static audit is a document, not ground truth. Until all five are
answered, the old path stays. The rule that replaced *"never delete"* is not a
licence to delete quickly.

---

## Behaviour jurisdiction register

Status as of the conversational-authority audit (Jul 2026). 🔴 contradicting
authorities · 🟠 overlapping but compatible · ✅ single jurisdiction.

| Behaviour | Places deciding it | Status | Jurisdiction |
|---|--:|:--:|---|
| Memory claims | 2 | ✅ | Read Policy |
| Response length | 8 | 🔴 | Response Policy |
| Questions | 7 | 🔴 | Voice Policy |
| Framework exposure | 7 | 🔴 | Voice Policy |
| Endings / sign-offs | 7 | 🔴 | Voice Policy |
| Goal creation | 7 | 🔴 | Action Policy |
| Emotional tone | 6 | 🟠 | Read Policy |
| Cards & attachments | 5 | 🟠 | Action Policy |
| Directness | 5 | 🟠 | Voice Policy |
| Name usage | 4 | 🔴 | Voice Policy |
| Language | 4 | 🔴 | Voice Policy |
| Warmth | 4 | 🟠 | Voice Policy |

The register is the work list. A behaviour leaves it by reaching ✅ — one
jurisdiction, one enforcement point, every other site removed under the
migration checklist, **and all three runtime reviews passed**. It does not leave
by being documented, and it does not leave on static review alone.

**Success is not fewer bugs. It is fewer places where the same behaviour can be
decided.** The measurable form: over a milestone, deleted lines should exceed
added lines while the experience holds or improves.

---

## §A. Rules of engagement for the AI developer

*(Moved verbatim from Product Constitution §7, except rule 4, which is amended
below and marked as such.)*

1. Read this doc at session start; conflicts: charters > this doc > your
   judgment > existing code patterns.
2. Change ONLY what the task names. Report adjacent findings; don't fix.
3. Edge-function edits require explicit deploy; state the timestamp.
4. **Replacement completes (amended Jul 30 2026 — supersedes "Never delete
   services/hooks; unroute or unmount").**

   The superseded rule was written to stop an AI developer breaking live
   systems it did not understand, and it did that. It also made every
   replacement a permanent addition. Three audits found the same consequence
   of this one rule: the floating-orb audit (~4,000 orphaned lines), the
   productivity-surface audit (three unreachable environments, one with zero
   inbound references anywhere in `src`), and the conversational-authority
   audit (twelve behaviours, none with a single owner, six with directly
   contradicting rules). The Constitution contained the cause of its own
   drift, which means the Constitution was not modelling the behaviour it
   expects from the code.

   A replacement is finished when the old path is **gone**. Unrouting and
   unmounting are steps in a migration, never its end state. Every
   replacement answers the five migration questions above, in its PR.

   The old rule's protection is preserved, not discarded: nothing is removed
   until its replacement lives AND question 4 is answered from real evidence.
   What changes is that the migration is no longer allowed to stop there.
5. Every task ends with: build passes + user-visible behavior verified in
   preview + exact files/lines changed.
6. Never weaken: charters, idempotency guards, one-insight budget,
   prefers-reduced-motion, read-only overviews.
7. **Two write channels, one author per change (amended v2.2, Jul 15
   2026 — founder decision; supersedes the single-channel rule):** Both
   Lovable and Claude may write and deploy code, including edge
   functions. Invariants that survive the amendment: (a) deployed code
   and repo are the same bytes, same day; (b) exactly ONE author owns a
   given change end-to-end — a function being modified in a Claude
   branch is not simultaneously edited in Lovable, and vice versa;
   (c) Claude works on branches and states what was changed and, for
   edge functions, the deploy timestamp; (d) every Claude session still
   starts from a fresh zip / fresh clone of the repo as ground truth.
   Claude may still deliver specs for Lovable to apply when that is the
   more practical channel for a given change.
8. **Ground truth over memory:** schema from
   src/integrations/supabase/types.ts, taxonomies from source, deployment
   from logs (emoji markers). Capture logs immediately — retention short.
9. **Diagnose before patching:** reduce every "didn't work" to a numbered
   list of possible broken links; evidence picks one; fix only that link.
10. **Consult before building (v2.3):** any new classifier, model call,
   engine, store, or scheduler must name — in the PR description — which
   assets in the wiring maps (PHASE2_WIRING_MAP.md §5-6,
   INTELLIGENCE_WIRING_MAP.md §5-6) were considered and why each doesn't
   fit. Bypassing a live organ is a decision with a stated reason, never
   an accident. And: a static audit is a document, not ground truth (rule
   8) — verify its "dead"/"empty" claims against DB rows and edge-function
   invocation logs before any irreversible action (delete, drop). Reuse
   recommendations are safe on an unverified audit; removals are not.
11. **Introduce no new permanent noun unless necessary.** This document
   creates no Policy Engine, Jurisdiction Layer, or Runtime Manager. The
   mental model is the deliverable; the implementation stays as small as
   the behaviour requires.

---

## §B. Open bug tally (found, not fixed)

*(Moved verbatim from Product Constitution §8.)*

1. Thread memory (SERIOUS) — ROOT-CAUSED (Jul 16, INTELLIGENCE map §4.1):
   writer omits `mode` → rows default `'guide'`; oracle STEP 1 filters
   `mode='companion'` → misses every turn; STEP 2 grabs newest companion
   row of any age (the 6-day-old context); client sends empty history
   (getProgressiveIntelligentContext stub). Fix serves the tiered/both
   memory model (§2), spans the oracle → needs deploy + live verify.
2. conversation_state_tracking RLS: insert fails every turn.
3. ACS frustration misfires → fixed structurally by Phase 2 item 2.
4. Number drift in twin speech ("3 years" → "5-year" → "3-step").
5. Language drift (Dutch reply to English message, once). Monitor.
6. Empty retrieval at first contact (facts 0, MBTI Unknown); verify on next
   clean run.
7. Save Insight chip is fake → FIXED Jul 19 (v2.6 Step 2): "Help me
   remember this" writes user_session_memory (type 'insight',
   memory_data.summary carries the passage) — the store the oracle's
   behavioral context reads; oracle now always includes 'insight' rows.
   Verify in preview after next edge deploy.
8. Blueprint de-vibe (char-count badges ~899–1105 in
   PersonalityReportViewer, metadata badges, mid-sentence summary) → Ph 2 §5.
9. First-contact threadId undefined (once; re-verify with bug 1).
10. First-contact quality on thin data: use hermetic_structured_intelligence
    for first-contact fact selection (asset exists, §5).
11. cognition_mbti hardcoded "Unknown" → FIXED Jul 16 (derive at blueprint
    assembly from user_meta.personality.likelyType). Existing rows still
    need a backfill; repair service reads wrong table (blueprints vs
    user_blueprints). (INTELLIGENCE map §4.3.)
12. Structured-intelligence prose fracture → FIXED Jul 17 (verified in
    production logs: `📐 SPINE: ~345 tokens, source: blob_column`). DB
    verification reframed the bug: personality_reports.structured_intelligence
    ({analysis: prose} per dimension, intact for every report) is the source
    of truth; the HSI table is a lossy derived copy (some rows hold scalar
    error strings). Fix (authored by Lovable on main, per rule 7): spine
    reads the blob first (column → nested → typed-table fallback). Two
    residues stay open: extract-hermetic-intelligence still corrupts the
    HSI table on sub-agent error (write-side guard pending), and nothing
    else should adopt the HSI table as a source. Lesson banked in rule 10:
    the three "failed" verification rounds were a stale edge deploy plus
    silent no-log code paths — silence in logs is not evidence of which
    build is running; only an unconditional entry breadcrumb is.
13. HSI column drift (DB-confirmed Jul 15): DB has `compatibility` /
    `financial_archetype`; code uses `interpersonal_compatibility` /
    `financial_archetypes` → those two dimensions silently dropped on
    TS-named writes. Align code→DB names.
14. Card envelopes not persisted: no write path stores attachments
    (conversation_memory strips them in validateMessage; conversation_messages
    has no attachments column) → cards vanish on reload, breaking
    live-then-fossil. Needs a persisted card-part column.
15. OfferCard deal is non-deterministic → SUPERSEDED Jul 18 (v2.5): the
    Slice-1 rail fixed determinism, then the founder retired auto-dealing
    entirely — offer_decomposition tool and deal rail removed from the
    oracle; sentence selection is the only program-creation trigger and
    the workspace panel runs the flow. Typed confirmations no longer pin
    decompose_goal (confirmedAction legacy rail only).
16. search-similar-messages broken (invalid vector syntax) → message
    embeddings written every turn, never readable. hacs-coach-conversation
    can't boot (duplicate const). Oracle behavioral scorer: FIXED Jul 19
    (read memory_content → memory_data; relevance was always 0 and
    pattern extraction crashed on importance>5 rows since inception).
    Remaining items still open. (§4.4-4.6.)

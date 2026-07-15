# SoulSync — Developer Constitution & Wiring Roadmap (v2.2)

*Hand this to any AI developer session before it touches code.*

*v2.2 — rule 7 amended: Claude granted write-and-deploy power alongside
Lovable (Jul 15, 2026). Supersedes v2.1.*

*v2.1 — Phase 1 shipped + Phase 0 recorded (Jul 14, 2026). Supersedes v1/v2.*

## 1. Vision (why this product exists)

SoulSync is a digital reflective twin: an AI companion that deeply knows one
person — via a generated 160k-word hermetic "soul" document plus accumulating
longitudinal memory — and coaches them with **honesty over flattery**. The
conversation IS the product. Everything else (goals, tasks, programs,
assessments, insights) is a capability the twin wields inside that
conversation, never a destination the user navigates to.

The moat: (a) the living soul document, (b) months of memory no competitor
can paste into ChatGPT, (c) a confrontational-but-caring voice competitors
are structurally afraid to copy. Corollary of (b): the twin NEVER fabricates
memory. On a fresh account it has only the chart, and speaking from the
chart is enough. Fake intimacy counterfeits the moat (truth guard enforces
this in the oracle).

## 2. Thought process (how we decide anything)

- The relationship is the product → the surface is the conversation.
- Navigation may show state; only conversation may change it. Read-only
  overviews allowed (Reis tab, Today pin). Workspaces are not.
- The twin gets ONE mouth. All system output arrives as twin messages in
  the stream — never modals, badges, or panels.
- **Deterministic rails before intelligent guesses; cards are the rails.**
  Where a moment can be made structural (a tap, a machine-generated message
  with a known prefix, a confirmedAction flag), build the rail. Intelligence
  handles only the residue: rail → semantic classifier → regex fallback.
  (Learned in Phase 1: two weeks of regex patches vs. one tap.)
- **Engine/surface separation, three channels.** Pre-rebuild flows (Dreams,
  journey, tasks, orchestrator) are headless engines: logic preserved and
  invoked via the twin's tools, screens permanently unrouted as donors. The
  conversation is the only surface, with exactly three channels: **text**
  (the twin's mouth — meaning), **cards** (CardShell message-parts —
  structure, engine output), **sentence actions** (selection chips — the
  user's precision input on twin text). Every feature = an engine service
  expressed through these channels. A fourth channel or re-routing an old
  surface requires amending this constitution first.
- One attention target at a time: text streams first, cards materialize
  after; never two surfaces claiming the same moment.
- Presence is ambient: the border IS the orb (PresenceFrame).
- Ship one vertical slice, prove it with users, then widen.
- Nothing is deleted until its replacement lives; unroute, don't delete.
- The Supabase project is never rebuilt. Schema changes are deliberate
  migrations owned by the consuming feature — never hotfixes. (Goal
  timeframe: verbatim in `description`, normalized in `target_date`,
  per-milestone in `target_date_offset_days`.)

## 3. The three charters (deployed and verified — never weaken)

- **VOICE CHARTER** (oracle prompt, final authority on speech): language
  follows the user's most recent message; short by default; varied shape;
  hypothesis-check endings rationed to one reply in three (question-ration
  counter enforces); "your blueprint shows" + framework vocabulary once per
  session; confront loaded disclosures; chart informs, never narrates; no
  identity flattery; honesty over comfort; banned ritual closers; NEVER
  claim memory that doesn't exist (truth guard).
- **ACTION CHARTER** (oracle prompt, final authority on tool use): the twin
  has hands; never narrate what a tool would produce instead of calling it;
  confirmed decomposition MUST call the tool that turn (name-pinned
  tool_choice enforces); consult get_active_dream before advising on goals
  (forced tool_choice on goal/plan turns); offer decomposition exactly
  once; tools accompany insight, never replace it; goal titles copy the
  user's words — but a question is never a title (interrogative candidates
  excluded from title repair).
- **CARD CHARTER** (frontend, CardShell enforces): cards are earned, max
  one per turn, collapsed first, text streams before the card mounts,
  live-then-fossil (only newest instance live), every interaction speaks
  into the stream, payloads hydrated live, recurring state lives in ONE
  Today pin, quiet bubble-native visuals.

### Corrected ground truths (expensively learned; do not re-learn)

- No "confirmation" cluster exists in ACS. Clusters: engagement,
  exploration, clarification, decision, reflection, validation, constraint,
  frustration, meta_dialogue, closure. Confirmation = decision/
  commitment_signal; bare "yes" matches no ACS signal.
- ACS frustration patterns are unreliable ("finished", "milionair" →
  venting 0.87). Semantic intent layer subsumes trigger duty (Phase 2).
- `tool_choice: 'required'` forces *a* tool, not *the* tool; the model
  picks the safe consult. Name-pinning is the only real force.
- `user_goals` has NO `timeframe` column (columns: id, user_id, title,
  description, progress, status, aligned_traits, milestones, target_date,
  category, created_at, updated_at). Check
  src/integrations/supabase/types.ts before any insert.
- Empty behavioral memory + a template demanding "behavioral evidence" =
  fabricated memory. Templates must degrade with the data.
- Verbatim-fidelity guards without eligibility rules copy the wrong thing
  (a typo'd question became a card title). Guards need eligibility rules,
  not just similarity thresholds.
- Verify deployment claims against logs (emoji markers), never memory or
  docs. Capture edge logs immediately — retention is short.

## 4. Current state (Phase 1 SHIPPED; Phase 0 RECORDED — Jul 14, 2026)

Proven end to end in production (screenshots + logs + recording): goal
statement → forced consult (🎯 TOOL CHOICE: required) → offer → "yes" →
name-pinned decompose (🛠️ TOOL LOOP, 🎯 PINNED DECOMPOSE) → real
personalised milestones (🧩 DECOMPOSE_GOAL, decomposeGoalReal) → insert →
DreamCard → milestone tap speaks into the stream without duplicating.

Shipped (companion-oracle-conversation unless noted): trigger stack
(acsConfirmation / multi-token shortAffirmative EN+NL / planRequest /
freshGoalStatement / statedGoal, fuzzy-million, abstract-goal context,
decision logged every turn); name-pinned tool_choice on confirmations;
openai-agent action router → decomposeGoalReal (generatePlanBranches still
stub → Phase 3); hard fail-path (<3 milestones → no card, narrated retry);
title-fidelity guard + interrogative exclusion; state spine (≤~350 tokens,
fixed slot, fail-soft); shadow-cue injection; first-contact guard (synthetic
handoff never ACS-classified); instructed dead-end on empty
get_active_dream; timeframe→target_date translation; truth guard;
question-ration counter; card lifecycle interim (text before card,
live-then-fossil, card suppressed on milestone-tap turns, tap-prefix guard
vs duplicate goals — replaced by FocusCard in Phase 2); full telemetry
(🎯 🛠️ 📐 🩶 ✂️ ⚠️ 🃏, finishReason).

**Phase 0 recording archived by the founder.** It is the regression
baseline + first demo asset. If fixes deployed after the take, re-record
one clean master.

## 5. Buried assets → engines (wire, don't rebuild)

- journey-agentic-tools.ts → engine of start_task_session/FocusCard (Ph 2).
- Dreams/productivity/growth components → screens stay unrouted DONORS;
  extract logic; reuse sub-components inside CardShell where fit.
- openai-agent: decomposeGoalReal LIVE; generatePlanBranches /
  evaluatePlanAlignment stubs → Phase 3; updateUserMemory,
  formatPersonalizedDelivery unwired.
- hermetic_structured_intelligence: spine wired ✔; first-contact fact
  selection unused (see bug 10).
- Shadow detectors: sync cue wired ✔; RealTime subclass unwired.
- conversational-assessment, life-orchestrator-service → Phase 3.
- humor-palette-detector → Phase 3. pie-scheduling + pie-pattern-detection
  → Phase 2 day-2 message. hacs-authentic-insights → one-insight budget.
- xp-progression-service (twin-visible growth), voice-service (parked).
  UNIVERSAL_CONVERSATIONAL_RULES: charters win on conflict.

## 6. Roadmap

**Phase 0 — ✅ RECORDED** (re-record one clean master if fixes landed after
the take).

**Phase 1 — reflex & hands: ✅ SHIPPED** (§4).

**Phase 2 — rails & the working loop (current):**

0. Engine-extraction audit (FIRST task): inventory Dreams/journey/
   productivity components + services; mark each service engine-ready or
   UI-entangled; mark each screen as donor. Output: the wiring map.
1. OfferCard on CardShell — deterministic confirmation rail. Twin deals it
   via side-effect-free offer_decomposition tool (attachment push only);
   tap speaks a visible message AND sends confirmedAction:
   { type:'decompose_goal', title } (title frozen from the user's words at
   offer time); oracle skips all detection when the flag is present. Typed
   "yes" keeps the trigger stack as fallback.
2. Semantic intent layer — classifyIntent() on gpt-4.1-nano, strict JSON
   {intent, goal_verbatim, timeframe}, 1s timeout, fail-soft; primary
   trigger input; regex demoted to fallback; later replaces ACS frustration
   detection.
3. start_task_session → JourneyAgenticTools engine → FocusCard
   (expand-in-place working session; replaces the milestone-tap interim).
4. Today pin; update_task / check_habit tools; open-loop + PIE day-2
   proactive message.
5. Riding along: Save Insight becomes a real write (conversation_insights);
   Blueprint de-vibe pass (char-count + metadata badges, mid-sentence
   Integrated Summary).

**Phase 3 — depth & overview:** Reis tab (read-only, taps speak into chat);
assess_life_wheel + domain-gaps → orchestrator chain (rewire
generatePlanBranches + evaluatePlanAlignment for real); Codex seeding;
humor-profile line.

**Phase 4 — the living soul:** conversational belief-verification →
hermetic-document reconciliation (belief_updates, consolidation,
re-embedding, provenance). Own project.

Throughout: no new pages, no new conversation engines, each phase ends with
a user-visible demo and a fresh-account test.

## 7. Rules of engagement for the AI developer

1. Read this doc at session start; conflicts: charters > this doc > your
   judgment > existing code patterns.
2. Change ONLY what the task names. Report adjacent findings; don't fix.
3. Edge-function edits require explicit deploy; state the timestamp.
4. Never delete services/hooks; unroute or unmount.
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

## 8. Open bug tally (found, not fixed)

1. Thread memory not persisting per thread (SERIOUS): threadId with no
   conversation_memory row; fallback loaded a 6-day-old conversation.
2. conversation_state_tracking RLS: insert fails every turn.
3. ACS frustration misfires → fixed structurally by Phase 2 item 2.
4. Number drift in twin speech ("3 years" → "5-year" → "3-step").
5. Language drift (Dutch reply to English message, once). Monitor.
6. Empty retrieval at first contact (facts 0, MBTI Unknown); verify on next
   clean run.
7. Save Insight chip is fake (toast only) → Phase 2 §5.
8. Blueprint de-vibe (char-count badges ~899–1105 in
   PersonalityReportViewer, metadata badges, mid-sentence summary) → Ph 2 §5.
9. First-contact threadId undefined (once; re-verify with bug 1).
10. First-contact quality on thin data: use hermetic_structured_intelligence
    for first-contact fact selection (asset exists, §5).
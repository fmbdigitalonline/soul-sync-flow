# ChoiceCard Slice 3 — spec for ratification

Status: DRAFT — awaiting founder ratification (constitution rule 10).
Grounded in: the built Dreams environment (pages + components + hooks),
audited Jul 18 2026. Extends the ratified v2.3 dealer
(CONSTITUTION_V2.3_DRAFT_CHOICECARD.md); changes nothing already ratified.

## 1. Audit finding: the product already answered the multi-dream question

The founder built the answer before the conversational pivot. Verified in
source, pages first:

- `AllDreamsList.tsx`: "All Dreams (N)" — a grid of every active dream,
  with a "New Dream" button always present. No cap, no single-dream
  assumption. Page copy: "Your complete journey overview."
- `DreamsOverview.tsx`: same — all active goals, create-new any time.
- `Dreams.tsx`: full hub — discovery chat → decomposition → success →
  journey/tasks/focus/habits per dream, goal selection, details view.
- `use-goals.ts`: the data model is explicit — `user_goals.status`
  `'active' | 'inactive'`; **delete is a soft delete** (`status →
  'inactive'`); every page query filters `.eq('status','active')`;
  milestones live in the `goal_milestones` table (joined per goal).

**The single-dream worldview exists ONLY in the conversational layer**
(`get_active_dream` limit-1 + "no active dream → offer" + the Slice-1
rail guard). The twin contradicts the founder's own built product.

## 2. Bug found during audit (fix immediately, no ratification needed —
this is alignment with existing product semantics, not new design)

The conversational layer ignores `status`:

- The Slice-1 rail guard counts ANY `user_goals` row — a soft-DELETED
  dream blocks the dealer forever.
- `get_active_dream` selects newest row with NO status filter — the twin
  can present a deleted dream as "your active dream."

Fix: both queries filter `.eq('status','active')`, matching every page
query. (Bug tally item 17.)

## 3. The Slice 3 fork — dealt, never guessed

A stated goal while ≥1 active dream exists is a real fork the twin
currently cannot navigate (it goes silent — the flaw the founder caught
Jul 17). Per v2.3 §2, forks are dealt. The dealer's cases become:

| state | deal |
|---|---|
| 0 active dreams | today's single decompose door (Slices 1–2 unchanged) |
| ≥1 active dream, stated goal is NEW | ChoiceCard, 2 doors: **[Start this as a new dream]** (route: decompose_goal — exists) and **[Fold it into "<nearest dream>"]** (route: add_milestone — new, one `goal_milestones` insert) |
| ≥1 active dream, stated goal ≈ an existing dream | single door: **[Keep working on "<dream>"]** (route: continue_dream — targeted get_active_dream consult) — never a duplicate-creating door |
| any of the above + emotional authority | + defer_choice chip (Slice 2 rule, unchanged) |

"Nearest dream" v1 = token-overlap between the stated goal and active
dream titles (same tokenizer as the title-fidelity guard); embeddings
later. "≈ existing" = overlap above the same 0.6 threshold already used
by the fidelity guard — one vocabulary, not two.

No "park/switch" door: the built product lets dreams coexist — there is
nothing to park. The one-Today-pin law is untouched (pinning stays
scarce; dreams were never scarce).

## 4. Envelope + registry

New attachment type, same one-surface rules as offer_decomposition
(side-effect-free deal, tap = visible message + confirmedAction, frozen
params, live-then-fossil):

```
{ type: 'choice_card', title: '<verbatim goal>',
  chips: [ { route: 'decompose_goal' | 'add_milestone' | 'continue_dream',
             label: '<MBTI-worded>', goal_id?: '<uuid>' } ],
  defer_chip?: true }
```

Closed route registry — chips can only claim what a registered route
does (CARD CHARTER). `confirmedAction` widens to
`{ type: route, title, goal_id? }`; oracle handles each route
deterministically (decompose = existing pinned path; add_milestone =
insert + confirm line; continue_dream = pinned consult of that goal).

## 5. Blueprint decisions carried forward (Slice 2 rules, now per-chip)

- WHEN/pacing: authority → defer chip (unchanged).
- HOW: MBTI words each chip label (T-J action-plan wording, F-P
  meaning-wording — same registry route underneath).
- WHY-line: the twin's one line must ground in the fed chart facts AND
  name why *these* doors (e.g. "you already carry 'X' — this could feed
  it, or stand alone"). Facts-only rule unchanged.
- RANKING (hermetic execution_bias) and SUPPRESSION (crisis_handling +
  shadow cue): deferred to Slice 4 — the spine's blob read makes the
  data available; the ranking design is not yet ratified.

## 6. Out of scope for Slice 3

- Plan-request routing ("create a learning program…") — needs its own
  route in the registry; recorded as the Slice 4+ baseline from the
  Jul 17 production test.
- Card-envelope persistence (bug 14) — cards still vanish on reload;
  separate fix, unchanged priority.
- Multi-door WHICH selection by zodiac/numerology — activates when the
  registry has enough routes for selection to mean something.

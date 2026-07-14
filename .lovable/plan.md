## Diagnosis (end-to-end trace)

### Evidence gathered

1. **TOOL LOOP logging is in the source** (`supabase/functions/companion-oracle-conversation/index.ts` lines 2190 & 2192) — so the deployed build should emit it. Recent edge-function logs pulled for `companion-oracle-conversation` show only `shutdown` + background `FUSION` lines; no turn-level oracle logs surfaced in the queried window for the confirmed test users (`bb74faf0…`, `d6f5766e…`). Analytics queries for `TOOL LOOP` / `DECOMPOSE_GOAL` / `REQUIRED IGNORED` markers return empty — this build's turn logs aren't in the retained window, so we can't read the exact tool call from logs on the confirmed turn.
2. `**decomposeGoalReal` is present and wired** in `openai-agent/index.ts` (line 544, wired 671, `🧩 DECOMPOSE_GOAL` at 598/659/678). No evidence it was invoked in the retained window.
3. `**user_goals` table — smoking gun.** Querying directly:
  - `user_id = bb74faf0-0c5c-4abd-b9d1-a26681e3fc30` → **0 rows, ever**.
  - `user_id = d6f5766e-9ab5-4f31-a215-e831bd32ab28` → **0 rows, ever**.
  - Newest row in the whole table is `2026-07-06` (a different user). So on every recent "yes" turn, the insert never happened.
4. **RLS is not the wall.** `user_goals` policies are the standard `auth.uid() = user_id` USING/WITH CHECK set. The oracle client (line 1021–1033) uses the anon key + the caller's `Authorization` header, so `auth.uid()` resolves correctly — same pattern the function already uses for reads that succeed. No RLS-denied signature in logs for this table. `conversation_state_tracking` is a different table and not the same policy shape.
5. **Frontend renders `attachments` correctly.** `use-hacs-conversation.ts:680` passes `response.attachments || []` onto the oracle message; `HACSChatInterface.tsx` maps `attachments` where `type === "dream_card" && goal_id` into `<DreamCard />`. If a `dream_card` attachment ever reached the client, it would render. The response envelope at line 2538 includes `attachments: cardAttachments`.

### First broken link

**The forced tool call on the "yes" turn is unconstrained.**

`companion-oracle-conversation/index.ts:2353`:

```ts
tool_choice: shouldForceTool ? 'required' : 'auto',
```

`'required'` forces *some* tool to be called, but the tools array still exposes both `get_active_dream` and `decompose_goal`. On confirmation turns the model consistently picks the safer consult (`get_active_dream`), which hits the empty branch (2206–2213) and returns the "offer again, do NOT decompose" instruction. The turn ends with another offer, no `decompose_goal` call, no `user_goals` insert, no `dream_card` attachment. That matches the observed reality: `shortAffirmative` trigger fires, `TOOL LOOP` selects `get_active_dream`, and `user_goals` stays empty.

Secondary problem this masks: when the model *does* eventually pick `decompose_goal`, `runCompanionTool` reads `args.title` straight from the model. On a `shortAffirmative` turn ("yes"/"ja"), the model has no goal noun in the current message — the goal-title fidelity guard (2218–2256) will scan the last 6 user turns and repair, but only if `args.title` was populated at all. Pinning the tool by name is a prerequisite to exercising that guard.

### Fix (single link)

In `companion-oracle-conversation/index.ts`, replace the blanket `'required'` with a name-pinned tool choice when the trigger is a confirmation of a prior offer, and leave it as `'auto'` / `'required'` otherwise.

Concretely, near line 2353:

```ts
const forceDecompose = shouldForceTool && (acsConfirmation || shortAffirmative);
const toolChoice = forceDecompose
  ? { type: 'function', function: { name: 'decompose_goal' } }
  : shouldForceTool
    ? 'required'
    : 'auto';
```

Then pass `tool_choice: toolChoice` into the first `callChat` call. The while-loop's follow-up call at 2377 stays `'none' | 'auto'` (unchanged) so the model can still narrate the result without being re-forced.

Nothing else changes. `planRequest` and `statedGoal` still use `'required'` (they may legitimately want the consult first). The instructed dead-end at 2210 stays as the safety net for the *first* time the user names a goal.

### Verification recipe (after deploy)

1. New thread → user names a goal ("ik wil een miljoen verdienen dit jaar"). Expect: `🛠️ TOOL LOOP: calling get_active_dream` → empty + instruction → single offer line, no card.
2. User replies "ja". Expect in logs:
  - `🛠️ TOOL LOOP: calling decompose_goal` with `args.title` present (repaired by the fidelity guard from the prior turn if the model left it blank),
  - `🧩 DECOMPOSE_GOAL: Decomposition complete { valid: 4..6 }` in `openai-agent`,
  - `✅ DECOMPOSE_GOAL: Returning { milestoneCount: >=3 }`,
  - a new row in `user_goals` for this user,
  - the oracle response envelope carrying `attachments: [{ type: 'dream_card', goal_id: <new id> }]`,
  - `<DreamCard />` rendered under the assistant message in the UI.
3. Screenshot the card as final proof.

### Scope guardrails

- One file edited: `supabase/functions/companion-oracle-conversation/index.ts` — one const + one arg swap on the first `callChat`.
- No frontend changes (rendering path already works).
- No `openai-agent` changes (`decomposeGoalReal` is correct).
- No DB migration (RLS is not the break).
- Existing goal-title fidelity guard, instructed dead-end, `⚠️ REQUIRED IGNORED` warn, and TOOL LOOP telemetry all remain in place and become genuinely useful once the model is pinned to `decompose_goal` on confirmations.--DEV NOTE: The fix is right and I endorse it as written: name-pinning via `{ type: 'function', function: { name: 'decompose_goal' } }` is supported by the API version in use (`2024-10-21`), it's surgical, and keeping `planRequest`/`statedGoal` on plain `'required'` is the correct asymmetry — those turns *should* consult first; only a confirmation of a standing offer should go straight to the hands.
  Two riders for Lovable before it deploys, both cheap:
  1. **Log the title journey on pinned turns.** On a confirmation turn the model invents `args.title` from history, so the fidelity guard is doing all the work. One log line — `🎯 PINNED DECOMPOSE: title in "<model's>" → out "<final>"` — tells us instantly if the guard's candidates came up empty (which the stale-thread-memory bug from earlier could cause, since the goal statement lives in history).
  2. **One edge to confirm handled:** if `freshGoalStatement` and a confirmation somehow fire on the same turn (user states goal + yes in one message), the pin would decompose *without* an offer ever existing. Acceptable per charter clause 2 (the "yes" is the confirmation, the what+timeframe is in the same message) — just confirm the precedence is intentional, not accidental.
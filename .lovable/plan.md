# Fix: milestone taps spawning duplicate goals

## Root cause
`DreamCard` sends the literal string `Let's work on: <milestone title>` when a user taps a milestone. The oracle treats that like any other user turn — the trigger classifier sees an actionable statement and fires `decompose_goal`, which inserts a new `user_goals` row titled after the milestone (e.g. "Let's work on: Reach $1 Million").

## Change 1 — `supabase/functions/companion-oracle-conversation/index.ts`

Before the existing trigger/force-tool block that computes `forceDecompose` / `shouldForceTool` / `firstToolChoice`, add a milestone-tap detector on the incoming user message:

```ts
const MILESTONE_TAP_PREFIX = "Let's work on:";
const isMilestoneTap = typeof userMessage === 'string'
  && userMessage.trimStart().startsWith(MILESTONE_TAP_PREFIX);
```

When `isMilestoneTap` is true:
- Force all decompose/plan/consult triggers off (`forceDecompose = false`, `shouldForceTool = false`, any `trigger` flags cleared for this turn).
- Pin `firstToolChoice` to `{ type: 'function', function: { name: 'get_active_dream' } }` so the model reads the existing dream instead of creating one.
- Append one line to the system prompt built for this turn:
  > "The user tapped a milestone on their existing dream card — coach them into starting this specific milestone; do NOT create or decompose a new goal."
- Log `🪧 MILESTONE TAP: coaching mode, decompose suppressed` so we can verify in edge logs.

No other branches change. `decompose_goal` remains available for genuine new-goal turns.

## Change 2 — data cleanup

Delete the one bogus row via the insert tool:

```sql
DELETE FROM public.user_goals
WHERE title = 'Let''s work on: Reach $1 Million';
```

(If the milestone title varies, we'll first `SELECT id, title, created_at FROM user_goals WHERE title ILIKE 'Let''s work on:%'` and delete the matching row(s) from today.)

## Verify
1. Fresh thread → tap a milestone on an existing DreamCard.
2. Edge logs show `🪧 MILESTONE TAP` and no `🛠️ TOOL LOOP: calling decompose_goal`.
3. `user_goals` row count unchanged; no new "Let's work on: …" row appears.
4. Assistant reply coaches the user into starting that milestone.

## Scope
- One edge function file edited.
- One (or few) row(s) deleted from `user_goals`.
- No schema change, no frontend change, no `openai-agent` change.

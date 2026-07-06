## Problem

Fresh-account run: user said "yes close, now i need plan to improve" — oracle kept giving advice, never called `decompose_goal`. Two guards blocked it:

1. **Trigger regex** (`shortAffirmative`) only fires on bare confirmations ("yes", "ok", "go for it"). A message that *asks for a plan* ("i need plan to improve", "help me improve", "geef me een plan") doesn't match — and no ACS `commitment_signal` fires either, so `shouldForceTool = false`.
2. **Guardrail** (`goalNounRegex`) only accepts concrete goals: money amounts, `earn/save/quit/launch/build/become`. Abstract goals like "close this chapter", "improve", "verbeteren" fail the guard, so even if the trigger matched, tool-forcing wouldn't fire.

Result: model stays in advice mode.

## Fix — Phase 1.5 (single file: `supabase/functions/companion-oracle-conversation/index.ts`, lines ~2273–2310)

### Change A — Broaden trigger: add plan-request intent

Add a second detector alongside `shortAffirmative` / `acsConfirmation`:

```
const planRequest = /\b(plan|planning|actie(plan)?|stappen|steps?|roadmap|breakdown|break\s+(it|this)\s+down|decompose|help me (improve|do|plan|start|begin)|need (a )?plan|geef.*plan|maak.*plan|help me verbeteren|hoe (begin|start) ik)\b/i.test(message);
```

`shouldForceTool = (acsConfirmation || shortAffirmative || planRequest) && goalInRecentContext`.

Log which of the three fired.

### Change B — Loosen guardrail: accept abstract goal intent

`goalInRecentContext` currently misses "close this chapter", "improve", "verbeteren". Add a second, softer pattern that catches abstract-but-actionable intent surfaced in recent turns:

```
const abstractGoalRegex = /\b(improve|change|fix|solve|close (this|that|the) chapter|move (on|forward|past)|let go( of)?|stop|start (doing|being)|shift|transform|heal|grow|verbeter(en)?|veranderen|oplossen|loslaten|afronden|verder|beginnen met)\b/i;
const goalInRecentContext = recentUserTurns.some(t => goalNounRegex.test(t) || abstractGoalRegex.test(t));
```

Both regexes stay ANDed with the trigger — a plan-request without any goal-shaped context still won't force a tool call (prevents misfire on generic small-talk).

### Change C — Logging parity

Update the `console.log` to include `planRequest` alongside `shortAffirmative` so the verification recipe can distinguish which branch tripped:

```
🎯 TOOL CHOICE: required { trigger: 'planRequest' | 'shortAffirmative' | 'acsConfirmation', acsCluster, acsSubState, goalMatch: 'concrete'|'abstract' }
```

### Not changing

- `repairGoalTitle`, spine, shadow-cue, `decomposeGoalReal`, hard-fail on <3 milestones — all stay identical.
- Second-round `tool_choice` logic in the loop untouched.
- No other files touched. No client-side changes.

## Verification

1. Deploy `companion-oracle-conversation`.
2. Fresh account → discuss a soft goal ("close this chapter", "improve how I handle X") → say "now i need plan to improve".
3. Edge logs must show: `🎯 TOOL CHOICE: required { trigger: 'planRequest', goalMatch: 'abstract' }` on that turn, followed by `openai-agent` invoke returning ≥4 milestones and a `DreamCard` whose title matches the user's phrasing.
4. Regression check: a bare "yes ok" in casual chat with no goal context in the last 4 turns still logs `🎯 TOOL CHOICE: auto` (guardrail holds).

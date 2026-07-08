# RCA: consult → offer joint is missing in the deployed build

## What the paste proves

Two console traces from two different builds, neither showing `🛠️ TOOL LOOP` lines. The twin's Dutch reply ("het is slim om concrete financiële doelen op te delen in duidelijke mijlpalen") is a textbook Action Charter clause-1 violation: it **narrated** decomposition instead of **offering** it and then doing it on a yes.

## Where the break is (verified against current repo)

`supabase/functions/companion-oracle-conversation/index.ts` line 2193 — the `get_active_dream` empty branch:

```ts
if (!g) return JSON.stringify({ found: false, note: 'No active dream yet.' });
```

This is a **dead-end tool result**. The model consulted (as instructed by clause-3 "CONSULT BEFORE COUNSEL"), got a bare `note`, and had no next-step instruction embedded in the payload. Tool results steer models far harder than system prompts, so with nothing to steer toward, it fell back to narrating advice about breaking goals into milestones — exactly clause-1's failure mode.

Also confirmed absent in current source:

- No `🛠️ TOOL LOOP` logging anywhere in the file (grep is empty). That's why the paste has no `🛠️` lines — this build never emits them.
- `decomposeGoalReal` **is** present in `supabase/functions/openai-agent/index.ts:544` and wired at line 671, so the openai-agent chain is fine. The unknown from the paste is resolved: **openai-agent is not the break; companion-oracle-conversation is.**

So the machine state matches the user's read: reflex/`tool_choice: required` is live and proven, but the consult→offer joint and its telemetry are missing from what's deployed.

## Fix (one file, one deploy)

### 1. Turn the empty consult into an instructed dead-end

In `runCompanionTool` → `get_active_dream` empty branch, replace the bare `note` with an instruction the model must obey:

```ts
if (!g) {
  return JSON.stringify({
    found: false,
    note: 'No active dream yet.',
    instruction:
      "The user has no active dream. In ONE short line, offer to break their stated goal down into milestones. Do NOT decompose or call decompose_goal until they say yes (ja/oké/graag/go).",
    user_stated_goal_hint: message.slice(0, 200),
  });
}
```

Why this works: it converts the failure signal into a directive tool payload. The model's next token is now steered by the tool result, not by the system prompt it already ignored once.

### 2. Add the `🛠️ TOOL LOOP` telemetry so future traces are diagnosable

Wrap the tool-call dispatch in `runCompanionTool` (and its caller) with:

```ts
console.log(`🛠️ TOOL LOOP: calling ${name}`, { args: JSON.stringify(args).slice(0, 300) });
const result = await /* existing body */;
console.log(`🛠️ TOOL LOOP: ${name} returned`, { preview: String(result).slice(0, 300) });
return result;
```

This is what the user's paste was looking for and couldn't find — makes the consult→offer→decompose chain observable in edge logs.

### 3. Deploy

Deploy only `companion-oracle-conversation`. `openai-agent` already has `decomposeGoalReal` wired; no change needed there.

### 4. Verify

One turn: send a goal sentence with no existing dream in `user_goals` for the test user. Expect in edge logs:

```text
🛠️ TOOL LOOP: calling get_active_dream
🛠️ TOOL LOOP: get_active_dream returned { found:false, ..., instruction:"...offer... do NOT decompose..." }
```

And in the reply: a single short offer line (Dutch: "Wil je dat ik dit voor je opdeel in mijlpalen?"), **no** milestone narration, **no** `decompose_goal` call yet. Then reply "ja" → expect a second `🛠️ TOOL LOOP: calling decompose_goal` and a DreamCard attachment.

## Scope guardrails

- One file edited: `supabase/functions/companion-oracle-conversation/index.ts`.
- No frontend changes. No prompt rewrites beyond the tool-result instruction string. No changes to `openai-agent`, no DB migrations.
- The existing goal-title fidelity guard (lines 2198–2232) is untouched. -Dev note: **Apply your RCA fix (instructed dead-end + 🛠️ telemetry) as proposed. Additionally, before deploying, verify these markers all exist in** `companion-oracle-conversation/index.ts` **— each is a shipped fix from this Phase 1 session; add any that are missing, changing nothing else:**
  1. `statedGoal` — trigger const, included in `shouldForceTool` and the log object (goal named in current message forces the consult even without a timeframe)
  2. `mil{1,2}[ij]?oe?n` — fuzzy million spelling in `goalNounRegex`, `goalSignal`, and the title guard's `goalPhraseRegex` (catches "milion")
  3. `shortAffirmative` regex ends in `[\s,!.]*)+$` — repeated-token form so "yes go for it" matches (single-token form fails the verification recipe)
  4. `first contact — classification skipped` — when `firstContact` is true, skip `detectConversationState` entirely and use a neutral state ("finished" misclassifies as frustration/venting and poisons the opening)
  5. `finishReason` in the Oracle Response Metrics log + a `✂️ TRUNCATION` warn when it equals `length`
  6. Voice Charter rule 4 contains "EXCEPTION, not the rule" (hypothesis-check rationed to one reply in three); rule 6 contains "rationed to at most ONCE per session"; the oracle-mode role block says "ALLOWED sparingly" not "ALLOWED and encouraged"
  7. `⚠️ REQUIRED IGNORED` warning after the tool loop when `shouldForceTool` was true but zero tool calls occurred
  **Deploy** `companion-oracle-conversation` **only. Report which markers were already present vs added.**
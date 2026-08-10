# RCA: "I apologize, but I encountered an issue" + stuck hermetic job

## Root cause (verified in logs, not inferred)

The OpenAI account behind `OPENAI_API_KEY` has **zero credits**. Every model call in the system fails at the provider.

Evidence from `companion-oracle-conversation` logs (2026-08-10 08:08:21Z):

```text
status: 429  "Too Many Requests"
code:   "credit_balance_exhausted"
type:   "insufficient_quota"
message:"You have no credits remaining. Add credits to continue using the API..."
model:  gpt-4.1-mini-2025-04-14
```

This is not a rate limit and not a code bug. The pipeline up to the call is healthy: system prompt assembled (8392 chars), 3 messages prepared, phase tracker ran (cluster `engagement`/`greeting`), token allocation 1500. The failure is the final HTTP call only.

Two visible symptoms, one cause:

1. **Chat reply "I apologize, but I encountered an issue. Please try again."** — the catch-all fallback in the conversation hook after the edge function 500s.
2. **Hermetic job stuck at 0% / "Observing through mbti..."** — `hermetic-background-orchestrator` logs `Agent call failed for mbti: Edge Function returned a non-2xx status code` at 08:07:36Z. The analyst function it calls makes the same OpenAI call and gets the same 429. Also note the intent classifier (`gpt-4.1-nano`) fell back to regex for the same reason.

Secondary observation, not the cause: the orchestrator error handler logs `job unknown` / `jobId: undefined` because it cannot re-read the already-consumed request body, so a failing job is never marked failed — it just sits at 0% until the heartbeat sweep catches it.

## Fix

### 1. Restore provider credit (required, outside the code)
Add credits at https://platform.openai.com/settings/organization/billing/ for the org that owns `OPENAI_API_KEY`, or set `OPENAI_API_KEY` to a key on a funded org. Nothing in the app can work around an unfunded account, and per project rules no mock or fallback content will be substituted.

Once funded: re-send a companion message and re-create the hermetic job from `/testing`. The current stuck job must be abandoned or restarted — it has no live worker.

### 2. Surface the failure honestly instead of hiding it (code)
Today a 402/429-class provider failure is flattened into a generic apology, which reads like a model reply and hides an operational problem.

- `supabase/functions/companion-oracle-conversation/index.ts`: on an OpenAI non-2xx, return the upstream status and a typed body (`{ error: "provider_quota_exhausted" | "provider_rate_limited" | "provider_error", detail }`) rather than a generic 500.
- `src/hooks/use-hacs-conversation.ts` (and the three sibling hooks carrying the same literal string: `use-program-aware-coach.ts`, `use-optimized-program-coach.ts`, `use-enhanced-ai-coach-vfp.ts`): branch on that error code and show a distinct, non-conversational system notice ("AI service unavailable — provider credits exhausted") instead of an in-character apology message.

### 3. Make orchestrator failures observable (code)
- `supabase/functions/hermetic-background-orchestrator/index.ts`: clone the request body before parsing (or capture `jobId` into a variable at the top of the handler) so the error path can mark the job `failed` with the real reason instead of logging `job unknown`.
- Propagate the analyst's status/message into the job's failure reason so `/testing` shows "provider credits exhausted" rather than a silent 0%.

## Scope note
Items 2 and 3 are diagnostics/plumbing only — no prompt, model-routing, or personality logic changes. Item 1 is a billing action only you can take, and until it is done the app will keep failing at every model call regardless of what is deployed.

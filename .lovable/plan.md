## RCA

Two independent bugs killed both auto-generations for job `9319f50a-ef0a-430b-9784-70c2c3ebbc9b` (user `d6f5766e…`).

### Bug 1 — Standard report crashes on every invocation (hard bug)

Log evidence (`generate-personality-report`, ts 2026-07-06 12:16:54):

```
💥 Error generating personality report: ReferenceError: callChatCompletion is not defined
  at file:///…/generate-personality-report/index.ts:181:28
```

`supabase/functions/generate-personality-report/index.ts` line 188 calls `callChatCompletion({...})` but the file has **no import for it**. The helper lives at `supabase/functions/_shared/azure-openai.ts:81`. Every auto-trigger from `OnboardingFlow` throws at first line inside the try block — the report is never generated, never persisted. Nothing to do with hermetic. Pure missing import.

### Bug 2 — Hermetic relay chain silently breaks; no resumer exists

DB state for job `9319f50a`:

```
status              = processing
current_stage       = hermetic_laws
current_step        = Processing polarity_analyst...
progress_percentage = 28.57
last_heartbeat      = 2026-07-06 12:17:35Z
created_at          = 2026-07-06 12:14:11Z
error_message       = null
```

Architecture (`hermetic-background-orchestrator/index.ts`): one step per invocation, then fire-and-forget `supabase.functions.invoke('hermetic-background-orchestrator', { body: { job_id } })` at line 248. If any single relay hop fails (openai-agent timeout/rate-limit, gateway hiccup, cold-start refusal, network blip) the chain terminates. `error_message` is null because the failure happened **between** the heartbeat write (line 238) and the next hop landing — the current invocation returned 200, the next one never happened.

The existing `hermetic-recovery` function is misnamed for this case: it only accepts jobs with `status = 'completed'` (line ~42) — it rehydrates finished results into `personality_reports`, it does **not** resume stalled ones. That is why the client's zombie-detector fires ("Job stuck – detected zombie job") but nothing on the server side ever resumes the job. Manual recovery calls on this job return 500 "Job not found" because of a different job id being probed.

### Adjacent observation (report only, do not fix now, per rule)

`hermetic-job-creator` also fire-and-forget invokes the orchestrator (line 114). If that first hop is flaky, the job sits at 0% pending forever with the same failure mode — but for `9319f50a` the first hop clearly succeeded (multiple heartbeats up to stage 4 of 12).

## Fix plan

### Fix A — Restore standard report (1-file, minimal)

`supabase/functions/generate-personality-report/index.ts`

- Add the missing import at top:
  ```ts
  import { callChatCompletion } from "../_shared/azure-openai.ts";
  ```
- No other logic changes. Redeploy.

### Fix B — Rescue the currently stuck job

One-shot: kick a fresh relay hop by invoking `hermetic-background-orchestrator` with `{ job_id: '9319f50a-ef0a-430b-9784-70c2c3ebbc9b' }` (once). The orchestrator reads current DB state and resumes from `hermetic_laws / polarity_analyst`. Verify via `hermetic_processing_jobs` row: `last_heartbeat` advances and `progress_percentage` climbs. If it stalls again in the same spot, capture the orchestrator's own log window (the earlier log fetch missed it because it fell outside the retention window shown) before deciding on a code-level retry inside the step handler.

### Fix C — Turn the client-side zombie detector into a real resumer (server-side)

Extend `hermetic-recovery/index.ts` so it handles two modes based on the fetched job's status:

- `status === 'completed'` → existing rehydrate path (unchanged).
- `status === 'processing'` **and** `now() - last_heartbeat > 90s` → re-invoke `hermetic-background-orchestrator` with the same `job_id`, then return `{ resumed: true }`. Guard with an advisory idempotency check: skip if `last_heartbeat` moved within the last 30 s (another hop is live).
- Any other case → keep current error response.

Client behavior stays the same — the existing zombie-detection code path already calls `hermetic-recovery`, so no client changes needed; today it gets 500 for a live-but-stalled job, after this it gets a resume.

### Not changing (out of scope for this fix)

- Idempotency guards in `hermetic-job-creator` and `ai-personality-report-service` — already in place from prior work.
- Orchestrator step-level retry semantics — deferred until Fix B tells us whether stalls are chronic or one-off.
- Any client-side onboarding UI. This is a backend correctness fix only.

## Verification

1. Deploy `generate-personality-report` + `hermetic-recovery`.
2. Kick Fix B for job `9319f50a`; watch `hermetic_processing_jobs.progress_percentage` climb past 28.57% within ~2 minutes. On completion, confirm a row in `personality_reports` with `blueprint_version != '1.0'` for user `d6f5766e…`.
3. Trigger the standard-report path (existing auto-trigger in `OnboardingFlow` or by manually invoking `generate-personality-report`); confirm `personality_reports` gains the standard row and `edge-function-logs` no longer contains `ReferenceError: callChatCompletion`.
4. Fresh account run: onboard → both jobs auto-fire → hermetic completes; standard completes.

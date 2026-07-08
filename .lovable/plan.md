## Status (evidence-based)

**Hermetic report — ✅ generated.**
- Job `b5d3e69d-…` status=`completed`, progress=100%, 89596 words, `generated_at` 2026-07-06 10:45.
- Row exists in `personality_reports` as `blueprint_version=2.0`.
- Console confirms: "✅ HERMETIC SERVICE: Hermetic report found … wordCount: 89596".

**Standard report — ❌ NOT generated.**
- `personality_reports` has only the v2.0 row for this user; no v1.0 row.
- `generate-personality-report` edge function shows **zero logs** at all.
- Console: "📝 No stored report found for user … 📊 Standard report result: {success: true, report: undefined}".
- Root cause: this user's onboarding ran **before** the missing-`callChatCompletion`-import fix was deployed. The auto-trigger fired, the function threw at line 188, and OnboardingFlow only `.catch`'d it as a warning — so nothing surfaced and nothing retried. The fix is now in place for future accounts, but this user's report was never re-kicked.

**Recovery 500 in this session — unrelated red herring.**
- Console shows the user clicked a recover button, and `hermetic-recovery` logged: `Error: Job not found: Cannot coerce the result to a single JSON object` for job `8e91dc1b-07be-4d7a-9033-33a125da6fa6` — that job id does not belong to this user (their hermetic job is `b5d3e69d-…`). Stale client-side job reference triggered the 500. Not related to report generation.

## What to do

**1. Backfill the missing standard report for this user (bb74faf0-…).**
   Invoke `generate-personality-report` once for their existing blueprint so the Rapport tab has content. No code change needed — just a one-shot trigger (either from the client "Generate" button on the Rapport tab, or via a manual `supabase.functions.invoke` from a short script). Verify a v1.0 row appears in `personality_reports`.

**2. Harden the onboarding auto-trigger so silent failures never happen again.** In `src/pages/OnboardingFlow.tsx` lines 182-190:
   - Await the standard-report invoke result (still non-blocking via a wrapper), inspect `error`, and on failure enqueue a single retry after 5s.
   - Persist a lightweight "standard_report_pending" flag (localStorage keyed by user id) that a background hook clears on success — so if the user closes the tab mid-onboarding, the next `/blueprint` mount re-kicks it once.
   - Keep hermetic trigger untouched (it worked).

**3. Fix the recovery 500 UX.** In `src/services/hermetic-recovery-service.ts` / the UI that calls it, before invoking guard against `!jobId || jobId !== currentHermeticJobId`. If the stored job id doesn't match the user's latest job, refresh from DB first instead of POSTing a stale id. Prevents the 500 the user just hit.

**Not in scope:** hermetic pipeline changes (working), edge-function code changes to `generate-personality-report` (import fix already landed), translation warning for `blueprint.mbtiDescriptions.unknown` (separate cosmetic issue — MBTI type is coming through as literal "Unknown" from the blueprint; flag but don't fix here).

### Verification recipe
- After step 1: `SELECT blueprint_version, generated_at FROM personality_reports WHERE user_id='bb74faf0-…'` returns two rows (1.0 + 2.0). Rapport tab renders.
- After step 2: create a fresh account, kill the network mid-onboarding, reopen `/blueprint` — console shows one retry attempt and a v1.0 row lands within ~60s.
- After step 3: clicking recover with a stale job id shows an inline "no active job to recover" message instead of a 500.

## Scope
Three coordinated changes: (1) restore first-contact durability across navigation, (2) hide the hermetic report as a user action while keeping it running silently, (3) add idempotency guards on both report services.

---

### 1. Fix 1 — First-contact message surviving navigation

`src/hooks/use-hacs-conversation.ts` currently appends the opening turn optimistically via `setMessages`. The edge function already persists the assistant row into `conversation_messages`, but the client uses in-memory state, so leaving `/companion` and returning shows an empty thread until the hydrate query returns (and often shows nothing if the hydrate ran before insert).

Change (as previously specified):
- After a successful `initiateFirstContact` response, re-run the existing conversation-history hydrate (same call the adapter uses on mount) instead of only pushing an in-memory message, so the opening comes back from `conversation_messages` on every subsequent mount.
- Keep the optimistic `setMessages` append for immediate paint, but reconcile by `client_msg_id` / server id when hydrate resolves (dedupe by `id` prefix `oracle_first_` vs server id).
- Keep the `?from=onboarding` guard in `src/pages/Coach.tsx` — no behavioral change there.

Files: `src/hooks/use-hacs-conversation.ts` only.

---

### 2. Rapport tab — remove hermetic user action, auto-run standard at onboarding

`src/components/blueprint/PersonalityReportViewer.tsx`
- Remove the "Hermetisch Rapport (10.000+ woorden)" button and its two render sites (lines ~501 and ~761), plus the `generateHermeticReport` function (lines 191–244) and the recovery/purge/regenerate buttons that exist only to service that flow (`handleRecoveryAttempt`, the force-regenerate branch at ~378).
- Keep the "Standaard Rapport" button and `generateReport(...)` untouched — it remains as regenerate/fallback.
- If `hermeticStatus.isGenerating` (from `useHermeticReportStatus`), render a single passive line ("Deep synthesis in progress…") in muted text. No progress bar, no percentage, no button, no toast. Nothing else surfaces hermetic state in this tab.
- Leave hermetic viewing code (`hermeticReport` state, `HermeticInsightTester`, etc.) alone — reading an existing hermetic report is not a user *trigger*, so it stays.

`src/pages/OnboardingFlow.tsx` (around line 181)
- Directly under the existing fire-and-forget `hermeticPersonalityReportService.generateHermeticReport(...)`, add a sibling fire-and-forget call:
  ```
  aiPersonalityReportService
    .generatePersonalityReport(data, language)
    .catch((e) => console.warn("Standard report generation deferred:", e));
  ```
- Import `aiPersonalityReportService` from `@/services/ai-personality-report-service`. No await, no UI change, no toast — same non-blocking pattern as the hermetic call.

---

### 3. Idempotency guards on both report services

**Standard** — `src/services/ai-personality-report-service.ts`, at the top of `generatePersonalityReport`:
- Resolve `userId` from `blueprint.user_meta?.user_id || blueprint.user_id`.
- Call the existing `getStoredReport(userId)`; if a report exists AND `generated_at` is within the last 24h, log `⏭️ Standard report skip: fresh report exists (…)` and return `{ success: true, report: existing }`.
- No in-flight table exists for standard reports (it's a synchronous edge call), so freshness-check is the only guard needed.

**Hermetic** — `supabase/functions/hermetic-job-creator/index.ts` already skips when a `pending`/`processing` job exists for the user. Extend the same guard:
- Before creating a job, also query `personality_reports` for `user_id = user_id AND blueprint_version <> '1.0'` (hermetic rows) ordered by `generated_at desc limit 1`. If one exists within the last 7 days, log `⏭️ Hermetic job skip: fresh report exists (…)` and return `{ message: 'Fresh report exists', skipped: true }` with 200 — no job created.
- Keep the existing active-job short-circuit; just add the fresh-report short-circuit above it. Log both skip reasons distinctly.

No schema changes. No new tables. No new edge functions.

---

### Technical details

- `useHermeticReportStatus` already exposes `isGenerating` — reuse verbatim for the passive one-liner; no new state.
- `aiPersonalityReportService.generatePersonalityReport` returns quickly enough for fire-and-forget in onboarding; failures are logged, never toasted, never blocking.
- Hermetic-side freshness threshold is 7 days (a 10k-word regeneration is expensive); standard-side is 24h (cheap, but avoid double-dispatch on rapid navigation).
- No changes to: `use-subconscious-orb`, `PresenceFrame`, edge function `companion-oracle-conversation`, any hermetic orchestrator internals.

### Verification

- Build passes.
- `/blueprint` Rapport tab: no hermetic button anywhere; standard button present; if hermetic job is running, one muted "Deep synthesis in progress…" line.
- Fresh onboarding completion → network shows two fire-and-forget invocations (`hermetic-job-creator` and `generate-personality-report`), user is not blocked.
- Rerunning onboarding within 24h logs the standard skip; within 7 days logs the hermetic skip; no duplicate jobs/rows.
- Companion first-contact message present after navigating away and back.

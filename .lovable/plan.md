# SoulSync — Release Notes: 2026‑07‑01 → 2026‑07‑08

The last seven days were a full architectural pivot: the app was reshaped from a six‑section navigation into a chat‑first product where the conversation IS the surface, everything else is a capability the twin wields inside it. Below is what shipped, grouped by theme.

---

## 1. Chat‑first architecture

**Routes collapsed from 17 → 3 user‑facing.**
- Kept: `/companion` (default), `/blueprint`, `/profile`. Plus `/`, `/auth`, `/onboarding` and `/reports/view/:jobId` (future codex).
- Removed from production routing: `/dreams/*`, `/spiritual-growth`, `/get-started`, `/test-environment`, `/test-functions`, `/test-hermetic-intelligence`, `/design-analysis`, `/admin`, `/user-360`.
- New `LegacyRedirect` component: `/dreams` and `/spiritual-growth` redirect to `/companion` with a toast so existing bookmarks don't 404.
- `main.tsx` router fixed to actually mount `OnboardingFlow` (previously pointed at the legacy 9‑step wizard — every prior "shipped" claim had missed this).
- `MainLayout` and `MobileNavigation` rebuilt around the 3‑item nav.

## 2. New 90‑second onboarding

Three screens replace the 9‑step wizard:
1. Birth data — one form, smart defaults, "I don't know my exact time" chip.
2. The reveal — progress starts at 20 %; real blueprint fragments materialize while the chart is cast.
3. First contact — no tutorial, no path choice: user lands in chat where the twin speaks first.

At the end of successful blueprint save, three background jobs fire (non‑blocking):
- `trigger-blueprint-processing` (embeddings).
- `hermeticPersonalityReportService.generateHermeticReport` — deep report, twin's internal memory.
- `aiPersonalityReportService.generatePersonalityReport` — standard user‑facing report, now with a 5‑second retry + `standard_report_pending` marker so silent failures self‑heal on the next `/blueprint` visit.

`Auth.tsx` `getAppBaseUrl()` now uses `window.location.origin` so preview signups stay on preview (previously the confirmation email always bounced users to the last published production build).

## 3. Presence‑as‑orb (the border IS the orb)

The floating orb widget is gone. Presence is now expressed by the border of the conversation.

- New `PresenceFrame.tsx` — 2 px border, three states, CSS‑only animations, `prefers-reduced-motion` respected, never demands action:
  - `idle`: ambient breath (opacity 0.22 → 0.42 over 5 s).
  - `thinking`: soul‑purple → teal gradient sweep (3 s loop) while awaiting the twin reply OR while hermetic generation is in progress.
  - `noticed`: single 1.2 s pulse when a fresh insight arrives.
- Wired in `Coach.tsx` via `useHermeticReportStatus` + `useSubconsciousOrb`.
- Insights rerouted to inline twin messages (max **one** unsolicited insight per session, further insights held silently). No more `HACSInsightDisplay` modals, no confidence bars, no accept/dismiss buttons.
- `FloatingHACSOrb` unmounted from `MainLayout`; underlying services and detection hooks untouched.

## 4. The twin gets hands — Phase 1 wiring

Tool loop that lets the conversation act:

- **`openai-agent`**: new `handleDecomposeGoalAction` / `decomposeGoalReal` router. Loads `user_blueprints` + `hermetic_structured_intelligence` (execution_bias, temporal_biology, identity_constructs) and calls Azure with a strict JSON contract → 4–6 personalised, time‑bounded milestones sequenced toward the verbatim goal. Fixes the bug where `decompose_goal` was silently returning empty milestone arrays.
- **`companion-oracle-conversation`**:
  - `buildStructuredIntelligenceSpine` — injects ~350‑token profile block per turn, closure turns pay no DB cost.
  - `detectShadowCueSync` — one‑line SHADOW CUE (projection → limiting‑belief → resistance priority) appended to system prompt when patterns match.
  - `repairGoalTitle` — scans last 6 user turns, rewrites the model's `args.title` if <60 % token overlap with the user's own phrasing (Dutch verbs included: `verdienen`, `sparen`, `miljoen`).
  - `tool_choice: 'required'` fires when `(acsConfirmation ∨ shortAffirmative ∨ planRequest) ∧ goalInRecentContext`. `planRequest` recognises "i need a plan / help me improve / geef me een plan / decompose / roadmap / verbeteren"; `abstractGoalRegex` accepts abstract goals like "close this chapter", "improve", "shift/transform/grow".
  - Hard fail‑path: `<3` milestones → no `user_goals` insert, no empty DreamCard; tool returns `{ ok: false, reason: 'decomposition_failed' }` so the model narrates a retry.
- Log lines added per turn: `🎯 TOOL CHOICE`, `📐 SPINE`, `🩶 SHADOW CUE` — for verification.

## 5. Cards inside the chat

New message‑part model — assistant messages can carry inline interactive cards rendered from `message.parts[]`:
- `src/components/companion/message-parts/CardShell.tsx` — shared frame.
- `src/components/companion/message-parts/DreamCard.tsx` — collapsed summary + progress bar, expands to milestones, taps speak into the chat.
- Persistence: new `attachments jsonb` column on `conversation_messages` (migration `20260706000000_message_attachments.sql`).

Remaining card types (JourneyCard, FocusTimerCard, HabitCard, GrowthStepCard, ReminderCard, BlueprintFactCard, User360Card) scoped for Phase 2/3.

## 6. Reports pipeline — Rapport tab cleanup + resilience

- Removed both "Hermetisch Rapport (10.000+ woorden)" buttons from `PersonalityReportViewer` — the hermetic job is twin memory, never a user action. Passive "Deep synthesis in progress…" one‑liner surfaces when generation is running; no button, no progress bar.
- Kept "Standaard Rapport" as regenerate/fallback.
- **Idempotency guards**:
  - Standard service skips dispatch if a fresh report (<24 h) exists.
  - `hermetic-job-creator` skips if a hermetic report (<7 d) exists — plus the existing active‑job short‑circuit. Both log skips distinctly.
- **Bug fix**: missing `callChatCompletion` import in `generate-personality-report/index.ts` was throwing on every auto‑trigger. Fixed and deployed.
- **`hermetic-recovery` upgraded**: now doubles as a stalled‑job resumer. When `status='processing'` and `heartbeat > 90 s`, it re‑invokes `hermetic-background-orchestrator`. Rescued live stuck job `9319f50a‑…` (28.57 % → 50 %).
- New `useStandardReportBackfill` hook — auto‑fires on `/blueprint` mount if v1.0 report is missing (24 h backoff via localStorage). Covers users whose onboarding auto‑trigger silently failed.
- `hermetic-recovery-service` guards against stale client‑side job IDs before POSTing (fixes the "Job not found" 500).

## 7. Voice & first‑contact fixes

- First‑contact opening now `saveConversation([opening])` right after append, so it survives navigation instead of vanishing on reload.
- `isStreaming: false` default fixed on first‑contact messages.
- `decompose_goal` tool description hardened: "Do NOT reframe, translate, or abstract the user's stated goal — copy their words into the title verbatim."

## 8. Housekeeping

- CORS headers extended across Supabase functions with `x-supabase-client-platform`, `x-supabase-client-platform-version`, `x-supabase-client-features`.
- Cleanup services removed from cold‑start: `automationWrapper`, `user360Cleanup`, `subscriptionCleanup`, `chatHistoryCleanup`, `useUser360`.
- Full app audit produced (17 routes, 300+ components, 80+ hooks, 140 services, 56 edge functions, ~135 K LOC) — the map used for every consolidation decision above.

---

## Known caveats
- Inline insight append is in‑memory only; persistence to `conversation_messages` still pending.
- `RESISTANCE_PATTERNS` include `"i need to"`, so soft planning statements can arm the shadow cue — one‑line fix if it over‑fires in testing.
- Standard/hermetic report backfill for users whose onboarding pre‑dates the import fix relies on the new `/blueprint` mount hook; users who never visit `/blueprint` won't get their v1.0 report.

## Next up (Phase 2 gate)
Fresh‑account clean run: signup → 3 screens → reveal → twin speaks first → million flow → interrogation → correct‑title DreamCard → "gtg" → exactly one open loop. That recording is the gate for `start_task_session` / FocusCard / Today pin work.

---

### Deliverable

If you approve, I'll write this to `RELEASE_NOTES_2026-07-08.md` at the project root. If you want a shorter changelog‑style version instead (bullet list only, no prose), say so and I'll re‑cut it.

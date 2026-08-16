# Parked

Real, seen, not now.

Nothing here is wrong or forgotten. It is off the path in `THE_PATH.md`, so it
waits. One line each, dated when parked. Items leave this file by being done or
by being deleted on purpose — never by drifting off the bottom.

Add to it freely. That is the point: deferring has to cost nothing and lose
nothing, or it does not happen.

---

## Correctness — things that are actually wrong

| Parked | Item |
|---|---|
| 2026-08-10 | **Two blueprint tables.** `blueprints` (20 flat columns) and `user_blueprints` (one JSONB column) both exist. Onboarding writes the second; the steward hook, MBTI repair and ~8 other hooks read the first. Flagged in `db4745a`'s own commit message seven weeks ago and still true. Suspected cause of several "we fixed that but it didn't take" moments. |
| 2026-08-10 | **`hermetic-recovery` cannot resume a v3 job.** It returns 409 rather than reassembling structured sub-jobs into a corrupt report. Correct refusal; teaching it to actually resume is the real work. |
| 2026-08-10 | **`extract-hermetic-intelligence` hardcodes `extraction_version: '2.0'`** even when reading a report of another generation. |
| 2026-08-16 | **Move to the Responses API.** OpenAI recommends it for multi-turn, tool-calling and reasoning work; `callChatCompletion` still speaks Chat Completions, so reasoning is sent as a flat `reasoning_effort` rather than `reasoning: { effort }`. Works, but it is the older surface. |
| 2026-08-16 | **The frontend still names a model.** `model-router-service` repeats `gpt-5.6-luna` because it sends `modelOverride` and cannot import a Deno module. Two owners that must agree is a drift risk. The end state is that the frontend sends `task` and no model at all. |
| 2026-08-16 | **`hacs-intelligent-conversation` has a duplicate `'ENTP'` key** in its MBTI description map (line 50) — one description silently wins. Pre-existing, found while migrating models, not touched. |
| 2026-08-16 | **`hermetic-report-orchestrator.ts` still calls `gpt-4o-mini` in nine places.** Unrouted dead code; left alone rather than migrated, since deleting it is the right end state. |
| 2026-08-10 | **`PersonalityFusion` holds a duplicate copy of the estimate maths.** It and its only consumer, `src/pages/Onboarding.tsx`, are both unrouted. Deleting both is the right end state. |
| 2026-08-10 | **Dutch typo variants for `why_question`** in the phase tracker — option (a) from the Lovable handoff, deferred at the time. |
| 2026-08-10 | **Two test files fail under vitest** (`pie-scheduling-service`, `adaptive-context-scheduler`) — they use `jest` globals. Pre-existing, unrelated to any recent change. |
| 2026-08-10 | **1851 pre-existing lint errors**, mostly `@typescript-eslint/no-explicit-any`. Unchanged by any recent work; never triaged. |

## Design system — the drift that is left

| Parked | Item |
|---|---|
| 2026-08-10 | **`components/ui` — 64 warnings.** The shadcn primitive layer. Changing it changes every screen at once, including ones nobody has reviewed. Needs its own before-and-after, never a ride-along. |
| 2026-08-10 | **Debug / testing / admin — 128 warnings.** No customer opens these. Candidate for permanent exemption rather than pending work. |
| 2026-08-10 | **Stragglers — ~13 warnings.** Test pages and one-offs. |
| 2026-08-10 | **Motion system not applied to Profiel and echo.** |

## Product — good ideas, off the path

| Parked | Item |
|---|---|
| 2026-08-10 | **Earned Directness** — drafted, never ratified. |
| 2026-08-10 | **Report indexing is not wired into normal generation.** Backfill covered 7 of ~40 users. Worth more once reports are worth indexing. |
| 2026-08-10 | **Distinctiveness calibration against the user population.** Agreed shape: suppression only, never generation — weak base rates can say "don't call this exceptional", never "only 4% have this". Needs a population worth calibrating against. |
| 2026-08-10 | **Relevance as a third factor** alongside resonance and distinctiveness. Requires knowing what the person is currently dealing with, so it is conversation-only and cannot exist at report time. |
| 2026-08-14 | **Enforcing "the four axes are not a seventh framework" in code.** Currently a rule in two prompts. It constrains how consumers use the axes and there is no consumer yet, so enforcement would protect against behaviour nobody has observed. Decide after one `processing_model` has been read. |
| 2026-08-14 | **The Twin reading `processing_model` in conversation.** The synthesis now derives it and stores it; `companion-oracle-conversation` does not read it yet. That wiring belongs with step 6, not before it — the same two-line filter change, one field further. |
| 2026-08-14 | **Living Blueprint refining the four axes from lived evidence.** `would_look_like` exists so a later layer can test a hypothesis against a real week and revise it. Nothing consumes it yet. The constitution already ratifies the mechanism; this is the implementation, and it needs a relationship long enough to have evidence. |
| 2026-08-14 | **Redistributing the specialists by synthesis mechanism** instead of by framework. Closed, not open — see `docs/HERMETIC_V3_PIPELINE.md`. Kept here only so the evidence that would reopen it is written down: mechanism spread collapsed onto one or two across several users, with `lenses_failed` empty and `dropped_single_lens` near zero. |

## Open questions

| Parked | Item |
|---|---|
| 2026-08-10 | `select count(distinct user_id) from blueprint_text_embeddings;` — asked for, never answered. |
| 2026-08-10 | Suppression rate of the `🗺️ CHART BLOCK` gate on live turns, and the `relevantChunks` distribution beside it. Lovable offered to pull both from function logs. |
| 2026-08-14 | **Mechanism spread across users.** The two 3.0 reports differ a lot: 7/18 convergence in one, 13/19 in the other. Convergence is the cheapest mechanism to find. Worth watching over the next handful of reports, not acting on with n=2. |
| 2026-08-14 | **One report listed `thin_ground` as a mechanism.** It is a separate field, not one of the nine — the model is not fully holding the list. No data lost. Prompt-adherence, not correctness. |

---

## On the path, so NOT parked

These are in `THE_PATH.md` and are the only things that get worked on:

- **Step 5** — a 3.0 report has to be read, by a person, and judged true and
  specific. Steps 3 and 4 now pass; this one cannot be passed by code.
- **Step 6** — `companion-oracle-conversation` filters `blueprint_version = '2.0'`,
  so a 3.0 report is invisible to the Twin. Two-line change, but it lands only
  after a 3.0 report exists and has been read.

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

## Open questions

| Parked | Item |
|---|---|
| 2026-08-10 | `select count(distinct user_id) from blueprint_text_embeddings;` — asked for, never answered. |
| 2026-08-10 | Suppression rate of the `🗺️ CHART BLOCK` gate on live turns, and the `relevantChunks` distribution beside it. Lovable offered to pull both from function logs. |

---

## On the path, so NOT parked

These are in `THE_PATH.md` and are the only things that get worked on:

- **Step 3** — a new registration must create a hermetic job. Currently failing.
- **Step 6** — `companion-oracle-conversation` filters `blueprint_version = '2.0'`,
  so a 3.0 report is invisible to the Twin. Two-line change, but it lands only
  after a 3.0 report exists and has been read.

# The Path

One line decides what gets built:

> **A stranger registers, gets a chart, gets a deep report, has a conversation
> that clearly knows them, and says "that's me."**

Nothing gets built that is not on this path until this path works, end to end,
for one real person who is not the founder.

Everything else is real, and goes in `PARKED.md`.

---

## The six steps

Each step is observably true or it is not. No step is "mostly working".

| # | Step | Passes when |
|---|---|---|
| 1 | **Register** | A new account exists and reaches the onboarding form. |
| 2 | **Chart** | `user_blueprints` has a row for that user, `is_active = true`, with all six frameworks populated — `cognition_mbti.type` is not `"Unknown"`. |
| 3 | **Job** | Console shows `✅ Hermetic job created: <id>`. A row exists in `hermetic_processing_jobs` with `status` moving off `pending`. |
| 4 | **Report** | A row in `personality_reports` with `blueprint_version = '3.0'` and `generation_metadata.pipeline = 'v3-observation-synthesis-narration'`. `lenses_failed` empty, `unresolved` and `thin_ground` non-empty. |
| 5 | **Readable** | Blueprint → Report shows that report, header reads `· v3.0`, and two sections read as true and specific. |
| 6 | **Known** | The Twin references the report in ordinary conversation without naming frameworks, and the reader says "that's me." |

### Status

| # | State | Last checked |
|---|---|---|
| 1 | ✅ passes | 2026-08-10 |
| 2 | ✅ passes — the insight names real facets, so the blueprint assembled | 2026-08-10 |
| 3 | ✅ **passes** — the ring is filling on a new registration, which only happens when a job row exists and is progressing | 2026-08-10 |
| 4 | ✅ **passes** — two rows, both `3.0`, both `v3-observation-synthesis-narration`. 50 lenses read, 0 failed, 0 dropped for single-lens sourcing, `unresolved` and `thin_ground` non-empty in both. Chart terms across ~30,000 words: 7 and 4, against a 2.0 baseline of 27 and 46 *in one section* | 2026-08-14 |
| 5 | ❓ unverified — the reports exist and the viewer can show them; nobody has read one yet. **This is the founder's step, not the developer's** | — |
| 6 | ❌ blocked — `companion-oracle-conversation` still filters `blueprint_version = '2.0'` | — |

**The next piece of work is step 5, and it is not code.** The report exists and
the counts are clean. The only remaining question is whether two sections read
as true and specific, and no measurement answers that — it has to be read.
Step 6 stays untouched until it has been.

---

## Working rules

These exist because each one has already cost real time.

### For the developer

1. **Nothing off-path gets built.** When asked for something off-path, say so,
   add it to `PARKED.md`, and carry on. Do not build it, do not argue about it.

2. **No fix without the failure in front of you.** A log line, a query result, a
   stack trace. An inference is called an inference, never a fix. Three
   consecutive fixes aimed at a guessed cause cost a week.

3. **One test answers one question, written before the test.** Anything else
   found during it gets logged, not chased.

4. **Push everything, then open the PR.** Never push to a branch that already has
   an open PR — GitHub merges the head it recorded when the PR opened, and four
   PRs merged incomplete before this was noticed. After every merge, verify the
   merge commit actually contains the work before saying it landed.

5. **Merged is not deployed.** Whenever edge functions change, name exactly which
   ones need deploying. Nothing is "live" until a build stamp or a log line
   proves it.

### For the founder

6. **Spot it, type it, keep going.** Two words is enough — "ring clipped". It
   goes in `PARKED.md`. The test finishes first.

7. **One session, one question.** If the session is "do reports generate", that
   is the session.

---

## Why this document exists

The parts are good and the car is not assembled. The cause is not a lack of
judgement — it is that every correct observation converted immediately into
work, so nothing was ever more important than anything else.

This file is the thing that is more important. `PARKED.md` is where everything
else waits, so that deferring costs nothing and forgets nothing.

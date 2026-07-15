## Steps 1–2: complete

**1. Deploy** — `companion-oracle-conversation` redeployed at **2026-07-15 15:0X UTC** (just now, immediately after the read confirming `🃏 FROZEN TITLE: fidelity guard skipped` and `repairTitleToUserWords` are present in the deployed source at `supabase/functions/companion-oracle-conversation/index.ts` lines 2280 / 2359 / 2377–2379). No other functions deployed.

**2. Cleanup** — deleted 1 row from `user_goals`:
- id: `f6400bfc-0e2e-4113-8ba0-f8f98b415876`
- user_id: `d6f5766e-9ab5-4f31-a215-e831bd32ab28`
- title: `Yes — break down "Reach $1 Million`
- created_at: `2026-07-15 08:59:48.840+00`

Test user has no active dream row again.

## Step 3: awaiting founder action

Please redo the flow in `/companion`:
1. State the goal (e.g. type "i want to reach one million").
2. Wait for the OfferCard to attach.
3. Tap the confirmation button on the OfferCard.

Once you've done that, I will:
- Query `user_goals` for the new row for `d6f5766e-…` and report `title`, milestone count from `goal_milestones` (must be ≥3), and `created_at`.
- Query `conversation_memory` for session `4e67bc72-…` (or the new session id) to reconstruct the turn and report the **offer-time attachment title** (what the OfferCard actually displayed) vs your **original typed message**. That gives us the two side-by-side titles the constitution's rule 9 cares about.

Nominal signal: DreamCard title reads close to your typed words, not "Net Worth Milestone".

## Step 4: log-ingestion outage (out of scope for this repo)

Confirmed no code-side action available: `function_logs` and `function_edge_logs` project-wide 0 rows for 24h+ while `dream_activity_logs` and `conversation_memory` inserts continue — this is the Supabase log-ingestion pipeline, not the app. To be raised as a Supabase support ticket from the dashboard; no build-mode work needed here.

## Technical notes

- Verification for Step 3 uses DB rows and `conversation_memory` reconstruction only (same method used for the prior RCA), since edge stdout markers (`🃏 OFFER CONFIRMED`, `🃏 FROZEN TITLE: fidelity guard skipped`, `🎯 PINNED DECOMPOSE`) are unrecoverable while ingestion is down.
- No code changes are part of this plan — deploy + verify only, per instructions.

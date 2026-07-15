## Goal
Find out why `🃏 OFFER CONFIRMED` (and every other marker) is missing from `companion-oracle-conversation` logs for the last 12 h, so we can retrieve the payload that produced goal `f6400bfc…` at 08:59:48Z.

## What we already know
- Deploy of `companion-oracle-conversation` at **2026-07-15T08:57:57Z** succeeded.
- A goal row was written ~2 min after deploy, so the function DID execute and DID reach the decompose branch.
- `supabase--edge_function_logs` returns "No logs found" for `OFFER`, `OFFER CONFIRMED`, `confirmedAction`, `decompose`.
- `function_logs` analytics table is empty for the last 12 h across ALL functions in this project — not just this one.
- No code will be modified in this plan; investigation only.

## Investigation steps (read-only)

1. **Confirm the outage is project-wide, not function-specific**
   - `supabase--analytics_query` on `function_logs` grouped by `function_id` for the last 24 h to see if ANY function is logging.
   - `supabase--analytics_query` on `function_edge_logs` (HTTP-level) for the last 4 h filtered to the `companion-oracle-conversation` function_id — this table is separate from stdout logs and should show the 08:59 invocation even if stdout ingestion is broken.

2. **Confirm the invocation actually happened at 08:59:48Z**
   - From `function_edge_logs`: capture `execution_time_ms`, `status_code`, `deployment_id`, `version` for the request that immediately preceded the goal row.
   - Cross-check `deployment_id` against the 08:57:57Z deploy to rule out a stale version serving traffic.

3. **Check whether the deployed source actually contains the marker string**
   - Read the deployed `supabase/functions/companion-oracle-conversation/index.ts` in the repo tree and `rg` for `🃏 OFFER CONFIRMED`, `🎯 PINNED DECOMPOSE`, `confirmedAction`. If the emoji/text differs from what we searched for, that alone explains the empty `search` result even if logs exist.

4. **Try marker-free log pulls**
   - `supabase--edge_function_logs` on the function with no `search` filter (most recent N lines) to see if ANY stdout from this function is being ingested.
   - AI-gateway request list filtered by this function's run window — the LLM calls it made will appear there even if stdout logging is down, and their `run_id` can walk the sequence.

5. **Fall back to Postgres side-effects for the payload**
   - Query `coach_action_logs`, `dream_activity_logs`, and `user_activities` between 08:57Z and 09:02Z for `user_id=d6f5766e…` — one of these usually records the `confirmedAction` payload server-side.
   - Query `conversation_messages` / `conversation_memory` for the assistant + user messages that bracket the goal creation so we can reconstruct what title was frozen vs. what got stored.

## Deliverable
A short report answering:
- Is edge-log ingestion broken project-wide, or is it a marker-string mismatch in `companion-oracle-conversation`?
- What was the actual `confirmedAction.title` value at 08:59:48Z (recovered from AI-gateway logs, action logs, or conversation messages)?
- Where the drift happened: OfferCard → client → edge function → user_goals.

No code changes. On approval I will run steps 1–5 in parallel where possible and report back.

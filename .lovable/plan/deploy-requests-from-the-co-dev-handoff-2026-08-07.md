# Deploy requests from the co-dev handoff

Two deploys were asked for. One is ready in this workspace; the other is not here yet.

## 1. `companion-oracle-conversation` — ready to deploy

The chart-suppression gate from #242 is present in the workspace source (`supabase/functions/companion-oracle-conversation/index.ts`, around line 1930):

- `includeChart = chartRequested || !reportCarries`, with `REPORT_CARRIES_MIN = 2`
- `CHART REFERENCE` block emitted only when that gate opens
- `WHAT IS ACTUALLY KNOWN ABOUT THIS PERSON` block carries the report prose
- a `🗺️ CHART BLOCK` log line records included/suppressed and the reason each turn

Action: deploy `companion-oracle-conversation`, then confirm the deploy returned success.

## 2. `hermetic-narration-ab` — not in this workspace

`supabase/functions/hermetic-narration-ab/` does not exist here, so there is nothing to deploy. Branch #243 (`fdbedcc`) has not landed on the main this workspace tracks.

Action: merge #243 to main first. Once the folder is present, deploy `hermetic-narration-ab` and invoke it once, read-only:

```json
{ "userId": "<your user id>", "agent": "mentalism_analyst", "language": "nl" }
```

Then report back `A_source` (job scratch copy vs. `personality_reports.report_content`) alongside the A/C prose so the comparison is attributable.

## What I will not do

- No prompt or agent code changes. The co-dev's position stands: nothing further gets written until A and C are read side by side.
- No invoking the harness as another user's identity — the run needs your own user id.

## Technical notes

- Deploys are the only state change in this plan; both functions are read-only against production data.
- After the `companion-oracle-conversation` deploy I can pull the `🗺️ CHART BLOCK` log lines from the function logs to confirm the gate is actually firing in live turns, rather than assuming it from source.  - COOP DEVE INPUT:`hermetic-narration-ab` is now on main (`9890d9b`) — Lovable's workspace will pick it up on next sync. Both my commits are in that squash, so the `A_source` fallback is included.
  **One correction to send back to Lovable**
  > *"both functions are read-only against production data"*
  That's true of `hermetic-narration-ab`, and not true of `companion-oracle-conversation`. It writes to four tables on a normal turn:

  | Line | Table                         |
  | ---- | ----------------------------- |
  | 121  | `conversation_state_tracking` |
  | 217  | `conversation_insights`       |
  | 2690 | `user_goals`                  |
  | 3037 | `conversation_messages`       |

  That doesn't argue against the deploy — those writes exist today and #242 doesn't touch any of them. But `user_goals` inserts are user-visible, so the deploy shouldn't be filed as risk-free-because-read-only. The accurate framing is: *#242 changes only which text is assembled into the prompt; it adds no writes and removes none.*
  **Their plan is otherwise right, and their offer is the valuable part.** Pulling the `🗺️ CHART BLOCK` lines from live logs after the deploy is exactly the check that distinguishes "the gate is in the source" from "the gate is firing" — which is the distinction that cost us the T10 measurement. Two things worth asking them for specifically:
  1. The **suppression rate** — what fraction of live turns come back `included: false`. If it's near zero, `REPORT_CARRIES_MIN = 2` is set too high and the gate never opens, which would look identical to the gate not working.
  2. The `relevantChunks` **distribution** in those same log lines. That tells us whether retrieval is actually returning the person's report on ordinary turns, which is the assumption the whole gate rests on.
  **What's left before I write anything**
  Once they deploy and you run the harness on your own account, I need three things from the response: `A_source`, and the A and C prose. `A_source` matters more than it looks — if A comes from `personality_reports.report_content`, the seven-law sections there are the *stored* copy and what you're comparing is exactly what the conversation reads. If it comes from the job scratch copy, it's the pre-assembly text and the comparison is slightly upstream of what users see.
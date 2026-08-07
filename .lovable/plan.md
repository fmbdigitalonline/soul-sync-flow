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
- After the `companion-oracle-conversation` deploy I can pull the `🗺️ CHART BLOCK` log lines from the function logs to confirm the gate is actually firing in live turns, rather than assuming it from source.

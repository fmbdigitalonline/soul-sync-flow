# Two-Surface Ratification — Coach OS + Side Panel + Dream absorption

Yes — I understand. The vision is already 80% built; this plan ties the last knots so the Coach page (`/companion`) and the side panel (`ContextualToolsPanel`) behave as one mind with two halves, and Dream OS stops being a destination.

## Vision (what we are locking in)

- **Screen 1 — The Twin (conversation).** `/companion` is the only place dialogue lives. No dashboards, no widget grids, no forms in the stream. Selected sentences → OfferCards → actions. Nothing else.
- **Screen 2 — The Coach Workspace (side panel).** `ContextualToolsPanel` becomes the single acting surface. Overview · Action Hub · Insights · Memories · Tools · History — progressive disclosure, never a wall of tiles.
- **Handshake.** Conversation drives panel context; panel actions surface as twin messages in the stream. Two halves of one mind.
- **UX Law — Three Pieces Rule.** Every panel section shows 1 primary + 2 supporting, then "Show more". No twelve-widget screens.
- **Dream OS is absorbed.** "Dreams" becomes a capability of the Coach (a program type), not a destination. Legacy routes redirect to `/companion`; program state lives in the panel's Action Hub.

## Constitution amendments (v2.5)

1. Vision paragraph: "The Twin helps you think. The Coach helps you act. The conversation is the bridge."
2. Strike the pre-pivot line "only conversation may change state / workspaces are not." The panel executes.
3. Ratify the **Three-Pieces Rule** as UX law for both surfaces.
4. Record panel IA target: **Overview · Actions · Insights · Memories · Tools · History**.
5. Offer-tap rule of thumb: one tap = confirm in stream; a session (multi-step tool) = opens the panel.
6. "Dreams" → programs; legacy label migrated opportunistically, no mass rename.

## Panel redesign — `ContextualToolsPanel`

Target shape (replaces the current 5-tile module grid for the default/`journey`/`hub` context):

```text
┌─ Coach Workspace ────────────────┐
│  OVERVIEW (3 cards, always)      │
│   • Today's Focus                │
│   • Current Conversation Thread  │
│   • Suggested Next Action        │
│  [Show more ▾ → full IA]         │
├──────────────────────────────────┤
│  ACTION HUB  (compressed kanban) │
│   Current · Suggested · Done     │
│   (3 items each, Show more)      │
├──────────────────────────────────┤
│  INSIGHTS · MEMORIES · TOOLS ·   │
│  HISTORY   (collapsed sections)  │
└──────────────────────────────────┘
```

- **Overview cards** are wired to real signals (active program, last user turn subject, next-best-action derived from the same rail that deals OfferCards). No mock data.
- **Action Hub** is the existing kanban status machine (`in-progress / todo / completed`) compressed to 3+Show-more per column. No new engine.
- **Sections below** are collapsed by default (progressive disclosure). Existing widgets (Inzichten, memory tiles, tools) become drawers inside these sections — not deleted, just moved and gated behind Show-more.
- Current context-specific tool trees (`journey/task-coach/focus/tasks/milestones/hub/chat/create`) stay as internal state; the outer shell is always the same six-section IA so the panel stops feeling like a different screen per context.

## Coach page (`/companion`) — the Twin surface

- No visual redesign of the conversation itself (already clean).
- Confirm the **handshake wiring** both directions:
  - Sentence selection → OfferCard → single-tap actions confirm in-stream (already works). Multi-step tools (compare-to-HD, journaling session, program planner) set panel context and open the panel with a subtle nudge — no navigation.
  - Panel actions (complete task, start timer, finish milestone) emit a twin message into the stream so the twin stays aware.
- Sentence menu stays: Go Deeper · Next Action · Challenge · Save Insight · Dream This. **Save Insight is currently fake (toast only)** — must be wired to real memory writes before it keeps shipping in that menu (tracked as follow-up, not part of this slice).

## Dream OS absorption

- `/dream*` routes → redirect to `/companion` (keep deep-link params so programs open the panel to the right program).
- Dream discovery/creation flows are already reachable via OfferCards ("Dream This", program intake card). Remove Dream from primary nav if still present; keep the underlying services as headless capabilities the Coach wields.
- Existing program/milestone data becomes the Action Hub's source of truth — no schema change.

## Slice order (buildable in this order, each shippable)

1. **Slice A — Panel shell + Overview (Three-Pieces).** Rebuild the panel's default view as the six-section IA with Overview's three real cards. Current tiles move into `Show more`. Read-only wiring first.
2. **Slice B — Action Hub compressed.** Wire the existing kanban data into the Actions section (3 per column + Show more). Panel-side execute → stream echo.
3. **Slice C — Handshake polish.** Multi-step OfferCards open the panel with the correct context; sentence-selection actions that belong in the panel route there instead of confirming in-stream.
4. **Slice D — Dream absorption.** `/dream*` redirects; nav item removed; program intake surfaces only via OfferCards.
5. **Slice E — Constitution v2.5 written to `SOULSYNC_CONSTITUTION.md**` capturing the six amendments above.

## Open decisions I need from you before building Slice A

1. **Overview cards content.** Confirm the three: `Today's Focus` (active program milestone) · `Current Thread` (last-turn subject + return-to-chat) · `Suggested Next Action` (rail-dealt). Swap any?
2. **Offer-tap default.** Ratify "one tap = stream, session = panel" as the rule, or override.
3. **Dream nav removal.** OK to remove any remaining Dream nav entries and redirect `/dream*` → `/companion` in Slice D? - keep that dont delete anything yet
4. **Section names.** Keep `Overview · Actions · Insights · Memories · Tools · History`, or rename any (e.g. `Action Hub` vs `Actions`)?

Answer those four and I'll start with Slice A (panel shell + Overview) and the v2.5 amendment in  -De parallel. Dev note keep, top and bodom navnigation bars and items
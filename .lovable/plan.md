# Absorb Journey/Tasks into the Coach side panel

The conversation stays the Twin. Everything the user showed in images 2–9 (decomposition loading, journey overview, roadmap milestones, milestone detail, focus mode, task board, task working-instructions, help history) becomes **panel-scoped views** inside `CoachWorkspaceShell`, gated by the Three-Pieces Rule. No new destination pages, no cognitive overload. Existing Dream/Tasks routes stay reachable via redirect (Slice D already did that) so nothing regresses.

## Behavior contract (what the user will see)

Panel auto-opens via `emitCoachOpen({ section })` whenever the Twin commits to an action. Panel is the ONLY surface for these views going forward:

1. **User confirms "create journey" in chat** → panel opens to a new **Journey Progress card** in Overview showing live decomposition stages (Analyzing → Creating → Designing → Preparing) — same feedback as image 3, but compact.
2. **Decomposition succeeds** → Overview's "Today's Focus" auto-binds to the new program's first milestone. A one-line success toast replaces the full "Congratulations" screen (image 4).
3. **Actions section** (already exists as ActionHub kanban) gains a **Milestone Roadmap drawer**: 3 milestones visible → "Show N more" (image 5 compressed).
4. **Tap a milestone** → panel swaps Actions section into **Milestone Focus view**: title, target date, blueprint alignment (3 traits max), and 3 tasks max with "Show more" (images 6 + 7 compressed into one card).
5. **Tap a task** → panel swaps into **Task Working view**: task title, Mark Done, working instructions (3 steps visible), and a scoped "Ask the coach about this task" input that routes back into the main conversation with task context (images 8 + 9 compressed).
6. **Insights section** absorbs the "Help History" list — 3 recent interactive-help entries, then "Show more".

Back navigation inside the panel uses a breadcrumb (Overview › Milestone › Task), never a full-page route change.

## Slices

**Slice F — Decomposition inside the panel**
- New `PanelDecompositionCard` (in `src/components/Layout/panel/`) driven by `useDecompositionLogic` events. Renders the 4-stage progress inline (compact version of `EnhancedProgressAnimation`).
- Wire `HACSChatInterface`'s OfferCard confirm to also `emitCoachOpen({ section: 'actions', view: 'decomposition' })` and pipe the decomposition hook's state through the bus.
- Kill the full-screen `DreamDecompositionPage` visual for in-panel confirmations. Legacy route still works.

**Slice G — Journey/Milestones view in Actions**
- Extend `ActionHub` with a `view` prop: `'kanban' | 'roadmap' | 'milestone'`.
- `roadmap`: 3 milestones from primary program, "Show N more" reveals rest (compressed image 5).
- `milestone`: single-milestone panel with 3 blueprint traits + 3 next tasks (compressed images 6+7). Tap-through updates internal panel state, not the router.

**Slice H — Task Working view**
- New `PanelTaskWorking` component: reuses `use-task-assistant` and existing working-instructions services, but stripped to 3 primary controls (Mark Done, next 3 steps, ask-coach input).
- Ask-coach input dispatches `emitCoachOpen({ section: null })` (close panel) and posts the message into `use-hacs-conversation` with task context — the twin answers in the main thread.

**Slice I — Insights = Help History**
- Populate the existing Insights drawer in `CoachWorkspaceShell` with the last 3 help-history entries from `assistance-response-persistence-service`, then "Show more".

**Slice J — Bus + breadcrumb plumbing**
- Extend `coach-workspace-bus` payload: `{ section, view?, milestoneId?, taskId? }`.
- `CoachWorkspaceShell` holds the panel-local navigation stack and renders a small breadcrumb header when depth > 0.
- Reset stack when the user changes conversation subject.

## What is NOT changing

- No new routes. Dream/Tasks routes remain as legacy redirects to `/companion`.
- No changes to decomposition edge functions, `use-journey-goals`, `use-task-assistant`, or blueprint alignment logic. This is a presentation refactor.
- ActionHub kanban stays the default Actions view; roadmap/milestone/task views are progressive.
- Three-Pieces Rule enforced everywhere: primary + 2 supporting + "Show more".

## Technical notes (for review)

- New files: `src/components/Layout/panel/PanelDecompositionCard.tsx`, `PanelMilestoneView.tsx`, `PanelTaskWorking.tsx`, `PanelBreadcrumb.tsx`.
- Edited: `CoachWorkspaceShell.tsx` (view stack + breadcrumb), `ActionHub.tsx` (view prop), `coach-workspace-bus.ts` (extended payload), `HACSChatInterface.tsx` (dispatch decomposition view on OfferCard confirm), `Coach.tsx` (surface decomposition state to bus).
- No DB migrations. No edge-function deploys.
- Constitution bump to v2.6 recording: "Journey, milestones, tasks, and their live-progress surfaces render inside the Coach panel; the conversation remains the only other screen."

Say the word and I'll ship Slice F first (decomposition-in-panel) so you can see the handshake end-to-end, then G/H/I/J.

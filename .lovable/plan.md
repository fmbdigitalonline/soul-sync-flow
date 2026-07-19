## Diagnosis (verified from code reads)

**Cause A — State loss on panel close (the "resets every time" symptom):**
`MainLayout` renders `<ContextualToolsPanel>` inside a shadcn `<Sheet>`. Sheet **unmounts its children when closed**. All non-context state currently lives inside those unmounted components:
- `PanelDreamFlow`: `phase`, `decomposedGoal`, `showAllMilestones`.
- `DreamDecompositionPage` inside it: the whole staged-build progress and any created goal.
- `CoachWorkspaceShell`: `openSections`, `selection`, `decompActive`, `knownGoalIdsRef`.
`WorkspaceContext` only persists `pendingIntake`, so closing the sheet mid-build (or after "ready") throws away the built journey and forces a restart.

**Cause B — Panel buttons that "do nothing" (Tap / Continue in chat / Start task):**
Every panel action ultimately dispatches `window` event `coach-workspace:ask`. The only listener for that event lives in `src/pages/Coach.tsx` (line 174). Current route is `/`, not `/companion`, so the Coach page isn't mounted and no listener exists → the click is a no-op with no visible feedback. The milestone "Tap" also only fires `ask` — it never opens a milestone detail view inside the panel, so even on `/companion` it just posts a chat line instead of drilling in.

**Secondary issues surfaced by the screenshot:**
- The `×` on the "Journey Ready" card calls `clearPendingIntake()` and resets `phase`, so a stray close destroys the built journey with no undo.
- Milestone "Tap" label suggests navigation, but it's a chat prompt — label/behavior mismatch.

---

## Plan (UI/handoff only — no engine or service changes)

### 1. Persist workspace state across Sheet close/reopen
Hoist the ephemeral panel state into `WorkspaceContext` so the Sheet can unmount safely:
- Add to context: `dreamFlow: { phase: 'building' | 'ready'; decomposedGoal: any | null; showAllMilestones: boolean }`, plus `openSections`, `selection`, and `insightsExpanded`.
- Provide setters: `setDreamFlow(patch)`, `setOpenSections`, `setSelection`.
- Mirror `dreamFlow` and `pendingIntake` to `sessionStorage` (key `coach-workspace:state:v1`) so a full remount / reload doesn't wipe an in-flight build.
- `PanelDreamFlow` reads/writes `dreamFlow` from context instead of local `useState`. `CoachWorkspaceShell` reads/writes `openSections`/`selection` from context.
- Keep `DreamDecompositionPage` running by making the Sheet content **stay mounted while a build is active**: pass `forceMount` on `SheetContent` and toggle CSS visibility via `data-state`, only for the panel wrapper (guarded by `dreamFlow.phase === 'building' || pendingIntake`). This preserves the underlying engine progress without touching the engine itself.

### 2. Make the "×" non-destructive
- `×` on the Journey Ready card should **collapse the card** (set a `dreamFlow.dismissed` flag), not clear the intake or built goal. Add a small "Reopen journey card" chip inside the Overview when dismissed. Only an explicit "Start a new journey" action clears state.

### 3. Move the `coach-workspace:ask` listener to app-level so panel buttons always work
- Extract the listener currently in `Coach.tsx` (lines 171–186) into a small hook `useCoachAskBridge()` mounted once in `WorkspaceProvider` (or `MainLayout`), so any route with the panel open can receive taps.
- Behavior: if the current route isn't `/companion`, first `navigate('/companion')`, then forward the prompt to the conversation. Keep the existing Coach.tsx logic as the receiver via a secondary event `coach-workspace:ask:deliver` (dispatched after nav) so `useHACSConversation` still owns the send. No conversation logic changes.
- Add a toast on dispatch ("Sending to your Twin…") so taps always give visible feedback even before the chat page mounts.

### 4. Make milestone "Tap" actually drill into the panel
- In `PanelDreamFlow`, clicking a milestone in `MilestonesRoadmap` should:
  1. Set `selection = { goalId: decomposedGoal.id, milestoneId }` in context.
  2. Auto-open the Actions drawer.
  3. Scroll the panel to the Actions section.
- This surfaces the existing `PanelMilestoneView` (already wired in the shell) with its "Continue in chat" button. The chat handoff still uses the app-level bridge from step 3.

### 5. Wire ActionHub buttons the same way
- Audit `ActionHub.tsx` for tap targets that assume `onSelectMilestone` is wired. Ensure every button either mutates `selection` in context or dispatches through the app-level ask bridge. No new features, just make current controls reach a listener.

### 6. Verification (must pass before marking done)
- With panel closed on `/` (Home), tapping the tools trigger opens panel → in-flight decomposition still shows (session-restored) → Tap on milestone opens `PanelMilestoneView` → "Continue in chat" navigates to `/companion` and the prompt appears as a sent message.
- Close and reopen the sheet mid-build: `DreamDecompositionPage` continues from where it was (no restart).
- Click `×` on Journey Ready: card collapses, built goal preserved, chip to reopen appears.
- All three panel action pathways (Focus "Continue in chat", milestone "Tap", task "Start") produce a chat message in every route, not just `/companion`.

### Files touched (UI/handoff only)
- `src/contexts/WorkspaceContext.tsx` — add persisted state slots + setters + sessionStorage mirror.
- `src/components/Layout/panel/PanelDreamFlow.tsx` — read/write context; non-destructive `×`.
- `src/components/Layout/CoachWorkspaceShell.tsx` — read/write `openSections`/`selection` from context; hook up milestone drill-in.
- `src/components/Layout/MainLayout.tsx` — `forceMount` on `SheetContent` when a build is active.
- `src/hooks/use-coach-ask-bridge.ts` (new) — app-level listener with route-aware forwarding.
- `src/pages/Coach.tsx` — replace inline listener with `useCoachAskBridge` receiver hook (no logic change).
- `src/components/Layout/ActionHub.tsx` — audit taps only.

### Out of scope (explicitly not touched)
- `DreamDecompositionPage` internals, `useJourneyGoals`, edge functions, chat streaming logic, orb/presence services.
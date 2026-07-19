RCA: the buttons are not truly unbound, but they are wired to an invisible handoff path instead of the side-panel actions the UI implies.

What I verified:

1. Milestone card / chevron
- `MilestonesRoadmap` does call `onMilestoneClick`.
- In `PanelDreamFlow`, that handler only dispatches `coach-workspace:ask` with a prompt like “Tell me more about the milestone…”.
- It does not open the milestone detail view in the panel, does not expand Actions, and does not change visible panel state.
- So the tap can send a hidden chat prompt, but the panel itself appears unchanged.

2. “Continue in chat”
- `FocusCard` calls `askCoach()`.
- `askCoach()` only dispatches `coach-workspace:ask`.
- On `/companion`, the bridge delivers the prompt to the conversation behind the open side panel; it does not close the panel or show a reliable visible confirmation.
- In the session replay, I can see a Twin response about the milestone, so at least one tap did reach chat. The user-facing problem is that the action is hidden behind the panel, making it feel dead.

3. “Start This Task”
- `RecommendedTask` calls `onStartTask`.
- `PanelDreamFlow` shows `toast.success(...)` and dispatches `coach-workspace:ask`.
- It does not open task detail, start a task state, or show a task workflow in the panel.
- Also, that toast uses `sonner`, but the app currently mounts only the shadcn `Toaster`, not the Sonner toaster. So the intended feedback is likely not visible.

4. Additional mobile issue
- `MainLayout` renders two mobile/tablet Sheet instances controlled by the same `isToolsOpen` state.
- That can create duplicate panel content and duplicate local component instances, which makes state/selection feel inconsistent and contributes to “I clicked and nothing changed.”

Exact problem:
The UI labels promise panel-local actions, but the implementation mostly posts prompts to chat, often behind the still-open panel, with feedback routed through an unmounted toast system. The milestone and task buttons therefore feel dead even when an event fires.

Fix plan:

1. Make milestone taps panel-local first
- Extend `WorkspaceContext` with persistent panel selection state: `{ goalId, milestoneId }` plus open section state.
- In `PanelDreamFlow`, change `onMilestoneClick` to set the selected milestone and open the Actions section instead of only sending a chat prompt.
- Keep “Continue in chat” inside the milestone detail as the explicit chat handoff.

2. Make “Continue in chat” visibly hand off
- When `coach-workspace:ask` fires, show feedback through the mounted shadcn toast system or mount the Sonner toaster consistently.
- If already on `/companion`, either close/collapse the panel or show an in-panel “Sent to Twin” state so the user sees the click worked.

3. Make “Start This Task” activate a real visible flow
- Do not only dispatch a chat prompt.
- Route it to a panel-local task detail/working-instructions view if available, or explicitly hand off to chat with visible confirmation.
- Keep the Three-Pieces Rule: show max 3 task instructions/items before “Show more.”

4. Remove duplicate mobile Sheet rendering
- Keep one mobile/tablet Coach side panel instance in `MainLayout`.
- This prevents duplicate panel trees and local state inconsistencies.

5. Persist side-panel UI state
- Move `CoachWorkspaceShell` local `selection` and `openSections` into `WorkspaceContext` with sessionStorage mirroring.
- Closing/reopening the side panel should preserve selected milestone/task and expanded section.

6. Verify after implementation
- Tap milestone card: Actions opens and milestone detail is visible in the panel.
- Tap “Continue in chat”: prompt appears in chat and user gets visible feedback.
- Tap “Start This Task”: task flow/detail becomes visible or explicit chat handoff is visible.
- Close/reopen panel: no reset.
- Test on mobile viewport, because the screenshots are mobile-sized.
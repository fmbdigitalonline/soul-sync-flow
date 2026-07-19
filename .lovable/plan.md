## Goal

Collapse the "Help me achieve this" side-panel flow from a multi-section dashboard into a linear "one moment at a time" experience. Keep the architecture (WorkspaceContext, PanelDreamFlow, decomposition service, milestones, tasks, coach dock) untouched — only change what is visible at each step.

## The rule

At any moment, the panel shows **one thing the user can do next**. Everything else is either already done, tucked behind "Show more", or waits until the current step is complete.

## New moment sequence (Achievement flow)

```text
Moment 1  Coach speaks         "Here's the plan I made for you."
                               → [Continue]

Moment 2  First milestone      "Let's start here: <milestone title>"
                               → [Start today's task]   (secondary: See full plan)

Moment 3  Today's task         Title • 1 duration chip • 1 time chip
                               → [Start]                (secondary: Not today)

Moment 4  Working together     PanelCoachDock only, task context pinned at top
                               → [Mark done]            (secondary: Pause)

Moment 5  Done                 "Nice. That's today handled."
                               → [What's next] [See progress] [See the plan]
```

No section headers (Overview / Actions / Insights / Memories / Tools / History) are visible during the flow. They become reachable only from Moment 5's "See progress / See the plan", or from a single unobtrusive "Show more" affordance at the bottom of any moment.

## Files touched (UI only)

1. `**src/components/Layout/panel/PanelDreamFlow.tsx**` — replace the current stacked layout (decomposition card + roadmap + milestone view + task view all reachable simultaneously) with a single `momentStage` switch: `intro | milestone | task | working | done`. Drives off existing `dreamFlow` state in `WorkspaceContext`; add one field `momentStage` (persisted to sessionStorage like the rest).
2. `**src/contexts/WorkspaceContext.tsx**` — add `momentStage` + `advanceMoment()` / `backMoment()`. No changes to decomposition, goals, or task data.
3. `**src/components/Layout/panel/CoachWorkspaceShell.tsx**` — while `dreamFlow.phase !== 'idle'`, hide the six-section IA and render only `PanelDreamFlow`. Sections return automatically at Moment 5 or via "Show more".
4. `**src/components/Layout/panel/PanelMilestoneView.tsx**` — strip to: milestone title, one-line coach intro, single primary CTA. Move the 3 blueprint traits + 3 next steps behind a collapsed "Why this fits" disclosure (closed by default).
5. `**src/components/Layout/panel/PanelTaskView.tsx**` — reduce to: task title, ≤2 chips (duration, time of day), single "Start" button. Everything else (brief, insights, memories, history) behind one "Show more" toggle.
6. **Rename copy** in `PanelDreamFlow` / milestone header: "My Journey Roadmap" → contextual "Here's the plan I made for you" (Moment 1) and "Your plan" (when revisited from Moment 5).
7. **Bridge sentence between Moments 2→3**: inject a one-line coach line ("Let's begin with your first milestone.") in `PanelMilestoneView` before the task appears, addressing the "slightly abrupt" transition the feedback flagged.

## What is explicitly NOT changed

- No service, hook, or edge-function logic.
- No changes to decomposition, goals, milestones, tasks data model.
- No changes to the Transformation flow (separate concern; feedback said it's fine as-is).
- No routing changes; `/companion` + side panel stay put.
- Sections (Actions/Insights/Memories/Tools/History) still exist — just hidden during an active moment sequence.

## Verification

- Manual walk-through on `/companion` (mobile 767×1024 viewport per current preview): select sentence → Help me achieve this → confirm each moment shows exactly one primary CTA.
- Confirm sessionStorage restore mid-flow lands the user back on the same moment, not a reset.
- Typecheck clean. -DEV NOTE: Yes—the developer is **substantially aligned with the simplified UX direction**. This plan finally treats the achievement flow as a guided sequence rather than a dashboard.
  The central rule is correct:
  > At any moment, show one clear next action.
  The proposed sequence also makes sense:
  ```text
  Coach introduces the plan
  → identifies the first milestone
  → presents today’s task
  → works alongside the user
  → acknowledges completion

  ```
  That is understandable to a first-time user and preserves the sophistication underneath.
  However, I would correct five details before approving it.
  ## 1. Moment 1 may be an unnecessary click
  This:
  > “Here’s the plan I made for you.”  
  > Continue
  adds a screen without adding a decision or useful information.
  For a user already at risk of dropping off, every click must earn its place. I would combine Moments 1 and 2:
  ```text
  Here’s where I suggest we start

  <first milestone title>

  [Start today’s task]

  See the full plan

  ```
  This removes one transition and gets the user closer to value.
  Keep a separate introduction only while the plan is still being generated and the user needs feedback that something is happening.
  ## 2. The bridge sentence is in the wrong transition
  The plan says to insert:
  > “Let’s begin with your first milestone.”
  between Moments 2 and 3.
  But Moment 2 already displays the first milestone. At that point the bridge into the task should say:
  > **Here’s your first step.**
  or:
  > **Let’s start with one small action.**
  Otherwise the interface introduces the same milestone twice.
  A clean sequence would be:
  ```text
  Moment 1
  Here’s where I suggest we start:
  <Milestone>

  Moment 2
  Here’s your first step:
  <Task>

  ```
  ## 3. “Show more” must not reopen the old dashboard
  This is the largest risk.
  The proposal says the old sections remain reachable through an unobtrusive “Show more” at the bottom of any moment. If that button reveals:
  - Actions
  - Insights
  - Memories
  - Tools
  - History
  - roadmap
  - explanations
  then the cognitive-overload problem is merely hidden behind one tap.
  During the active flow, **Show more should reveal context for the current moment only**.
  Examples:
  ### Milestone moment
  Show more:
  - Why this milestone
  - Where it sits in the plan
  - Blueprint relevance
  ### Task moment
  Show more:
  - Short task instructions
  - Why this fits
  - What completion means
  ### Working moment
  Show more:
  - Task instructions
  - Pause options
  - Relevant support
  The complete Coach OS navigation should be a separate explicit escape, such as:
  > **Leave guided mode**
  not the result of a generic disclosure.
  ## 4. The visibility logic is contradictory
  The proposal says:
  > Hide the six-section IA while `dreamFlow.phase !== 'idle'`.
  But it also says:
  > Sections return automatically at Moment 5.
  At Moment 5, the dream flow may still be active, so those two rules conflict.
  The visibility condition should depend on the new presentation state, not only the old phase:
  ```ts
  const isGuidedAchievementMoment =
    dreamFlow.phase !== "idle" &&
    dreamFlow.momentStage !== "done";

  ```
  Even then, I would not automatically restore all sections at completion. That could turn the calm completion moment into the old dashboard again.
  Moment 5 should remain focused:
  ```text
  Nice. That’s today handled.

  [What’s next]

  See progress
  See the plan

  ```
  Only the chosen destination should open afterward.
  ## 5. The task-working transition needs a defined state
  The proposal says Moment 4 shows:
  > `PanelCoachDock` only, task context pinned at top.
  That is directionally right, but the user still needs to know:
  - what they are doing;
  - whether the task is running;
  - how to finish;
  - how to leave safely.
  Keep it extremely small:
  ```text
  Today’s task
  Reflect on moments when you felt stuck

  30 minutes

  [Mark done]

  Pause

  ```
  Then place the Coach interaction immediately below it. Do not make the pinned task context another dense card.
  ## A better final sequence
  I would approve this version:
  ### Moment 1 — Recommended starting point
  > **Here’s where I suggest we start**
  Milestone title  
  One brief supporting sentence
  **Start today’s step**
  Secondary: See the plan
  ---
  ### Moment 2 — Today’s step
  > **Here’s your first step**
  Task title  
  30 minutes · Morning
  **Start**
  Secondary: Not today
  Disclosure: Show details
  ---
  ### Moment 3 — Work together
  Task title, shown compactly  
  Coach conversation
  **Mark done**
  Secondary: Pause
  ---
  ### Moment 4 — Completion
  > **Nice. That’s today handled.**
  One brief statement of what was completed
  **What’s next**
  Secondary:
  - See progress
  - See the plan
  This reduces the sequence from five moments to four and removes the low-value Continue step.
  ## One technical caution
  Adding `momentStage` to the global `WorkspaceContext` is reasonable if multiple panel components must respond to it and restoration matters. But `advanceMoment()` and `backMoment()` may be unnecessarily rigid.
  Different paths may skip stages—for example:
  - resuming an active task should open directly in `working`;
  - revisiting an existing plan might skip the introduction;
  - a task already completed should open in `done`.
  Prefer explicit transitions:
  ```ts
  setMomentStage("task");
  setMomentStage("working");
  setMomentStage("done");

  ```
  You can still provide convenience functions locally in `PanelDreamFlow`.
  ## Verdict
  **Core UX principle: aligned.**  
  **Linear moment model: aligned.**  
  **Reduction of visible information: aligned.**  
  **Reuse of the existing system: aligned.**
  Before implementation, I would require these corrections:
  1. Merge the intro and milestone moments.
  2. Make “Show more” reveal only current-moment context.
  3. Resolve the Moment 5/`phase !== idle` visibility conflict.
  4. Keep completion calm instead of automatically restoring the dashboard.
  5. Define the working state as a compact task header plus Coach interaction.
  With those changes, the developer is fully aligned with the “my mother or a 12-year-old can use it” design brief.
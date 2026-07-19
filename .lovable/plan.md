# Wire Spiritual Growth into the Transformation Flow

Turn "Help me change this pattern" into a single orchestrated journey inside the Coach panel. The existing Spiritual Growth components stay — they become **stages and capabilities** invoked contextually, never destinations the user navigates to.

`/spiritual-growth` remains as a legacy direct-entry page. All sentence-triggered transformation runs entirely inside `PanelTransformIntake` (rebuilt) — no full-page navigation, no tile grids, no tool menus.

## The single decision point

After the user picks 🌱 on a sentence, one card appears:

```text
Help me transform this
"You often suppress your own needs to avoid disappointing others."

  → Work through this now
  → Start a transformation program
  → See the bigger pattern
```

Three routes. Everything already built lives underneath one of them.

## Route mapping (existing components → transformation stages)

```text
intake ──┬── immediate      ── ReflectiveGrowthInterface + ImmediateGrowthInterface
         │                     + MoodTracker / ReflectionPrompts / InsightJournal
         │                       (invoked contextually, never as a "Tools" menu)
         │
         ├── program        ── PanelTransformIntake (current confirm/build/ready)
         │                     + GrowthBeliefDrilling (one question at a time)
         │                     + RootCauseConfirmation
         │                     + GrowthProgramGeneration
         │                     → workspace: EnhancedProgramDisplay / WeekDetailView
         │                                  / JourneyEngine (compressed to 3 blocks)
         │
         └── pattern_scope  ── LifeOperatingSystemDomainFocus  (Check this life area)
                              ConversationalAssessment         (Explore in conversation)
                              LifeOperatingSystemDashboard     (Review full Life OS)
                              + ProgressiveJourneyAssessment as follow-up
```

## New state machine (replaces the old ActiveView)

Owned by `WorkspaceContext.dreamFlow` extension (add `transformFlow`):

```text
transform_intake
  ├── transform_now
  │     ├── transform_reflection   (ReflectionPrompts)
  │     ├── transform_exercise     (Reflective/Immediate chat)
  │     └── transform_micro_action (one small commit → InsightJournal)
  ├── transform_program_confirm    (Coach's interpretation card)
  ├── transform_program_belief     (GrowthBeliefDrilling, one Q/screen)
  ├── transform_program_root       (RootCauseConfirmation)
  ├── transform_program_generate   (GrowthProgramGeneration)
  └── transform_program_workspace  (3-block overview)
  └── transform_pattern_scope
        ├── transform_domain_focus
        ├── transform_guided_assessment
        └── transform_full_overview
```

## Transformation seed (structured context)

Extend `PendingTransformIntake` in `WorkspaceContext` from `{ pattern }` to:

```ts
type TransformSeed = {
  selectedPassage: string;
  sourceMessageId?: string;
  conversationContext?: string;
  inferredDomain?: LifeDomain;      // from transformation-intake-service.inferDomains
  inferredPattern?: string;         // short label
  inferredBelief?: string;          // seed for belief drilling
  blueprintEvidence?: string[];     // 1-2 trait cues (MBTI/HD/Sun)
  relatedProgramId?: string;        // if an active program already covers this domain
};
```

Populate at selection time in `HACSChatInterface` before opening the panel.

## Route 1 — Work through this now (immediate)

New file: `src/components/Layout/panel/transform/TransformImmediate.tsx`

Container 1 — "What is happening?"

- Coach reflects the inferred pattern, asks one focused question via `useEnhancedAICoach("coach", "spiritual-growth")` seeded with the passage.
- Three interactions only: Answer / I'm not sure / Show another question.

Container 2 — "What would help now?" (max 3, contextual)

- Name what you feel → mounts `MoodTracker` inline (writes via `addMoodEntry`)
- Explore the belief → mounts `ReflectionPrompts` (`addReflectionEntry`)
- Capture a realization → mounts `InsightJournal` (`addInsightEntry`)
- Continue conversationally → keeps `ReflectiveGrowthInterface` open

No "Tools" label anywhere. The Coach picks which of the three to surface based on the last answer.

## Route 2 — Start a transformation program

Rebuild `PanelTransformIntake` phases so the sentence seeds the flow:

1. **Confirm interpretation** — replaces the raw domain-chip grid:
  ```text
   Here's what I think you want to transform
   • Pattern: <inferredPattern>
   • Likely domain: <inferredDomain>
   • Possible belief: <inferredBelief>
   [Yes, continue] [Adjust this] [I'm not sure]
  ```
   "Adjust this" falls back to the current domain chip picker (all 12, with the Three-Pieces "More…" pattern already implemented).
2. **Belief exploration** — mount `GrowthBeliefDrilling` but render **one question per screen** (wrap it in a paginating shell that consumes its questions array). Max 3 belief candidates + "Something else".
3. **Root confirmation** — mount `RootCauseConfirmation` with the drilled belief.
  - Actions: `Yes, build my program` / `Refine it` / `Work through it without a program` (→ jumps to Route 1 seeded with the refined belief).
4. **Program generation** — mount `GrowthProgramGeneration` (already wired through `growth-program-generation-service`; keep the current activation + `pattern_seed` provenance from `transformation-intake-service.createTransformationProgram`).
5. **Workspace** — replace the current weekly-arc list with the 3-block overview (see below).

## Route 3 — See the bigger pattern

New file: `src/components/Layout/panel/transform/TransformPatternScope.tsx`

Entry container (max 3):

- Check this life area → mounts `LifeOperatingSystemDomainFocus` (domain prefilled from seed).
- Explore it through conversation → mounts `ConversationalAssessment`.
- Review my full Life OS → mounts `LifeOperatingSystemDashboard`.

`ProgressiveJourneyAssessment` surfaces automatically after "Check this life area" when `useLifeOrchestrator.needsAssessment` says more evidence is needed. Uses existing `useLifeOrchestrator` + `LifeWheelVisualization` + `GapAnalysisDashboard` inside those components (unchanged).

`LifeOperatingSystemChoices` is not used in this path — the Coach picks the right option contextually.

## Transformation workspace (post-start overview)

Once immediate or program is running, the panel Overview switches to a stable hierarchy — **one always-visible block, two collapsible blocks** (Three-Pieces Rule):

```text
Current transformation      ← program.title or seed pattern
Where I am                  ← "Week 2 · Belief excavation · 35%"
What's next                 ← next practice + duration
[Show more]
  Journey (max 3)           ← current week / latest insight / next milestone
  [Show more]
  Support (max 3)           ← Reflect with Coach / Log how I feel / Review my patterns
                              (routes to ReflectiveGrowthInterface / MoodTracker / WeeklyInsights)
```

Coaching itself happens in the existing `PanelCoachDock` with `contextKey = transform_${programId}` (already in place).

## Recent activity feed → progress summary

Replace the raw 10-event list from `user_activities` with a summarized "Recent growth" block (3 lines max):

- Count reflections in the last 7 days
- Count belief shifts / insights
- Mood delta across recent check-ins

Details behind a `View activity` disclosure. Types (`reflection_entry`, `insight_entry`, `mood_entry`, `task_completed`, `ritual_completed`, `blueprint_sync`, `growth_task`, `growth_check_in`) stay internal — user sees meaning, not event names.

## Personalization (silent)

Blueprint traits from `useBlueprintCache`/`useBlueprintData` (MBTI, Human Design, Sun sign, preferred_name) already flow into `createTransformationProgram`. Extend that mapping to also modulate:

- tone/verbosity of `useEnhancedAICoach` system prompt for immediate route
- session length (short vs deep) via a `pace` param passed to `growthProgramGenerationService`
- reflective vs action-first ordering of the "What would help now?" chips

Never render as a trait list. Optionally a single line: "This approach is shaped around how you process decisions and emotional pressure."

## What changes vs. what stays

**Rebuilt / new**

- `PanelTransformIntake.tsx` — becomes the route splitter (intake → immediate/program/pattern_scope) + program flow host
- `src/components/Layout/panel/transform/TransformImmediate.tsx` — new
- `src/components/Layout/panel/transform/TransformPatternScope.tsx` — new
- `src/components/Layout/panel/transform/TransformWorkspaceOverview.tsx` — new (3-block overview + summarized activity)
- `WorkspaceContext` — extend `PendingTransformIntake` to full `TransformSeed`; add `transformFlow` state (route + stage) with `sessionStorage` persistence
- `transformation-intake-service` — expose `inferBelief(passage)` and `pace` mapping helper; keep `createTransformationProgram` and `inferDomains`
- `HACSChatInterface` — populate the richer `TransformSeed` on 🌱 selection

**Reused unchanged (imported into panel host)**

- `ReflectiveGrowthInterface`, `ImmediateGrowthInterface`
- `MoodTracker`, `ReflectionPrompts`, `InsightJournal`, `WeeklyInsights`
- `GrowthBeliefDrilling`, `RootCauseConfirmation`, `GrowthProgramGeneration`
- `EnhancedProgramDisplay`, `WeekDetailView`, `JourneyEngine`, `LifeAreaSelector`, `ConversationRecoveryBanner`, `TelemetryTracker`
- `LifeOperatingSystemDomainFocus`, `ConversationalAssessment`, `LifeOperatingSystemDashboard`, `ProgressiveJourneyAssessment`, `LifeWheelVisualization`, `GapAnalysisDashboard`
- `useEnhancedAICoach`, `useJourneyTracking`, `useLifeOrchestrator`, `useBlueprintData/Cache`, `agentGrowthIntegration`

**Retired from the sentence-triggered path** (kept only on legacy `/spiritual-growth` route)

- `welcome` tile grid
- `tools` sub-menu
- `life_os_choices` 4-mode chooser
- `GrowthProgramOnboardingModal` (dialog) — replaced by the panel-native belief/root/generate chain
- `GrowthCoachWelcome`, `GrowthProgramPromo`, `GrowthProgramStarter` — no cold entry needed; the sentence is the entry

## Slices (implementation order)

1. **Seed + splitter** — extend `TransformSeed`, populate at selection, replace `PanelTransformIntake` body with the 3-route chooser card. Existing "program" phases stay functional.
2. **Route 1 (immediate)** — build `TransformImmediate` with the two containers and contextual tool mounts.
3. **Route 2 (program) refactor** — insert Confirm-interpretation card before domain chips; paginate `GrowthBeliefDrilling`; mount `RootCauseConfirmation` in the panel.
4. **Route 3 (pattern scope)** — build `TransformPatternScope` with the 3 mounts + progressive follow-up.
5. **Workspace overview** — 3-block hierarchy + summarized activity feed; hook into program state.
6. **Personalization pass** — pace/tone modulation, single-line copy note.

## Guarantees preserved

- No hardcoded fallbacks; blueprint + service paths kept.
- `pattern_seed` provenance and program activation from `transformation-intake-service` unchanged.
- Panel state persists across sheet close (existing `WorkspaceContext` sessionStorage pattern applies to `transformFlow`).
- Twin chat stays clean — no `askCoach` handoffs added; all coaching stays in `PanelCoachDock`.
- Legacy `/spiritual-growth` route remains reachable so nothing regresses.*************
  -- DEV NOTE: dont create new card for the sentence selection we already have the help me transform or something like that and The core alignment is correct:
  - Sentence-triggered transformation stays entirely inside the Coach panel.
  - Existing Spiritual Growth components become contextual stages, not destinations.
  - There is one entry point with three transformation depths.
  - The domain and belief flow is seeded by the selected sentence.
  - Tools are invoked contextually rather than exposed through a Tools menu.
  - The transformation workspace becomes one primary overview container with progressive disclosure.
  - The legacy Spiritual Growth page remains available without contaminating the new flow.
  ## What is especially well aligned
  ### 1. The developer understood orchestration
  This sentence is exactly right:
  > Existing components stay—they become stages and capabilities invoked contextually, never destinations.
  That is the essential architectural shift. They are not proposing a redesigned Spiritual Growth homepage; they are converting the existing system into an engine behind **Help me transform this**.
  ### 2. The three routes match the intended transformation model
  The mapping is clean:
  - immediate support;
  - structured transformation program;
  - wider Life OS pattern assessment.
  The developer also correctly maps the existing components beneath each route instead of rebuilding them unnecessarily.
  ### 3. The program path uses the selected sentence intelligently
  The proposed flow does not ask users to begin with an empty twelve-domain picker. It first infers:
  - the pattern;
  - the likely life domain;
  - the possible underlying belief.
  Then the user confirms or corrects that interpretation. That is exactly how a blueprint-aware Coach should behave.
  ### 4. The cognitive-overload solution is correctly represented
  The workspace becomes:
  1. Current transformation
  2. Where I am
  3. What is next
  Then **Show more** progressively reveals Journey and Support, each limited to three items. This directly implements the one-container and Rule-of-Three direction.
  ### 5. The developer understood invisible tools
  The immediate route uses MoodTracker, ReflectionPrompts, InsightJournal, and coaching conversation contextually. It explicitly says there should be no Tools label and that the Coach should surface only the relevant interventions.
  ---
  # Four corrections I would make before ratifying it
  ## 1. The labels have not actually been flipped to the “Help me…” grammar
  This is the clearest mismatch.
  The document uses:
  - Work through this now
  - Start a transformation program
  - See the bigger pattern
  But you just established that the **help-me statements are the labels**.
  The card should therefore read:
  > **What would you like help with?**
  - **Help me work through this now**
  - **Help me transform this pattern over time**
  - **Help me see the bigger pattern**
  Or, more concise:
  - **Help me with this now**
  - **Help me transform this pattern**
  - **Help me understand the bigger pattern**
  The implementation document currently uses the right concepts but the previous command-style grammar.
  I would make this a product-law correction, not a later copy polish.
  ---
  ## 2. `transform_micro_action → InsightJournal` is semantically wrong
  The state machine currently says:
  > `transform_micro_action` — one small commit → InsightJournal
  An insight journal records a realization. A micro-action is a behavioral commitment.
  Those should not be the same object.
  A micro-action should persist through something like:
  - a growth action;
  - a commitment;
  - a growth task;
  - a check-in;
  - or an existing task/action persistence service.
  After completing the micro-action, the user may optionally record an insight.
  Better:
  ```

  ```
  ```
  transform_micro_action
  → create micro-action
  → complete/check in
  → optional reflection or insight
  ```
  Otherwise your data model will quietly turn actions into journal entries and make progress reporting unreliable. 
  ---
  ## 3. The workspace overview needs an immediate-route variant
  The proposed overview assumes there is always:
  -   
  a program title;  

  -   
  a week;  

  -   
  a completion percentage;  

  -   
  a next practice.  

  That works for a transformation program but not necessarily for **Help me with this now**.
  For an immediate intervention, the overview might instead be:
  ```

  ```
  ```
  Current focus
  What you discovered
  Your next small action
  ```
  For a program:
  ```

  ```
  ```
  Current transformation
  Where I am
  What's next
  ```
  The same one-container structure can remain, but its three fields should depend on the route. The document currently says the same overview applies once either an immediate session or a program is running. 
  ---
  ## 4. Keep `PanelTransformIntake` thin
  The plan says `PanelTransformIntake` becomes:
  -   
  the route splitter;  

  -   
  the program flow host;  

  -   
  and the rebuilt orchestration entry.  

  That is workable, but it could easily become another oversized component.
  I would define it as a thin router:
  ```

  ```
  ```
  PanelTransformIntake
  ├── TransformRouteChooser
  ├── TransformImmediate
  ├── TransformProgramFlow
  ├── TransformPatternScope
  └── TransformWorkspaceOverview
  ```
  It should own the current transformation route and seed, but each path should own its own stages. The document already proposes separate components for immediate, pattern scope, and workspace overview, so this is mostly a clarification of responsibility. 
  ---
  # My alignment verdict
  **Architecture: aligned.**  
    
  **UX hierarchy: aligned.**  
    
  **Reuse strategy: aligned.**  
    
  **Progressive-disclosure model: aligned.**  
    
  **Transformation routing: aligned.**  
    
  **Final interaction language: not yet aligned.**
  I would send the developer this correction:
  > Approved direction. Before ratification, update every sentence-card and route-choice label to the relational “Help me…” grammar. Also separate micro-action persistence from InsightJournal, provide a non-program overview variant for immediate transformation, and keep PanelTransformIntake as a thin orchestrator rather than a combined flow component.
  &nbsp;
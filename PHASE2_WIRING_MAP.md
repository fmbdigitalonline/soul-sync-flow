# Phase 2 — Engine-Extraction Audit: The Wiring Map

*Output of SOULSYNC_CONSTITUTION.md (v2.1) Phase 2, item 0. Audit date: Jul 14, 2026.*
*Read-only audit: no code was changed. Classifications verified against source, not memory (rule 8).*

**Legend**
- **ENGINE** — headless logic (service/hook, no JSX): wire it via twin tools, reuse as-is or with a thin wrapper.
- **DONOR** — UI-entangled screen/component: stays permanently unrouted; listed extraction targets are the only logic worth lifting out before the JSX is abandoned in place.
- **DEAD** — not imported/invoked anywhere: candidate for removal per "nothing is deleted until its replacement lives" — flagged, not deleted (rule 4: unroute, don't delete).
- **STUB** — exists and is wired, but returns placeholder/hardcoded data.

---

## 1. Dreams domain

### Engines
| File | Status | Notes |
|---|---|---|
| `src/services/soul-goal-decomposition-service.ts` | **ENGINE — LIVE** | The real decomposition engine: Hermetic 2.0 → 1.0 → blueprint prompt fallback chain, AI call, JSON self-healing, validation, DB persistence. Frontend twin of edge `decomposeGoalReal`. |
| `src/components/dream/decomposition/useDecompositionLogic.tsx` | **ENGINE** (hook in .tsx clothing) | Top extraction target of the domain: 4-stage decomposition pipeline, calls `decomposeGoalWithSoul`, direct Supabase writes (`user_goals`, `goal_milestones`, `productivity_journey` sync/dedup). Portable to a service once decoupled from React state + SoulOrb speech calls. |
| `src/components/dream/decomposition/useEnhancedLoadingLogic.tsx` | ENGINE (hook) | Pure timing/progress state machine (8s/15s/60s thresholds). Portable; useful for DreamCard/FocusCard progress states. |
| `src/services/dream-activity-logger.ts` | ENGINE | Supabase-backed logging singleton, reusable as-is. |
| `src/services/dream-message-parser.ts` | ENGINE | Pure regex message classifier (choices/question/reflection), reusable as-is. |
| `src/hooks/use-blueprint-aware-dream-discovery-coach.ts` | ENGINE (hook) — LIVE | Blueprint-based dream suggestions + phase-aware prompts; minimal React coupling, portable. |

### Dead duplicates (flagged, not touched)
- `src/services/ai-goal-decomposition-service.ts` — imported in Dreams.tsx but never invoked.
- `src/services/enhanced-goal-decomposition-service.ts` — unused anywhere.
- `src/services/goal-decomposition-service.ts` — unused anywhere (oldest variant).
- `src/hooks/use-dream-discovery-coach.ts` — superseded by blueprint-aware variant, not imported.
- `src/components/dream/success/DreamSuccessPage.tsx`, `success/DreamSuccessView.tsx`, `success/JourneyOverview.tsx` — orphans duplicating the live top-level `DreamSuccessPage.tsx` / `InteractiveJourneyOverview.tsx`.

### Donors
| File | Extraction target (if any) |
|---|---|
| `src/pages/Dreams.tsx` | `resolvedGoalToShow` merge (goal resolution across 4 sources), `normalizeResumedTask` / `findTaskInJourneyGoals` → a "goal resolution" engine helper. Rest is view routing. |
| `DreamSuccessPage.tsx` (top-level, live) | `getEssenceTitle()` title-truncation util. Rest presentation. |
| `DreamDecompositionPage.tsx` | None — thin shell over `useDecompositionLogic`. |
| `DreamDiscoveryChat.tsx` | None — logic already in `DreamMessageParser`. |
| `decomposition/ErrorDisplay.tsx` | `isQuotaError`/`isTimeoutError`/`isAuthError` sniffing → shared error-mapping util. |
| `success/TasksBreakdown.tsx` | `tasksByMilestone` reduce (group tasks by milestone) — minor. |
| `AllDreamsList.tsx`, `DreamsOverview.tsx` (near-duplicates), `DreamMenuGrid.tsx`, `DreamSuggestionCard.tsx`, `GoalCard.tsx`, rest of `decomposition/` + `success/` | Pure presentation; nothing to extract. |

---

## 2. Journey domain (FocusCard feed — Phase 2 item 3)

### Engines
| File | Status | Notes |
|---|---|---|
| `src/services/journey-agentic-tools.ts` | **ENGINE — but incomplete for FocusCard** | Genuinely headless (no React/Supabase imports). Exposes `generateTaskAssistant`, `generateCelebrationRitual`, `generateObstacleNavigator` — pure functions over task/hermetic/blueprint args. **`start_task_session` does not exist anywhere in the codebase**; constitution §5 names this file as the seed, not a finished engine. |
| `src/hooks/use-journey-goals.ts` | ENGINE (hook) | CRUD/transform over `productivity_journey.current_goals` (load, dedupe, delete). |
| `src/hooks/use-journey-tracking.ts` | ENGINE (hook) | CRUD for `productivity_journey`/`growth_journey`; `updateProductivityJourney` is the write path everything else routes through. |
| `src/hooks/use-enhanced-journey-tracking.ts` | ENGINE (hook) | Engagement/velocity/consistency scoring from `user_activities`/`conversation_memory`. |
| `src/hooks/use-journey-map-data.ts` | ENGINE (view-model hook) | Aggregation + progress + blueprint insight; carries minor UI-selection state. |
| `src/services/user-journey-tracking-service.ts` | ENGINE | Funnel/onboarding session tracker → `user_activities` + localStorage. |
| `src/services/progressive-journey-orchestrator.ts` | ENGINE | Pure domain-sequencing calculator over `domain_interdependencies`. |
| `src/hooks/use-onboarding-journey-tracking.ts` | ENGINE (thin wrapper) | Over `userJourneyTrackingService`. |

### Donors — two carry logic FocusCard needs
| File | Extraction target |
|---|---|
| `JourneyFocusMode.tsx` | **PRIORITY**: `milestoneTasks` resolver (match by `milestone_id`, else title-keyword fallback) + `formatBlueprintAlignment` normalizer — exactly the task-scoping/shaping FocusCard needs. |
| `TaskViews.tsx` | **PRIORITY**: `updateTaskStatus` — the ONLY task-status write path in the codebase (mutates `productivity_journey.current_goals[].tasks` via `updateProductivityJourney`). Needed by both `start_task_session` and the Phase 2 item-4 `update_task` tool. |
| `JourneyMap.tsx` | `currentDetailView`/`focusedMilestone` state-machine shape — port as FocusCard's session-state model. |
| `EnhancedJourneyMap.tsx` | `sortedMilestones`/progress/phase color-icon maps (ad hoc, duplicated elsewhere). |
| `TimelineDetailView.tsx` | `daysElapsed`/`daysRemaining`/`progressPercentage` one-line util. |
| `MilestoneDetailPopup.tsx` | `taskProgress` % calc — inline into engine. |
| `DreamAchievementDashboard.tsx`, `JourneyDetailedView.tsx`, `JourneyEmptyState.tsx`, `JourneyHeader.tsx`, `JourneyOverview.tsx`, `MilestoneDetailView.tsx`, `XPMilestoneTracker.tsx` (thin wrapper over already-engine `xp-progression-service`) | Pure presentation. |
| `src/pages/Tasks.tsx` | Tab shell; doesn't reference journey-agentic-tools at all; hardcoded fake "3-day streak". Discard. |

### start_task_session verdict
`journey-agentic-tools.ts` is NOT ready to back FocusCard directly. Three gaps:
1. **Task/milestone resolution** lives only in `JourneyFocusMode.tsx` → move into engine.
2. **DB write-back** (todo→in_progress→completed) lives only in `TaskViews.tsx`'s `updateTaskStatus` → extract as engine function.
3. **Session/timer state has no backing store anywhere** (no start-time/pause/elapsed model) → must be built new, not extracted.

**Wiring spec:** build `start_task_session(taskId)` in/alongside `journey-agentic-tools.ts` composing extracted-resolver + extracted-write-path + the three existing generators, returning a FocusCard-shaped payload.

---

## 3. Productivity domain (update_task / check_habit / Today pin — Phase 2 item 4)

### Engines
| File | Status | Notes |
|---|---|---|
| `src/services/unified-task-completion-service.ts` | **ENGINE — best tool candidate** | `completeTask(taskId, method, context)` is already a clean tool signature; resolves task context by ID (`resolveTaskContext`) without cached state; orchestrates journey tracking + analytics + goal-progress recompute + listeners. **Wrap this for `update_task`.** |
| `src/hooks/use-habits.ts` | **ENGINE (hook) — check_habit seed** | CRUD over `habits`/`habit_completions`; `markHabitComplete`; streak via DB RPC `calculate_habit_streak`; computes `completedToday`. Gap: date is hardcoded to today — needs a stateless date-parameterized variant for the tool. |
| `src/services/task-coach-integration-service.ts` | ENGINE (caveat) | `executeTaskAction` (complete_subtask/complete_task/update_progress/add_subtask/get_next_task) BUT mutates an in-memory `currentTask` singleton + `productivity_journey.current_goals` JSON blob — a tool wrapper must pass `taskId`/`userId` per call, not rely on `setCurrentTask`. |
| `src/services/enhanced-task-coach-integration-service.ts` | ENGINE | Thin rate-limit/logging wrapper over the above. |
| `src/services/pie-service.ts` + `pie-data-collection` + `pie-pattern-detection` + `pie-insight-generation` + `pie-scheduling` | **ENGINE — PIE day-2 pipeline** | Full collection → pattern → predictive-rule → scheduled-insight pipeline, Supabase-backed, no rendering. This IS the day-2 proactive message engine named in the roadmap. |
| `src/hooks/use-goals.ts` | ENGINE (hook) | CRUD over `user_goals`/`goal_milestones`. |
| `src/hooks/use-task-assistant.ts` | ENGINE (hook) | AI subtask breakdown via `JourneyAgenticTools`, persisted. |
| `src/hooks/use-task-aware-coach.ts` | ENGINE (hook) | Parses `ACTION:` directives into `TaskAction`s. |
| `src/hooks/use-task-completion.ts` | ENGINE (thin wrapper) | Over `unifiedTaskCompletionService`. |
| `src/hooks/use-resumable-tasks.ts` | ENGINE (hook) | Task normalization + "work instruction session" resumability classification. |
| `src/hooks/use-pie-enhanced-coach.ts` | ENGINE (hook) | Injects top PIE insights into chat messages. |

### Donors
| File | Extraction target |
|---|---|
| `PlanningInterface.tsx` | **PRIORITY for Today pin**: task normalization (`allTasks` flatMap, ~lines 60-76) + date-scoped due filter (`tasksForSelectedDate`, ~lines 96-108, `isWithinInterval`) + `updateTaskStatus` write-back. Closest existing "what's due on day X". |
| `CalendarSync.tsx` | `overdueTasks`/`upcomingTasks` split (~lines 34-53) → open-loop nudge calc. The "sync" itself is fake (stamps `calendar_synced: true`, no real integration) — discard. |
| `PomodoroTimer.tsx` | Self-contained timer state machine + `logFocusSession()` → `user_activities`. Relevant to FocusCard's missing session/timer store (see §2 gap 3) — extractable seed rather than building from zero. |
| `WeeklySummary.tsx` | `weekMetrics` memo + rule-based `generateInsights()` — later weekly-recap tool, not Today-pin. |
| `IntelligentScheduler.tsx` | Energy-matching scheduling algorithm — BUT `getUserEnergyPatterns()` is hardcoded mock. Pattern reusable once energy data is real. |
| `GoalSetting.tsx` | Small "aligned traits" keyword-matcher — low value, hardcoded keyword list. |
| `ProgressAnalytics.tsx` | 7-day chart is `Math.random()` mock — discard; aggregation duplicates WeeklySummary/PlanningInterface. |
| `HabitTracker.tsx`, `HabitCard.tsx`, `HabitDetailPopup.tsx`, `GoalCard.tsx`, `GoalDetailPopup.tsx`, `GoalAchievement.tsx` (reads `current_goals` directly, bypassing `use-goals`), `ProductivityDashboard.tsx`, `EnhancedProductivityDashboard.tsx` | Pure presentation / trivial calcs. |

### Tool-readiness verdicts
- **update_task** → wrap `unifiedTaskCompletionService.completeTask`; avoid `task-coach-integration-service`'s singleton state.
- **check_habit** → new stateless variant of `use-habits.ts` `markHabitComplete` (date-parameterized).
- **Today pin** → no single "due today" function exists; build `getTodayPin(userId)` composing (1) habits incomplete-today from `use-habits` logic, (2) generalized `PlanningInterface` date-window filter, (3) `CalendarSync` overdue calc for the open loop.

---

## 4. Growth domain

### Engines
| File | Status | Notes |
|---|---|---|
| `src/services/growth-program-service.ts` | ENGINE | Base CRUD + deterministic program-structure calculator (blueprint params → type → schedule → week themes). Foundation layer, clean. |
| `src/services/growth-program-generation-service.ts` | ENGINE | Onboarding customization layered correctly on growth-program-service (keyword-heuristic analysis of belief-drilling conversation). |
| `src/services/agent-growth-integration.ts` | ENGINE (caveat) | Facade switching growth-program-service ↔ adaptive-growth-service via hardcoded `isAgentModeEnabled = true`; contains `extractPlanBranches`/`extractListItems` regex parsers duplicated in `GrowthProgramInterface.tsx`. |
| `src/services/adaptive-growth-service.ts` | ENGINE — part STUB | Real: in-flight dedupe on program creation, INSERT-vs-UPDATE checks, blueprint reconstruction from DB. Stubs wired live: `determineAdaptiveProgramType` always `'standard'`, duration hardcoded 8, `calculateAlignmentScore` hardcoded 0.85, drift/insight parsers mostly fabricate structure from text. |
| `src/services/growth-program-orchestrator.ts` | ENGINE — part STUB | Misleading name: it's coach-chat context loading/caching, not program creation. `loadCareerContext`/`loadMemoryGraph`/`loadPersonalityVectors` return fake data; real value is caching/timeout/allSettled scaffolding. Duplicates `getDisplayName`/`extractCoreTraits` from SpiritualGrowth.tsx. |
| `src/services/growth-intelligence-fusion-service.ts` | ENGINE | Depth-scoring + root-cause/belief-conflict extraction from TMG memories. Clean; feeds Phase 3 conversational-assessment. |
| `src/services/program-aware-coach-service.ts` | ENGINE | Per-page-context session isolation, caching, insight extraction, persistence with retry/upsert. Solid. |
| `src/services/life-orchestrator-service.ts` | ENGINE — Phase 3 | Gap-analysis engine (priority-score across life-wheel domains). Clean and ready when Phase 3 comes. |
| `src/services/autonomous-orchestrator.ts` | ENGINE | HACS intervention-decision engine, not growth-specific. |
| `src/components/growth/onboarding/useGrowthOnboardingLogic.tsx` | **ENGINE** (hook in .tsx clothing) | Pure stage machine (domain_selection → belief_drilling → program_generation) orchestrating generateProgram. Reusable near-as-is as tool-callable onboarding controller. |
| `src/hooks/use-hacs-growth-conversation.ts` | ENGINE (hook) | Conversation state + persistence + `hacs-growth-conversation` edge call + quality scoring. |
| `src/hooks/use-life-orchestrator.ts`, `use-autonomous-orchestration.ts` | ENGINE (hooks) | Thin/composition wrappers. |
| `src/hooks/use-program-aware-coach.ts` | ENGINE (caveat) | Wraps the service; adds fake typewriter pacing (setTimeout per char) — discard the pacing on rewire. |
| `src/hooks/use-optimized-program-coach.ts` | ENGINE — STUB | `generateResponse` is a hardcoded canned-response simulator; scaffolding, not production. |
| `growth-mode-comprehensive-test-suite.ts`, `growth-program-test-suite.ts` | test harnesses | Not extraction targets. |

### Donors
| File | Extraction target |
|---|---|
| `src/pages/SpiritualGrowth.tsx` (819 lines) | `getUserDisplayName`/`getCoreTraits` (duplicated in growth-program-orchestrator), `describeActivity` mapper, `formatRelativeTime`/`formatTimestamp`. Rest is view routing. |
| `JourneyEngine.tsx` | **NOT a hidden engine despite the name** — stateful JSX component. Two functions worth refactoring out (not just moving): `generatePersonalizedJourney` (blueprint→prompt→AI→JSON parse, 5-step fallback) and `processStepResponse` (guidance prompts + insight logging). Interleaved with setState — refactor required. |
| `GrowthProgramInterface.tsx` (647 lines) | `parsePlanBranches`/`extractListItems` (third copy of the plan-branch parser), `getProgramTypeInfo` table, `loadAIGeneratedContent` DB-shape parsing. |
| `WeekDetailView.tsx` | `getWeekConversationStarter` per-theme templates + `calculateRealProgress` weighted formula. |
| `ImmediateGrowthInterface.tsx` | `getGreetingMessage()` per-domain templates — minor. |
| `TelemetryTracker.tsx` | Discardable if telemetry moves to tool-call level (logic already in agent-growth-integration). |
| `ConversationRecoveryBanner`, `EnhancedProgramDisplay`, `GrowthCoachWelcome`, `GrowthProgramPromo`, `GrowthProgramStarter` (domain list = data), `LifeAreaSelector` (life-area list = data), `ReflectiveGrowthInterface` (pure view over engine hook), all onboarding/*.tsx components (`GrowthProgramGeneration`'s progress animation is pure theater — setTimeout stages, not tied to real progress) | Pure presentation. |

### CardShell-reuse note
No growth component is clean enough for drop-in card reuse; closest are `ReflectiveGrowthInterface`'s chat-list pattern and `WeekDetailView`'s activity checklist, both needing service calls stripped first.

---

## 5. Cross-domain findings (report, don't fix — rule 2)

1. **Four goal-decomposition services exist; one is live.** `soul-goal-decomposition-service.ts` is production; `ai-`, `enhanced-`, and plain `goal-decomposition-service.ts` are dead. Cleanup candidates once DreamCard flow is confirmed stable.
2. **Plan-branch parser exists ~3 times** with diverging implementations: `agent-growth-integration.ts`, `GrowthProgramInterface.tsx`, (and related extraction in `EnhancedProgramDisplay`). Consolidate to one function when Phase 3 rewires generatePlanBranches.
3. **`getDisplayName`/`extractCoreTraits` duplicated** between `SpiritualGrowth.tsx` and `growth-program-orchestrator.ts` near-verbatim.
4. **Task-status write-back is a single point**: `TaskViews.tsx → updateProductivityJourney`. Everything Phase 2 items 3–4 needs routes through this one extraction.
5. **Two task stores coexist**: `user_goals`/`goal_milestones` tables (used by `use-goals`, the decomposition engine) vs. `productivity_journey.current_goals` JSON blob (used by journey/task components, task-coach services). The Today pin and update_task tool must decide which is canonical or bridge both — `useDecompositionLogic` already syncs goal inserts into `productivity_journey`, so the blob is currently downstream of the tables.
6. **Fake/mock logic wired live** (do not extract as-is): CalendarSync's sync flag, IntelligentScheduler's energy patterns, ProgressAnalytics' random chart data, GrowthProgramGeneration's staged progress theater, use-optimized-program-coach's canned responses, adaptive-growth-service's hardcoded scores, growth-program-orchestrator's placeholder context loaders.
7. **Dead orphan components** in `dream/success/` (three files) duplicating live equivalents.

---

## 6. What this unblocks (Phase 2 sequencing)

- **Item 1 — OfferCard**: no engine dependency; needs only the side-effect-free `offer_decomposition` tool + CardShell. Decomposition itself already proven live (Phase 1).
- **Item 3 — FocusCard / start_task_session**: blocked on three extractions named in §2 (resolver from JourneyFocusMode, write path from TaskViews, new session-state store — PomodoroTimer's timer machine is a usable seed).
- **Item 4 — update_task / check_habit / Today pin**: wrap `unifiedTaskCompletionService.completeTask`; stateless `markHabitComplete` variant; new `getTodayPin()` composing three existing calcs (§3). PIE day-2 pipeline already engine-ready.
- **Phase 3 preview**: `life-orchestrator-service` and `growth-intelligence-fusion-service` are already clean engines; `generatePlanBranches`/`evaluatePlanAlignment` remain stubs as recorded in constitution §5.

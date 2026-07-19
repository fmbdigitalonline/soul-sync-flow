# Achievement OS — full feature inventory (deep scan, Jul 19 2026)

What the built Dreams/journey/task/productivity environment ACTUALLY
contains, feature by feature, vs what "Help me achieve this" currently
delivers in the Coach panel. Status: ✅ absorbed · ⚠️ partial · ❌ missing ·
🚫 fake (audited theater — fix before absorbing).

## 1. Program creation & discovery
| Feature | Details | Status |
|---|---|---|
| Intake form | title/why/category/timeframe | ✅ intake card → panel |
| Staged build experience | blueprint-narrated stages | ✅ panel dream flow |
| **Discovery chat** | `use-blueprint-aware-dream-discovery-coach`: phased conversation (blueprint_analysis → exploration → suggestion_presentation → intake), generates **blueprint-aware dream suggestions**, user selects one, readiness detection → decomposition | ❌ the "I don't know my goal" door |
| Dream suggestions cards | `DreamSuggestionCard` — pick-a-suggestion UI | ❌ |
| Success celebration | CelebrationHeader + **GuidedTourPanel** (first-time walkthrough) | ⚠️ summary only, no celebration/tour |

## 2. Journey & milestones
| Feature | Details | Status |
|---|---|---|
| Roadmap list | milestones + dates + criteria | ✅ (redesigned per UX deck) |
| **Journey map (visual)** | EnhancedJourneyMap/JourneyMap — spatial progression | ❌ |
| Milestone detail | MilestoneDetailView/Popup — criteria checklist, focus | ⚠️ PanelMilestoneView (traits + siblings + dock) — no criteria checklist |
| Timeline view | TimelineDetailView — time-based layout | ❌ |
| **Focus mode** | JourneyFocusMode — one milestone, its tasks, open task board | ❌ |
| Achievement dashboard | DreamAchievementDashboard — cross-program achievement view | ❌ |
| **XP progression** | XPMilestoneTracker + use-xp-progression + xp-progression-service + `user_xp_events` ledger (kinds/quality/note — audited GOLD) | ❌ entirely invisible in panel |

## 3. Tasks — the working layer
| Feature | Details | Status |
|---|---|---|
| **Kanban board** | 4 columns (todo/in_progress/stuck/completed), drag-drop, mobile column pager | ❌ (ActionHub is a list, no status board) |
| List view | flat task list | ⚠️ |
| **Calendar view** | tasks by due_date, date picker | ❌ |
| Task status changes | TaskStatusSelector + `updateProductivityJourney` (the ONE write path) | ❌ from panel |
| Task metadata | duration, energy_level_required, **optimal_time_of_day**, due_date, category | ⚠️ shown partially, never editable |
| TaskPreview | expandable task details on card | ❌ |
| **ReadyToBeginModal** | pre-flight "ready to go?" before coach session | ❌ |
| Mark done from card | useTaskCompletion (unified completion + feedback + navigate) | ❌ from panel |

## 4. Task coaching session (the deepest room)
| Feature | Details | Status |
|---|---|---|
| Coach chat | task-aware coach (useTaskAwareCoach) | ⚠️ panel dock uses program-aware coach — task-aware engine unused |
| **Session persistence/resume** | task-session.ts: localStorage + DB fallback, StoredTaskSession, `getTaskSessionType`, **resumable tasks** (use-resumable-tasks + per-goal resume chips) | ❌ dock sessions ≠ task sessions; no resume surfaced |
| **SessionProgress** | focus time, estimated duration, energy, progress %, total days | ❌ |
| **SubTaskManager** | subtask checklist, per-subtask complete, all-complete celebration | ❌ |
| **WorkingInstructionsPanel** | working-instructions-persistence-service — durable step-by-step instructions from coach | ❌ |
| Smart quick actions | state-CONDITIONAL chips: break_down (no subtasks), next_step, progress_check (>0%), add_subtask (has subtasks), im_stuck, time_check, complete_check (≥80%) | ❌ |
| 6 canned quick actions | I'm stuck / Next step / Take a break / Mark done / Share insight / Need clarity | ❌ |
| Session stats | messages sent, actions executed, duration → dream-activity-logger | ❌ |
| **Agentic task tools** | journey-agentic-tools: `generateTaskAssistant`, `generateCelebrationRitual`, `generateObstacleNavigator` (headless, audited ENGINE) | ❌ never called anywhere |

## 5. Habits & rhythm
| Feature | Details | Status |
|---|---|---|
| **HabitTracker** | use-habits (DB-backed), completedToday, streaks, double-tap detail popup, mark complete | ❌ unreachable from conversation surface |
| **PomodoroTimer** | work/break cycles, adjustable minutes, logs focus_session to `user_activities` | ❌ (panel has a generic focus timer in legacy tools only) |
| CalendarSync | 🚫 fake sync flag (audited) | 🚫 fix first |
| IntelligentScheduler | 🚫 mock energy patterns (audited) | 🚫 fix first |
| PlanningInterface | weekly planning UI | ❌ |
| WeeklySummary | week retrospective | ❌ |
| ProgressAnalytics | 🚫 random chart data (audited) | 🚫 fix first |
| GoalAchievement | goal celebration component | ❌ |

## 6. Program management
| Feature | Details | Status |
|---|---|---|
| All programs list | counts, per-goal resume chips | ⚠️ Programs drawer (no resume chips) |
| Goal details view | full description, milestones, edit | ❌ |
| Delete (soft) | status='inactive' | ❌ from panel |
| Edit timeframe/title | | ❌ |

## Absorption waves (proposed)
- **Wave 1 — close the working loop:** kanban/status board in Action Hub
  (statuses + the existing write path), task session resume + ReadyToBegin,
  task-aware coach in the task dock (not program-aware), SubTaskManager +
  SessionProgress + quick-action chips in the task drill-in (Level 3).
- **Wave 2 — widen the intake:** discovery door ("not sure yet?" →
  discovery phases + blueprint suggestions in the panel dock) + success
  celebration + XP surfacing (the ledger is GOLD and invisible).
- **Wave 3 — rhythm layer:** habits drawer, Pomodoro in task sessions,
  focus mode as a Level-2 state, weekly summary.
- **Wave 4 — management & maps:** details/edit/delete, journey map visual,
  timeline, achievement dashboard. Fix-first items (🚫) stay quarantined
  until de-faked.

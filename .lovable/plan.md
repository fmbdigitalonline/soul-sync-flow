## Alignment
Yes — aligned with the other developer's ruling. I own the client/panel additions; they own the server-side removals and chat slimming after my flow is confirmed. Nothing they own is touched here.

## Guiding rules
- Additive only. The current `confirmedAction` path stays live until the other author flips it off.
- One store: extend `WorkspaceContext`, don't create a second.
- Reuse the existing dream engine (`DreamDecompositionPage`, `decomposition/*`, `success/*`) — no reimplementation.
- Three-Pieces Rule inside the panel.
- `/dreams` stays reachable as a fallback during rollout.

## Scope

### 1. WorkspaceContext — intake handoff
Add to `src/contexts/WorkspaceContext.tsx`:
- State: `pendingIntake: { title, category, timeframe, source: 'sentence' | 'offer' } | null`
- Actions: `openPanelWithIntake(intake)`, `clearPendingIntake()`
- `openPanelWithIntake` also fires `emitCoachOpen({ section: 'actions', view: 'decomposition' })` so the existing bus stays consistent.

### 2. Rewire OfferCard confirms (chat side)
In `src/components/hacs/HACSChatInterface.tsx`:
- Both `onConfirm` handlers (attachment `offer_decomposition` card + `dreamDraft` "Dream This" card) call `openPanelWithIntake({...})` instead of `onSendMessage(..., { confirmedAction })`.
- Keep the old `onSendMessage(confirmedAction)` code path commented-out-guarded behind a feature flag `USE_PANEL_INTAKE = true` for one release, so Claude's server-side removal can land cleanly.
- No changes to sentence selection, InteractiveSentenceText, or SentenceActionButtons — the trigger grammar is already correct.

### 3. Panel-hosted decomposition flow
New: `src/components/companion/panel/PanelDreamFlow.tsx` — orchestrator with three phases keyed off `pendingIntake` + local phase state:
- `phase: 'building'` → renders `DreamDecompositionPage` (reused as-is) with `dreamTitle/category/timeframe` from `pendingIntake`. Per user's answer, we skip the intake form and go straight to staged build.
- `phase: 'roadmap'` → renders a panel-sized version of `MilestonesRoadmap` from `success/*`, capped to 3 milestones visible + "Show more" (Three-Pieces Rule).
- `phase: 'first_task'` → renders `RecommendedTask` from `success/*`, single card.

Wire into `CoachWorkspaceShell.tsx` Overview/Actions section: when `pendingIntake` is set OR `PanelDecompositionCard` (Slice F) already active, mount `PanelDreamFlow` in place of the kanban until the user closes it.

The decomposition service call is the same one `DreamDecompositionPage` already uses via `useDecompositionLogic` — no service edits.

### 4. Cosmetic bugs (in-flight, per other dev's note)
- `src/components/dream/decomposition/BlueprintInsight.tsx`: `blueprint.insight.personalizing` renders as literal text. Add a fallback: if `t(key) === key`, render a plain English string ("Personalizing for {userType}…"). No changes to the translation loader.
- `src/components/dream/success/CelebrationHeader.tsx`: celebration copy interpolates `goalTitle` verbatim including typos. Add a light sanitizer for the ceremony line only (trim, capitalize first letter, collapse whitespace) — leave the stored `goalTitle` untouched in data.

### 5. What stays untouched (Claude's half)
- `supabase/functions/companion-oracle-conversation/*` — no edits.
- `offer_decomposition` tool definition — no edits.
- Chat `DreamCard` slimming — no edits.
- `SOULSYNC_CONSTITUTION.md` — no edits (waiting on their ratification).
- Auto-deal rail server logic — no edits.

## Deliverables
- `src/contexts/WorkspaceContext.tsx` (extend)
- `src/components/hacs/HACSChatInterface.tsx` (rewire two `onConfirm` handlers behind `USE_PANEL_INTAKE`)
- `src/components/companion/panel/PanelDreamFlow.tsx` (new)
- `src/components/companion/CoachWorkspaceShell.tsx` (mount PanelDreamFlow when intake pending)
- `src/components/dream/decomposition/BlueprintInsight.tsx` (i18n fallback)
- `src/components/dream/success/CelebrationHeader.tsx` (ceremony sanitizer)

## Verification
- Send message → select sentence → "Dream this" → OfferCard appears → tap Confirm → panel auto-opens → staged build animates → roadmap (max 3) → first task card.
- Attachment-driven offer card also opens the panel (not the chat confirm path).
- `/dreams` route still loads Dreams.tsx (fallback preserved).
- No i18n keys visible as raw text; celebration line reads cleanly even when title has typos.
- Old `confirmedAction` code path still compiles; flip is a one-line change when Claude signals.

## Handoff signal
When the panel flow is verified working end-to-end, I'll ping so the other dev can: disable the auto-deal rail + `offer_decomposition` tool server-side, slim the chat DreamCard, remove `USE_PANEL_INTAKE` fallback, and record the ruling in the constitution.
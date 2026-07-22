Plan: Remove redundant Companion/Reminders toggle buttons from the mobile Coach view.

## Context
- The two buttons circled in the screenshot are rendered by `src/components/ui/mobile-toggle-panel.tsx` (lines 41–67).
- They are used on mobile in `src/pages/Coach.tsx` and `src/pages/CoachPure.tsx` to switch between the chat panel and a reminders/clear-conversation panel.
- The user is already on the Companion page via the bottom nav; the toggle is redundant.

## Scope
- UI-only change in `src/components/ui/mobile-toggle-panel.tsx`.
- Do not touch detection services, hooks, edge functions, or the desktop side-by-side layout.
- Keep the `remindersContent` desktop rendering unchanged.

## Changes
1. Remove the mobile toggle header (the two buttons and their containing bar).
2. On mobile, always render `chatContent` directly.
3. Clean up now-unused imports/state (`Button`, `Badge`, `MessageSquare`, `Bell`, `useState`, `activePanel`, `activeRemindersCount`).
4. Verify the mobile layout still fills the available height correctly and that the desktop branch still shows `chatContent` + `remindersContent` side-by-side.

## Validation
- Run the project typecheck/build.
- Optionally preview the mobile Coach page to confirm the buttons are gone and the chat remains usable.
# Apply 14-File Redesign Drop — No Refactors

Mechanical application of 14 files the user will paste one per message. No editorial changes.

## Files (in paste order)

1. `src/App.tsx`
2. `src/components/LegacyRedirect.tsx`
3. `src/components/Layout/MainLayout.tsx`
4. `src/components/Layout/MobileNavigation.tsx`
5. `src/pages/OnboardingFlow.tsx`
6. `src/pages/Coach.tsx`
7. `src/hooks/use-hacs-conversation.ts`
8. `src/hooks/use-hacs-conversation-adapter.ts`
9. `src/components/hacs/HACSChatInterface.tsx`
10. `src/components/companion/message-parts/CardShell.tsx`
11. `src/components/companion/message-parts/DreamCard.tsx`
12. `supabase/functions/companion-oracle-conversation/index.ts` → **deploy**
13. `supabase/functions/hacs-intelligent-conversation/index.ts` → **deploy**
14. `supabase/migrations/20260706000000_message_attachments.sql` → **apply as migration**

## Per-file procedure

- Overwrite if exists, create if not.
- Exact content, byte-for-byte. No formatting changes, no import reordering, no lint fixes.
- No edits to any file not in the list of 14.
- Files 12–13: after writing, call `supabase--deploy_edge_functions` for that function name.
- File 14: apply via `supabase--migration` tool (uses the exact SQL you paste as the migration body).

## After all 14 arrive

1. Run build (`tsgo` or vite build as harness dictates) and report errors verbatim.
2. Fix nothing.
3. Test A: send twin `the job doesn't interest me, it's out of necessity and status` via Playwright against the running preview. If response contains `I'm here if this brings up more`, report deploy failure and give dashboard paste instructions for functions 12–13.
4. Test B: fresh account → 3-screen onboarding → wait for twin to speak first → send `I want to earn one million` → verify a card renders in the message stream. Screenshot each step.

## What I will not do

- Not touch `src/integrations/supabase/types.ts` (auto-generated).
- Not modify `main.tsx`, `index.css`, `App.css`, `vite-env.d.ts`, or any file outside the 14.
- Not delete orphaned pages, not consolidate duplicates, not "clean up" imports.
- Not add missing exports or shim types even if the build asks for them — I'll report the error and stop.

Approve to switch me into build mode. Then paste **File 1 of 14**.

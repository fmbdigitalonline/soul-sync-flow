# Replace floating orb with an ambient PresenceFrame border

UI-only. Services, detection hooks, and edge functions untouched.

## 1. New component: `src/components/companion/PresenceFrame.tsx`

Wrapper that renders `children` inside a rounded container whose border reflects presence.

- Props: `state: 'idle' | 'thinking' | 'noticed'`, `className?`, `children`.
- CSS-only animations defined in `src/index.css` (keyframes + utility classes), so nothing runs on the JS thread and `prefers-reduced-motion` disables them via a single `@media` block that collapses each animation to a static border.
- **idle** — soul-purple border at low opacity with a 5s ease-in-out breath cycling opacity ~0.15 → 0.30. Deliberately near-subliminal.
- **thinking** — border rendered via `border-image` from a soul-purple → teal linear-gradient, animated by shifting `background-position` on a masked border layer over ~3s linear infinite.
- **noticed** — single 1.2s soft outer glow (box-shadow keyframe, `animation-iteration-count: 1`, `animation-fill-mode: forwards` to `none`), then the component re-settles to idle on the next render.
- No badges, dots, counters, click targets, or focus rings added by the frame itself.

## 2. Wire in `src/pages/Coach.tsx`

- Add `useHermeticReportStatus()` and read `orbState` from the existing `useSubconsciousOrb()` call (already imported).
- Derive frame state:
  - `thinking` when `isLoading || isStreamingResponse || hermeticStatus.isGenerating`.
  - `noticed` for one render-tick when a new insight signal arrives (see step 3); resets to idle after the pulse animation duration (1.2s timer).
  - otherwise `idle`.
- Pass `presenceState` into `HACSChatInterface` as a new optional prop; inside `HACSChatInterface` wrap the sticky input bar (`div.flex.items-center.gap-2.bg-card…rounded-full`) with `<PresenceFrame state={presenceState}>`. Leave the conversation container alone for now (the composer is enough presence surface; scope-limits the visual change).

## 3. Reroute insight delivery into the message stream

- In `Coach.tsx`, subscribe to `orbState` changes (via `useEffect` on `orbState.hermeticAdvice` / `orbState.pattern`). When a fresh advice becomes available AND the per-session insight budget is unused:
  1. Flip presence to `noticed` for 1.2s.
  2. Append the advice as a normal twin message using the existing `addOptimisticMessage(...)` API — same shape as any other assistant message, plain text, no confidence bar, no accept/dismiss buttons, no special styling.
  3. Mark the session budget used in a `useRef<boolean>` (session-scoped; resets on hard reload — matches "one unsolicited insight per session"). Further advice events are silently dropped.
- Nothing inside `use-subconscious-orb.ts`, `subconscious-orb-controller`, shadow detector services, or `use-hermetic-report-status.ts` is modified. We only *consume* their existing outputs.

## 4. Remove orb + modal UI usage

- `src/components/Layout/MainLayout.tsx`: remove the `FloatingHACSOrb` import and the `{user && <FloatingHACSOrb … />}` render line. Also drop the now-unused `enableOrbPointerFollow` memo if nothing else references it.
- Grep-verify no other live route renders `FloatingHACSOrb`, `HACSChatOverlay`, or `HACSInsightDisplay`; unmount any stragglers.
- **Leave the files on disk** (`FloatingHACSOrb.tsx`, `HACSChatOverlay.tsx`, `HACSInsightDisplay.tsx`, all `use-subconscious-orb*` / detector services). No deletions.

## 5. Verification

- `bun run build` passes (also catches unused-import fallout from MainLayout).
- Open `/companion` in the preview: no floating orb; composer shows the barely-visible breath at idle; gradient sweep while awaiting a reply; single pulse followed by an inline twin message when the shadow detector fires; no insight modal appears; no new console errors.
- Manually confirm `prefers-reduced-motion: reduce` renders a plain static border.

## Report back

Which hooks fed which frame state (`isLoading`/`isStreamingResponse` + `useHermeticReportStatus.isGenerating` → `thinking`; `useSubconsciousOrb.orbState.hermeticAdvice` → `noticed` + append), and the exact call site where the insight was pushed into the transcript (`Coach.tsx` `useEffect` → `addOptimisticMessage`).

## Also bundled in this session

- `**isStreaming: false` one-liner** — apply the outstanding fix (please confirm the file + call site if it's not obvious in the current tree; otherwise I'll grep `isStreaming:` in the adapter/hook and set the correct default).
- **Goal-title tool description one-liner** — update the tool schema description for the goal-title tool. I'll locate it under `supabase/functions/*` tool definitions and tighten the `description` field. This is a string-only change, no logic touched.

Both are shipped in the same turn as the PresenceFrame work. - DEv NOte: The plan is excellent — Lovable read the spec faithfully and improved it in three places worth noticing: CSS-only animations off the JS thread with a proper `prefers-reduced-motion` collapse, the `useRef` session budget for the one-insight rule, and scoping the frame to just the composer instead of the whole container. That last one is genuinely smarter than my spec — one presence surface, minimal visual change, expandable later if it feels right. Approve steps 1–4 as written.

Three corrections before you say "go," because two of them will otherwise ship wrong:

**1. The** `isStreaming` **fix — Lovable is about to grep its way into breaking things.** It says it'll "grep `isStreaming:` and set the correct default" — no. There are multiple legitimate `isStreaming: true` sites (normal replies *should* stream). The fix is exactly one line in one function. Reply with: *"For the isStreaming fix: ONLY in* `src/hooks/use-hacs-conversation.ts`*, inside the* `initiateFirstContact` *function, the message object whose id starts with* `oracle_first_` *— change its* `isStreaming: true` *to* `false`*. Do not touch any other isStreaming occurrence anywhere."*

**2. The goal-title fix — it's looking for the wrong thing.** There is no "goal-title tool." Give it: *"In* `supabase/functions/companion-oracle-conversation/index.ts`*, in the* `companionTools` *array, the* `decompose_goal` *function's* `title` *property description — change it to: 'Short goal title using the USER'S OWN stated goal verbatim (e.g. "Earn €1,000,000") — never your reframe or interpretation of what the goal is really about.' String-only change, then redeploy the function."* And remind it: this file is an edge function — the change needs a **deploy**, not just a commit.

**3. One design guard on step 3:** the plan appends the insight as a *plain text* message via `addOptimisticMessage` — good — but optimistic messages sometimes don't persist to the transcript store. Ask it to confirm the insight message survives a page reload (i.e., it's written through the same persistence path as other twin messages, or explicitly accept that unsolicited insights are ephemeral — which is actually defensible, but it should be a decision, not an accident).

Also quietly appreciate what step 2 revealed: `isStreamingResponse` feeding the thinking state means the border will sweep *while the twin types* — the room visibly thinking as words arrive. That's the concept landing exactly as imagined.

&nbsp;
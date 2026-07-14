# Input frame: transparent when idle, thicker border

## What's wrong
The chat input's `PresenceFrame` (`src/components/hacs/HACSChatInterface.tsx` wraps the `<Input>`) always shows a soul-purple border because the idle state in `src/index.css` animates `border-color` between `hsl(var(--soul-purple) / 0.22)` and `/ 0.42)`. Only the `thinking` and `noticed` states should tint the border — idle should be invisible.

## Change — `src/index.css` (PresenceFrame block, lines ~282–348)

1. **Idle = no color.**
   - Base `.presence-frame` border: `3px solid transparent` (was `2px solid hsl(var(--soul-purple) / 0.28)`).
   - Drop the `presence-breath` animation and its keyframes so `[data-presence="idle"]` renders a fully transparent border.

2. **Thicker border across every state.**
   - `.presence-frame` border-width `2px` → `3px`.
   - `.presence-frame[data-presence="thinking"]::before` `inset: -2px; padding: 2px` → `inset: -3px; padding: 3px` so the gradient sweep still matches the outer edge cleanly.

3. **Keep pipeline colors intact.**
   - `thinking` sweep (soul-purple ↔ soul-teal gradient) unchanged — this is the "data pipeline in use" signal.
   - `noticed` pulse (soul-purple) unchanged — subconscious-shadow pipeline.
   - `prefers-reduced-motion` block updated: idle stays transparent; the reduced-motion thinking fallback keeps the purple/teal gradient.

No component/TSX edits. No new colors added — existing pipeline colors already encoded in the `thinking` and `noticed` selectors continue to drive the border.

## Verify
- `/companion` at rest: input frame border is invisible (transparent 3px).
- Send a message → border shows the purple→teal gradient sweep while loading/streaming; reverts to transparent when idle returns.
- Subconscious "noticed" event → single purple pulse, then transparent.
- Border visibly thicker than before in all active states.

## Out of scope
No new per-module color mapping for the input frame — only the two existing pipeline signals (`thinking`, `noticed`) already coded in CSS are used. If you want module-specific tints on the frame (e.g., PIE vs TMG vs VFP each has its own hue), say the word and I'll wire a `data-module` attribute and add those selectors — it's a follow-up, not part of this fix.

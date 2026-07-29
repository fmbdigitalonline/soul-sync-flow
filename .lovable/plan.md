## Status check (verified in `supabase/functions/generate-personality-report/index.ts`)

**voiceDirective — already done, not ignored.**
- Line 39 destructures `voiceDirective` from the request body.
- Lines 132–136 build a `voicePrefix` and prepend it to the system prompt, with a log line (`🗣️ Twin voice directive: present/absent`). Analyst prompts untouched.
- So that half of the handoff is no longer true. If reports still read identically, the next step is checking the logs for `present (N chars)` versus `absent`, not another code change.

**Parser — mostly landed, one residual gap.**
- The regexes already use Unicode uppercase (`\p{Lu}`), the `i` flag is gone, and the newline is explicit (`\r?\n`). That was the "Section 6 / GEÏNTEGREERDE" fix.
- What the handoff asked for and is still not in place:
  1. It's still an **array of three patterns** (lines 223–227) with a first-to-reach-6-matches loop. The third pattern has **no third capture group**.
  2. Line 249 is `match[3] || match[0].replace(/^\d+\.\s*[A-Z\s&]+\s*/, '')`. When the third pattern wins, `match[3]` is undefined and the ASCII-only cleanup regex runs on the full match — that is the surviving "eats first characters" path (it also can't strip an accented heading, so it chews into body text).

## Plan

1. Replace the three-pattern array with the single structural regex (the current pattern #1, which has the content capture group) and drop the fallback loop.
2. Change line 249 to `const content = (match[3] ?? '').trim()` — no `match[0]` cleanup fallback, so no character-eating path remains.
3. Keep the existing empty/quote-content validation and log lines so a genuinely missing section still surfaces visibly rather than silently.
4. Deploy `generate-personality-report` and confirm the deploy returns success.

Nothing else in the file changes; the voice half needs no edit.

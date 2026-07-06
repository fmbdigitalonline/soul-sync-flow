# Phase 1 — Reflex & Hands

Scope: five surgical wirings in `companion-oracle-conversation` + `openai-agent`. No new pages, no new engines, no schema changes. Each item ships independently, verifiable in one fresh-account run.

Order matters — 1 and 2 are the hands (they unblock the DreamCard slice); 3 is the reflex; 4 and 5 are context injections that arm the charters already in the prompt.

---

## 1. Rewire `decompose_goal` → real `generatePlanBranches`

**Bug found during exploration:** the oracle currently calls
```
supabase.functions.invoke('openai-agent', { body: { action: 'decompose_goal', ... } })
```
but `openai-agent/index.ts` (line 531/542) reads only `{ messages, model, temperature, tools, max_tokens }` from the request body — there is no `action` router. The invoke silently returns `null`, `milestones` falls through to `[]`, and every DreamCard is created empty. Separately, `generatePlanBranches` (line 104) currently returns literal placeholder strings ("Branch A", "Step 1A") — a stub, not a real decomposition.

Fix (both files):

- **`supabase/functions/openai-agent/index.ts`** — add an `action` branch at the top of `serve(...)` before the existing chat-completion path:
  - If `body.action === 'decompose_goal'`, call a new real implementation `decomposeGoalReal({ title, description, timeframe, category, userId })` that:
    - Loads the user's blueprint + hermetic structured intelligence (execution_bias, temporal_biology, identity_constructs).
    - Calls Azure via existing `callChatCompletion` with a strict system prompt: "Return JSON `{ milestones: [{ title, description, target_date_offset_days, order }] }`, 4–6 items, each milestone concrete and time-bounded, sequenced toward the user's stated goal verbatim, personalised by the provided blueprint slice."
    - Parses JSON, validates shape, returns `{ milestones }`.
  - Return `{ milestones }` as JSON; keep existing tool-loop path untouched for other callers.
- **`generatePlanBranches` stub** stays untouched for now (it's used by other tool paths); we do not need multi-branch generation for the Phase 1 slice — one solid decomposition beats two fake ones. Rewiring `generatePlanBranches` to real logic is deferred to Phase 3 (orchestrator plan chain).
- **`companion-oracle-conversation/index.ts`** — no signature change to the invoke, but add a hard failure path: if `dec?.milestones?.length < 3`, do NOT insert the goal row; instead return a tool result `{ ok: false, reason: 'decomposition_failed' }` so the model narrates a retry rather than creating an empty card.

Verification: fresh-account "gtg" flow produces a DreamCard whose milestones are real and personalised.

---

## 2. Goal-title fidelity guard

The `decompose_goal` tool description already says "USER'S OWN stated goal verbatim." Reinforce structurally so the model can't reframe:

- **`companion-oracle-conversation/index.ts`** in `runCompanionTool('decompose_goal', args)`:
  - Before invoking openai-agent, scan the last 6 user turns (already in scope) for the longest quoted or numeric goal phrase (e.g. "€1,000,000", "earn a million", "quit my job by June").
  - If `args.title` shares < 60% token overlap with any such phrase and the user's raw text contains a clear goal noun, rewrite `args.title` to the user's phrase and log `⚠️ goal-title repaired: "<model>" → "<user>"`.
  - Never block; always proceed with the repaired title.
- Add one line to the tool description in the Voice/Action charter section of the system prompt: "Do not reframe, translate, or abstract the user's stated goal — copy their words."

Verification: user says "I want to earn €1,000,000" → DreamCard title is exactly that, not "Achieve financial freedom."

---

## 3. ACS confirmation cluster → `tool_choice: 'required'`

`detectConversationState(...)` at line 1148 already computes `detectionResult.cluster`. Currently the tool loop always uses `tool_choice: 'auto'`, so the model can keep talking about a goal instead of calling `decompose_goal` even after the user confirms.

- **`companion-oracle-conversation/index.ts`** at line 2114 (initial `callChat`) and 2138 (loop `callChat`):
  - Compute `const shouldForceTool = conversationState?.detectionResult?.cluster === 'confirmation' && toolRounds === 0;`
  - First call: `tool_choice: shouldForceTool ? 'required' : 'auto'`.
  - Loop: keep existing `toolRounds >= 2 ? 'none' : 'auto'` — never re-force after round 0.
- Log the decision: `🎯 TOOL CHOICE: required (cluster=confirmation)` vs `auto`.

Guardrail: only force when a decompose-eligible goal is already in recent context. If no user-stated goal noun appears in the last 4 turns, keep `'auto'` even on confirmation — otherwise "yes" to a non-goal question would misfire the tool.

Verification: user states goal → oracle asks "want me to break this down?" → user "yes" → oracle turn contains the tool call, not another question.

---

## 4. Structured intelligence state spine (≤400 tokens/turn)

`hermetic_structured_intelligence` holds the 13 typed dimensions. Currently the oracle uses the free-form hermetic report but not the structured slice per turn.

- **`companion-oracle-conversation/index.ts`** — new helper `buildStructuredIntelligenceSpine(userId)` called once alongside blueprint fetch (~line 1140):
  - Select a fixed subset: `execution_bias` (2 fields), `behavioral_triggers.avoidance_patterns` (top 3), `temporal_biology.cognitive_peaks`, `identity_constructs.core_narratives[0]`, `crisis_handling.bounce_back_rituals[0]`.
  - Serialise as a single system message block ≤ ~350 tokens (hard-cap by trimming arrays), prefixed `USER STATE SPINE (structured):`.
  - Insert into `completionParams.messages` immediately after the main system prompt and before conversation history — same slot every turn so caching is stable.
  - Fail-soft: if row missing, skip the block entirely (no fallback text).

Verification: log line `📐 SPINE: ~N tokens injected` on every turn; oracle responses reference concrete personal patterns rather than generic ones.

---

## 5. Shadow-detector cue injection (arms Voice Charter rule 5)

`ConversationShadowDetector` already exists at `supabase/functions/_shared/conversation-shadow-detector.ts` and is used by `openai-agent`. The oracle doesn't call it, so loaded disclosures pass without a confrontation cue.

- **`companion-oracle-conversation/index.ts`** — after `detectConversationState(...)` and before building the final system message:
  - Import `ConversationShadowDetector` from `_shared/conversation-shadow-detector.ts`.
  - Call a lightweight synchronous method (add one if only async batch methods exist: `detectFromMessage(message: string): { cue: string } | null`) that pattern-matches the current user turn only — no DB reads, keep < 20ms.
  - If a projection / limiting-belief / resistance signal fires, append ONE line to the system prompt: `SHADOW CUE (do not name it, respond to it): <cue>` — e.g. "user is externalising blame; confront with care."
  - Never surface the cue in output; it only re-weights the response. If nothing fires, inject nothing.
- Reuse existing patterns from `ConversationShadowDetector`; do not duplicate regex.

Verification: user says "everyone always sabotages my plans" → oracle response gently reflects the pattern instead of validating it. Log line `🩶 SHADOW CUE: <type>` when triggered.

---

## Files touched

- `supabase/functions/companion-oracle-conversation/index.ts` — items 1 (fail-path), 2, 3, 4, 5
- `supabase/functions/openai-agent/index.ts` — item 1 (new `action` branch + `decomposeGoalReal`)
- `supabase/functions/_shared/conversation-shadow-detector.ts` — item 5 (add `detectFromMessage` sync helper only if missing)

No frontend changes. No schema changes. No new secrets. Both edge functions must be deployed after edit; deploy timestamps will be reported.

---

## Out of scope for Phase 1 (deferred, do not touch)

- `evaluatePlanAlignment` narration wrap around DreamCard (Phase 3, orchestrator chain).
- Multi-branch decomposition (Phase 3).
- `start_task_session` tool and FocusCard (Phase 2).
- Today pin, PIE day-2 proactive message (Phase 2).
- Anything under `src/` — no UI work this phase.

## Verification recipe (one fresh-account run)

1. Signup → 3-screen onboarding → reveal → first contact fires.
2. User: "I want to earn €1,000,000 in the next 3 years."
3. Oracle asks the decompose question.
4. User: "yes go for it".
5. Assert (all in one turn):
   - Console: `🎯 TOOL CHOICE: required (cluster=confirmation)`.
   - Console: `📐 SPINE: ~N tokens injected`.
   - Network: `openai-agent` invoked with `action: 'decompose_goal'`, returns ≥ 4 milestones.
   - DreamCard rendered inline; title reads exactly `Earn €1,000,000`; milestones are concrete and personalised.
6. User: "gtg" → open loop closes cleanly, one earned question.

If any assertion fails, do not proceed to Phase 2.

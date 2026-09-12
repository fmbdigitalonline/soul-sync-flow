# Fix: dream breakdown fails at "Mijlpalen Creëren"

## What actually happens (verified, not guessed)

I reproduced the failure and read the server logs for your 08:32 attempt:

- Your request reached the AI step with a 7,709-character prompt and a 5,000-token output budget.
- The AI returned **nothing at all** — the server logged `Empty AI response received` and answered with an error, which is exactly the "Failed to generate your personalized goal breakdown" you saw on screen.
- Cause: the model in use does internal "thinking" that is charged against the same 5,000-token budget as the answer. On a long decomposition prompt the thinking consumes the whole budget and no JSON is ever written out. Short prompts still work — I tested one and it returned fine — which is why this looks intermittent.

A second, separate defect surfaced during testing: when the breakdown is requested, no agent type is sent, so the server falls back to its "guide" personality, which is explicitly told to refuse productivity and planning work. In my test it answered in Dutch that it *will not* make a work-structure plan, and returned that refusal as if it were the breakdown. Even when the token problem is fixed, this would produce garbage milestones.

## The fix

1. **Give the breakdown step a thinking-free, larger budget.** Mark the goal-decomposition call as fixed-shape JSON work (the project already has a `structured` task kind with reasoning turned off) and raise its output budget so long prompts can finish. No model change, no new provider.
2. **Send the right personality for breakdowns.** The decomposition call must request the planning/coach persona instead of silently defaulting to the persona that refuses planning.
3. **Fail visibly instead of silently.** Log the provider's finish reason and token usage on every call, and when the answer is empty because the budget ran out, return that specific cause instead of a generic "empty response" — so this can never again look like a mystery 500.

## Technical detail

- `supabase/functions/ai-coach/index.ts`
  - Pass `task: 'structured'` (via `_shared/model.ts` `REASONING_BY_TASK`, which maps `structured → reasoning 'none'`) to `callChatCompletion` when `context === 'razor_aligned_goal_decomposition'`; keep `task: 'chat'` for normal coaching turns.
  - Raise the decomposition budget from 5,000 to 16,000 `max_completion_tokens`, and stop letting a client-supplied `maxTokens` lower it below that for this context.
  - Log `data.choices[0].finish_reason` and `data.usage` (including `completion_tokens_details.reasoning_tokens`); when content is empty and `finish_reason === 'length'`, throw a distinct `OUTPUT_BUDGET_EXHAUSTED` error with the numbers in the body.
- `src/services/soul-goal-decomposition-service.ts`
  - Include `agentType: 'coach'` in the `ai-coach` invoke body for decomposition (and for the JSON-healing call at ~line 827, which has the same gap).
  - Map the new `OUTPUT_BUDGET_EXHAUSTED` code to a clear user message instead of the generic failure text.
- Deploy `ai-coach`, then verify with a real decomposition-sized prompt: logs must show `reasoning=none`, `finish_reason: "stop"`, and a JSON milestone payload.

## Not touched

Detection services, hermetic pipeline, other edge functions, and the model pin (`gpt-5.6-luna`) all stay as they are. Dev Response: The diagnosis is credible, but I would **not ship the fix exactly as written**. It needs several corrections to be reliable.

**What’s verified**

- Decomposition explicitly sends `maxTokens: 5000` in [soul-goal-decomposition-service.ts (line 145)](/Users/feurionbanel_1/Documents/Codex/2026-09-12/referenced-chatgpt-conversation-this-is-an/work/soul-sync-flow/src/services/soul-goal-decomposition-service.ts:145).
- `ai-coach` honors that client value and otherwise defaults decomposition to 5,000 in [index.ts (line 205)](/Users/feurionbanel_1/Documents/Codex/2026-09-12/referenced-chatgpt-conversation-this-is-an/work/soul-sync-flow/supabase/functions/ai-coach/index.ts:205).
- The call omits `task`, so the shared wrapper uses `chat` and low reasoning.
- The request omits `agentType`, so `ai-coach` selects `guide`, whose system prompt forbids productivity and goal-setting advice at [index.ts (line 169)](/Users/feurionbanel_1/Documents/Codex/2026-09-12/referenced-chatgpt-conversation-this-is-an/work/soul-sync-flow/supabase/functions/ai-coach/index.ts:169).
- Empty content currently becomes an undifferentiated 500 at [index.ts (line 296)](/Users/feurionbanel_1/Documents/Codex/2026-09-12/referenced-chatgpt-conversation-this-is-an/work/soul-sync-flow/supabase/functions/ai-coach/index.ts:296).

**Required corrections**

1. `task: 'structured'` **currently does not disable reasoning.**  
The helper calculates `none` but only sends `reasoning_effort` when it is *not* `none`, at [azure-openai.ts (line 178)](/Users/feurionbanel_1/Documents/Codex/2026-09-12/referenced-chatgpt-conversation-this-is-an/work/soul-sync-flow/supabase/functions/_shared/azure-openai.ts:178). GPT-5.6 Luna defaults to medium reasoning, so the logs would say `reasoning=none` while the provider could still reason. The request must explicitly send `reasoning_effort: 'none'`. [OpenAI’s model documentation](https://developers.openai.com/api/docs/models/gpt-5.6-luna)
2. **Don’t use the generic** `coach` **persona.**  
It demands numbered prose, conflicting with the required raw JSON. It also forbids relationship and spiritual subjects, even though those are supported dream categories. Use a dedicated, neutral decomposition system prompt, and a separate JSON-repair prompt.
3. **Use Structured Outputs.**  
Pass `response_format` with a strict JSON schema. Luna supports Structured Outputs, and the Chat Completions API recommends `json_schema` over prompt-only JSON instructions. [Chat Completions reference](https://platform.openai.com/docs/api-reference/chat/create)
4. **Fix the prompt’s invalid JSON example.**  
Lines 699–705 in [soul-goal-decomposition-service.ts (line 699)](/Users/feurionbanel_1/Documents/Codex/2026-09-12/referenced-chatgpt-conversation-this-is-an/work/soul-sync-flow/src/services/soul-goal-decomposition-service.ts:699) place plain instructional text inside the example JSON object. Move those instructions outside it.
5. **Detect every** `finish_reason: 'length'`**.**  
This must include partially returned content, not only empty content. A truncated non-empty JSON response should not be sent to the healing call.
6. **Parse the actual Supabase error body.**  
For a non-2xx Edge Function response, the new `errorCode` is in `await error.context.json()`, not normally in `error.message`. The proposed UI mapping will not work without this. [Supabase error handling](https://supabase.com/docs/reference/javascript/functions-invoke)
7. **Make 16,000 a server-owned cap.**  
Ignore client token values for this context rather than merely enforcing a minimum. `ai-coach` currently has JWT verification disabled and no internal authentication check at [config.toml (line 81)](/Users/feurionbanel_1/Documents/Codex/2026-09-12/referenced-chatgpt-conversation-this-is-an/work/soul-sync-flow/supabase/config.toml:81), so allowing arbitrary client budgets creates an abuse and cost risk.

**Impact and tradeoffs**

- Reliability should improve substantially: explicit reasoning control, schema-constrained JSON, and no contradictory persona.
- Latency should fall with reasoning disabled.
- The output ceiling rises 3.2×. At Luna’s current $1.20 per million output tokens, fully consuming 16,000 tokens is about $0.019 versus $0.006 at 5,000; actual cost depends on generated tokens.
- Reasoning-free generation may reduce milestone quality because this is genuine planning, not simple extraction. Evaluate plan quality; if it regresses, use low reasoning with the larger budget.
- Correcting the shared helper also makes existing `classify → none` mappings effective, so those classification paths need regression coverage.

The final verification should assert that the provider request explicitly contains `reasoning_effort: "none"`, `reasoning_tokens` is zero, `finish_reason` is `stop`, the schema validates, and the maximum case produces exactly 10 milestones and 40 tasks. Also test a mocked `length` response and confirm the user receives the specific budget-exhausted message.

No files were modified.
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

Detection services, hermetic pipeline, other edge functions, and the model pin (`gpt-5.6-luna`) all stay as they are.

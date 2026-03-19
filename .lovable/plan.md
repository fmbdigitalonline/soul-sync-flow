

# Fix Azure OpenAI 401 "Invalid Subscription Key" Error

## Root Cause

The URL and API version are now correct (the sanitization fix worked -- logs show clean URLs like `https://info-mmvyk0rc-eastus2.cognitiveservices.azure.com/openai/deployments/...`). However, all functions still return **401 Unauthorized**.

The problem: **`AZURE_OPENAI_KEY` is the only env var NOT being sanitized**. On line 18 of `azure-openai.ts`:

```
const AZURE_OPENAI_KEY = Deno.env.get('AZURE_OPENAI_KEY');  // ← RAW, no sanitization
const AZURE_OPENAI_ENDPOINT = sanitizeEnv(Deno.env.get('AZURE_OPENAI_ENDPOINT'));  // ← sanitized
```

If the key was saved with surrounding quotes (just like the endpoint was), the `api-key` header would contain literal `"` characters, causing Azure to reject it. The sanitizeEnv helper strips these for the endpoint and API version, but was never applied to the key.

Additionally, there are **two other edge functions** that still reference `openAIApiKey` directly instead of using the shared helper:
- `extract-hermetic-intelligence/index.ts` (line 10)
- `unified-brain-processor/index.ts` (line 500)

## Plan

### 1. Sanitize `AZURE_OPENAI_KEY` (the fix)
In `supabase/functions/_shared/azure-openai.ts`, apply `sanitizeEnv()` to `AZURE_OPENAI_KEY`:
```typescript
const AZURE_OPENAI_KEY = sanitizeEnv(Deno.env.get('AZURE_OPENAI_KEY'));
```

### 2. Re-save the `AZURE_OPENAI_KEY` secret
Use the secrets tool to update `AZURE_OPENAI_KEY` with the clean key value (no quotes). This fixes it at the source; the sanitization prevents recurrence.

### 3. Add diagnostic logging
Add a one-time log in `callChatCompletion` and `callEmbeddings` that prints the key length and first/last 4 characters (masked), so we can verify the key is being read correctly without exposing it.

### 4. Fix remaining legacy `openAIApiKey` references
Update `extract-hermetic-intelligence/index.ts` and `unified-brain-processor/index.ts` to use `callChatCompletion` from the shared helper instead of direct OpenAI calls, preventing future auth failures.

## Files Changed
- `supabase/functions/_shared/azure-openai.ts` -- sanitize key + add masked key logging
- `supabase/functions/extract-hermetic-intelligence/index.ts` -- migrate to shared helper
- `supabase/functions/unified-brain-processor/index.ts` -- migrate to shared helper
- Update `AZURE_OPENAI_KEY` secret


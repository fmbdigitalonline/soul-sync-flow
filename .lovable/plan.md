

# Root Cause: Two Different Azure Resources

## The Problem

Your screenshots reveal the core issue clearly:

| Deployment | Azure Resource (Host) |
|---|---|
| `gpt-4.1-mini` | `multimodalhacsbrain.cognitiveservices.azure.com` |
| `text-embedding-3-small` | `info-mmvyk0rc-eastus2.cognitiveservices.azure.com` |

The current code has **one single `AZURE_OPENAI_ENDPOINT`** variable used for both chat and embeddings. Whichever endpoint you set, the other deployment returns 404 because it doesn't exist on that resource.

Additionally, the two resources likely have **different API keys** — one key won't work for both.

## Plan

### Step 1: Add separate endpoint + key for embeddings

In `supabase/functions/_shared/azure-openai.ts`, add support for:
- `AZURE_OPENAI_EMBEDDINGS_ENDPOINT` (falls back to `AZURE_OPENAI_ENDPOINT` if not set)
- `AZURE_OPENAI_EMBEDDINGS_KEY` (falls back to `AZURE_OPENAI_KEY` if not set)

The `callEmbeddings()` function will use these dedicated vars, while `callChatCompletion()` continues using the existing ones.

### Step 2: Add endpoint path sanitization

Strip any `/openai/deployments/...` suffix from endpoint values, since Azure portal shows the full URL and users tend to paste it entirely. This prevents double-path URLs.

### Step 3: Set 4 Supabase secrets

| Secret | Value |
|---|---|
| `AZURE_OPENAI_ENDPOINT` | `https://multimodalhacsbrain.cognitiveservices.azure.com` |
| `AZURE_OPENAI_KEY` | API key from `multimodalhacsbrain` resource |
| `AZURE_OPENAI_EMBEDDINGS_ENDPOINT` | `https://info-mmvyk0rc-eastus2.cognitiveservices.azure.com` |
| `AZURE_OPENAI_EMBEDDINGS_KEY` | API key from `info-mmvyk0rc-eastus2` resource |

### Step 4: Fix behavioral memory crash

Fix the null-safe access bug in `companion-oracle-conversation/index.ts` that causes `TypeError: Cannot read properties of undefined`.

## Files Changed
- `supabase/functions/_shared/azure-openai.ts` — split endpoint/key for embeddings, add path sanitization
- `supabase/functions/companion-oracle-conversation/index.ts` — null-safe behavioral memory
- 4 Supabase secrets updated




# Route All AI Calls Through Azure OpenAI

## Current State
- **39 edge functions** all call `https://api.openai.com/v1/chat/completions` directly
- Auth: `Bearer ${OPENAI_API_KEY}` header
- Models used: `gpt-4.1-mini-2025-04-14`, `text-embedding-3-small`
- 2 functions use the embeddings endpoint (`/v1/embeddings`)

## What Changes

Azure OpenAI uses a different URL format and auth header:

```text
OpenAI:  https://api.openai.com/v1/chat/completions
         Authorization: Bearer <OPENAI_API_KEY>

Azure:   https://<RESOURCE>.openai.azure.com/openai/deployments/<DEPLOYMENT>/chat/completions?api-version=2024-10-21
         api-key: <AZURE_OPENAI_KEY>
```

The response format is identical, so no parsing changes are needed.

## Implementation Plan

### Step 1: Add Azure secrets to Supabase
Three new secrets needed in Supabase Edge Functions settings:
- `AZURE_OPENAI_KEY` — your Azure OpenAI API key
- `AZURE_OPENAI_ENDPOINT` — e.g. `https://your-resource.openai.azure.com`
- `AZURE_OPENAI_API_VERSION` — e.g. `2024-10-21`

### Step 2: Create a shared helper module
Create `supabase/functions/_shared/azure-openai.ts` with:
- A function that maps model names (e.g. `gpt-4.1-mini-2025-04-14`) to your Azure deployment names
- A `callAzureChat(messages, deploymentName, maxTokens)` wrapper
- A `callAzureEmbeddings(input, deploymentName)` wrapper
- Falls back to direct OpenAI if Azure vars are not set (safety net)

### Step 3: Update all 39 edge functions
Replace each direct `fetch('https://api.openai.com/...')` call with the shared helper. The changes per file are mechanical — swap the fetch call, keep everything else identical.

**Chat completions** (37 functions): Replace the fetch URL and auth header.
**Embeddings** (2 functions: `openai-embeddings`, `semantic-blueprint-search`): Same pattern but with the embeddings deployment.

### Step 4: Model deployment mapping
You'll need these deployments in your Azure OpenAI resource:
- One for `gpt-4.1-mini-2025-04-14` (chat completions)
- One for `text-embedding-3-small` (embeddings)

The shared helper will map the OpenAI model name to the Azure deployment name via a simple config object.

## Security Benefits
- API key stays within your Azure tenant
- Data not sent to OpenAI directly — stays in your Azure region
- Azure content filtering and compliance controls apply
- Can add private endpoints / VNet restrictions later

## What You Need to Provide
1. Your Azure OpenAI resource endpoint URL
2. Your Azure OpenAI API key
3. The deployment names you created for each model

## Files Modified
- 1 new: `supabase/functions/_shared/azure-openai.ts`
- ~39 edge functions updated (mechanical find-and-replace of fetch calls)
- No frontend/client code changes
- No database changes


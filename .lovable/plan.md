

# Fix Azure OpenAI Invalid URL Errors

## Root Cause

The edge function logs reveal **two distinct bugs** causing both chat and embeddings to fail:

### Bug 1: Quoted Endpoint
The `AZURE_OPENAI_ENDPOINT` secret was saved **with literal quote characters** around it. The constructed URL becomes:
```
"https://info-mmvyk0rc-eastus2.cognitiveservices.azure.com/"/openai/deployments/...
```
Note the `"` characters — this is an invalid URL.

### Bug 2: Malformed API Version
The `AZURE_OPENAI_API_VERSION` secret appears to be set to `AZURE_OPENAI_API_VERSION=v1` (key=value format instead of just the value). The chat URL becomes:
```
...?api-version=AZURE_OPENAI_API_VERSION=v1
```

## Plan

### 1. Update secrets (fix at source)
- Set `AZURE_OPENAI_ENDPOINT` to `https://info-mmvyk0rc-eastus2.cognitiveservices.azure.com` (no quotes, no trailing slash)
- Set `AZURE_OPENAI_API_VERSION` to `2024-10-21` (just the version string)

### 2. Add defensive sanitization in `azure-openai.ts` (prevent recurrence)
Add a helper that strips surrounding quotes and trailing slashes from the endpoint value at load time:
```typescript
const rawEndpoint = Deno.env.get('AZURE_OPENAI_ENDPOINT') || '';
const AZURE_OPENAI_ENDPOINT = rawEndpoint.replace(/^["']|["']$/g, '').replace(/\/+$/, '');
```
Same for API version — strip any `KEY=` prefix if accidentally included.

### 3. Fix `hacs-intelligent-conversation` (bonus bug)
The logs also show `ReferenceError: openAIApiKey is not defined` at line 110. This function still references a removed variable instead of using the shared Azure helper. Will need to update it to use `callChatCompletion` from the shared module.

## Files Changed
- `supabase/functions/_shared/azure-openai.ts` — add input sanitization for endpoint and API version
- `supabase/functions/hacs-intelligent-conversation/index.ts` — fix `openAIApiKey` reference error
- Update 2 Supabase secrets: `AZURE_OPENAI_ENDPOINT`, `AZURE_OPENAI_API_VERSION`




# Fix Azure Embeddings 404 Error

## Root Cause
Your Azure resource endpoint is `https://info-mmvyk0rc-eastus2.cognitiveservices.azure.com/` — this uses the **Cognitive Services** URL format, not the typical `openai.azure.com` format. The deployment name `text-embedding-3-small` and model mapping are correct.

The 404 is likely caused by one of two issues:
1. The `AZURE_OPENAI_ENDPOINT` secret may be set to a different URL format
2. The API version `2024-10-21` may not be supported for embeddings on your resource (your Azure page shows `2024-02-01`)

## Plan

### 1. Update `AZURE_OPENAI_ENDPOINT` secret
Ensure it is set to exactly: `https://info-mmvyk0rc-eastus2.cognitiveservices.azure.com`

### 2. Support different API versions for embeddings vs chat
Update `supabase/functions/_shared/azure-openai.ts` to allow a separate API version for embeddings, since Azure often requires different versions for different endpoints:
- Chat completions: keep using `2024-10-21` (or the configured version)
- Embeddings: use `2024-02-01` (known working for your resource)

Add a constant like `AZURE_OPENAI_EMBEDDINGS_API_VERSION` defaulting to `2024-02-01`, used only in `callEmbeddings()`.

### 3. Add debug logging
Log the full URL being called in `callEmbeddings()` so we can verify the exact request path on next test.

## Files Changed
- `supabase/functions/_shared/azure-openai.ts` — add embeddings API version, add URL logging
- Update `AZURE_OPENAI_ENDPOINT` secret if needed


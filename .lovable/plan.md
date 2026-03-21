

# Update Azure OpenAI Secrets for New Deployment

## What's needed

You've confirmed:
- **Deployment name**: `gpt-4.1-mini` (matches current mapping, no code change needed)
- **API Key**: needs updating
- **Endpoint**: needs updating

## Plan

### Step 1: Update `AZURE_OPENAI_ENDPOINT` secret
Prompt you to enter the new endpoint URL from your Azure resource.

### Step 2: Update `AZURE_OPENAI_KEY` secret
Prompt you to enter the API key (Key 1 or Key 2) from your Azure resource's "Keys and Endpoint" page.

### Step 3: Verify
No code changes required since the deployment name `gpt-4.1-mini` already matches the `MODEL_TO_DEPLOYMENT` mapping in `_shared/azure-openai.ts`.

After updating both secrets, you can test by sending a message in the companion chat.

## Files Changed
- None (secrets update only)


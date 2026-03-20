

# Fix: AZURE_OPENAI_KEY Contains Wrong Value

## Root Cause

The edge function logs prove the `AZURE_OPENAI_KEY` Supabase secret holds the endpoint URL instead of the actual API key:

```
key length=26, key=http....com
```

An Azure OpenAI API key looks like `a1b2c3d4e5f6...` (32 hex characters). This value is clearly a URL fragment.

## Fix

### 1. Update the `AZURE_OPENAI_KEY` secret
Set it to the actual API key from the Azure portal:
- Go to [Azure AI Foundry](https://ai.azure.com) or the Azure portal
- Navigate to your resource: `info-mmvyk0rc-eastus2`
- Under **Keys and Endpoint**, copy **Key 1** or **Key 2**
- It will be a 32-character hex string

We will use the secrets tool to save the correct value.

### 2. No code changes needed
The sanitization and logging code is already correct. Once the right key is in the secret, everything will work.

## Files Changed
- None (secret update only)




# Fix Azure Deployment Name Mapping

## Problem
The shared helper maps `gpt-4.1-mini-2025-04-14` → `gpt-4-1-mini` (dashes), but the actual Azure deployment name is `gpt-4.1-mini` (dots). This likely caused the 404 errors.

## Change
Update `supabase/functions/_shared/azure-openai.ts` line 27:
- `'gpt-4.1-mini-2025-04-14': 'gpt-4-1-mini'` → `'gpt-4.1-mini-2025-04-14': 'gpt-4.1-mini'`

Also add mappings for other models you have available in case they're needed in the future (e.g., `gpt-4o`, `gpt-4.1`, `gpt-4.1-nano`).

## Impact
Single line change in one file. All 39 edge functions will automatically pick up the corrected deployment name.


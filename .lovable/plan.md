# Holistic Root Cause Analysis: Companion AI Stack

## Summary of Findings

After tracing the full dataflow from `Coach.tsx` through every edge function, I identified **three independent failure points** that collectively break all conversation modes.

---

## Issue 1: Azure Deployment `gpt-4.1-mini` Not Found (BLOCKING)

**Error**: `DeploymentNotFound: The API deployment for this resource does not exist`

**What happens**: The shared helper `_shared/azure-openai.ts` maps model `gpt-4.1-mini-2025-04-14` → deployment name `gpt-4.1-mini`. Azure returns 404 because this deployment didn't exist until you just created it.

**Impact**: ALL 36+ edge functions that call `callChatCompletion()` fail. This includes:

- `companion-oracle-conversation` (companion mode)
- `hacs-intelligent-conversation` (guide mode)
- `unified-brain-processor` (unified brain)
- Every analyst function

**Fix**: Since you just created the `gpt-4.1-mini` deployment in Azure, it may take up to 5 minutes to propagate. If it still fails after that, we need to verify the exact deployment name matches what's in `MODEL_TO_DEPLOYMENT`. No code change needed if the deployment name is literally `gpt-4.1-mini`.

**Action**: Wait 5 minutes, then test. If still failing, update `MODEL_TO_DEPLOYMENT` in `_shared/azure-openai.ts` to match your actual Azure deployment name.

---

## Issue 2: Behavioral Memory `toLowerCase` Crash (Code Bug)

**Error**: `TypeError: Cannot read properties of undefined (reading 'toLowerCase')` at `companion-oracle-conversation/index.ts:518`

**What happens**: The `getBehavioralMemoryContext` function iterates over `user_session_memory` rows and calls `.toLowerCase()` on a field that can be `null` or `undefined`. This crashes mid-pipeline but is caught and logged as non-blocking.

**Impact**: Companion Oracle loses behavioral memory context (degraded responses, not a crash).

**Fix**: Add null-safe access in the `.map()` call around line 517-518 of `companion-oracle-conversation/index.ts`.

---

## Issue 3: Dual Conversation Path Confusion

**Dataflow** (traced end-to-end):

```text
Coach.tsx
  └─ useHACSConversationAdapter("guide", "companion")
       ├─ pageContext === "companion" → isCompanionMode = true
       │   └─ calls companion-oracle-conversation  ← FAILS (Issue 1 + 2)
       └─ fallback: calls hacs-intelligent-conversation ← ALSO FAILS (Issue 1)
```

Both paths fail because of Issue 1 (deployment not found). The adapter correctly detects companion mode and routes to the Oracle, but the Oracle can't complete its AI call.

---

## Plan

### Step 1: Verify Azure deployment propagation

set up`gpt-4.1-mini` azur deployment 

### Step 2: Fix behavioral memory null safety

**File**: `supabase/functions/companion-oracle-conversation/index.ts` (~line 517-518)
Add null checks in the `getBehavioralMemoryContext` function to prevent the `toLowerCase` crash on undefined memory fields.

### Step 3: Add deployment name verification logging

**File**: `supabase/functions/_shared/azure-openai.ts`
Add a one-time log at boot that prints the resolved deployment name and full URL, so we can immediately see if the mapping is wrong without waiting for a user request.

### Step 4: (If needed) Update MODEL_TO_DEPLOYMENT mapping

If the Azure deployment name isn't exactly `gpt-4.1-mini`, update the mapping in `_shared/azure-openai.ts` to match your actual deployment name. This fixes all 36+ edge functions at once.

## Files Changed

- `supabase/functions/companion-oracle-conversation/index.ts` — null-safe behavioral memory
- `supabase/functions/_shared/azure-openai.ts` — deployment verification logging + potential mapping fix
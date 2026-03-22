

# System Plumbing Audit: Full SoulSync AI Stack + Floating Orb Intelligence

## Architecture Overview

```text
┌──────────────────────────────────────────────────────────────────────┐
│                        FLOATING ORB (UI LAYER)                       │
│  FloatingHACSOrb.tsx (1397 lines, 17 hooks)                         │
│  ┌─────────┐ ┌──────────┐ ┌───────────┐ ┌──────────┐ ┌───────────┐ │
│  │Presence │ │Insights  │ │MicroLearn │ │Shadow    │ │XP Progress│ │
│  │System   │ │Queue     │ │System     │ │Detector  │ │System     │ │
│  └────┬────┘ └────┬─────┘ └─────┬─────┘ └────┬─────┘ └─────┬─────┘ │
└───────┼──────────┼──────────────┼─────────────┼─────────────┼───────┘
        │          │              │             │             │
┌───────┼──────────┼──────────────┼─────────────┼─────────────┼───────┐
│       ▼          ▼              ▼             ▼             ▼       │
│  ADAPTER LAYER: use-hacs-conversation-adapter.ts                    │
│  Routes: companion → companion-oracle-conversation                  │
│          guide     → hacs-intelligent-conversation                  │
│  Fallback: Oracle fail → HACS fallback                              │
└───────────────────────────┬─────────────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────────────┐
│  EDGE FUNCTIONS (Backend)                                           │
│  ┌─────────────────────┐  ┌──────────────────────┐                 │
│  │companion-oracle-    │  │hacs-intelligent-     │                 │
│  │conversation         │  │conversation          │                 │
│  │(2218 lines)         │  │(870 lines)           │                 │
│  └─────────┬───────────┘  └──────────┬───────────┘                 │
│            │                         │                              │
│  ┌─────────▼─────────────────────────▼───────────┐                 │
│  │  _shared/azure-openai.ts (Central AI Router)  │                 │
│  │  Chat → multimodalhacsbrain (gpt-4.1-mini)    │                 │
│  │  Embed → info-mmvyk0rc-eastus2 (text-embed-3) │                 │
│  └───────────────────────────────────────────────┘                 │
│                                                                     │
│  ┌──────────────────────┐  ┌──────────────────┐                    │
│  │unified-brain-        │  │openai-embeddings │                    │
│  │processor (904 lines) │  │(shared helper)   │                    │
│  │11 HACS modules       │  └──────────────────┘                    │
│  └──────────────────────┘                                          │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Status: What's Working

Based on edge function logs and console output, the core pipeline is **healthy**:

1. **Azure Chat (gpt-4.1-mini)**: Hitting `multimodalhacsbrain.cognitiveservices.azure.com` correctly
2. **Azure Embeddings (text-embedding-3-small)**: Generating 1536-dim vectors via `info-mmvyk0rc-eastus2`
3. **Companion Oracle**: Responding with full hermetic context injection
4. **Unified Brain**: All 11 modules processing successfully
5. **XP Award Service**: Awarding XP after hermetic processing
6. **Shadow Detector**: Running (0 patterns found — expected for casual messages)
7. **Orb Presence System**: Singularity Principle working (floating/chat_avatar/center_loading)
8. **Conversation Memory**: Messages stored with progressive memory features

---

## Issues Found

### Issue 1: `process-blueprint-embeddings-v3` — Dead `OPENAI_API_KEY` Guard (LOW)

**File**: `supabase/functions/process-blueprint-embeddings-v3/index.ts` line 38-41

The function checks for `OPENAI_API_KEY` at startup and throws if missing, but it actually uses `callEmbeddings()` from the shared Azure helper (line 271). Since `OPENAI_API_KEY` is likely not set (you're on Azure), this function will crash on invocation even though it doesn't need that key.

**Fix**: Remove the `openaiApiKey` variable and its check. The shared helper handles credential resolution.

---

### Issue 2: Excessive Console Logging in FloatingHACSOrb (MEDIUM)

**File**: `src/components/hacs/FloatingHACSOrb.tsx` lines 219, 866

Every render logs the full `intelligence` object, `currentInsight`, and `presenceState` — that's ~50 lines of JSON per render cycle. With React re-renders, this creates massive console noise (visible in the provided logs). This impacts developer experience and browser performance.

**Fix**: Remove or gate behind `shouldEnableDebugPolling()`.

---

### Issue 3: 17 Hooks in Single Component — Performance Risk (MEDIUM)

The FloatingHACSOrb imports and initializes 17 hooks on every mount. Several perform DB queries on mount (`useUser360`, `useBlueprintData`, `useUserProfile`, `useXPProgression`, `useHacsIntelligence`, `useHermeticReportStatus`). This means **6+ concurrent Supabase queries** fire every time the orb mounts.

**Observation only** — no fix proposed, but worth noting as a future refactoring target.

---

### Issue 4: Subconscious Shadow Detector — Always Returns 0 Patterns (LOW)

Edge function logs show the shadow detector scans 58 messages but finds 0 triggers across all 24 patterns. The trigger list is keyword-based (`overwhelmed`, `stuck`, `frustrated`, etc.) and only checks for exact substring matches in user messages. Casual/positive conversations will never trigger shadow detection.

**Status**: Working as designed. Not a bug, but the feature effectively never activates for engaged users.

---

### Issue 5: XP Session Cap Reached — Near-Zero XP Awards (LOW)

The XP service logs show: `session_xp: 29.999999999999993/30` and `deltaXP: 1.33e-15`. The user has hit the session XP cap. All subsequent interactions in this session award effectively 0 XP. This is by design (anti-gaming), but worth noting since the user may perceive the system as "stuck."

**Status**: Working as designed.

---

### Issue 6: CORS Headers Missing Client Platform Headers (LOW)

Several edge functions use:
```
'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
```

The Supabase JS SDK now sends additional headers (`x-supabase-client-platform`, `x-supabase-client-platform-version`, etc.). While these don't currently cause failures (browsers are lenient with simple requests), they could cause CORS preflight failures in strict environments.

**Fix**: Update CORS headers in all edge functions to include the full set.

---

## Summary

| Component | Status | Issues |
|---|---|---|
| Azure OpenAI routing | ✅ Healthy | None |
| Companion Oracle | ✅ Healthy | None |
| HACS Intelligent Conversation | ✅ Healthy | None |
| Unified Brain (11 modules) | ✅ Healthy | None |
| Embeddings pipeline | ✅ Healthy | Dead OPENAI_API_KEY guard in v3 |
| Orb Presence System | ✅ Healthy | Excessive logging |
| Shadow Detection | ⚠️ Functional | Never triggers for positive users |
| XP Progression | ✅ Healthy | Session cap reached |
| Conversation Memory | ✅ Healthy | None |
| Blueprint Embeddings v3 | ⚠️ Startup crash risk | OPENAI_API_KEY check |
| CORS headers | ⚠️ Partial | Missing new SDK headers |

## Recommended Fixes (Priority Order)

1. **Fix `process-blueprint-embeddings-v3`** — Remove dead `OPENAI_API_KEY` guard (prevents startup crash)
2. **Clean up FloatingHACSOrb logging** — Remove per-render console dumps
3. **Update CORS headers** — Add full Supabase SDK header set to all edge functions




# Fix Plan: Top 5 Critical Plumbing Issues

## Overview

Five surgical fixes to reconnect broken data pipes. Each fix is independent and can be implemented in sequence within a single session. No architectural rewrites -- only wiring existing components together.

---

## Fix 1: Wire `hermetic_structured_intelligence` Reads into `unified-brain-processor`

**Problem:** `extract-hermetic-intelligence` writes 26 intelligence columns (identity constructs, behavioral triggers, attachment style, etc.) for 9 users. No conversation engine ever reads them. The VFP module in `unified-brain-processor` only reads 3 fields from `user_blueprints` (name, MBTI, HD type).

**Fix:** In `unified-brain-processor`, modify the `processVFP` function (line ~439) to also query `hermetic_structured_intelligence` by `userId` and merge the structured intelligence into the personality context passed to `synthesizeUnifiedResponse`.

**Changes:**
- `supabase/functions/unified-brain-processor/index.ts`:
  - In `processVFP()`, add a second query: `.from('hermetic_structured_intelligence').select('*').eq('user_id', userId).maybeSingle()`
  - Merge key fields (identity_constructs, behavioral_triggers, attachment_style, cognitive_functions) into the returned `personalityContext`
  - In `synthesizeUnifiedResponse()`, expand the `PERSONALITY CONTEXT` section of the system prompt to include hermetic intelligence summary when available

**Data confirmation:** 9 rows exist in `hermetic_structured_intelligence` with 26 columns of deep intelligence data.

---

## Fix 2: Eliminate Dual `hacs_intelligence` Write Race Condition

**Problem:** When `useUnifiedBrain = true`, both `hacs-intelligent-conversation` (line 405-419) AND `unified-brain-processor` (line 221-233) write to `hacs_intelligence` for the same user in the same request. They use different scoring formulas, causing score oscillation.

**Fix:** Remove the `hacs_intelligence` write from `unified-brain-processor` (PHASE 3D, lines 188-244). The caller (`hacs-intelligent-conversation`) is the authoritative writer since it has the full conversation context and quality assessment. `unified-brain-processor` should only return its module results -- the caller decides what to persist.

**Changes:**
- `supabase/functions/unified-brain-processor/index.ts`:
  - Remove or comment out the entire PHASE 3D block (lines 188-244) that updates `hacs_intelligence`
  - Instead, include `mapHermeticToHACS(hermeticResults)` data in the response JSON so the caller can incorporate it
- `supabase/functions/hacs-intelligent-conversation/index.ts`:
  - In the `useUnifiedBrain` branch (line 281-333), read `unifiedData.hermeticModuleImprovements` and merge into the existing `moduleImprovements` object before the single write at line 405

**Result:** One write per request, one scoring formula, no race.

---

## Fix 3: Schedule `hot_memory_cache` Cleanup

**Problem:** 784 of 786 rows are expired. No composite index covers `(user_id, session_id, expires_at)` for filtered lookups. `cleanup_expired_hot_memory()` function exists but is never called. pg_cron is not enabled.

**Fix (3 parts):**

**Part A -- Add composite index (migration):**
```sql
CREATE INDEX CONCURRENTLY idx_hot_memory_active_lookup 
  ON hot_memory_cache (user_id, session_id, expires_at DESC);
```

**Part B -- Enable pg_cron and pg_net, schedule hourly cleanup (migration):**
```sql
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

SELECT cron.schedule(
  'cleanup-expired-hot-memory',
  '0 * * * *',
  $$ SELECT cleanup_expired_hot_memory() $$
);
```

**Part C -- Immediate one-time cleanup (insert tool):**
```sql
SELECT cleanup_expired_hot_memory();
```

**Result:** Table drops from 786 to 2 active rows. Future lookups use index-only scan. Expired rows auto-purge hourly.

---

## Fix 4: Unify `conversation_insights` vs `hacs_module_insights`

**Problem:** Two parallel insight tables with different writers and readers:
- `hacs_module_insights`: 159 rows. Written by `hacs-authentic-insights`. Read by `use-hacs-insights.ts` (frontend).
- `conversation_insights`: 2 rows. Written by `unified-brain-processor`, `companion-oracle-conversation`, `hacs-authentic-insights`. Read by `use-hacs-insights.ts` (frontend) and `pie-scheduling-service.ts`.

The frontend hook `use-hacs-insights.ts` queries BOTH tables separately, but the insight schemas differ, causing inconsistent rendering.

**Fix:** Normalize writers to always write to `conversation_insights` (the canonical table), and have the frontend query only `conversation_insights`. Keep `hacs_module_insights` as a legacy read-only archive.

**Changes:**
- `supabase/functions/hacs-authentic-insights/index.ts`:
  - Change the `hacs_module_insights` insert (line 159) to write to `conversation_insights` instead, mapping fields: `hacs_module` becomes part of `insight_data.module`, `insight_text` becomes `insight_data.insight_text`
  - Keep the existing `conversation_insights` write (line 174) as-is (it already writes correctly)
  - Remove the duplicate write -- one insert per insight, not two
- `src/hooks/use-hacs-insights.ts`:
  - Remove the `hacs_module_insights` query (line 126)
  - Use only `conversation_insights` as the single source of truth
  - Map any legacy `hacs_module_insights` format to the unified format for backward compatibility during transition

**Result:** Single insight table, single query, no divergent data.

---

## Fix 5: Normalize Conversation Storage to `conversation_messages`

**Problem:** `conversation_messages` has 0 rows. All 611 conversations are stored as JSON blobs in `hacs_conversations.conversation_data`. This blocks semantic search, per-message embeddings, and standard conversation retrieval.

**Fix:** After each conversation turn, write individual messages to `conversation_messages` in addition to the existing JSON blob (dual-write phase, no breaking changes).

**Changes:**
- `supabase/functions/hacs-intelligent-conversation/index.ts`:
  - After the `hacs_conversations` update (line 373-379), add two inserts to `conversation_messages`:
    1. User message: `{ conversation_id: conversation.id, client_msg_id: uuid(), user_id: userId, session_id: sessionId, role: 'user', content: userMessage }`
    2. Assistant message: `{ conversation_id: conversation.id, client_msg_id: uuid(), user_id: userId, session_id: sessionId, role: 'assistant', content: response }`
  - The `conversation_messages` table already has the correct schema (id, conversation_id, client_msg_id, user_id, session_id, role, content, status, created_at, updated_at)
- `supabase/functions/companion-oracle-conversation/index.ts`:
  - Apply the same dual-write pattern after each conversation turn

**Result:** `conversation_messages` begins accumulating normalized, queryable messages. JSON blob storage continues unchanged (no regression). Future: semantic search and embeddings can operate on `conversation_messages` directly.

---

## Execution Order

| Step | Fix | Effort | Risk |
|------|-----|--------|------|
| 1 | Fix 3: Hot memory cleanup + index | 15 min | None (additive SQL only) |
| 2 | Fix 2: Remove dual hacs_intelligence write | 20 min | Low (removing code) |
| 3 | Fix 1: Wire hermetic intelligence reads | 25 min | Low (additive read) |
| 4 | Fix 4: Unify insight tables | 30 min | Medium (writer + reader change) |
| 5 | Fix 5: Normalize conversation storage | 25 min | Low (additive dual-write) |

Total estimated: ~2 hours

## Files Modified

- `supabase/functions/unified-brain-processor/index.ts` (Fixes 1, 2)
- `supabase/functions/hacs-intelligent-conversation/index.ts` (Fixes 2, 5)
- `supabase/functions/hacs-authentic-insights/index.ts` (Fix 4)
- `supabase/functions/companion-oracle-conversation/index.ts` (Fix 5)
- `src/hooks/use-hacs-insights.ts` (Fix 4)
- 1 database migration (Fix 3: index + pg_cron)
- 1 data operation (Fix 3: immediate cleanup)


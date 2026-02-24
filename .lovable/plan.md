

# Database Size Emergency Fix (120% of 500 MB Quota)

## Problem
Database is at 559 MB / 500 MB (120%), exceeding the Supabase Free Plan quota. The system risks being restricted from writes.

## Root Cause
Three tables consume 367 MB (66% of total DB) with purgeable data:
- `dream_activity_logs`: 128 MB -- 87,307 of 87,410 rows are older than 7 days (activity telemetry, not critical)
- `user_360_profiles_archive`: 119 MB -- 560 snapshot rows for only 4 users (redundant archive)
- `user_360_profiles`: 120 MB -- 121 rows with bloated JSONB (needs VACUUM after cleanup)
- `memory_metrics`: 6.5 MB -- 39,999 of 40,131 rows older than 7 days (diagnostic telemetry)

## Fix Strategy (Zero Breaking Changes)

### Step 1: Purge stale `dream_activity_logs` (saves ~127 MB)
Delete rows older than 7 days. This is telemetry/analytics data -- no conversation engine, UI component, or business logic reads historical dream activity logs.

```sql
DELETE FROM dream_activity_logs WHERE timestamp < now() - interval '7 days';
```

### Step 2: Purge `user_360_profiles_archive` (saves ~119 MB)
This archive table stores redundant snapshots of `user_360_profiles` for only 4 users. The live `user_360_profiles` table is the source of truth. No edge function or frontend component reads from the archive table.

```sql
TRUNCATE user_360_profiles_archive;
```

### Step 3: Purge old `memory_metrics` (saves ~6 MB)
Diagnostic metrics older than 7 days. No UI or edge function reads historical metrics beyond recent sessions.

```sql
DELETE FROM memory_metrics WHERE created_at < now() - interval '7 days';
```

### Step 4: Purge completed `hermetic_processing_jobs` and `hermetic_sub_jobs` (saves ~25 MB)
Completed and failed processing jobs are one-time pipeline artifacts. The results are already stored in `hermetic_structured_intelligence`.

```sql
DELETE FROM hermetic_sub_jobs WHERE status IN ('completed', 'failed');
DELETE FROM hermetic_processing_jobs WHERE status IN ('completed', 'failed');
```

### Step 5: VACUUM to reclaim disk space
After deleting rows, Postgres marks space as reusable but doesn't return it to the OS. VACUUM FULL reclaims actual disk space.

```sql
VACUUM FULL dream_activity_logs;
VACUUM FULL user_360_profiles_archive;
VACUUM FULL memory_metrics;
VACUUM FULL hermetic_processing_jobs;
VACUUM FULL hermetic_sub_jobs;
VACUUM FULL user_360_profiles;
```

### Step 6: Add retention policies (prevent recurrence)
Create a scheduled cleanup function that runs daily via pg_cron (already enabled from Fix 3):

```sql
CREATE OR REPLACE FUNCTION cleanup_stale_telemetry()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER
SET search_path TO 'public' AS $$
BEGIN
  DELETE FROM dream_activity_logs WHERE timestamp < now() - interval '7 days';
  DELETE FROM memory_metrics WHERE created_at < now() - interval '7 days';
  DELETE FROM hermetic_processing_jobs WHERE status IN ('completed','failed') AND updated_at < now() - interval '3 days';
  DELETE FROM hermetic_sub_jobs WHERE status IN ('completed','failed') AND updated_at < now() - interval '3 days';
  TRUNCATE user_360_profiles_archive;
END;
$$;

SELECT cron.schedule('cleanup-stale-telemetry', '0 3 * * *', $$ SELECT cleanup_stale_telemetry() $$);
```

## Expected Result

| Action | Space Freed |
|--------|-------------|
| dream_activity_logs purge | ~127 MB |
| user_360_profiles_archive purge | ~119 MB |
| hermetic jobs purge | ~25 MB |
| memory_metrics purge | ~6 MB |
| VACUUM reclaim | additional compaction |
| **Total** | **~277 MB freed** |

**Projected DB size after cleanup: ~282 MB (56% of quota)** -- well within safe limits.

## Safety Guarantees
- No edge function, frontend hook, or conversation engine reads from the purged data
- `dream_activity_logs` is write-only telemetry -- no downstream consumer
- `user_360_profiles_archive` is never queried by any code path
- Processing jobs are artifacts; results live in `hermetic_structured_intelligence`
- Daily cron prevents recurrence

## Files Modified
- 1 database migration (cleanup SQL + retention cron job)
- No application code changes required


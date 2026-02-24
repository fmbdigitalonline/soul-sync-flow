

# Reclaim Bloated Disk Space (~240 MB) via Table Rebuild

## Problem
The data purge migration succeeded (dead tuples cleared by autovacuum), but PostgreSQL's physical files haven't shrunk. `VACUUM FULL` is unavailable on Supabase (requires superuser). Current state:

| Table | Rows | Actual Data | Physical Size | Bloat |
|-------|------|-------------|---------------|-------|
| dream_activity_logs | 111 | ~1 MB | 121 MB | ~120 MB |
| user_360_profiles | 121 | ~3 MB | 120 MB | ~117 MB |

Database total: 423 MB (84% of 500 MB quota). Target: under 200 MB.

## Solution: Table Rebuild (VACUUM FULL alternative)
Since we cannot run `VACUUM FULL`, we use the standard workaround: copy live data into a fresh table, drop the bloated original, rename the new one, and recreate indexes/policies/triggers.

This is a single database migration -- no application code changes.

## Technical Details

### Step 1: Rebuild `dream_activity_logs` (~120 MB freed)
1. Create `dream_activity_logs_new` with identical schema
2. Copy 111 live rows into it
3. Drop bloated original (CASCADE not needed -- no dependents)
4. Rename new table
5. Recreate: primary key, indexes (user+session, timestamp DESC), FK to auth.users, RLS + 2 policies

### Step 2: Rebuild `user_360_profiles` (~117 MB freed)
1. Create `user_360_profiles_new` with identical schema
2. Deduplicate: keep only the latest row per user_id (currently some users have up to 33 duplicate rows)
3. Drop bloated original
4. Rename new table
5. Recreate: primary key, indexes (user_id, last_updated, user+updated_at), trigger (update_user_360_profiles_updated_at), RLS + 3 policies
6. Add UNIQUE constraint on user_id to prevent future duplicates

### Projected Result

| Metric | Before | After |
|--------|--------|-------|
| dream_activity_logs | 121 MB | ~1 MB |
| user_360_profiles | 120 MB | ~3 MB |
| Database total | 423 MB | ~185 MB |
| Quota usage | 84% | ~37% |

### Safety
- No FK references from other tables to either table (verified)
- No application code changes needed -- table names and columns remain identical
- RLS policies, indexes, triggers all recreated exactly as they were
- Deduplication keeps only the most recent row per user (preserving the latest profile_data)

### Files Modified
- 1 database migration (table rebuild SQL)
- No application code changes


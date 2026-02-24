
-- ============================================================================
-- DATABASE SIZE EMERGENCY FIX: Free ~277 MB of stale/redundant data
-- ============================================================================

-- Step 1: Purge stale dream_activity_logs (saves ~127 MB)
DELETE FROM dream_activity_logs WHERE timestamp < now() - interval '7 days';

-- Step 2: Purge redundant user_360_profiles_archive (saves ~119 MB)
TRUNCATE user_360_profiles_archive;

-- Step 3: Purge old memory_metrics (saves ~6 MB)
DELETE FROM memory_metrics WHERE created_at < now() - interval '7 days';

-- Step 4: Purge completed/failed hermetic jobs (saves ~25 MB)
DELETE FROM hermetic_sub_jobs WHERE status IN ('completed', 'failed');
DELETE FROM hermetic_processing_jobs WHERE status IN ('completed', 'failed');

-- Step 6: Create retention function to prevent recurrence
CREATE OR REPLACE FUNCTION public.cleanup_stale_telemetry()
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

-- Schedule daily cleanup at 03:00 UTC via pg_cron (already enabled)
SELECT cron.schedule('cleanup-stale-telemetry', '0 3 * * *', $$ SELECT public.cleanup_stale_telemetry() $$);

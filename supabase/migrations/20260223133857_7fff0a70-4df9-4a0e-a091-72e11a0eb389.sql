
-- Fix 3 Part B: Enable pg_cron and schedule hourly cleanup
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

SELECT cron.schedule(
  'cleanup-expired-hot-memory',
  '0 * * * *',
  $$ SELECT cleanup_expired_hot_memory() $$
);

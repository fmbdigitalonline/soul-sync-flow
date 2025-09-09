-- Phase 1: Clean Slate - Mark all stuck processing jobs as failed
UPDATE hermetic_processing_jobs 
SET 
  status = 'failed',
  current_step = 'Job reset due to deployment mismatch - zombie state detected',
  error_message = 'Process was stuck in zombie state after deployment rollback. Reset for fresh start.',
  updated_at = now()
WHERE 
  status IN ('pending', 'processing') 
  AND (
    last_heartbeat IS NULL 
    OR last_heartbeat < now() - INTERVAL '10 minutes'
    OR (created_at < now() - INTERVAL '5 minutes' AND progress_percentage < 50)
  );

-- Clean up any orphaned sub-jobs that might be causing issues
DELETE FROM hermetic_sub_jobs 
WHERE job_id IN (
  SELECT id FROM hermetic_processing_jobs 
  WHERE status = 'failed' 
  AND error_message LIKE '%zombie state%'
);
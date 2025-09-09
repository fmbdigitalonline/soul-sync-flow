-- Phase 1: Mark the specific stuck job as failed
UPDATE hermetic_processing_jobs 
SET 
  status = 'failed',
  current_step = 'Job timed out - marked as failed due to lack of heartbeat',
  error_message = 'Process exceeded maximum duration without heartbeat (auto-cleanup)',
  updated_at = now()
WHERE 
  id = 'd0e5de5e-c481-4bbc-9cce-bed1e6c12545'::uuid
  AND status = 'processing';
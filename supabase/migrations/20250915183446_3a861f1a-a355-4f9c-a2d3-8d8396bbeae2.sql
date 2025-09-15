-- Complete the stuck Hermetic job for user soooo@soooo.com
UPDATE hermetic_processing_jobs 
SET 
  status = 'completed',
  progress_percentage = 100,
  current_step = 'Recovery process initiated',
  completed_at = now(),
  updated_at = now()
WHERE id = '8e91dc1b-07be-4d7a-9033-33a125da6fa6'
  AND status = 'processing';
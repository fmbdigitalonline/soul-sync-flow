-- Reset the specific stuck job and add cleanup mechanisms

-- First, let's reset the stuck job to pending status
UPDATE hermetic_processing_jobs 
SET 
  status = 'pending',
  status_message = 'Job reset - ready for reprocessing',
  progress = 0,
  current_phase = 0,
  updated_at = now()
WHERE id = '6384a174-3a11-42cc-807d-0e021063a91e'
  AND status = 'processing';

-- Add last_heartbeat column for job monitoring
ALTER TABLE hermetic_processing_jobs 
ADD COLUMN IF NOT EXISTS last_heartbeat timestamp with time zone DEFAULT now();

-- Update existing jobs to have last_heartbeat
UPDATE hermetic_processing_jobs 
SET last_heartbeat = updated_at 
WHERE last_heartbeat IS NULL;

-- Create function to cleanup stuck jobs
CREATE OR REPLACE FUNCTION cleanup_stuck_hermetic_jobs()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  stuck_jobs_count integer;
BEGIN
  -- Mark jobs as failed if they've been processing for more than 30 minutes without heartbeat
  UPDATE hermetic_processing_jobs 
  SET 
    status = 'failed',
    status_message = 'Job timed out - no heartbeat detected',
    updated_at = now()
  WHERE 
    status IN ('pending', 'processing') 
    AND (last_heartbeat IS NULL OR last_heartbeat < now() - INTERVAL '30 minutes')
    AND created_at < now() - INTERVAL '30 minutes';
    
  GET DIAGNOSTICS stuck_jobs_count = ROW_COUNT;
  
  RETURN stuck_jobs_count;
END;
$$;

-- Create function to update job heartbeat
CREATE OR REPLACE FUNCTION update_job_heartbeat(job_id_param uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER  
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE hermetic_processing_jobs 
  SET last_heartbeat = now()
  WHERE id = job_id_param;
  
  RETURN FOUND;
END;
$$;

-- Create function to safely restart failed jobs
CREATE OR REPLACE FUNCTION restart_hermetic_job(job_id_param uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Only restart jobs that are failed or completed
  UPDATE hermetic_processing_jobs 
  SET 
    status = 'pending',
    status_message = 'Job restarted',
    progress = 0,
    current_phase = 0,
    last_heartbeat = now(),
    updated_at = now()
  WHERE 
    id = job_id_param 
    AND status IN ('failed', 'completed')
    AND user_id = auth.uid();
    
  RETURN FOUND;
END;
$$;
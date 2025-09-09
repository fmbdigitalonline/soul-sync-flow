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

-- Phase 2: Enhance the cleanup function to be more aggressive
CREATE OR REPLACE FUNCTION public.cleanup_stuck_hermetic_jobs()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  stuck_jobs_count integer;
BEGIN
  -- Mark jobs as failed if they've been processing for more than 15 minutes without heartbeat
  UPDATE hermetic_processing_jobs 
  SET 
    status = 'failed',
    current_step = 'Job timed out - no heartbeat detected',
    error_message = 'Process exceeded maximum duration without heartbeat',
    updated_at = now()
  WHERE 
    status IN ('pending', 'processing') 
    AND (last_heartbeat IS NULL OR last_heartbeat < now() - INTERVAL '15 minutes')
    AND created_at < now() - INTERVAL '15 minutes';
    
  GET DIAGNOSTICS stuck_jobs_count = ROW_COUNT;
  
  RETURN stuck_jobs_count;
END;
$function$

-- Phase 3: Create a function to detect zombie jobs for UI
CREATE OR REPLACE FUNCTION public.detect_zombie_hermetic_jobs(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  zombie_jobs jsonb;
BEGIN
  SELECT jsonb_agg(
    jsonb_build_object(
      'id', id,
      'status', status,
      'last_heartbeat', last_heartbeat,
      'minutes_since_heartbeat', EXTRACT(EPOCH FROM (now() - COALESCE(last_heartbeat, created_at))) / 60,
      'is_zombie', true
    )
  ) INTO zombie_jobs
  FROM hermetic_processing_jobs
  WHERE user_id = p_user_id
    AND status IN ('processing', 'pending')
    AND (last_heartbeat IS NULL OR last_heartbeat < now() - INTERVAL '10 minutes')
    AND created_at < now() - INTERVAL '10 minutes';
    
  RETURN COALESCE(zombie_jobs, '[]'::jsonb);
END;
$function$
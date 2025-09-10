-- Update the cleanup function to accept optional user_id parameter for user-specific cleanup
CREATE OR REPLACE FUNCTION public.cleanup_stuck_hermetic_jobs(p_user_id uuid DEFAULT NULL)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  stuck_jobs_count integer;
BEGIN
  -- Mark jobs as failed if they've been processing for more than 30 minutes without heartbeat
  -- If user_id is provided, only clean up that user's jobs
  UPDATE hermetic_processing_jobs 
  SET 
    status = 'failed',
    current_step = 'Job timed out - no heartbeat detected',
    error_message = 'Process exceeded maximum duration without heartbeat',
    updated_at = now()
  WHERE 
    status IN ('pending', 'processing') 
    AND (last_heartbeat IS NULL OR last_heartbeat < now() - INTERVAL '30 minutes')
    AND created_at < now() - INTERVAL '30 minutes'
    AND (p_user_id IS NULL OR user_id = p_user_id);
    
  GET DIAGNOSTICS stuck_jobs_count = ROW_COUNT;
  
  -- Log the cleanup action for monitoring
  INSERT INTO public.user_activities (user_id, activity_type, activity_data)
  SELECT 
    COALESCE(p_user_id, '00000000-0000-0000-0000-000000000000'::uuid),
    'hermetic_zombie_cleanup',
    jsonb_build_object(
      'cleaned_jobs_count', stuck_jobs_count,
      'cleanup_timestamp', now(),
      'user_specific', p_user_id IS NOT NULL
    );
  
  RETURN stuck_jobs_count;
END;
$function$;
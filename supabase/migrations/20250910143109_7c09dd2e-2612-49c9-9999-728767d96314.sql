-- Step 1: Fix the type mismatch in detect_zombie_hermetic_jobs function
CREATE OR REPLACE FUNCTION public.detect_zombie_hermetic_jobs()
RETURNS TABLE(
  job_id uuid, 
  user_id uuid, 
  status text, 
  progress_percentage REAL,  -- FIXED: Changed from INTEGER to REAL
  current_step text, 
  last_heartbeat timestamp with time zone, 
  created_at timestamp with time zone,
  is_zombie boolean
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    hjp.id as job_id,
    hjp.user_id,
    hjp.status,
    hjp.progress_percentage,  -- Now correctly typed as REAL
    hjp.current_step,
    hjp.last_heartbeat,
    hjp.created_at,
    CASE 
      WHEN hjp.status IN ('processing', 'pending') 
           AND (hjp.last_heartbeat IS NULL OR hjp.last_heartbeat < now() - INTERVAL '5 minutes')
      THEN true
      ELSE false
    END as is_zombie
  FROM hermetic_processing_jobs hjp
  WHERE hjp.status IN ('processing', 'pending', 'failed')
  ORDER BY hjp.created_at DESC;
END;
$function$;

-- Step 2: Force-clean the specific stuck job
UPDATE hermetic_processing_jobs 
SET 
  status = 'failed',
  current_step = 'EMERGENCY CLEANUP: Job was stuck in processing state',
  error_message = 'Job forcefully cleaned up due to stuck processing state - zombie detection was broken',
  updated_at = now()
WHERE id = 'e259ec1c-f00d-438b-b944-74db8abd7247';

-- Step 3: Create emergency cleanup function for fallback
CREATE OR REPLACE FUNCTION public.emergency_cleanup_stuck_jobs(p_user_id uuid DEFAULT NULL::uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  cleaned_jobs_count integer;
BEGIN
  -- Emergency cleanup: Mark ALL stuck jobs as failed for specific user or all users
  UPDATE hermetic_processing_jobs 
  SET 
    status = 'failed',
    current_step = 'EMERGENCY CLEANUP: Job was stuck without progress',
    error_message = 'Emergency cleanup - job was stuck in processing state without heartbeat',
    updated_at = now()
  WHERE 
    status IN ('pending', 'processing') 
    AND (last_heartbeat IS NULL OR last_heartbeat < now() - INTERVAL '5 minutes')
    AND (p_user_id IS NULL OR user_id = p_user_id);
    
  GET DIAGNOSTICS cleaned_jobs_count = ROW_COUNT;
  
  -- Log the emergency cleanup
  INSERT INTO public.user_activities (user_id, activity_type, activity_data)
  SELECT 
    COALESCE(p_user_id, '00000000-0000-0000-0000-000000000000'::uuid),
    'emergency_hermetic_cleanup',
    jsonb_build_object(
      'cleaned_jobs_count', cleaned_jobs_count,
      'cleanup_timestamp', now(),
      'user_specific', p_user_id IS NOT NULL
    );
  
  RETURN cleaned_jobs_count;
END;
$function$;
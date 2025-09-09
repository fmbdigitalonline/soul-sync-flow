-- Phase 2: Create zombie job detection function
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
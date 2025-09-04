-- Fix the get_hermetic_job_status function with better authentication handling
CREATE OR REPLACE FUNCTION public.get_hermetic_job_status(job_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  job_record jsonb;
  current_user_id uuid;
BEGIN
  -- Get the current user ID and log it for debugging
  current_user_id := auth.uid();
  
  -- Log the function call for debugging
  INSERT INTO public.user_activities (user_id, activity_type, activity_data)
  VALUES (
    current_user_id,
    'get_hermetic_job_status_called',
    jsonb_build_object(
      'job_id', job_id,
      'user_id', current_user_id,
      'timestamp', now()
    )
  ) ON CONFLICT DO NOTHING;
  
  -- If no authenticated user, return empty but indicate auth issue
  IF current_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'error', 'authentication_required',
      'message', 'User must be authenticated to access job status'
    );
  END IF;
  
  -- Query the job with proper user filtering
  SELECT to_jsonb(hjp.*) INTO job_record
  FROM hermetic_processing_jobs hjp
  WHERE hjp.id = job_id
    AND hjp.user_id = current_user_id;
  
  -- Return the job record or indicate not found
  IF job_record IS NULL THEN
    RETURN jsonb_build_object(
      'error', 'job_not_found',
      'message', 'Job not found or access denied'
    );
  END IF;
  
  RETURN job_record;
END;
$function$
-- Create function to get hermetic job status (for type compatibility)
CREATE OR REPLACE FUNCTION get_hermetic_job_status(job_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  job_record jsonb;
BEGIN
  SELECT to_jsonb(hjp.*) INTO job_record
  FROM hermetic_processing_jobs hjp
  WHERE hjp.id = job_id
    AND hjp.user_id = auth.uid();
  
  RETURN COALESCE(job_record, '{}'::jsonb);
END;
$$;
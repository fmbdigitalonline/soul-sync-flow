-- Drop the duplicate/conflicting detect_zombie_hermetic_jobs function
DROP FUNCTION IF EXISTS detect_zombie_hermetic_jobs(uuid);
DROP FUNCTION IF EXISTS detect_zombie_hermetic_jobs();

-- Recreate the correct version that matches the table schema
CREATE OR REPLACE FUNCTION detect_zombie_hermetic_jobs(p_user_id uuid DEFAULT NULL)
RETURNS TABLE(
  job_id uuid,
  user_id uuid,
  status text,
  last_heartbeat timestamp with time zone,
  created_at timestamp with time zone,
  progress_percentage real,
  current_step text,
  is_zombie boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    hjp.id as job_id,
    hjp.user_id,
    hjp.status,
    hjp.last_heartbeat,
    hjp.created_at,
    hjp.progress_percentage,
    hjp.current_step,
    CASE 
      WHEN hjp.status IN ('processing', 'pending') 
           AND (hjp.last_heartbeat IS NULL OR hjp.last_heartbeat < now() - INTERVAL '10 minutes')
      THEN true
      ELSE false
    END as is_zombie
  FROM hermetic_processing_jobs hjp
  WHERE 
    hjp.status IN ('processing', 'pending')
    AND (p_user_id IS NULL OR hjp.user_id = p_user_id)
    AND (hjp.last_heartbeat IS NULL OR hjp.last_heartbeat < now() - INTERVAL '10 minutes')
  ORDER BY hjp.created_at DESC;
END;
$$;
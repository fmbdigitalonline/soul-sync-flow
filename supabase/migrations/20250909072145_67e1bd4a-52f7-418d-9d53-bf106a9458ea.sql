-- Phase 2: Fix schema alignment issues and add monitoring enhancements

-- First, ensure the correct unique constraint exists on hermetic_sub_jobs
DO $$ 
BEGIN
    -- Drop old constraint if it exists (likely with wrong column name)
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
               WHERE constraint_name = 'hermetic_sub_jobs_job_id_agent_type_key' 
               AND table_name = 'hermetic_sub_jobs') THEN
        ALTER TABLE hermetic_sub_jobs DROP CONSTRAINT hermetic_sub_jobs_job_id_agent_type_key;
    END IF;
    
    -- Add correct unique constraint
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'hermetic_sub_jobs_job_id_agent_name_key' 
                   AND table_name = 'hermetic_sub_jobs') THEN
        ALTER TABLE hermetic_sub_jobs ADD CONSTRAINT hermetic_sub_jobs_job_id_agent_name_key 
        UNIQUE (job_id, agent_name);
    END IF;
END $$;

-- Add heartbeat validation function to detect zombie jobs
CREATE OR REPLACE FUNCTION public.validate_job_heartbeat_with_content()
RETURNS TABLE(
  job_id uuid,
  status text,
  last_heartbeat timestamp with time zone,
  sub_job_count bigint,
  total_content_length bigint,
  is_zombie boolean
) 
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    hjp.id as job_id,
    hjp.status,
    hjp.last_heartbeat,
    COALESCE(sj_count.count, 0) as sub_job_count,
    COALESCE(sj_content.total_length, 0) as total_content_length,
    CASE 
      WHEN hjp.status IN ('processing', 'pending') 
           AND (hjp.last_heartbeat IS NULL OR hjp.last_heartbeat < now() - INTERVAL '5 minutes')
           AND COALESCE(sj_count.count, 0) = 0
           AND COALESCE(sj_content.total_length, 0) = 0
      THEN true
      ELSE false
    END as is_zombie
  FROM hermetic_processing_jobs hjp
  LEFT JOIN (
    SELECT job_id, COUNT(*) as count 
    FROM hermetic_sub_jobs 
    WHERE status = 'completed'
    GROUP BY job_id
  ) sj_count ON hjp.id = sj_count.job_id
  LEFT JOIN (
    SELECT job_id, SUM(LENGTH(COALESCE(content, ''))) as total_length
    FROM hermetic_sub_jobs
    WHERE status = 'completed'
    GROUP BY job_id  
  ) sj_content ON hjp.id = sj_content.job_id
  WHERE hjp.status IN ('processing', 'pending', 'failed')
  ORDER BY hjp.created_at DESC;
$$;
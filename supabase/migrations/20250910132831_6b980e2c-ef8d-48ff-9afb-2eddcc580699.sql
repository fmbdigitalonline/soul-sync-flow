-- CRITICAL: Force cleanup of stuck job and enhance zombie detection
-- Fix for user 3a06c637-58fd-43c1-868f-bec396bb1509's stuck job

-- First, force cleanup the specific stuck job
UPDATE hermetic_processing_jobs 
SET 
  status = 'failed',
  error_message = 'Job was stuck during synthesis phase - token limit issue resolved',
  current_step = 'Failed: Stuck during synthesis (now fixed)',
  updated_at = now()
WHERE 
  id = '0b0395aa-b7c0-4137-af1f-6bd19a8463df'
  AND status = 'processing'
  AND user_id = '3a06c637-58fd-43c1-868f-bec396bb1509';

-- Enhance zombie detection to catch synthesis failures
CREATE OR REPLACE FUNCTION detect_zombie_hermetic_jobs(p_user_id UUID DEFAULT NULL)
RETURNS TABLE(
  job_id UUID,
  user_id UUID,
  status TEXT,
  current_stage TEXT,
  progress_percentage INTEGER,
  last_heartbeat TIMESTAMPTZ,
  minutes_since_heartbeat INTEGER,
  current_step TEXT,
  is_synthesis_stuck BOOLEAN
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    hpj.id as job_id,
    hpj.user_id,
    hpj.status,
    hpj.current_stage,
    hpj.progress_percentage,
    hpj.last_heartbeat,
    EXTRACT(EPOCH FROM (now() - COALESCE(hpj.last_heartbeat, hpj.updated_at))) / 60 as minutes_since_heartbeat,
    hpj.current_step,
    (hpj.current_stage = 'synthesis_integration' 
     AND EXTRACT(EPOCH FROM (now() - COALESCE(hpj.last_heartbeat, hpj.updated_at))) > 1800) as is_synthesis_stuck
  FROM hermetic_processing_jobs hpj
  WHERE 
    hpj.status IN ('processing', 'pending') 
    AND (p_user_id IS NULL OR hpj.user_id = p_user_id)
    AND (
      -- Original zombie detection (15+ min without heartbeat)
      EXTRACT(EPOCH FROM (now() - COALESCE(hpj.last_heartbeat, hpj.updated_at))) > 900
      OR 
      -- Enhanced: Synthesis phase stuck for 30+ min
      (hpj.current_stage = 'synthesis_integration' 
       AND EXTRACT(EPOCH FROM (now() - COALESCE(hpj.last_heartbeat, hpj.updated_at))) > 1800)
      OR
      -- Enhanced: Jobs pending for over 60 minutes
      (hpj.status = 'pending' 
       AND EXTRACT(EPOCH FROM (now() - hpj.created_at)) > 3600)
    )
  ORDER BY hpj.last_heartbeat ASC NULLS FIRST;
END;
$$;

-- Update the cleanup function to handle synthesis failures
CREATE OR REPLACE FUNCTION cleanup_stuck_hermetic_jobs(p_user_id UUID DEFAULT NULL)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  cleanup_count INTEGER := 0;
BEGIN
  -- Enhanced cleanup: Mark stuck jobs as failed with specific error messages
  UPDATE hermetic_processing_jobs 
  SET 
    status = 'failed',
    error_message = CASE 
      WHEN current_stage = 'synthesis_integration' THEN 'Synthesis phase timeout - likely token limit issue (now resolved)'
      WHEN status = 'pending' THEN 'Job stuck in pending state - processing never started'
      ELSE 'Job timeout - no heartbeat for over 15 minutes'
    END,
    current_step = CASE
      WHEN current_stage = 'synthesis_integration' THEN 'Failed: Synthesis timeout (token limits fixed)'
      WHEN status = 'pending' THEN 'Failed: Processing never started'
      ELSE 'Failed: Processing timeout'
    END,
    updated_at = now()
  WHERE 
    status IN ('processing', 'pending') 
    AND (p_user_id IS NULL OR user_id = p_user_id)
    AND (
      -- Jobs without heartbeat for 15+ minutes
      EXTRACT(EPOCH FROM (now() - COALESCE(last_heartbeat, updated_at))) > 900
      OR 
      -- Jobs stuck in synthesis for 30+ minutes 
      (current_stage = 'synthesis_integration' 
       AND EXTRACT(EPOCH FROM (now() - COALESCE(last_heartbeat, updated_at))) > 1800)
      OR
      -- Jobs pending for over 60 minutes
      (status = 'pending' 
       AND EXTRACT(EPOCH FROM (now() - created_at)) > 3600)
    );

  GET DIAGNOSTICS cleanup_count = ROW_COUNT;
  
  RETURN cleanup_count;
END;
$$;
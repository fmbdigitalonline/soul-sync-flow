-- Create generation_jobs table with strict constraints for job locking
CREATE TABLE public.generation_jobs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  job_type text NOT NULL, -- 'hermetic_report', 'intelligence_analysis', etc.
  status text NOT NULL DEFAULT 'pending', -- 'pending', 'running', 'completed', 'failed', 'cancelled'
  job_data jsonb NOT NULL DEFAULT '{}', -- Store job configuration and parameters
  progress jsonb NOT NULL DEFAULT '{}', -- Store real-time progress information
  result jsonb, -- Store final result when completed
  error_message text, -- Store error details if job failed
  started_at timestamp with time zone,
  completed_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  -- Automatic timeout mechanism (2 hours for hermetic reports)
  expires_at timestamp with time zone NOT NULL DEFAULT (now() + INTERVAL '2 hours')
);

-- CRITICAL: Unique constraint prevents duplicate active jobs (distributed mutex)
CREATE UNIQUE INDEX idx_generation_jobs_user_type_active 
ON public.generation_jobs (user_id, job_type) 
WHERE status IN ('pending', 'running');

-- Enable Row Level Security
ALTER TABLE public.generation_jobs ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only manage their own jobs
CREATE POLICY "Users can manage their own generation jobs" 
ON public.generation_jobs 
FOR ALL 
USING (auth.uid() = user_id);

-- Performance indexes
CREATE INDEX idx_generation_jobs_expires_at ON public.generation_jobs (expires_at);
CREATE INDEX idx_generation_jobs_status ON public.generation_jobs (status);
CREATE INDEX idx_generation_jobs_user_status ON public.generation_jobs (user_id, status);

-- Auto-update timestamp function
CREATE OR REPLACE FUNCTION update_generation_jobs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for automatic timestamp updates
CREATE TRIGGER update_generation_jobs_updated_at
BEFORE UPDATE ON public.generation_jobs
FOR EACH ROW
EXECUTE FUNCTION update_generation_jobs_updated_at();

-- Cleanup function for expired/stale jobs (prevents orphaned locks)
CREATE OR REPLACE FUNCTION cleanup_expired_generation_jobs()
RETURNS void AS $$
BEGIN
  UPDATE public.generation_jobs 
  SET status = 'failed', 
      error_message = 'Job expired due to timeout - no activity detected',
      completed_at = now(),
      updated_at = now()
  WHERE status IN ('pending', 'running') 
    AND expires_at < now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to safely create a new job (atomic job locking)
CREATE OR REPLACE FUNCTION create_generation_job(
  p_user_id uuid,
  p_job_type text,
  p_job_data jsonb DEFAULT '{}',
  p_timeout_hours integer DEFAULT 2
)
RETURNS uuid AS $$
DECLARE
  new_job_id uuid;
BEGIN
  -- Attempt to insert new job (will fail if duplicate active job exists)
  INSERT INTO public.generation_jobs (
    user_id,
    job_type,
    job_data,
    expires_at
  ) VALUES (
    p_user_id,
    p_job_type,
    p_job_data,
    now() + (p_timeout_hours * INTERVAL '1 hour')
  )
  RETURNING id INTO new_job_id;
  
  RETURN new_job_id;
EXCEPTION
  WHEN unique_violation THEN
    -- Job already exists for this user and type
    RAISE EXCEPTION 'Generation job already in progress for user % and type %', p_user_id, p_job_type;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update job status safely
CREATE OR REPLACE FUNCTION update_job_status(
  p_job_id uuid,
  p_status text,
  p_progress jsonb DEFAULT NULL,
  p_error_message text DEFAULT NULL
)
RETURNS boolean AS $$
DECLARE
  job_exists boolean;
BEGIN
  -- Update job with new status and optional progress/error
  UPDATE public.generation_jobs 
  SET 
    status = p_status,
    progress = COALESCE(p_progress, progress),
    error_message = p_error_message,
    started_at = CASE WHEN p_status = 'running' AND started_at IS NULL THEN now() ELSE started_at END,
    completed_at = CASE WHEN p_status IN ('completed', 'failed', 'cancelled') THEN now() ELSE completed_at END,
    updated_at = now()
  WHERE id = p_job_id
    AND user_id = auth.uid() -- Security: only owner can update
  RETURNING true INTO job_exists;
  
  RETURN COALESCE(job_exists, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
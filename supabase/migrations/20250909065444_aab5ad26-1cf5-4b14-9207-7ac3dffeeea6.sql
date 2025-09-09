-- Phase 1: Fix hermetic_processing_jobs table - add missing progress_data column
ALTER TABLE public.hermetic_processing_jobs 
ADD COLUMN IF NOT EXISTS progress_data JSONB DEFAULT '{}'::jsonb;

-- Phase 1: Fix hermetic_sub_jobs table structure to match code expectations
-- Drop existing table if it exists to recreate with correct structure
DROP TABLE IF EXISTS public.hermetic_sub_jobs;

-- Create hermetic_sub_jobs table with correct schema
CREATE TABLE public.hermetic_sub_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL, -- Changed from parent_job_id to job_id for consistency
  user_id UUID NOT NULL, -- Added user_id column
  agent_name TEXT NOT NULL,
  stage TEXT NOT NULL, -- Added stage column
  content TEXT, -- Added content column
  word_count INTEGER DEFAULT 0, -- Added word_count column
  status TEXT DEFAULT 'pending',
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on hermetic_sub_jobs
ALTER TABLE public.hermetic_sub_jobs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for hermetic_sub_jobs
CREATE POLICY "Users can view their own hermetic sub jobs"
ON public.hermetic_sub_jobs
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own hermetic sub jobs"
ON public.hermetic_sub_jobs
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own hermetic sub jobs"
ON public.hermetic_sub_jobs
FOR UPDATE
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_hermetic_sub_jobs_updated_at
  BEFORE UPDATE ON public.hermetic_sub_jobs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_hermetic_sub_jobs_job_id ON public.hermetic_sub_jobs(job_id);
CREATE INDEX idx_hermetic_sub_jobs_user_id ON public.hermetic_sub_jobs(user_id);
CREATE INDEX idx_hermetic_sub_jobs_status ON public.hermetic_sub_jobs(status);
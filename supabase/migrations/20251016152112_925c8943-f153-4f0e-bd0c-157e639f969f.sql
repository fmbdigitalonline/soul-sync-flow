-- Create embedding processing jobs table for async background processing
CREATE TABLE IF NOT EXISTS public.embedding_processing_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'processing', 'completed', 'failed')) DEFAULT 'pending',
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  current_step TEXT,
  total_chunks INTEGER DEFAULT 0,
  processed_chunks INTEGER DEFAULT 0,
  error_message TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.embedding_processing_jobs ENABLE ROW LEVEL SECURITY;

-- Users can view their own jobs
CREATE POLICY "Users can view own embedding jobs"
  ON public.embedding_processing_jobs
  FOR SELECT
  USING (auth.uid() = user_id);

-- Service role can manage all jobs
CREATE POLICY "Service role can manage embedding jobs"
  ON public.embedding_processing_jobs
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Trigger to update updated_at
CREATE TRIGGER update_embedding_jobs_updated_at
  BEFORE UPDATE ON public.embedding_processing_jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Index for efficient lookups
CREATE INDEX idx_embedding_jobs_user_status ON public.embedding_processing_jobs(user_id, status);
CREATE INDEX idx_embedding_jobs_created_at ON public.embedding_processing_jobs(created_at DESC);
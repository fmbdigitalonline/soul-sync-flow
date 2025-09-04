-- Create hermetic processing jobs table for progress tracking and resume capabilities
CREATE TABLE public.hermetic_processing_jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  job_type TEXT NOT NULL DEFAULT 'hermetic_report',
  status TEXT NOT NULL DEFAULT 'pending', -- pending, processing, completed, failed
  current_phase INTEGER NOT NULL DEFAULT 1, -- 1=System Integration, 2=Hermetic Laws, 3=Hermetic Gates, 4=Synthesis
  total_phases INTEGER NOT NULL DEFAULT 4,
  progress_percentage REAL NOT NULL DEFAULT 0,
  current_step TEXT,
  completed_steps JSONB NOT NULL DEFAULT '[]',
  result_data JSONB,
  error_message TEXT,
  memory_usage_mb REAL,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  last_heartbeat TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.hermetic_processing_jobs ENABLE ROW LEVEL SECURITY;

-- Create policies for hermetic processing jobs
CREATE POLICY "Users can view their own processing jobs" 
ON public.hermetic_processing_jobs 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own processing jobs" 
ON public.hermetic_processing_jobs 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own processing jobs" 
ON public.hermetic_processing_jobs 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create index for efficient querying
CREATE INDEX idx_hermetic_processing_jobs_user_status ON public.hermetic_processing_jobs(user_id, status);
CREATE INDEX idx_hermetic_processing_jobs_heartbeat ON public.hermetic_processing_jobs(last_heartbeat);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_hermetic_jobs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_hermetic_processing_jobs_updated_at
BEFORE UPDATE ON public.hermetic_processing_jobs
FOR EACH ROW
EXECUTE FUNCTION public.update_hermetic_jobs_updated_at();
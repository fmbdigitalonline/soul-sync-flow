-- Create table for storing assistance responses per instruction
CREATE TABLE public.task_assistance_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  task_id TEXT NOT NULL,
  instruction_id TEXT NOT NULL,
  response_id TEXT NOT NULL UNIQUE,
  assistance_type TEXT NOT NULL CHECK (assistance_type IN ('stuck', 'need_details', 'how_to', 'examples')),
  help_type TEXT CHECK (help_type IN ('concrete_steps', 'examples', 'tools_needed', 'time_breakdown')),
  content TEXT NOT NULL,
  actionable_steps JSONB DEFAULT '[]'::jsonb,
  tools_needed JSONB DEFAULT '[]'::jsonb,
  time_estimate TEXT,
  success_criteria JSONB DEFAULT '[]'::jsonb,
  request_context JSONB DEFAULT '{}'::jsonb,
  is_follow_up BOOLEAN NOT NULL DEFAULT false,
  follow_up_depth INTEGER DEFAULT 0,
  previous_help_context TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create composite index for fast queries
CREATE INDEX idx_task_assistance_responses_user_task_instruction 
ON public.task_assistance_responses(user_id, task_id, instruction_id);

-- Create index on user_id for user-specific queries
CREATE INDEX idx_task_assistance_responses_user_id 
ON public.task_assistance_responses(user_id);

-- Enable RLS
ALTER TABLE public.task_assistance_responses ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view their own assistance responses
CREATE POLICY "Users can view their own assistance responses"
ON public.task_assistance_responses
FOR SELECT
USING (auth.uid() = user_id);

-- RLS Policy: Users can insert their own assistance responses
CREATE POLICY "Users can insert their own assistance responses"
ON public.task_assistance_responses
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can update their own assistance responses
CREATE POLICY "Users can update their own assistance responses"
ON public.task_assistance_responses
FOR UPDATE
USING (auth.uid() = user_id);

-- RLS Policy: Users can delete their own assistance responses
CREATE POLICY "Users can delete their own assistance responses"
ON public.task_assistance_responses
FOR DELETE
USING (auth.uid() = user_id);

-- Create table for tracking step completion within help panels
CREATE TABLE public.assistance_step_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assistance_response_id UUID NOT NULL REFERENCES public.task_assistance_responses(id) ON DELETE CASCADE,
  step_index INTEGER NOT NULL,
  step_content TEXT NOT NULL,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  uncompleted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create composite unique index to prevent duplicates
CREATE UNIQUE INDEX idx_assistance_step_progress_unique 
ON public.assistance_step_progress(user_id, assistance_response_id, step_index);

-- Create index on assistance_response_id for fast lookups
CREATE INDEX idx_assistance_step_progress_response_id 
ON public.assistance_step_progress(assistance_response_id);

-- Enable RLS
ALTER TABLE public.assistance_step_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view their own step progress
CREATE POLICY "Users can view their own step progress"
ON public.assistance_step_progress
FOR SELECT
USING (auth.uid() = user_id);

-- RLS Policy: Users can insert their own step progress
CREATE POLICY "Users can insert their own step progress"
ON public.assistance_step_progress
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can update their own step progress
CREATE POLICY "Users can update their own step progress"
ON public.assistance_step_progress
FOR UPDATE
USING (auth.uid() = user_id);

-- RLS Policy: Users can delete their own step progress
CREATE POLICY "Users can delete their own step progress"
ON public.assistance_step_progress
FOR DELETE
USING (auth.uid() = user_id);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_assistance_responses_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_task_assistance_responses_updated_at
BEFORE UPDATE ON public.task_assistance_responses
FOR EACH ROW
EXECUTE FUNCTION public.update_assistance_responses_updated_at();

CREATE TRIGGER update_assistance_step_progress_updated_at
BEFORE UPDATE ON public.assistance_step_progress
FOR EACH ROW
EXECUTE FUNCTION public.update_assistance_responses_updated_at();
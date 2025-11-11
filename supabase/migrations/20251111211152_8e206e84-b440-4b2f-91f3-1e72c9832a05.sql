-- Drop the partially created table if it exists
DROP TABLE IF EXISTS public.task_assistance_responses CASCADE;

-- Create task_assistance_responses table with text IDs (not foreign keys)
CREATE TABLE public.task_assistance_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  goal_id TEXT NOT NULL,
  task_id TEXT NOT NULL,
  instruction_id TEXT NOT NULL,
  request_id TEXT NOT NULL,
  assistance_type TEXT NOT NULL DEFAULT 'how_to',
  help_type TEXT NOT NULL,
  content TEXT NOT NULL,
  actionable_steps TEXT[] NOT NULL DEFAULT '{}',
  tools_needed TEXT[] NOT NULL DEFAULT '{}',
  time_estimate TEXT,
  success_criteria TEXT[] NOT NULL DEFAULT '{}',
  is_follow_up BOOLEAN NOT NULL DEFAULT false,
  follow_up_depth INTEGER,
  previous_help_context TEXT,
  title TEXT,
  request_context JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.task_assistance_responses ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own assistance responses"
  ON public.task_assistance_responses
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own assistance responses"
  ON public.task_assistance_responses
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own assistance responses"
  ON public.task_assistance_responses
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own assistance responses"
  ON public.task_assistance_responses
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_task_assistance_responses_user_id ON public.task_assistance_responses(user_id);
CREATE INDEX idx_task_assistance_responses_goal_task ON public.task_assistance_responses(user_id, goal_id, task_id);
CREATE INDEX idx_task_assistance_responses_instruction ON public.task_assistance_responses(user_id, goal_id, task_id, instruction_id);

-- Create trigger for updated_at
CREATE TRIGGER update_task_assistance_responses_updated_at
  BEFORE UPDATE ON public.task_assistance_responses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_assistance_responses_updated_at();
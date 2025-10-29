-- Phase 1: Create persistent storage for working instructions
-- This allows users to access instructions anytime, even after task completion

CREATE TABLE IF NOT EXISTS public.task_working_instructions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  task_id TEXT NOT NULL,
  instruction_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  time_estimate TEXT,
  tools_needed JSONB DEFAULT '[]'::jsonb,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, task_id, instruction_id)
);

-- Enable Row Level Security
ALTER TABLE public.task_working_instructions ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own instructions
CREATE POLICY "Users can view their own working instructions"
  ON public.task_working_instructions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own working instructions"
  ON public.task_working_instructions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own working instructions"
  ON public.task_working_instructions
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own working instructions"
  ON public.task_working_instructions
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create index for fast lookups by user and task
CREATE INDEX idx_task_working_instructions_user_task 
  ON public.task_working_instructions(user_id, task_id);

-- Create index for ordering
CREATE INDEX idx_task_working_instructions_order 
  ON public.task_working_instructions(user_id, task_id, order_index);

-- Trigger to update updated_at timestamp
CREATE TRIGGER update_task_working_instructions_updated_at
  BEFORE UPDATE ON public.task_working_instructions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
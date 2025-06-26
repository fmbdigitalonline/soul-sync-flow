
-- Create growth_programs table
CREATE TABLE public.growth_programs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  program_type TEXT NOT NULL,
  domain TEXT NOT NULL,
  current_week INTEGER NOT NULL DEFAULT 1,
  total_weeks INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expected_completion TIMESTAMP WITH TIME ZONE NOT NULL,
  actual_completion TIMESTAMP WITH TIME ZONE,
  blueprint_params JSONB NOT NULL DEFAULT '{}',
  progress_metrics JSONB NOT NULL DEFAULT '{}',
  session_schedule JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create growth_sessions table for session tracking
CREATE TABLE public.growth_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  program_id UUID NOT NULL REFERENCES public.growth_programs(id) ON DELETE CASCADE,
  week_number INTEGER NOT NULL,
  session_number INTEGER NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  session_type TEXT NOT NULL,
  session_data JSONB NOT NULL DEFAULT '{}',
  outcomes JSONB NOT NULL DEFAULT '[]'
);

-- Enable RLS
ALTER TABLE public.growth_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.growth_sessions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for growth_programs
CREATE POLICY "Users can view their own growth programs" 
  ON public.growth_programs 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own growth programs" 
  ON public.growth_programs 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own growth programs" 
  ON public.growth_programs 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own growth programs" 
  ON public.growth_programs 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create RLS policies for growth_sessions
CREATE POLICY "Users can view their own growth sessions" 
  ON public.growth_sessions 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.growth_programs 
    WHERE id = program_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can create their own growth sessions" 
  ON public.growth_sessions 
  FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.growth_programs 
    WHERE id = program_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can update their own growth sessions" 
  ON public.growth_sessions 
  FOR UPDATE 
  USING (EXISTS (
    SELECT 1 FROM public.growth_programs 
    WHERE id = program_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can delete their own growth sessions" 
  ON public.growth_sessions 
  FOR DELETE 
  USING (EXISTS (
    SELECT 1 FROM public.growth_programs 
    WHERE id = program_id AND user_id = auth.uid()
  ));

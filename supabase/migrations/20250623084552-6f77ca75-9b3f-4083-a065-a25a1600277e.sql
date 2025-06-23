
-- Create user_session_memory table for persistent memory across sessions
CREATE TABLE public.user_session_memory (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  session_id TEXT NOT NULL,
  memory_type TEXT NOT NULL, -- 'interaction', 'mood', 'belief_shift', 'journal_entry', 'micro_action'
  memory_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  context_summary TEXT,
  importance_score INTEGER DEFAULT 5, -- 1-10 scale for memory importance
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_referenced TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create session_feedback table for user ratings and feedback
CREATE TABLE public.session_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  session_id TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  feedback_text TEXT,
  session_summary TEXT,
  improvement_suggestions JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create micro_action_reminders table for follow-up reminders
CREATE TABLE public.micro_action_reminders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  session_id TEXT NOT NULL,
  action_title TEXT NOT NULL,
  action_description TEXT,
  reminder_type TEXT NOT NULL DEFAULT 'in_app', -- 'in_app', 'email', 'calendar'
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'sent', 'completed', 'snoozed', 'cancelled'
  snooze_until TIMESTAMP WITH TIME ZONE,
  completion_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_life_context table for long-term personalization
CREATE TABLE public.user_life_context (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  context_category TEXT NOT NULL, -- 'career', 'relationships', 'health', 'growth', 'creative'
  current_focus TEXT,
  recent_progress JSONB DEFAULT '[]'::jsonb,
  ongoing_challenges JSONB DEFAULT '[]'::jsonb,
  celebration_moments JSONB DEFAULT '[]'::jsonb,
  next_steps JSONB DEFAULT '[]'::jsonb,
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add indexes for performance
CREATE INDEX idx_user_session_memory_user_id ON public.user_session_memory(user_id);
CREATE INDEX idx_user_session_memory_importance ON public.user_session_memory(user_id, importance_score DESC);
CREATE INDEX idx_user_session_memory_recent ON public.user_session_memory(user_id, last_referenced DESC);
CREATE INDEX idx_session_feedback_user_id ON public.session_feedback(user_id);
CREATE INDEX idx_micro_action_reminders_user_scheduled ON public.micro_action_reminders(user_id, scheduled_for);
CREATE INDEX idx_micro_action_reminders_status ON public.micro_action_reminders(status, scheduled_for);
CREATE INDEX idx_user_life_context_user_id ON public.user_life_context(user_id);

-- Enable Row Level Security
ALTER TABLE public.user_session_memory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.micro_action_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_life_context ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_session_memory
CREATE POLICY "Users can view their own session memory" 
  ON public.user_session_memory 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own session memory" 
  ON public.user_session_memory 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own session memory" 
  ON public.user_session_memory 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- RLS Policies for session_feedback
CREATE POLICY "Users can view their own feedback" 
  ON public.session_feedback 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own feedback" 
  ON public.session_feedback 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for micro_action_reminders
CREATE POLICY "Users can view their own reminders" 
  ON public.micro_action_reminders 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own reminders" 
  ON public.micro_action_reminders 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reminders" 
  ON public.micro_action_reminders 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- RLS Policies for user_life_context
CREATE POLICY "Users can view their own life context" 
  ON public.user_life_context 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own life context" 
  ON public.user_life_context 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own life context" 
  ON public.user_life_context 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Function to clean up old low-importance memories (keep database from growing too large)
CREATE OR REPLACE FUNCTION public.cleanup_old_memories()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Delete memories older than 6 months with importance < 5
  DELETE FROM public.user_session_memory 
  WHERE created_at < NOW() - INTERVAL '6 months' 
    AND importance_score < 5;
    
  -- Delete memories older than 1 year with importance < 7
  DELETE FROM public.user_session_memory 
  WHERE created_at < NOW() - INTERVAL '1 year' 
    AND importance_score < 7;
END;
$$;


-- Phase 1: Database Setup for Dream Activity Logging

-- Create dream_activity_logs table to capture every interaction
CREATE TABLE public.dream_activity_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  session_id TEXT NOT NULL,
  activity_type TEXT NOT NULL,
  activity_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  page_url TEXT,
  user_agent TEXT,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  correlation_id TEXT,
  error_info JSONB
);

-- Create task_coach_session_logs table for coaching session details  
CREATE TABLE public.task_coach_session_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  session_id TEXT NOT NULL,
  task_id TEXT NOT NULL,
  task_title TEXT NOT NULL,
  session_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  session_end TIMESTAMP WITH TIME ZONE,
  messages_count INTEGER DEFAULT 0,
  actions_executed INTEGER DEFAULT 0,
  session_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  performance_metrics JSONB DEFAULT '{}'::jsonb
);

-- Create coach_action_logs table to track all automated actions
CREATE TABLE public.coach_action_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  session_id TEXT NOT NULL,
  action_type TEXT NOT NULL,
  action_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  execution_result JSONB NOT NULL DEFAULT '{}'::jsonb,
  execution_time_ms INTEGER,
  triggered_by TEXT, -- 'user_action', 'auto_execution', 'coach_response'
  duplicate_detection JSONB DEFAULT '{}'::jsonb,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  correlation_id TEXT
);

-- Add RLS policies for user data security
ALTER TABLE public.dream_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_coach_session_logs ENABLE ROW LEVEL SECURITY;  
ALTER TABLE public.coach_action_logs ENABLE ROW LEVEL SECURITY;

-- Dream activity logs policies
CREATE POLICY "Users can view their own dream activity logs" 
  ON public.dream_activity_logs 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own dream activity logs" 
  ON public.dream_activity_logs 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Task coach session logs policies
CREATE POLICY "Users can view their own task coach session logs" 
  ON public.task_coach_session_logs 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own task coach session logs" 
  ON public.task_coach_session_logs 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own task coach session logs" 
  ON public.task_coach_session_logs 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Coach action logs policies  
CREATE POLICY "Users can view their own coach action logs" 
  ON public.coach_action_logs 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own coach action logs" 
  ON public.coach_action_logs 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_dream_activity_logs_user_session ON public.dream_activity_logs(user_id, session_id);
CREATE INDEX idx_dream_activity_logs_timestamp ON public.dream_activity_logs(timestamp DESC);
CREATE INDEX idx_task_coach_session_logs_user ON public.task_coach_session_logs(user_id);
CREATE INDEX idx_coach_action_logs_user_session ON public.coach_action_logs(user_id, session_id);
CREATE INDEX idx_coach_action_logs_timestamp ON public.coach_action_logs(timestamp DESC);

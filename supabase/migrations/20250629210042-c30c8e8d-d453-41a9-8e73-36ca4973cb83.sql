
-- Create ACS configuration table for hot-reloadable config
CREATE TABLE public.acs_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create ACS metrics table for monitoring and analytics
CREATE TABLE public.acs_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  state_transition TEXT NOT NULL,
  delta_latency REAL NOT NULL DEFAULT 0,
  user_repair_rate REAL NOT NULL DEFAULT 0,
  conversation_velocity REAL NOT NULL DEFAULT 0,
  sentiment_trend REAL NOT NULL DEFAULT 0,
  trigger TEXT NOT NULL,
  confidence REAL NOT NULL DEFAULT 0,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS) to ensure users can only see their own data
ALTER TABLE public.acs_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.acs_metrics ENABLE ROW LEVEL SECURITY;

-- Create policies for acs_config
CREATE POLICY "Users can view their own ACS config" 
  ON public.acs_config 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own ACS config" 
  ON public.acs_config 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ACS config" 
  ON public.acs_config 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own ACS config" 
  ON public.acs_config 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create policies for acs_metrics
CREATE POLICY "Users can view their own ACS metrics" 
  ON public.acs_metrics 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own ACS metrics" 
  ON public.acs_metrics 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create indices for performance
CREATE INDEX idx_acs_config_user_active ON public.acs_config(user_id, is_active);
CREATE INDEX idx_acs_metrics_user_timestamp ON public.acs_metrics(user_id, timestamp);

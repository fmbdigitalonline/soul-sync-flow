
-- Create PIE user data table for storing behavioral data points
CREATE TABLE public.pie_user_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  data_type TEXT NOT NULL CHECK (data_type IN ('mood', 'productivity', 'energy', 'sleep', 'sentiment', 'activity')),
  value REAL NOT NULL,
  raw_value JSONB,
  source TEXT NOT NULL CHECK (source IN ('user_input', 'conversation_analysis', 'activity_log', 'external_api')),
  confidence REAL NOT NULL DEFAULT 0.7,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create PIE patterns table for detected behavioral patterns
CREATE TABLE public.pie_patterns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  pattern_type TEXT NOT NULL CHECK (pattern_type IN ('cyclic', 'event_triggered', 'correlation', 'seasonal')),
  data_type TEXT NOT NULL CHECK (data_type IN ('mood', 'productivity', 'energy', 'sleep', 'sentiment')),
  significance REAL NOT NULL,
  confidence REAL NOT NULL,
  sample_size INTEGER NOT NULL,
  cycle_period INTEGER,
  event_trigger TEXT,
  correlation_strength REAL NOT NULL,
  detected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  valid_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create PIE predictive rules table
CREATE TABLE public.pie_predictive_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  event_type TEXT NOT NULL,
  direction TEXT NOT NULL CHECK (direction IN ('positive', 'negative', 'neutral')),
  magnitude REAL NOT NULL,
  confidence REAL NOT NULL,
  window_hours INTEGER NOT NULL,
  minimum_occurrences INTEGER NOT NULL,
  user_data_types JSONB NOT NULL DEFAULT '[]',
  creation_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_validated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  statistical_significance REAL NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create PIE insights table
CREATE TABLE public.pie_insights (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  pattern_id TEXT NOT NULL,
  predictive_rule_id TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  insight_type TEXT NOT NULL CHECK (insight_type IN ('warning', 'opportunity', 'preparation', 'awareness')),
  priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  trigger_event TEXT NOT NULL,
  trigger_time TIMESTAMP WITH TIME ZONE NOT NULL,
  delivery_time TIMESTAMP WITH TIME ZONE NOT NULL,
  expiration_time TIMESTAMP WITH TIME ZONE NOT NULL,
  confidence REAL NOT NULL,
  delivered BOOLEAN NOT NULL DEFAULT false,
  acknowledged BOOLEAN NOT NULL DEFAULT false,
  user_feedback TEXT CHECK (user_feedback IN ('helpful', 'somewhat_helpful', 'not_helpful', 'inaccurate')),
  communication_style TEXT NOT NULL,
  personalized_for_blueprint BOOLEAN NOT NULL DEFAULT false,
  delivered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create PIE astrological events table
CREATE TABLE public.pie_astrological_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  intensity REAL NOT NULL,
  personal_relevance REAL NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('planetary', 'lunar', 'aspect', 'transit')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create PIE configurations table
CREATE TABLE public.pie_configurations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT true,
  minimum_confidence REAL NOT NULL DEFAULT 0.7,
  pattern_sensitivity TEXT NOT NULL DEFAULT 'moderate' CHECK (pattern_sensitivity IN ('conservative', 'moderate', 'sensitive')),
  delivery_methods JSONB NOT NULL DEFAULT '["conversation"]',
  delivery_timing TEXT NOT NULL DEFAULT 'immediate' CHECK (delivery_timing IN ('immediate', 'daily_digest', 'weekly_summary')),
  quiet_hours JSONB NOT NULL DEFAULT '{"start": "22:00", "end": "08:00"}',
  include_astrology BOOLEAN NOT NULL DEFAULT true,
  include_statistics BOOLEAN NOT NULL DEFAULT false,
  communication_style TEXT NOT NULL DEFAULT 'balanced' CHECK (communication_style IN ('analytical', 'intuitive', 'balanced')),
  data_types JSONB NOT NULL DEFAULT '["mood", "productivity", "sentiment"]',
  retention_period INTEGER NOT NULL DEFAULT 90,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create PIE suppressed events table for audit trail
CREATE TABLE public.pie_suppressed_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  rule_id TEXT NOT NULL,
  event_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  suppression_reason TEXT NOT NULL,
  rule_confidence REAL NOT NULL,
  threshold_used REAL NOT NULL,
  suppressed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security on all PIE tables
ALTER TABLE public.pie_user_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pie_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pie_predictive_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pie_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pie_astrological_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pie_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pie_suppressed_events ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for PIE tables
-- PIE User Data policies
CREATE POLICY "Users can view their own PIE data" ON public.pie_user_data
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own PIE data" ON public.pie_user_data
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- PIE Patterns policies
CREATE POLICY "Users can view their own PIE patterns" ON public.pie_patterns
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own PIE patterns" ON public.pie_patterns
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- PIE Predictive Rules policies
CREATE POLICY "Users can view their own PIE rules" ON public.pie_predictive_rules
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own PIE rules" ON public.pie_predictive_rules
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own PIE rules" ON public.pie_predictive_rules
  FOR UPDATE USING (auth.uid() = user_id);

-- PIE Insights policies
CREATE POLICY "Users can view their own PIE insights" ON public.pie_insights
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own PIE insights" ON public.pie_insights
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own PIE insights" ON public.pie_insights
  FOR UPDATE USING (auth.uid() = user_id);

-- PIE Astrological Events policies (public read, admin write)
CREATE POLICY "Everyone can view astrological events" ON public.pie_astrological_events
  FOR SELECT USING (true);
CREATE POLICY "Admins can manage astrological events" ON public.pie_astrological_events
  FOR ALL USING (is_admin());

-- PIE Configurations policies
CREATE POLICY "Users can view their own PIE config" ON public.pie_configurations
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own PIE config" ON public.pie_configurations
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own PIE config" ON public.pie_configurations
  FOR UPDATE USING (auth.uid() = user_id);

-- PIE Suppressed Events policies
CREATE POLICY "Users can view their own suppressed events" ON public.pie_suppressed_events
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own suppressed events" ON public.pie_suppressed_events
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX pie_user_data_user_timestamp_idx ON public.pie_user_data(user_id, timestamp DESC);
CREATE INDEX pie_user_data_type_idx ON public.pie_user_data(user_id, data_type, timestamp DESC);
CREATE INDEX pie_patterns_user_idx ON public.pie_patterns(user_id, detected_at DESC);
CREATE INDEX pie_insights_user_delivery_idx ON public.pie_insights(user_id, delivery_time, delivered);
CREATE INDEX pie_astrological_events_time_idx ON public.pie_astrological_events(start_time);

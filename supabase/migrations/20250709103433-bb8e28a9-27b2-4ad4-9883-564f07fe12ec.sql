-- Create personality_reports table for comprehensive personality reports
CREATE TABLE public.personality_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  blueprint_id UUID,
  report_content JSONB NOT NULL DEFAULT '{}',
  generated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  blueprint_version TEXT NOT NULL DEFAULT '1.0',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create personality_quotes table for storing personalized quotes
CREATE TABLE public.personality_quotes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  personality_report_id UUID,
  quote_text TEXT NOT NULL,
  attribution TEXT,
  category TEXT NOT NULL DEFAULT 'inspiration',
  personality_alignment JSONB NOT NULL DEFAULT '{}',
  usage_count INTEGER NOT NULL DEFAULT 0,
  is_favorite BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_shown TIMESTAMP WITH TIME ZONE
);

-- Enable Row Level Security
ALTER TABLE public.personality_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.personality_quotes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for personality_reports
CREATE POLICY "Users can view their own personality reports" 
ON public.personality_reports 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own personality reports" 
ON public.personality_reports 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own personality reports" 
ON public.personality_reports 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create RLS policies for personality_quotes
CREATE POLICY "Users can view their own personality quotes" 
ON public.personality_quotes 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own personality quotes" 
ON public.personality_quotes 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own personality quotes" 
ON public.personality_quotes 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_personality_reports_user_id ON public.personality_reports(user_id);
CREATE INDEX idx_personality_reports_blueprint_id ON public.personality_reports(blueprint_id);
CREATE INDEX idx_personality_quotes_user_id ON public.personality_quotes(user_id);
CREATE INDEX idx_personality_quotes_report_id ON public.personality_quotes(personality_report_id);
CREATE INDEX idx_personality_quotes_category ON public.personality_quotes(category);

-- Add foreign key relationships
ALTER TABLE public.personality_quotes 
ADD CONSTRAINT fk_personality_quotes_report 
FOREIGN KEY (personality_report_id) 
REFERENCES public.personality_reports(id) 
ON DELETE CASCADE;
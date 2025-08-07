-- Create structured intelligence table that references existing personality reports
CREATE TABLE public.hermetic_structured_intelligence (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  personality_report_id UUID REFERENCES public.personality_reports(id),
  
  -- Core 12 Dimensions as structured JSONB
  identity_constructs JSONB NOT NULL DEFAULT '{}',
  behavioral_triggers JSONB NOT NULL DEFAULT '{}',
  execution_bias JSONB NOT NULL DEFAULT '{}',
  internal_conflicts JSONB NOT NULL DEFAULT '{}',
  spiritual_dimension JSONB NOT NULL DEFAULT '{}',
  adaptive_feedback JSONB NOT NULL DEFAULT '{}',
  temporal_biology JSONB NOT NULL DEFAULT '{}',
  metacognitive_biases JSONB NOT NULL DEFAULT '{}',
  attachment_style JSONB NOT NULL DEFAULT '{}',
  goal_archetypes JSONB NOT NULL DEFAULT '{}',
  crisis_handling JSONB NOT NULL DEFAULT '{}',
  identity_flexibility JSONB NOT NULL DEFAULT '{}',
  linguistic_fingerprint JSONB NOT NULL DEFAULT '{}',
  
  -- Extraction metadata
  extraction_confidence REAL NOT NULL DEFAULT 0.0,
  extraction_version TEXT NOT NULL DEFAULT '1.0',
  processing_notes JSONB DEFAULT '{}',
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.hermetic_structured_intelligence ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own structured intelligence" 
ON public.hermetic_structured_intelligence 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own structured intelligence" 
ON public.hermetic_structured_intelligence 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own structured intelligence" 
ON public.hermetic_structured_intelligence 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create indexes for fast FloatingOrb queries
CREATE INDEX idx_hermetic_intelligence_user_id ON public.hermetic_structured_intelligence(user_id);
CREATE INDEX idx_hermetic_intelligence_report_id ON public.hermetic_structured_intelligence(personality_report_id);
CREATE INDEX idx_hermetic_intelligence_confidence ON public.hermetic_structured_intelligence(extraction_confidence);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_hermetic_intelligence_updated_at
BEFORE UPDATE ON public.hermetic_structured_intelligence
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
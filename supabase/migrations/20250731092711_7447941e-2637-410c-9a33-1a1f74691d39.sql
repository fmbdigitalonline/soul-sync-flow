-- Create blueprint_facts table for structured fact lookup
CREATE TABLE public.blueprint_facts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  version TEXT NOT NULL DEFAULT '1.0',
  facet TEXT NOT NULL, -- e.g., 'numerology', 'human_design', 'mbti', 'astrology'
  key TEXT NOT NULL, -- e.g., 'life_path', 'expression', 'type', 'authority'
  value_json JSONB NOT NULL,
  source_spans JSONB DEFAULT '[]'::jsonb, -- references to source chunks
  confidence REAL DEFAULT 1.0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, facet, key)
);

-- Enable RLS
ALTER TABLE public.blueprint_facts ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own blueprint facts" 
ON public.blueprint_facts 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own blueprint facts" 
ON public.blueprint_facts 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own blueprint facts" 
ON public.blueprint_facts 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create retrieval_config table for feature flags and settings
CREATE TABLE public.retrieval_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  sidecar_enabled BOOLEAN DEFAULT false,
  hybrid_retrieval_enabled BOOLEAN DEFAULT true,
  ann_thresholds REAL[] DEFAULT ARRAY[0.25, 0.20],
  facts_priority BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.retrieval_config ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can manage their own retrieval config" 
ON public.retrieval_config 
FOR ALL 
USING (auth.uid() = user_id);

-- Create index for fast fact lookups
CREATE INDEX idx_blueprint_facts_user_facet ON public.blueprint_facts(user_id, facet);
CREATE INDEX idx_blueprint_facts_lookup ON public.blueprint_facts(user_id, facet, key);

-- Add metadata columns to existing blueprint_text_embeddings for better retrieval
ALTER TABLE public.blueprint_text_embeddings 
ADD COLUMN IF NOT EXISTS facet TEXT,
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS heading TEXT,
ADD COLUMN IF NOT EXISTS paragraph_index INTEGER;

-- Create index for hybrid search
CREATE INDEX IF NOT EXISTS idx_blueprint_embeddings_facet ON public.blueprint_text_embeddings(user_id, facet);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_blueprint_facts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for blueprint_facts
CREATE TRIGGER update_blueprint_facts_updated_at
BEFORE UPDATE ON public.blueprint_facts
FOR EACH ROW
EXECUTE FUNCTION public.update_blueprint_facts_updated_at();

-- Trigger for retrieval_config
CREATE TRIGGER update_retrieval_config_updated_at
BEFORE UPDATE ON public.retrieval_config
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
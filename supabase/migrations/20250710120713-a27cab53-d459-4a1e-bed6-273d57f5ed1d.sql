-- Create HACS intelligence tracking table
CREATE TABLE public.hacs_intelligence (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  intelligence_level FLOAT NOT NULL DEFAULT 0.0 CHECK (intelligence_level >= 0.0 AND intelligence_level <= 100.0),
  module_scores JSON NOT NULL DEFAULT '{}',
  interaction_count INTEGER NOT NULL DEFAULT 0,
  last_update TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.hacs_intelligence ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own HACS intelligence" 
ON public.hacs_intelligence 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own HACS intelligence" 
ON public.hacs_intelligence 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own HACS intelligence" 
ON public.hacs_intelligence 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_hacs_intelligence_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_hacs_intelligence_updated_at
BEFORE UPDATE ON public.hacs_intelligence
FOR EACH ROW
EXECUTE FUNCTION public.update_hacs_intelligence_updated_at();

-- Create index for better performance
CREATE INDEX idx_hacs_intelligence_user_id ON public.hacs_intelligence(user_id);
CREATE INDEX idx_hacs_intelligence_level ON public.hacs_intelligence(intelligence_level);
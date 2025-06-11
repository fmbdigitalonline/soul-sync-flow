
-- Create personality_scores table
CREATE TABLE public.personality_scores (
  blueprint_id UUID REFERENCES public.user_blueprints(id) ON DELETE CASCADE PRIMARY KEY,
  big5 JSONB NOT NULL DEFAULT '{}',
  big5_confidence JSONB NOT NULL DEFAULT '{}',
  mbti_probabilities JSONB NOT NULL DEFAULT '{}',
  enneagram_probabilities JSONB DEFAULT '{}',
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create personality_answers table
CREATE TABLE public.personality_answers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  blueprint_id UUID REFERENCES public.user_blueprints(id) ON DELETE CASCADE NOT NULL,
  item_code TEXT NOT NULL,
  answer TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security
ALTER TABLE public.personality_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.personality_answers ENABLE ROW LEVEL SECURITY;

-- Create policies for personality_scores
CREATE POLICY "Users can view their own personality scores" 
  ON public.personality_scores 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.user_blueprints 
    WHERE id = blueprint_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can insert their own personality scores" 
  ON public.personality_scores 
  FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.user_blueprints 
    WHERE id = blueprint_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can update their own personality scores" 
  ON public.personality_scores 
  FOR UPDATE 
  USING (EXISTS (
    SELECT 1 FROM public.user_blueprints 
    WHERE id = blueprint_id AND user_id = auth.uid()
  ));

-- Create policies for personality_answers
CREATE POLICY "Users can view their own personality answers" 
  ON public.personality_answers 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.user_blueprints 
    WHERE id = blueprint_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can insert their own personality answers" 
  ON public.personality_answers 
  FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.user_blueprints 
    WHERE id = blueprint_id AND user_id = auth.uid()
  ));

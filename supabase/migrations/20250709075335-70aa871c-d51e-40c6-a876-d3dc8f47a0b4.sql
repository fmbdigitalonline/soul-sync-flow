-- Expand life domains and create life wheel assessment system
-- This is the foundational schema for the Personal Life Operating System

-- First, create the life_wheel_assessments table
CREATE TABLE public.life_wheel_assessments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  domain TEXT NOT NULL,
  current_score INTEGER NOT NULL CHECK (current_score >= 1 AND current_score <= 10),
  desired_score INTEGER NOT NULL CHECK (desired_score >= 1 AND desired_score <= 10),
  importance_rating INTEGER NOT NULL CHECK (importance_rating >= 1 AND importance_rating <= 10) DEFAULT 5,
  gap_size INTEGER GENERATED ALWAYS AS (desired_score - current_score) STORED,
  assessment_version INTEGER NOT NULL DEFAULT 1,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for life wheel assessments
ALTER TABLE public.life_wheel_assessments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can create their own life wheel assessments" 
ON public.life_wheel_assessments 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own life wheel assessments" 
ON public.life_wheel_assessments 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own life wheel assessments" 
ON public.life_wheel_assessments 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create domain interdependencies table for relationship mapping
CREATE TABLE public.domain_interdependencies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  from_domain TEXT NOT NULL,
  to_domain TEXT NOT NULL,
  relationship_type TEXT NOT NULL CHECK (relationship_type IN ('supports', 'blocks', 'synergistic')),
  strength REAL NOT NULL CHECK (strength >= 0.0 AND strength <= 1.0) DEFAULT 0.5,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(from_domain, to_domain)
);

-- Enable RLS for domain interdependencies (admin managed, public readable)
ALTER TABLE public.domain_interdependencies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can read domain interdependencies" 
ON public.domain_interdependencies 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage domain interdependencies" 
ON public.domain_interdependencies 
FOR ALL 
USING (is_admin());

-- Add version tracking trigger for assessments
CREATE OR REPLACE FUNCTION public.update_assessment_version()
RETURNS TRIGGER AS $$
BEGIN
  -- Increment version when significant changes occur
  IF OLD.current_score != NEW.current_score OR OLD.desired_score != NEW.desired_score THEN
    NEW.assessment_version = OLD.assessment_version + 1;
  END IF;
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_life_wheel_assessment_version
  BEFORE UPDATE ON public.life_wheel_assessments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_assessment_version();

-- Insert default domain interdependencies
INSERT INTO public.domain_interdependencies (from_domain, to_domain, relationship_type, strength) VALUES
  ('energy', 'career', 'supports', 0.8),
  ('energy', 'relationships', 'supports', 0.7),
  ('energy', 'health', 'synergistic', 0.9),
  ('finances', 'wellbeing', 'supports', 0.6),
  ('finances', 'stress', 'blocks', 0.7),
  ('health', 'energy', 'synergistic', 0.9),
  ('health', 'productivity', 'supports', 0.7),
  ('relationships', 'wellbeing', 'supports', 0.8),
  ('career', 'finances', 'supports', 0.8),
  ('personal_growth', 'career', 'supports', 0.6),
  ('personal_growth', 'relationships', 'supports', 0.5),
  ('creativity', 'career', 'supports', 0.4),
  ('creativity', 'wellbeing', 'supports', 0.6);

-- Add indexes for performance
CREATE INDEX idx_life_wheel_assessments_user_domain ON public.life_wheel_assessments(user_id, domain);
CREATE INDEX idx_life_wheel_assessments_gap_size ON public.life_wheel_assessments(gap_size DESC);
CREATE INDEX idx_domain_interdependencies_lookup ON public.domain_interdependencies(from_domain, to_domain);
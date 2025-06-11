
-- Add mode column to conversation_memory table
ALTER TABLE public.conversation_memory 
ADD COLUMN IF NOT EXISTS mode text DEFAULT 'guide';

-- Create index for faster mode-specific lookups
CREATE INDEX IF NOT EXISTS conversation_memory_mode_idx ON public.conversation_memory (user_id, mode);

-- Create table for tracking productivity journey progress
CREATE TABLE IF NOT EXISTS public.productivity_journey (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  current_goals JSONB DEFAULT '[]'::jsonb,
  completed_goals JSONB DEFAULT '[]'::jsonb,
  current_tasks JSONB DEFAULT '[]'::jsonb,
  completed_tasks JSONB DEFAULT '[]'::jsonb,
  focus_sessions JSONB DEFAULT '[]'::jsonb,
  productivity_metrics JSONB DEFAULT '{}'::jsonb,
  journey_milestones JSONB DEFAULT '[]'::jsonb,
  current_position TEXT DEFAULT 'beginning',
  last_activity_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create table for tracking growth journey progress
CREATE TABLE IF NOT EXISTS public.growth_journey (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  mood_entries JSONB DEFAULT '[]'::jsonb,
  reflection_entries JSONB DEFAULT '[]'::jsonb,
  insight_entries JSONB DEFAULT '[]'::jsonb,
  spiritual_practices JSONB DEFAULT '[]'::jsonb,
  growth_milestones JSONB DEFAULT '[]'::jsonb,
  current_focus_areas JSONB DEFAULT '[]'::jsonb,
  current_position TEXT DEFAULT 'beginning',
  last_reflection_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS for both journey tables
ALTER TABLE public.productivity_journey ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.growth_journey ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for productivity_journey
CREATE POLICY "Users can view their own productivity journey" 
  ON public.productivity_journey 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own productivity journey" 
  ON public.productivity_journey 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own productivity journey" 
  ON public.productivity_journey 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create RLS policies for growth_journey
CREATE POLICY "Users can view their own growth journey" 
  ON public.growth_journey 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own growth journey" 
  ON public.growth_journey 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own growth journey" 
  ON public.growth_journey 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS productivity_journey_user_idx ON public.productivity_journey (user_id);
CREATE INDEX IF NOT EXISTS growth_journey_user_idx ON public.growth_journey (user_id);

-- Create function to ensure each user has journey records
CREATE OR REPLACE FUNCTION public.ensure_user_journeys()
RETURNS TRIGGER AS $$
BEGIN
  -- Create productivity journey record if it doesn't exist
  INSERT INTO public.productivity_journey (user_id)
  SELECT NEW.id
  WHERE NOT EXISTS (
    SELECT 1 FROM public.productivity_journey WHERE user_id = NEW.id
  );
  
  -- Create growth journey record if it doesn't exist
  INSERT INTO public.growth_journey (user_id)
  SELECT NEW.id
  WHERE NOT EXISTS (
    SELECT 1 FROM public.growth_journey WHERE user_id = NEW.id
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create journey records for new users
DROP TRIGGER IF EXISTS create_user_journeys_trigger ON auth.users;
CREATE TRIGGER create_user_journeys_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.ensure_user_journeys();


-- Create personas table to store compiled personality data
CREATE TABLE public.personas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  system_prompt TEXT NOT NULL,
  voice_tokens JSONB NOT NULL DEFAULT '{}',
  humor_profile JSONB NOT NULL DEFAULT '{}',
  function_permissions JSONB NOT NULL DEFAULT '[]',
  generated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  blueprint_version TEXT NOT NULL DEFAULT '1.0.0',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS on personas table
ALTER TABLE public.personas ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access their own personas
CREATE POLICY "Users can access their own personas"
ON public.personas
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Function to regenerate persona when blueprint changes
CREATE OR REPLACE FUNCTION public.trigger_persona_regeneration()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Delete existing persona to force regeneration
  DELETE FROM public.personas WHERE user_id = NEW.user_id;
  
  -- Log the regeneration trigger
  INSERT INTO public.user_activities (user_id, activity_type, activity_data)
  VALUES (
    NEW.user_id,
    'persona_regeneration_triggered',
    jsonb_build_object(
      'trigger_reason', 'blueprint_updated',
      'blueprint_id', NEW.id,
      'timestamp', now()
    )
  );
  
  RETURN NEW;
END;
$$;

-- Trigger: Regenerate persona when user blueprint is updated
CREATE TRIGGER on_blueprint_updated
  AFTER UPDATE ON public.user_blueprints
  FOR EACH ROW
  WHEN (OLD.blueprint IS DISTINCT FROM NEW.blueprint)
  EXECUTE FUNCTION public.trigger_persona_regeneration();

-- Trigger: Regenerate persona when new blueprint is created
CREATE TRIGGER on_blueprint_created
  AFTER INSERT ON public.user_blueprints
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_persona_regeneration();

-- Index for faster persona lookups
CREATE INDEX idx_personas_user_id ON public.personas(user_id);
CREATE INDEX idx_personas_generated_at ON public.personas(generated_at DESC);

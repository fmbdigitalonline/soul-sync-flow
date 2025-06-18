
-- Enable pgcrypto extension for SHA256 hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Add blueprint signature and template version tracking to personas table
ALTER TABLE public.personas 
ADD COLUMN IF NOT EXISTS blueprint_signature TEXT,
ADD COLUMN IF NOT EXISTS template_version TEXT DEFAULT '1.0.0';

-- Add unique constraint to prevent duplicate signatures per user (with proper syntax)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'personas_signature_unique' 
    AND table_name = 'personas'
  ) THEN
    ALTER TABLE public.personas 
    ADD CONSTRAINT personas_signature_unique UNIQUE(user_id, blueprint_signature);
  END IF;
END $$;

-- Create improved blueprint signature function with SHA256 and null safety
CREATE OR REPLACE FUNCTION public.generate_blueprint_signature(blueprint_data JSONB)
RETURNS TEXT
LANGUAGE plpgsql AS $$
DECLARE
  signature_data JSONB;
BEGIN
  signature_data := jsonb_build_object(
    'mbti_type',        coalesce(blueprint_data->'cognition_mbti'->>'type',''),
    'hd_type',          coalesce(blueprint_data->'energy_strategy_human_design'->>'type',''),
    'hd_authority',     coalesce(blueprint_data->'energy_strategy_human_design'->>'authority',''),
    'sun_sign',         coalesce(blueprint_data->'archetype_western'->>'sun_sign',''),
    'moon_sign',        coalesce(blueprint_data->'archetype_western'->>'moon_sign',''),
    'life_path',        coalesce(blueprint_data->'values_life_path'->>'lifePathNumber',''),
    'user_name',        coalesce(blueprint_data->'user_meta'->>'preferred_name','')
  );

  RETURN encode(digest(signature_data::text, 'sha256'), 'hex');
END;
$$;

-- Create trigger function to auto-populate blueprint_signature and template_version
CREATE OR REPLACE FUNCTION public.personas_set_defaults() 
RETURNS trigger AS $$
BEGIN
  -- Auto-populate blueprint_signature if not provided
  IF NEW.blueprint_signature IS NULL THEN
    -- We'll need to get blueprint data from user_blueprints table
    NEW.blueprint_signature := (
      SELECT public.generate_blueprint_signature(blueprint)
      FROM public.user_blueprints 
      WHERE user_id = NEW.user_id AND is_active = true 
      ORDER BY updated_at DESC 
      LIMIT 1
    );
  END IF;
  
  -- Auto-populate template_version if not provided
  IF NEW.template_version IS NULL THEN
    NEW.template_version := '1.0.0';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-populate defaults (drop first if exists)
DROP TRIGGER IF EXISTS trg_personas_defaults ON public.personas;
CREATE TRIGGER trg_personas_defaults 
  BEFORE INSERT OR UPDATE ON public.personas
  FOR EACH ROW EXECUTE FUNCTION public.personas_set_defaults();

-- Create optimized composite indexes
CREATE INDEX IF NOT EXISTS idx_personas_user_mode_sig ON public.personas(user_id, blueprint_signature);
CREATE INDEX IF NOT EXISTS idx_personas_template_version ON public.personas(template_version);

-- Remove old less efficient indexes if they exist
DROP INDEX IF EXISTS idx_personas_blueprint_signature;

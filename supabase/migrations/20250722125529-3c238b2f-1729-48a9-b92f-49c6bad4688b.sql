-- Fix security warning for ensure_blueprints_record function
-- Add security definer and search path per security linter guidance

CREATE OR REPLACE FUNCTION public.ensure_blueprints_record()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  extracted_mbti_type TEXT;
  extracted_mbti_data JSONB;
BEGIN
  -- Extract MBTI type from the correct location in user_meta.personality per Principle #2 (No Hardcoded Data)
  extracted_mbti_type := COALESCE(
    NEW.blueprint->'user_meta'->'personality'->>'likelyType',
    NEW.blueprint->'cognition_mbti'->>'type',
    'Unknown'
  );
  
  -- Build proper MBTI data structure with real user data (Principle #2)
  extracted_mbti_data := jsonb_build_object(
    'type', extracted_mbti_type,
    'core_keywords', COALESCE(NEW.blueprint->'cognition_mbti'->'core_keywords', '[]'::jsonb),
    'dominant_function', COALESCE(NEW.blueprint->'cognition_mbti'->>'dominant_function', 'Unknown'),
    'auxiliary_function', COALESCE(NEW.blueprint->'cognition_mbti'->>'auxiliary_function', 'Unknown'),
    'description', COALESCE(NEW.blueprint->'cognition_mbti'->>'description', ''),
    'source', 'user_meta_personality'
  );
  
  -- Insert or update blueprints record with corrected MBTI data (Principle #1: Never Break)
  INSERT INTO blueprints (
    user_id,
    is_active,
    steward_introduction_completed,
    user_meta,
    cognition_mbti,
    energy_strategy_human_design,
    archetype_western,
    archetype_chinese,
    bashar_suite,
    values_life_path,
    timing_overlays,
    metadata
  )
  VALUES (
    NEW.user_id,
    NEW.is_active,
    false, -- Default steward introduction to not completed
    COALESCE(NEW.blueprint->'user_meta', '{}'::jsonb),
    extracted_mbti_data, -- Use corrected MBTI data
    COALESCE(NEW.blueprint->'energy_strategy_human_design', '{}'::jsonb),
    COALESCE(NEW.blueprint->'archetype_western', '{}'::jsonb),
    COALESCE(NEW.blueprint->'archetype_chinese', '{}'::jsonb),
    COALESCE(NEW.blueprint->'bashar_suite', '{}'::jsonb),
    COALESCE(NEW.blueprint->'values_life_path', '{}'::jsonb),
    COALESCE(NEW.blueprint->'timing_overlays', '{}'::jsonb),
    COALESCE(NEW.blueprint->'metadata', '{}'::jsonb)
  )
  ON CONFLICT (user_id, is_active) 
  DO UPDATE SET
    cognition_mbti = extracted_mbti_data,
    user_meta = COALESCE(NEW.blueprint->'user_meta', '{}'::jsonb),
    energy_strategy_human_design = COALESCE(NEW.blueprint->'energy_strategy_human_design', '{}'::jsonb),
    archetype_western = COALESCE(NEW.blueprint->'archetype_western', '{}'::jsonb),
    archetype_chinese = COALESCE(NEW.blueprint->'archetype_chinese', '{}'::jsonb),
    bashar_suite = COALESCE(NEW.blueprint->'bashar_suite', '{}'::jsonb),
    values_life_path = COALESCE(NEW.blueprint->'values_life_path', '{}'::jsonb),
    timing_overlays = COALESCE(NEW.blueprint->'timing_overlays', '{}'::jsonb),
    metadata = COALESCE(NEW.blueprint->'metadata', '{}'::jsonb),
    updated_at = now();
  
  RETURN NEW;
END;
$function$;

-- Now add the unique constraint safely after cleanup
ALTER TABLE blueprints 
ADD CONSTRAINT blueprints_user_id_is_active_unique 
UNIQUE (user_id, is_active);

-- Recreate the trigger to ensure it's properly linked
DROP TRIGGER IF EXISTS ensure_blueprints_record_trigger ON user_blueprints;
CREATE TRIGGER ensure_blueprints_record_trigger
  AFTER INSERT OR UPDATE ON user_blueprints
  FOR EACH ROW EXECUTE FUNCTION ensure_blueprints_record();
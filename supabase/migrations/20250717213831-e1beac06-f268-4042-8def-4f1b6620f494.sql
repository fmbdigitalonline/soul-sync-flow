-- Create a function to ensure blueprints record exists when user_blueprints exists
CREATE OR REPLACE FUNCTION public.ensure_blueprints_record()
RETURNS TRIGGER AS $$
BEGIN
  -- Extract relevant fields from the blueprint JSONB in user_blueprints
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
  SELECT 
    NEW.user_id,
    NEW.is_active,
    false, -- Default steward introduction to not completed
    COALESCE(NEW.blueprint->'user_meta', '{}'::jsonb),
    COALESCE(NEW.blueprint->'cognition_mbti', '{}'::jsonb),
    COALESCE(NEW.blueprint->'energy_strategy_human_design', '{}'::jsonb),
    COALESCE(NEW.blueprint->'archetype_western', '{}'::jsonb),
    COALESCE(NEW.blueprint->'archetype_chinese', '{}'::jsonb),
    COALESCE(NEW.blueprint->'bashar_suite', '{}'::jsonb),
    COALESCE(NEW.blueprint->'values_life_path', '{}'::jsonb),
    COALESCE(NEW.blueprint->'timing_overlays', '{}'::jsonb),
    COALESCE(NEW.blueprint->'metadata', '{}'::jsonb)
  WHERE NOT EXISTS (
    SELECT 1 FROM blueprints 
    WHERE user_id = NEW.user_id AND is_active = NEW.is_active
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically ensure blueprints record
DROP TRIGGER IF EXISTS ensure_blueprints_record_trigger ON user_blueprints;
CREATE TRIGGER ensure_blueprints_record_trigger
  AFTER INSERT OR UPDATE ON user_blueprints
  FOR EACH ROW
  EXECUTE FUNCTION ensure_blueprints_record();

-- Backfill existing user_blueprints records that don't have corresponding blueprints
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
SELECT 
  ub.user_id,
  ub.is_active,
  false, -- Default steward introduction to not completed
  COALESCE(ub.blueprint->'user_meta', '{}'::jsonb),
  COALESCE(ub.blueprint->'cognition_mbti', '{}'::jsonb),
  COALESCE(ub.blueprint->'energy_strategy_human_design', '{}'::jsonb),
  COALESCE(ub.blueprint->'archetype_western', '{}'::jsonb),
  COALESCE(ub.blueprint->'archetype_chinese', '{}'::jsonb),
  COALESCE(ub.blueprint->'bashar_suite', '{}'::jsonb),
  COALESCE(ub.blueprint->'values_life_path', '{}'::jsonb),
  COALESCE(ub.blueprint->'timing_overlays', '{}'::jsonb),
  COALESCE(ub.blueprint->'metadata', '{}'::jsonb)
FROM user_blueprints ub
WHERE ub.is_active = true
AND NOT EXISTS (
  SELECT 1 FROM blueprints b 
  WHERE b.user_id = ub.user_id AND b.is_active = true
);
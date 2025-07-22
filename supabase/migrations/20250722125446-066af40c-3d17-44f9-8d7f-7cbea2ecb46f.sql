-- Phase 2: Database Integrity Fix - Clean up duplicates and fix MBTI data mapping
-- Following SoulSync Principle #7: Build Transparently, Not Silently

-- Step 1: Clean up duplicate blueprints records, keeping the latest ones
WITH duplicate_cleanup AS (
  DELETE FROM blueprints 
  WHERE id NOT IN (
    SELECT DISTINCT ON (user_id, is_active) id
    FROM blueprints 
    ORDER BY user_id, is_active, updated_at DESC
  )
  RETURNING user_id, is_active, id as deleted_id
)
SELECT COUNT(*) as duplicates_removed FROM duplicate_cleanup;

-- Step 2: Fix the ensure_blueprints_record() function to correctly extract MBTI data
CREATE OR REPLACE FUNCTION public.ensure_blueprints_record()
RETURNS trigger
LANGUAGE plpgsql
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
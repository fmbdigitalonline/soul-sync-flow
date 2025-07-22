-- Phase 2 Completion: Force re-processing of existing blueprints to fix MBTI data
-- This will trigger the corrected ensure_blueprints_record() function

-- Force trigger execution for existing user blueprints to fix MBTI data
UPDATE user_blueprints 
SET updated_at = now() 
WHERE user_id = 'fa7e1307-6a94-4520-b241-7bfb3c943c50'::uuid 
  AND is_active = true;

-- Create diagnostic function for transparent monitoring (Principle #7)
CREATE OR REPLACE FUNCTION public.get_steward_introduction_diagnostic(p_user_id UUID DEFAULT auth.uid())
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  result JSONB;
  blueprint_exists BOOLEAN;
  mbti_correct BOOLEAN;
  introduction_completed BOOLEAN;
BEGIN
  -- Check if blueprint exists and has correct data
  SELECT 
    (b.id IS NOT NULL) as has_blueprint,
    (b.cognition_mbti->>'type' != 'Unknown' AND b.cognition_mbti->>'type' IS NOT NULL) as mbti_extracted,
    COALESCE(b.steward_introduction_completed, false) as introduction_done,
    b.cognition_mbti->>'type' as mbti_type,
    b.user_meta->>'preferred_name' as user_name
  INTO blueprint_exists, mbti_correct, introduction_completed, result
  FROM blueprints b
  WHERE b.user_id = p_user_id AND b.is_active = true
  LIMIT 1;
  
  -- Build diagnostic result
  result := jsonb_build_object(
    'user_id', p_user_id,
    'timestamp', now(),
    'blueprint_exists', COALESCE(blueprint_exists, false),
    'mbti_data_correct', COALESCE(mbti_correct, false),
    'introduction_completed', COALESCE(introduction_completed, false),
    'should_show_introduction', (
      COALESCE(blueprint_exists, false) AND 
      COALESCE(mbti_correct, false) AND 
      NOT COALESCE(introduction_completed, false)
    ),
    'diagnosis', CASE 
      WHEN NOT COALESCE(blueprint_exists, false) THEN 'missing_blueprint_record'
      WHEN NOT COALESCE(mbti_correct, false) THEN 'mbti_data_not_extracted'
      WHEN COALESCE(introduction_completed, false) THEN 'introduction_already_completed'
      ELSE 'ready_for_introduction'
    END
  );
  
  RETURN result;
END;
$function$;
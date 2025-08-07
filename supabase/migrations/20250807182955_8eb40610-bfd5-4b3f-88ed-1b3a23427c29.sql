-- Phase 1: Critical Admin Security Fixes
-- Remove hardcoded admin UUID from all database functions

-- 1. Fix is_admin() function - remove hardcoded UUID
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Only check admin_users table, no hardcoded UUIDs
  RETURN (auth.uid() IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.admin_users WHERE id = auth.uid()
  ));
END;
$function$;

-- 2. Fix check_admin_status() function - remove hardcoded UUID
CREATE OR REPLACE FUNCTION public.check_admin_status()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Only check admin_users table, no hardcoded UUIDs
  RETURN auth.uid() IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.admin_users WHERE id = auth.uid()
  );
END;
$function$;

-- 3. Fix handle_admin_check() function - remove hardcoded UUID
CREATE OR REPLACE FUNCTION public.handle_admin_check()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Only check admin_users table, no hardcoded UUIDs
  RETURN auth.uid() IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.admin_users WHERE id = auth.uid()
  );
END;
$function$;

-- Phase 2: Database Security Hardening
-- Add secure search paths to all SECURITY DEFINER functions

-- Fix search path for personas_set_defaults
CREATE OR REPLACE FUNCTION public.personas_set_defaults()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
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
$function$;

-- Fix search path for get_steward_introduction_diagnostic
CREATE OR REPLACE FUNCTION public.get_steward_introduction_diagnostic(p_user_id uuid DEFAULT auth.uid())
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
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

-- Fix search path for ensure_blueprints_record
CREATE OR REPLACE FUNCTION public.ensure_blueprints_record()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
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

-- Add RLS to archive table
ALTER TABLE public.user_360_profiles_archive ENABLE ROW LEVEL SECURITY;

-- Create policies for archive table
CREATE POLICY "Users can view their own archived profiles" 
ON public.user_360_profiles_archive 
FOR SELECT 
USING (auth.uid() = user_id);

-- Restrict public access to ab_test tables - only admins should see aggregated data
DROP POLICY IF EXISTS "Allow public to insert page views" ON public.ab_test_page_views;
DROP POLICY IF EXISTS "Allow public to insert scroll depth" ON public.ab_test_scroll_depth;

CREATE POLICY "Authenticated users can insert page views" 
ON public.ab_test_page_views 
FOR INSERT 
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can insert scroll depth" 
ON public.ab_test_scroll_depth 
FOR INSERT 
TO authenticated  
WITH CHECK (true);

-- Add admin action logging table
CREATE TABLE IF NOT EXISTS public.admin_action_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id uuid NOT NULL,
  action_type text NOT NULL,
  target_resource text,
  action_details jsonb DEFAULT '{}',
  ip_address inet,
  user_agent text,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on admin logs
ALTER TABLE public.admin_action_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view admin logs
CREATE POLICY "Only admins can view admin logs"
ON public.admin_action_logs
FOR SELECT
USING (check_admin_status());

-- System can insert admin logs
CREATE POLICY "System can insert admin logs"
ON public.admin_action_logs
FOR INSERT
WITH CHECK (true);
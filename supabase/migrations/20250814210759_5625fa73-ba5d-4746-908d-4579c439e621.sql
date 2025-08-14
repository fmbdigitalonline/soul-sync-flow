-- CRITICAL SECURITY FIXES - Phase 1: Data Breach Prevention (Corrected)

-- 1. URGENT: Secure Customer Email Data in waitlist_entries
-- Remove the dangerous public SELECT policy that exposes all customer emails
DROP POLICY IF EXISTS "Allow select for waitlist_entries" ON public.waitlist_entries;

-- Create admin-only access policy for waitlist entries  
CREATE POLICY "Admin only access to waitlist entries" 
ON public.waitlist_entries 
FOR SELECT 
USING (is_admin());

-- 2. Secure Internal System Data - memory_writeback_queue doesn't have user_id
-- This should be admin-only access since it's system infrastructure
DROP POLICY IF EXISTS "Allow authenticated users to manage memory writeback queue" ON public.memory_writeback_queue;

-- Restrict memory writeback queue to admin only
CREATE POLICY "Admin only access to memory writeback queue" 
ON public.memory_writeback_queue 
FOR ALL 
USING (is_admin());

-- 3. Fix Database Function Security - Add search_path protection to remaining functions
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

-- 4. Add constraint to prevent admin route access when no admin users exist
CREATE OR REPLACE FUNCTION public.has_any_admin_users()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (SELECT 1 FROM public.admin_users LIMIT 1);
$$;
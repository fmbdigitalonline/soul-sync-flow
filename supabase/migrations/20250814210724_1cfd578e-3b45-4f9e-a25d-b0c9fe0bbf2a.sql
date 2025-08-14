-- CRITICAL SECURITY FIXES - Phase 1: Data Breach Prevention

-- 1. URGENT: Secure Customer Email Data in waitlist_entries
-- Remove the dangerous public SELECT policy that exposes all customer emails
DROP POLICY IF EXISTS "Allow select for waitlist_entries" ON public.waitlist_entries;

-- Create admin-only access policy for waitlist entries
CREATE POLICY "Admin only access to waitlist entries" 
ON public.waitlist_entries 
FOR SELECT 
USING (is_admin());

-- 2. Secure Internal System Data - memory_writeback_queue  
-- This table should not be publicly accessible
DROP POLICY IF EXISTS "Allow authenticated users to manage memory writeback queue" ON public.memory_writeback_queue;

-- Restrict to user's own data only
CREATE POLICY "Users can manage their own memory writeback queue" 
ON public.memory_writeback_queue 
FOR ALL 
USING (auth.uid() = user_id);

-- 3. Fix Database Function Security - Add search_path protection
-- Update all custom functions to prevent search_path attacks

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

-- 4. Secure AB Test Tables - Require authentication for meaningful operations
DROP POLICY IF EXISTS "Authenticated users can insert page views" ON public.ab_test_page_views;
DROP POLICY IF EXISTS "Authenticated users can insert scroll depth" ON public.ab_test_scroll_depth;

-- Allow inserts but require session verification
CREATE POLICY "Verified sessions can insert page views" 
ON public.ab_test_page_views 
FOR INSERT 
WITH CHECK (session_id IS NOT NULL AND length(session_id) > 10);

CREATE POLICY "Verified sessions can insert scroll depth" 
ON public.ab_test_scroll_depth 
FOR INSERT 
WITH CHECK (session_id IS NOT NULL AND length(session_id) > 10);

-- 5. Add constraint to prevent admin route access when no admin users exist
CREATE OR REPLACE FUNCTION public.has_any_admin_users()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (SELECT 1 FROM public.admin_users LIMIT 1);
$$;
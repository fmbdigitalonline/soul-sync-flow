-- Fix security issue: Restrict waitlist_entries SELECT access to admins only

-- Ensure RLS is enabled on waitlist_entries
ALTER TABLE public.waitlist_entries ENABLE ROW LEVEL SECURITY;

-- Drop any existing overly permissive SELECT policies
DROP POLICY IF EXISTS "Allow public to view waitlist entries" ON public.waitlist_entries;
DROP POLICY IF EXISTS "Public can read waitlist entries" ON public.waitlist_entries;

-- Create admin-only SELECT policy
CREATE POLICY "Only admins can view waitlist entries"
ON public.waitlist_entries
FOR SELECT
TO authenticated
USING (is_admin());

-- Ensure public can still sign up for the waitlist (INSERT remains public)
DROP POLICY IF EXISTS "Allow public to insert waitlist entries" ON public.waitlist_entries;
CREATE POLICY "Public can sign up for waitlist"
ON public.waitlist_entries
FOR INSERT
TO anon, authenticated
WITH CHECK (true);
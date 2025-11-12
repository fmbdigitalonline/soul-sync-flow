-- Fix encoder_versions public exposure
-- Remove the overly permissive SELECT policy
DROP POLICY IF EXISTS "Only authenticated users can view encoder versions" ON public.encoder_versions;

-- Add a proper authenticated-only SELECT policy
CREATE POLICY "Authenticated users can view encoder versions"
ON public.encoder_versions
FOR SELECT
TO authenticated
USING (auth.uid() IS NOT NULL);
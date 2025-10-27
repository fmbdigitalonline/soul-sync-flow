-- Drop the public access policy that allows anyone to view encoder versions
DROP POLICY IF EXISTS "Anyone can view encoder versions" ON public.encoder_versions;

-- Create a new policy that restricts access to authenticated users only
CREATE POLICY "Only authenticated users can view encoder versions"
ON public.encoder_versions
FOR SELECT
TO authenticated
USING (true);

-- Optional: Add a comment explaining the security requirement
COMMENT ON TABLE public.encoder_versions IS 'Contains proprietary AI model weights and calibration parameters. Access restricted to authenticated users only.';
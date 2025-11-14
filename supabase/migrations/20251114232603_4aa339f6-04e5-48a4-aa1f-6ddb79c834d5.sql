-- Drop the public SELECT policy on ab_test_config
DROP POLICY IF EXISTS "Allow public to view test config" ON public.ab_test_config;

-- The "Allow admins to manage test config" policy already covers admin SELECT access
-- No additional policy needed since it grants ALL permissions to admins
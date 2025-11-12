-- Fix acs_error_logs INSERT policy
-- Allow authenticated users and service role to insert error logs

-- Policy for authenticated users to insert their own error logs
CREATE POLICY "Users can insert their own error logs"
ON public.acs_error_logs
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Policy for service role to insert error logs (system-level errors)
CREATE POLICY "Service role can insert error logs"
ON public.acs_error_logs
FOR INSERT
TO service_role
WITH CHECK (true);
-- Fix audit log security vulnerability
-- Only allow admin users to insert admin action logs directly
-- Edge functions using service role key will bypass RLS automatically

DROP POLICY IF EXISTS "System can insert admin logs" ON public.admin_action_logs;

CREATE POLICY "Only admins can insert admin logs"
ON public.admin_action_logs
FOR INSERT
TO authenticated
WITH CHECK (check_admin_status());

-- Add helpful comment
COMMENT ON POLICY "Only admins can insert admin logs" ON public.admin_action_logs IS 
'Prevents audit log poisoning by restricting INSERT to admin users only. Service role bypasses RLS for system logging.';
-- Phase 5: Final Security Hardening
-- The remaining "avg" and "sum" warnings are from the vector extension aggregate functions
-- which can't be modified. Focus on the remaining non-function issues.

-- Note: The remaining Function Search Path Mutable warnings are from vector extension 
-- aggregate functions (avg, sum) that we cannot modify as they are built-in.
-- The extension in public schema warning is also from the vector extension which
-- is required for the application to function.

-- Add a security audit log table for monitoring admin access
CREATE TABLE IF NOT EXISTS public.security_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  action text NOT NULL,
  resource text NOT NULL,
  timestamp timestamp with time zone NOT NULL DEFAULT now(),
  ip_address inet,
  user_agent text,
  success boolean NOT NULL DEFAULT true,
  error_message text
);

-- Enable RLS on security audit log
ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view security logs
CREATE POLICY "Admins can view security audit logs" 
ON public.security_audit_log 
FOR SELECT 
USING (is_admin());

-- Create function to log admin access attempts
CREATE OR REPLACE FUNCTION public.log_admin_access(
  p_action text,
  p_resource text,
  p_user_id uuid DEFAULT auth.uid(),
  p_success boolean DEFAULT true,
  p_error_message text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.security_audit_log (
    user_id,
    action,
    resource,
    success,
    error_message
  ) VALUES (
    p_user_id,
    p_action,
    p_resource,
    p_success,
    p_error_message
  );
END;
$function$;
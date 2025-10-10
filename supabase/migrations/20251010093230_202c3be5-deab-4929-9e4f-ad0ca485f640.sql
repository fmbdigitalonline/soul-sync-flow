-- Fix CONVERSATION_INSIGHTS_UNRESTRICTED security vulnerability
-- Remove the overly permissive INSERT policy that allows anyone to insert insights

-- Drop the insecure policy
DROP POLICY IF EXISTS "System can insert insights" ON conversation_insights;

-- Edge functions use the service role key which bypasses RLS automatically
-- Therefore, no INSERT policy is needed - only service role can insert
-- Regular users will only be able to SELECT their own insights (existing policy)

-- Add a comment documenting the security model
COMMENT ON TABLE conversation_insights IS 'Insights are generated exclusively by edge functions using service role. Users can only read their own insights via the existing SELECT policy.';
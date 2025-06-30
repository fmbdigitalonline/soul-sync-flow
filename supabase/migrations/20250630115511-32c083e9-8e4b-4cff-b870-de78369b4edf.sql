
-- Add versioning columns to support rollback
ALTER TABLE user_session_memory 
ADD COLUMN IF NOT EXISTS vector_version TEXT DEFAULT '1.0.0',
ADD COLUMN IF NOT EXISTS acs_version TEXT DEFAULT '1.0.0';

-- Add index for efficient version-based queries
CREATE INDEX IF NOT EXISTS idx_user_session_memory_versions 
ON user_session_memory(user_id, vector_version, acs_version);

-- Add ACS intervention logging table
CREATE TABLE IF NOT EXISTS acs_intervention_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  session_id TEXT NOT NULL,
  intervention_type TEXT NOT NULL,
  from_state TEXT NOT NULL,
  to_state TEXT NOT NULL,
  trigger_reason TEXT NOT NULL,
  intervention_data JSONB DEFAULT '{}',
  suppressed_until_turn INTEGER,
  success BOOLEAN DEFAULT true,
  error_details TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add RLS policies for intervention logs
ALTER TABLE acs_intervention_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own intervention logs" 
  ON acs_intervention_logs 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Add ACS error tracking table
CREATE TABLE IF NOT EXISTS acs_error_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  session_id TEXT NOT NULL,
  error_type TEXT NOT NULL,
  error_message TEXT NOT NULL,
  stack_trace TEXT,
  fallback_used BOOLEAN DEFAULT false,
  context_data JSONB DEFAULT '{}',
  acs_version TEXT DEFAULT '1.0.0',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add RLS for error logs (admin access only)
ALTER TABLE acs_error_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all ACS error logs" 
  ON acs_error_logs 
  FOR SELECT 
  USING (public.is_admin());

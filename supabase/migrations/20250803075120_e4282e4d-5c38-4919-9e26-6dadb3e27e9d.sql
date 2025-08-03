-- Phase 1: Create conversation_threads table for stable server-managed thread IDs
CREATE TABLE IF NOT EXISTS conversation_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  mode TEXT NOT NULL, -- e.g., 'companion', 'guide', 'blend', 'dream'
  last_activity TIMESTAMPTZ NOT NULL DEFAULT now(),
  version INTEGER NOT NULL DEFAULT 1, -- for optimistic concurrency
  status TEXT NOT NULL DEFAULT 'active', -- active/orphaned/corrupted
  context_fingerprint TEXT, -- hash of last N messages for divergence detection
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, mode, status) -- only one active thread per user+mode
);

-- Enable RLS
ALTER TABLE conversation_threads ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can manage their own conversation threads"
ON conversation_threads
FOR ALL
USING (auth.uid() = user_id);

-- Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_conversation_threads_user_mode_status 
ON conversation_threads(user_id, mode, status);

-- Create function to get or create conversation thread
CREATE OR REPLACE FUNCTION get_or_create_conversation_thread(
  p_user_id UUID,
  p_mode TEXT DEFAULT 'companion'
)
RETURNS conversation_threads
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  thread_record conversation_threads;
BEGIN
  -- Try to find existing active thread
  SELECT * INTO thread_record
  FROM conversation_threads
  WHERE user_id = p_user_id 
    AND mode = p_mode 
    AND status = 'active'
  ORDER BY last_activity DESC
  LIMIT 1;
  
  -- If no active thread exists, create one
  IF NOT FOUND THEN
    INSERT INTO conversation_threads (user_id, mode)
    VALUES (p_user_id, p_mode)
    RETURNING * INTO thread_record;
  ELSE
    -- Update last_activity for existing thread
    UPDATE conversation_threads
    SET last_activity = now(),
        updated_at = now()
    WHERE id = thread_record.id
    RETURNING * INTO thread_record;
  END IF;
  
  RETURN thread_record;
END;
$$;
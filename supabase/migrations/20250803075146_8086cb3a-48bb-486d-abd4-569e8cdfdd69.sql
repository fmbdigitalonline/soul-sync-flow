-- Fix search path for the new function we created
CREATE OR REPLACE FUNCTION get_or_create_conversation_thread(
  p_user_id UUID,
  p_mode TEXT DEFAULT 'companion'
)
RETURNS conversation_threads
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
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
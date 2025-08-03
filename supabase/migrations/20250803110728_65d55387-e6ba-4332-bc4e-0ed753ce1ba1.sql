-- Fix conversation thread function to return JSON instead of composite type
-- This ensures Edge Functions can properly access the returned data

DROP FUNCTION IF EXISTS public.get_or_create_conversation_thread(uuid, text);

CREATE OR REPLACE FUNCTION public.get_or_create_conversation_thread(
  p_user_id uuid, 
  p_mode text DEFAULT 'companion'::text
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  thread_record conversation_threads;
  result_json JSON;
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
  
  -- Convert to JSON for Edge Function compatibility
  SELECT to_json(thread_record) INTO result_json;
  
  RETURN result_json;
END;
$function$;
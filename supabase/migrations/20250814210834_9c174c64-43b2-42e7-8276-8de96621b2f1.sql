-- Phase 2: Fix All Remaining Database Function Security Issues
-- Add SET search_path TO 'public' to all remaining functions

CREATE OR REPLACE FUNCTION public.get_active_user_blueprint(user_uuid uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN (
    SELECT blueprint 
    FROM public.user_blueprints 
    WHERE user_id = user_uuid AND is_active = true 
    ORDER BY updated_at DESC 
    LIMIT 1
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_or_create_conversation_thread(p_user_id uuid, p_mode text DEFAULT 'companion'::text)
RETURNS json
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

CREATE OR REPLACE FUNCTION public.generate_blueprint_signature(blueprint_data jsonb)
RETURNS text
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
DECLARE
  signature_data JSONB;
BEGIN
  signature_data := jsonb_build_object(
    'mbti_type',        coalesce(blueprint_data->'cognition_mbti'->>'type',''),
    'hd_type',          coalesce(blueprint_data->'energy_strategy_human_design'->>'type',''),
    'hd_authority',     coalesce(blueprint_data->'energy_strategy_human_design'->>'authority',''),
    'sun_sign',         coalesce(blueprint_data->'archetype_western'->>'sun_sign',''),
    'moon_sign',        coalesce(blueprint_data->'archetype_western'->>'moon_sign',''),
    'life_path',        coalesce(blueprint_data->'values_life_path'->>'lifePathNumber',''),
    'user_name',        coalesce(blueprint_data->'user_meta'->>'preferred_name','')
  );

  RETURN encode(digest(signature_data::text, 'sha256'), 'hex');
END;
$function$;

CREATE OR REPLACE FUNCTION public.search_similar_messages(query_embedding vector, user_id_param uuid, max_results integer DEFAULT 10, similarity_threshold real DEFAULT 0.7)
RETURNS TABLE(content text, message_role text, created_at timestamp with time zone, session_id text, agent_mode text, similarity real)
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT 
    me.content,
    me.message_role,
    me.created_at,
    me.session_id,
    me.agent_mode,
    1 - (me.embedding <=> query_embedding) as similarity
  FROM message_embeddings me
  WHERE 
    me.user_id = user_id_param
    AND (1 - (me.embedding <=> query_embedding)) >= similarity_threshold
  ORDER BY me.embedding <=> query_embedding
  LIMIT max_results;
$function$;

CREATE OR REPLACE FUNCTION public.match_blueprint_chunks(query_embedding vector, query_user_id uuid, match_threshold double precision DEFAULT 0.3, match_count integer DEFAULT 5)
RETURNS TABLE(id uuid, chunk_content text, similarity double precision)
LANGUAGE sql
STABLE
SET search_path TO 'public'
AS $function$
  SELECT 
    id,
    chunk_content,
    1 - (embedding <=> query_embedding) AS similarity
  FROM public.blueprint_text_embeddings
  WHERE user_id = query_user_id
    AND 1 - (embedding <=> query_embedding) > match_threshold
  ORDER BY embedding <=> query_embedding
  LIMIT match_count;
$function$;
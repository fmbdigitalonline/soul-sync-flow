-- Phase 2 Continued: Fix remaining search path vulnerabilities
-- Add SET search_path TO 'public' to all remaining SECURITY DEFINER functions

CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.user_profiles (user_id, display_name)
  VALUES (
    new.id, 
    COALESCE(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name',
      split_part(new.email, '@', 1)
    )
  );
  
  INSERT INTO public.user_statistics (user_id)
  VALUES (new.id);
  
  RETURN new;
END;
$function$;

CREATE OR REPLACE FUNCTION public.ensure_user_journeys()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Create productivity journey record if it doesn't exist
  INSERT INTO public.productivity_journey (user_id)
  SELECT NEW.id
  WHERE NOT EXISTS (
    SELECT 1 FROM public.productivity_journey WHERE user_id = NEW.id
  );
  
  -- Create growth journey record if it doesn't exist
  INSERT INTO public.growth_journey (user_id)
  SELECT NEW.id
  WHERE NOT EXISTS (
    SELECT 1 FROM public.growth_journey WHERE user_id = NEW.id
  );
  
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.trigger_persona_regeneration()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Delete existing persona to force regeneration
  DELETE FROM public.personas WHERE user_id = NEW.user_id;
  
  -- Log the regeneration trigger
  INSERT INTO public.user_activities (user_id, activity_type, activity_data)
  VALUES (
    NEW.user_id,
    'persona_regeneration_triggered',
    jsonb_build_object(
      'trigger_reason', 'blueprint_updated',
      'blueprint_id', NEW.id,
      'timestamp', now()
    )
  );
  
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.cleanup_expired_hot_memory()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  DELETE FROM public.hot_memory_cache 
  WHERE expires_at < now();
END;
$function$;

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

CREATE OR REPLACE FUNCTION public.cleanup_old_memories()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Delete memories older than 6 months with importance < 5
  DELETE FROM public.user_session_memory 
  WHERE created_at < NOW() - INTERVAL '6 months' 
    AND importance_score < 5;
    
  -- Delete memories older than 1 year with importance < 7
  DELETE FROM public.user_session_memory 
  WHERE created_at < NOW() - INTERVAL '1 year' 
    AND importance_score < 7;
END;
$function$;

CREATE OR REPLACE FUNCTION public.initialize_user_intelligence()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO hacs_intelligence (
    id,
    user_id, 
    intelligence_level, 
    interaction_count,
    last_update,
    module_scores,
    pie_score,
    tmg_score,
    vfp_score,
    created_at,
    updated_at
  ) VALUES (
    gen_random_uuid(),
    NEW.id,
    50, -- starting intelligence level
    0,
    NOW(),
    '{}',
    NULL,
    NULL,
    NULL,
    NOW(),
    NOW()
  ) ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.trigger_blueprint_facts_extraction()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Only trigger for active blueprints
  IF NEW.is_active = true THEN
    -- Log the trigger activation
    INSERT INTO public.user_activities (user_id, activity_type, activity_data)
    VALUES (
      NEW.user_id,
      'blueprint_facts_extraction_triggered',
      jsonb_build_object(
        'blueprint_id', NEW.id,
        'trigger_reason', TG_OP,
        'timestamp', now()
      )
    );
    
    -- Note: The actual ETL function invocation will be handled by the application layer
    -- This trigger serves as a notification mechanism
  END IF;
  
  RETURN NEW;
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

-- Fix remaining functions that need search path
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
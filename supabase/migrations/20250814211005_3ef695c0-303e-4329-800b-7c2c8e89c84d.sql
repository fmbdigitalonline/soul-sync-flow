-- Phase 3: Fix All Remaining Trigger Functions and Other Missing Functions
-- Add SET search_path TO 'public' to all remaining functions

CREATE OR REPLACE FUNCTION public.update_conversation_activity()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
  NEW.last_activity = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_hacs_intelligence_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_hot_memory_access()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
  NEW.access_count = OLD.access_count + 1;
  NEW.last_accessed = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_user_360_profiles_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_user_statistics()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
  -- Update statistics based on activity type
  IF NEW.activity_type = 'task_completed' THEN
    UPDATE public.user_statistics 
    SET 
      tasks_completed = tasks_completed + 1,
      total_points = total_points + NEW.points_earned,
      updated_at = now()
    WHERE user_id = NEW.user_id;
    
  ELSIF NEW.activity_type = 'focus_session' THEN
    UPDATE public.user_statistics 
    SET 
      focus_sessions_completed = focus_sessions_completed + 1,
      total_points = total_points + NEW.points_earned,
      updated_at = now()
    WHERE user_id = NEW.user_id;
    
  ELSIF NEW.activity_type = 'coach_conversation' THEN
    UPDATE public.user_statistics 
    SET 
      coach_conversations = coach_conversations + 1,
      total_points = total_points + NEW.points_earned,
      updated_at = now()
    WHERE user_id = NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_waitlist_counts()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
  -- Update the taken_spots count
  UPDATE public.waitlist_spots 
  SET 
    taken_spots = LEAST(taken_spots + 1, total_spots),
    recent_joins = (
      SELECT GREATEST(
        -- Count of entries in the last 24 hours (with minimum value of 89)
        89,
        COUNT(*)::integer
      )
      FROM public.waitlist_entries
      WHERE created_at > NOW() - INTERVAL '24 hours'
    ),
    updated_at = now()
  WHERE id = (SELECT id FROM public.waitlist_spots LIMIT 1);
  
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_waitlist_spots()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
  -- Update waitlist spots with actual count from entries
  UPDATE public.waitlist_spots 
  SET 
    taken_spots = (SELECT COUNT(*) FROM public.waitlist_entries),
    updated_at = now()
  WHERE id = (SELECT id FROM public.waitlist_spots LIMIT 1);
  RETURN NEW;
END;
$function$;
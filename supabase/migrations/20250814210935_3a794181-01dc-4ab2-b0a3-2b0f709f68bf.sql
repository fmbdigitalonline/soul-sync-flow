-- Phase 4: Fix The Last Remaining Functions
-- Let me fix the remaining functions that still need search_path

CREATE OR REPLACE FUNCTION public.update_assessment_version()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
  -- Increment version when significant changes occur
  IF OLD.current_score != NEW.current_score OR OLD.desired_score != NEW.desired_score THEN
    NEW.assessment_version = OLD.assessment_version + 1;
  END IF;
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_blueprint_facts_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.increment_waitlist_spots()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
    -- Update the taken_spots count
    UPDATE public.waitlist_spots 
    SET taken_spots = LEAST(taken_spots + 1, total_spots),
        updated_at = now()
    WHERE id = (SELECT id FROM public.waitlist_spots LIMIT 1);
    RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.check_waitlist_rate_limit()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
DECLARE
  recent_entries INTEGER;
BEGIN
  -- Count submissions from the same IP in the last hour
  SELECT COUNT(*) INTO recent_entries
  FROM public.waitlist_entries
  WHERE source = NEW.source
    AND created_at > NOW() - INTERVAL '1 hour';
  
  -- Limit to 5 submissions per hour from same source
  IF recent_entries >= 5 THEN
    RAISE EXCEPTION 'Rate limit exceeded for waitlist submissions';
  END IF;
  
  RETURN NEW;
END;
$function$;
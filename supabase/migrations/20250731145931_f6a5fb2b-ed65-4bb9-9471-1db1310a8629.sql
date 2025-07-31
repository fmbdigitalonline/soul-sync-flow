-- Create database trigger to automatically invoke blueprint-facts-etl when blueprints are created or updated
CREATE OR REPLACE FUNCTION public.trigger_blueprint_facts_extraction()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on user_blueprints table
DROP TRIGGER IF EXISTS blueprint_facts_extraction_trigger ON public.user_blueprints;
CREATE TRIGGER blueprint_facts_extraction_trigger
  AFTER INSERT OR UPDATE ON public.user_blueprints
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_blueprint_facts_extraction();

-- Create index for better performance on blueprint_facts queries
CREATE INDEX IF NOT EXISTS idx_blueprint_facts_user_facet ON public.blueprint_facts (user_id, facet);
CREATE INDEX IF NOT EXISTS idx_blueprint_facts_facet_key ON public.blueprint_facts (facet, key);

-- Add constraint to ensure unique facts per user
ALTER TABLE public.blueprint_facts DROP CONSTRAINT IF EXISTS unique_user_facet_key;
ALTER TABLE public.blueprint_facts ADD CONSTRAINT unique_user_facet_key UNIQUE (user_id, facet, key);
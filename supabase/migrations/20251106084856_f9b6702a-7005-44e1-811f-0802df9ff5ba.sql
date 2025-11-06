-- Function to automatically set goal_id for task_working_instructions
CREATE OR REPLACE FUNCTION auto_populate_goal_id_for_working_instructions()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  found_goal_id TEXT;
  goal_record RECORD;
  task_record JSONB;
BEGIN
  -- Only populate if goal_id is NULL or empty
  IF NEW.goal_id IS NULL OR NEW.goal_id = '' THEN
    -- Find the goal that contains this task
    FOR goal_record IN
      SELECT 
        goal->>'id' as goal_id,
        goal->'tasks' as tasks
      FROM productivity_journey pj,
      jsonb_array_elements(pj.current_goals) as goal
      WHERE pj.user_id = NEW.user_id
    LOOP
      -- Check if this goal contains the task
      FOR task_record IN SELECT * FROM jsonb_array_elements(goal_record.tasks)
      LOOP
        IF task_record->>'id' = NEW.task_id THEN
          found_goal_id := goal_record.goal_id;
          EXIT;
        END IF;
      END LOOP;
      
      EXIT WHEN found_goal_id IS NOT NULL;
    END LOOP;
    
    -- Set the goal_id
    IF found_goal_id IS NOT NULL THEN
      NEW.goal_id := found_goal_id;
      RAISE NOTICE 'Auto-populated goal_id % for task %', found_goal_id, NEW.task_id;
    ELSE
      -- If no goal found, set to orphaned marker
      NEW.goal_id := 'orphaned_' || NEW.task_id;
      RAISE WARNING 'No goal found for task %, marked as orphaned', NEW.task_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for task_working_instructions
DROP TRIGGER IF EXISTS trigger_auto_populate_goal_id ON task_working_instructions;

CREATE TRIGGER trigger_auto_populate_goal_id
  BEFORE INSERT ON task_working_instructions
  FOR EACH ROW
  EXECUTE FUNCTION auto_populate_goal_id_for_working_instructions();

COMMENT ON FUNCTION auto_populate_goal_id_for_working_instructions() IS 
  'Automatically populates goal_id for task_working_instructions by matching task_id with productivity_journey.current_goals';

COMMENT ON TRIGGER trigger_auto_populate_goal_id ON task_working_instructions IS
  'Ensures data integrity by auto-populating goal_id before insert';
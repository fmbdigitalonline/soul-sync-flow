-- Backfill goal_id for existing task_working_instructions
-- This matches task_id with goals from productivity_journey.current_goals

DO $$
DECLARE
  instruction_record RECORD;
  goal_record RECORD;
  task_record JSONB;
  found_goal_id TEXT;
BEGIN
  -- Iterate through all task_working_instructions with NULL goal_id
  FOR instruction_record IN 
    SELECT DISTINCT user_id, task_id 
    FROM task_working_instructions 
    WHERE goal_id IS NULL
  LOOP
    found_goal_id := NULL;
    
    -- Find the goal that contains this task
    FOR goal_record IN
      SELECT 
        goal->>'id' as goal_id,
        goal->'tasks' as tasks
      FROM productivity_journey pj,
      jsonb_array_elements(pj.current_goals) as goal
      WHERE pj.user_id = instruction_record.user_id
    LOOP
      -- Check if this goal contains the task
      FOR task_record IN SELECT * FROM jsonb_array_elements(goal_record.tasks)
      LOOP
        IF task_record->>'id' = instruction_record.task_id THEN
          found_goal_id := goal_record.goal_id;
          EXIT;
        END IF;
      END LOOP;
      
      EXIT WHEN found_goal_id IS NOT NULL;
    END LOOP;
    
    -- Update the working instructions with the found goal_id
    IF found_goal_id IS NOT NULL THEN
      UPDATE task_working_instructions
      SET goal_id = found_goal_id
      WHERE user_id = instruction_record.user_id
        AND task_id = instruction_record.task_id
        AND goal_id IS NULL;
      
      RAISE NOTICE 'Updated task % with goal_id %', instruction_record.task_id, found_goal_id;
    ELSE
      RAISE NOTICE 'No goal found for task %, setting to "orphaned"', instruction_record.task_id;
      
      -- Set orphaned tasks to a special marker
      UPDATE task_working_instructions
      SET goal_id = 'orphaned_' || task_id
      WHERE user_id = instruction_record.user_id
        AND task_id = instruction_record.task_id
        AND goal_id IS NULL;
    END IF;
  END LOOP;
END $$;
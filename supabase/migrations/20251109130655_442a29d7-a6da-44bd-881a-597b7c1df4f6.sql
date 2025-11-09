-- Add unique constraint to prevent duplicate task instructions
-- This will prevent the same instruction from being saved multiple times for the same task
-- and will surface bugs immediately if task_id is incorrect

ALTER TABLE task_working_instructions
ADD CONSTRAINT unique_task_instructions 
UNIQUE (user_id, goal_id, task_id, instruction_id);

-- Add index for faster lookups by task
CREATE INDEX IF NOT EXISTS idx_task_working_instructions_task 
ON task_working_instructions(user_id, goal_id, task_id);

-- Add index for faster lookups by goal
CREATE INDEX IF NOT EXISTS idx_task_working_instructions_goal 
ON task_working_instructions(user_id, goal_id);
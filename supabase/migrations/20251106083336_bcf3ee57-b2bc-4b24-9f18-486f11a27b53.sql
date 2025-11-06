-- Add goal_id column to task_working_instructions table
ALTER TABLE task_working_instructions 
ADD COLUMN goal_id TEXT;

-- Update the unique constraint to include goal_id
ALTER TABLE task_working_instructions
DROP CONSTRAINT IF EXISTS task_working_instructions_user_id_task_id_instruction_id_key;

ALTER TABLE task_working_instructions
ADD CONSTRAINT task_working_instructions_unique 
UNIQUE (user_id, goal_id, task_id, instruction_id);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_task_working_instructions_goal_task 
ON task_working_instructions(user_id, goal_id, task_id);
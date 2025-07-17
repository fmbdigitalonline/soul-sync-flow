-- Add steward introduction completion tracking to blueprints table
ALTER TABLE blueprints 
ADD COLUMN steward_introduction_completed BOOLEAN DEFAULT FALSE;
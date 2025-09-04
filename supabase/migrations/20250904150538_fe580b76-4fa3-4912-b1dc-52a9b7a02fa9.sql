-- Add relay race tracking fields to hermetic_processing_jobs
ALTER TABLE hermetic_processing_jobs 
ADD COLUMN IF NOT EXISTS current_stage text DEFAULT 'system_translation',
ADD COLUMN IF NOT EXISTS current_step_index integer DEFAULT 0;

-- Update existing jobs to have proper stage tracking
UPDATE hermetic_processing_jobs 
SET current_stage = 'system_translation', current_step_index = 0 
WHERE current_stage IS NULL;
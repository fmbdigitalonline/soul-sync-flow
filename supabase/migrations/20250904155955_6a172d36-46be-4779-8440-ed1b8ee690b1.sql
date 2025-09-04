-- Add missing columns to hermetic_processing_jobs table
-- Following Principle #1: Never Break Functionality (additive only)
-- Following Principle #2: No Hardcoded Data (real dynamic data)

ALTER TABLE hermetic_processing_jobs 
ADD COLUMN IF NOT EXISTS blueprint_data jsonb DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS status_message text DEFAULT NULL;

-- Add helpful comment for transparency (Principle #7)
COMMENT ON COLUMN hermetic_processing_jobs.blueprint_data IS 'User blueprint data passed to job for processing';
COMMENT ON COLUMN hermetic_processing_jobs.status_message IS 'Human-readable status message for job progress';
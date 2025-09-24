-- Add missing language column to hermetic_processing_jobs table
ALTER TABLE hermetic_processing_jobs 
ADD COLUMN language text NOT NULL DEFAULT 'en';
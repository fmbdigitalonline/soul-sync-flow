-- Phase 1: Database Integrity Repair for HACS Intelligence System
-- Step 1: Create backup and clean duplicate data

-- First, let's see the current state and create a safe backup
CREATE TABLE hacs_intelligence_backup AS 
SELECT * FROM hacs_intelligence;

-- Create a clean table with consolidated data (keeping highest intelligence_level per user)
CREATE TABLE hacs_intelligence_clean AS
WITH consolidated_intelligence AS (
  SELECT DISTINCT ON (user_id)
    gen_random_uuid() as id,
    user_id,
    intelligence_level,
    interaction_count,
    last_update,
    module_scores,
    pie_score,
    tmg_score,
    vfp_score,
    created_at,
    updated_at
  FROM hacs_intelligence 
  ORDER BY user_id, intelligence_level DESC, updated_at DESC
)
SELECT * FROM consolidated_intelligence;

-- Step 2: Add proper constraints to prevent future duplicates
ALTER TABLE hacs_intelligence_clean 
ADD CONSTRAINT hacs_intelligence_clean_pkey PRIMARY KEY (id);

ALTER TABLE hacs_intelligence_clean 
ADD CONSTRAINT hacs_intelligence_clean_user_id_unique UNIQUE (user_id);

-- Add data integrity constraints
ALTER TABLE hacs_intelligence_clean 
ADD CONSTRAINT intelligence_level_range CHECK (intelligence_level >= 0 AND intelligence_level <= 100);

-- Fix the decimal/integer issue seen in logs
ALTER TABLE hacs_intelligence_clean 
ALTER COLUMN intelligence_level TYPE INTEGER USING ROUND(intelligence_level::numeric);

-- Step 3: Atomic data migration (replace corrupted table with clean one)
BEGIN;

-- Rename current corrupted table
ALTER TABLE hacs_intelligence RENAME TO hacs_intelligence_corrupted;

-- Rename clean table to active
ALTER TABLE hacs_intelligence_clean RENAME TO hacs_intelligence;

-- Verify no duplicates remain
DO $$
DECLARE 
    duplicate_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO duplicate_count
    FROM (
        SELECT user_id, COUNT(*) as row_count 
        FROM hacs_intelligence 
        GROUP BY user_id 
        HAVING COUNT(*) > 1
    ) duplicates;
    
    IF duplicate_count > 0 THEN
        RAISE EXCEPTION 'Migration failed: % duplicate user_id records still exist', duplicate_count;
    END IF;
    
    RAISE NOTICE 'Migration successful: No duplicate user_id records found';
END $$;

COMMIT;
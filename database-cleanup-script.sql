-- ============================================================================
-- DATABASE CLEANUP SCRIPT: Fix Working Instructions Task ID Mismatch
-- ============================================================================
-- 
-- PURPOSE: Clean up corrupted task_working_instructions data where 217 
--          instructions were incorrectly saved with task_id="task_1_1"
--
-- IMPORTANT: Review this script carefully before running!
--            Backup your data first!
--
-- ============================================================================

-- STEP 1: Inspect the corrupted data
-- Run this first to understand the extent of the problem
SELECT 
  goal_id,
  task_id,
  COUNT(*) as instruction_count,
  STRING_AGG(DISTINCT title, ', ') as instruction_titles
FROM task_working_instructions
WHERE task_id = 'task_1_1'
GROUP BY goal_id, task_id
ORDER BY goal_id;

-- STEP 2: See which goals are affected
SELECT DISTINCT 
  goal_id,
  COUNT(*) as instructions_in_this_goal
FROM task_working_instructions
WHERE task_id = 'task_1_1'
GROUP BY goal_id;

-- ============================================================================
-- CLEANUP OPTIONS
-- ============================================================================

-- OPTION 1: DELETE ALL CORRUPTED INSTRUCTIONS (Nuclear Option)
-- ⚠️ WARNING: This will delete ALL 217 instructions with task_id='task_1_1'
-- Users will need to regenerate working instructions from scratch
-- 
-- Uncomment to run:
-- DELETE FROM task_working_instructions WHERE task_id = 'task_1_1';

-- ============================================================================

-- OPTION 2: KEEP ONLY MOST RECENT INSTRUCTIONS PER GOAL
-- ⚠️ WARNING: This assumes the most recent instructions are correct
-- Older instructions will be permanently deleted
--
-- Uncomment to run:
-- WITH ranked_instructions AS (
--   SELECT 
--     id,
--     ROW_NUMBER() OVER (
--       PARTITION BY user_id, goal_id 
--       ORDER BY created_at DESC
--     ) as rn
--   FROM task_working_instructions
--   WHERE task_id = 'task_1_1'
-- )
-- DELETE FROM task_working_instructions
-- WHERE id IN (
--   SELECT id FROM ranked_instructions WHERE rn > 10
-- );

-- ============================================================================

-- OPTION 3: MARK CORRUPTED INSTRUCTIONS FOR MANUAL REVIEW
-- Creates a backup table and marks problematic instructions
-- ⚠️ RECOMMENDED: Safest option - allows manual review before deletion
--
-- Uncomment to run:
-- 
-- -- Create backup table
-- CREATE TABLE IF NOT EXISTS task_working_instructions_backup AS
-- SELECT * FROM task_working_instructions WHERE task_id = 'task_1_1';
-- 
-- -- Add a note column to track the issue
-- ALTER TABLE task_working_instructions_backup 
-- ADD COLUMN IF NOT EXISTS cleanup_note TEXT DEFAULT 'Corrupted task_id - needs manual review';
-- 
-- -- After backing up, delete from main table
-- DELETE FROM task_working_instructions WHERE task_id = 'task_1_1';

-- ============================================================================

-- STEP 3: VERIFICATION QUERIES (Run after cleanup)
-- ============================================================================

-- Check if cleanup was successful
SELECT COUNT(*) as remaining_corrupted_instructions
FROM task_working_instructions
WHERE task_id = 'task_1_1';

-- Verify no duplicate instructions exist
SELECT 
  user_id,
  goal_id,
  task_id,
  instruction_id,
  COUNT(*) as duplicate_count
FROM task_working_instructions
GROUP BY user_id, goal_id, task_id, instruction_id
HAVING COUNT(*) > 1;

-- Check total instructions per task
SELECT 
  goal_id,
  task_id,
  COUNT(*) as instruction_count
FROM task_working_instructions
GROUP BY goal_id, task_id
ORDER BY goal_id, task_id;

-- ============================================================================
-- NOTES
-- ============================================================================
-- 
-- 1. The unique constraint added in the migration will PREVENT this issue
--    from happening again
-- 
-- 2. The new validation in working-instructions-persistence-service.ts will
--    throw an error if task_id is invalid
--
-- 3. The component key prop forces remounting when tasks change, ensuring
--    the correct task context is always used
--
-- 4. Defensive logging will help diagnose any future issues before they
--    corrupt data
--
-- ============================================================================

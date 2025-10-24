-- Fix: Restrict access to memory_writeback_queue table (internal system operations only)
-- This table contains sensitive system operation data and should not be publicly accessible

-- Enable RLS on the table
ALTER TABLE public.memory_writeback_queue ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies that allow public access
DROP POLICY IF EXISTS "Enable read access for all users" ON public.memory_writeback_queue;
DROP POLICY IF EXISTS "Enable insert access for all users" ON public.memory_writeback_queue;
DROP POLICY IF EXISTS "Enable update access for all users" ON public.memory_writeback_queue;
DROP POLICY IF EXISTS "Enable delete access for all users" ON public.memory_writeback_queue;
DROP POLICY IF EXISTS "Allow public read access" ON public.memory_writeback_queue;
DROP POLICY IF EXISTS "Allow public insert access" ON public.memory_writeback_queue;

-- No policies are created - only service role should access this table
-- Service role automatically bypasses RLS, which is the correct behavior for internal system tables
-- Add missing summary_type column to conversation_summaries table
ALTER TABLE public.conversation_summaries 
ADD COLUMN IF NOT EXISTS summary_type TEXT DEFAULT 'general';

-- Add unique constraint to conversation_memory for proper upsert operations
ALTER TABLE public.conversation_memory 
ADD CONSTRAINT unique_conversation_memory_session_user 
UNIQUE (session_id, user_id);

-- Add unique constraint to conversation_summaries for proper upsert operations  
ALTER TABLE public.conversation_summaries
ADD CONSTRAINT unique_conversation_summaries_thread_user_type
UNIQUE (thread_id, user_id, summary_type);
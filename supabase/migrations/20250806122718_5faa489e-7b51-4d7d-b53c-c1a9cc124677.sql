-- Remove duplicate unique constraint causing 409 conflicts
ALTER TABLE public.conversation_memory 
DROP CONSTRAINT IF EXISTS unique_user_session;

-- Keep the canonical constraint for proper upserts
-- unique_conversation_memory_session_user already exists from previous migration
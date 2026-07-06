ALTER TABLE public.conversation_messages
  ADD COLUMN IF NOT EXISTS attachments JSONB DEFAULT NULL;
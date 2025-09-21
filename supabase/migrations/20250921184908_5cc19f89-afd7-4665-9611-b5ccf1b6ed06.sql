-- Step 7: Create conversation_messages table for optimistic message handling (retry)
CREATE TABLE IF NOT EXISTS public.conversation_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id TEXT NOT NULL,
  client_msg_id UUID NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'hacs', 'assistant')),
  content TEXT NOT NULL,
  status TEXT DEFAULT 'sent' CHECK (status IN ('sending', 'sent', 'error')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  correlation_id UUID,
  pipeline_id TEXT,
  step_seq INTEGER
);

-- Enable RLS
ALTER TABLE public.conversation_messages ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own messages" ON public.conversation_messages FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own messages" ON public.conversation_messages FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own messages" ON public.conversation_messages FOR UPDATE USING (auth.uid() = user_id);

-- Create unique constraints separately to avoid deadlock
ALTER TABLE public.conversation_messages ADD CONSTRAINT unique_user_message_per_conversation UNIQUE (conversation_id, client_msg_id);

-- Create indexes
CREATE INDEX idx_conversation_messages_client_msg_id ON public.conversation_messages(client_msg_id);
CREATE INDEX idx_conversation_messages_session_id ON public.conversation_messages(session_id);

-- Create update trigger
CREATE TRIGGER update_conversation_messages_updated_at
  BEFORE UPDATE ON public.conversation_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
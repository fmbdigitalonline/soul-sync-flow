-- Step 7: Create conversation_messages table (simplified approach)
DROP TABLE IF EXISTS public.conversation_messages;

CREATE TABLE public.conversation_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id TEXT NOT NULL,
  client_msg_id UUID NOT NULL,
  user_id UUID NOT NULL,
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

-- Add foreign key reference to auth users
ALTER TABLE public.conversation_messages 
ADD CONSTRAINT conversation_messages_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Enable RLS
ALTER TABLE public.conversation_messages ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own messages" 
ON public.conversation_messages 
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own messages" 
ON public.conversation_messages 
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own messages" 
ON public.conversation_messages 
FOR UPDATE USING (auth.uid() = user_id);

-- Add unique constraint for idempotency
ALTER TABLE public.conversation_messages 
ADD CONSTRAINT unique_user_message_per_conversation 
UNIQUE (conversation_id, client_msg_id);

-- Create indexes for performance
CREATE INDEX idx_conversation_messages_client_msg_id ON public.conversation_messages(client_msg_id);
CREATE INDEX idx_conversation_messages_session_id ON public.conversation_messages(session_id);
CREATE INDEX idx_conversation_messages_user_id ON public.conversation_messages(user_id);
CREATE INDEX idx_conversation_messages_created_at ON public.conversation_messages(created_at);

-- Create update trigger
CREATE TRIGGER update_conversation_messages_updated_at
  BEFORE UPDATE ON public.conversation_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
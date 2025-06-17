
-- Enable RLS on conversation_memory table
ALTER TABLE conversation_memory ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own conversation memory
CREATE POLICY "Users can read own conversation memory" ON conversation_memory
    FOR SELECT USING (auth.uid() = user_id);

-- Allow users to insert their own conversation memory
CREATE POLICY "Users can insert own conversation memory" ON conversation_memory
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own conversation memory
CREATE POLICY "Users can update own conversation memory" ON conversation_memory
    FOR UPDATE USING (auth.uid() = user_id);

-- Allow users to delete their own conversation memory
CREATE POLICY "Users can delete own conversation memory" ON conversation_memory
    FOR DELETE USING (auth.uid() = user_id);

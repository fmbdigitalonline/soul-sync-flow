
-- Enable RLS on personas table
ALTER TABLE personas ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own personas
CREATE POLICY "Users can read own personas" ON personas
    FOR SELECT USING (auth.uid() = user_id);

-- Allow users to insert their own personas
CREATE POLICY "Users can insert own personas" ON personas
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own personas
CREATE POLICY "Users can update own personas" ON personas
    FOR UPDATE USING (auth.uid() = user_id);

-- Allow users to delete their own personas
CREATE POLICY "Users can delete own personas" ON personas
    FOR DELETE USING (auth.uid() = user_id);

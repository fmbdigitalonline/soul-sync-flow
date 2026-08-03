GRANT SELECT, INSERT ON public.conversation_state_tracking TO authenticated;
GRANT ALL ON public.conversation_state_tracking TO service_role;
CREATE POLICY "Users can insert own state tracking"
ON public.conversation_state_tracking
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);
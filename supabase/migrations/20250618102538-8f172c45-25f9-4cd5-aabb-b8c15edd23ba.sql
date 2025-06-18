
-- Drop the old unique constraint that only allows one persona per user
ALTER TABLE public.personas DROP CONSTRAINT IF EXISTS personas_user_id_key;

-- Ensure the composite unique constraint exists (should already be there from migration)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'personas_signature_unique' 
    AND table_name = 'personas'
  ) THEN
    ALTER TABLE public.personas 
    ADD CONSTRAINT personas_signature_unique UNIQUE(user_id, blueprint_signature);
  END IF;
END $$;

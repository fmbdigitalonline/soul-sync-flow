
-- SoulSync Blueprint → Persona Reliability Upgrade
-- Drop legacy single-column unique key and clean up incomplete personas

-- 1.1 Drop legacy single-column unique key
ALTER TABLE public.personas
DROP CONSTRAINT IF EXISTS personas_user_id_key;

-- 1.2 Create/keep composite uniqueness
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'personas_user_sig_unique' 
    AND table_name = 'personas'
  ) THEN
    ALTER TABLE public.personas
    ADD CONSTRAINT personas_user_sig_unique
    UNIQUE (user_id, blueprint_signature);
  END IF;
END $$;

-- 1.3 Clean-up: remove rows with empty prompts/signatures
DELETE FROM public.personas
WHERE blueprint_signature IS NULL
   OR length(system_prompt) < 1500;

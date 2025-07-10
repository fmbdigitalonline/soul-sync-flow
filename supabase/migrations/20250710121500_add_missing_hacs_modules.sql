
-- Add the missing HACS module columns to hacs_intelligence table
ALTER TABLE public.hacs_intelligence 
ADD COLUMN IF NOT EXISTS pie_score integer DEFAULT 10 NOT NULL,
ADD COLUMN IF NOT EXISTS vfp_score integer DEFAULT 10 NOT NULL,
ADD COLUMN IF NOT EXISTS tmg_score integer DEFAULT 10 NOT NULL;

-- Update existing records to have the new columns with default values
UPDATE public.hacs_intelligence 
SET 
  pie_score = 10,
  vfp_score = 10,
  tmg_score = 10
WHERE pie_score IS NULL OR vfp_score IS NULL OR tmg_score IS NULL;

-- Update the trigger function to recalculate overall intelligence with all 11 modules
CREATE OR REPLACE FUNCTION public.update_hacs_intelligence_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = now();
  
  -- Recalculate overall intelligence as average of all 11 module scores
  NEW.overall_intelligence = ROUND((
    NEW.nik_score + NEW.cpsr_score + NEW.tws_score + NEW.hfme_score + 
    NEW.dpem_score + NEW.cnr_score + NEW.bpsc_score + NEW.acs_score +
    NEW.pie_score + NEW.vfp_score + NEW.tmg_score
  ) / 11.0);
  
  RETURN NEW;
END;
$function$;

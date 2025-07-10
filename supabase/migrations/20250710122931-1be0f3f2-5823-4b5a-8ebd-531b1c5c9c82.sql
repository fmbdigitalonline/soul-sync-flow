
-- Add the missing PIE, VFP, and TMG score columns to hacs_intelligence table
ALTER TABLE public.hacs_intelligence 
ADD COLUMN IF NOT EXISTS pie_score REAL DEFAULT 0,
ADD COLUMN IF NOT EXISTS vfp_score REAL DEFAULT 0,
ADD COLUMN IF NOT EXISTS tmg_score REAL DEFAULT 0;

-- Update existing records to include the new modules
UPDATE public.hacs_intelligence 
SET 
  pie_score = 0,
  vfp_score = 0,
  tmg_score = 0
WHERE pie_score IS NULL OR vfp_score IS NULL OR tmg_score IS NULL;

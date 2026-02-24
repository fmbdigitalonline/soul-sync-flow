
-- ============================================================================
-- TABLE REBUILD: Reclaim ~240 MB of bloated disk space
-- ============================================================================
-- Strategy: Copy live rows into fresh tables, drop bloated originals, rename.
-- This is the standard VACUUM FULL alternative for Supabase (no superuser).
-- ============================================================================

-- =============================================
-- STEP 1: Rebuild dream_activity_logs (~120 MB)
-- =============================================

-- 1a. Create fresh table with identical schema
CREATE TABLE public.dream_activity_logs_new (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  session_id TEXT NOT NULL,
  activity_type TEXT NOT NULL,
  activity_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  page_url TEXT,
  user_agent TEXT,
  "timestamp" TIMESTAMPTZ NOT NULL DEFAULT now(),
  correlation_id TEXT,
  error_info JSONB
);

-- 1b. Copy all live rows
INSERT INTO public.dream_activity_logs_new
SELECT * FROM public.dream_activity_logs;

-- 1c. Drop bloated original
DROP TABLE public.dream_activity_logs;

-- 1d. Rename new table
ALTER TABLE public.dream_activity_logs_new RENAME TO dream_activity_logs;

-- 1e. Recreate primary key
ALTER TABLE public.dream_activity_logs ADD CONSTRAINT dream_activity_logs_pkey PRIMARY KEY (id);

-- 1f. Recreate FK to auth.users
ALTER TABLE public.dream_activity_logs
  ADD CONSTRAINT dream_activity_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);

-- 1g. Recreate indexes
CREATE INDEX idx_dream_activity_logs_user_session ON public.dream_activity_logs USING btree (user_id, session_id);
CREATE INDEX idx_dream_activity_logs_timestamp ON public.dream_activity_logs USING btree ("timestamp" DESC);

-- 1h. Enable RLS
ALTER TABLE public.dream_activity_logs ENABLE ROW LEVEL SECURITY;

-- 1i. Recreate RLS policies
CREATE POLICY "Users can view their own dream activity logs"
  ON public.dream_activity_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own dream activity logs"
  ON public.dream_activity_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- =============================================
-- STEP 2: Rebuild user_360_profiles (~117 MB)
-- =============================================

-- 2a. Create fresh table with identical schema
CREATE TABLE public.user_360_profiles_new (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  profile_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  data_sources TEXT[] NOT NULL DEFAULT '{}'::text[],
  data_availability JSONB NOT NULL DEFAULT '{}'::jsonb,
  last_updated TIMESTAMPTZ NOT NULL DEFAULT now(),
  version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2b. Copy DEDUPLICATED rows (keep only latest per user_id)
INSERT INTO public.user_360_profiles_new
SELECT DISTINCT ON (user_id) *
FROM public.user_360_profiles
ORDER BY user_id, updated_at DESC;

-- 2c. Drop bloated original
DROP TABLE public.user_360_profiles;

-- 2d. Rename new table
ALTER TABLE public.user_360_profiles_new RENAME TO user_360_profiles;

-- 2e. Recreate primary key
ALTER TABLE public.user_360_profiles ADD CONSTRAINT user_360_profiles_pkey PRIMARY KEY (id);

-- 2f. Add UNIQUE constraint on user_id to prevent future duplicates
ALTER TABLE public.user_360_profiles ADD CONSTRAINT user_360_profiles_user_id_key UNIQUE (user_id);

-- 2g. Recreate indexes
CREATE INDEX idx_user_360_profiles_user_id ON public.user_360_profiles USING btree (user_id);
CREATE INDEX idx_user_360_profiles_last_updated ON public.user_360_profiles USING btree (last_updated);
CREATE INDEX idx_user_360_profiles_user_updated ON public.user_360_profiles USING btree (user_id, updated_at DESC);

-- 2h. Recreate trigger
CREATE TRIGGER update_user_360_profiles_updated_at
  BEFORE UPDATE ON public.user_360_profiles
  FOR EACH ROW EXECUTE FUNCTION update_user_360_profiles_updated_at();

-- 2i. Enable RLS
ALTER TABLE public.user_360_profiles ENABLE ROW LEVEL SECURITY;

-- 2j. Recreate RLS policies
CREATE POLICY "Users can view their own 360 profiles"
  ON public.user_360_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own 360 profiles"
  ON public.user_360_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own 360 profiles"
  ON public.user_360_profiles FOR UPDATE
  USING (auth.uid() = user_id);

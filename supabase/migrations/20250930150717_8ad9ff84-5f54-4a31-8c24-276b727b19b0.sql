-- ============================================================================
-- Multi-Dimensional XP Progression System - Database Foundation
-- ============================================================================

-- Core XP progress state (one row per user)
CREATE TABLE IF NOT EXISTS public.user_xp_progress (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  xp_total NUMERIC NOT NULL DEFAULT 0,
  dim_scores_ewma JSONB NOT NULL DEFAULT '{}'::JSONB,
  last_milestone_hit INTEGER NOT NULL DEFAULT 0,
  repeats_today JSONB NOT NULL DEFAULT '{}'::JSONB,
  session_xp NUMERIC NOT NULL DEFAULT 0,
  daily_xp NUMERIC NOT NULL DEFAULT 0,
  weekly_xp NUMERIC NOT NULL DEFAULT 0,
  last_adp_at TIMESTAMPTZ NULL,
  last_reset_day DATE NOT NULL DEFAULT CURRENT_DATE,
  last_reset_week INTEGER NOT NULL DEFAULT EXTRACT(WEEK FROM NOW())::INTEGER,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Lightweight append-only event log for analytics and tuning
CREATE TABLE IF NOT EXISTS public.user_xp_events (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  delta_xp NUMERIC NOT NULL,
  xp_total_after NUMERIC NOT NULL,
  dims JSONB NOT NULL,
  quality NUMERIC NOT NULL,
  kinds TEXT[] NOT NULL,
  blocked_gate TEXT NULL,
  note TEXT NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_xp_events_user_time ON public.user_xp_events (user_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_xp_progress_updated ON public.user_xp_progress (updated_at DESC);

-- Enable RLS
ALTER TABLE public.user_xp_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_xp_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_xp_progress
CREATE POLICY "Users can view their own XP progress"
  ON public.user_xp_progress
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own XP progress"
  ON public.user_xp_progress
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own XP progress"
  ON public.user_xp_progress
  FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for user_xp_events
CREATE POLICY "Users can view their own XP events"
  ON public.user_xp_events
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert XP events"
  ON public.user_xp_events
  FOR INSERT
  WITH CHECK (true);

-- Migration function: Convert existing intelligenceLevel to XP
-- Using inverse logistic: XP = 1200 + 250 * ln(p / (1-p))
CREATE OR REPLACE FUNCTION migrate_intelligence_to_xp()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  migrated_count INTEGER := 0;
  user_record RECORD;
  p NUMERIC;
  initial_xp NUMERIC;
  last_milestone INTEGER;
BEGIN
  -- Migrate from hacs_intelligence table
  FOR user_record IN 
    SELECT DISTINCT hi.user_id, hi.intelligence_level
    FROM hacs_intelligence hi
    LEFT JOIN user_xp_progress uxp ON hi.user_id = uxp.user_id
    WHERE uxp.user_id IS NULL -- Only migrate users not yet in XP system
  LOOP
    -- Clamp intelligence level to [0.05, 0.95] to avoid ±∞
    p := GREATEST(0.05, LEAST(0.95, user_record.intelligence_level / 100.0));
    
    -- Calculate initial XP using inverse logistic
    initial_xp := 1200 + 250 * LN(p / (1 - p));
    
    -- Determine last milestone hit
    last_milestone := CASE
      WHEN user_record.intelligence_level >= 100 THEN 100
      WHEN user_record.intelligence_level >= 90 THEN 90
      WHEN user_record.intelligence_level >= 80 THEN 80
      WHEN user_record.intelligence_level >= 70 THEN 70
      WHEN user_record.intelligence_level >= 60 THEN 60
      WHEN user_record.intelligence_level >= 50 THEN 50
      ELSE 0
    END;
    
    -- Insert XP progress with evenly seeded dimension scores
    INSERT INTO user_xp_progress (
      user_id,
      xp_total,
      dim_scores_ewma,
      last_milestone_hit,
      repeats_today,
      session_xp,
      daily_xp,
      weekly_xp,
      last_reset_day,
      last_reset_week,
      created_at,
      updated_at
    ) VALUES (
      user_record.user_id,
      initial_xp,
      jsonb_build_object(
        'SIP', user_record.intelligence_level,
        'CMP', user_record.intelligence_level,
        'PCP', user_record.intelligence_level,
        'HPP', user_record.intelligence_level,
        'COV', user_record.intelligence_level,
        'LVP', user_record.intelligence_level,
        'ADP', user_record.intelligence_level
      ),
      last_milestone,
      '{}'::JSONB,
      0,
      0,
      0,
      CURRENT_DATE,
      EXTRACT(WEEK FROM NOW())::INTEGER,
      NOW(),
      NOW()
    );
    
    migrated_count := migrated_count + 1;
  END LOOP;
  
  RETURN migrated_count;
END;
$$;

-- Function to update XP progress timestamps
CREATE OR REPLACE FUNCTION update_xp_progress_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Trigger to auto-update timestamps
CREATE TRIGGER trigger_update_xp_progress_timestamp
  BEFORE UPDATE ON public.user_xp_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_xp_progress_timestamp();
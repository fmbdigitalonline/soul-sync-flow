-- ============================================================================
-- PHASE 1: CRITICAL DATABASE PERSISTENCE MIGRATIONS (CORRECTED)
-- Following SoulSync Engineering Protocol (Principle #2: No Hardcoded Data)
-- ============================================================================

-- ============================================================================
-- 1. TASK INSTRUCTION PROGRESS (NEW TABLE)
-- Tracks user completion of working instructions within tasks
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.task_instruction_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  task_id TEXT NOT NULL,
  instruction_id TEXT NOT NULL,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  uncompleted_at TIMESTAMPTZ,
  is_completed BOOLEAN NOT NULL DEFAULT true,
  session_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, task_id, instruction_id)
);

ALTER TABLE public.task_instruction_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own instruction progress"
  ON public.task_instruction_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own instruction progress"
  ON public.task_instruction_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own instruction progress"
  ON public.task_instruction_progress FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own instruction progress"
  ON public.task_instruction_progress FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX idx_task_instruction_progress_user_task 
  ON public.task_instruction_progress(user_id, task_id);

CREATE INDEX idx_task_instruction_progress_completed 
  ON public.task_instruction_progress(user_id, is_completed);

CREATE TRIGGER update_task_instruction_progress_updated_at
  BEFORE UPDATE ON public.task_instruction_progress
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 2. HABITS SYSTEM (NEW TABLES)
-- Master habits table + daily completion tracking
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.habits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  frequency TEXT NOT NULL DEFAULT 'daily' CHECK (frequency IN ('daily', 'weekly')),
  target_days INTEGER NOT NULL DEFAULT 30,
  category TEXT NOT NULL DEFAULT 'wellness',
  icon TEXT,
  color TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.habit_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id UUID NOT NULL REFERENCES public.habits(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  completed_date DATE NOT NULL DEFAULT CURRENT_DATE,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(habit_id, completed_date)
);

ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habit_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own habits"
  ON public.habits FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own habits"
  ON public.habits FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own habits"
  ON public.habits FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own habits"
  ON public.habits FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own habit completions"
  ON public.habit_completions FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own habit completions"
  ON public.habit_completions FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own habit completions"
  ON public.habit_completions FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own habit completions"
  ON public.habit_completions FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_habits_user_active ON public.habits(user_id, is_active);
CREATE INDEX idx_habit_completions_user_date ON public.habit_completions(user_id, completed_date DESC);
CREATE INDEX idx_habit_completions_habit_date ON public.habit_completions(habit_id, completed_date DESC);

CREATE TRIGGER update_habits_updated_at
  BEFORE UPDATE ON public.habits
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 3. GOAL MILESTONES (NEW TABLE - user_goals already exists)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.goal_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID NOT NULL REFERENCES public.user_goals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.goal_milestones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own goal milestones"
  ON public.goal_milestones FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own goal milestones"
  ON public.goal_milestones FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own goal milestones"
  ON public.goal_milestones FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own goal milestones"
  ON public.goal_milestones FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_goal_milestones_goal ON public.goal_milestones(goal_id, order_index);
CREATE INDEX idx_goal_milestones_user_completed ON public.goal_milestones(user_id, is_completed);

CREATE TRIGGER update_goal_milestones_updated_at
  BEFORE UPDATE ON public.goal_milestones
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- HELPER FUNCTION: Calculate habit streak from completions
-- ============================================================================

CREATE OR REPLACE FUNCTION public.calculate_habit_streak(
  p_habit_id UUID,
  p_user_id UUID
)
RETURNS INTEGER
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  streak_count INTEGER := 0;
  current_check_date DATE := CURRENT_DATE;
  has_completion BOOLEAN;
BEGIN
  LOOP
    SELECT EXISTS(
      SELECT 1 FROM public.habit_completions
      WHERE habit_id = p_habit_id
        AND user_id = p_user_id
        AND completed_date = current_check_date
    ) INTO has_completion;
    
    EXIT WHEN NOT has_completion;
    
    streak_count := streak_count + 1;
    current_check_date := current_check_date - INTERVAL '1 day';
  END LOOP;
  
  RETURN streak_count;
END;
$$;
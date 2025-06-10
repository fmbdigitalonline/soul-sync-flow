
-- Create user profiles table for additional user data
CREATE TABLE public.user_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user activities table to track various user actions
CREATE TABLE public.user_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  activity_type TEXT NOT NULL, -- 'task_completed', 'focus_session', 'goal_progress', 'coach_conversation'
  activity_data JSONB NOT NULL DEFAULT '{}',
  points_earned INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user goals table for dynamic goal tracking
CREATE TABLE public.user_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
  aligned_traits JSONB DEFAULT '[]',
  milestones JSONB DEFAULT '[]',
  target_date DATE,
  category TEXT DEFAULT 'personal_growth',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user statistics table for aggregated metrics
CREATE TABLE public.user_statistics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL UNIQUE,
  tasks_completed INTEGER DEFAULT 0,
  focus_sessions_completed INTEGER DEFAULT 0,
  coach_conversations INTEGER DEFAULT 0,
  total_points INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  most_productive_day TEXT,
  preferred_focus_time TEXT,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS) policies
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_statistics ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_profiles
CREATE POLICY "Users can view their own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON public.user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS policies for user_activities
CREATE POLICY "Users can view their own activities" ON public.user_activities
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own activities" ON public.user_activities
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS policies for user_goals
CREATE POLICY "Users can view their own goals" ON public.user_goals
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own goals" ON public.user_goals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own goals" ON public.user_goals
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own goals" ON public.user_goals
  FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for user_statistics
CREATE POLICY "Users can view their own statistics" ON public.user_statistics
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own statistics" ON public.user_statistics
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own statistics" ON public.user_statistics
  FOR UPDATE USING (auth.uid() = user_id);

-- Function to automatically create user profile and statistics when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, display_name)
  VALUES (
    new.id, 
    COALESCE(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name',
      split_part(new.email, '@', 1)
    )
  );
  
  INSERT INTO public.user_statistics (user_id)
  VALUES (new.id);
  
  RETURN new;
END;
$$;

-- Trigger to automatically create profile when user signs up
CREATE TRIGGER on_auth_user_created_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_profile();

-- Function to update user statistics when activities are logged
CREATE OR REPLACE FUNCTION public.update_user_statistics()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Update statistics based on activity type
  IF NEW.activity_type = 'task_completed' THEN
    UPDATE public.user_statistics 
    SET 
      tasks_completed = tasks_completed + 1,
      total_points = total_points + NEW.points_earned,
      updated_at = now()
    WHERE user_id = NEW.user_id;
    
  ELSIF NEW.activity_type = 'focus_session' THEN
    UPDATE public.user_statistics 
    SET 
      focus_sessions_completed = focus_sessions_completed + 1,
      total_points = total_points + NEW.points_earned,
      updated_at = now()
    WHERE user_id = NEW.user_id;
    
  ELSIF NEW.activity_type = 'coach_conversation' THEN
    UPDATE public.user_statistics 
    SET 
      coach_conversations = coach_conversations + 1,
      total_points = total_points + NEW.points_earned,
      updated_at = now()
    WHERE user_id = NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger to update statistics when activities are logged
CREATE TRIGGER on_user_activity_logged
  AFTER INSERT ON public.user_activities
  FOR EACH ROW EXECUTE FUNCTION public.update_user_statistics();


export interface GrowthProgram {
  id: string;
  user_id: string;
  program_type: ProgramType;
  domain: LifeDomain;
  current_week: number;
  total_weeks: number;
  status: ProgramStatus;
  started_at: string;
  expected_completion: string;
  actual_completion?: string;
  blueprint_params: BlueprintParams;
  progress_metrics: ProgressMetrics;
  session_schedule: SessionSchedule;
  created_at: string;
  updated_at: string;
}

export type ProgramType = 'sprint' | 'standard' | 'deep_dive' | 'light_touch';

export type LifeDomain = 'career' | 'relationships' | 'finances' | 'wellbeing' | 'creativity' | 'spirituality' | 'home_family';

export type ProgramStatus = 'pending' | 'active' | 'paused' | 'completed' | 'abandoned';

export interface BlueprintParams {
  time_horizon: 'short' | 'flexible';
  support_style: number; // 1-5 scale
  primary_goal: 'exploring' | 'deep_change' | 'habit';
  user_confidence: 'low' | 'medium' | 'high';
  goal_depth: 'surface' | 'moderate' | 'profound';
  preferred_pace: 'daily' | 'three_weekly' | 'weekly';
}

export interface ProgressMetrics {
  completed_sessions: number;
  mood_entries: number;
  reflection_entries: number;
  insight_entries: number;
  micro_actions_completed: number;
  belief_shifts_tracked: number;
  excitement_ratings: number[];
  domain_progress_score: number;
}

export interface SessionSchedule {
  sessions_per_week: number;
  session_duration_minutes: number;
  reminder_frequency: 'daily' | 'weekly' | 'none';
  preferred_time?: string;
}

export interface ProgramWeek {
  week_number: number;
  theme: WeekTheme;
  focus_area: string;
  key_activities: string[];
  tools_unlocked: string[];
  completion_criteria: string[];
  is_unlocked: boolean;
  is_completed: boolean;
  completion_date?: string;
}

export type WeekTheme = 'foundation' | 'belief_excavation' | 'blueprint_activation' | 'domain_deep_dive' | 'integration' | 'graduation';

export interface GrowthSession {
  id: string;
  program_id: string;
  week_number: number;
  session_number: number;
  started_at: string;
  completed_at?: string;
  session_type: 'chat' | 'reflection' | 'assessment' | 'micro_action';
  session_data: any;
  outcomes: SessionOutcome[];
}

export interface SessionOutcome {
  type: 'mood_entry' | 'belief_shift' | 'insight' | 'micro_action' | 'excitement_rating';
  data: any;
  timestamp: string;
}

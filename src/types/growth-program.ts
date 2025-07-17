
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
  adaptation_history: AdaptationRecord[];
  created_at: string;
  updated_at: string;
}

export type ProgramType = 'sprint' | 'standard' | 'deep_dive' | 'light_touch';

export type LifeDomain = 
  | 'career' 
  | 'relationships' 
  | 'finances' 
  | 'wellbeing' 
  | 'creativity' 
  | 'spirituality' 
  | 'home_family'
  | 'health'
  | 'energy'
  | 'personal_growth'
  | 'productivity'
  | 'stress'
  | 'education_learning'
  | 'social_community'
  | 'recreation_fun'
  | 'environment_living'
  | 'contribution_service'
  | 'adventure_travel'
  | 'physical_fitness';

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

export interface AdaptationRecord {
  timestamp: string;
  adaptation_type: 'schedule_change' | 'pace_adjustment' | 'focus_shift' | 'blueprint_update';
  reason: string;
  changes_made: any;
  user_feedback?: string;
  agent_reasoning?: string;
}

// ============ Life Operating System Types ============

export interface LifeWheelAssessment {
  id: string;
  user_id: string;
  domain: LifeDomain;
  current_score: number; // 1-10
  desired_score: number; // 1-10
  importance_rating: number; // 1-10
  gap_size: number; // calculated: desired - current
  assessment_version: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface DomainGap {
  domain: LifeDomain;
  current_score: number;
  desired_score: number;
  gap_size: number;
  importance_rating: number;
  priority_score: number; // calculated weighted score
  blueprint_alignment: number; // how well this aligns with user's blueprint
  interdependency_boost: number; // leverage factor from other domains
}

export interface DomainSynergy {
  from_domain: LifeDomain;
  to_domain: LifeDomain;
  relationship_type: 'supports' | 'blocks' | 'synergistic';
  strength: number; // 0.0 to 1.0
}

export interface LifeOrchestratorPlan {
  top_gaps: DomainGap[];
  recommended_focus: LifeDomain[];
  synergy_opportunities: DomainSynergy[];
  multi_domain_strategy: {
    primary_domain: LifeDomain;
    supporting_domains: LifeDomain[];
    timeline_weeks: number;
    coordination_approach: string;
  };
  reasoning: string;
}

export interface DomainInterdependency {
  id: string;
  from_domain: LifeDomain;
  to_domain: LifeDomain;
  relationship_type: 'supports' | 'blocks' | 'synergistic';
  strength: number;
  created_at: string;
}

import { supabase } from "@/integrations/supabase/client";
import { LayeredBlueprint } from "@/types/personality-modules";
import { GrowthProgram, ProgramType, BlueprintParams, SessionSchedule, ProgramWeek, LifeDomain } from "@/types/growth-program";

class GrowthProgramService {
  async createProgram(userId: string, domain: LifeDomain, blueprint: LayeredBlueprint): Promise<GrowthProgram> {
    console.log('🌱 Creating Growth Program for user:', userId, 'domain:', domain);
    
    // Extract blueprint parameters for program customization
    const blueprintParams = this.extractBlueprintParams(blueprint);
    const programType = this.chooseProgramType(blueprintParams);
    const schedule = this.buildSchedule(programType, blueprintParams);
    const totalWeeks = this.calculateProgramLength(programType);
    
    const program = {
      user_id: userId,
      program_type: programType,
      domain,
      current_week: 1,
      total_weeks: totalWeeks,
      status: 'pending' as const,
      started_at: new Date().toISOString(),
      expected_completion: this.calculateExpectedCompletion(totalWeeks, schedule),
      blueprint_params: blueprintParams as unknown as any,
      progress_metrics: {
        completed_sessions: 0,
        mood_entries: 0,
        reflection_entries: 0,
        insight_entries: 0,
        micro_actions_completed: 0,
        belief_shifts_tracked: 0,
        excitement_ratings: [],
        domain_progress_score: 0
      } as unknown as any,
      session_schedule: schedule as unknown as any
    };

    const { data, error } = await supabase
      .from('growth_programs')
      .insert(program)
      .select()
      .single();

    if (error) {
      console.error('❌ Error creating growth program:', error);
      throw error;
    }

    console.log('✅ Growth Program created:', data.id);
    return {
      ...data,
      program_type: data.program_type as ProgramType,
      domain: data.domain as LifeDomain,
      status: data.status as any,
      blueprint_params: data.blueprint_params as unknown as BlueprintParams,
      progress_metrics: data.progress_metrics as unknown as any,
      session_schedule: data.session_schedule as unknown as SessionSchedule
    } as GrowthProgram;
  }

  async getCurrentProgram(userId: string): Promise<GrowthProgram | null> {
    const { data, error } = await supabase
      .from('growth_programs')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('❌ Error fetching current program:', error);
      throw error;
    }

    if (!data) return null;

    return {
      ...data,
      program_type: data.program_type as ProgramType,
      domain: data.domain as LifeDomain,
      status: data.status as any,
      blueprint_params: data.blueprint_params as unknown as BlueprintParams,
      progress_metrics: data.progress_metrics as unknown as any,
      session_schedule: data.session_schedule as unknown as SessionSchedule
    } as GrowthProgram;
  }

  async updateProgramProgress(programId: string, updates: Partial<GrowthProgram>): Promise<void> {
    console.log('📊 Updating program progress:', programId);
    
    // Create a clean update object with only the fields that should be updated
    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    // Only include fields that are present in the updates and convert types appropriately
    if (updates.current_week !== undefined) {
      updateData.current_week = updates.current_week;
    }
    if (updates.status !== undefined) {
      updateData.status = updates.status;
    }
    if (updates.actual_completion !== undefined) {
      updateData.actual_completion = updates.actual_completion;
    }
    if (updates.blueprint_params !== undefined) {
      updateData.blueprint_params = updates.blueprint_params as unknown as any;
    }
    if (updates.progress_metrics !== undefined) {
      updateData.progress_metrics = updates.progress_metrics as unknown as any;
    }
    if (updates.session_schedule !== undefined) {
      updateData.session_schedule = updates.session_schedule as unknown as any;
    }
    
    const { error } = await supabase
      .from('growth_programs')
      .update(updateData)
      .eq('id', programId);

    if (error) {
      console.error('❌ Error updating program:', error);
      throw error;
    }
  }

  async generateWeeklyProgram(program: GrowthProgram): Promise<ProgramWeek[]> {
    const weeks: ProgramWeek[] = [];
    
    for (let weekNum = 1; weekNum <= program.total_weeks; weekNum++) {
      const week = this.buildWeekStructure(weekNum, program.program_type, program.domain);
      week.is_unlocked = weekNum <= program.current_week;
      week.is_completed = weekNum < program.current_week;
      weeks.push(week);
    }

    return weeks;
  }

  private extractBlueprintParams(blueprint: LayeredBlueprint): BlueprintParams {
    // Extract personality-based parameters from blueprint
    const mbtiType = blueprint?.cognitiveTemperamental?.mbtiType || 'ENFP';
    const hdType = blueprint?.energyDecisionStrategy?.humanDesignType || 'Generator';
    const lifePath = Number(blueprint?.coreValuesNarrative?.lifePath) || 1;

    // Determine time horizon based on personality
    const time_horizon = (mbtiType.includes('J') || hdType === 'Manifestor') ? 'short' : 'flexible';
    
    // Determine support style based on Human Design authority
    const authority = blueprint?.energyDecisionStrategy?.authority || 'Sacral';
    const support_style = authority === 'Self-Projected' ? 1 : 
                         authority === 'Mental' ? 5 : 3;
    
    // Extract primary goal from life path
    const primary_goal = lifePath <= 3 ? 'exploring' : 
                        lifePath >= 7 ? 'deep_change' : 'habit';
    
    // Determine confidence from expression number
    const expressionNumber = Number(blueprint?.coreValuesNarrative?.expressionNumber) || 1;
    const user_confidence = expressionNumber >= 8 ? 'high' :
                           expressionNumber >= 5 ? 'medium' : 'low';

    return {
      time_horizon,
      support_style,
      primary_goal,
      user_confidence,
      goal_depth: 'moderate', // Default, can be adjusted based on user input
      preferred_pace: 'weekly' // Default, can be user preference
    };
  }

  private chooseProgramType(params: BlueprintParams): ProgramType {
    if (params.time_horizon === 'short' && params.support_style >= 4) {
      return 'sprint';
    }
    if (params.goal_depth === 'profound' && params.support_style >= 4) {
      return 'deep_dive';
    }
    if (params.support_style <= 2 || params.user_confidence === 'high') {
      return 'light_touch';
    }
    return 'standard';
  }

  private buildSchedule(programType: ProgramType, params: BlueprintParams): SessionSchedule {
    const scheduleMap = {
      sprint: { sessions_per_week: 5, session_duration_minutes: 15, reminder_frequency: 'daily' as const },
      standard: { sessions_per_week: 3, session_duration_minutes: 25, reminder_frequency: 'weekly' as const },
      deep_dive: { sessions_per_week: 2, session_duration_minutes: 45, reminder_frequency: 'weekly' as const },
      light_touch: { sessions_per_week: 1, session_duration_minutes: 20, reminder_frequency: 'weekly' as const }
    };

    return scheduleMap[programType];
  }

  private calculateProgramLength(programType: ProgramType): number {
    const lengthMap = {
      sprint: 3,
      standard: 6,
      deep_dive: 8,
      light_touch: 4
    };
    return lengthMap[programType];
  }

  private calculateExpectedCompletion(totalWeeks: number, schedule: SessionSchedule): string {
    const now = new Date();
    const completionDate = new Date(now.getTime() + (totalWeeks * 7 * 24 * 60 * 60 * 1000));
    return completionDate.toISOString();
  }

  private buildWeekStructure(weekNumber: number, programType: ProgramType, domain: LifeDomain): ProgramWeek {
    const themes = ['foundation', 'belief_excavation', 'blueprint_activation', 'domain_deep_dive', 'integration', 'graduation'] as const;
    const themeIndex = Math.min(weekNumber - 1, themes.length - 1);
    
    return {
      week_number: weekNumber,
      theme: themes[themeIndex],
      focus_area: this.getDomainFocusArea(domain, themes[themeIndex]),
      key_activities: this.getWeekActivities(themes[themeIndex], programType),
      tools_unlocked: this.getWeekTools(themes[themeIndex]),
      completion_criteria: this.getCompletionCriteria(themes[themeIndex]),
      is_unlocked: false,
      is_completed: false
    };
  }

  private getDomainFocusArea(domain: LifeDomain, theme: string): string {
    const domainFocus = {
      career: {
        foundation: 'Current work satisfaction and energy',
        belief_excavation: 'Limiting beliefs about success and worth',
        blueprint_activation: 'Natural talents and communication style',
        domain_deep_dive: 'Career alignment and next steps',
        integration: 'Work-life balance and growth path',
        graduation: 'Future career vision and action plan'
      },
      relationships: {
        foundation: 'Current relationship patterns and desires',
        belief_excavation: 'Beliefs about love, connection, and vulnerability',
        blueprint_activation: 'Communication style and relationship needs',
        domain_deep_dive: 'Relationship health and growth areas',
        integration: 'Balancing self and others across all relationships',
        graduation: 'Relationship vision and communication improvements'
      }
      // Add other domains as needed
    };

    return domainFocus[domain]?.[theme] || `${theme} work in ${domain}`;
  }

  private getWeekActivities(theme: string, programType: ProgramType): string[] {
    const baseActivities = {
      foundation: ['Initial domain assessment', 'Baseline mood tracking', 'Goal setting conversation'],
      belief_excavation: ['Fear identification', 'Belief mapping', 'Shadow work introduction'],
      blueprint_activation: ['Personality insight session', 'Energy assessment', 'Excitement compass'],
      domain_deep_dive: ['Focused domain work', 'Micro-action planning', 'Progress review'],
      integration: ['Cross-domain patterns', 'Synthesis conversation', 'Integration planning'],
      graduation: ['Progress celebration', 'Future roadmap', 'Program completion']
    };

    let activities = baseActivities[theme] || [];
    
    if (programType === 'deep_dive') {
      activities = [...activities, 'Extended reflection', 'Advanced framework work'];
    }
    
    return activities;
  }

  private getWeekTools(theme: string): string[] {
    const toolMap = {
      foundation: ['Soul Guide', 'Mood Tracker', 'Insight Journal'],
      belief_excavation: ['Reflection Prompts', 'Belief Interface', 'Shadow Work'],
      blueprint_activation: ['Blueprint Chat', 'Excitement Compass', 'Energy Check'],
      domain_deep_dive: ['Domain-specific prompts', 'Micro-actions', 'Progress tracking'],
      integration: ['Weekly Insights', 'Cross-domain chat', 'Pattern recognition'],
      graduation: ['Growth Dashboard', 'Celebration ritual', 'Future planning']
    };

    return toolMap[theme] || [];
  }

  private getCompletionCriteria(theme: string): string[] {
    const criteriaMap = {
      foundation: ['Complete baseline assessment', 'Set domain goals', 'First mood entry'],
      belief_excavation: ['Identify 2-3 key beliefs', 'Complete fear exploration', 'Begin belief reframe'],
      blueprint_activation: ['Understand personality insights', 'Rate excitement levels', 'Identify energy patterns'],
      domain_deep_dive: ['Complete domain assessment', 'Define 3 micro-actions', 'Track daily progress'],
      integration: ['Connect domain to other areas', 'Synthesize weekly learnings', 'Plan integration'],
      graduation: ['Review all progress', 'Celebrate achievements', 'Set future intentions']
    };

    return criteriaMap[theme] || [];
  }
}

export const growthProgramService = new GrowthProgramService();

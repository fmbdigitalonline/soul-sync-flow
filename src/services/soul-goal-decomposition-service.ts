import { supabase } from '@/integrations/supabase/client';
import { hermeticIntelligenceService } from './hermetic-intelligence-service';
import { hermeticReportAccessService } from './hermetic-report-access-service';
import type { HermeticStructuredIntelligence } from '@/types/hermetic-intelligence';

export interface SoulGeneratedGoal {
  id: string;
  title: string;
  description: string;
  category: string;
  timeframe: string;
  target_completion: string;
  created_at: string;
  milestones: Array<{
    id: string;
    title: string;
    description: string;
    target_date: string;
    completed: boolean;
    completion_criteria: string[];
    blueprint_alignment?: any;
  }>;
  tasks: Array<{
    id: string;
    title: string;
    description: string;
    milestone_id: string;
    completed: boolean;
    estimated_duration: string;
    energy_level_required: string;
    category: string;
    optimal_timing?: string;
    blueprint_reasoning?: string;
    prerequisites?: string[];
  }>;
  blueprint_insights: string[];
  personalization_notes: string;
}

class SoulGoalDecompositionService {
  async decomposeGoalWithSoul(
    title: string,
    description: string,
    timeframe: string,
    category: string,
    blueprintData: any,
    whyItMatters?: string
  ): Promise<SoulGeneratedGoal> {
    console.log('🎯 Soul Goal Decomposition Service - Starting razor-aligned decomposition:', {
      title,
      description,
      timeframe,
      category,
      hasBlueprintData: !!blueprintData
    });

    try {
      // STEP 1: Fetch deep personality data with fallback hierarchy
      console.log('🧬 HERMETIC INTEGRATION: Fetching deep personality context...');
      const userId = (await supabase.auth.getUser()).data.user?.id;
      const personalityContext = await this.fetchPersonalityDataWithFallback(userId!, blueprintData);
      
      console.log('✅ PERSONALITY CONTEXT:', {
        dataSource: personalityContext.dataSource,
        depth: personalityContext.depth,
        hasHermetic2: !!personalityContext.hermetic2,
        hasHermetic1: !!personalityContext.hermetic1Report,
        hasBlueprintSections: Object.keys(personalityContext.blueprintSections || {}).length
      });

      // STEP 2: Build comprehensive AI prompt with all available context
      const comprehensivePrompt = this.buildComprehensiveDecompositionPrompt(
        title,
        description,
        whyItMatters || '',
        category,
        timeframe,
        personalityContext
      );

      console.log('📝 PROMPT BUILT:', { 
        length: comprehensivePrompt.length,
        dataSource: personalityContext.dataSource 
      });

      // STEP 3: Call AI Coach with enhanced prompt
      const { data, error } = await supabase.functions.invoke('ai-coach', {
        body: {
          message: comprehensivePrompt,
          context: 'razor_aligned_goal_decomposition',
          contextDepth: 'deep',
          blueprintData
        }
      });

      if (error) {
        console.error('❌ AI Coach function error:', error);
        throw new Error(`AI Coach service error: ${error.message}`);
      }

      if (!data?.response) {
        console.error('❌ No response from AI Coach service');
        throw new Error('No response from AI Coach service');
      }

      console.log('✅ AI RESPONSE RECEIVED:', { length: data.response.length });

      // STEP 4: Parse and validate AI response
      const parsedGoal = await this.parseAIResponseWithValidation(data.response, title, category);
      
      console.log('✅ VALIDATION PASSED:', {
        milestones: parsedGoal.milestones.length,
        tasks: parsedGoal.tasks.length,
        isGoalSpecific: parsedGoal.isGoalSpecific
      });

      // STEP 5: Create structured goal
      const goalId = `goal_${Date.now()}`;
      const targetDate = this.calculateTargetDate(timeframe);

      const soulGoal: SoulGeneratedGoal = {
        id: goalId,
        title,
        description,
        category,
        timeframe,
        target_completion: targetDate,
        created_at: new Date().toISOString(),
        milestones: parsedGoal.milestones,
        tasks: parsedGoal.tasks,
        blueprint_insights: parsedGoal.blueprint_insights || [],
        personalization_notes: `Razor-aligned journey created using ${personalityContext.dataSource} with ${parsedGoal.milestones.length} goal-specific milestones and ${parsedGoal.tasks.length} actionable tasks.`
      };

      console.log('✅ RAZOR-ALIGNED GOAL COMPLETED:', {
        milestones: parsedGoal.milestones.length,
        tasks: parsedGoal.tasks.length,
        goalId: soulGoal.id,
        dataSource: personalityContext.dataSource
      });

      // Save to database with hermetic alignment context
      await this.saveGoalWithHermeticContext(soulGoal, personalityContext);
      
      return soulGoal;

    } catch (error) {
      console.error('❌ Soul Goal Decomposition Service error:', error);
      throw error;
    }
  }

  private generateEnhancedMilestones(title: string, timeframe: string, blueprintData: any, causalAnalysis?: any) {
    // Generate 5-6 milestones with causal analysis integration
    const milestones = [
      {
        id: `milestone_1_${Date.now()}`,
        title: `Discovery & Vision`,
        description: `Explore and clarify your vision for "${title}" with deep personal alignment`,
        target_date: this.calculateMilestoneDate(timeframe, 0.15),
        completed: false,
        completion_criteria: [
          'Vision statement created and refined',
          'Personal alignment assessment completed',
          'Initial research and exploration done',
          'Commitment level evaluated'
        ],
        blueprint_alignment: {
          phase: 'foundation',
          energyType: this.getUserType(blueprintData),
          recommendations: [`Optimized for your ${this.getUserType(blueprintData)} discovery process`]
        }
      },
      {
        id: `milestone_2_${Date.now() + 1}`,
        title: `Foundation & Planning`,
        description: `Establish solid groundwork and detailed action plan`,
        target_date: this.calculateMilestoneDate(timeframe, 0.3),
        completed: false,
        completion_criteria: [
          'Comprehensive plan created',
          'Resources and tools identified',
          'Support system established',
          'First steps clearly defined'
        ],
        blueprint_alignment: {
          phase: 'foundation',
          energyType: this.getUserType(blueprintData),
          recommendations: [`Structured for your ${this.getUserType(blueprintData)} planning style`]
        }
      },
      {
        id: `milestone_3_${Date.now() + 2}`,
        title: `Initial Implementation`,
        description: `Launch your journey with focused action and momentum building`,
        target_date: this.calculateMilestoneDate(timeframe, 0.5),
        completed: false,
        completion_criteria: [
          'Core activities initiated',
          'Early wins achieved',
          'Momentum established',
          'Progress tracking system active'
        ],
        blueprint_alignment: {
          phase: 'development',
          energyType: this.getUserType(blueprintData),
          recommendations: [`Designed for your ${this.getUserType(blueprintData)} action style`]
        }
      },
      {
        id: `milestone_4_${Date.now() + 3}`,
        title: `Expansion & Growth`,
        description: `Scale your efforts and deepen your engagement`,
        target_date: this.calculateMilestoneDate(timeframe, 0.7),
        completed: false,
        completion_criteria: [
          'Expanded scope of activities',
          'Skill development progressing',
          'Challenges overcome',
          'Confidence building'
        ],
        blueprint_alignment: {
          phase: 'development',
          energyType: this.getUserType(blueprintData),
          recommendations: [`Optimized for your ${this.getUserType(blueprintData)} growth patterns`]
        }
      },
      {
        id: `milestone_5_${Date.now() + 4}`,
        title: `Mastery & Integration`,
        description: `Refine your approach and integrate learnings`,
        target_date: this.calculateMilestoneDate(timeframe, 0.85),
        completed: false,
        completion_criteria: [
          'Advanced skills developed',
          'Systems optimized',
          'Knowledge integrated',
          'Expertise demonstrated'
        ],
        blueprint_alignment: {
          phase: 'refinement',
          energyType: this.getUserType(blueprintData),
          recommendations: [`Tailored for your ${this.getUserType(blueprintData)} mastery process`]
        }
      },
      {
        id: `milestone_6_${Date.now() + 5}`,
        title: `Achievement & Celebration`,
        description: `Complete your journey and celebrate your transformation`,
        target_date: this.calculateMilestoneDate(timeframe, 1.0),
        completed: false,
        completion_criteria: [
          'Primary goal achieved',
          'Success celebrated',
          'Impact assessed',
          'Next chapter planned'
        ],
        blueprint_alignment: {
          phase: 'completion',
          energyType: this.getUserType(blueprintData),
          recommendations: [`Honors your ${this.getUserType(blueprintData)} completion style`]
        }
      }
    ];

    return milestones;
  }

  private generateEnhancedTasks(milestones: any[], category: string, blueprintData: any, causalAnalysis?: any) {
    const tasks: any[] = [];
    const userType = this.getUserType(blueprintData);
    
    // Generate 3-4 tasks per milestone with causal prerequisites (18-24 total tasks)
    milestones.forEach((milestone, milestoneIndex) => {
      const tasksPerMilestone = 3 + (milestoneIndex % 2); // Alternate between 3 and 4 tasks
      
      for (let i = 0; i < tasksPerMilestone; i++) {
        const taskId = `task_${milestone.id}_${i}_${Date.now()}`;
        const energyLevels = ['low', 'medium', 'high'] as const;
        const categories = ['research', 'planning', 'execution', 'review', 'communication'];
        
        // Determine causal prerequisites for this task
        const causalPrerequisites = this.determineCausalPrerequisites(
          categories[i % categories.length], 
          energyLevels[i % 3], 
          causalAnalysis
        );

        tasks.push({
          id: taskId,
          title: this.generateTaskTitle(milestone.title, i, tasksPerMilestone),
          description: this.generateTaskDescription(milestone.title, i, userType),
          milestone_id: milestone.id,
          completed: false,
          estimated_duration: this.getEstimatedDuration(i, milestone.blueprint_alignment?.phase),
          energy_level_required: energyLevels[i % 3],
          category: categories[i % categories.length],
          optimal_timing: this.getOptimalTiming(blueprintData, energyLevels[i % 3]),
          blueprint_reasoning: `Designed for your ${userType} preferences and ${energyLevels[i % 3]} energy periods`,
          prerequisites: causalPrerequisites
        });
      }
    });

    return tasks;
  }

  private generateTaskTitle(milestoneTitle: string, taskIndex: number, totalTasks: number): string {
    const taskTypes = [
      ['Research & Explore', 'Plan & Organize', 'Execute & Implement', 'Review & Refine'],
      ['Discover & Assess', 'Design & Structure', 'Launch & Execute', 'Optimize & Improve'],
      ['Investigate & Learn', 'Prepare & Setup', 'Act & Deliver', 'Evaluate & Adjust']
    ];
    
    const typeSet = taskTypes[taskIndex % taskTypes.length];
    const taskType = typeSet[Math.min(taskIndex, typeSet.length - 1)];
    
    return `${taskType}: ${milestoneTitle}`;
  }

  private generateTaskDescription(milestoneTitle: string, taskIndex: number, userType: string): string {
    const descriptions = [
      `Conduct thorough research and exploration for ${milestoneTitle.toLowerCase()}, aligned with your ${userType} approach`,
      `Create detailed plans and organize resources for ${milestoneTitle.toLowerCase()}, optimized for your working style`,
      `Execute key activities and implement solutions for ${milestoneTitle.toLowerCase()}, matching your energy patterns`,
      `Review progress and refine your approach for ${milestoneTitle.toLowerCase()}, honoring your reflection preferences`
    ];
    
    return descriptions[taskIndex % descriptions.length];
  }

  private getEstimatedDuration(taskIndex: number, phase?: string): string {
    const durations = {
      foundation: ['2-3 hours', '1-2 hours', '3-4 hours', '1 hour'],
      development: ['1-2 hours', '2-3 hours', '4-5 hours', '1-2 hours'],
      refinement: ['1 hour', '2 hours', '3 hours', '30 minutes'],
      completion: ['1-2 hours', '30 minutes', '2-3 hours', '1 hour']
    };
    
    const phaseDurations = durations[phase as keyof typeof durations] || durations.development;
    return phaseDurations[taskIndex % phaseDurations.length];
  }

  private generateEnhancedBlueprintInsights(blueprintData: any): string[] {
    const insights = [
      `Your ${this.getUserType(blueprintData)} energy type provides unique strengths for this journey`,
      'Task sequence optimized for your natural workflow and energy patterns',
      'Milestone timing aligned with your personal rhythm and decision-making style',
      'Each phase designed to work with your cognitive preferences and motivational drivers'
    ];

    if (blueprintData?.cognition_mbti?.type) {
      insights.push(`Tasks structured to leverage your ${blueprintData.cognition_mbti.type} cognitive strengths`);
    }
    
    if (blueprintData?.energy_strategy_human_design?.strategy) {
      insights.push(`Timing and approach honors your ${blueprintData.energy_strategy_human_design.strategy} strategy`);
    }

    return insights;
  }

  private getUserType(blueprintData: any): string {
    if (!blueprintData) return 'unique soul';
    
    const mbti = blueprintData?.cognition_mbti?.type;
    const hdType = blueprintData?.energy_strategy_human_design?.type;
    
    if (mbti && mbti !== 'Unknown') return mbti;
    if (hdType && hdType !== 'Unknown' && hdType !== 'Generator') return hdType;
    
    const sunSign = blueprintData?.archetype_western?.sun_sign;
    if (sunSign && sunSign !== 'Unknown') {
      return `${sunSign} soul`;
    }
    
    return 'unique soul';
  }

  private calculateMilestoneDate(timeframe: string, percentage: number): string {
    const date = new Date();
    
    if (timeframe.includes('month')) {
      const months = parseInt(timeframe) || 3;
      date.setMonth(date.getMonth() + Math.floor(months * percentage));
    } else if (timeframe.includes('week')) {
      const weeks = parseInt(timeframe) || 12;
      date.setDate(date.getDate() + Math.floor(weeks * 7 * percentage));
    } else if (timeframe.includes('year')) {
      const years = parseInt(timeframe) || 1;
      date.setFullYear(date.getFullYear() + Math.floor(years * percentage));
    } else {
      date.setMonth(date.getMonth() + Math.floor(3 * percentage));
    }

    return date.toISOString().split('T')[0];
  }

  private getOptimalTiming(blueprintData: any, energyLevel: string): string {
    // Enhanced timing based on energy level and blueprint
    const timingMap: Record<string, string> = {
      high: 'Peak energy periods (9 AM - 12 PM)',
      medium: 'Steady focus time (2 PM - 5 PM)',
      low: 'Gentle activity periods (7 PM - 9 PM)'
    };

    const baseTime = timingMap[energyLevel] || 'During your preferred working hours';
    
    // Add blueprint-specific timing if available
    if (blueprintData?.energy_strategy_human_design?.type === 'Generator') {
      return `${baseTime} - Best when responding to opportunities`;
    }
    
    return baseTime;
  }

  // ============================================
  // DATABASE OPERATIONS
  // ============================================

  private async saveGoalWithHermeticContext(goal: SoulGeneratedGoal, personalityContext: any): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Save to productivity_journey table
      const { error: journeyError } = await supabase
        .from('productivity_journey')
        .insert({
          user_id: user.id,
          goal_title: goal.title,
          goal_description: goal.description,
          category: goal.category,
          timeframe: goal.timeframe,
          target_completion: goal.target_completion,
          milestones: goal.milestones,
          tasks: goal.tasks,
          blueprint_insights: goal.blueprint_insights,
          personalization_notes: goal.personalization_notes,
          hermetic_alignment_context: {
            data_source: personalityContext.dataSource,
            depth: personalityContext.depth,
            created_at: new Date().toISOString()
          }
        });

      if (journeyError) {
        console.error('❌ Error saving journey:', journeyError);
        throw journeyError;
      }

      console.log('✅ SAVED TO DATABASE with hermetic context');
    } catch (error) {
      console.error('❌ Database save error:', error);
      throw error;
    }
  }

  // Legacy method (kept for backward compatibility)
  private async performCausalAnalysis(title: string, category: string, blueprintData: any): Promise<any> {
    console.log('🔗 CNR: Analyzing causal relationships for dream decomposition');
    
    const causalFactors = {
      prerequisites: this.identifyPrerequisites(title, category),
      dependencies: this.mapDependencies(title, blueprintData),
      riskFactors: this.assessRiskFactors(title, category),
      accelerators: this.findAccelerators(title, blueprintData)
    };
    
    return causalFactors;
  }

  // Identify logical prerequisites for goal achievement
  private identifyPrerequisites(title: string, category: string): string[] {
    const lowerTitle = title.toLowerCase();
    const prerequisites: string[] = [];
    
    if (lowerTitle.includes('business') || lowerTitle.includes('startup') || lowerTitle.includes('app') || lowerTitle.includes('launch')) {
      prerequisites.push('market_research', 'financial_planning', 'skill_development', 'technical_planning');
    } else if (lowerTitle.includes('fitness') || lowerTitle.includes('health')) {
      prerequisites.push('baseline_assessment', 'routine_establishment', 'environment_setup');
    } else if (lowerTitle.includes('relationship') || lowerTitle.includes('social')) {
      prerequisites.push('self_awareness', 'communication_skills', 'emotional_intelligence');
    } else if (lowerTitle.includes('career') || lowerTitle.includes('job')) {
      prerequisites.push('skill_assessment', 'market_research', 'network_building');
    } else if (lowerTitle.includes('creative') || lowerTitle.includes('art') || lowerTitle.includes('writing')) {
      prerequisites.push('creative_practice', 'inspiration_gathering', 'skill_development');
    } else {
      prerequisites.push('goal_clarification', 'resource_assessment', 'commitment_evaluation');
    }
    
    return prerequisites;
  }

  // Map dependencies based on blueprint personality
  private mapDependencies(title: string, blueprintData: any): string[] {
    const dependencies: string[] = [];
    
    // Add personality-based dependencies
    if (blueprintData?.cognition_mbti?.type?.includes('I')) {
      dependencies.push('solo_preparation_time', 'internal_processing');
    }
    if (blueprintData?.cognition_mbti?.type?.includes('E')) {
      dependencies.push('social_support', 'external_feedback');
    }
    if (blueprintData?.cognition_mbti?.type?.includes('J')) {
      dependencies.push('structured_planning', 'clear_deadlines');
    }
    if (blueprintData?.cognition_mbti?.type?.includes('P')) {
      dependencies.push('flexible_approach', 'adaptation_space');
    }
    
    // Add Human Design dependencies
    if (blueprintData?.energy_strategy_human_design?.type === 'Manifestor') {
      dependencies.push('independent_action', 'initiation_freedom');
    } else if (blueprintData?.energy_strategy_human_design?.type === 'Generator') {
      dependencies.push('response_opportunities', 'satisfaction_tracking');
    } else if (blueprintData?.energy_strategy_human_design?.type === 'Projector') {
      dependencies.push('recognition_invitations', 'energy_management');
    } else if (blueprintData?.energy_strategy_human_design?.type === 'Reflector') {
      dependencies.push('lunar_cycles', 'environmental_clarity');
    }
    
    return dependencies;
  }

  // Assess risk factors that could impede progress
  private assessRiskFactors(title: string, category: string): string[] {
    const baseRisks = ['time_constraints', 'resource_limitations', 'motivation_fluctuation', 'external_obstacles'];
    const lowerTitle = title.toLowerCase();
    
    if (lowerTitle.includes('business') || lowerTitle.includes('startup') || lowerTitle.includes('app')) {
      baseRisks.push('market_volatility', 'technical_challenges', 'funding_gaps', 'competition');
    } else if (lowerTitle.includes('health') || lowerTitle.includes('fitness')) {
      baseRisks.push('injury_risk', 'plateau_periods', 'lifestyle_conflicts');
    } else if (lowerTitle.includes('creative') || lowerTitle.includes('art')) {
      baseRisks.push('creative_blocks', 'perfectionism', 'market_uncertainty');
    }
    
    return baseRisks;
  }

  // Find accelerators that could speed up progress
  private findAccelerators(title: string, blueprintData: any): string[] {
    const accelerators: string[] = ['consistent_habits', 'support_system', 'clear_metrics', 'celebration_milestones'];
    
    // Add blueprint-specific accelerators
    if (blueprintData?.energy_strategy_human_design?.type === 'Manifestor') {
      accelerators.push('independent_action', 'clear_vision', 'initiation_power');
    } else if (blueprintData?.energy_strategy_human_design?.type === 'Generator') {
      accelerators.push('following_excitement', 'sustainable_pace', 'gut_response');
    } else if (blueprintData?.energy_strategy_human_design?.type === 'Projector') {
      accelerators.push('wise_guidance', 'recognition_systems', 'efficiency_focus');
    } else if (blueprintData?.energy_strategy_human_design?.type === 'Reflector') {
      accelerators.push('community_wisdom', 'patient_observation', 'lunar_timing');
    }
    
    // Add MBTI-specific accelerators
    if (blueprintData?.cognition_mbti?.type?.includes('N')) {
      accelerators.push('big_picture_vision', 'innovation_opportunities');
    }
    if (blueprintData?.cognition_mbti?.type?.includes('S')) {
      accelerators.push('practical_steps', 'tangible_progress');
    }
    if (blueprintData?.cognition_mbti?.type?.includes('T')) {
      accelerators.push('logical_frameworks', 'objective_metrics');
    }
    if (blueprintData?.cognition_mbti?.type?.includes('F')) {
      accelerators.push('value_alignment', 'personal_meaning');
    }
    
    return accelerators;
  }

  // Determine causal prerequisites for tasks based on category and causal analysis
  private determineCausalPrerequisites(taskCategory: string, energyLevel: string, causalAnalysis?: any): string[] {
    const basePrerequisites: string[] = [];
    
    // Add category-specific prerequisites
    switch (taskCategory) {
      case 'research':
        basePrerequisites.push('Information gathering tools', 'Research methodology');
        break;
      case 'planning':
        basePrerequisites.push('Goal clarity', 'Resource assessment');
        if (causalAnalysis?.dependencies?.includes('structured_planning')) {
          basePrerequisites.push('Planning framework established');
        }
        break;
      case 'execution':
        basePrerequisites.push('Preparation completed', 'Resources available');
        if (causalAnalysis?.dependencies?.includes('social_support')) {
          basePrerequisites.push('Support system activated');
        }
        break;
      case 'review':
        basePrerequisites.push('Progress data collected', 'Evaluation criteria defined');
        break;
      case 'communication':
        basePrerequisites.push('Key stakeholders identified', 'Communication plan');
        break;
    }
    
    // Add energy-level specific prerequisites
    if (energyLevel === 'high') {
      basePrerequisites.push('Peak energy period scheduled');
      if (causalAnalysis?.dependencies?.includes('solo_preparation_time')) {
        basePrerequisites.push('Uninterrupted time block secured');
      }
    } else if (energyLevel === 'medium') {
      basePrerequisites.push('Moderate focus session planned');
    } else if (energyLevel === 'low') {
      basePrerequisites.push('Low-pressure environment established');
    }
    
    // Add causal analysis prerequisites
    if (causalAnalysis?.prerequisites) {
      // Map general prerequisites to specific task requirements
      if (causalAnalysis.prerequisites.includes('market_research') && taskCategory === 'research') {
        basePrerequisites.push('Market analysis framework ready');
      }
      if (causalAnalysis.prerequisites.includes('skill_development') && taskCategory === 'execution') {
        basePrerequisites.push('Required skills assessed and developed');
      }
      if (causalAnalysis.prerequisites.includes('financial_planning') && taskCategory === 'planning') {
        basePrerequisites.push('Budget and financial resources planned');
      }
    }
    
    // Limit to most important prerequisites to avoid overwhelming
    return basePrerequisites.slice(0, 3);
  }

  // Save enhanced goal with causal analysis to database
  private async saveEnhancedGoalToDatabase(goal: SoulGeneratedGoal, causalAnalysis: any): Promise<void> {
    try {
      console.log('💾 Saving enhanced goal with causal analysis to database:', goal.id);
      
      // Get current user ID
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('⚠️ No authenticated user found, skipping database save');
        return;
      }
      
      const { data, error } = await supabase
        .from('user_goals')
        .insert({
          user_id: user.id,
          title: goal.title,
          description: goal.description,
          category: goal.category,
          status: 'active',
          target_date: goal.target_completion,
          progress: 0,
          milestones: goal.milestones,
          aligned_traits: {
            blueprint_insights: goal.blueprint_insights,
            personalization_notes: goal.personalization_notes,
            causal_analysis: causalAnalysis,
            enhanced_features: {
              prerequisites: causalAnalysis.prerequisites,
              dependencies: causalAnalysis.dependencies,
              risk_factors: causalAnalysis.riskFactors,
              accelerators: causalAnalysis.accelerators,
              task_count: goal.tasks.length,
              milestone_count: goal.milestones.length
            }
          }
        });

      if (error) {
        console.error('❌ Database save error:', error);
        throw new Error(`Database save failed: ${error.message}`);
      }

      console.log('✅ Enhanced goal saved to database successfully:', data);
    } catch (error) {
      console.error('❌ Failed to save enhanced goal to database:', error);
      // Don't throw - goal decomposition should still succeed even if DB save fails
      console.log('⚠️ Continuing with goal decomposition despite database save failure');
    }
  }
}

export const soulGoalDecompositionService = new SoulGoalDecompositionService();

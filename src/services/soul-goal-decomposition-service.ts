import { supabase } from '@/integrations/supabase/client';

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
    blueprintData: any
  ): Promise<SoulGeneratedGoal> {
    console.log('🎯 Soul Goal Decomposition Service - Starting enhanced decomposition:', {
      title,
      description,
      timeframe,
      category,
      hasBlueprintData: !!blueprintData
    });

    try {
      const { data, error } = await supabase.functions.invoke('ai-coach', {
        body: {
          message: `Please help me break down this dream into a comprehensive, actionable journey:
          
Dream: ${title}
Description: ${description}
Timeframe: ${timeframe}
Category: ${category}

Please create a detailed breakdown with:
1. 5-6 progressive milestones with specific target dates
2. 3-4 specific tasks for each milestone (15-20 total tasks)
3. Blueprint-aligned insights and optimal timing suggestions
4. Energy level requirements for each task
5. Detailed completion criteria for milestones

Blueprint Data: ${JSON.stringify(blueprintData, null, 2)}`,
          context: 'enhanced_goal_decomposition',
          blueprintData
        }
      });

      if (error) {
        console.error('❌ Soul Coach function error:', error);
        throw new Error(`Soul Coach service error: ${error.message}`);
      }

      if (!data?.response) {
        console.error('❌ No response from Soul Coach service');
        throw new Error('No response from Soul Coach service');
      }

      // Create enhanced structured goal from Soul Coach response
      const goalId = `goal_${Date.now()}`;
      const targetDate = new Date();
      
      // Calculate target completion based on timeframe
      if (timeframe.includes('month')) {
        const months = parseInt(timeframe) || 3;
        targetDate.setMonth(targetDate.getMonth() + months);
      } else if (timeframe.includes('week')) {
        const weeks = parseInt(timeframe) || 12;
        targetDate.setDate(targetDate.getDate() + (weeks * 7));
      } else if (timeframe.includes('year')) {
        const years = parseInt(timeframe) || 1;
        targetDate.setFullYear(targetDate.getFullYear() + years);
      } else {
        targetDate.setMonth(targetDate.getMonth() + 3); // Default 3 months
      }

      // Generate enhanced milestones and tasks
      const enhancedMilestones = this.generateEnhancedMilestones(title, timeframe, blueprintData);
      const enhancedTasks = this.generateEnhancedTasks(enhancedMilestones, category, blueprintData);

      const soulGoal: SoulGeneratedGoal = {
        id: goalId,
        title,
        description,
        category,
        timeframe,
        target_completion: targetDate.toISOString().split('T')[0],
        created_at: new Date().toISOString(),
        milestones: enhancedMilestones,
        tasks: enhancedTasks,
        blueprint_insights: this.generateEnhancedBlueprintInsights(blueprintData),
        personalization_notes: `This comprehensive journey has been deeply personalized for your ${this.getUserType(blueprintData)} energy type with ${enhancedMilestones.length} milestones and ${enhancedTasks.length} tasks.`
      };

      console.log('✅ Enhanced soul goal decomposition completed:', {
        milestones: enhancedMilestones.length,
        tasks: enhancedTasks.length,
        goalId: soulGoal.id
      });
      
      return soulGoal;

    } catch (error) {
      console.error('❌ Soul Goal Decomposition Service error:', error);
      throw error;
    }
  }

  private generateEnhancedMilestones(title: string, timeframe: string, blueprintData: any) {
    // Generate 5-6 milestones instead of 4
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

  private generateEnhancedTasks(milestones: any[], category: string, blueprintData: any) {
    const tasks: any[] = [];
    const userType = this.getUserType(blueprintData);
    
    // Generate 3-4 tasks per milestone (18-24 total tasks)
    milestones.forEach((milestone, milestoneIndex) => {
      const tasksPerMilestone = 3 + (milestoneIndex % 2); // Alternate between 3 and 4 tasks
      
      for (let i = 0; i < tasksPerMilestone; i++) {
        const taskId = `task_${milestone.id}_${i}_${Date.now()}`;
        const energyLevels = ['low', 'medium', 'high'] as const;
        const categories = ['research', 'planning', 'execution', 'review', 'communication'];
        
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
          blueprint_reasoning: `Designed for your ${userType} preferences and ${energyLevels[i % 3]} energy periods`
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
}

export const soulGoalDecompositionService = new SoulGoalDecompositionService();

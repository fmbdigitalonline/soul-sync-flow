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
    console.log('🎯 Soul Goal Decomposition Service - Starting decomposition:', {
      title,
      description,
      timeframe,
      category,
      hasBlueprintData: !!blueprintData
    });

    try {
      const { data, error } = await supabase.functions.invoke('ai-coach', {
        body: {
          message: `Please help me break down this dream into actionable milestones and tasks:
          
Dream: ${title}
Description: ${description}
Timeframe: ${timeframe}
Category: ${category}

Please create a structured breakdown with:
1. 3-5 key milestones with target dates
2. Specific tasks for each milestone
3. Blueprint-aligned insights and optimal timing suggestions

Blueprint Data: ${JSON.stringify(blueprintData, null, 2)}`,
          context: 'goal_decomposition',
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

      // Parse the Soul Coach response and structure it
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

      // Create structured goal from Soul Coach response
      const soulGoal: SoulGeneratedGoal = {
        id: goalId,
        title,
        description,
        category,
        timeframe,
        target_completion: targetDate.toISOString().split('T')[0],
        created_at: new Date().toISOString(),
        milestones: this.generateMilestones(title, timeframe, blueprintData),
        tasks: this.generateTasks(title, category, blueprintData),
        blueprint_insights: this.generateBlueprintInsights(blueprintData),
        personalization_notes: `This goal has been personalized for your ${this.getUserType(blueprintData)} energy type.`
      };

      console.log('✅ Soul goal decomposition completed:', soulGoal);
      return soulGoal;

    } catch (error) {
      console.error('❌ Soul Goal Decomposition Service error:', error);
      throw error;
    }
  }

  private generateMilestones(title: string, timeframe: string, blueprintData: any) {
    const milestones = [
      {
        id: `milestone_1_${Date.now()}`,
        title: `Foundation Phase`,
        description: `Establish the groundwork for "${title}"`,
        target_date: this.calculateMilestoneDate(timeframe, 0.25),
        completed: false,
        completion_criteria: ['Research completed', 'Initial plan created', 'Resources identified'],
        blueprint_alignment: {
          phase: 'foundation',
          energyType: this.getUserType(blueprintData),
          recommendations: [`Optimized for foundation activities based on your blueprint`]
        }
      },
      {
        id: `milestone_2_${Date.now() + 1}`,
        title: `Development Phase`,
        description: `Build momentum and make significant progress`,
        target_date: this.calculateMilestoneDate(timeframe, 0.5),
        completed: false,
        completion_criteria: ['Core components implemented', 'Initial testing completed', 'Feedback incorporated'],
        blueprint_alignment: {
          phase: 'development',
          energyType: this.getUserType(blueprintData),
          recommendations: [`Optimized for development activities based on your blueprint`]
        }
      },
      {
        id: `milestone_3_${Date.now() + 2}`,
        title: `Refinement Phase`,
        description: `Polish and optimize your approach`,
        target_date: this.calculateMilestoneDate(timeframe, 0.75),
        completed: false,
        completion_criteria: ['Quality improvements made', 'Performance optimized', 'Documentation completed'],
        blueprint_alignment: {
          phase: 'refinement',
          energyType: this.getUserType(blueprintData),
          recommendations: [`Optimized for refinement activities based on your blueprint`]
        }
      },
      {
        id: `milestone_4_${Date.now() + 3}`,
        title: `Completion Phase`,
        description: `Finalize and achieve your dream`,
        target_date: this.calculateMilestoneDate(timeframe, 1.0),
        completed: false,
        completion_criteria: ['All objectives met', 'Final review completed', 'Success celebrated'],
        blueprint_alignment: {
          phase: 'completion',
          energyType: this.getUserType(blueprintData),
          recommendations: [`Optimized for completion activities based on your blueprint`]
        }
      }
    ];

    return milestones;
  }

  private generateTasks(title: string, category: string, blueprintData: any) {
    const tasks = [
      {
        id: `task_1_${Date.now()}`,
        title: `Research and Planning`,
        description: `Conduct thorough research for "${title}"`,
        completed: false,
        estimated_duration: '2-3 hours',
        energy_level_required: 'medium',
        category: 'planning',
        optimal_timing: this.getOptimalTiming(blueprintData, 'research'),
        blueprint_reasoning: 'Aligned with your analytical strengths'
      },
      {
        id: `task_2_${Date.now() + 1}`,
        title: `Initial Implementation`,
        description: `Begin implementing the core components`,
        completed: false,
        estimated_duration: '4-6 hours',
        energy_level_required: 'high',
        category: 'execution',
        optimal_timing: this.getOptimalTiming(blueprintData, 'implementation'),
        blueprint_reasoning: 'Scheduled during your peak energy periods'
      },
      {
        id: `task_3_${Date.now() + 2}`,
        title: `Review and Iterate`,
        description: `Review progress and make necessary adjustments`,
        completed: false,
        estimated_duration: '1-2 hours',
        energy_level_required: 'low',
        category: 'review',
        optimal_timing: this.getOptimalTiming(blueprintData, 'review'),
        blueprint_reasoning: 'Perfect for reflection periods'
      }
    ];

    return tasks;
  }

  private generateBlueprintInsights(blueprintData: any): string[] {
    const insights = [
      `Your ${this.getUserType(blueprintData)} energy type is perfectly suited for this journey`,
      'Consider breaking larger tasks into smaller, manageable chunks',
      'Schedule important work during your peak energy periods'
    ];

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

  private getBlueprintAlignment(blueprintData: any, phase: string): any {
    return {
      phase,
      energyType: this.getUserType(blueprintData),
      recommendations: [`Optimized for ${phase} activities based on your blueprint`]
    };
  }

  private getOptimalTiming(blueprintData: any, taskType: string): string {
    // Default optimal timing based on task type
    const timingMap: Record<string, string> = {
      research: 'Morning hours (9-11 AM)',
      implementation: 'Peak energy periods (10 AM - 2 PM)',
      review: 'Evening reflection time (6-8 PM)'
    };

    return timingMap[taskType] || 'During your preferred working hours';
  }
}

export const soulGoalDecompositionService = new SoulGoalDecompositionService();

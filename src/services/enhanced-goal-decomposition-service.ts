
import { v4 as uuidv4 } from 'uuid';
import { BlueprintData } from '@/services/blueprint-service';

export interface EnhancedGoal {
  id: string;
  title: string;
  description: string;
  category: string;
  timeframe: string;
  target_completion: string;
  created_at: string;
  milestones: EnhancedMilestone[];
  tasks: EnhancedTask[];
  blueprint_alignment: string[];
}

export interface EnhancedMilestone {
  id: string;
  title: string;
  description: string;
  target_date: string;
  completed: boolean;
  completion_criteria: string[];
  phase: 'discovery' | 'planning' | 'execution' | 'analysis';
  order: number;
}

export interface EnhancedTask {
  id: string;
  title: string;
  description: string;
  milestone_id: string;
  completed: boolean;
  estimated_duration: string;
  energy_level_required: 'low' | 'medium' | 'high';
  category: string;
  prerequisites: string[];
  order: number;
}

class EnhancedGoalDecompositionService {
  async decomposeGoal(
    title: string,
    timeframe: string,
    category: string,
    blueprintData: BlueprintData
  ): Promise<EnhancedGoal> {
    const goalId = uuidv4();
    const targetDate = this.calculateTargetDate(timeframe);
    
    // Create realistic milestones spread over the timeframe
    const milestones = this.createMilestones(title, timeframe, targetDate);
    
    // Create tasks for each milestone
    const tasks = this.createTasksForMilestones(milestones);
    
    // Generate blueprint alignment insights
    const blueprintAlignment = this.generateBlueprintAlignment(blueprintData, category);
    
    return {
      id: goalId,
      title,
      description: `A personalized journey to achieve: ${title}`,
      category,
      timeframe,
      target_completion: targetDate,
      created_at: new Date().toISOString(),
      milestones,
      tasks,
      blueprint_alignment
    };
  }

  private calculateTargetDate(timeframe: string): string {
    const now = new Date();
    const months = this.parseTimeframe(timeframe);
    now.setMonth(now.getMonth() + months);
    return now.toISOString();
  }

  private parseTimeframe(timeframe: string): number {
    switch (timeframe) {
      case '1 month': return 1;
      case '3 months': return 3;
      case '6 months': return 6;
      case '1 year': return 12;
      case '2 years': return 24;
      default: return 3;
    }
  }

  private createMilestones(title: string, timeframe: string, targetDate: string): EnhancedMilestone[] {
    const totalMonths = this.parseTimeframe(timeframe);
    const startDate = new Date();
    
    const milestoneTemplates = [
      {
        phase: 'discovery' as const,
        title: 'Foundation & Research',
        description: 'Understand requirements, gather resources, and create initial plan',
        monthOffset: Math.floor(totalMonths * 0.2)
      },
      {
        phase: 'planning' as const,
        title: 'Strategic Planning',
        description: 'Develop detailed action plan and set up systems',
        monthOffset: Math.floor(totalMonths * 0.4)
      },
      {
        phase: 'execution' as const,
        title: 'Active Implementation',
        description: 'Execute core activities and track progress',
        monthOffset: Math.floor(totalMonths * 0.8)
      },
      {
        phase: 'analysis' as const,
        title: 'Review & Optimization',
        description: 'Evaluate results and make final adjustments',
        monthOffset: totalMonths
      }
    ];

    return milestoneTemplates.map((template, index) => {
      const milestoneDate = new Date(startDate);
      milestoneDate.setMonth(milestoneDate.getMonth() + template.monthOffset);
      
      return {
        id: uuidv4(),
        title: template.title,
        description: template.description,
        target_date: milestoneDate.toISOString(),
        completed: false,
        completion_criteria: this.generateCompletionCriteria(template.phase),
        phase: template.phase,
        order: index + 1
      };
    });
  }

  private generateCompletionCriteria(phase: string): string[] {
    const criteriaMap = {
      discovery: [
        'Research completed and documented',
        'Initial resources identified',
        'Success metrics defined'
      ],
      planning: [
        'Detailed action plan created',
        'Timeline and milestones established',
        'Required tools and systems set up'
      ],
      execution: [
        'Core activities implemented',
        'Progress tracking system active',
        'Key results achieved'
      ],
      analysis: [
        'Results evaluated and documented',
        'Lessons learned captured',
        'Next steps identified'
      ]
    };
    
    return criteriaMap[phase] || ['Milestone completed'];
  }

  private createTasksForMilestones(milestones: EnhancedMilestone[]): EnhancedTask[] {
    const tasks: EnhancedTask[] = [];
    
    milestones.forEach((milestone, milestoneIndex) => {
      const taskTemplates = this.getTaskTemplatesForPhase(milestone.phase);
      
      taskTemplates.forEach((template, taskIndex) => {
        tasks.push({
          id: uuidv4(),
          title: template.title,
          description: template.description,
          milestone_id: milestone.id,
          completed: false,
          estimated_duration: template.duration,
          energy_level_required: template.energy,
          category: template.category,
          prerequisites: template.prerequisites,
          order: taskIndex + 1
        });
      });
    });
    
    return tasks;
  }

  private getTaskTemplatesForPhase(phase: string) {
    const templates = {
      discovery: [
        {
          title: 'Define Success Criteria',
          description: 'Clearly define what success looks like for this goal',
          duration: '1-2 hours',
          energy: 'medium' as const,
          category: 'planning',
          prerequisites: []
        },
        {
          title: 'Research Best Practices',
          description: 'Study successful approaches and gather insights',
          duration: '2-3 hours',
          energy: 'medium' as const,
          category: 'research',
          prerequisites: []
        },
        {
          title: 'Identify Required Resources',
          description: 'List all tools, skills, and resources needed',
          duration: '30-60 minutes',
          energy: 'low' as const,
          category: 'planning',
          prerequisites: ['Research Best Practices']
        }
      ],
      planning: [
        {
          title: 'Create Action Plan',
          description: 'Break down the goal into specific, actionable steps',
          duration: '2-3 hours',
          energy: 'high' as const,
          category: 'planning',
          prerequisites: []
        },
        {
          title: 'Set Up Tracking System',
          description: 'Establish method to monitor progress and results',
          duration: '1 hour',
          energy: 'medium' as const,
          category: 'organization',
          prerequisites: ['Create Action Plan']
        },
        {
          title: 'Prepare Environment',
          description: 'Set up workspace and gather necessary tools',
          duration: '1-2 hours',
          energy: 'medium' as const,
          category: 'preparation',
          prerequisites: ['Set Up Tracking System']
        }
      ],
      execution: [
        {
          title: 'Begin Core Activities',
          description: 'Start implementing the main activities of your plan',
          duration: 'Ongoing',
          energy: 'high' as const,
          category: 'execution',
          prerequisites: []
        },
        {
          title: 'Weekly Progress Review',
          description: 'Review progress weekly and adjust approach as needed',
          duration: '30 minutes/week',
          energy: 'low' as const,
          category: 'review',
          prerequisites: ['Begin Core Activities']
        },
        {
          title: 'Handle Obstacles',
          description: 'Address challenges and adapt strategy when needed',
          duration: 'As needed',
          energy: 'medium' as const,
          category: 'problem-solving',
          prerequisites: ['Weekly Progress Review']
        }
      ],
      analysis: [
        {
          title: 'Evaluate Results',
          description: 'Assess what was achieved against initial goals',
          duration: '1-2 hours',
          energy: 'medium' as const,
          category: 'evaluation',
          prerequisites: []
        },
        {
          title: 'Document Lessons Learned',
          description: 'Capture insights and learnings for future goals',
          duration: '1 hour',
          energy: 'low' as const,
          category: 'documentation',
          prerequisites: ['Evaluate Results']
        },
        {
          title: 'Plan Next Steps',
          description: 'Determine follow-up actions or new goals',
          duration: '30-60 minutes',
          energy: 'medium' as const,
          category: 'planning',
          prerequisites: ['Document Lessons Learned']
        }
      ]
    };
    
    return templates[phase] || [];
  }

  private generateBlueprintAlignment(blueprintData: BlueprintData, category: string): string[] {
    const alignments: string[] = [];
    
    if (blueprintData?.cognition_mbti?.type) {
      alignments.push(`Optimized for ${blueprintData.cognition_mbti.type} thinking style`);
    }
    
    if (blueprintData?.energy_strategy_human_design?.type) {
      alignments.push(`Aligned with ${blueprintData.energy_strategy_human_design.type} energy strategy`);
    }
    
    if (blueprintData?.values_life_path?.lifePathNumber) {
      alignments.push(`Supports Life Path ${blueprintData.values_life_path.lifePathNumber} growth`);
    }
    
    return alignments.slice(0, 2); // Keep it concise
  }
}

export const enhancedGoalDecompositionService = new EnhancedGoalDecompositionService();

import { supabase } from "@/integrations/supabase/client";

export interface Goal {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  timeframe: string;
  success_criteria: string[];
  milestones: Milestone[];
  tasks: Task[];
  blueprint_alignment: string[];
  energy_requirements: string;
  optimal_timing: string[];
  created_at: string;
  target_completion: string;
  progress: number;
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  target_date: string;
  completion_criteria: string[];
  dependencies: string[];
  blueprint_considerations: string[];
  completed: boolean;
  progress: number;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  category: 'planning' | 'execution' | 'review' | 'communication';
  estimated_duration: string;
  energy_level_required: 'low' | 'medium' | 'high';
  optimal_time_of_day: string[];
  blueprint_alignment: string[];
  dependencies: string[];
  milestone_id?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  due_date?: string;
}

export interface BlueprintData {
  cognition_mbti?: {
    type: string;
    dominant_function: string;
    auxiliary_function: string;
    task_approach: string;
    decision_making: string;
  };
  energy_strategy_human_design?: {
    type: string;
    authority: string;
    strategy: string;
    energy_type: string;
    pacing: string;
  };
  values_life_path?: {
    lifePathNumber: number;
    meaningful_areas: string[];
    purpose_alignment: string;
  };
  archetype_western?: {
    sun_sign: string;
    leadership_style: string;
  };
  bashar_suite?: {
    excitement_compass: string;
    core_beliefs: string[];
    driving_forces: string[];
  };
}

class GoalDecompositionService {
  async decomposeGoal(
    goalDescription: string,
    timeframe: string,
    category: string,
    blueprintData: BlueprintData
  ): Promise<Goal> {
    try {
      console.log("Starting AI-powered goal decomposition...");
      
      // Generate comprehensive system prompt for goal decomposition
      const systemPrompt = this.generateDecompositionPrompt(blueprintData);
      
      const { data, error } = await supabase.functions.invoke("ai-coach", {
        body: {
          message: `Break down this goal into a detailed, actionable plan:

GOAL: ${goalDescription}
TIMEFRAME: ${timeframe}
CATEGORY: ${category}

Create a comprehensive breakdown including:
1. 3-4 major milestones with specific target dates
2. 8-12 actionable tasks distributed across milestones
3. Blueprint alignment recommendations
4. Success criteria for each milestone

Structure your response clearly with numbered sections for milestones and tasks.`,
          sessionId: `goal_decomposition_${Date.now()}`,
          includeBlueprint: true,
          agentType: "coach",
          language: "en",
          systemPrompt: systemPrompt,
          journeyContext: ""
        },
      });

      if (error) throw error;

      console.log("AI Response received:", data.response);
      
      // Always use intelligent parsing since AI responses are typically text
      const decomposedGoal = this.parseTextResponse(data.response, goalDescription, timeframe, category, blueprintData);
      
      console.log("Final decomposed goal:", decomposedGoal);
      return decomposedGoal;
    } catch (error) {
      console.error("Error in goal decomposition:", error);
      // Fallback to rule-based decomposition
      return this.fallbackDecomposition(goalDescription, timeframe, category, blueprintData);
    }
  }

  private generateDecompositionPrompt(blueprintData: BlueprintData): string {
    const mbti = blueprintData.cognition_mbti?.type || "Unknown";
    const hdType = blueprintData.energy_strategy_human_design?.type || "Unknown";
    const lifePath = blueprintData.values_life_path?.lifePathNumber || 1;
    const sunSign = blueprintData.archetype_western?.sun_sign || "Unknown";

    return `You are an expert goal decomposition specialist with deep knowledge of personality-based achievement strategies.

USER BLUEPRINT ANALYSIS:
- MBTI Type: ${mbti} (${blueprintData.cognition_mbti?.dominant_function} dominant)
- Human Design: ${hdType} (${blueprintData.energy_strategy_human_design?.strategy} strategy)
- Life Path: ${lifePath} (Purpose: ${blueprintData.values_life_path?.purpose_alignment})
- Leadership Style: ${blueprintData.archetype_western?.leadership_style}
- Energy Type: ${blueprintData.energy_strategy_human_design?.energy_type}
- Decision Making: ${blueprintData.cognition_mbti?.decision_making}

DECOMPOSITION PRINCIPLES:
1. Create 3-4 major milestones with specific target dates
2. Generate 8-12 actionable tasks distributed across milestones
3. Align tasks with the user's MBTI cognitive preferences
4. Consider Human Design energy management for pacing
5. Include blueprint-specific success strategies

RESPONSE FORMAT:
Structure your response with clear sections:

MILESTONES:
1. [Milestone Title] - [Target Date]
   Description: [What this milestone achieves]
   Success Criteria: [How to measure completion]

2. [Next Milestone Title] - [Target Date]
   ...

TASKS:
1. [Task Title] for Milestone 1
   Description: [What needs to be done]
   Duration: [Time estimate]
   Energy: [Low/Medium/High]

2. [Next Task Title] for Milestone 1
   ...

Provide detailed, personalized breakdowns that honor the user's unique blueprint while ensuring practical achievability.`;
  }

  private parseTextResponse(
    response: string,
    originalGoal: string,
    timeframe: string,
    category: string,
    blueprintData: BlueprintData
  ): Goal {
    console.log("Parsing AI text response...");
    
    const milestones: Milestone[] = [];
    const tasks: Task[] = [];
    const successCriteria: string[] = [];
    const blueprintAlignment: string[] = [];

    const lines = response.split('\n').filter(line => line.trim());
    
    let currentSection = '';
    let currentMilestoneId = '';
    
    lines.forEach((line, index) => {
      const cleanLine = line.trim();
      
      // Detect sections
      if (cleanLine.toLowerCase().includes('milestone')) {
        currentSection = 'milestones';
      } else if (cleanLine.toLowerCase().includes('task')) {
        currentSection = 'tasks';
      }
      
      // Parse milestones
      if (currentSection === 'milestones' && (cleanLine.match(/^\d+\./) || cleanLine.toLowerCase().includes('milestone'))) {
        const milestoneTitle = cleanLine
          .replace(/^\d+\.\s*/, '')
          .replace(/milestone\s*\d*:?\s*/i, '')
          .replace(/\s*-\s*.*$/, '')
          .trim();
        
        if (milestoneTitle) {
          const milestoneId = `milestone_${Date.now()}_${milestones.length}`;
          currentMilestoneId = milestoneId;
          
          const milestone: Milestone = {
            id: milestoneId,
            title: milestoneTitle,
            description: lines[index + 1]?.trim().replace(/description:\s*/i, '') || milestoneTitle,
            target_date: this.calculateMilestoneDate(timeframe, milestones.length),
            completion_criteria: this.extractCriteria(lines, index),
            dependencies: [],
            blueprint_considerations: this.extractBlueprintConsiderations(milestoneTitle, blueprintData),
            completed: false,
            progress: 0
          };
          milestones.push(milestone);
        }
      }
      
      // Parse tasks
      if (currentSection === 'tasks' && cleanLine.match(/^\d+\./)) {
        const taskTitle = cleanLine
          .replace(/^\d+\.\s*/, '')
          .replace(/for milestone \d+/i, '')
          .trim();
        
        if (taskTitle) {
          const task: Task = {
            id: `task_${Date.now()}_${tasks.length}`,
            title: taskTitle,
            description: lines[index + 1]?.trim().replace(/description:\s*/i, '') || taskTitle,
            category: this.categorizeTask(taskTitle, blueprintData),
            estimated_duration: this.extractDuration(lines, index),
            energy_level_required: this.assessEnergyLevel(taskTitle, blueprintData),
            optimal_time_of_day: this.suggestOptimalTiming(taskTitle, blueprintData),
            blueprint_alignment: this.extractBlueprintConsiderations(taskTitle, blueprintData),
            dependencies: [],
            milestone_id: currentMilestoneId,
            completed: false,
            priority: this.assessTaskPriority(taskTitle),
          };
          tasks.push(task);
        }
      }
      
      // Extract success criteria
      if (cleanLine.toLowerCase().includes('success') || cleanLine.toLowerCase().includes('criteria')) {
        successCriteria.push(cleanLine.trim());
      }
      
      // Extract blueprint alignment
      if (cleanLine.toLowerCase().includes(blueprintData.cognition_mbti?.type.toLowerCase() || '') ||
          cleanLine.toLowerCase().includes(blueprintData.energy_strategy_human_design?.type.toLowerCase() || '')) {
        blueprintAlignment.push(cleanLine.trim());
      }
    });

    // Ensure we have at least some milestones and tasks
    if (milestones.length === 0) {
      milestones.push(...this.generateDefaultMilestones(originalGoal, timeframe, blueprintData));
    }
    
    if (tasks.length === 0) {
      tasks.push(...this.generateDefaultTasks(originalGoal, milestones, blueprintData));
    }

    console.log(`Generated ${milestones.length} milestones and ${tasks.length} tasks`);

    return {
      id: `goal_${Date.now()}`,
      title: originalGoal,
      description: response.substring(0, 200) + '...',
      category,
      priority: 'medium',
      timeframe,
      success_criteria: successCriteria.length > 0 ? successCriteria : [`Complete: ${originalGoal}`],
      milestones,
      tasks,
      blueprint_alignment: blueprintAlignment.length > 0 ? blueprintAlignment : this.generateBlueprintAlignment(blueprintData),
      energy_requirements: blueprintData.energy_strategy_human_design?.energy_type || 'medium',
      optimal_timing: this.generateOptimalTiming(blueprintData),
      created_at: new Date().toISOString(),
      target_completion: this.calculateTargetDate(timeframe),
      progress: 0
    };
  }

  private extractCriteria(lines: string[], startIndex: number): string[] {
    const criteria: string[] = [];
    for (let i = startIndex + 1; i < Math.min(startIndex + 5, lines.length); i++) {
      const line = lines[i]?.trim();
      if (line && (line.toLowerCase().includes('criteria') || line.toLowerCase().includes('success'))) {
        criteria.push(line.replace(/success criteria:\s*/i, '').trim());
      }
    }
    return criteria.length > 0 ? criteria : ['Milestone completed successfully'];
  }

  private extractDuration(lines: string[], startIndex: number): string {
    for (let i = startIndex + 1; i < Math.min(startIndex + 3, lines.length); i++) {
      const line = lines[i]?.trim().toLowerCase();
      if (line && line.includes('duration')) {
        const match = line.match(/(\d+)\s*(hour|minute|day)/);
        if (match) return `${match[1]} ${match[2]}${match[1] !== '1' ? 's' : ''}`;
      }
    }
    return '1-2 hours';
  }

  private categorizeTask(taskText: string, blueprintData: BlueprintData): 'planning' | 'execution' | 'review' | 'communication' {
    const mbti = blueprintData.cognition_mbti?.type || '';
    const lowerTask = taskText.toLowerCase();
    
    if (lowerTask.includes('research') || lowerTask.includes('plan') || lowerTask.includes('strategy')) {
      return 'planning';
    }
    if (lowerTask.includes('build') || lowerTask.includes('create') || lowerTask.includes('implement')) {
      return 'execution';
    }
    if (lowerTask.includes('review') || lowerTask.includes('analyze') || lowerTask.includes('optimize')) {
      return 'review';
    }
    if (lowerTask.includes('share') || lowerTask.includes('present') || lowerTask.includes('collaborate')) {
      return 'communication';
    }
    
    // MBTI-based defaults
    if (mbti.includes('N')) return 'planning';
    if (mbti.includes('S')) return 'execution';
    if (mbti.includes('T')) return 'review';
    if (mbti.includes('F')) return 'communication';
    
    return 'execution';
  }

  private assessEnergyLevel(taskText: string, blueprintData: BlueprintData): 'low' | 'medium' | 'high' {
    const lowerTask = taskText.toLowerCase();
    const hdType = blueprintData.energy_strategy_human_design?.type || '';
    
    if (lowerTask.includes('research') || lowerTask.includes('review')) return 'low';
    if (lowerTask.includes('create') || lowerTask.includes('build') || lowerTask.includes('implement')) {
      return hdType === 'Projector' ? 'medium' : 'high';
    }
    if (lowerTask.includes('present') || lowerTask.includes('launch')) return 'high';
    
    return 'medium';
  }

  private suggestOptimalTiming(taskText: string, blueprintData: BlueprintData): string[] {
    const category = this.categorizeTask(taskText, blueprintData);
    const hdType = blueprintData.energy_strategy_human_design?.type || '';
    
    switch (category) {
      case 'planning':
        return hdType === 'Projector' ? ['morning', 'early afternoon'] : ['morning'];
      case 'execution':
        return hdType === 'Generator' ? ['morning', 'afternoon'] : ['morning'];
      case 'review':
        return ['afternoon', 'evening'];
      case 'communication':
        return ['afternoon'];
      default:
        return ['morning'];
    }
  }

  private assessTaskPriority(taskText: string): 'low' | 'medium' | 'high' {
    const lowerTask = taskText.toLowerCase();
    
    if (lowerTask.includes('critical') || lowerTask.includes('urgent') || lowerTask.includes('deadline')) {
      return 'high';
    }
    if (lowerTask.includes('foundation') || lowerTask.includes('core') || lowerTask.includes('essential')) {
      return 'high';
    }
    if (lowerTask.includes('nice to have') || lowerTask.includes('optional')) {
      return 'low';
    }
    
    return 'medium';
  }

  private extractBlueprintConsiderations(text: string, blueprintData: BlueprintData): string[] {
    const considerations: string[] = [];
    const mbti = blueprintData.cognition_mbti?.type || '';
    const hdType = blueprintData.energy_strategy_human_design?.type || '';
    
    // Add MBTI-specific considerations
    if (mbti.includes('I') && text.toLowerCase().includes('collaborate')) {
      considerations.push('Consider solo preparation time before collaboration');
    }
    if (mbti.includes('E') && text.toLowerCase().includes('research')) {
      considerations.push('Include discussion or brainstorming opportunities');
    }
    
    // Add Human Design considerations
    if (hdType === 'Projector' && text.toLowerCase().includes('lead')) {
      considerations.push('Wait for invitation or recognition before leading');
    }
    if (hdType === 'Generator' && text.toLowerCase().includes('initiate')) {
      considerations.push('Respond to external opportunities rather than initiating');
    }
    
    return considerations;
  }

  private calculateMilestoneDate(timeframe: string, milestoneIndex: number): string {
    const now = new Date();
    let totalDays = 30; // default
    
    if (timeframe.includes('week')) totalDays = 7 * parseInt(timeframe) || 7;
    if (timeframe.includes('month')) totalDays = 30 * parseInt(timeframe) || 30;
    if (timeframe.includes('year')) totalDays = 365 * parseInt(timeframe) || 365;
    
    const milestoneInterval = totalDays / 4; // 4 milestones max
    const targetDate = new Date(now.getTime() + (milestoneInterval * (milestoneIndex + 1) * 24 * 60 * 60 * 1000));
    
    return targetDate.toISOString().split('T')[0];
  }

  private calculateTargetDate(timeframe: string): string {
    const now = new Date();
    let totalDays = 30;
    
    if (timeframe.includes('week')) totalDays = 7 * parseInt(timeframe) || 7;
    if (timeframe.includes('month')) totalDays = 30 * parseInt(timeframe) || 30;
    if (timeframe.includes('year')) totalDays = 365 * parseInt(timeframe) || 365;
    
    const targetDate = new Date(now.getTime() + totalDays * 24 * 60 * 60 * 1000);
    return targetDate.toISOString().split('T')[0];
  }

  private generateOptimalTiming(blueprintData: BlueprintData): string[] {
    const timing: string[] = [];
    const hdType = blueprintData.energy_strategy_human_design?.type || '';
    const sunSign = blueprintData.archetype_western?.sun_sign || '';
    
    // Human Design timing
    if (hdType === 'Generator') timing.push('High energy mornings', 'Sustainable pacing');
    if (hdType === 'Projector') timing.push('Recognition opportunities', 'Rest between activities');
    if (hdType === 'Manifestor') timing.push('Independent work blocks', 'Impact-focused timing');
    
    // Astrological timing
    if (sunSign.includes('Fire')) timing.push('Action-oriented phases');
    if (sunSign.includes('Earth')) timing.push('Steady, methodical progress');
    if (sunSign.includes('Air')) timing.push('Communication and planning phases');
    if (sunSign.includes('Water')) timing.push('Intuitive and reflective timing');
    
    return timing;
  }

  private generateBlueprintAlignment(blueprintData: BlueprintData): string[] {
    const alignment: string[] = [];
    
    if (blueprintData.cognition_mbti?.type) {
      alignment.push(`MBTI ${blueprintData.cognition_mbti.type} approach`);
    }
    if (blueprintData.energy_strategy_human_design?.type) {
      alignment.push(`${blueprintData.energy_strategy_human_design.type} energy strategy`);
    }
    if (blueprintData.values_life_path?.lifePathNumber) {
      alignment.push(`Life Path ${blueprintData.values_life_path.lifePathNumber} purpose`);
    }
    
    return alignment;
  }

  private generateDefaultMilestones(goalDescription: string, timeframe: string, blueprintData: BlueprintData): Milestone[] {
    // Generate 3-4 default milestones based on goal type and blueprint
    return [
      {
        id: `milestone_${Date.now()}_1`,
        title: 'Foundation & Planning',
        description: 'Establish foundation and detailed planning',
        target_date: this.calculateMilestoneDate(timeframe, 0),
        completion_criteria: ['Plan completed', 'Resources identified'],
        dependencies: [],
        blueprint_considerations: this.generateBlueprintAlignment(blueprintData),
        completed: false,
        progress: 0
      },
      {
        id: `milestone_${Date.now()}_2`,
        title: 'Implementation Phase',
        description: 'Active implementation and progress',
        target_date: this.calculateMilestoneDate(timeframe, 1),
        completion_criteria: ['Core implementation complete'],
        dependencies: [`milestone_${Date.now()}_1`],
        blueprint_considerations: [],
        completed: false,
        progress: 0
      },
      {
        id: `milestone_${Date.now()}_3`,
        title: 'Optimization & Completion',
        description: 'Final optimization and goal completion',
        target_date: this.calculateMilestoneDate(timeframe, 2),
        completion_criteria: ['Goal achieved', 'Results validated'],
        dependencies: [`milestone_${Date.now()}_2`],
        blueprint_considerations: [],
        completed: false,
        progress: 0
      }
    ];
  }

  private generateDefaultTasks(goalDescription: string, milestones: Milestone[], blueprintData: BlueprintData): Task[] {
    const tasks: Task[] = [];
    
    milestones.forEach((milestone, index) => {
      // Generate 2-3 tasks per milestone
      for (let i = 0; i < 3; i++) {
        tasks.push({
          id: `task_${Date.now()}_${index}_${i}`,
          title: `Task ${i + 1} for ${milestone.title}`,
          description: `Specific task contributing to ${milestone.title}`,
          category: this.getDefaultTaskCategory(i),
          estimated_duration: '1-2 hours',
          energy_level_required: 'medium',
          optimal_time_of_day: ['morning'],
          blueprint_alignment: [],
          dependencies: [],
          milestone_id: milestone.id,
          completed: false,
          priority: 'medium'
        });
      }
    });
    
    return tasks;
  }

  private getDefaultTaskCategory(index: number): 'planning' | 'execution' | 'review' | 'communication' {
    const categories: Array<'planning' | 'execution' | 'review' | 'communication'> = ['planning', 'execution', 'review'];
    return categories[index % categories.length];
  }

  private fallbackDecomposition(
    goalDescription: string,
    timeframe: string,
    category: string,
    blueprintData: BlueprintData
  ): Goal {
    // Rule-based fallback decomposition
    const milestones = this.generateDefaultMilestones(goalDescription, timeframe, blueprintData);
    const tasks = this.generateDefaultTasks(goalDescription, milestones, blueprintData);
    
    return {
      id: `goal_${Date.now()}`,
      title: goalDescription,
      description: `A ${timeframe} goal in ${category}`,
      category,
      priority: 'medium',
      timeframe,
      success_criteria: [`Complete: ${goalDescription}`],
      milestones,
      tasks,
      blueprint_alignment: this.generateBlueprintAlignment(blueprintData),
      energy_requirements: blueprintData.energy_strategy_human_design?.energy_type || 'medium',
      optimal_timing: this.generateOptimalTiming(blueprintData),
      created_at: new Date().toISOString(),
      target_completion: this.calculateTargetDate(timeframe),
      progress: 0
    };
  }
}

export const goalDecompositionService = new GoalDecompositionService();

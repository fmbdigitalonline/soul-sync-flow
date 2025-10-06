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
      
      const { data, error } = await supabase.functions.invoke("ai-coach-v2", {
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
      
      // Use the robust parsing approach
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

    // More robust parsing approach
    const sections = this.splitResponseIntoSections(response);
    
    // Parse milestones section
    if (sections.milestones) {
      sections.milestones.forEach((milestoneText, index) => {
        const milestone = this.parseMilestone(milestoneText, index, timeframe, blueprintData);
        if (milestone) milestones.push(milestone);
      });
    }
    
    // Parse tasks section
    if (sections.tasks) {
      sections.tasks.forEach((taskText, index) => {
        const task = this.parseTask(taskText, index, milestones, blueprintData);
        if (task) tasks.push(task);
      });
    }

    // Extract success criteria from anywhere in the response
    successCriteria.push(...this.extractSuccessCriteria(response));
    
    // Extract blueprint alignment mentions
    blueprintAlignment.push(...this.extractBlueprintAlignment(response, blueprintData));

    // Ensure we have at least some milestones and tasks
    if (milestones.length === 0) {
      console.log("No milestones parsed, generating defaults");
      milestones.push(...this.generateDefaultMilestones(originalGoal, timeframe, blueprintData));
    }
    
    if (tasks.length === 0) {
      console.log("No tasks parsed, generating defaults");
      tasks.push(...this.generateDefaultTasks(originalGoal, milestones, blueprintData));
    }

    // Ensure tasks are properly linked to milestones
    this.linkTasksToMilestones(tasks, milestones);

    console.log(`Successfully parsed ${milestones.length} milestones and ${tasks.length} tasks`);

    return {
      id: `goal_${Date.now()}`,
      title: originalGoal,
      description: this.extractGoalDescription(response) || `A ${timeframe} goal in ${category}`,
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

  private splitResponseIntoSections(response: string): {
    milestones: string[];
    tasks: string[];
    other: string[];
  } {
    const lines = response.split('\n').filter(line => line.trim());
    const result = {
      milestones: [] as string[],
      tasks: [] as string[],
      other: [] as string[]
    };
    
    let currentSection: 'milestones' | 'tasks' | 'other' = 'other';
    let currentItem = '';
    
    for (const line of lines) {
      const trimmed = line.trim();
      
      // Detect section headers more reliably
      if (this.isMilestoneHeader(trimmed)) {
        if (currentItem) result[currentSection].push(currentItem.trim());
        currentSection = 'milestones';
        currentItem = trimmed;
      } else if (this.isTaskHeader(trimmed)) {
        if (currentItem) result[currentSection].push(currentItem.trim());
        currentSection = 'tasks';
        currentItem = trimmed;
      } else if (this.isNumberedItem(trimmed)) {
        // Handle numbered items based on current section
        if (currentItem) result[currentSection].push(currentItem.trim());
        currentItem = trimmed;
      } else {
        // Continuation of current item
        if (currentItem) currentItem += '\n' + trimmed;
        else currentItem = trimmed;
      }
    }
    
    // Don't forget the last item
    if (currentItem) result[currentSection].push(currentItem.trim());
    
    return result;
  }

  private isMilestoneHeader(line: string): boolean {
    const lower = line.toLowerCase();
    return lower.includes('milestone') && (
      lower.startsWith('milestone') || 
      lower.includes('## milestone') ||
      lower.includes('# milestone')
    );
  }

  private isTaskHeader(line: string): boolean {
    const lower = line.toLowerCase();
    return lower.includes('task') && (
      lower.startsWith('task') || 
      lower.includes('## task') ||
      lower.includes('# task')
    );
  }

  private isNumberedItem(line: string): boolean {
    return /^\d+\.\s+/.test(line.trim());
  }

  private parseMilestone(
    milestoneText: string, 
    index: number, 
    timeframe: string, 
    blueprintData: BlueprintData
  ): Milestone | null {
    const lines = milestoneText.split('\n').filter(l => l.trim());
    if (lines.length === 0) return null;
    
    // Extract title from first line
    const firstLine = lines[0].trim();
    let title = firstLine
      .replace(/^\d+\.\s*/, '')
      .replace(/milestone\s*\d*:?\s*/i, '')
      .replace(/\s*-\s*\d{4}-\d{2}-\d{2}.*$/, '') // Remove dates
      .trim();
    
    if (!title) return null;
    
    // Extract description from subsequent lines
    const description = lines.slice(1)
      .filter(line => !line.toLowerCase().includes('description:'))
      .map(line => line.replace(/^description:\s*/i, '').trim())
      .join(' ')
      .trim() || title;
    
    // Extract completion criteria
    const criteria = this.extractCriteriaFromText(milestoneText);
    
    return {
      id: `milestone_${Date.now()}_${index}`,
      title,
      description,
      target_date: this.calculateMilestoneDate(timeframe, index),
      completion_criteria: criteria.length > 0 ? criteria : ['Milestone completed successfully'],
      dependencies: index > 0 ? [`milestone_${Date.now()}_${index - 1}`] : [],
      blueprint_considerations: this.extractBlueprintConsiderations(title, blueprintData),
      completed: false,
      progress: 0
    };
  }

  private parseTask(
    taskText: string, 
    index: number, 
    milestones: Milestone[], 
    blueprintData: BlueprintData
  ): Task | null {
    const lines = taskText.split('\n').filter(l => l.trim());
    if (lines.length === 0) return null;
    
    // Extract title from first line
    const firstLine = lines[0].trim();
    let title = firstLine
      .replace(/^\d+\.\s*/, '')
      .replace(/task\s*\d*:?\s*/i, '')
      .replace(/for milestone \d+/i, '')
      .trim();
    
    if (!title) return null;
    
    // Extract description
    const description = lines.slice(1)
      .filter(line => !line.toLowerCase().includes('description:'))
      .map(line => line.replace(/^description:\s*/i, '').trim())
      .join(' ')
      .trim() || title;
    
    // Determine which milestone this task belongs to
    const milestoneId = this.determineMilestoneForTask(taskText, index, milestones);
    
    return {
      id: `task_${Date.now()}_${index}`,
      title,
      description,
      category: this.categorizeTask(title, blueprintData),
      estimated_duration: this.extractDurationFromText(taskText) || '1-2 hours',
      energy_level_required: this.assessEnergyLevel(title, blueprintData),
      optimal_time_of_day: this.suggestOptimalTiming(title, blueprintData),
      blueprint_alignment: this.extractBlueprintConsiderations(title, blueprintData),
      dependencies: [],
      milestone_id: milestoneId,
      completed: false,
      priority: this.assessTaskPriority(title)
    };
  }

  private extractCriteriaFromText(text: string): string[] {
    const criteria: string[] = [];
    const lines = text.split('\n');
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.toLowerCase().includes('criteria') || 
          trimmed.toLowerCase().includes('success')) {
        // Extract criteria items
        const criteriaText = trimmed
          .replace(/success criteria:\s*/i, '')
          .replace(/criteria:\s*/i, '')
          .trim();
        if (criteriaText) criteria.push(criteriaText);
      }
    }
    
    return criteria;
  }

  private extractDurationFromText(text: string): string | null {
    const durationMatch = text.match(/duration:\s*([^\n]+)/i) || 
                         text.match(/(\d+)\s*(hour|minute|day|week)s?/i);
    
    if (durationMatch) {
      return durationMatch[1] || `${durationMatch[1]} ${durationMatch[2]}${durationMatch[1] !== '1' ? 's' : ''}`;
    }
    
    return null;
  }

  private determineMilestoneForTask(taskText: string, taskIndex: number, milestones: Milestone[]): string | undefined {
    // Look for explicit milestone references
    const milestoneMatch = taskText.match(/milestone (\d+)/i);
    if (milestoneMatch) {
      const milestoneNumber = parseInt(milestoneMatch[1]) - 1;
      if (milestoneNumber >= 0 && milestoneNumber < milestones.length) {
        return milestones[milestoneNumber].id;
      }
    }
    
    // Distribute tasks evenly across milestones
    if (milestones.length > 0) {
      const milestoneIndex = Math.floor(taskIndex / Math.ceil(10 / milestones.length));
      return milestones[Math.min(milestoneIndex, milestones.length - 1)]?.id;
    }
    
    return undefined;
  }

  private linkTasksToMilestones(tasks: Task[], milestones: Milestone[]): void {
    // Ensure all tasks are linked to milestones
    tasks.forEach((task, index) => {
      if (!task.milestone_id && milestones.length > 0) {
        const milestoneIndex = Math.floor(index / Math.ceil(tasks.length / milestones.length));
        task.milestone_id = milestones[Math.min(milestoneIndex, milestones.length - 1)]?.id;
      }
    });
  }

  private extractSuccessCriteria(response: string): string[] {
    const criteria: string[] = [];
    const lines = response.split('\n');
    
    for (const line of lines) {
      const trimmed = line.trim();
      if ((trimmed.toLowerCase().includes('success') && trimmed.toLowerCase().includes('criteria')) ||
          trimmed.toLowerCase().includes('measure') ||
          trimmed.toLowerCase().includes('achieve')) {
        criteria.push(trimmed);
      }
    }
    
    return criteria;
  }

  private extractGoalDescription(response: string): string | null {
    // Try to extract a meaningful description from the AI response
    const lines = response.split('\n').filter(l => l.trim());
    
    // Look for descriptive paragraphs (not headers or lists)
    for (const line of lines.slice(0, 5)) { // Check first 5 lines
      const trimmed = line.trim();
      if (trimmed.length > 50 && 
          !trimmed.match(/^\d+\./) && 
          !trimmed.toLowerCase().includes('milestone') &&
          !trimmed.toLowerCase().includes('task')) {
        return trimmed.substring(0, 200) + (trimmed.length > 200 ? '...' : '');
      }
    }
    
    return null;
  }

  private extractBlueprintAlignment(response: string, blueprintData: BlueprintData): string[] {
    const alignment: string[] = [];
    const lines = response.split('\n');
    
    for (const line of lines) {
      const trimmed = line.trim().toLowerCase();
      if (blueprintData.cognition_mbti?.type && trimmed.includes(blueprintData.cognition_mbti.type.toLowerCase())) {
        alignment.push(line.trim());
      }
      if (blueprintData.energy_strategy_human_design?.type && trimmed.includes(blueprintData.energy_strategy_human_design.type.toLowerCase())) {
        alignment.push(line.trim());
      }
    }
    
    return alignment;
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

import { enhancedAICoachService } from './enhanced-ai-coach-service';
import { BlueprintData } from './blueprint-service';
import { v4 as uuidv4 } from 'uuid';

export interface AIGeneratedGoal {
  id: string;
  title: string;
  description: string;
  category: string;
  timeframe: string;
  target_completion: string;
  created_at: string;
  milestones: AIGeneratedMilestone[];
  tasks: AIGeneratedTask[];
  blueprint_insights: string[];
  personalization_notes: string;
}

export interface AIGeneratedMilestone {
  id: string;
  title: string;
  description: string;
  target_date: string;
  completed: boolean;
  completion_criteria: string[];
  blueprint_alignment: string;
  order: number;
}

export interface AIGeneratedTask {
  id: string;
  title: string;
  description: string;
  milestone_id: string;
  completed: boolean;
  estimated_duration: string;
  energy_level_required: 'low' | 'medium' | 'high';
  category: string;
  optimal_timing: string[];
  blueprint_reasoning: string;
  order: number;
}

class AIGoalDecompositionService {
  async decomposeGoalWithAI(
    goalTitle: string,
    goalDescription: string,
    timeframe: string,
    category: string,
    blueprintData: BlueprintData
  ): Promise<AIGeneratedGoal> {
    const startTime = Date.now();
    console.log('🤖 Starting AI-powered goal decomposition with layered model strategy:', {
      goalTitle,
      category,
      timeframe,
      timestamp: startTime
    });
    
    // Create optimized prompt for AI goal decomposition
    const decompositionPrompt = this.createOptimizedDecompositionPrompt(
      goalTitle,
      goalDescription,
      timeframe,
      category,
      blueprintData
    );

    try {
      // Use cost-effective model for goal decomposition
      const sessionId = enhancedAICoachService.createNewSession('coach');
      
      console.log('📤 Sending request to AI coach service with optimized model...', {
        sessionId,
        promptLength: decompositionPrompt.length,
        timestamp: Date.now()
      });
      
      // Use layered model selection for goal decomposition
      const response = await enhancedAICoachService.sendMessage(
        decompositionPrompt,
        sessionId,
        true, // Include blueprint for personalization
        'coach', // Use coach mode for productivity focus
        'en'
      );

      const aiResponseTime = Date.now();
      console.log('📥 AI response received, parsing goal structure...', {
        responseLength: response.response?.length || 0,
        processingTime: aiResponseTime - startTime,
        timestamp: aiResponseTime
      });
      
      // Parse AI response and create structured goal
      const parsedGoal = await this.parseAIResponse(
        response.response,
        goalTitle,
        goalDescription,
        timeframe,
        category
      );

      const endTime = Date.now();
      console.log('✅ Goal decomposition completed successfully with layered models', {
        totalTime: endTime - startTime,
        goalId: parsedGoal.id,
        milestonesCount: parsedGoal.milestones.length,
        tasksCount: parsedGoal.tasks.length,
        timestamp: endTime
      });

      return parsedGoal;
    } catch (error) {
      const errorTime = Date.now();
      console.error('❌ Error in AI goal decomposition:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        processingTime: errorTime - startTime,
        timestamp: errorTime
      });
      
      // Enhanced fallback with blueprint awareness
      console.log('🔄 Creating enhanced blueprint-aware fallback...');
      return this.createEnhancedFallbackGoal(goalTitle, goalDescription, timeframe, category, blueprintData);
    }
  }

  private createOptimizedDecompositionPrompt(
    goalTitle: string,
    goalDescription: string,
    timeframe: string,
    category: string,
    blueprintData: BlueprintData
  ): string {
    // Compress blueprint context to reduce tokens (< 500 tokens)
    const compressedBlueprint = this.compressBlueprintContext(blueprintData);
    
    return `Create a personalized goal breakdown for: "${goalTitle}"

GOAL DETAILS:
- Description: ${goalDescription}
- Category: ${category}
- Timeframe: ${timeframe}

PERSONALITY (compressed): ${compressedBlueprint}

REQUIRED OUTPUT:
1. 3-4 MILESTONES with dates and completion criteria
2. 2-3 TASKS per milestone optimized for your personality
3. KEY INSIGHTS about alignment with your natural patterns

Be specific, actionable, and honor the personality design. Focus on what matters most.`;
  }

  private compressBlueprintContext(blueprintData: BlueprintData): string {
    if (!blueprintData) return "Standard approach";

    const compressed = [];
    
    if (blueprintData.cognition_mbti?.type) {
      compressed.push(`${blueprintData.cognition_mbti.type}`);
    }
    
    if (blueprintData.energy_strategy_human_design?.type && blueprintData.energy_strategy_human_design?.strategy) {
      compressed.push(`${blueprintData.energy_strategy_human_design.type}-${blueprintData.energy_strategy_human_design.strategy}`);
    }
    
    if (blueprintData.values_life_path?.lifePathNumber) {
      compressed.push(`LP${blueprintData.values_life_path.lifePathNumber}`);
    }

    return compressed.length > 0 ? compressed.join(', ') : "Personalized approach";
  }

  private async parseAIResponse(
    aiResponse: string,
    goalTitle: string,
    goalDescription: string,
    timeframe: string,
    category: string
  ): Promise<AIGeneratedGoal> {
    console.log('🔍 Parsing AI response into structured goal format...');
    
    const goalId = uuidv4();
    const targetDate = this.calculateTargetDate(timeframe);
    
    // Extract milestones and tasks from AI response
    const milestones = this.extractMilestonesFromResponse(aiResponse);
    const tasks = this.extractTasksFromResponse(aiResponse, milestones);
    const insights = this.extractInsightsFromResponse(aiResponse);
    
    console.log('📊 Parsed AI response structure:', {
      milestonesExtracted: milestones.length,
      tasksExtracted: tasks.length,
      insightsExtracted: insights.length
    });
    
    return {
      id: goalId,
      title: goalTitle,
      description: goalDescription || `AI-personalized journey: ${goalTitle}`,
      category,
      timeframe,
      target_completion: targetDate,
      created_at: new Date().toISOString(),
      milestones,
      tasks,
      blueprint_insights: insights,
      personalization_notes: "This goal was decomposed using your unique blueprint for maximum alignment with your natural patterns."
    };
  }

  private extractMilestonesFromResponse(response: string): AIGeneratedMilestone[] {
    // Simple extraction logic - in production, this could be more sophisticated
    const milestones: AIGeneratedMilestone[] = [];
    const milestonePattern = /(?:MILESTONE|Milestone)\s*\d*[:\-]?\s*([^\n]+)/gi;
    const matches = response.match(milestonePattern) || [];
    
    matches.forEach((match, index) => {
      // Ensure we have a string before calling replace
      const matchStr = String(match);
      const title = matchStr.replace(/(?:MILESTONE|Milestone)\s*\d*[:\-]?\s*/i, '').trim();
      if (title) {
        milestones.push({
          id: uuidv4(),
          title,
          description: `Personalized milestone: ${title}`,
          target_date: this.calculateMilestoneDate(index, matches.length),
          completed: false,
          completion_criteria: [`Complete ${title}`, "Validate progress", "Prepare for next phase"],
          blueprint_alignment: "Aligned with your cognitive and energy patterns",
          order: index + 1
        });
      }
    });

    // Fallback if no milestones extracted
    if (milestones.length === 0) {
      milestones.push(
        {
          id: uuidv4(),
          title: "Foundation Phase",
          description: "Establish groundwork and initial momentum",
          target_date: this.calculateMilestoneDate(0, 3),
          completed: false,
          completion_criteria: ["Initial research completed", "Resources identified", "Plan validated"],
          blueprint_alignment: "Honors your planning preferences",
          order: 1
        },
        {
          id: uuidv4(),
          title: "Implementation Phase",
          description: "Execute core activities and build momentum",
          target_date: this.calculateMilestoneDate(1, 3),
          completed: false,
          completion_criteria: ["Core activities underway", "Progress tracking active", "Adjustments made"],
          blueprint_alignment: "Matches your execution style",
          order: 2
        },
        {
          id: uuidv4(),
          title: "Completion Phase",
          description: "Finalize goal and integrate learnings",
          target_date: this.calculateMilestoneDate(2, 3),
          completed: false,
          completion_criteria: ["Goal achieved", "Results evaluated", "Next steps identified"],
          blueprint_alignment: "Supports your closure preferences",
          order: 3
        }
      );
    }

    return milestones;
  }

  private extractTasksFromResponse(response: string, milestones: AIGeneratedMilestone[]): AIGeneratedTask[] {
    const tasks: AIGeneratedTask[] = [];
    
    milestones.forEach((milestone, milestoneIndex) => {
      // Create 3-4 tasks per milestone
      for (let i = 0; i < 3; i++) {
        tasks.push({
          id: uuidv4(),
          title: `Blueprint-aligned task ${i + 1} for ${milestone.title}`,
          description: `Personalized task designed for your unique patterns`,
          milestone_id: milestone.id,
          completed: false,
          estimated_duration: ["30 minutes", "1 hour", "2 hours"][i] || "1 hour",
          energy_level_required: (["low", "medium", "high"] as const)[i % 3],
          category: milestone.title.toLowerCase().includes("foundation") ? "planning" : "execution",
          optimal_timing: ["morning", "afternoon", "evening"],
          blueprint_reasoning: "Designed to work with your cognitive functions and energy patterns",
          order: i + 1
        });
      }
    });

    return tasks;
  }

  private extractInsightsFromResponse(response: string): string[] {
    const insights = [];
    
    if (response.includes("resistance")) {
      insights.push("AI identified potential resistance patterns to watch for");
    }
    if (response.includes("energy")) {
      insights.push("Energy management strategies included based on your design");
    }
    if (response.includes("cognitive") || response.includes("MBTI")) {
      insights.push("Tasks optimized for your cognitive functions");
    }
    if (response.includes("excitement") || response.includes("motivation")) {
      insights.push("Motivation strategies aligned with your blueprint");
    }
    
    return insights.length > 0 ? insights : ["Personalized using your unique blueprint"];
  }

  private calculateTargetDate(timeframe: string): string {
    const now = new Date();
    const months = this.parseTimeframe(timeframe);
    now.setMonth(now.getMonth() + months);
    return now.toISOString();
  }

  private calculateMilestoneDate(index: number, total: number): string {
    const now = new Date();
    const progressRatio = (index + 1) / total;
    const daysOffset = Math.floor(progressRatio * 90); // Assume 90-day default
    now.setDate(now.getDate() + daysOffset);
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

  private createEnhancedFallbackGoal(
    goalTitle: string,
    goalDescription: string,
    timeframe: string,
    category: string,
    blueprintData: BlueprintData
  ): AIGeneratedGoal {
    console.log('🔧 Creating enhanced fallback goal with blueprint context...');
    
    const goalId = uuidv4();
    const targetDate = this.calculateTargetDate(timeframe);
    
    // Create blueprint-aware fallback milestones
    const userType = this.getUserTypeFromBlueprint(blueprintData);
    const milestones = this.createBlueprintAwareMilestones(goalTitle, userType);
    const tasks = this.createBlueprintAwareTasks(milestones, userType);
    const insights = this.createBlueprintInsights(blueprintData);
    
    return {
      id: goalId,
      title: goalTitle,
      description: goalDescription || `Enhanced journey for ${userType}: ${goalTitle}`,
      category,
      timeframe,
      target_completion: targetDate,
      created_at: new Date().toISOString(),
      milestones,
      tasks,
      blueprint_insights: insights,
      personalization_notes: `This goal was created with your ${userType} profile in mind. While AI personalization was temporarily unavailable, we've used your blueprint to create a structured approach.`
    };
  }

  private getUserTypeFromBlueprint(blueprintData: BlueprintData): string {
    if (!blueprintData) return 'focused individual';
    
    const mbti = blueprintData?.cognition_mbti?.type;
    const hdType = blueprintData?.energy_strategy_human_design?.type;
    
    if (mbti && mbti !== 'Unknown') return `${mbti} type`;
    if (hdType && hdType !== 'Unknown') return `${hdType} energy`;
    
    return 'unique blueprint';
  }

  private createBlueprintAwareMilestones(goalTitle: string, userType: string): AIGeneratedMilestone[] {
    return [
      {
        id: uuidv4(),
        title: "Foundation & Research",
        description: `Establish solid groundwork for "${goalTitle}" using your ${userType} approach to information gathering`,
        target_date: this.calculateMilestoneDate(0, 3),
        completed: false,
        completion_criteria: ["Research completed", "Resources identified", "Initial plan created"],
        blueprint_alignment: `Designed for your ${userType} preference for thorough preparation`,
        order: 1
      },
      {
        id: uuidv4(),
        title: "Implementation & Action",
        description: `Execute core activities with momentum that matches your ${userType} energy patterns`,
        target_date: this.calculateMilestoneDate(1, 3),
        completed: false,
        completion_criteria: ["Key actions initiated", "Progress tracking active", "Adjustments made"],
        blueprint_alignment: `Aligned with your ${userType} execution style`,
        order: 2
      },
      {
        id: uuidv4(),
        title: "Completion & Integration",
        description: `Finalize "${goalTitle}" and integrate learnings using your ${userType} closure process`,
        target_date: this.calculateMilestoneDate(2, 3),
        completed: false,
        completion_criteria: ["Goal achieved", "Results evaluated", "Next steps identified"],
        blueprint_alignment: `Honors your ${userType} approach to completion`,
        order: 3
      }
    ];
  }

  private createBlueprintAwareTasks(milestones: AIGeneratedMilestone[], userType: string): AIGeneratedTask[] {
    const tasks: AIGeneratedTask[] = [];
    
    milestones.forEach((milestone, milestoneIndex) => {
      for (let i = 0; i < 3; i++) {
        tasks.push({
          id: uuidv4(),
          title: `${userType}-optimized task ${i + 1} for ${milestone.title}`,
          description: `Task designed to work with your ${userType} cognitive and energy patterns`,
          milestone_id: milestone.id,
          completed: false,
          estimated_duration: ["30 minutes", "1 hour", "2 hours"][i] || "1 hour",
          energy_level_required: (["low", "medium", "high"] as const)[i % 3],
          category: milestone.title.toLowerCase().includes("foundation") ? "planning" : "execution",
          optimal_timing: ["morning", "afternoon", "evening"],
          blueprint_reasoning: `Tailored for your ${userType} work style and preferences`,
          order: i + 1
        });
      }
    });

    return tasks;
  }

  private createBlueprintInsights(blueprintData: BlueprintData): string[] {
    const insights = [];
    
    if (blueprintData?.cognition_mbti?.type) {
      insights.push(`Tasks structured for your ${blueprintData.cognition_mbti.type} cognitive functions`);
    }
    if (blueprintData?.energy_strategy_human_design?.strategy) {
      insights.push(`Energy management aligned with your ${blueprintData.energy_strategy_human_design.strategy} strategy`);
    }
    if (blueprintData?.values_life_path?.lifePathNumber) {
      insights.push(`Goal approach honors your Life Path ${blueprintData.values_life_path.lifePathNumber} themes`);
    }
    
    return insights.length > 0 ? insights : ["Blueprint-aware structure created for optimal alignment"];
  }

  private createFallbackGoal(
    goalTitle: string,
    goalDescription: string,
    timeframe: string,
    category: string
  ): AIGeneratedGoal {
    console.log('🔧 Creating basic fallback goal structure...');
    
    const goalId = uuidv4();
    const targetDate = this.calculateTargetDate(timeframe);
    
    return {
      id: goalId,
      title: goalTitle,
      description: goalDescription || `Basic journey: ${goalTitle}`,
      category,
      timeframe,
      target_completion: targetDate,
      created_at: new Date().toISOString(),
      milestones: [],
      tasks: [],
      blueprint_insights: ["Basic structure created - AI personalization temporarily unavailable"],
      personalization_notes: "Fallback goal created. AI services will be restored shortly."
    };
  }
}

export const aiGoalDecompositionService = new AIGoalDecompositionService();

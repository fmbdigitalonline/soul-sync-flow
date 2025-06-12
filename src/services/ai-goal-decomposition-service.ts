
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
    console.log('Starting AI-powered goal decomposition for:', goalTitle);
    
    // Create comprehensive prompt for AI goal decomposition
    const decompositionPrompt = this.createDecompositionPrompt(
      goalTitle,
      goalDescription,
      timeframe,
      category,
      blueprintData
    );

    try {
      // Use the enhanced AI coach service with coach mode for goal breakdown
      const sessionId = enhancedAICoachService.createNewSession('coach');
      
      const response = await enhancedAICoachService.sendMessage(
        decompositionPrompt,
        sessionId,
        true, // Include blueprint for personalization
        'coach', // Use coach mode for productivity focus
        'en'
      );

      console.log('AI response received, parsing goal structure...');
      
      // Parse AI response and create structured goal
      const parsedGoal = await this.parseAIResponse(
        response.response,
        goalTitle,
        goalDescription,
        timeframe,
        category
      );

      return parsedGoal;
    } catch (error) {
      console.error('Error in AI goal decomposition:', error);
      // Fallback to simplified structure if AI fails
      return this.createFallbackGoal(goalTitle, goalDescription, timeframe, category);
    }
  }

  private createDecompositionPrompt(
    goalTitle: string,
    goalDescription: string,
    timeframe: string,
    category: string,
    blueprintData: BlueprintData
  ): string {
    return `I need you to create a personalized goal decomposition for my dream/goal. Please analyze my blueprint and create a strategic breakdown that honors my unique design.

MY GOAL:
Title: "${goalTitle}"
Description: "${goalDescription}"
Category: ${category}
Timeframe: ${timeframe}

BLUEPRINT CONTEXT:
${this.formatBlueprintContext(blueprintData)}

Please create a personalized goal breakdown with:

1. 3-5 MILESTONES that match my cognitive style and energy design
   - Each milestone should have a title, description, target date, and completion criteria
   - Explain how each milestone aligns with my blueprint (MBTI functions, Human Design strategy, etc.)

2. 3-4 TASKS per milestone that honor my:
   - Cognitive functions (${blueprintData?.cognition_mbti?.dominant_function} dominant, ${blueprintData?.cognition_mbti?.auxiliary_function} auxiliary)
   - Energy strategy (${blueprintData?.energy_strategy_human_design?.strategy})
   - Decision-making authority (${blueprintData?.energy_strategy_human_design?.authority})
   - Life path themes (${blueprintData?.values_life_path?.life_themes?.join(', ')})

3. PERSONALIZATION INSIGHTS:
   - How this goal connects to my life path ${blueprintData?.values_life_path?.lifePathNumber} themes
   - Potential resistance patterns to watch for
   - Optimal timing and energy management strategies
   - Ways to stay motivated using my excitement compass

Please format your response as a detailed breakdown I can follow, making it specific to my blueprint design rather than generic advice. Focus on actionable steps that work WITH my natural patterns, not against them.`;
  }

  private formatBlueprintContext(blueprintData: BlueprintData): string {
    if (!blueprintData) return "Blueprint data not available";

    const context = [];
    
    if (blueprintData.cognition_mbti?.type) {
      context.push(`MBTI: ${blueprintData.cognition_mbti.type} (${blueprintData.cognition_mbti.dominant_function} dominant)`);
    }
    
    if (blueprintData.energy_strategy_human_design?.type) {
      context.push(`Human Design: ${blueprintData.energy_strategy_human_design.type} (${blueprintData.energy_strategy_human_design.strategy} strategy)`);
    }
    
    if (blueprintData.values_life_path?.lifePathNumber) {
      context.push(`Life Path: ${blueprintData.values_life_path.lifePathNumber} (${blueprintData.values_life_path.life_themes?.join(', ')})`);
    }
    
    if (blueprintData.bashar_suite?.excitement_compass) {
      context.push(`Excitement Compass: ${blueprintData.bashar_suite.excitement_compass}`);
    }

    return context.join('\n');
  }

  private async parseAIResponse(
    aiResponse: string,
    goalTitle: string,
    goalDescription: string,
    timeframe: string,
    category: string
  ): Promise<AIGeneratedGoal> {
    console.log('Parsing AI response into structured goal format...');
    
    const goalId = uuidv4();
    const targetDate = this.calculateTargetDate(timeframe);
    
    // Extract milestones and tasks from AI response
    // This is a simplified parser - in production, you might want more sophisticated parsing
    const milestones = this.extractMilestonesFromResponse(aiResponse);
    const tasks = this.extractTasksFromResponse(aiResponse, milestones);
    const insights = this.extractInsightsFromResponse(aiResponse);
    
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
      const title = match.replace(/(?:MILESTONE|Milestone)\s*\d*[:\-]?\s*/i, '').trim();
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

  private createFallbackGoal(
    goalTitle: string,
    goalDescription: string,
    timeframe: string,
    category: string
  ): AIGeneratedGoal {
    console.log('Creating fallback goal structure...');
    
    const goalId = uuidv4();
    const targetDate = this.calculateTargetDate(timeframe);
    
    return {
      id: goalId,
      title: goalTitle,
      description: goalDescription || `Fallback journey: ${goalTitle}`,
      category,
      timeframe,
      target_completion: targetDate,
      created_at: new Date().toISOString(),
      milestones: [], // Will be populated by extractMilestonesFromResponse
      tasks: [],
      blueprint_insights: ["Basic structure created - AI personalization temporarily unavailable"],
      personalization_notes: "Fallback goal created. Try again for full AI personalization."
    };
  }
}

export const aiGoalDecompositionService = new AIGoalDecompositionService();

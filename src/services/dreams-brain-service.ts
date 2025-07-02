
import { supabase } from "@/integrations/supabase/client";
import { enhancedPersonalityEngine } from "./enhanced-personality-engine";
import { tieredMemoryGraph } from "./tiered-memory-graph";
import { pieService } from "./pie-service";
import { LayeredBlueprint } from "@/types/personality-modules";

export interface DreamsBrainResponse {
  response: string;
  memoryStored: boolean;
  personalityApplied: boolean;
  actionableSteps: string[];
  milestoneProgress: number;
  taskBreakdown: string[];
  brainMetrics: {
    productivityLatency: number;
    actionCoherence: number;
    goalAlignment: number;
  };
}

class DreamsBrainService {
  private userId: string | null = null;
  private blueprint: Partial<LayeredBlueprint> = {};
  private sessionMemory = new Map<string, any>();
  private readonly NAMESPACE = 'dreams';

  async initialize(userId: string) {
    console.log("🎯 Initializing Dreams Brain Service for goal achievement:", userId);
    
    this.userId = userId;
    
    // Initialize with productivity-focused personality engine
    enhancedPersonalityEngine.setUserId(userId);
    
    // Initialize PIE with dreams/productivity-specific rules - fix: only pass userId
    await pieService.initialize(userId);
    
    // Load user blueprint for goal alignment
    await this.loadUserBlueprint();
    
    console.log("✅ Dreams Brain Service initialized for goal achievement");
  }

  private async loadUserBlueprint() {
    try {
      const { data, error } = await supabase
        .from('blueprints')
        .select('*')
        .eq('user_id', this.userId)
        .eq('is_active', true)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data && !error) {
        const userMeta = data.user_meta as { [key: string]: any; preferred_name?: string; full_name?: string; } | null;
        
        this.blueprint = {
          user_meta: userMeta || {}
        };
        
        enhancedPersonalityEngine.updateBlueprint(this.blueprint);
        console.log("🎯 Productivity blueprint loaded for goal-focused conversations");
      }
    } catch (error) {
      console.warn("⚠️ Could not load productivity blueprint:", error);
    }
  }

  async processDreamsMessage(
    message: string,
    sessionId: string
  ): Promise<DreamsBrainResponse> {
    if (!this.userId) {
      throw new Error("Dreams brain not initialized - no user ID");
    }

    const startTime = performance.now();
    console.log(`🎯 Processing dreams/goals message with action-oriented focus`);

    // Store in dreams-specific memory namespace
    const memoryId = await this.storeInDreamsMemory(message, sessionId, true);

    // Generate productivity-focused system prompt
    const systemPrompt = await this.generateDreamsSystemPrompt(message);

    // Process with goal/productivity focus
    const response = await this.generateDreamsResponse(message, systemPrompt);

    // Extract actionable insights and task breakdowns
    const actionableSteps = this.extractActionableSteps(response);
    const taskBreakdown = this.extractTaskBreakdown(response);
    const milestoneProgress = this.calculateMilestoneProgress(response);

    // Store AI response in dreams memory
    await this.storeInDreamsMemory(response, sessionId, false);

    const totalLatency = performance.now() - startTime;
    
    console.log(`✅ Dreams brain processing complete in ${totalLatency.toFixed(1)}ms`);

    return {
      response,
      memoryStored: !!memoryId,
      personalityApplied: true,
      actionableSteps,
      milestoneProgress,
      taskBreakdown,
      brainMetrics: {
        productivityLatency: totalLatency,
        actionCoherence: this.calculateActionCoherence(),
        goalAlignment: actionableSteps.length * 0.2
      }
    };
  }

  private async generateDreamsSystemPrompt(message: string): Promise<string> {
    const userName = this.blueprint.user_meta?.preferred_name || 'achiever';
    
    return `You are ${userName}'s strategic goal coach and productivity partner. Your role is to:

DREAMS & GOALS FOCUS:
- Break down big dreams into achievable milestones and tasks
- Provide strategic, action-oriented guidance
- Optimize productivity systems based on personality blueprint
- Track progress and celebrate achievements
- Maintain momentum toward goal completion

COMMUNICATION STYLE:
- Direct, clear, and action-focused responses
- Provide specific, measurable next steps
- Use motivational yet practical language
- Ask strategic questions that drive action
- Be results-oriented and efficiency-minded

PRODUCTIVITY APPROACH:
- Analyze goals through SMART criteria
- Create task hierarchies and milestone timelines
- Suggest productivity tools and systems
- Identify bottlenecks and optimization opportunities
- Provide accountability and progress tracking

Remember: ${userName} is here to turn dreams into reality. Every response should move them closer to their goals with concrete actions and strategic thinking.`;
  }

  private async generateDreamsResponse(message: string, systemPrompt: string): Promise<string> {
    try {
      const { data, error } = await supabase.functions.invoke("ai-coach", {
        body: {
          message,
          sessionId: `${this.NAMESPACE}_${Date.now()}`,
          includeBlueprint: true,
          agentType: "coach",
          language: "en",
          systemPrompt,
        },
      });

      if (error) throw error;
      return data.response;
    } catch (error) {
      console.error("Error in dreams response generation:", error);
      return "Let's break down your goal into actionable steps. What specific outcome are you working toward?";
    }
  }

  private async storeInDreamsMemory(content: string, sessionId: string, isUser: boolean): Promise<string | null> {
    try {
      // Use TMG's storeInHotMemory method with correct parameters
      const memoryId = await tieredMemoryGraph.storeInHotMemory(
        this.userId!,
        `${this.NAMESPACE}_${sessionId}`,
        {
          content,
          isUser,
          timestamp: new Date().toISOString(),
          type: 'dreams_goals_conversation'
        },
        5.0 // importance score
      );
      
      return memoryId;
    } catch (error) {
      console.error("Failed to store dreams memory:", error);
      return null;
    }
  }

  private extractActionableSteps(text: string): string[] {
    const actionPatterns = [
      /step \d+:.*?(?=step \d+:|$)/gi,
      /action:.*?(?=action:|$)/gi,
      /next.*?do.*?(?=[.!?])/gi,
      /start.*?by.*?(?=[.!?])/gi
    ];
    
    const steps: string[] = [];
    actionPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        steps.push(...matches.slice(0, 3));
      }
    });
    
    return steps.slice(0, 5);
  }

  private extractTaskBreakdown(text: string): string[] {
    const taskPatterns = [
      /task:.*?(?=task:|$)/gi,
      /\d+\.\s.*?(?=\d+\.\s|$)/gi,
      /•.*?(?=•|$)/gi
    ];
    
    const tasks: string[] = [];
    taskPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        tasks.push(...matches.slice(0, 4));
      }
    });
    
    return tasks.slice(0, 6);
  }

  private calculateMilestoneProgress(text: string): number {
    // Simple heuristic based on completion indicators
    const completionWords = text.match(/complete|done|finish|achieve|accomplish/gi) || [];
    return Math.min(completionWords.length * 10, 100);
  }

  private calculateActionCoherence(): number {
    // Simulate action coherence based on goal alignment
    return Math.random() * 0.2 + 0.8; // Range: 0.8 - 1.0
  }

  getDreamsContext() {
    return {
      mode: 'dreams_goals',
      namespace: this.NAMESPACE,
      focusAreas: ['goal_breakdown', 'task_management', 'milestone_tracking'],
      isInitialized: !!this.userId
    };
  }
}

export const dreamsBrainService = new DreamsBrainService();

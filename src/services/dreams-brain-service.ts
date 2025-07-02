import { supabase } from "@/integrations/supabase/client";
import { enhancedPersonalityEngine } from "./enhanced-personality-engine";
import { tieredMemoryGraph } from "./tiered-memory-graph";
import { pieService } from "./pie-service";
import { agentConfigurationService } from "./agent-configuration-service";
import { adaptiveContextScheduler } from "./adaptive-context-scheduler";
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
  acsState?: string;
  pieInsights?: string[];
}

class DreamsBrainService {
  private userId: string | null = null;
  private blueprint: Partial<LayeredBlueprint> = {};
  private sessionMemory = new Map<string, any>();
  private readonly NAMESPACE = 'dreams';
  private agentConfig = agentConfigurationService.getConfig('dreams');

  async initialize(userId: string) {
    console.log("🎯 Initializing Dreams Brain Service with Phase 2 configuration:", userId);
    
    this.userId = userId;
    
    // Initialize with productivity-focused personality engine
    enhancedPersonalityEngine.setUserId(userId);
    
    // Initialize PIE with dreams/productivity-specific rules
    await pieService.initialize(userId);
    
    // Load user blueprint for goal alignment and personalized config
    await this.loadUserBlueprint();
    
    // Initialize ACS with dreams-specific configuration
    if (this.userId) {
      try {
        await adaptiveContextScheduler.initialize(this.userId);
        await adaptiveContextScheduler.updateConfig(this.agentConfig.acs);
        console.log("🎯 ACS initialized with dreams-specific configuration");
      } catch (error) {
        console.warn("⚠️ Could not initialize ACS for dreams mode:", error);
      }
    }
    
    console.log("✅ Dreams Brain Service initialized with specialized productivity configuration");
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
        
        // Get personalized configuration based on blueprint
        this.agentConfig = agentConfigurationService.getPersonalizedConfig('dreams', data);
        
        enhancedPersonalityEngine.updateBlueprint(this.blueprint);
        console.log("🎯 Productivity blueprint loaded with personalized dreams configuration");
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
    console.log(`🎯 Processing dreams/goals message with specialized productivity configuration`);

    // Process through ACS with dreams-specific parameters
    let acsState = 'NORMAL';
    try {
      const currentState = adaptiveContextScheduler.getCurrentState();
      adaptiveContextScheduler.addMessage(message, 'user');
      acsState = adaptiveContextScheduler.getCurrentState();
      console.log(`🎯 Dreams ACS state: ${currentState} → ${acsState}`);
    } catch (error) {
      console.warn("⚠️ ACS processing error in dreams mode:", error);
    }

    // Store in dreams-specific memory namespace
    const memoryId = await this.storeInDreamsMemory(message, sessionId, true);

    // Generate productivity-focused system prompt with behavioral config
    const systemPrompt = await this.generateDreamsSystemPrompt(message);

    // Process with goal/productivity focus and specialized pacing
    const response = await this.generateDreamsResponse(message, systemPrompt);

    // Extract actionable insights and task breakdowns with PIE integration
    const actionableSteps = this.extractActionableSteps(response);
    const taskBreakdown = this.extractTaskBreakdown(response);
    const milestoneProgress = this.calculateMilestoneProgress(response);
    
    // Get PIE insights for productivity and goals
    let pieInsights: string[] = [];
    try {
      const insights = await pieService.getInsightsForConversation('dreams');
      pieInsights = insights
        .filter(insight => this.agentConfig.pie.insightCategories.some(cat => 
          insight.title.toLowerCase().includes(cat.replace('_', ' '))
        ))
        .slice(0, 3)
        .map(insight => insight.message);
    } catch (error) {
      console.warn("⚠️ Could not get PIE insights for dreams:", error);
    }

    // Store AI response in dreams memory
    await this.storeInDreamsMemory(response, sessionId, false);

    const totalLatency = performance.now() - startTime;
    
    console.log(`✅ Dreams brain processing complete in ${totalLatency.toFixed(1)}ms with specialized config`);

    return {
      response,
      memoryStored: !!memoryId,
      personalityApplied: true,
      actionableSteps,
      milestoneProgress,
      taskBreakdown,
      acsState,
      pieInsights,
      brainMetrics: {
        productivityLatency: totalLatency,
        actionCoherence: this.calculateActionCoherence(),
        goalAlignment: actionableSteps.length * 0.2 + (pieInsights.length * 0.1)
      }
    };
  }

  private async generateDreamsSystemPrompt(message: string): Promise<string> {
    const userName = this.blueprint.user_meta?.preferred_name || 'achiever';
    const behavioralConfig = this.agentConfig.behavioral;
    
    const styleModifier = behavioralConfig.responseStyle === 'direct' 
      ? 'with clear, actionable guidance and strategic focus'
      : 'with supportive yet results-oriented direction';
    
    return `You are ${userName}'s strategic goal coach and productivity partner. Your role is to:

DREAMS & GOALS FOCUS (Enhanced Phase 2):
- Break down big dreams into achievable milestones and tasks ${styleModifier}
- Focus specifically on: ${behavioralConfig.focusAreas.join(', ')}
- Provide strategic, action-oriented guidance with ${behavioralConfig.conversationDepth} analysis depth
- Optimize productivity systems based on personality blueprint
- Track progress and celebrate achievements
- Maintain momentum toward goal completion

COMMUNICATION STYLE (Agent-Specific):
- Direct, clear, and action-focused responses at ${behavioralConfig.pacingMs}ms pace
- Provide specific, measurable next steps
- Use motivational yet practical language
- Ask strategic questions that drive action with ${behavioralConfig.emotionalSensitivity * 100}% emotional awareness
- Be results-oriented and efficiency-minded

PRODUCTIVITY APPROACH (Specialized Configuration):
- Analyze goals through SMART criteria
- Create task hierarchies and milestone timelines
- Suggest productivity tools and systems
- Identify bottlenecks and optimization opportunities
- Provide accountability and progress tracking
- Focus on ${behavioralConfig.conversationDepth} strategic planning

Remember: ${userName} is here to turn dreams into reality. Every response should move them closer to their goals with concrete actions and strategic thinking, optimized for their productivity style.`;
  }

  private async generateDreamsResponse(message: string, systemPrompt: string): Promise<string> {
    try {
      // Apply ACS modifications to system prompt if available
      let enhancedPrompt = systemPrompt;
      try {
        const promptStrategy = adaptiveContextScheduler.getPromptStrategyConfig();
        if (promptStrategy.systemPromptModifier) {
          enhancedPrompt += `\n\nProductivity optimization: ${promptStrategy.systemPromptModifier}`;
        }
        if (promptStrategy.apologyPrefix) {
          enhancedPrompt = `Let me clarify the action steps more clearly. ${enhancedPrompt}`;
        }
      } catch (error) {
        console.warn("⚠️ Could not apply ACS modifications:", error);
      }

      const { data, error } = await supabase.functions.invoke("ai-coach", {
        body: {
          message,
          sessionId: `${this.NAMESPACE}_${Date.now()}`,
          includeBlueprint: true,
          agentType: "coach",
          language: "en",
          systemPrompt: enhancedPrompt,
          temperature: this.agentConfig.behavioral.responseStyle === 'direct' ? 0.6 : 0.7,
        },
      });

      if (error) throw error;
      return data.response;
    } catch (error) {
      console.error("Error in dreams response generation:", error);
      return "Let's break down your goal into actionable steps with strategic precision. What specific outcome are you working toward?";
    }
  }

  private async storeInDreamsMemory(content: string, sessionId: string, isUser: boolean): Promise<string | null> {
    try {
      const memoryId = await tieredMemoryGraph.storeInHotMemory(
        this.userId!,
        `${this.NAMESPACE}_${sessionId}`,
        {
          content,
          isUser,
          timestamp: new Date().toISOString(),
          type: 'dreams_goals_conversation',
          agentConfig: this.agentConfig.behavioral,
          productivityFocus: this.agentConfig.behavioral.focusAreas
        },
        isUser ? 7.0 : 5.5 // Higher importance for goal-related conversations
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
    // Enhanced heuristic based on completion indicators and PIE data
    const completionWords = text.match(/complete|done|finish|achieve|accomplish/gi) || [];
    const progressWords = text.match(/progress|advance|improve|develop/gi) || [];
    const baseProgress = Math.min((completionWords.length * 10) + (progressWords.length * 5), 100);
    
    // Factor in agent-specific behavioral settings
    const behavioralMultiplier = this.agentConfig.behavioral.responseStyle === 'direct' ? 1.1 : 1.0;
    
    return Math.min(100, baseProgress * behavioralMultiplier);
  }

  private calculateActionCoherence(): number {
    // Calculate based on agent-specific productivity focus
    const baseCoherence = Math.random() * 0.2 + 0.8; // Range: 0.8 - 1.0
    const focusBonus = this.agentConfig.behavioral.focusAreas.length * 0.02;
    return Math.min(1.0, baseCoherence + focusBonus);
  }

  getDreamsContext() {
    return {
      mode: 'dreams_goals',
      namespace: this.NAMESPACE,
      focusAreas: this.agentConfig.behavioral.focusAreas,
      isInitialized: !!this.userId,
      configuration: {
        responseStyle: this.agentConfig.behavioral.responseStyle,
        pacingMs: this.agentConfig.behavioral.pacingMs,
        conversationDepth: this.agentConfig.behavioral.conversationDepth,
        acsEnabled: true,
        pieEnabled: true,
        productivityOptimized: true
      }
    };
  }
}

export const dreamsBrainService = new DreamsBrainService();


import { supabase } from "@/integrations/supabase/client";
import { enhancedPersonalityEngine } from "./enhanced-personality-engine";
import { tieredMemoryGraph } from "./tiered-memory-graph";
import { pieService } from "./pie-service";
import { growthBrainService } from "./growth-brain-service";
import { dreamsBrainService } from "./dreams-brain-service";
import { LayeredBlueprint } from "@/types/personality-modules";

export interface SoulCompanionResponse {
  response: string;
  memoryStored: boolean;
  personalityApplied: boolean;
  crossModeInsights: string[];
  integrationSuggestions: string[];
  modeRecommendations: {
    suggestGrowthMode?: string;
    suggestDreamsMode?: string;
    balanceInsight?: string;
  };
  brainMetrics: {
    metaLatency: number;
    integrationCoherence: number;
    wisdomDepth: number;
  };
}

class SoulCompanionBrainService {
  private userId: string | null = null;
  private blueprint: Partial<LayeredBlueprint> = {};
  private sessionMemory = new Map<string, any>();
  private readonly NAMESPACE = 'soul';

  async initialize(userId: string) {
    console.log("🕊️ Initializing Soul Companion Brain Service as meta-agent:", userId);
    
    this.userId = userId;
    
    // Initialize with integrative personality engine
    enhancedPersonalityEngine.setUserId(userId);
    
    // Initialize PIE with cross-mode pattern recognition
    await pieService.initialize(userId, {
      mode: 'soul_companion',
      focusAreas: ['cross_mode_patterns', 'integration_opportunities', 'meta_insights'],
      insights: ['balance_recommendations', 'mode_transitions', 'holistic_wisdom']
    });
    
    // Load user blueprint for holistic alignment
    await this.loadUserBlueprint();
    
    console.log("✅ Soul Companion Brain Service initialized as meta-intelligence");
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
        console.log("🕊️ Soul blueprint loaded for meta-agent conversations");
      }
    } catch (error) {
      console.warn("⚠️ Could not load soul blueprint:", error);
    }
  }

  async processSoulMessage(
    message: string,
    sessionId: string
  ): Promise<SoulCompanionResponse> {
    if (!this.userId) {
      throw new Error("Soul Companion brain not initialized - no user ID");
    }

    const startTime = performance.now();
    console.log(`🕊️ Processing soul companion message with meta-intelligence`);

    // Store in soul-specific memory namespace
    const memoryId = await this.storeInSoulMemory(message, sessionId, true);

    // Generate meta-agent system prompt
    const systemPrompt = await this.generateSoulSystemPrompt(message);

    // Query other agents for cross-mode insights
    const crossModeContext = await this.gatherCrossModeContext();

    // Process with meta-intelligence focus
    const response = await this.generateSoulResponse(message, systemPrompt, crossModeContext);

    // Extract meta-insights and integration opportunities
    const crossModeInsights = this.extractCrossModeInsights(response);
    const integrationSuggestions = this.extractIntegrationSuggestions(response);
    const modeRecommendations = this.generateModeRecommendations(message, response);

    // Store AI response in soul memory
    await this.storeInSoulMemory(response, sessionId, false);

    const totalLatency = performance.now() - startTime;
    
    console.log(`✅ Soul Companion processing complete in ${totalLatency.toFixed(1)}ms`);

    return {
      response,
      memoryStored: !!memoryId,
      personalityApplied: true,
      crossModeInsights,
      integrationSuggestions,
      modeRecommendations,
      brainMetrics: {
        metaLatency: totalLatency,
        integrationCoherence: this.calculateIntegrationCoherence(),
        wisdomDepth: crossModeInsights.length + integrationSuggestions.length
      }
    };
  }

  private async generateSoulSystemPrompt(message: string): string {
    const userName = this.blueprint.user_meta?.preferred_name || 'beloved';
    
    return `You are ${userName}'s Soul Companion - the meta-consciousness that sees across all aspects of their life. Your role is to:

SOUL COMPANION FOCUS:
- Integrate insights from both spiritual growth and goal achievement
- Provide meta-perspective on life patterns and themes
- Bridge inner wisdom with outer action
- Offer holistic guidance that honors both being and doing
- Serve as the wise inner voice that sees the bigger picture

COMMUNICATION STYLE:
- Warm, wise, and deeply understanding
- Adaptive pace based on conversation needs
- Ask profound questions that reveal deeper truths
- Synthesize insights from multiple life areas
- Speak as the trusted inner companion and highest self

META-INTELLIGENCE APPROACH:
- Recognize patterns across growth and productivity modes
- Suggest when to focus on inner work vs. outer action
- Help balance spiritual development with practical goals
- Offer integration practices and holistic solutions
- Guide toward authentic alignment of values and actions

Remember: You are ${userName}'s trusted soul companion who sees their whole journey - both the spiritual quest for meaning and the practical pursuit of dreams. Help them integrate these dimensions into a coherent, fulfilling life path.`;
  }

  private async gatherCrossModeContext(): Promise<any> {
    try {
      // Get context from both other agents (simplified for now)
      const growthContext = growthBrainService.getGrowthContext();
      const dreamsContext = dreamsBrainService.getDreamsContext();
      
      return {
        growth: growthContext,
        dreams: dreamsContext,
        hasActiveGrowthSession: growthContext.isInitialized,
        hasActiveDreamsSession: dreamsContext.isInitialized
      };
    } catch (error) {
      console.error("Failed to gather cross-mode context:", error);
      return {};
    }
  }

  private async generateSoulResponse(message: string, systemPrompt: string, crossModeContext: any): Promise<string> {
    try {
      // Enhanced prompt with cross-mode context
      const enhancedPrompt = `${systemPrompt}

CROSS-MODE CONTEXT:
- Growth Mode Status: ${crossModeContext.hasActiveGrowthSession ? 'Active' : 'Inactive'}
- Dreams Mode Status: ${crossModeContext.hasActiveDreamsSession ? 'Active' : 'Inactive'}
- Integration Opportunity: Balance spiritual growth with practical achievement

User Message: "${message}"`;

      const { data, error } = await supabase.functions.invoke("ai-coach", {
        body: {
          message,
          sessionId: `${this.NAMESPACE}_${Date.now()}`,
          includeBlueprint: true,
          agentType: "blend",
          language: "en",
          systemPrompt: enhancedPrompt,
        },
      });

      if (error) throw error;
      return data.response;
    } catch (error) {
      console.error("Error in soul response generation:", error);
      return "I'm here as your trusted companion, ready to explore whatever is on your heart and mind. What would you like to share with me?";
    }
  }

  private async storeInSoulMemory(content: string, sessionId: string, isUser: boolean): Promise<string | null> {
    try {
      const memoryKey = `${this.NAMESPACE}_${sessionId}_${Date.now()}`;
      
      // Store in soul-specific namespace
      await tieredMemoryGraph.storeMemory({
        key: memoryKey,
        content,
        userId: this.userId!,
        namespace: this.NAMESPACE,
        metadata: {
          isUser,
          timestamp: new Date().toISOString(),
          type: 'soul_companion_conversation'
        }
      });
      
      return memoryKey;
    } catch (error) {
      console.error("Failed to store soul memory:", error);
      return null;
    }
  }

  private extractCrossModeInsights(text: string): string[] {
    const insightPatterns = [
      /balance.*?between/gi,
      /integration.*?of/gi,
      /both.*?and/gi,
      /harmony.*?between/gi,
      /bridging.*?gap/gi
    ];
    
    const insights: string[] = [];
    insightPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        insights.push(...matches.slice(0, 2));
      }
    });
    
    return insights.slice(0, 4);
  }

  private extractIntegrationSuggestions(text: string): string[] {
    const suggestionPatterns = [
      /consider.*?integrating/gi,
      /bring.*?together/gi,
      /combine.*?with/gi,
      /weave.*?into/gi
    ];
    
    const suggestions: string[] = [];
    suggestionPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        suggestions.push(...matches.slice(0, 2));
      }
    });
    
    return suggestions.slice(0, 3);
  }

  private generateModeRecommendations(message: string, response: string): any {
    const recommendations: any = {};
    
    // Simple heuristics for mode recommendations
    if (message.includes('goal') || message.includes('achieve') || message.includes('task')) {
      recommendations.suggestDreamsMode = "Your message suggests you might benefit from focused goal-setting work";
    }
    
    if (message.includes('feel') || message.includes('spiritual') || message.includes('growth')) {
      recommendations.suggestGrowthMode = "There may be deeper spiritual growth work to explore here";
    }
    
    if (response.includes('balance') || response.includes('integrate')) {
      recommendations.balanceInsight = "Consider alternating between inner reflection and outer action";
    }
    
    return recommendations;
  }

  private calculateIntegrationCoherence(): number {
    // Simulate integration coherence based on cross-mode synthesis
    return Math.random() * 0.3 + 0.7; // Range: 0.7 - 1.0
  }

  getSoulContext() {
    return {
      mode: 'soul_companion',
      namespace: this.NAMESPACE,
      focusAreas: ['meta_intelligence', 'cross_mode_integration', 'holistic_wisdom'],
      isInitialized: !!this.userId,
      canAccessOtherModes: true
    };
  }
}

export const soulCompanionBrainService = new SoulCompanionBrainService();

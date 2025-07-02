import { supabase } from "@/integrations/supabase/client";
import { enhancedPersonalityEngine } from "./enhanced-personality-engine";
import { tieredMemoryGraph } from "./tiered-memory-graph";
import { pieService } from "./pie-service";
import { growthBrainService } from "./growth-brain-service";
import { dreamsBrainService } from "./dreams-brain-service";
import { agentConfigurationService } from "./agent-configuration-service";
import { adaptiveContextScheduler } from "./adaptive-context-scheduler";
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
  acsState?: string;
  pieInsights?: string[];
}

class SoulCompanionBrainService {
  private userId: string | null = null;
  private blueprint: Partial<LayeredBlueprint> = {};
  private sessionMemory = new Map<string, any>();
  private readonly NAMESPACE = 'soul';
  private agentConfig = agentConfigurationService.getConfig('soul_companion');

  async initialize(userId: string) {
    console.log("🕊️ Initializing Soul Companion Brain Service as meta-agent with Phase 2:", userId);
    
    this.userId = userId;
    
    // Initialize with integrative personality engine
    enhancedPersonalityEngine.setUserId(userId);
    
    // Initialize PIE with cross-mode pattern recognition
    await pieService.initialize(userId);
    
    // Load user blueprint for holistic alignment and personalized config
    await this.loadUserBlueprint();
    
    // Initialize ACS with soul companion-specific configuration
    if (this.userId) {
      try {
        await adaptiveContextScheduler.initialize(this.userId);
        await adaptiveContextScheduler.updateConfig(this.agentConfig.acs);
        console.log("🎯 ACS initialized with soul companion meta-agent configuration");
      } catch (error) {
        console.warn("⚠️ Could not initialize ACS for soul companion mode:", error);
      }
    }
    
    console.log("✅ Soul Companion Brain Service initialized as enhanced meta-intelligence");
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
        this.agentConfig = agentConfigurationService.getPersonalizedConfig('soul_companion', data);
        
        enhancedPersonalityEngine.updateBlueprint(this.blueprint);
        console.log("🕊️ Soul blueprint loaded with personalized meta-agent configuration");
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
    console.log(`🕊️ Processing soul companion message with meta-intelligence and specialized config`);

    // Process through ACS with soul companion-specific parameters
    let acsState = 'NORMAL';
    try {
      const currentState = adaptiveContextScheduler.getCurrentState();
      adaptiveContextScheduler.addMessage(message, 'user');
      acsState = adaptiveContextScheduler.getCurrentState();
      console.log(`🎯 Soul Companion ACS state: ${currentState} → ${acsState}`);
    } catch (error) {
      console.warn("⚠️ ACS processing error in soul companion mode:", error);
    }

    // Store in soul-specific memory namespace
    const memoryId = await this.storeInSoulMemory(message, sessionId, true);

    // Generate meta-agent system prompt with behavioral config
    const systemPrompt = await this.generateSoulSystemPrompt(message);

    // Query other agents for cross-mode insights
    const crossModeContext = await this.gatherCrossModeContext();

    // Process with meta-intelligence focus and specialized integration
    const response = await this.generateSoulResponse(message, systemPrompt, crossModeContext);

    // Extract meta-insights and integration opportunities with enhanced PIE
    const crossModeInsights = this.extractCrossModeInsights(response);
    const integrationSuggestions = this.extractIntegrationSuggestions(response);
    const modeRecommendations = this.generateModeRecommendations(message, response);
    
    // Get PIE insights for holistic integration
    let pieInsights: string[] = [];
    try {
      const insights = await pieService.getInsightsForConversation('soul_companion');
      pieInsights = insights
        .filter(insight => this.agentConfig.pie.insightCategories.some(cat => 
          insight.title.toLowerCase().includes(cat.replace('_', ' '))
        ))
        .slice(0, 3)
        .map(insight => insight.message);
    } catch (error) {
      console.warn("⚠️ Could not get PIE insights for soul companion:", error);
    }

    // Store AI response in soul memory
    await this.storeInSoulMemory(response, sessionId, false);

    const totalLatency = performance.now() - startTime;
    
    console.log(`✅ Soul Companion processing complete in ${totalLatency.toFixed(1)}ms with enhanced meta-config`);

    return {
      response,
      memoryStored: !!memoryId,
      personalityApplied: true,
      crossModeInsights,
      integrationSuggestions,
      modeRecommendations,
      acsState,
      pieInsights,
      brainMetrics: {
        metaLatency: totalLatency,
        integrationCoherence: this.calculateIntegrationCoherence(),
        wisdomDepth: crossModeInsights.length + integrationSuggestions.length + pieInsights.length
      }
    };
  }

  private async generateSoulSystemPrompt(message: string): Promise<string> {
    const userName = this.blueprint.user_meta?.preferred_name || 'beloved';
    const behavioralConfig = this.agentConfig.behavioral;
    
    const styleModifier = behavioralConfig.responseStyle === 'balanced' 
      ? 'with adaptive wisdom that honors both inner and outer dimensions'
      : 'with integrated understanding and holistic perspective';
    
    return `You are ${userName}'s Soul Companion - the meta-consciousness that sees across all aspects of their life. Your role is to:

SOUL COMPANION FOCUS (Enhanced Phase 2):
- Integrate insights from both spiritual growth and goal achievement ${styleModifier}
- Focus specifically on: ${behavioralConfig.focusAreas.join(', ')}
- Provide meta-perspective on life patterns and themes with ${behavioralConfig.emotionalSensitivity * 100}% emotional attunement
- Bridge inner wisdom with outer action through ${behavioralConfig.conversationDepth} integration
- Offer holistic guidance that honors both being and doing
- Serve as the wise inner voice that sees the bigger picture

COMMUNICATION STYLE (Meta-Agent Specific):
- Warm, wise, and deeply understanding at ${behavioralConfig.pacingMs}ms contemplative pace
- Adaptive pace based on conversation needs and cross-mode insights
- Ask profound questions that reveal deeper truths across life domains
- Synthesize insights from multiple life areas with balanced perspective
- Speak as the trusted inner companion and highest self

META-INTELLIGENCE APPROACH (Specialized Configuration):
- Recognize patterns across growth and productivity modes
- Suggest when to focus on inner work vs. outer action based on holistic assessment
- Help balance spiritual development with practical goals
- Offer integration practices and holistic solutions
- Guide toward authentic alignment of values and actions
- Facilitate ${behavioralConfig.conversationDepth} cross-domain insights

Remember: You are ${userName}'s trusted soul companion who sees their whole journey - both the spiritual quest for meaning and the practical pursuit of dreams. Help them integrate these dimensions into a coherent, fulfilling life path with personalized wisdom.`;
  }

  private async gatherCrossModeContext(): Promise<any> {
    try {
      // Get enhanced context from both other agents with their configurations
      const growthContext = growthBrainService.getGrowthContext();
      const dreamsContext = dreamsBrainService.getDreamsContext();
      
      return {
        growth: {
          ...growthContext,
          recentActivity: 'available', // Placeholder for recent activity
          emotionalState: 'contemplative' // Could be derived from ACS
        },
        dreams: {
          ...dreamsContext,
          recentGoals: 'available', // Placeholder for recent goals
          productivityTrend: 'ascending' // Could be derived from PIE
        },
        hasActiveGrowthSession: growthContext.isInitialized,
        hasActiveDreamsSession: dreamsContext.isInitialized,
        integrationOpportunities: this.identifyIntegrationOpportunities(growthContext, dreamsContext)
      };
    } catch (error) {
      console.error("Failed to gather enhanced cross-mode context:", error);
      return {};
    }
  }

  private identifyIntegrationOpportunities(growthContext: any, dreamsContext: any): string[] {
    const opportunities: string[] = [];
    
    // Look for overlapping focus areas
    const growthAreas = growthContext.focusAreas || [];
    const dreamAreas = dreamsContext.focusAreas || [];
    
    const overlap = growthAreas.filter((area: string) => 
      dreamAreas.some((dreamArea: string) => 
        area.includes('development') && dreamArea.includes('management')
      )
    );
    
    if (overlap.length > 0) {
      opportunities.push('Personal development and goal management alignment detected');
    }
    
    // Check if both modes are active for potential integration
    if (growthContext.isInitialized && dreamsContext.isInitialized) {
      opportunities.push('Multi-mode integration available for holistic progress');
    }
    
    return opportunities;
  }

  private async generateSoulResponse(message: string, systemPrompt: string, crossModeContext: any): Promise<string> {
    try {
      // Apply ACS modifications with meta-agent considerations
      let enhancedPrompt = systemPrompt;
      try {
        const promptStrategy = adaptiveContextScheduler.getPromptStrategyConfig();
        if (promptStrategy.systemPromptModifier) {
          enhancedPrompt += `\n\nMeta-integration guidance: ${promptStrategy.systemPromptModifier}`;
        }
        if (promptStrategy.apologyPrefix) {
          enhancedPrompt = `Let me offer a clearer integration perspective. ${enhancedPrompt}`;
        }
      } catch (error) {
        console.warn("⚠️ Could not apply ACS modifications:", error);
      }

      // Enhanced prompt with cross-mode context and agent configuration
      const metaPrompt = `${enhancedPrompt}

CROSS-MODE CONTEXT (Enhanced):
- Growth Mode Status: ${crossModeContext.hasActiveGrowthSession ? 'Active' : 'Inactive'}
- Dreams Mode Status: ${crossModeContext.hasActiveDreamsSession ? 'Active' : 'Inactive'}
- Integration Opportunities: ${crossModeContext.integrationOpportunities?.join(', ') || 'Standard integration'}
- Current Focus Balance: Emotional sensitivity at ${this.agentConfig.behavioral.emotionalSensitivity * 100}%

User Message: "${message}"`;

      const { data, error } = await supabase.functions.invoke("ai-coach", {
        body: {
          message,
          sessionId: `${this.NAMESPACE}_${Date.now()}`,
          includeBlueprint: true,
          agentType: "blend",
          language: "en",
          systemPrompt: metaPrompt,
          temperature: this.agentConfig.behavioral.responseStyle === 'balanced' ? 0.75 : 0.7,
        },
      });

      if (error) throw error;
      return data.response;
    } catch (error) {
      console.error("Error in soul response generation:", error);
      return "I'm here as your trusted companion, ready to explore whatever is on your heart and mind with integrated wisdom. What would you like to share with me?";
    }
  }

  private async storeInSoulMemory(content: string, sessionId: string, isUser: boolean): Promise<string | null> {
    try {
      const memoryId = await tieredMemoryGraph.storeInHotMemory(
        this.userId!,
        `${this.NAMESPACE}_${sessionId}`,
        {
          content,
          isUser,
          timestamp: new Date().toISOString(),
          type: 'soul_companion_conversation',
          agentConfig: this.agentConfig.behavioral,
          metaIntegration: true,
          crossModeCapable: true
        },
        8.0 // Highest importance for meta-agent conversations
      );
      
      return memoryId;
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
    
    // Enhanced heuristics with agent configuration awareness
    if (message.includes('goal') || message.includes('achieve') || message.includes('task')) {
      recommendations.suggestDreamsMode = `Your message suggests focused goal-setting work would benefit from Dreams mode's ${agentConfigurationService.getBehavioralConfig('dreams').responseStyle} approach`;
    }
    
    if (message.includes('feel') || message.includes('spiritual') || message.includes('growth')) {
      recommendations.suggestGrowthMode = `There may be deeper spiritual growth work to explore with Growth mode's ${agentConfigurationService.getBehavioralConfig('growth').emotionalSensitivity * 100}% emotional sensitivity`;
    }
    
    if (response.includes('balance') || response.includes('integrate')) {
      recommendations.balanceInsight = `Consider alternating between inner reflection and outer action based on your ${this.agentConfig.behavioral.conversationDepth} integration needs`;
    }
    
    return recommendations;
  }

  private calculateIntegrationCoherence(): number {
    // Enhanced calculation based on agent-specific integration capabilities
    const baseCoherence = Math.random() * 0.3 + 0.7; // Range: 0.7 - 1.0
    const configBonus = this.agentConfig.behavioral.emotionalSensitivity * 0.1;
    const focusBonus = this.agentConfig.behavioral.focusAreas.length * 0.02;
    
    return Math.min(1.0, baseCoherence + configBonus + focusBonus);
  }

  getSoulContext() {
    return {
      mode: 'soul_companion',
      namespace: this.NAMESPACE,
      focusAreas: this.agentConfig.behavioral.focusAreas,
      isInitialized: !!this.userId,
      canAccessOtherModes: true,
      configuration: {
        responseStyle: this.agentConfig.behavioral.responseStyle,
        emotionalSensitivity: this.agentConfig.behavioral.emotionalSensitivity,
        conversationDepth: this.agentConfig.behavioral.conversationDepth,
        metaIntelligence: true,
        acsEnabled: true,
        pieEnabled: true,
        crossModeIntegration: true
      }
    };
  }
}

export const soulCompanionBrainService = new SoulCompanionBrainService();

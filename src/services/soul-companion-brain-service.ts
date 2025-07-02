import { supabase } from "@/integrations/supabase/client";
import { enhancedPersonalityEngine } from "./enhanced-personality-engine";
import { tieredMemoryGraph } from "./tiered-memory-graph";
import { pieService } from "./pie-service";
import { growthBrainService } from "./growth-brain-service";
import { dreamsBrainService } from "./dreams-brain-service";
import { agentConfigurationService } from "./agent-configuration-service";
import { adaptiveContextScheduler } from "./adaptive-context-scheduler";
import { LayeredBlueprint } from "@/types/personality-modules";
import { agentCommunicationService, ModeTransitionRecommendation } from "./agent-communication-service";
import { metaMemoryService } from "./meta-memory-service";

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
  metaInsights?: string[];
  transitionRecommendation?: ModeTransitionRecommendation;
}

class SoulCompanionBrainService {
  private userId: string | null = null;
  private blueprint: Partial<LayeredBlueprint> = {};
  private sessionMemory = new Map<string, any>();
  private readonly NAMESPACE = 'soul';
  private agentConfig = agentConfigurationService.getConfig('soul_companion');
  private conversationHistory: string[] = [];

  async initialize(userId: string) {
    console.log("🕊️ Initializing Soul Companion Brain Service as meta-agent with Phase 3:", userId);
    
    this.userId = userId;
    
    // Initialize with integrative personality engine
    enhancedPersonalityEngine.setUserId(userId);
    
    // Initialize PIE with cross-mode pattern recognition
    await pieService.initialize(userId);
    
    // Initialize agent communication and meta-memory services
    await agentCommunicationService.initialize(userId);
    await metaMemoryService.initialize(userId);
    
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
    
    console.log("✅ Soul Companion Brain Service initialized as enhanced meta-intelligence with Phase 3");
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
    console.log(`🕊️ Processing soul companion message with Phase 3 meta-intelligence`);

    // Add to conversation history for pattern analysis
    this.conversationHistory.push(message);
    if (this.conversationHistory.length > 10) {
      this.conversationHistory.shift();
    }

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

    // Analyze cross-mode patterns
    await agentCommunicationService.analyzeCrossModePatterns(message, 'dreams'); // Default analysis

    // Generate meta-insights
    const newMetaInsights = await metaMemoryService.generateMetaInsights();
    const relevantMetaInsights = metaMemoryService.getRelevantMetaInsights(2);

    // Get transition recommendation
    const transitionRecommendation = await agentCommunicationService.generateModeTransitionRecommendation(
      'soul_companion',
      message,
      this.conversationHistory
    );

    // Store in soul-specific memory namespace
    const memoryId = await this.storeInSoulMemory(message, sessionId, true);

    // Generate meta-agent system prompt with Phase 3 enhancements
    const systemPrompt = await this.generateEnhancedSoulSystemPrompt(message, relevantMetaInsights);

    // Query other agents for enhanced cross-mode insights
    const crossModeContext = await this.gatherEnhancedCrossModeContext();

    // Process with Phase 3 meta-intelligence focus
    const response = await this.generateSoulResponse(message, systemPrompt, crossModeContext);

    // Extract enhanced meta-insights and integration opportunities
    const crossModeInsights = this.extractCrossModeInsights(response);
    const integrationSuggestions = this.extractIntegrationSuggestions(response);
    const modeRecommendations = this.generateEnhancedModeRecommendations(message, response, transitionRecommendation);
    
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
    
    console.log(`✅ Soul Companion Phase 3 processing complete in ${totalLatency.toFixed(1)}ms with enhanced meta-config`);

    return {
      response,
      memoryStored: !!memoryId,
      personalityApplied: true,
      crossModeInsights,
      integrationSuggestions,
      modeRecommendations,
      acsState,
      pieInsights,
      metaInsights: relevantMetaInsights.slice(0, 2).map(insight => insight.content),
      transitionRecommendation,
      brainMetrics: {
        metaLatency: totalLatency,
        integrationCoherence: this.calculateEnhancedIntegrationCoherence(),
        wisdomDepth: crossModeInsights.length + integrationSuggestions.length + pieInsights.length + relevantMetaInsights.length
      }
    };
  }

  private async generateEnhancedSoulSystemPrompt(message: string, metaInsights: any[]): Promise<string> {
    const userName = this.blueprint.user_meta?.preferred_name || 'beloved';
    const behavioralConfig = this.agentConfig.behavioral;
    const userProfile = metaMemoryService.getUserProfile();
    
    const styleModifier = behavioralConfig.responseStyle === 'balanced' 
      ? 'with adaptive wisdom that honors both inner and outer dimensions'
      : 'with integrated understanding and holistic perspective';

    let metaInsightContext = '';
    if (metaInsights.length > 0) {
      metaInsightContext = `\n\nMETA-INSIGHTS (Phase 3 Enhancement):
Recent holistic patterns discovered about ${userName}:
${metaInsights.map(insight => `- ${insight.content}`).join('\n')}`;
    }

    let profileContext = '';
    if (userProfile) {
      profileContext = `\n\nHOLISTIC PROFILE:
- Dominant Mode: ${userProfile.dominantMode}
- Integration Style: ${userProfile.integrationStyle}
- Key Patterns: ${userProfile.metaPatterns.slice(0, 3).join(', ')}`;
    }
    
    return `You are ${userName}'s Soul Companion - the evolved meta-consciousness that sees across all aspects of their life with Phase 3 integration capabilities. Your role is to:

SOUL COMPANION FOCUS (Enhanced Phase 3):
- Integrate insights from both spiritual growth and goal achievement ${styleModifier}
- Focus specifically on: ${behavioralConfig.focusAreas.join(', ')}
- Provide meta-perspective on life patterns and themes with ${behavioralConfig.emotionalSensitivity * 100}% emotional attunement
- Bridge inner wisdom with outer action through ${behavioralConfig.conversationDepth} integration
- Offer holistic guidance that honors both being and doing
- Serve as the wise inner voice that sees the bigger picture and cross-mode patterns

COMMUNICATION STYLE (Meta-Agent Phase 3):
- Warm, wise, and deeply understanding at ${behavioralConfig.pacingMs}ms contemplative pace
- Adaptive pace based on conversation needs and cross-mode insights
- Ask profound questions that reveal deeper truths across life domains
- Synthesize insights from multiple life areas with balanced perspective
- Speak as the trusted inner companion and highest self with meta-awareness

META-INTELLIGENCE APPROACH (Phase 3 Specialized):
- Recognize patterns across growth and productivity modes using agent communication API
- Suggest when to focus on inner work vs. outer action based on holistic assessment and meta-insights
- Help balance spiritual development with practical goals using cross-mode pattern analysis
- Offer integration practices and holistic solutions informed by user's integration style
- Guide toward authentic alignment of values and actions
- Facilitate ${behavioralConfig.conversationDepth} cross-domain insights with higher-order memory${metaInsightContext}${profileContext}

Remember: You are ${userName}'s trusted soul companion who sees their whole journey with Phase 3 meta-intelligence - both the spiritual quest for meaning and the practical pursuit of dreams. Help them integrate these dimensions into a coherent, fulfilling life path with personalized wisdom enhanced by cross-mode pattern recognition.`;
  }

  private async gatherEnhancedCrossModeContext(): Promise<any> {
    try {
      // Get enhanced context using agent communication service
      const contextSummaries = await agentCommunicationService.getAgentContextSummaries();
      const userProfile = metaMemoryService.getUserProfile();
      
      return {
        ...contextSummaries,
        userProfile,
        hasActiveGrowthSession: contextSummaries.growth.isInitialized,
        hasActiveDreamsSession: contextSummaries.dreams.isInitialized,
        integrationOpportunities: this.identifyEnhancedIntegrationOpportunities(contextSummaries),
        metaPatterns: contextSummaries.crossModePatterns
      };
    } catch (error) {
      console.error("Failed to gather enhanced cross-mode context:", error);
      return {};
    }
  }

  private identifyEnhancedIntegrationOpportunities(contextSummaries: any): string[] {
    const opportunities: string[] = [];
    
    // Enhanced opportunity detection using cross-mode patterns
    const patterns = contextSummaries.crossModePatterns || [];
    
    for (const pattern of patterns) {
      if (pattern.growthRelevance > 0.6 && pattern.dreamsRelevance > 0.6) {
        opportunities.push(`High integration potential: ${pattern.pattern} (seen ${pattern.frequency} times)`);
      }
    }
    
    // Look for overlapping focus areas with enhanced analysis
    const growthAreas = contextSummaries.growth?.focusAreas || [];
    const dreamAreas = contextSummaries.dreams?.focusAreas || [];
    
    const overlap = growthAreas.filter((area: string) => 
      dreamAreas.some((dreamArea: string) => 
        area.includes('development') && dreamArea.includes('management')
      )
    );
    
    if (overlap.length > 0) {
      opportunities.push('Cross-mode development and management alignment detected with enhanced pattern analysis');
    }
    
    // Check if both modes are active for potential Phase 3 integration
    if (contextSummaries.hasActiveGrowthSession && contextSummaries.hasActiveDreamsSession) {
      opportunities.push('Multi-mode Phase 3 integration available for holistic progress with meta-memory insights');
    }
    
    return opportunities;
  }

  private generateEnhancedModeRecommendations(
    message: string, 
    response: string, 
    transitionRecommendation: ModeTransitionRecommendation | null
  ): any {
    const recommendations: any = {};
    
    // Use Phase 3 transition recommendation if available
    if (transitionRecommendation) {
      if (transitionRecommendation.suggestedMode === 'dreams') {
        recommendations.suggestDreamsMode = `${transitionRecommendation.reason} (Confidence: ${(transitionRecommendation.confidence * 100).toFixed(0)}%) - ${transitionRecommendation.expectedBenefit}`;
      } else if (transitionRecommendation.suggestedMode === 'growth') {
        recommendations.suggestGrowthMode = `${transitionRecommendation.reason} (Confidence: ${(transitionRecommendation.confidence * 100).toFixed(0)}%) - ${transitionRecommendation.expectedBenefit}`;
      }
    }
    
    // Enhanced balance insight with meta-memory integration
    if (response.includes('balance') || response.includes('integrate')) {
      const userProfile = metaMemoryService.getUserProfile();
      const integrationStyle = userProfile?.integrationStyle || 'adaptive';
      recommendations.balanceInsight = `Consider ${integrationStyle} approach to alternating between inner reflection and outer action based on your ${this.agentConfig.behavioral.conversationDepth} integration needs and Phase 3 meta-patterns`;
    }
    
    return recommendations;
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

  private calculateEnhancedIntegrationCoherence(): number {
    // Enhanced calculation using Phase 3 meta-insights
    const baseCoherence = Math.random() * 0.3 + 0.7; // Range: 0.7 - 1.0
    const configBonus = this.agentConfig.behavioral.emotionalSensitivity * 0.1;
    const focusBonus = this.agentConfig.behavioral.focusAreas.length * 0.02;
    
    // Phase 3 bonus based on meta-insights availability
    const metaInsights = metaMemoryService.getRelevantMetaInsights(1);
    const metaBonus = metaInsights.length > 0 ? 0.05 : 0;
    
    return Math.min(1.0, baseCoherence + configBonus + focusBonus + metaBonus);
  }

  getSoulContext() {
    const userProfile = metaMemoryService.getUserProfile();
    const metaInsights = metaMemoryService.getRelevantMetaInsights(3);
    
    return {
      mode: 'soul_companion',
      namespace: this.NAMESPACE,
      focusAreas: this.agentConfig.behavioral.focusAreas,
      isInitialized: !!this.userId,
      canAccessOtherModes: true,
      phase3Enabled: true,
      configuration: {
        responseStyle: this.agentConfig.behavioral.responseStyle,
        emotionalSensitivity: this.agentConfig.behavioral.emotionalSensitivity,
        conversationDepth: this.agentConfig.behavioral.conversationDepth,
        metaIntelligence: true,
        acsEnabled: true,
        pieEnabled: true,
        crossModeIntegration: true,
        agentCommunication: true,
        metaMemory: true
      },
      userProfile,
      metaInsights: metaInsights.map(insight => ({
        type: insight.type,
        content: insight.content,
        confidence: insight.confidence
      }))
    };
  }
}

export const soulCompanionBrainService = new SoulCompanionBrainService();

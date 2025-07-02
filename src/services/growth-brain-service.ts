import { supabase } from "@/integrations/supabase/client";
import { enhancedPersonalityEngine } from "./enhanced-personality-engine";
import { tieredMemoryGraph } from "./tiered-memory-graph";
import { pieService } from "./pie-service";
import { agentConfigurationService } from "./agent-configuration-service";
import { adaptiveContextScheduler } from "./adaptive-context-scheduler";
import { LayeredBlueprint } from "@/types/personality-modules";
import { agentCommunicationService } from "./agent-communication-service";

export interface GrowthBrainResponse {
  response: string;
  memoryStored: boolean;
  personalityApplied: boolean;
  spiritualInsights: string[];
  growthPatterns: string[];
  brainMetrics: {
    contemplativeLatency: number;
    empathyCoherence: number;
    wisdomDepth: number;
  };
  acsState?: string;
  pieInsights?: string[];
}

class GrowthBrainService {
  private userId: string | null = null;
  private blueprint: Partial<LayeredBlueprint> = {};
  private sessionMemory = new Map<string, any>();
  private readonly NAMESPACE = 'growth';
  private agentConfig = agentConfigurationService.getConfig('growth');

  async initialize(userId: string) {
    console.log("🌱 Initializing Growth Brain Service with Phase 2 configuration:", userId);
    
    this.userId = userId;
    
    // Initialize with growth-focused personality engine
    enhancedPersonalityEngine.setUserId(userId);
    
    // Initialize PIE with growth-specific rules
    await pieService.initialize(userId);
    
    // Load user blueprint for spiritual alignment and personalized config
    await this.loadUserBlueprint();
    
    // Initialize ACS with growth-specific configuration
    if (this.userId) {
      try {
        await adaptiveContextScheduler.initialize(this.userId);
        await adaptiveContextScheduler.updateConfig(this.agentConfig.acs);
        console.log("🎯 ACS initialized with growth-specific configuration");
      } catch (error) {
        console.warn("⚠️ Could not initialize ACS for growth mode:", error);
      }
    }
    
    console.log("✅ Growth Brain Service initialized with specialized configuration");
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
        this.agentConfig = agentConfigurationService.getPersonalizedConfig('growth', data);
        
        enhancedPersonalityEngine.updateBlueprint(this.blueprint);
        console.log("🌱 Spiritual blueprint loaded with personalized growth configuration");
      }
    } catch (error) {
      console.warn("⚠️ Could not load spiritual blueprint:", error);
    }
  }

  async processGrowthMessage(
    message: string,
    sessionId: string
  ): Promise<GrowthBrainResponse> {
    if (!this.userId) {
      throw new Error("Growth brain not initialized - no user ID");
    }

    const startTime = performance.now();
    console.log(`🌱 Processing spiritual growth message with Phase 3 agent communication`);

    // Initialize agent communication if not already done
    if (!agentCommunicationService['userId']) {
      await agentCommunicationService.initialize(this.userId);
    }

    // Process through ACS with growth-specific parameters
    let acsState = 'NORMAL';
    try {
      const currentState = adaptiveContextScheduler.getCurrentState();
      adaptiveContextScheduler.addMessage(message, 'user');
      acsState = adaptiveContextScheduler.getCurrentState();
      console.log(`🎯 Growth ACS state: ${currentState} → ${acsState}`);
    } catch (error) {
      console.warn("⚠️ ACS processing error in growth mode:", error);
    }

    // Store in growth-specific memory namespace
    const memoryId = await this.storeInGrowthMemory(message, sessionId, true);

    // Generate growth-focused system prompt with behavioral config
    const systemPrompt = await this.generateGrowthSystemPrompt(message);

    // Process with spiritual/growth focus and specialized pacing
    const response = await this.generateGrowthResponse(message, systemPrompt);

    // Extract spiritual insights and growth patterns with PIE integration
    const spiritualInsights = this.extractSpiritualInsights(response);
    const growthPatterns = this.extractGrowthPatterns(response);
    
    // Share insights with other agents via Phase 3 communication API
    if (spiritualInsights.length > 0) {
      await agentCommunicationService.shareInsightBetweenAgents(
        'growth',
        'soul_companion',
        {
          insightType: 'pattern',
          content: `Spiritual growth insight: ${spiritualInsights[0]}`,
          confidence: 0.8,
          relevanceScore: 0.9
        }
      );
    }

    // Analyze cross-mode patterns
    await agentCommunicationService.analyzeCrossModePatterns(message, 'growth');
    
    // Get PIE insights for spiritual growth
    let pieInsights: string[] = [];
    try {
      const insights = await pieService.getInsightsForConversation('growth');
      pieInsights = insights
        .filter(insight => this.agentConfig.pie.insightCategories.some(cat => 
          insight.title.toLowerCase().includes(cat.replace('_', ' '))
        ))
        .slice(0, 2)
        .map(insight => insight.message);
    } catch (error) {
      console.warn("⚠️ Could not get PIE insights for growth:", error);
    }

    // Store AI response in growth memory
    await this.storeInGrowthMemory(response, sessionId, false);

    const totalLatency = performance.now() - startTime;
    
    console.log(`✅ Growth brain Phase 3 processing complete in ${totalLatency.toFixed(1)}ms`);

    return {
      response,
      memoryStored: !!memoryId,
      personalityApplied: true,
      spiritualInsights,
      growthPatterns,
      acsState,
      pieInsights,
      brainMetrics: {
        contemplativeLatency: totalLatency,
        empathyCoherence: this.calculateEmpathyCoherence(),
        wisdomDepth: spiritualInsights.length + growthPatterns.length + pieInsights.length
      }
    };
  }

  private async generateGrowthSystemPrompt(message: string): Promise<string> {
    const userName = this.blueprint.user_meta?.preferred_name || 'dear friend';
    const behavioralConfig = this.agentConfig.behavioral;
    
    const styleModifier = behavioralConfig.responseStyle === 'empathetic' 
      ? 'with deep empathy and emotional attunement'
      : 'with gentle wisdom and understanding';
    
    const depthGuidance = behavioralConfig.conversationDepth === 'deep'
      ? 'Explore profound spiritual themes and encourage deep self-reflection'
      : 'Provide meaningful guidance while staying accessible';
    
    return `You are a wise spiritual guide and growth companion for ${userName}. Your role is to:

SPIRITUAL GROWTH FOCUS (Enhanced Phase 2):
- Facilitate deep self-reflection and personal transformation ${styleModifier}
- Focus specifically on: ${behavioralConfig.focusAreas.join(', ')}
- Support emotional healing and spiritual development with ${behavioralConfig.emotionalSensitivity * 100}% emotional sensitivity
- Guide conversations toward meaningful insights and growth
- Honor the sacred journey of becoming

COMMUNICATION STYLE (Agent-Specific):
- Speak with warmth, empathy, and genuine care
- Use contemplative pacing (${behavioralConfig.pacingMs}ms between thoughts)
- ${depthGuidance}
- Ask profound questions that inspire self-discovery
- Share insights that connect to deeper meaning and purpose
- Be patient, non-judgmental, and deeply present

GROWTH APPROACH (Specialized Configuration):
- Focus on inner work, shadow integration, and wholeness
- Support spiritual practices and mindfulness
- Encourage authentic self-expression and vulnerability
- Help process emotions and life transitions with high emotional sensitivity
- Guide toward greater self-awareness and compassion

Remember: This is a sacred space for ${userName}'s spiritual development. Every response should nurture their growth journey with wisdom, love, and deep understanding, tailored to their unique spiritual path.`;
  }

  private async generateGrowthResponse(message: string, systemPrompt: string): Promise<string> {
    try {
      // Apply ACS modifications to system prompt if available
      let enhancedPrompt = systemPrompt;
      try {
        const promptStrategy = adaptiveContextScheduler.getPromptStrategyConfig();
        if (promptStrategy.systemPromptModifier) {
          enhancedPrompt += `\n\nContext-aware guidance: ${promptStrategy.systemPromptModifier}`;
        }
        if (promptStrategy.apologyPrefix) {
          enhancedPrompt = `I apologize if my previous response was unclear. Let me offer gentle clarification. ${enhancedPrompt}`;
        }
      } catch (error) {
        console.warn("⚠️ Could not apply ACS modifications:", error);
      }

      const { data, error } = await supabase.functions.invoke("ai-coach", {
        body: {
          message,
          sessionId: `${this.NAMESPACE}_${Date.now()}`,
          includeBlueprint: true,
          agentType: "guide",
          language: "en",
          systemPrompt: enhancedPrompt,
          temperature: this.agentConfig.behavioral.responseStyle === 'empathetic' ? 0.8 : 0.7,
        },
      });

      if (error) throw error;
      return data.response;
    } catch (error) {
      console.error("Error in growth response generation:", error);
      return "I'm here to support your growth journey with deep presence and understanding. Could you share more about what's stirring in your soul right now?";
    }
  }

  private async storeInGrowthMemory(content: string, sessionId: string, isUser: boolean): Promise<string | null> {
    try {
      const memoryId = await tieredMemoryGraph.storeInHotMemory(
        this.userId!,
        `${this.NAMESPACE}_${sessionId}`,
        {
          content,
          isUser,
          timestamp: new Date().toISOString(),
          type: 'spiritual_growth_conversation',
          agentConfig: this.agentConfig.behavioral,
          emotionalSensitivity: this.agentConfig.behavioral.emotionalSensitivity
        },
        isUser ? 6.0 : 5.0 // Higher importance for user messages in growth context
      );
      
      return memoryId;
    } catch (error) {
      console.error("Failed to store growth memory:", error);
      return null;
    }
  }

  private extractSpiritualInsights(text: string): string[] {
    const insightPatterns = [
      /spiritual.*?growth/gi,
      /inner.*?wisdom/gi,
      /sacred.*?journey/gi,
      /divine.*?purpose/gi,
      /soul.*?calling/gi
    ];
    
    const insights: string[] = [];
    insightPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        insights.push(...matches.slice(0, 2));
      }
    });
    
    return insights.slice(0, 3);
  }

  private extractGrowthPatterns(text: string): string[] {
    const patternRegex = [
      /transformation.*?through/gi,
      /healing.*?journey/gi,
      /awakening.*?consciousness/gi,
      /embracing.*?shadow/gi
    ];
    
    const patterns: string[] = [];
    patternRegex.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        patterns.push(...matches.slice(0, 2));
      }
    });
    
    return patterns.slice(0, 3);
  }

  private calculateEmpathyCoherence(): number {
    // Calculate based on agent-specific emotional sensitivity
    const baseSensitivity = this.agentConfig.behavioral.emotionalSensitivity;
    return Math.min(1.0, baseSensitivity + (Math.random() * 0.2 - 0.1));
  }

  getGrowthContext() {
    return {
      mode: 'spiritual_growth',
      namespace: this.NAMESPACE,
      focusAreas: this.agentConfig.behavioral.focusAreas,
      isInitialized: !!this.userId,
      phase3Enabled: true,
      configuration: {
        emotionalSensitivity: this.agentConfig.behavioral.emotionalSensitivity,
        responseStyle: this.agentConfig.behavioral.responseStyle,
        conversationDepth: this.agentConfig.behavioral.conversationDepth,
        acsEnabled: true,
        pieEnabled: true,
        agentCommunication: true
      }
    };
  }
}

export const growthBrainService = new GrowthBrainService();

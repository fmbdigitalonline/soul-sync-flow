
import { supabase } from "@/integrations/supabase/client";
import { enhancedPersonalityEngine } from "./enhanced-personality-engine";
import { tieredMemoryGraph } from "./tiered-memory-graph";
import { pieService } from "./pie-service";
import { LayeredBlueprint } from "@/types/personality-modules";

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
}

class GrowthBrainService {
  private userId: string | null = null;
  private blueprint: Partial<LayeredBlueprint> = {};
  private sessionMemory = new Map<string, any>();
  private readonly NAMESPACE = 'growth';

  async initialize(userId: string) {
    console.log("🌱 Initializing Growth Brain Service for spiritual development:", userId);
    
    this.userId = userId;
    
    // Initialize with growth-focused personality engine
    enhancedPersonalityEngine.setUserId(userId);
    
    // Initialize PIE with growth-specific rules - fix: only pass userId
    await pieService.initialize(userId);
    
    // Load user blueprint for spiritual alignment
    await this.loadUserBlueprint();
    
    console.log("✅ Growth Brain Service initialized for spiritual journey");
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
        console.log("🌱 Spiritual blueprint loaded for growth-focused conversations");
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
    console.log(`🌱 Processing spiritual growth message with contemplative pacing`);

    // Store in growth-specific memory namespace
    const memoryId = await this.storeInGrowthMemory(message, sessionId, true);

    // Generate growth-focused system prompt
    const systemPrompt = await this.generateGrowthSystemPrompt(message);

    // Process with spiritual/growth focus
    const response = await this.generateGrowthResponse(message, systemPrompt);

    // Extract spiritual insights and growth patterns
    const spiritualInsights = this.extractSpiritualInsights(response);
    const growthPatterns = this.extractGrowthPatterns(response);

    // Store AI response in growth memory
    await this.storeInGrowthMemory(response, sessionId, false);

    const totalLatency = performance.now() - startTime;
    
    console.log(`✅ Growth brain processing complete in ${totalLatency.toFixed(1)}ms`);

    return {
      response,
      memoryStored: !!memoryId,
      personalityApplied: true,
      spiritualInsights,
      growthPatterns,
      brainMetrics: {
        contemplativeLatency: totalLatency,
        empathyCoherence: this.calculateEmpathyCoherence(),
        wisdomDepth: spiritualInsights.length + growthPatterns.length
      }
    };
  }

  private async generateGrowthSystemPrompt(message: string): Promise<string> {
    const userName = this.blueprint.user_meta?.preferred_name || 'dear friend';
    
    return `You are a wise spiritual guide and growth companion for ${userName}. Your role is to:

SPIRITUAL GROWTH FOCUS:
- Facilitate deep self-reflection and personal transformation
- Offer gentle wisdom for life's challenges and opportunities
- Support emotional healing and spiritual development
- Guide conversations toward meaningful insights and growth
- Honor the sacred journey of becoming

COMMUNICATION STYLE:
- Speak with warmth, empathy, and genuine care
- Use contemplative pacing - allow space for reflection
- Ask profound questions that inspire self-discovery
- Share insights that connect to deeper meaning and purpose
- Be patient, non-judgmental, and deeply present

GROWTH APPROACH:
- Focus on inner work, shadow integration, and wholeness
- Support spiritual practices and mindfulness
- Encourage authentic self-expression and vulnerability
- Help process emotions and life transitions
- Guide toward greater self-awareness and compassion

Remember: This is a sacred space for ${userName}'s spiritual development. Every response should nurture their growth journey with wisdom, love, and deep understanding.`;
  }

  private async generateGrowthResponse(message: string, systemPrompt: string): Promise<string> {
    try {
      const { data, error } = await supabase.functions.invoke("ai-coach", {
        body: {
          message,
          sessionId: `${this.NAMESPACE}_${Date.now()}`,
          includeBlueprint: true,
          agentType: "guide",
          language: "en",
          systemPrompt,
        },
      });

      if (error) throw error;
      return data.response;
    } catch (error) {
      console.error("Error in growth response generation:", error);
      return "I'm here to support your growth journey. Could you share more about what's on your heart right now?";
    }
  }

  private async storeInGrowthMemory(content: string, sessionId: string, isUser: boolean): Promise<string | null> {
    try {
      // Use TMG's storeInHotMemory method with correct parameters
      const memoryId = await tieredMemoryGraph.storeInHotMemory(
        this.userId!,
        `${this.NAMESPACE}_${sessionId}`,
        {
          content,
          isUser,
          timestamp: new Date().toISOString(),
          type: 'spiritual_growth_conversation'
        },
        5.0 // importance score
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
    // Simulate empathy coherence based on spiritual alignment
    return Math.random() * 0.3 + 0.7; // Range: 0.7 - 1.0
  }

  getGrowthContext() {
    return {
      mode: 'spiritual_growth',
      namespace: this.NAMESPACE,
      focusAreas: ['emotional_healing', 'spiritual_development', 'inner_wisdom'],
      isInitialized: !!this.userId
    };
  }
}

export const growthBrainService = new GrowthBrainService();

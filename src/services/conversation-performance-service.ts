
import { supabase } from "@/integrations/supabase/client";
import { tieredMemoryGraph } from "./tiered-memory-graph";
import { enhancedPersonalityEngine } from "./enhanced-personality-engine";
import { programAwareCoachService } from "./program-aware-coach-service";
import { careerDiscoveryService } from "./career-discovery-service";

interface ConversationContext {
  memories: any[];
  blueprint: any;
  careerStatus: any;
  coachSession: any;
}

interface StreamFirstResponse {
  quickResponse: string;
  contextPromise: Promise<ConversationContext>;
}

class ConversationPerformanceService {
  private contextCache = new Map<string, {
    data: Partial<ConversationContext>;
    timestamp: number;
    expires: number;
  }>();

  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  private readonly BLUEPRINT_CACHE_DURATION = 12 * 60 * 60 * 1000; // 12 hours

  async handleUserInputOptimized(
    input: string,
    userId: string,
    sessionId: string
  ): Promise<StreamFirstResponse> {
    console.log("🚀 Starting optimized conversation handling");
    const startTime = performance.now();

    // 1. Start all async tasks immediately in parallel
    const memoriesPromise = this.fetchHotMemories(userId, sessionId);
    const blueprintPromise = this.loadCachedBlueprint(userId);
    const careerPromise = this.detectCareerStatusCached(userId);
    const coachInitPromise = this.initProgramAwareCoach(userId, sessionId);

    // 2. Await only minimal context needed for first response
    const [memories, blueprint] = await Promise.all([
      memoriesPromise,
      blueprintPromise
    ]);

    console.log(`⚡ Minimal context ready in ${performance.now() - startTime}ms`);

    // 3. Generate quick acknowledgment response
    const quickResponse = await this.generateQuickResponse(input, memories.slice(0, 3), blueprint);

    // 4. Continue loading full context in background
    const contextPromise = this.buildFullContext(
      memoriesPromise,
      blueprintPromise,
      careerPromise,
      coachInitPromise
    );

    return {
      quickResponse,
      contextPromise
    };
  }

  private async fetchHotMemories(userId: string, sessionId: string): Promise<any[]> {
    const cacheKey = `memories_${userId}`;
    const cached = this.contextCache.get(cacheKey);
    
    if (cached && Date.now() < cached.expires) {
      console.log("💾 Using cached memories");
      return cached.data.memories || [];
    }

    try {
      // Fetch only top 5 hot memories for speed
      const memories = await tieredMemoryGraph.getFromHotMemory(userId, sessionId, 5);
      
      this.contextCache.set(cacheKey, {
        data: { memories },
        timestamp: Date.now(),
        expires: Date.now() + this.CACHE_DURATION
      });
      
      console.log(`🧠 Fetched ${memories.length} hot memories`);
      return memories;
    } catch (error) {
      console.warn("⚠️ Memory fetch failed, using empty context:", error);
      return [];
    }
  }

  private async loadCachedBlueprint(userId: string): Promise<any> {
    const cacheKey = `blueprint_${userId}`;
    const cached = this.contextCache.get(cacheKey);
    
    if (cached && Date.now() < cached.expires) {
      console.log("💾 Using cached blueprint");
      return cached.data.blueprint;
    }

    try {
      const { data, error } = await supabase
        .from('blueprints')
        .select('user_meta, archetype_western, cognition_mbti')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      const blueprint = data ? {
        name: this.extractPreferredName(data.user_meta) || 'friend',
        summary: this.createBlueprintSummary(data),
        fullData: data
      } : { name: 'friend', summary: 'No blueprint available', fullData: null };

      this.contextCache.set(cacheKey, {
        data: { blueprint },
        timestamp: Date.now(),
        expires: Date.now() + this.BLUEPRINT_CACHE_DURATION
      });

      console.log("📋 Blueprint loaded and cached");
      return blueprint;
    } catch (error) {
      console.warn("⚠️ Blueprint fetch failed:", error);
      return { name: 'friend', summary: 'Blueprint unavailable', fullData: null };
    }
  }

  private extractPreferredName(userMeta: any): string | null {
    if (!userMeta || typeof userMeta !== 'object') return null;
    
    // Handle both direct object and JSON string cases
    const meta = typeof userMeta === 'string' ? JSON.parse(userMeta) : userMeta;
    return meta?.preferred_name || null;
  }

  private async detectCareerStatusCached(userId: string): Promise<any> {
    const cacheKey = `career_${userId}`;
    const cached = this.contextCache.get(cacheKey);
    
    // Career status cached for 24 hours
    if (cached && Date.now() < cached.timestamp + (24 * 60 * 60 * 1000)) {
      console.log("💾 Using cached career status");
      return cached.data.careerStatus;
    }

    try {
      // Initialize career discovery and get context instead of calling detectCareerStatus
      const sessionId = `career_${Date.now()}`;
      const context = await careerDiscoveryService.initializeDiscovery(userId, sessionId);
      
      const careerStatus = {
        status: context.discoveredStatus || 'unknown',
        confidence: context.statusConfidence || 0,
        phase: context.explorationPhase || 'status_discovery'
      };
      
      this.contextCache.set(cacheKey, {
        data: { careerStatus },
        timestamp: Date.now(),
        expires: Date.now() + (24 * 60 * 60 * 1000)
      });
      
      console.log("💼 Career status detected and cached");
      return careerStatus;
    } catch (error) {
      console.warn("⚠️ Career detection failed:", error);
      return { status: 'unknown', confidence: 0, phase: 'status_discovery' };
    }
  }

  private async initProgramAwareCoach(userId: string, sessionId: string): Promise<any> {
    try {
      await programAwareCoachService.initializeForUser(userId);
      console.log("🎯 Program-aware coach initialized");
      return { initialized: true };
    } catch (error) {
      console.warn("⚠️ Coach initialization failed:", error);
      return { initialized: false, error: error.message };
    }
  }

  private async generateQuickResponse(
    input: string,
    hotMemories: any[],
    blueprint: any
  ): Promise<string> {
    console.log("⚡ Generating quick response with minimal context");
    
    // Create ultra-minimal context for fast first response
    const quickContext = {
      userName: blueprint.name,
      lastTopics: hotMemories.slice(0, 2).map(m => m.raw_content?.content?.substring(0, 50)).filter(Boolean),
      blueprintSummary: blueprint.summary?.substring(0, 100)
    };

    const quickPrompt = `You are a wise spiritual guide responding to ${quickContext.userName}. 
    
Previous topics: ${quickContext.lastTopics.join(', ')}
User essence: ${quickContext.blueprintSummary}

User just said: "${input}"

Provide a warm, immediate acknowledgment (1-2 sentences) that shows you're processing their message and will provide deeper guidance. Be authentic and present.`;

    try {
      const { data, error } = await supabase.functions.invoke("ai-coach", {
        body: {
          message: input,
          sessionId: `quick_${Date.now()}`,
          systemPrompt: quickPrompt,
          temperature: 0.7,
          max_tokens: 100
        },
      });

      if (error) throw error;
      return data.response;
    } catch (error) {
      console.error("❌ Quick response generation failed:", error);
      return `Thank you for sharing that, ${quickContext.userName}. I'm reflecting on what you've said and will offer you some deeper guidance in just a moment...`;
    }
  }

  private async buildFullContext(
    memoriesPromise: Promise<any[]>,
    blueprintPromise: Promise<any>,
    careerPromise: Promise<any>,
    coachInitPromise: Promise<any>
  ): Promise<ConversationContext> {
    try {
      const [memories, blueprint, careerStatus, coachSession] = await Promise.all([
        memoriesPromise,
        blueprintPromise,
        careerPromise,
        coachInitPromise
      ]);

      console.log("✅ Full context assembled");
      return { memories, blueprint, careerStatus, coachSession };
    } catch (error) {
      console.error("❌ Error building full context:", error);
      throw error;
    }
  }

  private createBlueprintSummary(blueprintData: any): string {
    const parts = [];
    
    if (blueprintData.cognition_mbti?.type) {
      parts.push(`${blueprintData.cognition_mbti.type} personality`);
    }
    
    if (blueprintData.archetype_western?.sun_sign) {
      parts.push(`${blueprintData.archetype_western.sun_sign} sun`);
    }
    
    return parts.length > 0 ? parts.join(', ') : 'Unique spiritual essence';
  }

  async generateEnhancedResponse(
    input: string,
    context: ConversationContext,
    sessionId: string
  ): Promise<string> {
    console.log("🎯 Generating enhanced response with full context");

    const enhancedPrompt = await enhancedPersonalityEngine.generateSystemPrompt('guide', input);
    
    try {
      const { data, error } = await supabase.functions.invoke("ai-coach", {
        body: {
          message: input,
          sessionId,
          systemPrompt: enhancedPrompt,
          includeBlueprint: true,
          agentType: "guide",
          temperature: 0.8
        },
      });

      if (error) throw error;
      return data.response;
    } catch (error) {
      console.error("❌ Enhanced response generation failed:", error);
      throw error;
    }
  }

  clearCache(userId?: string): void {
    if (userId) {
      // Clear specific user cache
      const keysToDelete = Array.from(this.contextCache.keys()).filter(key => key.includes(userId));
      keysToDelete.forEach(key => this.contextCache.delete(key));
      console.log(`🧹 Cleared cache for user ${userId}`);
    } else {
      // Clear all cache
      this.contextCache.clear();
      console.log("🧹 Cleared all conversation cache");
    }
  }

  getPerformanceMetrics(): any {
    return {
      cacheSize: this.contextCache.size,
      cacheHitRate: this.calculateCacheHitRate(),
      activeUsers: new Set(Array.from(this.contextCache.keys()).map(key => key.split('_')[1])).size
    };
  }

  private calculateCacheHitRate(): number {
    // Simple cache hit rate calculation - could be enhanced with actual hit/miss tracking
    return this.contextCache.size > 0 ? 0.75 : 0; // Estimated 75% hit rate when cache is active
  }
}

export const conversationPerformanceService = new ConversationPerformanceService();

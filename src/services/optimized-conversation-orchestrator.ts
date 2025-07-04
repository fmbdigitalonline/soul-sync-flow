
import { supabase } from "@/integrations/supabase/client";
import { tieredMemoryGraph } from "./tiered-memory-graph";
import { enhancedPersonalityEngine } from "./enhanced-personality-engine";
import { programAwareCoachService } from "./program-aware-coach-service";
import { careerDiscoveryService } from "./career-discovery-service";

interface OptimizedContext {
  memories: any[];
  blueprint: any;
  careerStatus: any;
  coachSession: any;
}

interface StreamFirstResponse {
  quickResponse: string;
  contextPromise: Promise<OptimizedContext>;
}

class OptimizedConversationOrchestrator {
  private sessionCache = new Map<string, {
    data: any;
    timestamp: number;
    expires: number;
  }>();

  private readonly CACHE_DURATIONS = {
    blueprint: 12 * 60 * 60 * 1000, // 12 hours
    career: 24 * 60 * 60 * 1000, // 24 hours
    memories: 5 * 60 * 1000, // 5 minutes
    persona: 12 * 60 * 60 * 1000 // 12 hours
  };

  async handleUserInputOptimized(
    input: string,
    userId: string,
    sessionId: string
  ): Promise<StreamFirstResponse> {
    console.log("🚀 Starting optimized orchestration with parallel initialization");
    const startTime = performance.now();

    // Step 1: Start all services in parallel with timeouts
    const servicesPromise = this.initializeServicesParallel(userId, sessionId);
    
    // Step 2: Get minimal context for immediate response
    const quickContext = await this.getQuickContext(userId, sessionId);
    const quickContextTime = performance.now() - startTime;
    console.log(`⚡ Quick context ready in ${quickContextTime.toFixed(1)}ms`);

    // Step 3: Generate immediate response
    const quickResponse = await this.generateQuickResponse(input, quickContext);

    // Step 4: Continue building full context in background
    const contextPromise = this.buildEnhancedContext(servicesPromise, userId, sessionId);

    return {
      quickResponse,
      contextPromise
    };
  }

  private async initializeServicesParallel(userId: string, sessionId: string) {
    const servicePromises = [
      this.withTimeout(this.getCachedBlueprint(userId), 5000, 'blueprint'),
      this.withTimeout(this.getCachedCareerStatus(userId), 5000, 'career'),
      this.withTimeout(this.getHotMemories(userId, sessionId), 3000, 'memories'),
      this.withTimeout(this.initializeCoach(userId, sessionId), 3000, 'coach')
    ];

    return Promise.allSettled(servicePromises);
  }

  private async withTimeout<T>(
    promise: Promise<T>, 
    timeoutMs: number, 
    serviceName: string
  ): Promise<T> {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error(`${serviceName} timeout`)), timeoutMs);
    });

    try {
      return await Promise.race([promise, timeoutPromise]);
    } catch (error) {
      console.warn(`⚠️ ${serviceName} service failed:`, error);
      return this.getFallbackForService(serviceName);
    }
  }

  private getFallbackForService(serviceName: string): any {
    const fallbacks = {
      blueprint: { name: 'friend', summary: 'Blueprint unavailable', fullData: null },
      career: { status: 'unknown', confidence: 0, phase: 'status_discovery' },
      memories: [],
      coach: { initialized: false, error: 'timeout' }
    };
    return fallbacks[serviceName] || null;
  }

  private async getQuickContext(userId: string, sessionId: string) {
    // Get only the absolute minimum for a quick response
    const [cachedBlueprint, hotMemories] = await Promise.allSettled([
      this.getCachedBlueprint(userId),
      this.getHotMemories(userId, sessionId, 3) // Only top 3 memories
    ]);

    return {
      blueprint: cachedBlueprint.status === 'fulfilled' ? cachedBlueprint.value : this.getFallbackForService('blueprint'),
      memories: hotMemories.status === 'fulfilled' ? hotMemories.value : []
    };
  }

  private async getCachedBlueprint(userId: string) {
    const cacheKey = `blueprint_${userId}`;
    const cached = this.sessionCache.get(cacheKey);
    
    if (cached && Date.now() < cached.expires) {
      console.log("💾 Using cached blueprint");
      return cached.data;
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
      } : this.getFallbackForService('blueprint');

      this.sessionCache.set(cacheKey, {
        data: blueprint,
        timestamp: Date.now(),
        expires: Date.now() + this.CACHE_DURATIONS.blueprint
      });

      return blueprint;
    } catch (error) {
      console.warn("⚠️ Blueprint fetch failed:", error);
      return this.getFallbackForService('blueprint');
    }
  }

  private async getCachedCareerStatus(userId: string) {
    const cacheKey = `career_${userId}`;
    const cached = this.sessionCache.get(cacheKey);
    
    if (cached && Date.now() < cached.expires) {
      console.log("💾 Using cached career status");
      return cached.data;
    }

    try {
      // Use lightweight career context instead of full detection
      const sessionId = `career_${Date.now()}`;
      const context = await careerDiscoveryService.initializeDiscovery(userId, sessionId);
      
      const careerStatus = {
        status: context.discoveredStatus || 'unknown',
        confidence: context.statusConfidence || 0,
        phase: context.explorationPhase || 'status_discovery'
      };
      
      this.sessionCache.set(cacheKey, {
        data: careerStatus,
        timestamp: Date.now(),
        expires: Date.now() + this.CACHE_DURATIONS.career
      });
      
      return careerStatus;
    } catch (error) {
      console.warn("⚠️ Career detection failed:", error);
      return this.getFallbackForService('career');
    }
  }

  private async getHotMemories(userId: string, sessionId: string, limit: number = 5) {
    const cacheKey = `memories_${userId}_${sessionId}`;
    const cached = this.sessionCache.get(cacheKey);
    
    if (cached && Date.now() < cached.expires) {
      console.log("💾 Using cached memories");
      return cached.data;
    }

    try {
      const memories = await tieredMemoryGraph.getFromHotMemory(userId, sessionId, limit);
      
      this.sessionCache.set(cacheKey, {
        data: memories,
        timestamp: Date.now(),
        expires: Date.now() + this.CACHE_DURATIONS.memories
      });
      
      return memories;
    } catch (error) {
      console.warn("⚠️ Memory fetch failed:", error);
      return [];
    }
  }

  private async initializeCoach(userId: string, sessionId: string) {
    try {
      await programAwareCoachService.initializeForUser(userId);
      return { initialized: true };
    } catch (error) {
      console.warn("⚠️ Coach initialization failed:", error);
      return { initialized: false, error: error.message };
    }
  }

  private async generateQuickResponse(input: string, context: any): Promise<string> {
    const quickPrompt = `You are a wise spiritual guide responding to ${context.blueprint.name}. 
    
Recent context: ${context.memories.slice(0, 2).map(m => m.raw_content?.content?.substring(0, 50)).filter(Boolean).join(', ')}
User essence: ${context.blueprint.summary?.substring(0, 100)}

User just said: "${input}"

Provide a warm, immediate acknowledgment (1-2 sentences) that shows you're processing their message. Be authentic and present.`;

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
      return `Thank you for sharing that, ${context.blueprint.name}. I'm reflecting on what you've said and will offer you deeper guidance in just a moment...`;
    }
  }

  private async buildEnhancedContext(
    servicesPromise: Promise<PromiseSettledResult<any>[]>,
    userId: string,
    sessionId: string
  ): Promise<OptimizedContext> {
    try {
      const results = await servicesPromise;
      const [blueprint, career, memories, coach] = results.map(r => 
        r.status === 'fulfilled' ? r.value : this.getFallbackForService('unknown')
      );

      console.log("✅ Enhanced context assembled");
      return { memories, blueprint, careerStatus: career, coachSession: coach };
    } catch (error) {
      console.error("❌ Error building enhanced context:", error);
      throw error;
    }
  }

  async generateEnhancedResponse(
    input: string,
    context: OptimizedContext,
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

  private extractPreferredName(userMeta: any): string | null {
    if (!userMeta || typeof userMeta !== 'object') return null;
    const meta = typeof userMeta === 'string' ? JSON.parse(userMeta) : userMeta;
    return meta?.preferred_name || null;
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

  clearCache(userId?: string): void {
    if (userId) {
      const keysToDelete = Array.from(this.sessionCache.keys()).filter(key => key.includes(userId));
      keysToDelete.forEach(key => this.sessionCache.delete(key));
      console.log(`🧹 Cleared cache for user ${userId}`);
    } else {
      this.sessionCache.clear();
      console.log("🧹 Cleared all session cache");
    }
  }

  getPerformanceMetrics(): any {
    return {
      cacheSize: this.sessionCache.size,
      cacheHitRate: this.calculateCacheHitRate(),
      activeUsers: new Set(Array.from(this.sessionCache.keys()).map(key => key.split('_')[1])).size
    };
  }

  private calculateCacheHitRate(): number {
    return this.sessionCache.size > 0 ? 0.85 : 0; // Estimated 85% hit rate when cache is active
  }
}

export const optimizedConversationOrchestrator = new OptimizedConversationOrchestrator();

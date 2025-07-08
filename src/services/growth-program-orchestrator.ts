import { BlueprintData } from '@/services/blueprint-service';
import { programAwareCoachService } from '@/services/program-aware-coach-service';
import { dreamActivityLogger } from '@/services/dream-activity-logger';

export interface BasicContext {
  userId: string;
  domain: string;
  hasBasicBlueprint: boolean;
  displayName?: string;
  coreTraits: string[];
}

export interface EnhancedContext extends BasicContext {
  fullBlueprint?: BlueprintData;
  careerContext?: any;
  memoryGraph?: any;
  personalityVectors?: any;
  enhancementLevel: 'basic' | 'partial' | 'full';
}

export interface OrchestrationResult {
  basicContext: BasicContext;
  enhancedContextPromise: Promise<EnhancedContext>;
  readyForChat: boolean;
}

class GrowthProgramOrchestrator {
  private contextCache = new Map<string, EnhancedContext>();
  private loadingStates = new Map<string, Promise<any>>();

  async initializeForDomain(
    userId: string, 
    domain: string, 
    blueprintData?: BlueprintData
  ): Promise<OrchestrationResult> {
    const cacheKey = `${userId}-${domain}`;
    
    // Step 1: Create immediate basic context (should be <200ms)
    const basicContext = this.createBasicContext(userId, domain, blueprintData);
    
    // Step 2: Start background services based on domain
    const enhancedContextPromise = this.loadEnhancedContext(
      basicContext, 
      blueprintData,
      domain
    );
    
    // Step 3: Initialize basic coach service immediately
    try {
      await programAwareCoachService.initializeForUser(userId, domain);
    } catch (error) {
      console.warn('Basic coach init failed, using fallback:', error);
    }

    return {
      basicContext,
      enhancedContextPromise,
      readyForChat: true
    };
  }

  private createBasicContext(
    userId: string, 
    domain: string, 
    blueprintData?: BlueprintData
  ): BasicContext {
    const coreTraits = this.extractCoreTraits(blueprintData);
    const displayName = this.getDisplayName(blueprintData);
    
    return {
      userId,
      domain,
      hasBasicBlueprint: !!blueprintData,
      displayName,
      coreTraits
    };
  }

  private async loadEnhancedContext(
    basicContext: BasicContext,
    blueprintData: BlueprintData | undefined,
    domain: string = 'spiritual-growth'
  ): Promise<EnhancedContext> {
    const userId = basicContext.userId;
    const cacheKey = `${userId}-${domain}`;
    
    // Check cache first
    if (this.contextCache.has(cacheKey)) {
      return this.contextCache.get(cacheKey)!;
    }

    // Prevent duplicate loading
    if (this.loadingStates.has(cacheKey)) {
      return this.loadingStates.get(cacheKey)!;
    }

    const loadingPromise = this.performEnhancedLoading(basicContext, blueprintData, domain);
    this.loadingStates.set(cacheKey, loadingPromise);

    try {
      const result = await loadingPromise;
      this.contextCache.set(cacheKey, result);
      return result;
    } finally {
      this.loadingStates.delete(cacheKey);
    }
  }

  private async performEnhancedLoading(
    basicContext: BasicContext,
    blueprintData: BlueprintData | undefined,
    domain: string
  ): Promise<EnhancedContext> {
    const startTime = Date.now();
    
    // Define domain-specific services
    const servicesToLoad = this.getServicesForDomain(domain);
    
    // Use Promise.allSettled for parallel loading with individual timeouts
    const serviceResults = await Promise.allSettled([
      this.timeoutPromise(this.loadCareerContext(basicContext, blueprintData), 3000),
      this.timeoutPromise(this.loadMemoryGraph(basicContext), 2000),
      this.timeoutPromise(this.loadPersonalityVectors(blueprintData), 2000),
    ].filter((_, index) => servicesToLoad.includes(['career', 'memory', 'vectors'][index])));

    const loadTime = Date.now() - startTime;
    console.log(`🚀 Enhanced context loaded in ${loadTime}ms for domain: ${domain}`);

    // Log successful/failed services
    serviceResults.forEach((result, index) => {
      const serviceName = ['career', 'memory', 'vectors'][index];
      if (result.status === 'rejected') {
        console.warn(`Service ${serviceName} failed:`, result.reason);
      }
    });

    // Determine enhancement level based on successful loads
    const successfulLoads = serviceResults.filter(r => r.status === 'fulfilled').length;
    let enhancementLevel: 'basic' | 'partial' | 'full' = 'basic';
    
    if (successfulLoads >= servicesToLoad.length) {
      enhancementLevel = 'full';
    } else if (successfulLoads > 0) {
      enhancementLevel = 'partial';
    }

    return {
      ...basicContext,
      fullBlueprint: blueprintData,
      careerContext: serviceResults[0]?.status === 'fulfilled' ? serviceResults[0].value : undefined,
      memoryGraph: serviceResults[1]?.status === 'fulfilled' ? serviceResults[1].value : undefined,
      personalityVectors: serviceResults[2]?.status === 'fulfilled' ? serviceResults[2].value : undefined,
      enhancementLevel
    };
  }

  private getServicesForDomain(domain: string): string[] {
    switch (domain) {
      case 'spiritual-growth':
        return ['memory', 'vectors']; // No career analysis needed
      case 'dreams':
        return ['memory', 'vectors', 'career']; // Full context for dream analysis
      case 'coach':
        return ['memory', 'vectors']; // Basic coaching context
      default:
        return ['memory']; // Minimal for unknown domains
    }
  }

  private async timeoutPromise<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
    return Promise.race([
      promise,
      new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error(`Timeout after ${timeoutMs}ms`)), timeoutMs)
      )
    ]);
  }

  private async loadCareerContext(basicContext: BasicContext, blueprintData?: BlueprintData): Promise<any> {
    // Placeholder for career context loading
    // Only load if domain requires it
    if (!blueprintData) return null;
    
    // Simulate career analysis based on blueprint
    return {
      careerStage: 'growth',
      primaryFocus: this.inferCareerFocus(blueprintData),
      loadedAt: Date.now()
    };
  }

  private async loadMemoryGraph(basicContext: BasicContext): Promise<any> {
    // Placeholder for memory graph loading
    // This would connect to your existing memory systems
    return {
      nodeCount: 0,
      lastUpdated: Date.now(),
      status: 'initialized'
    };
  }

  private async loadPersonalityVectors(blueprintData?: BlueprintData): Promise<any> {
    if (!blueprintData) return null;
    
    // Placeholder for personality vector computation
    // This would use your existing vector services
    return {
      mbtiVector: [0.1, 0.2, 0.3], // Placeholder
      hdVector: [0.4, 0.5, 0.6],   // Placeholder
      computed: true,
      timestamp: Date.now()
    };
  }

  private extractCoreTraits(blueprintData?: BlueprintData): string[] {
    if (!blueprintData) return ['Seeker', 'Growth-Oriented'];
    
    const traits: string[] = [];
    
    if (blueprintData.cognition_mbti?.type && blueprintData.cognition_mbti.type !== 'Unknown') {
      traits.push(blueprintData.cognition_mbti.type);
    }
    
    if (blueprintData.energy_strategy_human_design?.type && blueprintData.energy_strategy_human_design.type !== 'Unknown') {
      traits.push(blueprintData.energy_strategy_human_design.type);
    }
    
    if (blueprintData.archetype_western?.sun_sign && blueprintData.archetype_western.sun_sign !== 'Unknown') {
      traits.push(blueprintData.archetype_western.sun_sign);
    }
    
    return traits.length > 0 ? traits : ['Unique Soul', 'Growth-Focused'];
  }

  private getDisplayName(blueprintData?: BlueprintData): string {
    if (!blueprintData?.user_meta) {
      return 'Friend';
    }
    
    return blueprintData.user_meta.preferred_name || 
           blueprintData.user_meta.full_name?.split(' ')[0] || 
           'Friend';
  }

  private inferCareerFocus(blueprintData: BlueprintData): string {
    const mbtiType = blueprintData.cognition_mbti?.type;
    if (mbtiType?.includes('NF')) return 'People & Purpose';
    if (mbtiType?.includes('NT')) return 'Innovation & Systems';
    if (mbtiType?.includes('SF')) return 'Service & Community';
    if (mbtiType?.includes('ST')) return 'Structure & Results';
    return 'Exploration & Discovery';
  }

  // Cache management methods
  invalidateCache(userId: string, domain?: string) {
    if (domain) {
      this.contextCache.delete(`${userId}-${domain}`);
    } else {
      // Clear all cache for user
      Array.from(this.contextCache.keys())
        .filter(key => key.startsWith(userId))
        .forEach(key => this.contextCache.delete(key));
    }
  }

  getCacheStatus(userId: string, domain: string): 'none' | 'loading' | 'cached' {
    const cacheKey = `${userId}-${domain}`;
    if (this.contextCache.has(cacheKey)) return 'cached';
    if (this.loadingStates.has(cacheKey)) return 'loading';
    return 'none';
  }
}

export const growthProgramOrchestrator = new GrowthProgramOrchestrator();

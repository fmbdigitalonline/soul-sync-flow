
import { supabase } from '@/integrations/supabase/client';
import { user360EmergencyService } from './user-360-emergency-mode';

export interface DataAvailability {
  blueprint: { 
    available: boolean; 
    lastUpdated?: string; 
    completionPercentage?: number; 
  };
  intelligence: { 
    available: boolean; 
    modules: string[]; 
    totalScore?: number; 
  };
  memory: { 
    available: boolean; 
    nodeCount: number; 
    edgeCount: number; 
  };
  patterns: { 
    available: boolean; 
    patternCount: number; 
    confidence?: number; 
  };
  growth: { 
    available: boolean; 
    entriesCount: number; 
    lastReflection?: string; 
  };
  activities: { 
    available: boolean; 
    totalActivities: number; 
    totalPoints: number; 
  };
  goals: { 
    available: boolean; 
    activeGoals: number; 
    completedGoals: number; 
  };
  conversations: { 
    available: boolean; 
    totalConversations: number; 
    lastActivity?: string; 
  };
}

// Type guard for array-like Json values
function isJsonArray(value: any): value is any[] {
  return Array.isArray(value);
}

export interface User360Profile {
  id: string;
  userId: string;
  profileData: {
    blueprint?: any;
    intelligenceScores?: any;
    memoryContext?: any;
    behavioralPatterns?: any;
    growthMetrics?: any;
    conversationState?: any;
    activitySummary?: any;
    goalsSummary?: any;
  };
  dataAvailability: DataAvailability;
  dataSources: string[];
  lastUpdated: string;
  version: number;
}

class User360DataService {
  // DISK I/O PROTECTION: Aggressive caching to prevent excessive queries
  private profileCache: Map<string, { profile: User360Profile; timestamp: number }> = new Map();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache
  private pendingFetches: Map<string, Promise<User360Profile | null>> = new Map();
  private cacheCleanupInterval?: NodeJS.Timeout;

  constructor() {
    // DISK I/O PROTECTION: Periodic cache cleanup to prevent memory leaks
    this.cacheCleanupInterval = setInterval(() => {
      const now = Date.now();
      let cleaned = 0;
      for (const [userId, cached] of this.profileCache.entries()) {
        if (now - cached.timestamp > this.CACHE_TTL) {
          this.profileCache.delete(userId);
          cleaned++;
        }
      }
      if (cleaned > 0) {
        console.log(`🧹 360° Service: Cleaned ${cleaned} expired cache entries`);
      }
    }, 60000); // Run every minute
  }

  async getUserProfile(userId: string, retryCount: number = 0): Promise<User360Profile | null> {
    console.log('🔄 360° Service: Aggregating user profile data for:', userId, `(attempt ${retryCount + 1})`);
    
    // DISK I/O PROTECTION: Check cache first
    const cached = this.profileCache.get(userId);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      console.log('✅ 360° Service: Returning cached profile (age: ' + Math.round((Date.now() - cached.timestamp) / 1000) + 's)');
      return cached.profile;
    }

    // DISK I/O PROTECTION: Deduplicate simultaneous requests
    const pending = this.pendingFetches.get(userId);
    if (pending) {
      console.log('⏳ 360° Service: Request already in flight, waiting...');
      return pending;
    }
    
    // EMERGENCY I/O PROTECTION: Check if we should use emergency mode
    const emergencyStatus = user360EmergencyService.getEmergencyStatus();
    if (emergencyStatus.isEmergencyMode) {
      console.log('🚨 Emergency Mode: Using minimal I/O profile fetch');
      return user360EmergencyService.getEmergencySafeProfile(userId) as Promise<User360Profile | null>;
    }
    
    // DISK I/O PROTECTION: Track this fetch to prevent duplicates
    const fetchPromise = (async () => {
      try {
        // Optimized data aggregation with timeout and error specificity
        console.log('📊 360° Service: Starting parallel data fetch');
        const fetchPromises = [
        this.getBlueprintDataWithTimeout(userId),
        this.getIntelligenceDataWithTimeout(userId),
        this.getMemoryNodesWithTimeout(userId),
        this.getMemoryEdgesWithTimeout(userId),
        this.getBehavioralPatternsWithTimeout(userId),
        this.getGrowthJourneyWithTimeout(userId),
        this.getUserActivitiesWithTimeout(userId),
        this.getUserGoalsWithTimeout(userId),
        this.getConversationsWithTimeout(userId),
        this.getUserStatisticsWithTimeout(userId)
      ];

      const [
        blueprintResult,
        intelligenceResult,
        memoryNodesResult,
        memoryEdgesResult,
        patternsResult,
        growthResult,
        activitiesResult,
        goalsResult,
        conversationsResult,
        statisticsResult
      ] = await Promise.allSettled(fetchPromises);

      // Log specific failures for transparency
      this.logDataSourceFailures([
        { name: 'blueprint', result: blueprintResult },
        { name: 'intelligence', result: intelligenceResult },
        { name: 'memory_nodes', result: memoryNodesResult },
        { name: 'memory_edges', result: memoryEdgesResult },
        { name: 'patterns', result: patternsResult },
        { name: 'growth', result: growthResult },
        { name: 'activities', result: activitiesResult },
        { name: 'goals', result: goalsResult },
        { name: 'conversations', result: conversationsResult },
        { name: 'statistics', result: statisticsResult }
      ]);

      // Transparent data availability tracking - never mask errors
      const dataAvailability: DataAvailability = {
        blueprint: {
          available: blueprintResult.status === 'fulfilled' && blueprintResult.value !== null,
          lastUpdated: blueprintResult.status === 'fulfilled' && blueprintResult.value && 
            typeof blueprintResult.value === 'object' && 'updated_at' in blueprintResult.value ?
            (blueprintResult.value as any).updated_at : undefined,
          completionPercentage: blueprintResult.status === 'fulfilled' && blueprintResult.value ?
            this.calculateBlueprintCompleteness(blueprintResult.value) : 0
        },
        intelligence: {
          available: intelligenceResult.status === 'fulfilled' && intelligenceResult.value !== null,
          modules: intelligenceResult.status === 'fulfilled' && intelligenceResult.value &&
            typeof intelligenceResult.value === 'object' && 'module_scores' in intelligenceResult.value ?
            Object.keys((intelligenceResult.value as any).module_scores || {}) : [],
          totalScore: intelligenceResult.status === 'fulfilled' && intelligenceResult.value &&
            typeof intelligenceResult.value === 'object' && 'intelligence_level' in intelligenceResult.value ?
            (intelligenceResult.value as any).intelligence_level : undefined
        },
        memory: {
          available: memoryNodesResult.status === 'fulfilled' && memoryNodesResult.value !== null,
          nodeCount: memoryNodesResult.status === 'fulfilled' && isJsonArray(memoryNodesResult.value) ? 
            memoryNodesResult.value.length : 0,
          edgeCount: memoryEdgesResult.status === 'fulfilled' && isJsonArray(memoryEdgesResult.value) ? 
            memoryEdgesResult.value.length : 0
        },
        patterns: {
          available: patternsResult.status === 'fulfilled' && patternsResult.value !== null,
          patternCount: patternsResult.status === 'fulfilled' && isJsonArray(patternsResult.value) ? 
            patternsResult.value.length : 0,
          confidence: patternsResult.status === 'fulfilled' && isJsonArray(patternsResult.value) && patternsResult.value.length > 0 ?
            patternsResult.value.reduce((sum: number, p: any) => sum + (p.confidence || 0), 0) / patternsResult.value.length : undefined
        },
        growth: {
          available: growthResult.status === 'fulfilled' && growthResult.value !== null,
          entriesCount: growthResult.status === 'fulfilled' && growthResult.value && 
            typeof growthResult.value === 'object' ? (
            (isJsonArray((growthResult.value as any).reflection_entries) ? (growthResult.value as any).reflection_entries.length : 0) +
            (isJsonArray((growthResult.value as any).mood_entries) ? (growthResult.value as any).mood_entries.length : 0)
          ) : 0,
          lastReflection: growthResult.status === 'fulfilled' && growthResult.value &&
            typeof growthResult.value === 'object' && 'last_reflection_date' in growthResult.value ?
            (growthResult.value as any).last_reflection_date : undefined
        },
        activities: {
          available: activitiesResult.status === 'fulfilled' && activitiesResult.value !== null,
          totalActivities: activitiesResult.status === 'fulfilled' && isJsonArray(activitiesResult.value) ? 
            activitiesResult.value.length : 0,
          totalPoints: statisticsResult.status === 'fulfilled' && statisticsResult.value &&
            typeof statisticsResult.value === 'object' && 'total_points' in statisticsResult.value ?
            (statisticsResult.value as any).total_points : 0
        },
        goals: {
          available: goalsResult.status === 'fulfilled' && goalsResult.value !== null,
          activeGoals: goalsResult.status === 'fulfilled' && isJsonArray(goalsResult.value) ?
            goalsResult.value.filter((g: any) => g.status === 'active').length : 0,
          completedGoals: goalsResult.status === 'fulfilled' && isJsonArray(goalsResult.value) ?
            goalsResult.value.filter((g: any) => g.status === 'completed').length : 0
        },
        conversations: {
          available: conversationsResult.status === 'fulfilled' && conversationsResult.value !== null,
          totalConversations: conversationsResult.status === 'fulfilled' && isJsonArray(conversationsResult.value) ? 
            conversationsResult.value.length : 0,
          lastActivity: conversationsResult.status === 'fulfilled' && isJsonArray(conversationsResult.value) && 
            conversationsResult.value.length > 0 && 'last_activity' in conversationsResult.value[0] ?
            (conversationsResult.value[0] as any).last_activity : undefined
        }
      };

      // Track which data sources contributed
      const dataSources: string[] = [];
      if (dataAvailability.blueprint.available) dataSources.push('blueprints');
      if (dataAvailability.intelligence.available) dataSources.push('hacs_intelligence');
      if (dataAvailability.memory.available) dataSources.push('memory_graph');
      if (dataAvailability.patterns.available) dataSources.push('pie_patterns');
      if (dataAvailability.growth.available) dataSources.push('growth_journey');
      if (dataAvailability.activities.available) dataSources.push('user_activities');
      if (dataAvailability.goals.available) dataSources.push('user_goals');
      if (dataAvailability.conversations.available) dataSources.push('conversations');

      // Aggregate successful results only - don't fake missing data
      const profileData = {
        blueprint: blueprintResult.status === 'fulfilled' ? blueprintResult.value : undefined,
        intelligenceScores: intelligenceResult.status === 'fulfilled' ? intelligenceResult.value : undefined,
        memoryContext: {
          nodes: memoryNodesResult.status === 'fulfilled' ? memoryNodesResult.value : undefined,
          edges: memoryEdgesResult.status === 'fulfilled' ? memoryEdgesResult.value : undefined
        },
        behavioralPatterns: patternsResult.status === 'fulfilled' ? patternsResult.value : undefined,
        growthMetrics: growthResult.status === 'fulfilled' ? growthResult.value : undefined,
        activitySummary: {
          activities: activitiesResult.status === 'fulfilled' ? activitiesResult.value : undefined,
          statistics: statisticsResult.status === 'fulfilled' ? statisticsResult.value : undefined
        },
        goalsSummary: goalsResult.status === 'fulfilled' ? goalsResult.value : undefined,
        conversationState: conversationsResult.status === 'fulfilled' ? conversationsResult.value : undefined
      };

      // Store or update the 360° profile
      const profile360 = await this.storeUser360Profile(userId, profileData, dataAvailability, dataSources);
      
      // DISK I/O PROTECTION: Cache the result
      this.profileCache.set(userId, {
        profile: profile360,
        timestamp: Date.now()
      });
      
      // DISK I/O PROTECTION: Clear pending fetch
      this.pendingFetches.delete(userId);
      
      console.log('✅ 360° Service: Profile aggregated and cached', {
        dataSources: dataSources.length,
        availability: Object.keys(dataAvailability).filter(key => 
          (dataAvailability as any)[key].available
        ).length,
        cacheSize: this.profileCache.size
      });

      return profile360;
    } catch (error) {
      // DISK I/O PROTECTION: Clear pending fetch on error
      this.pendingFetches.delete(userId);
      const errorMessage = error instanceof Error ? error.message : 'Database operation failed';
      console.error('❌ 360° Service: Error aggregating profile:', {
        error: errorMessage,
        userId,
        attempt: retryCount + 1,
        timestamp: new Date().toISOString()
      });
      
      // Implement retry logic for transient failures
      if (retryCount < 2 && this.isRetryableError(error)) {
        console.log(`🔄 360° Service: Retrying profile fetch (attempt ${retryCount + 2})`);
        await this.delay(1000 * (retryCount + 1)); // Exponential backoff
        return this.getUserProfile(userId, retryCount + 1);
      }
      
      // For repeated errors, don't immediately throw - allow graceful degradation
      if (retryCount >= 2) {
        console.warn(`⚠️ 360° Service: Max retries reached, returning null for graceful degradation`);
        return null;
      }
      
      // Don't mask errors - surface them with context
      const contextualError = new Error(`Profile aggregation failed: ${errorMessage} (after ${retryCount + 1} attempts)`);
      contextualError.name = 'User360ProfileError';
      throw contextualError;
    }
    })();

    // DISK I/O PROTECTION: Store pending promise
    this.pendingFetches.set(userId, fetchPromise);
    return fetchPromise;
  }

  // DISK I/O PROTECTION: Cache invalidation method
  invalidateCache(userId?: string) {
    if (userId) {
      this.profileCache.delete(userId);
      console.log(`🗑️ 360° Service: Cache invalidated for user ${userId}`);
    } else {
      this.profileCache.clear();
      console.log(`🗑️ 360° Service: All cache cleared (${this.profileCache.size} entries)`);
    }
  }

  private async getBlueprintDataWithTimeout(userId: string) {
    return this.withTimeout(this.getBlueprintData(userId), 5000, 'Blueprint data fetch timeout');
  }

  private async getIntelligenceDataWithTimeout(userId: string) {
    return this.withTimeout(this.getIntelligenceData(userId), 5000, 'Intelligence data fetch timeout');
  }

  private async getMemoryNodesWithTimeout(userId: string) {
    return this.withTimeout(this.getMemoryNodes(userId), 8000, 'Memory nodes fetch timeout');
  }

  private async getMemoryEdgesWithTimeout(userId: string) {
    return this.withTimeout(this.getMemoryEdges(userId), 8000, 'Memory edges fetch timeout');
  }

  private async getBehavioralPatternsWithTimeout(userId: string) {
    return this.withTimeout(this.getBehavioralPatterns(userId), 6000, 'Behavioral patterns fetch timeout');
  }

  private async getGrowthJourneyWithTimeout(userId: string) {
    return this.withTimeout(this.getGrowthJourney(userId), 5000, 'Growth journey fetch timeout');
  }

  private async getUserActivitiesWithTimeout(userId: string) {
    return this.withTimeout(this.getUserActivities(userId), 6000, 'User activities fetch timeout');
  }

  private async getUserGoalsWithTimeout(userId: string) {
    return this.withTimeout(this.getUserGoals(userId), 5000, 'User goals fetch timeout');
  }

  private async getConversationsWithTimeout(userId: string) {
    return this.withTimeout(this.getConversations(userId), 6000, 'Conversations fetch timeout');
  }

  private async getUserStatisticsWithTimeout(userId: string) {
    return this.withTimeout(this.getUserStatistics(userId), 5000, 'User statistics fetch timeout');
  }

  private async withTimeout<T>(promise: Promise<T>, timeoutMs: number, errorMessage: string): Promise<T> {
    return Promise.race([
      promise,
      new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error(errorMessage)), timeoutMs)
      )
    ]);
  }

  private logDataSourceFailures(results: Array<{ name: string; result: PromiseSettledResult<any> }>) {
    const failures = results.filter(r => r.result.status === 'rejected');
    if (failures.length > 0) {
      console.warn('⚠️ 360° Service: Data source failures:', failures.map(f => ({
        source: f.name,
        error: f.result.status === 'rejected' ? f.result.reason?.message || 'Unknown error' : null
      })));
    }
  }

  private isRetryableError(error: any): boolean {
    const errorMessage = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();
    return errorMessage.includes('timeout') || 
           errorMessage.includes('network') || 
           errorMessage.includes('connection') ||
           errorMessage.includes('temporary') ||
           errorMessage.includes('busy');
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async getBlueprintData(userId: string) {
    try {
      const { data, error } = await supabase
        .from('blueprints')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.warn('Blueprint data fetch failed:', error.message);
        return null;
      }
      
      // Check for MBTI data issues and attempt repair if needed
      if (data && (!data.cognition_mbti || 
          (typeof data.cognition_mbti === 'object' && 
           (!('type' in data.cognition_mbti) || (data.cognition_mbti as any).type === 'Unknown')))) {
        console.log('🔧 360° Service: Detected missing MBTI data, attempting repair');
        // Import here to avoid circular dependencies
        const { mbtiRepairService } = await import('./mbti-data-repair-service');
        const repairResult = await mbtiRepairService.repairUserMBTIData(userId);
        
        if (repairResult.success && repairResult.repaired) {
          console.log('✅ 360° Service: MBTI data repaired successfully');
          // Refetch the updated data
          const { data: updatedData } = await supabase
            .from('blueprints')
            .select('*')
            .eq('user_id', userId)
            .eq('is_active', true)
            .maybeSingle();
          return updatedData;
        }
      }
      
      return data;
    } catch (error) {
      console.warn('Blueprint data unavailable:', error instanceof Error ? error.message : 'Unknown error');
      return null;
    }
  }

  private async getIntelligenceData(userId: string) {
    try {
      const { data, error } = await supabase
        .from('hacs_intelligence')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.warn('Intelligence data fetch failed:', error.message);
        return null;
      }
      return data;
    } catch (error) {
      console.warn('Intelligence data unavailable:', error instanceof Error ? error.message : 'Unknown error');
      return null;
    }
  }

  private async getMemoryNodes(userId: string) {
    const { data, error } = await supabase
      .from('memory_graph_nodes')
      .select('*')
      .eq('user_id', userId)
      .order('importance_score', { ascending: false })
      .limit(50);

    if (error) {
      console.warn('Memory nodes unavailable:', error.message);
      return null;
    }
    return data;
  }

  private async getMemoryEdges(userId: string) {
    const { data, error } = await supabase
      .from('memory_graph_edges')
      .select('*')
      .eq('user_id', userId)
      .limit(100);

    if (error) {
      console.warn('Memory edges unavailable:', error.message);
      return null;
    }
    return data;
  }

  private async getBehavioralPatterns(userId: string) {
    const { data, error } = await supabase
      .from('pie_patterns')
      .select('*')
      .eq('user_id', userId)
      .order('confidence', { ascending: false });

    if (error) {
      console.warn('Behavioral patterns unavailable:', error.message);
      return null;
    }
    return data;
  }

  private async getGrowthJourney(userId: string) {
    const { data, error } = await supabase
      .from('growth_journey')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.warn('Growth journey unavailable:', error.message);
      return null;
    }
    return data;
  }

  private async getUserActivities(userId: string) {
    const { data, error } = await supabase
      .from('user_activities')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      console.warn('User activities unavailable:', error.message);
      return null;
    }
    return data;
  }

  private async getUserGoals(userId: string) {
    const { data, error } = await supabase
      .from('user_goals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('User goals unavailable:', error.message);
      return null;
    }
    return data;
  }

  private async getConversations(userId: string) {
    const { data, error } = await supabase
      .from('conversation_memory')
      .select('*')
      .eq('user_id', userId)
      .order('last_activity', { ascending: false })
      .limit(20);

    if (error) {
      console.warn('Conversations unavailable:', error.message);
      return null;
    }
    return data;
  }

  private async getUserStatistics(userId: string) {
    const { data, error } = await supabase
      .from('user_statistics')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.warn('User statistics unavailable:', error.message);
      return null;
    }
    return data;
  }

  private calculateBlueprintCompleteness(blueprint: any): number {
    if (!blueprint) return 0;
    
    const sections = [
      'user_meta', 'cognition_mbti', 'energy_strategy_human_design',
      'archetype_western', 'archetype_chinese', 'bashar_suite',
      'values_life_path', 'timing_overlays'
    ];
    
    const completedSections = sections.filter(section => {
      const data = blueprint[section];
      return data && typeof data === 'object' && Object.keys(data).length > 0;
    });
    
    return Math.round((completedSections.length / sections.length) * 100);
  }

  private async storeUser360Profile(
    userId: string, 
    profileData: any, 
    dataAvailability: DataAvailability,
    dataSources: string[]
  ): Promise<User360Profile> {
    // EMERGENCY I/O OPTIMIZATION: Only fetch latest profile to reduce disk reads
    const { data: existing } = await supabase
      .from('user_360_profiles')
      .select('id, version, updated_at')  // Only select minimal fields needed
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    // OPTIMIZATION: Compress profile data for storage
    const compressedProfileData = this.compressProfileData(profileData);

    const profilePayload = {
      user_id: userId,
      profile_data: compressedProfileData,
      data_availability: dataAvailability as any,
      data_sources: dataSources,
      last_updated: new Date().toISOString(),
      version: existing ? existing.version + 1 : 1
    };

    if (existing) {
      const { data, error } = await supabase
        .from('user_360_profiles')
        .update(profilePayload)
        .eq('user_id', userId)
        .eq('id', existing.id)  // Use specific ID to avoid race conditions
        .select()
        .single();

      if (error) throw error;
      return this.mapToUser360Profile(data);
    } else {
      const { data, error } = await supabase
        .from('user_360_profiles')
        .insert(profilePayload)
        .select()
        .single();

      if (error) throw error;
      return this.mapToUser360Profile(data);
    }
  }

  // EMERGENCY I/O OPTIMIZATION: Compress profile data before storage
  private compressProfileData(profileData: any): any {
    const compressed: any = {};
    
    // Only store essential data, skip undefined/null values
    for (const [key, value] of Object.entries(profileData)) {
      if (value !== undefined && value !== null) {
        if (typeof value === 'object' && value !== null) {
          // For objects, only store if they have meaningful content
          const hasContent = Object.keys(value).length > 0;
          if (hasContent) {
            compressed[key] = value;
          }
        } else {
          compressed[key] = value;
        }
      }
    }
    
    return compressed;
  }

  private mapToUser360Profile(data: any): User360Profile {
    return {
      id: data.id,
      userId: data.user_id,
      profileData: data.profile_data,
      dataAvailability: data.data_availability,
      dataSources: data.data_sources,
      lastUpdated: data.last_updated,
      version: data.version
    };
  }

  async refreshUserProfile(userId: string): Promise<User360Profile | null> {
    console.log('🔄 360° Service: Refreshing profile for user:', userId);
    return this.getUserProfile(userId);
  }
}

export const user360Service = new User360DataService();

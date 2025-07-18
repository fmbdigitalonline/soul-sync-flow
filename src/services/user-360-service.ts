
import { supabase } from '@/integrations/supabase/client';
import { useUserProfile } from '@/hooks/use-user-profile';
import { useBlueprintCache } from '@/contexts/BlueprintCacheContext';

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
  async getUserProfile(userId: string): Promise<User360Profile | null> {
    console.log('🔄 360° Service: Aggregating user profile data for:', userId);
    
    try {
      // Real data aggregation from all silos - no mock data
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
      ] = await Promise.allSettled([
        this.getBlueprintData(userId),
        this.getIntelligenceData(userId),
        this.getMemoryNodes(userId),
        this.getMemoryEdges(userId),
        this.getBehavioralPatterns(userId),
        this.getGrowthJourney(userId),
        this.getUserActivities(userId),
        this.getUserGoals(userId),
        this.getConversations(userId),
        this.getUserStatistics(userId)
      ]);

      // Transparent data availability tracking - never mask errors
      const dataAvailability: DataAvailability = {
        blueprint: {
          available: blueprintResult.status === 'fulfilled' && blueprintResult.value !== null,
          lastUpdated: blueprintResult.status === 'fulfilled' && blueprintResult.value ? 
            blueprintResult.value.updated_at : undefined,
          completionPercentage: blueprintResult.status === 'fulfilled' && blueprintResult.value ?
            this.calculateBlueprintCompleteness(blueprintResult.value) : 0
        },
        intelligence: {
          available: intelligenceResult.status === 'fulfilled' && intelligenceResult.value !== null,
          modules: intelligenceResult.status === 'fulfilled' && intelligenceResult.value?.module_scores ?
            Object.keys(intelligenceResult.value.module_scores) : [],
          totalScore: intelligenceResult.status === 'fulfilled' && intelligenceResult.value?.intelligence_level ?
            intelligenceResult.value.intelligence_level : undefined
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
            patternsResult.value.reduce((sum: number, p: any) => sum + p.confidence, 0) / patternsResult.value.length : undefined
        },
        growth: {
          available: growthResult.status === 'fulfilled' && growthResult.value !== null,
          entriesCount: growthResult.status === 'fulfilled' && growthResult.value ? (
            (isJsonArray(growthResult.value.reflection_entries) ? growthResult.value.reflection_entries.length : 0) +
            (isJsonArray(growthResult.value.mood_entries) ? growthResult.value.mood_entries.length : 0)
          ) : 0,
          lastReflection: growthResult.status === 'fulfilled' && growthResult.value?.last_reflection_date ?
            growthResult.value.last_reflection_date : undefined
        },
        activities: {
          available: activitiesResult.status === 'fulfilled' && activitiesResult.value !== null,
          totalActivities: activitiesResult.status === 'fulfilled' ? activitiesResult.value?.length || 0 : 0,
          totalPoints: statisticsResult.status === 'fulfilled' && statisticsResult.value?.total_points ?
            statisticsResult.value.total_points : 0
        },
        goals: {
          available: goalsResult.status === 'fulfilled' && goalsResult.value !== null,
          activeGoals: goalsResult.status === 'fulfilled' ?
            goalsResult.value?.filter((g: any) => g.status === 'active').length || 0 : 0,
          completedGoals: goalsResult.status === 'fulfilled' ?
            goalsResult.value?.filter((g: any) => g.status === 'completed').length || 0 : 0
        },
        conversations: {
          available: conversationsResult.status === 'fulfilled' && conversationsResult.value !== null,
          totalConversations: conversationsResult.status === 'fulfilled' ? conversationsResult.value?.length || 0 : 0,
          lastActivity: conversationsResult.status === 'fulfilled' && conversationsResult.value?.length > 0 ?
            conversationsResult.value[0].last_activity : undefined
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
      
      console.log('✅ 360° Service: Profile aggregated successfully', {
        dataSources: dataSources.length,
        availability: Object.keys(dataAvailability).filter(key => 
          (dataAvailability as any)[key].available
        ).length
      });

      return profile360;
    } catch (error) {
      console.error('❌ 360° Service: Error aggregating profile:', error);
      // Don't mask errors - surface them clearly
      throw error;
    }
  }

  private async getBlueprintData(userId: string) {
    const { data, error } = await supabase
      .from('blueprints')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.warn('Blueprint data unavailable:', error.message);
      return null;
    }
    return data;
  }

  private async getIntelligenceData(userId: string) {
    const { data, error } = await supabase
      .from('hacs_intelligence')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.warn('Intelligence data unavailable:', error.message);
      return null;
    }
    return data;
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
    const { data: existing } = await supabase
      .from('user_360_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    const profilePayload = {
      user_id: userId,
      profile_data: profileData,
      data_availability: dataAvailability as any, // Cast to Json for Supabase compatibility
      data_sources: dataSources,
      last_updated: new Date().toISOString(),
      version: existing ? existing.version + 1 : 1
    };

    if (existing) {
      const { data, error } = await supabase
        .from('user_360_profiles')
        .update(profilePayload)
        .eq('user_id', userId)
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


import { supabase } from "@/integrations/supabase/client";
import { memoryService, SessionMemory } from "./memory-service";

export interface MemorySearchResult {
  memories: SessionMemory[];
  searchStrategy: 'exact' | 'fuzzy' | 'context' | 'session';
  matchCount: number;
  executionTime: number;
}

export interface MemoryConsistencyReport {
  userId: string;
  totalMemories: number;
  sessionMemories: number;
  recentMemories: number;
  searchCapability: boolean;
  retrievalLatency: number;
  lastMemoryDate: string | null;
  consistencyScore: number;
}

class EnhancedMemoryService {
  private async getAuthenticatedUserId(): Promise<string | null> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error || !user) {
        console.error('🔐 Enhanced Memory: Authentication error:', error?.message);
        return null;
      }
      
      console.log('✅ Enhanced Memory: User authenticated:', user.id);
      return user.id;
    } catch (error) {
      console.error('🔐 Enhanced Memory: Unexpected auth error:', error);
      return null;
    }
  }

  async performProgressiveSearch(query: string, limit = 5): Promise<MemorySearchResult> {
    const startTime = Date.now();
    const userId = await this.getAuthenticatedUserId();
    
    if (!userId) {
      return {
        memories: [],
        searchStrategy: 'exact',
        matchCount: 0,
        executionTime: Date.now() - startTime
      };
    }

    console.log('🔍 Enhanced Memory: Starting progressive search for:', query);

    // Strategy 1: Exact context summary match
    let memories = await this.searchByContextSummary(userId, query, limit);
    if (memories.length > 0) {
      console.log(`✅ Enhanced Memory: Found ${memories.length} memories via exact match`);
      return {
        memories,
        searchStrategy: 'exact',
        matchCount: memories.length,
        executionTime: Date.now() - startTime
      };
    }

    // Strategy 2: Fuzzy content search
    memories = await this.searchByContent(userId, query, limit);
    if (memories.length > 0) {
      console.log(`✅ Enhanced Memory: Found ${memories.length} memories via fuzzy search`);
      return {
        memories,
        searchStrategy: 'fuzzy',
        matchCount: memories.length,
        executionTime: Date.now() - startTime
      };
    }

    // Strategy 3: Context-based search
    memories = await this.searchByContext(userId, query, limit);
    if (memories.length > 0) {
      console.log(`✅ Enhanced Memory: Found ${memories.length} memories via context search`);
      return {
        memories,
        searchStrategy: 'context',
        matchCount: memories.length,
        executionTime: Date.now() - startTime
      };
    }

    console.log('⚠️ Enhanced Memory: No memories found with any strategy');
    return {
      memories: [],
      searchStrategy: 'context',
      matchCount: 0,
      executionTime: Date.now() - startTime
    };
  }

  private async searchByContextSummary(userId: string, query: string, limit: number): Promise<SessionMemory[]> {
    try {
      const { data, error } = await supabase
        .from('user_session_memory')
        .select('*')
        .eq('user_id', userId)
        .ilike('context_summary', `%${query}%`)
        .order('importance_score', { ascending: false })
        .order('last_referenced', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data as SessionMemory[] || [];
    } catch (error) {
      console.error('❌ Enhanced Memory: Context summary search error:', error);
      return [];
    }
  }

  private async searchByContent(userId: string, query: string, limit: number): Promise<SessionMemory[]> {
    try {
      const { data, error } = await supabase
        .from('user_session_memory')
        .select('*')
        .eq('user_id', userId)
        .or(`memory_data->>content.ilike.%${query}%,memory_data->>test_content.ilike.%${query}%`)
        .order('importance_score', { ascending: false })
        .order('last_referenced', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data as SessionMemory[] || [];
    } catch (error) {
      console.error('❌ Enhanced Memory: Content search error:', error);
      return [];
    }
  }

  private async searchByContext(userId: string, query: string, limit: number): Promise<SessionMemory[]> {
    try {
      const { data, error } = await supabase
        .from('user_session_memory')
        .select('*')
        .eq('user_id', userId)
        .order('importance_score', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(limit * 2);

      if (error) throw error;
      
      // Filter by relevance to query
      const filtered = (data as SessionMemory[] || []).filter(memory => {
        const contextSummary = memory.context_summary?.toLowerCase() || '';
        const memoryData = JSON.stringify(memory.memory_data).toLowerCase();
        const queryLower = query.toLowerCase();
        
        return contextSummary.includes(queryLower) || memoryData.includes(queryLower);
      });

      return filtered.slice(0, limit);
    } catch (error) {
      console.error('❌ Enhanced Memory: Context search error:', error);
      return [];
    }
  }

  async getMemoriesBySession(sessionId: string): Promise<SessionMemory[]> {
    const userId = await this.getAuthenticatedUserId();
    if (!userId) return [];

    try {
      console.log(`🔍 Enhanced Memory: Fetching memories for session: ${sessionId}`);
      
      const { data, error } = await supabase
        .from('user_session_memory')
        .select('*')
        .eq('user_id', userId)
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      console.log(`✅ Enhanced Memory: Found ${data?.length || 0} memories for session`);
      return data as SessionMemory[] || [];
    } catch (error) {
      console.error('❌ Enhanced Memory: Session search error:', error);
      return [];
    }
  }

  async generateConsistencyReport(): Promise<MemoryConsistencyReport> {
    const startTime = Date.now();
    const userId = await this.getAuthenticatedUserId();
    
    if (!userId) {
      return {
        userId: 'not_authenticated',
        totalMemories: 0,
        sessionMemories: 0,
        recentMemories: 0,
        searchCapability: false,
        retrievalLatency: Date.now() - startTime,
        lastMemoryDate: null,
        consistencyScore: 0
      };
    }

    try {
      // Get total memories
      const { data: totalData, error: totalError } = await supabase
        .from('user_session_memory')
        .select('id, created_at')
        .eq('user_id', userId);

      if (totalError) throw totalError;

      const totalMemories = totalData?.length || 0;
      
      // Get recent memories (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const { data: recentData, error: recentError } = await supabase
        .from('user_session_memory')
        .select('id')
        .eq('user_id', userId)
        .gte('created_at', sevenDaysAgo.toISOString());

      if (recentError) throw recentError;

      const recentMemories = recentData?.length || 0;

      // Test search capability
      const searchTest = await this.performProgressiveSearch('test', 1);
      const searchCapability = searchTest.memories.length > 0 || totalMemories === 0;

      // Get unique sessions
      const { data: sessionData, error: sessionError } = await supabase
        .from('user_session_memory')
        .select('session_id')
        .eq('user_id', userId);

      if (sessionError) throw sessionError;

      const uniqueSessions = new Set(sessionData?.map(s => s.session_id)).size;

      // Calculate consistency score
      const consistencyScore = this.calculateConsistencyScore({
        totalMemories,
        recentMemories,
        searchCapability,
        uniqueSessions,
        retrievalLatency: Date.now() - startTime
      });

      const lastMemoryDate = totalData && totalData.length > 0 
        ? totalData.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0].created_at
        : null;

      return {
        userId: userId.substring(0, 8),
        totalMemories,
        sessionMemories: uniqueSessions,
        recentMemories,
        searchCapability,
        retrievalLatency: Date.now() - startTime,
        lastMemoryDate,
        consistencyScore
      };
    } catch (error) {
      console.error('❌ Enhanced Memory: Consistency report error:', error);
      return {
        userId: userId.substring(0, 8),
        totalMemories: 0,
        sessionMemories: 0,
        recentMemories: 0,
        searchCapability: false,
        retrievalLatency: Date.now() - startTime,
        lastMemoryDate: null,
        consistencyScore: 0
      };
    }
  }

  private calculateConsistencyScore(metrics: {
    totalMemories: number;
    recentMemories: number;
    searchCapability: boolean;
    uniqueSessions: number;
    retrievalLatency: number;
  }): number {
    let score = 0;
    
    // Memory volume score (0-30)
    if (metrics.totalMemories > 10) score += 30;
    else if (metrics.totalMemories > 5) score += 20;
    else if (metrics.totalMemories > 0) score += 10;
    
    // Recent activity score (0-25)
    if (metrics.recentMemories > 5) score += 25;
    else if (metrics.recentMemories > 2) score += 15;
    else if (metrics.recentMemories > 0) score += 10;
    
    // Search capability score (0-25)
    if (metrics.searchCapability) score += 25;
    
    // Session diversity score (0-10)
    if (metrics.uniqueSessions > 3) score += 10;
    else if (metrics.uniqueSessions > 1) score += 5;
    
    // Performance score (0-10)
    if (metrics.retrievalLatency < 500) score += 10;
    else if (metrics.retrievalLatency < 1000) score += 5;
    
    return Math.min(100, score);
  }

  async testMemoryFlow(): Promise<{
    creationTest: boolean;
    retrievalTest: boolean;
    searchTest: boolean;
    sessionTest: boolean;
    error?: string;
  }> {
    const testSessionId = `test-${Date.now()}`;
    const testContent = `Memory flow test - ${new Date().toISOString()}`;
    
    try {
      console.log('🧪 Enhanced Memory: Starting memory flow test');
      
      // Test 1: Memory creation
      const createdMemory = await memoryService.saveMemory({
        user_id: '', // Will be set by memoryService
        session_id: testSessionId,
        memory_type: 'interaction',
        memory_data: {
          test_type: 'memory_flow_test',
          test_content: testContent,
          timestamp: new Date().toISOString()
        },
        context_summary: 'Memory flow test',
        importance_score: 8
      });
      
      const creationTest = !!createdMemory;
      console.log('🧪 Creation test:', creationTest ? 'PASS' : 'FAIL');
      
      if (!creationTest) {
        return { creationTest: false, retrievalTest: false, searchTest: false, sessionTest: false };
      }
      
      // Wait for database consistency
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Test 2: Direct retrieval
      const recentMemories = await memoryService.getRecentMemories(10);
      const retrievalTest = recentMemories.some(m => m.session_id === testSessionId);
      console.log('🧪 Retrieval test:', retrievalTest ? 'PASS' : 'FAIL');
      
      // Test 3: Search functionality
      const searchResult = await this.performProgressiveSearch('memory_flow_test', 5);
      const searchTest = searchResult.memories.some(m => m.session_id === testSessionId);
      console.log('🧪 Search test:', searchTest ? 'PASS' : 'FAIL');
      
      // Test 4: Session-specific retrieval
      const sessionMemories = await this.getMemoriesBySession(testSessionId);
      const sessionTest = sessionMemories.length > 0;
      console.log('🧪 Session test:', sessionTest ? 'PASS' : 'FAIL');
      
      return {
        creationTest,
        retrievalTest,
        searchTest,
        sessionTest
      };
    } catch (error) {
      console.error('❌ Enhanced Memory: Memory flow test error:', error);
      return {
        creationTest: false,
        retrievalTest: false,
        searchTest: false,
        sessionTest: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

export const enhancedMemoryService = new EnhancedMemoryService();


import { supabase } from "@/integrations/supabase/client";

export interface HotMemoryEntry {
  id: string;
  user_id: string;
  session_id: string;
  cache_key: string;
  content_hash: string;
  raw_content: any;
  importance_score: number;
  access_count: number;
  last_accessed: string;
  created_at: string;
  expires_at: string;
}

export interface MemoryGraphNode {
  id: string;
  user_id: string;
  node_type: 'entity' | 'topic' | 'summary' | 'conversation' | 'preference';
  label: string;
  properties: Record<string, any>;
  importance_score: number;
  schema_version: number;
  created_at: string;
  updated_at: string;
}

export interface MemoryGraphEdge {
  id: string;
  user_id: string;
  from_node_id: string;
  to_node_id: string;
  relationship_type: 'relates_to' | 'mentions' | 'likes' | 'discussed_with' | 'summary_of';
  properties: Record<string, any>;
  weight: number;
  schema_version: number;
  created_at: string;
}

export interface MemoryDelta {
  id: string;
  user_id: string;
  session_id: string;
  delta_hash: string;
  previous_hash?: string;
  delta_type: 'conversation_turn' | 'summary_update' | 'node_change' | 'schema_migration';
  delta_data: any;
  importance_score: number;
  schema_version: number;
  created_at: string;
}

export interface MemoryMetrics {
  user_id: string;
  memory_tier: 'hot' | 'warm' | 'cold';
  access_type: 'hit' | 'miss' | 'write' | 'eviction';
  latency_ms?: number;
  session_id?: string;
}

class TieredMemoryGraphService {
  private writebackInterval: NodeJS.Timeout | null = null;
  private readonly HOT_MEMORY_LIMIT = 20; // Last 20 conversation turns
  private readonly HOT_MEMORY_TTL = 3600; // 1 hour in seconds

  constructor() {
    this.startWritebackProcessor();
  }

  // HOT MEMORY OPERATIONS
  async storeInHotMemory(
    userId: string,
    sessionId: string,
    content: any,
    importanceScore: number = 5.0
  ): Promise<string | null> {
    try {
      const startTime = Date.now();
      const contentStr = JSON.stringify(content);
      const contentHash = await this.generateContentHash(contentStr);
      const cacheKey = `${sessionId}_${Date.now()}`;

      // Store in hot_memory_cache table
      const { data, error } = await supabase
        .from('hot_memory_cache')
        .insert({
          user_id: userId,
          session_id: sessionId,
          cache_key: cacheKey,
          content_hash: contentHash,
          raw_content: content,
          importance_score: importanceScore,
          expires_at: new Date(Date.now() + this.HOT_MEMORY_TTL * 1000).toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Failed to store in hot memory:', error);
        return null;
      }

      // Record metrics
      await this.recordMetrics({
        user_id: userId,
        memory_tier: 'hot',
        access_type: 'write',
        latency_ms: Date.now() - startTime,
        session_id: sessionId
      });

      // Cleanup old entries if over limit
      await this.cleanupHotMemory(userId, sessionId);

      // Queue for writeback to warm memory
      await this.queueWriteback(data.id, 'persist_to_warm');

      return data.id;
    } catch (error) {
      console.error('Error storing in hot memory:', error);
      return null;
    }
  }

  async getFromHotMemory(
    userId: string,
    sessionId: string,
    limit: number = this.HOT_MEMORY_LIMIT
  ): Promise<HotMemoryEntry[]> {
    try {
      const startTime = Date.now();

      // Get from hot_memory_cache table
      const { data, error } = await supabase
        .from('hot_memory_cache')
        .select('*')
        .eq('user_id', userId)
        .eq('session_id', sessionId)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Failed to get from hot memory:', error);
        await this.recordMetrics({
          user_id: userId,
          memory_tier: 'hot',
          access_type: 'miss',
          latency_ms: Date.now() - startTime,
          session_id: sessionId
        });
        return [];
      }

      await this.recordMetrics({
        user_id: userId,
        memory_tier: 'hot',
        access_type: 'hit',
        latency_ms: Date.now() - startTime,
        session_id: sessionId
      });

      return data || [];
    } catch (error) {
      console.error('Error getting from hot memory:', error);
      return [];
    }
  }

  // WARM MEMORY OPERATIONS (Graph Database)
  async createGraphNode(
    userId: string,
    nodeType: MemoryGraphNode['node_type'],
    label: string,
    properties: Record<string, any> = {},
    importanceScore: number = 5.0
  ): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('memory_graph_nodes')
        .insert({
          user_id: userId,
          node_type: nodeType,
          label: label,
          properties: properties,
          importance_score: importanceScore
        })
        .select()
        .single();

      if (error) {
        console.error('Failed to create graph node:', error);
        return null;
      }

      return data?.id || null;
    } catch (error) {
      console.error('Error creating graph node:', error);
      return null;
    }
  }

  async createGraphEdge(
    userId: string,
    fromNodeId: string,
    toNodeId: string,
    relationshipType: MemoryGraphEdge['relationship_type'],
    properties: Record<string, any> = {},
    weight: number = 1.0
  ): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('memory_graph_edges')
        .insert({
          user_id: userId,
          from_node_id: fromNodeId,
          to_node_id: toNodeId,
          relationship_type: relationshipType,
          properties: properties,
          weight: weight
        })
        .select()
        .single();

      if (error) {
        console.error('Failed to create graph edge:', error);
        return null;
      }

      return data?.id || null;
    } catch (error) {
      console.error('Error creating graph edge:', error);
      return null;
    }
  }

  async traverseGraph(
    userId: string,
    startNodeId: string,
    relationshipTypes?: string[],
    maxDepth: number = 2
  ): Promise<{ nodes: MemoryGraphNode[], edges: MemoryGraphEdge[] }> {
    try {
      // Get nodes first
      const { data: nodesData, error: nodesError } = await supabase
        .from('memory_graph_nodes')
        .select('*')
        .eq('user_id', userId)
        .limit(20);

      if (nodesError) {
        console.error('Error getting graph nodes:', nodesError);
        return { nodes: [], edges: [] };
      }

      // Get edges
      const { data: edgesData, error: edgesError } = await supabase
        .from('memory_graph_edges')
        .select('*')
        .eq('user_id', userId)
        .limit(50);

      if (edgesError) {
        console.error('Error getting graph edges:', edgesError);
        return { nodes: nodesData ? this.castToMemoryGraphNodes(nodesData) : [], edges: [] };
      }

      return { 
        nodes: nodesData ? this.castToMemoryGraphNodes(nodesData) : [], 
        edges: edgesData ? this.castToMemoryGraphEdges(edgesData) : [] 
      };
    } catch (error) {
      console.error('Error traversing graph:', error);
      return { nodes: [], edges: [] };
    }
  }

  // DELTA COMPRESSION OPERATIONS
  async storeDelta(
    userId: string,
    sessionId: string,
    deltaType: MemoryDelta['delta_type'],
    deltaData: any,
    previousHash?: string,
    importanceScore: number = 5.0
  ): Promise<string | null> {
    try {
      const deltaHash = await this.generateDeltaHash(deltaData, previousHash);

      const { data, error } = await supabase
        .from('memory_deltas')
        .insert({
          user_id: userId,
          session_id: sessionId,
          delta_hash: deltaHash,
          previous_hash: previousHash,
          delta_type: deltaType,
          delta_data: deltaData,
          importance_score: importanceScore
        })
        .select()
        .single();

      if (error) {
        console.error('Failed to store delta:', error);
        return deltaHash;
      }

      return deltaHash;
    } catch (error) {
      console.error('Error storing delta:', error);
      return null;
    }
  }

  async reconstructFromDeltas(
    userId: string,
    sessionId: string,
    targetHash: string
  ): Promise<any> {
    try {
      // Get delta chain
      const deltas = await this.getDeltaChain(userId, sessionId, targetHash);
      
      // Reconstruct by applying deltas in order
      let reconstructed = {};
      
      for (const delta of deltas) {
        reconstructed = this.applyDelta(reconstructed, delta.delta_data);
      }

      return reconstructed;
    } catch (error) {
      console.error('Error reconstructing from deltas:', error);
      return null;
    }
  }

  // IMPORTANCE SCORING
  async calculateImportanceScore(
    userId: string,
    semanticNovelty: number,
    emotionIntensity: number,
    userFeedback: number,
    recurrenceCount: number
  ): Promise<number> {
    try {
      // Weighted formula: semantic novelty (30%) + emotion intensity (40%) + user feedback (20%) + recurrence (10%)
      const weights = {
        semanticNovelty: 0.3,
        emotionIntensity: 0.4,
        userFeedback: 0.2,
        recurrenceCount: 0.1
      };

      // Normalize inputs to 0-10 scale
      const normalizedSemanticNovelty = Math.max(0, Math.min(10, semanticNovelty));
      const normalizedEmotionIntensity = Math.max(0, Math.min(10, emotionIntensity));
      const normalizedUserFeedback = Math.max(0, Math.min(10, userFeedback));
      const normalizedRecurrence = Math.max(0, Math.min(10, recurrenceCount));

      const score = 
        (normalizedSemanticNovelty * weights.semanticNovelty) +
        (normalizedEmotionIntensity * weights.emotionIntensity) +
        (normalizedUserFeedback * weights.userFeedback) +
        (normalizedRecurrence * weights.recurrenceCount);

      // Return score between 1-10
      return Math.max(1, Math.min(10, score));
    } catch (error) {
      console.error('Error calculating importance score:', error);
      return 5.0; // Default score
    }
  }

  // METRICS AND MONITORING
  async recordMetrics(metrics: MemoryMetrics): Promise<void> {
    try {
      // Validate required fields before insertion
      if (!metrics.user_id || !metrics.memory_tier || !metrics.access_type) {
        console.warn('Skipping metrics recording due to missing required fields:', metrics);
        return;
      }

      await supabase
        .from('memory_metrics')
        .insert({
          user_id: metrics.user_id,
          memory_tier: metrics.memory_tier,
          access_type: metrics.access_type,
          latency_ms: metrics.latency_ms,
          session_id: metrics.session_id
        });
    } catch (error) {
      console.error('Error recording metrics:', error);
    }
  }

  async getPerformanceMetrics(
    userId: string,
    timeRange: number = 24 * 60 * 60 * 1000 // 24 hours
  ): Promise<{
    hotHits: number;
    warmHits: number;
    coldHits: number;
    avgLatency: Record<string, number>;
  }> {
    try {
      const since = new Date(Date.now() - timeRange).toISOString();

      const { data, error } = await supabase
        .from('memory_metrics')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', since);

      if (error || !data) {
        return { hotHits: 0, warmHits: 0, coldHits: 0, avgLatency: {} };
      }

      const stats = data.reduce((acc, metric) => {
        const tier = metric.memory_tier;
        const type = metric.access_type;
        
        if (type === 'hit') {
          acc[`${tier}Hits`] = (acc[`${tier}Hits`] || 0) + 1;
        }
        
        if (metric.latency_ms) {
          acc.latencies[tier] = acc.latencies[tier] || [];
          acc.latencies[tier].push(metric.latency_ms);
        }
        
        return acc;
      }, { hotHits: 0, warmHits: 0, coldHits: 0, latencies: {} } as any);

      const avgLatency = Object.entries(stats.latencies).reduce((acc, [tier, latencies]: [string, number[]]) => {
        acc[tier] = latencies.reduce((sum, lat) => sum + lat, 0) / latencies.length;
        return acc;
      }, {} as Record<string, number>);

      return {
        hotHits: stats.hotHits,
        warmHits: stats.warmHits,
        coldHits: stats.coldHits,
        avgLatency
      };
    } catch (error) {
      console.error('Error getting performance metrics:', error);
      return { hotHits: 0, warmHits: 0, coldHits: 0, avgLatency: {} };
    }
  }

  // WRITEBACK PROCESSING
  private async queueWriteback(cacheId: string, operationType: string): Promise<void> {
    try {
      await supabase
        .from('memory_writeback_queue')
        .insert({
          cache_id: cacheId,
          operation_type: operationType
        });
    } catch (error) {
      console.error('Error queueing writeback:', error);
    }
  }

  private startWritebackProcessor(): void {
    this.writebackInterval = setInterval(async () => {
      await this.processWritebackQueue();
    }, 30000); // Process every 30 seconds
  }

  private async processWritebackQueue(): Promise<void> {
    try {
      const { data: items, error } = await supabase
        .from('memory_writeback_queue')
        .select('*')
        .eq('status', 'pending')
        .limit(10);

      if (error || !items || items.length === 0) {
        return;
      }

      for (const item of items) {
        try {
          await this.executeWriteback(item);
          
          // Mark as completed
          await supabase
            .from('memory_writeback_queue')
            .update({ 
              status: 'completed', 
              processed_at: new Date().toISOString() 
            })
            .eq('id', item.id);
        } catch (error) {
          // Mark as failed
          await supabase
            .from('memory_writeback_queue')
            .update({ 
              status: 'failed', 
              error_message: error.message,
              processed_at: new Date().toISOString() 
            })
            .eq('id', item.id);
        }
      }
    } catch (error) {
      console.error('Error processing writeback queue:', error);
    }
  }

  private async executeWriteback(item: any): Promise<void> {
    // Implementation would depend on operation type
    console.log('Executing writeback for item:', item);
  }

  // TYPE CASTING HELPERS
  private castToMemoryGraphNodes(data: any[]): MemoryGraphNode[] {
    return data.map(node => ({
      ...node,
      node_type: node.node_type as MemoryGraphNode['node_type']
    }));
  }

  private castToMemoryGraphEdges(data: any[]): MemoryGraphEdge[] {
    return data.map(edge => ({
      ...edge,
      relationship_type: edge.relationship_type as MemoryGraphEdge['relationship_type']
    }));
  }

  private castToMemoryDeltas(data: any[]): MemoryDelta[] {
    return data.map(delta => ({
      ...delta,
      delta_type: delta.delta_type as MemoryDelta['delta_type']
    }));
  }

  // UTILITY METHODS
  private async cleanupHotMemory(userId: string, sessionId: string): Promise<void> {
    try {
      // Remove expired entries
      await supabase
        .from('hot_memory_cache')
        .delete()
        .eq('user_id', userId)
        .lt('expires_at', new Date().toISOString());

      // Keep only the most recent entries up to the limit
      const { data: allEntries } = await supabase
        .from('hot_memory_cache')
        .select('id')
        .eq('user_id', userId)
        .eq('session_id', sessionId)
        .order('created_at', { ascending: false });

      if (allEntries && allEntries.length > this.HOT_MEMORY_LIMIT) {
        const idsToDelete = allEntries.slice(this.HOT_MEMORY_LIMIT).map(entry => entry.id);
        
        await supabase
          .from('hot_memory_cache')
          .delete()
          .in('id', idsToDelete);
      }
    } catch (error) {
      console.error('Error cleaning up hot memory:', error);
    }
  }

  private async generateContentHash(content: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(content);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  private async generateDeltaHash(deltaData: any, previousHash?: string): Promise<string> {
    const content = (previousHash || '') + JSON.stringify(deltaData);
    return this.generateContentHash(content);
  }

  private async getDeltaChain(userId: string, sessionId: string, targetHash: string): Promise<MemoryDelta[]> {
    try {
      const { data, error } = await supabase
        .from('memory_deltas')
        .select('*')
        .eq('user_id', userId)
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      if (error || !data) {
        return [];
      }

      return this.castToMemoryDeltas(data);
    } catch (error) {
      console.error('Error getting delta chain:', error);
      return [];
    }
  }

  private applyDelta(state: any, delta: any): any {
    // Simple delta application - in production, use proper diff/patch library
    return { ...state, ...delta };
  }

  // Cleanup
  destroy(): void {
    if (this.writebackInterval) {
      clearInterval(this.writebackInterval);
      this.writebackInterval = null;
    }
  }
}

export const tieredMemoryGraph = new TieredMemoryGraphService();

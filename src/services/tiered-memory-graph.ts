
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

      const { data, error } = await supabase
        .from('hot_memory_cache')
        .select('*')
        .eq('user_id', userId)
        .eq('session_id', sessionId)
        .gt('expires_at', new Date().toISOString())
        .order('importance_score', { ascending: false })
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

      // Update access count
      if (data.length > 0) {
        const ids = data.map(entry => entry.id);
        await supabase
          .from('hot_memory_cache')
          .update({ 
            access_count: supabase.rpc('increment', { x: 1 }),
            last_accessed: new Date().toISOString()
          })
          .in('id', ids);
      }

      await this.recordMetrics({
        user_id: userId,
        memory_tier: 'hot',
        access_type: 'hit',
        latency_ms: Date.now() - startTime,
        session_id: sessionId
      });

      return data as HotMemoryEntry[];
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
          label,
          properties,
          importance_score: importanceScore
        })
        .select()
        .single();

      if (error) {
        console.error('Failed to create graph node:', error);
        return null;
      }

      return data.id;
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
          properties,
          weight
        })
        .select()
        .single();

      if (error) {
        console.error('Failed to create graph edge:', error);
        return null;
      }

      return data.id;
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
      // Simple graph traversal - in production, use recursive CTEs or graph algorithms
      const visitedNodes = new Set<string>();
      const nodes: MemoryGraphNode[] = [];
      const edges: MemoryGraphEdge[] = [];
      const queue = [{ nodeId: startNodeId, depth: 0 }];

      while (queue.length > 0 && nodes.length < 50) { // Limit results
        const { nodeId, depth } = queue.shift()!;

        if (visitedNodes.has(nodeId) || depth > maxDepth) continue;
        visitedNodes.add(nodeId);

        // Get node
        const { data: nodeData } = await supabase
          .from('memory_graph_nodes')
          .select('*')
          .eq('id', nodeId)
          .eq('user_id', userId)
          .single();

        if (nodeData) {
          nodes.push(nodeData as MemoryGraphNode);

          // Get connected edges
          let edgeQuery = supabase
            .from('memory_graph_edges')
            .select('*')
            .eq('user_id', userId)
            .or(`from_node_id.eq.${nodeId},to_node_id.eq.${nodeId}`);

          if (relationshipTypes) {
            edgeQuery = edgeQuery.in('relationship_type', relationshipTypes);
          }

          const { data: edgeData } = await edgeQuery;

          if (edgeData) {
            edges.push(...(edgeData as MemoryGraphEdge[]));

            // Queue connected nodes for next depth
            edgeData.forEach(edge => {
              const connectedNodeId = edge.from_node_id === nodeId 
                ? edge.to_node_id 
                : edge.from_node_id;
              
              if (!visitedNodes.has(connectedNodeId)) {
                queue.push({ nodeId: connectedNodeId, depth: depth + 1 });
              }
            });
          }
        }
      }

      return { nodes, edges };
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
        return null;
      }

      return data.delta_hash;
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
      const { data, error } = await supabase
        .rpc('calculate_importance_score', {
          semantic_novelty: semanticNovelty,
          emotion_intensity: emotionIntensity,
          user_feedback: userFeedback,
          recurrence_count: recurrenceCount,
          user_id_param: userId
        });

      if (error) {
        console.error('Failed to calculate importance score:', error);
        return 5.0; // Default score
      }

      return data || 5.0;
    } catch (error) {
      console.error('Error calculating importance score:', error);
      return 5.0;
    }
  }

  // METRICS AND MONITORING
  async recordMetrics(metrics: MemoryMetrics): Promise<void> {
    try {
      await supabase
        .from('memory_access_metrics')
        .insert(metrics);
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
        .from('memory_access_metrics')
        .select('memory_tier, access_type, latency_ms')
        .eq('user_id', userId)
        .gte('timestamp', since);

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
      const { data: cacheEntry } = await supabase
        .from('hot_memory_cache')
        .select('user_id')
        .eq('id', cacheId)
        .single();

      if (cacheEntry) {
        await supabase
          .from('memory_writeback_queue')
          .insert({
            user_id: cacheEntry.user_id,
            cache_id: cacheId,
            operation_type: operationType,
            payload: { cache_id: cacheId }
          });
      }
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
      const { data: queue, error } = await supabase
        .from('memory_writeback_queue')
        .select('*')
        .eq('status', 'pending')
        .lt('attempts', 3)
        .order('created_at', { ascending: true })
        .limit(10);

      if (error || !queue) return;

      for (const item of queue) {
        try {
          await supabase
            .from('memory_writeback_queue')
            .update({ 
              status: 'processing',
              attempts: item.attempts + 1
            })
            .eq('id', item.id);

          await this.executeWriteback(item);

          await supabase
            .from('memory_writeback_queue')
            .update({ 
              status: 'completed',
              processed_at: new Date().toISOString()
            })
            .eq('id', item.id);

        } catch (error) {
          console.error('Writeback processing error:', error);
          await supabase
            .from('memory_writeback_queue')
            .update({ status: 'failed' })
            .eq('id', item.id);
        }
      }
    } catch (error) {
      console.error('Error processing writeback queue:', error);
    }
  }

  private async executeWriteback(item: any): Promise<void> {
    if (item.operation_type === 'persist_to_warm') {
      const { data: cacheEntry } = await supabase
        .from('hot_memory_cache')
        .select('*')
        .eq('id', item.cache_id)
        .single();

      if (cacheEntry) {
        // Create summary node in warm memory
        await this.createGraphNode(
          cacheEntry.user_id,
          'conversation',
          `Conversation turn ${cacheEntry.cache_key}`,
          cacheEntry.raw_content,
          cacheEntry.importance_score
        );
      }
    }
  }

  // UTILITY METHODS
  private async cleanupHotMemory(userId: string, sessionId: string): Promise<void> {
    try {
      const { data } = await supabase
        .from('hot_memory_cache')
        .select('id')
        .eq('user_id', userId)
        .eq('session_id', sessionId)
        .order('importance_score', { ascending: true })
        .order('created_at', { ascending: true });

      if (data && data.length > this.HOT_MEMORY_LIMIT) {
        const toDelete = data.slice(0, data.length - this.HOT_MEMORY_LIMIT);
        const idsToDelete = toDelete.map(entry => entry.id);

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
    const chain: MemoryDelta[] = [];
    let currentHash = targetHash;

    while (currentHash) {
      const { data } = await supabase
        .from('memory_deltas')
        .select('*')
        .eq('user_id', userId)
        .eq('session_id', sessionId)
        .eq('delta_hash', currentHash)
        .single();

      if (data) {
        chain.unshift(data as MemoryDelta);
        currentHash = data.previous_hash;
      } else {
        break;
      }
    }

    return chain;
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

// TMG - Tiered Memory Graph
// Multi-tier memory architecture with hot/warm/cold storage and graph relationships

export interface MemoryNode {
  id: string;
  content: any;
  type: 'conversation' | 'intent' | 'personality' | 'context' | 'system' | 'user_input';
  importance: number; // 0-10 scale
  tier: 'hot' | 'warm' | 'cold' | 'archived';
  timestamp: Date;
  accessCount: number;
  lastAccessed: Date;
  relationships: MemoryRelationship[];
  metadata: {
    sessionId?: string;
    userId?: string;
    domain?: string;
    agentMode?: string;
    tags?: string[];
    compression?: string;
    vector?: number[];
  };
}

export interface MemoryRelationship {
  targetId: string;
  type: 'causal' | 'temporal' | 'semantic' | 'contextual' | 'hierarchical';
  strength: number; // 0-1
  direction: 'bidirectional' | 'forward' | 'backward';
  metadata?: Record<string, any>;
}

export interface MemoryQuery {
  userId?: string;
  sessionId?: string;
  type?: MemoryNode['type'][];
  keywords?: string[];
  timeRange?: {
    start: Date;
    end: Date;
  };
  importance?: {
    min: number;
    max: number;
  };
  limit?: number;
  includeTiers?: MemoryNode['tier'][];
}

export interface MemoryCluster {
  id: string;
  nodes: string[];
  centroid: number[];
  coherence: number;
  topic: string;
  timestamp: Date;
}

class TieredMemoryGraph {
  private memoryGraph: Map<string, MemoryNode> = new Map();
  private hotMemory: Set<string> = new Set(); // Most accessed, recent
  private warmMemory: Set<string> = new Set(); // Moderately important
  private coldMemory: Set<string> = new Set(); // Long-term storage
  private archivedMemory: Set<string> = new Set(); // Compressed storage
  
  private clusters: Map<string, MemoryCluster> = new Map();
  private listeners: ((event: 'store' | 'access' | 'tier_change', node: MemoryNode) => void)[] = [];
  
  // Configuration
  private config = {
    hotMemoryLimit: 100,
    warmMemoryLimit: 500,
    coldMemoryLimit: 2000,
    importanceThreshold: {
      hot: 7,
      warm: 4,
      cold: 2
    },
    accessCountThreshold: {
      hot: 5,
      warm: 2
    },
    timeThresholds: {
      hotToWarm: 24 * 60 * 60 * 1000, // 24 hours
      warmToCold: 7 * 24 * 60 * 60 * 1000, // 7 days
      coldToArchived: 30 * 24 * 60 * 60 * 1000 // 30 days
    },
    compressionThreshold: 0.7,
    clusteringThreshold: 0.6
  };

  constructor() {
    this.initializeMaintenanceCycle();
  }

  // Store new memory in appropriate tier
  async storeMemory(
    content: any,
    type: MemoryNode['type'],
    importance: number,
    metadata: MemoryNode['metadata'] = {}
  ): Promise<MemoryNode> {
    
    const memoryNode: MemoryNode = {
      id: `mem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      content,
      type,
      importance: Math.max(0, Math.min(10, importance)),
      tier: this.determineTier(importance, 0, new Date()),
      timestamp: new Date(),
      accessCount: 1,
      lastAccessed: new Date(),
      relationships: [],
      metadata: {
        ...metadata,
        vector: this.generateContentVector(content)
      }
    };

    // Store in graph
    this.memoryGraph.set(memoryNode.id, memoryNode);
    
    // Add to appropriate tier
    this.addToTier(memoryNode.id, memoryNode.tier);
    
    // Find and create relationships
    await this.establishRelationships(memoryNode);
    
    // Update clusters if needed
    this.updateClusters(memoryNode);
    
    // Notify listeners
    this.notifyListeners('store', memoryNode);
    
    console.log(`🧠 TMG: Stored ${type} memory in ${memoryNode.tier} tier (importance: ${importance})`);
    return memoryNode;
  }

  // Retrieve memories based on query
  async queryMemories(query: MemoryQuery): Promise<MemoryNode[]> {
    let candidates = Array.from(this.memoryGraph.values());

    // Filter by user
    if (query.userId) {
      candidates = candidates.filter(node => node.metadata.userId === query.userId);
    }

    // Filter by session
    if (query.sessionId) {
      candidates = candidates.filter(node => node.metadata.sessionId === query.sessionId);
    }

    // Filter by type
    if (query.type && query.type.length > 0) {
      candidates = candidates.filter(node => query.type!.includes(node.type));
    }

    // Filter by tier
    if (query.includeTiers && query.includeTiers.length > 0) {
      candidates = candidates.filter(node => query.includeTiers!.includes(node.tier));
    }

    // Filter by importance range
    if (query.importance) {
      candidates = candidates.filter(node => 
        node.importance >= query.importance!.min && 
        node.importance <= query.importance!.max
      );
    }

    // Filter by time range
    if (query.timeRange) {
      candidates = candidates.filter(node => 
        node.timestamp >= query.timeRange!.start && 
        node.timestamp <= query.timeRange!.end
      );
    }

    // Keyword search
    if (query.keywords && query.keywords.length > 0) {
      candidates = candidates.filter(node => 
        this.matchesKeywords(node, query.keywords!)
      );
    }

    // Sort by relevance (importance + recency + access count)
    candidates.sort((a, b) => {
      const scoreA = this.calculateRelevanceScore(a, query);
      const scoreB = this.calculateRelevanceScore(b, query);
      return scoreB - scoreA;
    });

    // Apply limit
    if (query.limit) {
      candidates = candidates.slice(0, query.limit);
    }

    // Update access counts and last accessed
    candidates.forEach(node => {
      node.accessCount++;
      node.lastAccessed = new Date();
      this.notifyListeners('access', node);
    });

    console.log(`🧠 TMG: Retrieved ${candidates.length} memories for query`);
    return candidates;
  }

  // Establish relationships between memories
  private async establishRelationships(newNode: MemoryNode): Promise<void> {
    const recentNodes = Array.from(this.memoryGraph.values())
      .filter(node => node.id !== newNode.id)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 50); // Check last 50 nodes for relationships

    for (const node of recentNodes) {
      const relationships = this.detectRelationships(newNode, node);
      
      relationships.forEach(relationship => {
        // Add relationship to new node
        newNode.relationships.push(relationship);
        
        // Add reciprocal relationship to existing node
        const reciprocal: MemoryRelationship = {
          targetId: newNode.id,
          type: relationship.type,
          strength: relationship.strength,
          direction: relationship.direction === 'forward' ? 'backward' : 
                     relationship.direction === 'backward' ? 'forward' : 'bidirectional',
          metadata: relationship.metadata
        };
        
        node.relationships.push(reciprocal);
      });
    }
  }

  // Detect relationships between memory nodes
  private detectRelationships(node1: MemoryNode, node2: MemoryNode): MemoryRelationship[] {
    const relationships: MemoryRelationship[] = [];

    // Temporal relationship (within same session)
    if (node1.metadata.sessionId === node2.metadata.sessionId) {
      const timeDiff = Math.abs(node1.timestamp.getTime() - node2.timestamp.getTime());
      if (timeDiff < 5 * 60 * 1000) { // Within 5 minutes
        relationships.push({
          targetId: node2.id,
          type: 'temporal',
          strength: Math.max(0.3, 1 - (timeDiff / (5 * 60 * 1000))),
          direction: node1.timestamp > node2.timestamp ? 'forward' : 'backward'
        });
      }
    }

    // Semantic relationship (vector similarity)
    if (node1.metadata.vector && node2.metadata.vector) {
      const similarity = this.calculateVectorSimilarity(node1.metadata.vector, node2.metadata.vector);
      if (similarity > this.config.clusteringThreshold) {
        relationships.push({
          targetId: node2.id,
          type: 'semantic',
          strength: similarity,
          direction: 'bidirectional',
          metadata: { vectorSimilarity: similarity }
        });
      }
    }

    // Contextual relationship (same domain/mode)
    if (node1.metadata.domain === node2.metadata.domain && 
        node1.metadata.agentMode === node2.metadata.agentMode) {
      relationships.push({
        targetId: node2.id,
        type: 'contextual',
        strength: 0.6,
        direction: 'bidirectional',
        metadata: { 
          domain: node1.metadata.domain,
          agentMode: node1.metadata.agentMode
        }
      });
    }

    // Causal relationship (intent to action)
    if (node1.type === 'intent' && node2.type === 'user_input') {
      relationships.push({
        targetId: node2.id,
        type: 'causal',
        strength: 0.8,
        direction: 'forward',
        metadata: { causality: 'intent_to_action' }
      });
    }

    // Hierarchical relationship (conversation to context)
    if (node1.type === 'conversation' && node2.type === 'context') {
      relationships.push({
        targetId: node2.id,
        type: 'hierarchical',
        strength: 0.7,
        direction: 'bidirectional',
        metadata: { hierarchy: 'conversation_context' }
      });
    }

    return relationships;
  }

  // Generate content vector for semantic analysis
  private generateContentVector(content: any): number[] {
    // Simplified content vectorization
    const vector = new Array(64).fill(0);
    
    const text = typeof content === 'string' ? content : JSON.stringify(content);
    const words = text.toLowerCase().split(/\s+/);
    
    words.forEach((word, index) => {
      const hash = this.simpleHash(word);
      vector[hash % 64] += 1 / (index + 1); // Weight by position
    });

    // Normalize vector
    const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
    return magnitude > 0 ? vector.map(val => val / magnitude) : vector;
  }

  // Simple hash function for words
  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  // Calculate vector similarity
  private calculateVectorSimilarity(vec1: number[], vec2: number[]): number {
    if (vec1.length !== vec2.length) return 0;
    
    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;
    
    for (let i = 0; i < vec1.length; i++) {
      dotProduct += vec1[i] * vec2[i];
      norm1 += vec1[i] * vec1[i];
      norm2 += vec2[i] * vec2[i];
    }
    
    if (norm1 === 0 || norm2 === 0) return 0;
    return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
  }

  // Update memory clusters
  private updateClusters(newNode: MemoryNode): void {
    if (!newNode.metadata.vector) return;

    let assignedCluster = false;

    // Try to assign to existing cluster
    for (const [clusterId, cluster] of this.clusters) {
      const similarity = this.calculateVectorSimilarity(newNode.metadata.vector, cluster.centroid);
      
      if (similarity > this.config.clusteringThreshold) {
        cluster.nodes.push(newNode.id);
        cluster.centroid = this.updateClusterCentroid(cluster);
        assignedCluster = true;
        break;
      }
    }

    // Create new cluster if not assigned
    if (!assignedCluster && newNode.importance > 5) {
      const newCluster: MemoryCluster = {
        id: `cluster_${Date.now()}`,
        nodes: [newNode.id],
        centroid: [...newNode.metadata.vector],
        coherence: 1.0,
        topic: this.generateClusterTopic(newNode),
        timestamp: new Date()
      };
      
      this.clusters.set(newCluster.id, newCluster);
    }
  }

  // Update cluster centroid
  private updateClusterCentroid(cluster: MemoryCluster): number[] {
    const vectors = cluster.nodes
      .map(nodeId => this.memoryGraph.get(nodeId)?.metadata.vector)
      .filter(Boolean) as number[][];
    
    if (vectors.length === 0) return cluster.centroid;

    const dimensions = vectors[0].length;
    const centroid = new Array(dimensions).fill(0);
    
    vectors.forEach(vector => {
      vector.forEach((value, index) => {
        centroid[index] += value;
      });
    });
    
    return centroid.map(sum => sum / vectors.length);
  }

  // Generate cluster topic
  private generateClusterTopic(node: MemoryNode): string {
    // Extract key terms from content
    const text = typeof node.content === 'string' ? node.content : JSON.stringify(node.content);
    const words = text.toLowerCase().split(/\s+/)
      .filter(word => word.length > 3)
      .slice(0, 3);
    
    return words.join('_') || node.type;
  }

  // Tier management
  private determineTier(importance: number, accessCount: number, timestamp: Date): MemoryNode['tier'] {
    const age = Date.now() - timestamp.getTime();
    
    // Hot tier: high importance OR recent + high access
    if (importance >= this.config.importanceThreshold.hot || 
        (age < this.config.timeThresholds.hotToWarm && accessCount >= this.config.accessCountThreshold.hot)) {
      return 'hot';
    }
    
    // Warm tier: medium importance OR recent
    if (importance >= this.config.importanceThreshold.warm || age < this.config.timeThresholds.warmToCold) {
      return 'warm';
    }
    
    // Cold tier: low importance but not old enough to archive
    if (importance >= this.config.importanceThreshold.cold && age < this.config.timeThresholds.coldToArchived) {
      return 'cold';
    }
    
    // Archived tier: very old or very low importance
    return 'archived';
  }

  // Add memory to tier
  private addToTier(nodeId: string, tier: MemoryNode['tier']): void {
    switch (tier) {
      case 'hot':
        this.hotMemory.add(nodeId);
        break;
      case 'warm':
        this.warmMemory.add(nodeId);
        break;
      case 'cold':
        this.coldMemory.add(nodeId);
        break;
      case 'archived':
        this.archivedMemory.add(nodeId);
        break;
    }
  }

  // Remove memory from tier
  private removeFromTier(nodeId: string, tier: MemoryNode['tier']): void {
    switch (tier) {
      case 'hot':
        this.hotMemory.delete(nodeId);
        break;
      case 'warm':
        this.warmMemory.delete(nodeId);
        break;
      case 'cold':
        this.coldMemory.delete(nodeId);
        break;
      case 'archived':
        this.archivedMemory.delete(nodeId);
        break;
    }
  }

  // Periodic maintenance cycle
  private initializeMaintenanceCycle(): void {
    setInterval(() => {
      this.performMaintenance();
    }, 60 * 60 * 1000); // Every hour
  }

  // Maintenance operations
  private async performMaintenance(): Promise<void> {
    console.log('🧠 TMG: Starting maintenance cycle');
    
    await this.rebalanceTiers();
    await this.compressOldMemories();
    await this.cleanupWeakRelationships();
    await this.optimizeClusters();
    
    console.log('🧠 TMG: Maintenance cycle completed');
  }

  // Rebalance memory tiers based on access patterns and age
  private async rebalanceTiers(): Promise<void> {
    for (const [nodeId, node] of this.memoryGraph) {
      const currentTier = node.tier;
      const newTier = this.determineTier(node.importance, node.accessCount, node.timestamp);
      
      if (currentTier !== newTier) {
        this.removeFromTier(nodeId, currentTier);
        this.addToTier(nodeId, newTier);
        node.tier = newTier;
        
        this.notifyListeners('tier_change', node);
        console.log(`🧠 TMG: Moved memory ${nodeId} from ${currentTier} to ${newTier}`);
      }
    }
  }

  // Compress old memories to save space
  private async compressOldMemories(): Promise<void> {
    const compressionCandidates = Array.from(this.archivedMemory)
      .map(id => this.memoryGraph.get(id))
      .filter(Boolean) as MemoryNode[];

    for (const node of compressionCandidates) {
      if (!node.metadata.compression && node.importance < 3) {
        // Simple compression: summarize content
        const originalContent = node.content;
        const compressedContent = this.compressContent(originalContent);
        
        node.content = compressedContent;
        node.metadata.compression = 'summarized';
        
        console.log(`🧠 TMG: Compressed memory ${node.id}`);
      }
    }
  }

  // Simple content compression
  private compressContent(content: any): any {
    if (typeof content === 'string') {
      // Truncate long strings
      return content.length > 200 ? content.substring(0, 200) + '...' : content;
    } else if (typeof content === 'object') {
      // Keep only essential fields
      const essential = ['id', 'type', 'timestamp', 'summary', 'key_points'];
      const compressed: any = {};
      
      essential.forEach(key => {
        if (content[key]) compressed[key] = content[key];
      });
      
      return compressed;
    }
    
    return content;
  }

  // Clean up weak relationships
  private async cleanupWeakRelationships(): Promise<void> {
    for (const node of this.memoryGraph.values()) {
      node.relationships = node.relationships.filter(rel => {
        // Remove weak relationships
        if (rel.strength < 0.2) return false;
        
        // Remove relationships to deleted nodes
        return this.memoryGraph.has(rel.targetId);
      });
    }
  }

  // Optimize memory clusters
  private async optimizeClusters(): Promise<void> {
    // Remove empty clusters
    for (const [clusterId, cluster] of this.clusters) {
      cluster.nodes = cluster.nodes.filter(nodeId => this.memoryGraph.has(nodeId));
      
      if (cluster.nodes.length === 0) {
        this.clusters.delete(clusterId);
      } else if (cluster.nodes.length === 1) {
        // Merge single-node clusters
        this.clusters.delete(clusterId);
      }
    }
  }

  // Helper methods
  private matchesKeywords(node: MemoryNode, keywords: string[]): boolean {
    const text = typeof node.content === 'string' ? 
      node.content : JSON.stringify(node.content);
    
    const lowerText = text.toLowerCase();
    return keywords.some(keyword => lowerText.includes(keyword.toLowerCase()));
  }

  private calculateRelevanceScore(node: MemoryNode, query: MemoryQuery): number {
    let score = node.importance; // Base score from importance
    
    // Recency bonus
    const age = Date.now() - node.timestamp.getTime();
    const recencyScore = Math.max(0, 1 - (age / (7 * 24 * 60 * 60 * 1000))); // 7-day decay
    score += recencyScore * 3;
    
    // Access frequency bonus
    const accessScore = Math.min(2, node.accessCount / 10);
    score += accessScore;
    
    // Tier bonus
    const tierBonus = {
      'hot': 2,
      'warm': 1,
      'cold': 0.5,
      'archived': 0
    };
    score += tierBonus[node.tier];
    
    return score;
  }

  // Public interface methods
  getMemoryStats() {
    return {
      total: this.memoryGraph.size,
      hot: this.hotMemory.size,
      warm: this.warmMemory.size,
      cold: this.coldMemory.size,
      archived: this.archivedMemory.size,
      clusters: this.clusters.size
    };
  }

  getMemoryClusters(): MemoryCluster[] {
    return Array.from(this.clusters.values());
  }

  getMemoryGraph(): Map<string, MemoryNode> {
    return new Map(this.memoryGraph);
  }

  registerListener(listener: (event: 'store' | 'access' | 'tier_change', node: MemoryNode) => void): void {
    this.listeners.push(listener);
  }

  private notifyListeners(event: 'store' | 'access' | 'tier_change', node: MemoryNode): void {
    this.listeners.forEach(listener => {
      try {
        listener(event, node);
      } catch (error) {
        console.error('🧠 TMG: Listener error:', error);
      }
    });
  }

  // Clear memories for user
  clearUserMemories(userId: string): void {
    const userMemoryIds = Array.from(this.memoryGraph.entries())
      .filter(([_, node]) => node.metadata.userId === userId)
      .map(([id, _]) => id);
    
    userMemoryIds.forEach(id => {
      const node = this.memoryGraph.get(id);
      if (node) {
        this.removeFromTier(id, node.tier);
        this.memoryGraph.delete(id);
      }
    });
    
    console.log(`🧠 TMG: Cleared ${userMemoryIds.length} memories for user ${userId}`);
  }

  getStatus() {
    const stats = this.getMemoryStats();
    return {
      memoryStats: stats,
      configuredLimits: {
        hot: this.config.hotMemoryLimit,
        warm: this.config.warmMemoryLimit,
        cold: this.config.coldMemoryLimit
      },
      clusters: this.clusters.size,
      lastMaintenance: new Date(), // Would track actual last maintenance
      isActive: true
    };
  }
}

export const tieredMemoryGraph = new TieredMemoryGraph();

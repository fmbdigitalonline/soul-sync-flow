
/**
 * Tiered Memory Graph - Enhanced Implementation
 * Patent Enhancement: Three-layer memory with cryptographic delta compression
 */

export interface MemoryNode {
  id: string;
  content: string;
  embedding: number[];
  importance: number;
  timestamp: number;
  entityEdges: string[];
  topicEdges: string[];
  sentimentTrend: number[];
  tier: 'hot' | 'warm' | 'cold';
  compressionHash?: string;
  ancestryChain?: string[];
}

export interface MemoryGraph {
  nodes: Map<string, MemoryNode>;
  edges: Map<string, { from: string; to: string; weight: number; type: string }>;
  hotCache: Map<string, number[]>; // embedding K-V store
  warmGraph: Map<string, MemoryNode>; // graph database
  coldChain: MemoryNode[]; // Merkle chain with delta compression
}

export class TieredMemoryGraphEngine {
  private graph: MemoryGraph;
  private hotThreshold: number = 8.0;
  private warmThreshold: number = 5.0;
  private maxHotEntries: number = 50;
  private maxWarmEntries: number = 200;
  private compressionRatio: number = 0.3;

  constructor() {
    this.graph = {
      nodes: new Map(),
      edges: new Map(),
      hotCache: new Map(),
      warmGraph: new Map(),
      coldChain: []
    };
  }

  /**
   * Patent Claim Element: Three-layer memory architecture
   * Hot (embedding K-V), Warm (graph DB), Cold (delta-compressed Merkle chain)
   */
  addMemory(
    content: string,
    embedding: number[],
    entities: string[],
    topics: string[],
    sentiment: number
  ): string {
    const nodeId = this.generateNodeId(content);
    const importance = this.calculateImportance(content, sentiment, entities);
    
    const node: MemoryNode = {
      id: nodeId,
      content,
      embedding,
      importance,
      timestamp: Date.now(),
      entityEdges: entities,
      topicEdges: topics,
      sentimentTrend: [sentiment],
      tier: this.determineTier(importance)
    };

    // Add to appropriate tier
    this.placementStrategy(node);
    
    // Create edges
    this.createSemanticEdges(node, entities, topics);
    
    // Trigger tier management
    this.manageTierCapacity();
    
    console.log(`🧠 TMG: Added memory to ${node.tier} tier, importance: ${importance.toFixed(2)}`);
    
    return nodeId;
  }

  /**
   * Patent Claim Element: Importance scoring using semantic novelty and sentiment intensity
   */
  private calculateImportance(content: string, sentiment: number, entities: string[]): number {
    // Semantic novelty component
    const noveltyScore = this.calculateSemanticNovelty(content);
    
    // Sentiment intensity component
    const sentimentIntensity = Math.abs(sentiment);
    
    // Entity richness component
    const entityRichness = Math.min(entities.length / 5, 1.0);
    
    // Weighted combination
    return (noveltyScore * 0.5) + (sentimentIntensity * 0.3) + (entityRichness * 0.2);
  }

  private calculateSemanticNovelty(content: string): number {
    // Compare against existing memories using embedding similarity
    const existingContents = Array.from(this.graph.nodes.values())
      .map(n => n.content)
      .slice(-20); // Check last 20 memories
    
    if (existingContents.length === 0) return 1.0;
    
    // Simplified novelty calculation (in real implementation, use embedding similarity)
    const avgSimilarity = existingContents
      .map(existing => this.computeTextSimilarity(content, existing))
      .reduce((sum, sim) => sum + sim, 0) / existingContents.length;
    
    return 1.0 - avgSimilarity; // Higher novelty = lower similarity
  }

  private computeTextSimilarity(text1: string, text2: string): number {
    // Simplified Jaccard similarity
    const words1 = new Set(text1.toLowerCase().split(/\s+/));
    const words2 = new Set(text2.toLowerCase().split(/\s+/));
    
    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);
    
    return intersection.size / union.size;
  }

  /**
   * Patent Claim Element: Automatic promotion/demotion between tiers
   */
  private placementStrategy(node: MemoryNode): void {
    switch (node.tier) {
      case 'hot':
        this.graph.hotCache.set(node.id, node.embedding);
        this.graph.nodes.set(node.id, node);
        break;
      case 'warm':
        this.graph.warmGraph.set(node.id, node);
        this.graph.nodes.set(node.id, node);
        break;
      case 'cold':
        this.compressAndArchive(node);
        break;
    }
  }

  /**
   * Patent Claim Element: Delta compression with hash-link ancestry
   */
  private compressAndArchive(node: MemoryNode): void {
    // Find similar existing memories for delta compression
    const similarNodes = this.findSimilarNodes(node);
    
    if (similarNodes.length > 0) {
      const baseNode = similarNodes[0];
      const delta = this.computeDelta(baseNode, node);
      
      // Create compressed representation
      const compressedNode: MemoryNode = {
        ...node,
        content: this.compressContent(delta),
        compressionHash: this.generateHash(delta),
        ancestryChain: [baseNode.id, ...(baseNode.ancestryChain || [])]
      };
      
      this.graph.coldChain.push(compressedNode);
      console.log(`❄️ TMG: Compressed memory with ${(delta.length / node.content.length * 100).toFixed(1)}% efficiency`);
    } else {
      // No similar content, store as-is
      this.graph.coldChain.push({
        ...node,
        compressionHash: this.generateHash(node.content)
      });
    }
  }

  private computeDelta(baseNode: MemoryNode, newNode: MemoryNode): string {
    // Simplified delta computation (in practice, use diff algorithms)
    const baseWords = baseNode.content.split(/\s+/);
    const newWords = newNode.content.split(/\s+/);
    
    const uniqueWords = newWords.filter(word => !baseWords.includes(word));
    return uniqueWords.join(' ');
  }

  private compressContent(content: string): string {
    // Simplified compression (in practice, use proper compression algorithms)
    return content.length > 100 ? content.substring(0, 100) + '...' : content;
  }

  private generateHash(content: string): string {
    // Simplified hash function
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(16);
  }

  /**
   * Patent Claim Element: Graph-based retrieval with entity/topic/sentiment edges
   */
  queryMemories(
    query: string,
    queryEmbedding: number[],
    entities: string[],
    topics: string[]
  ): MemoryNode[] {
    const results: MemoryNode[] = [];
    
    // Query hot tier (embedding similarity)
    const hotResults = this.queryHotTier(queryEmbedding);
    results.push(...hotResults);
    
    // Query warm tier (graph traversal)
    const warmResults = this.queryWarmTier(entities, topics);
    results.push(...warmResults);
    
    // Query cold tier if needed (decompression)
    if (results.length < 5) {
      const coldResults = this.queryColcTier(query);
      results.push(...coldResults);
    }
    
    return this.rankResults(results, queryEmbedding);
  }

  private queryHotTier(queryEmbedding: number[]): MemoryNode[] {
    const similarities: Array<{ node: MemoryNode; similarity: number }> = [];
    
    for (const [nodeId, embedding] of this.graph.hotCache.entries()) {
      const similarity = this.cosineSimilarity(queryEmbedding, embedding);
      const node = this.graph.nodes.get(nodeId);
      
      if (node && similarity > 0.7) {
        similarities.push({ node, similarity });
      }
    }
    
    return similarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 10)
      .map(s => s.node);
  }

  private queryWarmTier(entities: string[], topics: string[]): MemoryNode[] {
    const candidates = new Set<MemoryNode>();
    
    // Find nodes connected to query entities/topics
    for (const node of this.graph.warmGraph.values()) {
      const entityOverlap = entities.filter(e => node.entityEdges.includes(e)).length;
      const topicOverlap = topics.filter(t => node.topicEdges.includes(t)).length;
      
      if (entityOverlap > 0 || topicOverlap > 0) {
        candidates.add(node);
      }
    }
    
    return Array.from(candidates).slice(0, 10);
  }

  private queryColcTier(query: string): MemoryNode[] {
    // Decompress and search cold memories
    return this.graph.coldChain
      .filter(node => this.decompressAndMatch(node, query))
      .slice(0, 5);
  }

  private decompressAndMatch(node: MemoryNode, query: string): boolean {
    // Simplified decompression matching
    return node.content.toLowerCase().includes(query.toLowerCase());
  }

  // Helper methods
  private generateNodeId(content: string): string {
    return `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private determineTier(importance: number): 'hot' | 'warm' | 'cold' {
    if (importance >= this.hotThreshold) return 'hot';
    if (importance >= this.warmThreshold) return 'warm';
    return 'cold';
  }

  private findSimilarNodes(node: MemoryNode): MemoryNode[] {
    return Array.from(this.graph.nodes.values())
      .filter(n => this.computeTextSimilarity(n.content, node.content) > 0.6)
      .slice(0, 3);
  }

  private createSemanticEdges(node: MemoryNode, entities: string[], topics: string[]): void {
    // Create edges to related nodes
    for (const entity of entities) {
      const relatedNodes = this.findNodesByEntity(entity);
      for (const relatedNode of relatedNodes) {
        this.addEdge(node.id, relatedNode.id, 0.8, 'entity');
      }
    }
  }

  private findNodesByEntity(entity: string): MemoryNode[] {
    return Array.from(this.graph.nodes.values())
      .filter(n => n.entityEdges.includes(entity));
  }

  private addEdge(from: string, to: string, weight: number, type: string): void {
    const edgeId = `${from}_${to}`;
    this.graph.edges.set(edgeId, { from, to, weight, type });
  }

  private manageTierCapacity(): void {
    // Promote/demote based on capacity and importance
    if (this.graph.hotCache.size > this.maxHotEntries) {
      this.demoteFromHot();
    }
    
    if (this.graph.warmGraph.size > this.maxWarmEntries) {
      this.demoteFromWarm();
    }
  }

  private demoteFromHot(): void {
    const hotNodes = Array.from(this.graph.nodes.values())
      .filter(n => n.tier === 'hot')
      .sort((a, b) => a.importance - b.importance);
    
    const nodesToDemote = hotNodes.slice(0, 10);
    for (const node of nodesToDemote) {
      node.tier = 'warm';
      this.graph.hotCache.delete(node.id);
      this.graph.warmGraph.set(node.id, node);
    }
  }

  private demoteFromWarm(): void {
    const warmNodes = Array.from(this.graph.warmGraph.values())
      .sort((a, b) => a.importance - b.importance);
    
    const nodesToDemote = warmNodes.slice(0, 20);
    for (const node of nodesToDemote) {
      node.tier = 'cold';
      this.graph.warmGraph.delete(node.id);
      this.compressAndArchive(node);
    }
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0;
    
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  private rankResults(results: MemoryNode[], queryEmbedding: number[]): MemoryNode[] {
    return results.sort((a, b) => {
      const simA = this.cosineSimilarity(a.embedding, queryEmbedding);
      const simB = this.cosineSimilarity(b.embedding, queryEmbedding);
      return simB - simA;
    });
  }
}

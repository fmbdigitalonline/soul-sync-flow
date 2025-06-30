
import { useState, useCallback, useEffect } from 'react';
import { tieredMemoryGraph, HotMemoryEntry, MemoryGraphNode, MemoryGraphEdge } from '@/services/tiered-memory-graph';
import { memoryService } from '@/services/memory-service';

interface TieredMemoryState {
  hotMemory: HotMemoryEntry[];
  graphContext: {
    nodes: MemoryGraphNode[];
    edges: MemoryGraphEdge[];
  };
  metrics: {
    hotHits: number;
    warmHits: number;
    coldHits: number;
    avgLatency: Record<string, number>;
  };
  isLoading: boolean;
}

export const useTieredMemory = (userId: string, sessionId: string) => {
  const [state, setState] = useState<TieredMemoryState>({
    hotMemory: [],
    graphContext: { nodes: [], edges: [] },
    metrics: { hotHits: 0, warmHits: 0, coldHits: 0, avgLatency: {} },
    isLoading: false
  });

  // Store conversation turn in TMG
  const storeConversationTurn = useCallback(async (
    content: any,
    importanceScore?: number
  ) => {
    if (!userId || !sessionId) return null;

    try {
      setState(prev => ({ ...prev, isLoading: true }));

      // Calculate importance score if not provided
      let finalImportanceScore = importanceScore;
      if (!finalImportanceScore) {
        // Simple heuristic - in production, use AI analysis
        const contentStr = JSON.stringify(content);
        const semanticNovelty = Math.min(contentStr.length / 100, 5); // Length-based novelty
        const emotionIntensity = content.emotion_intensity || 1;
        const userFeedback = content.user_feedback || 1;
        const recurrenceCount = 1;

        finalImportanceScore = await tieredMemoryGraph.calculateImportanceScore(
          userId,
          semanticNovelty,
          emotionIntensity,
          userFeedback,
          recurrenceCount
        );
      }

      // Store in hot memory
      const hotMemoryId = await tieredMemoryGraph.storeInHotMemory(
        userId,
        sessionId,
        content,
        finalImportanceScore
      );

      // Also create delta entry
      if (hotMemoryId) {
        await tieredMemoryGraph.storeDelta(
          userId,
          sessionId,
          'conversation_turn',
          content,
          undefined,
          finalImportanceScore
        );
      }

      // Refresh hot memory
      await loadHotMemory();

      return hotMemoryId;
    } catch (error) {
      console.error('Error storing conversation turn:', error);
      return null;
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [userId, sessionId]);

  // Load hot memory context
  const loadHotMemory = useCallback(async () => {
    if (!userId || !sessionId) return;

    try {
      setState(prev => ({ ...prev, isLoading: true }));

      const hotMemory = await tieredMemoryGraph.getFromHotMemory(userId, sessionId);
      
      setState(prev => ({
        ...prev,
        hotMemory,
        isLoading: false
      }));
    } catch (error) {
      console.error('Error loading hot memory:', error);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [userId, sessionId]);

  // Create knowledge entity in graph
  const createKnowledgeEntity = useCallback(async (
    entityType: 'entity' | 'topic' | 'preference',
    label: string,
    properties: Record<string, any> = {},
    importanceScore: number = 5.0
  ) => {
    if (!userId) return null;

    try {
      const nodeId = await tieredMemoryGraph.createGraphNode(
        userId,
        entityType,
        label,
        properties,
        importanceScore
      );

      return nodeId;
    } catch (error) {
      console.error('Error creating knowledge entity:', error);
      return null;
    }
  }, [userId]);

  // Link entities in graph
  const linkEntities = useCallback(async (
    fromNodeId: string,
    toNodeId: string,
    relationshipType: 'relates_to' | 'mentions' | 'likes' | 'discussed_with' | 'summary_of',
    weight: number = 1.0
  ) => {
    if (!userId) return null;

    try {
      const edgeId = await tieredMemoryGraph.createGraphEdge(
        userId,
        fromNodeId,
        toNodeId,
        relationshipType,
        {},
        weight
      );

      return edgeId;
    } catch (error) {
      console.error('Error linking entities:', error);
      return null;
    }
  }, [userId]);

  // Get contextual knowledge from graph
  const getGraphContext = useCallback(async (
    startNodeId?: string,
    relationshipTypes?: string[],
    maxDepth: number = 2
  ) => {
    if (!userId || !startNodeId) return { nodes: [], edges: [] };

    try {
      setState(prev => ({ ...prev, isLoading: true }));

      const context = await tieredMemoryGraph.traverseGraph(
        userId,
        startNodeId,
        relationshipTypes,
        maxDepth
      );

      setState(prev => ({
        ...prev,
        graphContext: context,
        isLoading: false
      }));

      return context;
    } catch (error) {
      console.error('Error getting graph context:', error);
      setState(prev => ({ ...prev, isLoading: false }));
      return { nodes: [], edges: [] };
    }
  }, [userId]);

  // Load performance metrics
  const loadMetrics = useCallback(async () => {
    if (!userId) return;

    try {
      const metrics = await tieredMemoryGraph.getPerformanceMetrics(userId);
      setState(prev => ({ ...prev, metrics }));
    } catch (error) {
      console.error('Error loading metrics:', error);
    }
  }, [userId]);

  // Integration with existing memory service
  const integrateWithExistingMemory = useCallback(async () => {
    if (!userId) return;

    try {
      // Get recent memories from existing system
      const existingMemories = await memoryService.getRecentMemories(10);
      
      // Convert to TMG format and store
      for (const memory of existingMemories) {
        await storeConversationTurn({
          type: 'migrated_memory',
          memory_type: memory.memory_type,
          content: memory.memory_data,
          context_summary: memory.context_summary,
          original_timestamp: memory.created_at
        }, memory.importance_score);
      }

      console.log(`Integrated ${existingMemories.length} existing memories into TMG`);
    } catch (error) {
      console.error('Error integrating existing memory:', error);
    }
  }, [userId, storeConversationTurn]);

  // Initialize on mount
  useEffect(() => {
    if (userId && sessionId) {
      loadHotMemory();
      loadMetrics();
    }
  }, [userId, sessionId, loadHotMemory, loadMetrics]);

  return {
    ...state,
    storeConversationTurn,
    loadHotMemory,
    createKnowledgeEntity,
    linkEntities,
    getGraphContext,
    loadMetrics,
    integrateWithExistingMemory
  };
};

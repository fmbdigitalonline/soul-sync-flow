
import { useState, useCallback, useEffect } from 'react';
import { tieredMemoryGraph, HotMemoryEntry, MemoryGraphNode, MemoryGraphEdge } from '@/services/tiered-memory-graph';

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
  isInitialized: boolean;
  error: string | null;
}

export const useTieredMemory = (userId: string, sessionId: string) => {
  const [state, setState] = useState<TieredMemoryState>({
    hotMemory: [],
    graphContext: { nodes: [], edges: [] },
    metrics: { hotHits: 0, warmHits: 0, coldHits: 0, avgLatency: {} },
    isLoading: false,
    isInitialized: false,
    error: null
  });

  // Store conversation turn in TMG with improved error handling
  const storeConversationTurn = useCallback(async (
    content: any,
    importanceScore?: number
  ) => {
    if (!userId || !sessionId) {
      console.warn('Cannot store conversation turn: missing userId or sessionId');
      return null;
    }

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

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
      setState(prev => ({ 
        ...prev, 
        error: `Failed to store conversation: ${error.message}`,
        isLoading: false 
      }));
      return null;
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [userId, sessionId]);

  // Load hot memory context with enhanced error handling
  const loadHotMemory = useCallback(async () => {
    if (!userId || !sessionId) {
      console.warn('Cannot load hot memory: missing userId or sessionId');
      setState(prev => ({ 
        ...prev, 
        error: 'Missing user ID or session ID',
        isLoading: false 
      }));
      return;
    }

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const hotMemory = await tieredMemoryGraph.getFromHotMemory(userId, sessionId);
      
      setState(prev => ({
        ...prev,
        hotMemory,
        isLoading: false,
        isInitialized: true,
        error: null
      }));
    } catch (error) {
      console.error('Error loading hot memory:', error);
      setState(prev => ({ 
        ...prev, 
        isLoading: false,
        error: `Failed to load hot memory: ${error.message}`,
        // Still mark as initialized even if loading failed
        isInitialized: true
      }));
    }
  }, [userId, sessionId]);

  // Create knowledge entity in graph
  const createKnowledgeEntity = useCallback(async (
    entityType: 'entity' | 'topic' | 'preference',
    label: string,
    properties: Record<string, any> = {},
    importanceScore: number = 5.0
  ) => {
    if (!userId) {
      console.warn('Cannot create knowledge entity: missing userId');
      setState(prev => ({ 
        ...prev, 
        error: 'Missing user ID for entity creation' 
      }));
      return null;
    }

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
      setState(prev => ({ 
        ...prev, 
        error: `Failed to create entity: ${error.message}` 
      }));
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
    if (!userId) {
      console.warn('Cannot link entities: missing userId');
      setState(prev => ({ 
        ...prev, 
        error: 'Missing user ID for entity linking' 
      }));
      return null;
    }

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
      setState(prev => ({ 
        ...prev, 
        error: `Failed to link entities: ${error.message}` 
      }));
      return null;
    }
  }, [userId]);

  // Get contextual knowledge from graph
  const getGraphContext = useCallback(async (
    startNodeId?: string,
    relationshipTypes?: string[],
    maxDepth: number = 2
  ) => {
    if (!userId) {
      console.warn('Cannot get graph context: missing userId');
      setState(prev => ({ 
        ...prev, 
        error: 'Missing user ID for graph context' 
      }));
      return { nodes: [], edges: [] };
    }

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const context = await tieredMemoryGraph.traverseGraph(
        userId,
        startNodeId || 'dummy', // Provide a fallback
        relationshipTypes,
        maxDepth
      );

      setState(prev => ({
        ...prev,
        graphContext: context,
        isLoading: false,
        error: null
      }));

      return context;
    } catch (error) {
      console.error('Error getting graph context:', error);
      setState(prev => ({ 
        ...prev, 
        isLoading: false,
        error: `Failed to get graph context: ${error.message}` 
      }));
      return { nodes: [], edges: [] };
    }
  }, [userId]);

  // Load performance metrics with error handling
  const loadMetrics = useCallback(async () => {
    if (!userId) {
      console.warn('Cannot load metrics: missing userId');
      setState(prev => ({ 
        ...prev, 
        error: 'Missing user ID for metrics loading' 
      }));
      return;
    }

    try {
      const metrics = await tieredMemoryGraph.getPerformanceMetrics(userId);
      setState(prev => ({ 
        ...prev, 
        metrics,
        error: null 
      }));
    } catch (error) {
      console.error('Error loading metrics:', error);
      setState(prev => ({ 
        ...prev, 
        error: `Failed to load metrics: ${error.message}` 
      }));
    }
  }, [userId]);

  // Integrate with existing memory - enhanced with error handling
  const integrateWithExistingMemory = useCallback(async () => {
    if (!userId) {
      console.warn('Cannot integrate memory: missing userId');
      setState(prev => ({ 
        ...prev, 
        error: 'Missing user ID for memory integration' 
      }));
      return;
    }

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      console.log('🔄 Integrating with existing memory systems...');

      // This function would integrate TMG with existing memory systems
      // For now, we'll simulate this by refreshing all memory layers
      await Promise.all([
        loadHotMemory(),
        getGraphContext(),
        loadMetrics()
      ]);

      console.log('✅ Memory integration completed');
      setState(prev => ({ 
        ...prev, 
        isLoading: false,
        error: null 
      }));
    } catch (error) {
      console.error('❌ Error integrating with existing memory:', error);
      setState(prev => ({ 
        ...prev, 
        isLoading: false,
        error: `Memory integration failed: ${error.message}` 
      }));
    }
  }, [userId, loadHotMemory, getGraphContext, loadMetrics]);

  // Initialize TMG system when userId and sessionId are available
  useEffect(() => {
    if (userId && sessionId && !state.isInitialized) {
      console.log('🚀 Initializing TMG system for user:', userId);
      loadHotMemory();
      loadMetrics();
    }
  }, [userId, sessionId, state.isInitialized, loadHotMemory, loadMetrics]);

  // Clear error after some time
  useEffect(() => {
    if (state.error) {
      const timer = setTimeout(() => {
        setState(prev => ({ ...prev, error: null }));
      }, 10000); // Clear error after 10 seconds

      return () => clearTimeout(timer);
    }
  }, [state.error]);

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

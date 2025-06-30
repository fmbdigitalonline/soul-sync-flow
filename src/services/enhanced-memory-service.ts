
import { tieredMemoryGraph } from './tiered-memory-graph';
import { memoryService } from './memory-service';

/**
 * Enhanced Memory Service that integrates TMG with existing memory system
 * Provides backward compatibility while leveraging TMG capabilities
 */
class EnhancedMemoryService {
  
  // Enhanced memory storage with TMG integration
  async saveEnhancedMemory(
    userId: string,
    sessionId: string,
    memoryType: 'interaction' | 'mood' | 'belief_shift' | 'journal_entry' | 'micro_action',
    memoryData: any,
    contextSummary?: string,
    importanceScore?: number
  ) {
    try {
      // Calculate importance score using TMG if not provided
      let finalImportanceScore = importanceScore;
      if (!finalImportanceScore) {
        const contentAnalysis = this.analyzeContent(memoryData, contextSummary);
        finalImportanceScore = await tieredMemoryGraph.calculateImportanceScore(
          userId,
          contentAnalysis.semanticNovelty,
          contentAnalysis.emotionIntensity,
          contentAnalysis.userFeedback,
          contentAnalysis.recurrenceCount
        );
      }

      // Store in traditional memory system
      const traditionalMemory = await memoryService.saveMemory({
        user_id: userId,
        session_id: sessionId,
        memory_type: memoryType,
        memory_data: memoryData,
        context_summary: contextSummary,
        importance_score: finalImportanceScore
      });

      // Store in TMG hot memory
      const tmgEntry = await tieredMemoryGraph.storeInHotMemory(
        userId,
        sessionId,
        {
          memory_type: memoryType,
          memory_data: memoryData,
          context_summary: contextSummary,
          traditional_memory_id: traditionalMemory?.id
        },
        finalImportanceScore
      );

      // Create knowledge entities for high-importance memories
      if (finalImportanceScore > 7) {
        await this.createKnowledgeEntities(userId, memoryType, memoryData, contextSummary);
      }

      return {
        traditionalMemory,
        tmgEntry,
        importanceScore: finalImportanceScore
      };
    } catch (error) {
      console.error('Error saving enhanced memory:', error);
      // Fallback to traditional memory only
      return {
        traditionalMemory: await memoryService.saveMemory({
          user_id: userId,
          session_id: sessionId,
          memory_type: memoryType,
          memory_data: memoryData,
          context_summary: contextSummary,
          importance_score: importanceScore || 5
        }),
        tmgEntry: null,
        importanceScore: importanceScore || 5
      };
    }
  }

  // Enhanced memory retrieval with TMG context
  async getEnhancedMemories(
    userId: string,
    sessionId: string,
    limit: number = 10,
    includeGraphContext: boolean = true
  ) {
    try {
      // Get from TMG hot memory first (fastest)
      const hotMemories = await tieredMemoryGraph.getFromHotMemory(userId, sessionId, limit);
      
      // If we need more context, get from traditional memory
      const traditionalMemories = await memoryService.getRecentMemories(limit);
      
      // Combine and deduplicate
      const combinedMemories = this.combineMemories(hotMemories, traditionalMemories);
      
      // Get graph context if requested
      let graphContext = null;
      if (includeGraphContext && combinedMemories.length > 0) {
        // Find the most important memory to use as starting point
        const startingMemory = combinedMemories.reduce((prev, current) => 
          prev.importance_score > current.importance_score ? prev : current
        );
        
        // Try to find a related graph node
        graphContext = await this.getRelatedGraphContext(userId, startingMemory);
      }

      return {
        memories: combinedMemories,
        graphContext,
        source: 'enhanced_tmg'
      };
    } catch (error) {
      console.error('Error getting enhanced memories:', error);
      // Fallback to traditional memory
      return {
        memories: await memoryService.getRecentMemories(limit),
        graphContext: null,
        source: 'traditional_fallback'
      };
    }
  }

  // Generate contextual welcome message using TMG
  async generateEnhancedWelcomeMessage(userId: string, userName: string): Promise<string> {
    try {
      // Get TMG context first
      const sessionId = `welcome_${Date.now()}`;
      const tmgContext = await tieredMemoryGraph.getFromHotMemory(userId, sessionId, 5);
      
      // If TMG has context, use it
      if (tmgContext.length > 0) {
        return this.generateTMGWelcomeMessage(userName, tmgContext);
      }
      
      // Fallback to traditional memory service
      return await memoryService.generateWelcomeMessage(userName);
    } catch (error) {
      console.error('Error generating enhanced welcome message:', error);
      return `Welcome back, ${userName}! What would you like to explore today?`;
    }
  }

  // Create knowledge entities from memory data
  private async createKnowledgeEntities(
    userId: string,
    memoryType: string,
    memoryData: any,
    contextSummary?: string
  ) {
    try {
      // Extract entities based on memory type
      const entities = this.extractEntities(memoryType, memoryData, contextSummary);
      
      for (const entity of entities) {
        const nodeId = await tieredMemoryGraph.createGraphNode(
          userId,
          entity.type,
          entity.label,
          entity.properties,
          entity.importance
        );

        // Link entities if there are relationships
        if (entity.relatedTo && nodeId) {
          for (const relatedEntityLabel of entity.relatedTo) {
            // Find or create related entity
            const relatedNodeId = await this.findOrCreateEntity(
              userId,
              'topic',
              relatedEntityLabel
            );
            
            if (relatedNodeId) {
              await tieredMemoryGraph.createGraphEdge(
                userId,
                nodeId,
                relatedNodeId,
                'relates_to'
              );
            }
          }
        }
      }
    } catch (error) {
      console.error('Error creating knowledge entities:', error);
    }
  }

  // Analyze content for importance scoring
  private analyzeContent(memoryData: any, contextSummary?: string) {
    const content = contextSummary || JSON.stringify(memoryData);
    
    // Simple heuristics - in production, use ML models
    const semanticNovelty = Math.min(content.length / 50, 5); // Length-based
    const emotionIntensity = this.detectEmotionIntensity(content);
    const userFeedback = memoryData.user_feedback || memoryData.rating || 1;
    const recurrenceCount = 1; // Would track actual recurrence in production
    
    return {
      semanticNovelty,
      emotionIntensity,
      userFeedback,
      recurrenceCount
    };
  }

  private detectEmotionIntensity(content: string): number {
    // Simple emotion detection based on keywords
    const highEmotionWords = ['love', 'hate', 'amazing', 'terrible', 'excited', 'frustrated'];
    const mediumEmotionWords = ['like', 'dislike', 'good', 'bad', 'happy', 'sad'];
    
    const lowerContent = content.toLowerCase();
    
    if (highEmotionWords.some(word => lowerContent.includes(word))) {
      return 4;
    } else if (mediumEmotionWords.some(word => lowerContent.includes(word))) {
      return 2;
    }
    
    return 1;
  }

  private extractEntities(memoryType: string, memoryData: any, contextSummary?: string) {
    const entities = [];
    
    // Extract based on memory type
    switch (memoryType) {
      case 'interaction':
        if (memoryData.topic) {
          entities.push({
            type: 'topic' as const,
            label: memoryData.topic,
            properties: { source: 'interaction', data: memoryData },
            importance: 6,
            relatedTo: memoryData.related_topics || []
          });
        }
        break;
        
      case 'micro_action':
        entities.push({
          type: 'entity' as const,
          label: memoryData.action_title || 'Action',
          properties: { 
            type: 'micro_action',
            status: memoryData.status,
            description: memoryData.action_description
          },
          importance: 7,
          relatedTo: []
        });
        break;
        
      case 'belief_shift':
        entities.push({
          type: 'preference' as const,
          label: contextSummary || 'Belief Change',
          properties: { 
            type: 'belief',
            previous: memoryData.previous_belief,
            current: memoryData.current_belief
          },
          importance: 8,
          relatedTo: memoryData.related_beliefs || []
        });
        break;
        
      default:
        if (contextSummary) {
          entities.push({
            type: 'summary' as const,
            label: contextSummary,
            properties: { memory_type: memoryType, data: memoryData },
            importance: 5,
            relatedTo: []
          });
        }
    }
    
    return entities;
  }

  private async findOrCreateEntity(
    userId: string,
    nodeType: 'entity' | 'topic' | 'summary' | 'conversation' | 'preference',
    label: string
  ): Promise<string | null> {
    // In production, would search existing nodes first
    // For now, just create new ones
    return await tieredMemoryGraph.createGraphNode(
      userId,
      nodeType,
      label,
      {},
      5
    );
  }

  private combineMemories(hotMemories: any[], traditionalMemories: any[]) {
    // Combine and deduplicate memories
    const combined = [...hotMemories];
    
    for (const traditional of traditionalMemories) {
      // Check if already included via TMG
      const exists = hotMemories.some(hot => 
        hot.raw_content?.traditional_memory_id === traditional.id
      );
      
      if (!exists) {
        // Convert traditional memory to TMG format
        combined.push({
          id: traditional.id,
          importance_score: traditional.importance_score,
          raw_content: {
            memory_type: traditional.memory_type,
            memory_data: traditional.memory_data,
            context_summary: traditional.context_summary
          },
          created_at: traditional.created_at,
          source: 'traditional'
        });
      }
    }
    
    // Sort by importance then recency
    return combined.sort((a, b) => {
      if (a.importance_score !== b.importance_score) {
        return b.importance_score - a.importance_score;
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }

  private async getRelatedGraphContext(userId: string, memory: any) {
    // Try to find graph context related to this memory
    // This is a simplified version - in production would use more sophisticated matching
    return null;
  }

  private generateTMGWelcomeMessage(userName: string, tmgContext: any[]): string {
    let message = `Welcome back, ${userName}! `;
    
    const recentContext = tmgContext[0];
    if (recentContext?.raw_content?.context_summary) {
      message += `I remember we were discussing ${recentContext.raw_content.context_summary.toLowerCase()}. `;
    }
    
    if (tmgContext.length > 1) {
      message += `I have ${tmgContext.length} recent conversation turns in context. `;
    }
    
    message += `What would you like to explore today?`;
    
    return message;
  }
}

export const enhancedMemoryService = new EnhancedMemoryService();

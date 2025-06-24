
import { enhancedMemoryService } from "./enhanced-memory-service";
import { SessionMemory } from "./memory-service";
import { supabase } from "@/integrations/supabase/client";

export interface MemoryContext {
  relevantMemories: SessionMemory[];
  memorySearchQuery: string;
  contextSummary: string;
  lastMemoryUpdate: string;
}

export interface ConversationMemoryState {
  sessionMemories: SessionMemory[];
  crossSessionMemories: SessionMemory[];
  memoryImportanceThreshold: number;
  contextWindow: SessionMemory[];
}

class MemoryInformedConversationService {
  private conversationMemories: Map<string, ConversationMemoryState> = new Map();
  private memoryContextCache: Map<string, MemoryContext> = new Map();

  async buildMemoryContext(
    userMessage: string,
    sessionId: string,
    userId: string
  ): Promise<MemoryContext> {
    console.log('🧠 Building memory context for conversation:', { userMessage: userMessage.substring(0, 50), sessionId });

    // Step 1: Extract keywords from user message for memory search
    const searchKeywords = this.extractKeywords(userMessage);
    console.log('🔍 Extracted keywords:', searchKeywords);

    // Step 2: Progressive memory search with real data
    const memorySearchResults = await enhancedMemoryService.performProgressiveSearch(
      searchKeywords.join(' '),
      8 // Get up to 8 relevant memories
    );

    console.log('📚 Memory search results:', {
      strategy: memorySearchResults.searchStrategy,
      count: memorySearchResults.matchCount,
      executionTime: memorySearchResults.executionTime
    });

    // Step 3: Get session-specific memories
    const sessionMemories = await enhancedMemoryService.getMemoriesBySession(sessionId);
    console.log('📝 Session memories found:', sessionMemories.length);

    // Step 4: Combine and prioritize memories
    const allRelevantMemories = this.prioritizeMemories([
      ...memorySearchResults.memories,
      ...sessionMemories
    ]);

    // Step 5: Create context summary
    const contextSummary = this.createContextSummary(allRelevantMemories, userMessage);

    // Step 6: Update memory state
    await this.updateMemoryState(sessionId, allRelevantMemories);

    const memoryContext: MemoryContext = {
      relevantMemories: allRelevantMemories,
      memorySearchQuery: searchKeywords.join(' '),
      contextSummary,
      lastMemoryUpdate: new Date().toISOString()
    };

    // Cache for performance
    this.memoryContextCache.set(`${sessionId}_${Date.now()}`, memoryContext);
    console.log('✅ Memory context built successfully');

    return memoryContext;
  }

  private extractKeywords(message: string): string[] {
    // Extract meaningful keywords from user message
    const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'my', 'your', 'his', 'her', 'its', 'our', 'their'];
    
    const words = message.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 2 && !stopWords.includes(word));
    
    // Return unique keywords, prioritizing longer ones
    return [...new Set(words)].sort((a, b) => b.length - a.length).slice(0, 5);
  }

  private prioritizeMemories(memories: SessionMemory[]): SessionMemory[] {
    // Remove duplicates and sort by importance and recency
    const uniqueMemories = memories.filter((memory, index, self) => 
      index === self.findIndex(m => m.id === memory.id)
    );

    return uniqueMemories
      .sort((a, b) => {
        // Primary sort: importance score
        const importanceDiff = (b.importance_score || 5) - (a.importance_score || 5);
        if (importanceDiff !== 0) return importanceDiff;
        
        // Secondary sort: recency
        return new Date(b.last_referenced || b.created_at).getTime() - 
               new Date(a.last_referenced || a.created_at).getTime();
      })
      .slice(0, 6); // Keep top 6 most relevant memories
  }

  private createContextSummary(memories: SessionMemory[], userMessage: string): string {
    if (memories.length === 0) {
      return "No relevant memories found for this conversation.";
    }

    const memoryTopics = memories.map(memory => {
      const summary = memory.context_summary || 'General conversation';
      const importance = memory.importance_score || 5;
      return `${summary} (importance: ${importance})`;
    });

    return `Based on ${memories.length} relevant memories: ${memoryTopics.slice(0, 3).join(', ')}. Most recent memory from ${memories[0]?.created_at ? new Date(memories[0].created_at).toLocaleDateString() : 'unknown date'}.`;
  }

  private async updateMemoryState(sessionId: string, memories: SessionMemory[]): Promise<void> {
    // Update last_referenced timestamp for accessed memories
    const memoryIds = memories.map(m => m.id);
    
    if (memoryIds.length > 0) {
      try {
        const { error } = await supabase
          .from('user_session_memory')
          .update({ last_referenced: new Date().toISOString() })
          .in('id', memoryIds);

        if (error) {
          console.error('❌ Error updating memory timestamps:', error);
        } else {
          console.log('✅ Updated memory timestamps for', memoryIds.length, 'memories');
        }
      } catch (error) {
        console.error('❌ Unexpected error updating memory state:', error);
      }
    }
  }

  async enhanceSystemPromptWithMemory(
    basePrompt: string,
    memoryContext: MemoryContext,
    userMessage: string
  ): Promise<string> {
    if (memoryContext.relevantMemories.length === 0) {
      return basePrompt;
    }

    const memorySection = this.formatMemoriesForPrompt(memoryContext.relevantMemories);
    
    const enhancedPrompt = `${basePrompt}

## RELEVANT CONVERSATION MEMORIES
${memorySection}

## MEMORY CONTEXT
User's current question/topic: "${userMessage}"
Context summary: ${memoryContext.contextSummary}

## INSTRUCTIONS FOR MEMORY USE
- Reference relevant memories naturally in your response
- Build upon previous conversations when appropriate
- Avoid repeating information you've already provided
- Show continuity and progression in the conversation
- If mentioning past discussions, be specific about what was discussed`;

    console.log('🎯 Enhanced system prompt with memory context');
    return enhancedPrompt;
  }

  private formatMemoriesForPrompt(memories: SessionMemory[]): string {
    return memories.map((memory, index) => {
      const memoryData = memory.memory_data || {};
      const content = memoryData.content || memoryData.summary || 'No content available';
      const date = new Date(memory.created_at).toLocaleDateString();
      
      return `Memory ${index + 1} (${date}, importance: ${memory.importance_score}):
Context: ${memory.context_summary || 'General conversation'}
Content: ${content}`;
    }).join('\n\n');
  }

  async trackMemoryApplication(
    sessionId: string,
    memoryContext: MemoryContext,
    userMessage: string,
    aiResponse: string
  ): Promise<void> {
    // Track how memories were used in the conversation
    try {
      const { error } = await supabase
        .from('user_session_memory')
        .insert({
          user_id: '', // Will be set by RLS
          session_id: sessionId,
          memory_type: 'memory_application_tracking',
          memory_data: {
            user_message: userMessage,
            ai_response: aiResponse.substring(0, 500), // Truncate for storage
            memories_used: memoryContext.relevantMemories.length,
            memory_search_query: memoryContext.memorySearchQuery,
            context_summary: memoryContext.contextSummary,
            application_timestamp: new Date().toISOString()
          },
          context_summary: `Memory application tracking for session ${sessionId}`,
          importance_score: 3
        });

      if (error) {
        console.error('❌ Error tracking memory application:', error);
      } else {
        console.log('✅ Memory application tracked successfully');
      }
    } catch (error) {
      console.error('❌ Unexpected error tracking memory application:', error);
    }
  }

  // Method to get conversation continuity across sessions
  async getCrossSessionContext(userId: string, currentSessionId: string, limit: number = 5): Promise<SessionMemory[]> {
    console.log('🔄 Getting cross-session context for user');
    
    try {
      const { data, error } = await supabase
        .from('user_session_memory')
        .select('*')
        .eq('user_id', userId)
        .neq('session_id', currentSessionId)
        .gte('importance_score', 6) // Only high-importance memories
        .order('last_referenced', { ascending: false })
        .order('importance_score', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('❌ Error fetching cross-session context:', error);
        return [];
      }

      console.log('✅ Cross-session context retrieved:', data?.length || 0, 'memories');
      return data as SessionMemory[] || [];
    } catch (error) {
      console.error('❌ Unexpected error getting cross-session context:', error);
      return [];
    }
  }

  clearCache(): void {
    this.memoryContextCache.clear();
    this.conversationMemories.clear();
    console.log('🧹 Memory conversation cache cleared');
  }
}

export const memoryInformedConversationService = new MemoryInformedConversationService();

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
    userId: string,
    pageContext?: string
  ): Promise<MemoryContext> {
    console.log('🧠 Building memory context for conversation:', { userMessage: userMessage.substring(0, 50), sessionId, userId, pageContext });

    // Step 1: Extract keywords from user message for memory search
    const searchKeywords = this.extractKeywords(userMessage);
    console.log('🔍 Extracted keywords:', searchKeywords);

    try {
      // Step 2: Memory Context Filtering - Progressive memory search with page context filter
      const memorySearchResults = await enhancedMemoryService.performProgressiveSearch(
        searchKeywords.join(' '),
        8 // Get up to 8 relevant memories
      );

      console.log('📚 Memory search results:', {
        strategy: memorySearchResults.searchStrategy,
        count: memorySearchResults.matchCount,
        executionTime: memorySearchResults.executionTime
      });

      // Step 3: Get session-specific memories with page context filtering
      const sessionMemories = await enhancedMemoryService.getMemoriesBySession(sessionId);
      console.log('📝 Session memories found:', sessionMemories.length);

      // Step 4: Memory Context Filtering - Get cross-session context with page filter
      const crossSessionMemories = await this.getCrossSessionContext(userId, sessionId, 3, pageContext);
      console.log('🔄 Cross-session memories found:', crossSessionMemories.length);

      // Step 5: Filter memories by page context to prevent bleeding
      const contextFilteredMemories = this.filterMemoriesByPageContext(
        [...memorySearchResults.memories, ...sessionMemories, ...crossSessionMemories],
        pageContext
      );

      // Step 6: Combine and prioritize memories
      const allRelevantMemories = this.prioritizeMemories(contextFilteredMemories);

      console.log('🎯 Total prioritized memories after context filtering:', allRelevantMemories.length);

      // Step 7: Create context summary
      const contextSummary = this.createContextSummary(allRelevantMemories, userMessage);

      // Step 8: Update memory state
      await this.updateMemoryState(sessionId, allRelevantMemories);

      // Step 9: Save current interaction as memory for future reference with page context
      await this.saveCurrentInteraction(userId, sessionId, userMessage, pageContext);

      const memoryContext: MemoryContext = {
        relevantMemories: allRelevantMemories,
        memorySearchQuery: searchKeywords.join(' '),
        contextSummary,
        lastMemoryUpdate: new Date().toISOString()
      };

      // Cache for performance
      this.memoryContextCache.set(`${sessionId}_${Date.now()}`, memoryContext);
      console.log('✅ Memory context built successfully with', allRelevantMemories.length, 'memories for page:', pageContext);

      return memoryContext;
    } catch (error) {
      console.error('❌ Error building memory context:', error);
      // Return empty context instead of failing
      return {
        relevantMemories: [],
        memorySearchQuery: searchKeywords.join(' '),
        contextSummary: "No previous conversation context available.",
        lastMemoryUpdate: new Date().toISOString()
      };
    }
  }

  // Step 2: Memory Context Filtering - Filter memories by page context
  private filterMemoriesByPageContext(memories: SessionMemory[], pageContext?: string): SessionMemory[] {
    if (!pageContext) return memories;

    console.log('🔍 Filtering memories by page context:', pageContext);

    return memories.filter(memory => {
      // Check if memory session_id contains the page context
      const memoryPageContext = this.extractPageContextFromSessionId(memory.session_id);
      const isContextMatch = memoryPageContext === pageContext;
      
      // Also filter out test/debug memories that might contaminate real sessions
      const isTestMemory = memory.context_summary?.includes('Patent test') || 
                          memory.context_summary?.includes('PIE Patent') ||
                          memory.context_summary?.includes('real-time validation') ||
                          memory.session_id.includes('test') ||
                          memory.session_id.includes('debug');

      const shouldInclude = isContextMatch && !isTestMemory;
      
      if (!shouldInclude) {
        console.log('🚫 Filtered out memory:', {
          sessionId: memory.session_id,
          context: memory.context_summary?.substring(0, 50),
          reason: !isContextMatch ? 'context_mismatch' : 'test_memory'
        });
      }

      return shouldInclude;
    });
  }

  private extractPageContextFromSessionId(sessionId: string): string {
    // Extract page context from session ID format: "pageContext_..."
    const parts = sessionId.split('_');
    const knownContexts = ['spiritual-growth', 'dreams', 'coach', 'relationships'];
    return knownContexts.includes(parts[0]) ? parts[0] : 'unknown';
  }

  private async saveCurrentInteraction(userId: string, sessionId: string, userMessage: string, pageContext?: string): Promise<void> {
    try {
      // Extract key topics from the message for better memory retrieval
      const topics = this.extractKeywords(userMessage);
      
      const { error } = await supabase
        .from('user_session_memory')
        .insert({
          user_id: userId,
          session_id: sessionId,
          memory_type: 'interaction',
          memory_data: {
            user_message: userMessage,
            topics: topics,
            interaction_timestamp: new Date().toISOString(),
            message_intent: this.analyzeMessageIntent(userMessage),
            page_context: pageContext // Step 2: Memory Context Filtering - Store page context
          },
          context_summary: `User interaction: ${userMessage.substring(0, 100)}${userMessage.length > 100 ? '...' : ''}`,
          importance_score: this.calculateImportanceScore(userMessage)
        });

      if (error) {
        console.error('❌ Error saving current interaction:', error);
      } else {
        console.log('✅ Current interaction saved as memory with page context:', pageContext);
      }
    } catch (error) {
      console.error('❌ Unexpected error saving interaction:', error);
    }
  }

  private analyzeMessageIntent(message: string): string {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('stuck') || lowerMessage.includes('frustrated') || lowerMessage.includes('confused')) {
      return 'seeking_support';
    } else if (lowerMessage.includes('thank') || lowerMessage.includes('help') || lowerMessage.includes('appreciate')) {
      return 'expressing_gratitude';
    } else if (lowerMessage.includes('question') || lowerMessage.includes('how') || lowerMessage.includes('what') || lowerMessage.includes('why')) {
      return 'seeking_information';
    } else if (lowerMessage.includes('feel') || lowerMessage.includes('emotion') || lowerMessage.includes('mood')) {
      return 'sharing_emotions';
    } else {
      return 'general_conversation';
    }
  }

  private calculateImportanceScore(message: string): number {
    let score = 5; // base score
    
    const emotionalWords = ['stuck', 'frustrated', 'excited', 'happy', 'sad', 'angry', 'worried', 'grateful'];
    const problemWords = ['problem', 'issue', 'challenge', 'difficulty', 'struggle'];
    const goalWords = ['goal', 'dream', 'aspiration', 'want', 'wish', 'hope'];
    
    const lowerMessage = message.toLowerCase();
    
    if (emotionalWords.some(word => lowerMessage.includes(word))) score += 2;
    if (problemWords.some(word => lowerMessage.includes(word))) score += 3;
    if (goalWords.some(word => lowerMessage.includes(word))) score += 2;
    if (message.length > 100) score += 1; // longer messages often more important
    
    return Math.min(score, 10); // cap at 10
  }

  private extractKeywords(message: string): string[] {
    const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'my', 'your', 'his', 'her', 'its', 'our', 'their'];
    
    const words = message.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 2 && !stopWords.includes(word));
    
    return [...new Set(words)].sort((a, b) => b.length - a.length).slice(0, 5);
  }

  private prioritizeMemories(memories: SessionMemory[]): SessionMemory[] {
    const uniqueMemories = memories.filter((memory, index, self) => 
      index === self.findIndex(m => m.id === memory.id)
    );

    return uniqueMemories
      .sort((a, b) => {
        const importanceDiff = (b.importance_score || 5) - (a.importance_score || 5);
        if (importanceDiff !== 0) return importanceDiff;
        
        return new Date(b.last_referenced || b.created_at).getTime() - 
               new Date(a.last_referenced || a.created_at).getTime();
      })
      .slice(0, 6);
  }

  private createContextSummary(memories: SessionMemory[], userMessage: string): string {
    if (memories.length === 0) {
      return "This appears to be a new conversation topic with no directly related previous discussions.";
    }

    const recentMemories = memories.slice(0, 3);
    const memoryTopics = recentMemories.map(memory => {
      const summary = memory.context_summary || 'General conversation';
      const importance = memory.importance_score || 5;
      const date = new Date(memory.created_at).toLocaleDateString();
      return `${summary} (${date}, importance: ${importance})`;
    });

    return `Building on ${memories.length} previous interactions: ${memoryTopics.join('; ')}. Most recent relevant memory from ${memories[0]?.created_at ? new Date(memories[0].created_at).toLocaleDateString() : 'unknown date'}.`;
  }

  private async updateMemoryState(sessionId: string, memories: SessionMemory[]): Promise<void> {
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
      console.log('⚠️ No memories to enhance prompt with');
      return basePrompt;
    }

    const memorySection = this.formatMemoriesForPrompt(memoryContext.relevantMemories);
    
    const enhancedPrompt = `${basePrompt}

## CONVERSATION MEMORY CONTEXT
${memorySection}

## CURRENT CONVERSATION CONTEXT
User's current message: "${userMessage}"
Memory context summary: ${memoryContext.contextSummary}

## MEMORY-INFORMED RESPONSE INSTRUCTIONS
- Acknowledge and build upon relevant previous conversations when appropriate
- Reference past discussions naturally if they relate to the current topic
- Show continuity in the relationship by remembering what we've discussed before
- If the user mentioned being "stuck" before, acknowledge this ongoing theme
- Avoid repeating identical advice - build upon what was previously shared
- Demonstrate that you remember the user's journey and growth over time`;

    console.log('🎯 Enhanced system prompt with', memoryContext.relevantMemories.length, 'memories');
    return enhancedPrompt;
  }

  private formatMemoriesForPrompt(memories: SessionMemory[]): string {
    return memories.map((memory, index) => {
      const memoryData = memory.memory_data || {};
      const content = memoryData.content || memoryData.user_message || memoryData.summary || 'No content available';
      const date = new Date(memory.created_at).toLocaleDateString();
      const topics = memoryData.topics ? ` Topics: ${memoryData.topics.join(', ')}` : '';
      
      return `Previous Interaction ${index + 1} (${date}, importance: ${memory.importance_score}):
Context: ${memory.context_summary || 'General conversation'}
User Message: ${content}${topics}`;
    }).join('\n\n');
  }

  async trackMemoryApplication(
    sessionId: string,
    memoryContext: MemoryContext,
    userMessage: string,
    aiResponse: string
  ): Promise<void> {
    try {
      // Get authenticated user ID first
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.id) {
        console.warn('⚠️ No authenticated user for memory tracking');
        return;
      }

      const { error } = await supabase
        .from('user_session_memory')
        .insert({
          user_id: user.id, // Use actual authenticated user ID
          session_id: sessionId,
          memory_type: 'interaction',
          memory_data: {
            user_message: userMessage,
            ai_response: aiResponse.substring(0, 500),
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

  async getCrossSessionContext(userId: string, currentSessionId: string, limit: number = 5, pageContext?: string): Promise<SessionMemory[]> {
    console.log('🔄 Getting cross-session context for user with page filter:', pageContext);
    
    try {
      let query = supabase
        .from('user_session_memory')
        .select('*')
        .eq('user_id', userId)
        .neq('session_id', currentSessionId)
        .gte('importance_score', 6);

      // Step 2: Memory Context Filtering - Filter by page context if provided
      if (pageContext) {
        // Filter sessions that belong to the same page context
        query = query.like('session_id', `${pageContext}_%`);
      }

      const { data, error } = await query
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

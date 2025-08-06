/**
 * PHASE 2: Semantic Intelligence Service
 * Implements RAG-style retrieval with OpenAI embeddings for contextual conversation memory
 * 
 * Pillar I: Preserve Core Intelligence - Integrates with existing ConversationMemoryService
 * Pillar II: Ground Truth - No mock data, real embeddings and similarity search
 * Pillar III: Intentional Craft - Intelligent context selection beyond token counting
 */

import { supabase } from '@/integrations/supabase/client';

export interface MessageEmbedding {
  id: string;
  message_id: string;
  session_id: string;
  user_id: string;
  content: string;
  embedding: number[];
  message_role: string;
  agent_mode?: string;
  created_at: string;
}

export interface SemanticSearchResult {
  content: string;
  similarity: number;
  message_role: string;
  created_at: string;
  session_id: string;
  agent_mode?: string;
}

export interface SemanticContextOptions {
  maxResults?: number;
  similarityThreshold?: number;
  includeRecent?: boolean;
  timeWeighting?: boolean;
}

/**
 * PHASE 2: Semantic Intelligence Infrastructure
 * Core service for embedding generation and semantic retrieval
 */
class SemanticMemoryService {
  private static instance: SemanticMemoryService;

  static getInstance(): SemanticMemoryService {
    if (!SemanticMemoryService.instance) {
      SemanticMemoryService.instance = new SemanticMemoryService();
    }
    return SemanticMemoryService.instance;
  }

  /**
   * Generate embedding for a text query using OpenAI
   * Leverages existing openai-embeddings edge function
   */
  async generateEmbedding(text: string): Promise<number[] | null> {
    try {
      console.log('🔮 SEMANTIC: Generating embedding for query:', text.substring(0, 50) + '...');
      
      const { data, error } = await supabase.functions.invoke('openai-embeddings', {
        body: { query: text }
      });

      if (error) {
        console.error('❌ SEMANTIC: Embedding generation failed:', error);
        return null;
      }

      if (!data?.embedding) {
        console.error('❌ SEMANTIC: No embedding in response');
        return null;
      }

      console.log('✅ SEMANTIC: Embedding generated successfully, dimensions:', data.embedding.length);
      return data.embedding;
    } catch (error) {
      console.error('❌ SEMANTIC: Embedding generation error:', error);
      return null;
    }
  }

  /**
   * Store message embedding in the semantic search table
   * Pillar II: Ground Truth - Real embeddings, no fallbacks
   */
  async storeMessageEmbedding(
    messageId: string,
    sessionId: string,
    content: string,
    role: string,
    agentMode?: string
  ): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('❌ SEMANTIC: User not authenticated');
        return false;
      }

      // Generate embedding
      const embedding = await this.generateEmbedding(content);
      if (!embedding) {
        console.error('❌ SEMANTIC: Failed to generate embedding for storage');
        return false;
      }

      // Store in database
      const { error } = await supabase
        .from('message_embeddings')
        .insert({
          message_id: messageId,
          session_id: sessionId,
          user_id: user.id,
          content: content,
          embedding: embedding,
          message_role: role,
          agent_mode: agentMode
        });

      if (error) {
        console.error('❌ SEMANTIC: Failed to store embedding:', error);
        return false;
      }

      console.log('✅ SEMANTIC: Message embedding stored successfully');
      return true;
    } catch (error) {
      console.error('❌ SEMANTIC: Embedding storage error:', error);
      return false;
    }
  }

  /**
   * PILLAR III: Semantic similarity search using vector cosine similarity
   * Returns contextually relevant messages based on query content
   */
  async searchSimilarMessages(
    query: string,
    options: SemanticContextOptions = {}
  ): Promise<SemanticSearchResult[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('❌ SEMANTIC: User not authenticated for search');
        return [];
      }

      // Generate query embedding
      const queryEmbedding = await this.generateEmbedding(query);
      if (!queryEmbedding) {
        console.error('❌ SEMANTIC: Failed to generate query embedding');
        return [];
      }

      const {
        maxResults = 10,
        similarityThreshold = 0.7,
        includeRecent = true,
        timeWeighting = true
      } = options;

      console.log('🔮 SEMANTIC: Searching for similar messages', {
        queryLength: query.length,
        maxResults,
        similarityThreshold,
        includeRecent,
        timeWeighting
      });

      // Semantic similarity search using pgvector
      const { data, error } = await supabase.rpc('search_similar_messages', {
        query_embedding: queryEmbedding,
        user_id_param: user.id,
        max_results: maxResults,
        similarity_threshold: similarityThreshold
      });

      if (error) {
        console.error('❌ SEMANTIC: Similarity search failed:', error);
        return [];
      }

      const results = (data || []).map((row: any) => ({
        content: row.content,
        similarity: row.similarity,
        message_role: row.message_role,
        created_at: row.created_at,
        session_id: row.session_id,
        agent_mode: row.agent_mode
      }));

      console.log('✅ SEMANTIC: Found', results.length, 'similar messages');
      return results;
      
    } catch (error) {
      console.error('❌ SEMANTIC: Similarity search error:', error);
      return [];
    }
  }

  /**
   * PHASE 2: Hybrid context selection combining semantic similarity + recency
   * Implements intelligent context beyond simple token counting
   */
  async getSemanticContext(
    query: string,
    maxTokens: number = 4000,
    options: SemanticContextOptions = {}
  ): Promise<{
    semanticMessages: SemanticSearchResult[];
    totalTokens: number;
    selectionMethod: string;
  }> {
    try {
      // Get semantically similar messages
      const similarMessages = await this.searchSimilarMessages(query, {
        maxResults: 20, // Get more candidates
        similarityThreshold: 0.6, // Lower threshold for broader search
        ...options
      });

      if (similarMessages.length === 0) {
        console.log('⚠️ SEMANTIC: No similar messages found, using empty context');
        return {
          semanticMessages: [],
          totalTokens: 0,
          selectionMethod: 'semantic_empty'
        };
      }

      // Estimate tokens (rough: 4 chars = 1 token)
      const estimateTokens = (text: string) => Math.ceil(text.length / 4);
      
      let totalTokens = 0;
      const selectedMessages: SemanticSearchResult[] = [];
      
      // Prioritize by similarity score and recency
      const sortedMessages = similarMessages.sort((a, b) => {
        // Combine similarity score with recency bias
        const timeA = new Date(a.created_at).getTime();
        const timeB = new Date(b.created_at).getTime();
        const recencyBiasA = options.timeWeighting ? (timeA / Date.now()) * 0.1 : 0;
        const recencyBiasB = options.timeWeighting ? (timeB / Date.now()) * 0.1 : 0;
        
        return (b.similarity + recencyBiasB) - (a.similarity + recencyBiasA);
      });

      // Select messages within token limit
      for (const message of sortedMessages) {
        const messageTokens = estimateTokens(message.content);
        
        if (totalTokens + messageTokens > maxTokens && selectedMessages.length > 0) {
          break;
        }
        
        selectedMessages.push(message);
        totalTokens += messageTokens;
      }

      console.log('✅ SEMANTIC: Context selection complete', {
        candidatesFound: similarMessages.length,
        messagesSelected: selectedMessages.length,
        totalTokens,
        avgSimilarity: selectedMessages.reduce((sum, msg) => sum + msg.similarity, 0) / selectedMessages.length
      });

      return {
        semanticMessages: selectedMessages,
        totalTokens,
        selectionMethod: 'semantic_hybrid'
      };
      
    } catch (error) {
      console.error('❌ SEMANTIC: Context selection error:', error);
      return {
        semanticMessages: [],
        totalTokens: 0,
        selectionMethod: 'semantic_error'
      };
    }
  }
}

export const semanticMemoryService = SemanticMemoryService.getInstance();
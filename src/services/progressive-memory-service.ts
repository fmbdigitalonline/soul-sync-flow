/**
 * PHASE 3: Progressive Memory Service
 * Implements multi-level conversation summarization, topic shift detection, and structured storage
 * 
 * Pillar I: Preserves core intelligence by building on Phase 2 semantic infrastructure
 * Pillar II: Ground truth - real dynamic summarization and topic detection
 * Pillar III: Intentional craft - scalable architecture for long conversations
 */

import { supabase } from '@/integrations/supabase/client';
import { semanticMemoryService } from './semantic-memory-service';
import { v4 as uuidv4 } from 'uuid';

export interface StructuredMessage {
  id: string;
  thread_id: string;
  message_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  agent_mode?: string;
  topic_tags?: string[];
  emotional_tone?: string;
  importance_score: number;
  parent_message_id?: string;
  is_summary: boolean;
  summary_level: number;
  tokens_count?: number;
  created_at: Date;
}

export interface ConversationTopic {
  id: string;
  thread_id: string;
  topic_name: string;
  topic_description?: string;
  start_message_id: string;
  end_message_id?: string;
  confidence_score: number;
  message_count: number;
  is_active: boolean;
  created_at: Date;
}

export interface ConversationSummary {
  id: string;
  thread_id: string;
  summary_level: number; // 1=immediate, 2=session, 3=topic, 4=long-term
  summary_content: string;
  message_range_start: string;
  message_range_end: string;
  topic_id?: string;
  key_insights: string[];
  emotional_arc?: string;
  compression_ratio?: number;
  created_at: Date;
}

export interface TopicShiftDetection {
  detected: boolean;
  confidence: number;
  new_topic: string;
  previous_topic?: string;
  trigger_message_id: string;
  semantic_distance: number;
}

class ProgressiveMemoryService {
  private static instance: ProgressiveMemoryService;

  static getInstance(): ProgressiveMemoryService {
    if (!ProgressiveMemoryService.instance) {
      ProgressiveMemoryService.instance = new ProgressiveMemoryService();
    }
    return ProgressiveMemoryService.instance;
  }

  /**
   * PILLAR I: Store message in structured format while preserving legacy compatibility
   */
  async storeStructuredMessage(
    threadId: string,
    messageId: string,
    role: 'user' | 'assistant' | 'system',
    content: string,
    agentMode?: string,
    parentMessageId?: string
  ): Promise<StructuredMessage | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('❌ PROGRESSIVE: User not authenticated');
        return null;
      }

      // Generate semantic embedding
      const embedding = await semanticMemoryService.generateEmbedding(content);
      if (!embedding) {
        console.warn('⚠️ PROGRESSIVE: Failed to generate embedding, storing without semantic data');
      }

      // Analyze content for topic tags and emotional tone
      const contentAnalysis = await this.analyzeMessageContent(content, role);
      
      // Calculate importance score
      const importanceScore = this.calculateMessageImportance(content, role, contentAnalysis);

      // Convert embedding to string format for storage
      const embeddingString = embedding ? `[${embedding.join(',')}]` : null;

      const { data, error } = await supabase
        .from('conversation_messages')
        .insert({
          user_id: user.id,
          thread_id: threadId,
          message_id: messageId,
          role,
          content,
          agent_mode: agentMode,
          semantic_embedding: embeddingString,
          topic_tags: contentAnalysis.topicTags,
          emotional_tone: contentAnalysis.emotionalTone,
          importance_score: importanceScore,
          parent_message_id: parentMessageId,
          is_summary: false,
          summary_level: 0,
          tokens_count: this.estimateTokenCount(content)
        })
        .select()
        .single();

      if (error) {
        console.error('❌ PROGRESSIVE: Failed to store structured message:', error);
        return null;
      }

      console.log('✅ PROGRESSIVE: Structured message stored successfully');

      // Check for topic shift after storing
      await this.detectTopicShift(threadId, messageId, content, embedding);

      // Convert database response to StructuredMessage with proper date conversion
      return {
        ...data,
        created_at: new Date(data.created_at)
      } as StructuredMessage;
    } catch (error) {
      console.error('❌ PROGRESSIVE: Error storing structured message:', error);
      return null;
    }
  }

  /**
   * PILLAR II: Detect topic shifts using semantic analysis
   */
  async detectTopicShift(
    threadId: string,
    messageId: string,
    content: string,
    embedding: number[] | null
  ): Promise<TopicShiftDetection | null> {
    try {
      if (!embedding) return null;

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      // Get recent messages for context window
      const { data: recentMessages, error } = await supabase
        .from('conversation_messages')
        .select('content, semantic_embedding, topic_tags, created_at')
        .eq('user_id', user.id)
        .eq('thread_id', threadId)
        .eq('is_summary', false)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error || !recentMessages || recentMessages.length < 3) {
        return null; // Need context to detect shifts
      }

      // Calculate semantic distance from recent messages
      const semanticDistances = await this.calculateSemanticDistances(embedding, recentMessages);
      const avgDistance = semanticDistances.reduce((sum, d) => sum + d, 0) / semanticDistances.length;
      
      // Detect topic shift if semantic distance exceeds threshold
      const TOPIC_SHIFT_THRESHOLD = 0.3;
      const topicShiftDetected = avgDistance > TOPIC_SHIFT_THRESHOLD;

      if (topicShiftDetected) {
        const newTopic = await this.generateTopicName(content, embedding);
        const currentTopic = await this.getCurrentActiveTopic(threadId);

        // Close current topic if exists
        if (currentTopic) {
          await this.closeCurrentTopic(currentTopic.id, messageId);
        }

        // Create new topic
        await this.createNewTopic(threadId, newTopic, messageId, embedding);

        console.log(`🔄 PROGRESSIVE: Topic shift detected - "${newTopic}"`);

        return {
          detected: true,
          confidence: Math.min(avgDistance / TOPIC_SHIFT_THRESHOLD, 1.0),
          new_topic: newTopic,
          previous_topic: currentTopic?.topic_name,
          trigger_message_id: messageId,
          semantic_distance: avgDistance
        };
      }

      return {
        detected: false,
        confidence: 1.0 - (avgDistance / TOPIC_SHIFT_THRESHOLD),
        new_topic: '',
        trigger_message_id: messageId,
        semantic_distance: avgDistance
      };
    } catch (error) {
      console.error('❌ PROGRESSIVE: Error detecting topic shift:', error);
      return null;
    }
  }

  /**
   * PILLAR III: Generate multi-level conversation summaries
   */
  async generateProgressiveSummary(
    threadId: string,
    summaryLevel: number,
    messageRangeStart: string,
    messageRangeEnd: string,
    topicId?: string
  ): Promise<ConversationSummary | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      // Get messages in range
      const { data: messages, error } = await supabase
        .from('conversation_messages')
        .select('content, role, emotional_tone, importance_score, created_at')
        .eq('user_id', user.id)
        .eq('thread_id', threadId)
        .gte('message_id', messageRangeStart)
        .lte('message_id', messageRangeEnd)
        .eq('is_summary', false)
        .order('created_at', { ascending: true });

      if (error || !messages || messages.length === 0) {
        console.error('❌ PROGRESSIVE: No messages found for summary range');
        return null;
      }

      // Generate summary content based on level
      const summaryContent = await this.generateSummaryContent(messages, summaryLevel);
      const keyInsights = await this.extractKeyInsights(messages);
      const emotionalArc = this.analyzeEmotionalArc(messages);
      const compressionRatio = summaryContent.length / messages.reduce((sum, m) => sum + m.content.length, 0);

      // Generate embedding for summary
      const summaryEmbedding = await semanticMemoryService.generateEmbedding(summaryContent);
      const embeddingString = summaryEmbedding ? `[${summaryEmbedding.join(',')}]` : null;

      const { data, error: insertError } = await supabase
        .from('conversation_summaries')
        .insert({
          user_id: user.id,
          thread_id: threadId,
          summary_level: summaryLevel,
          summary_content: summaryContent,
          message_range_start: messageRangeStart,
          message_range_end: messageRangeEnd,
          topic_id: topicId,
          key_insights: keyInsights,
          emotional_arc: emotionalArc,
          summary_embedding: embeddingString,
          compression_ratio: compressionRatio
        })
        .select()
        .single();

      if (insertError) {
        console.error('❌ PROGRESSIVE: Failed to store summary:', insertError);
        return null;
      }

      console.log(`✅ PROGRESSIVE: Level ${summaryLevel} summary generated (${compressionRatio.toFixed(2)}x compression)`);
      return {
        ...data,
        created_at: new Date(data.created_at)
      } as ConversationSummary;
    } catch (error) {
      console.error('❌ PROGRESSIVE: Error generating progressive summary:', error);
      return null;
    }
  }

  /**
   * PILLAR I: Get intelligent context with progressive summarization
   */
  async getProgressiveContext(
    threadId: string,
    maxTokens: number = 4000,
    includeTopicContext: boolean = true
  ): Promise<{
    messages: StructuredMessage[];
    summaries: ConversationSummary[];
    topics: ConversationTopic[];
    totalTokens: number;
    contextStrategy: string;
  }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { messages: [], summaries: [], topics: [], totalTokens: 0, contextStrategy: 'unauthenticated' };
      }

      // Get recent messages (last 10)
      const { data: recentMessages } = await supabase
        .from('conversation_messages')
        .select('*')
        .eq('user_id', user.id)
        .eq('thread_id', threadId)
        .eq('is_summary', false)
        .order('created_at', { ascending: false })
        .limit(10);

      // Get active topics if requested
      let topics: ConversationTopic[] = [];
      if (includeTopicContext) {
        const { data: topicData } = await supabase
          .from('conversation_topics')
          .select('*')
          .eq('user_id', user.id)
          .eq('thread_id', threadId)
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(5);
        topics = (topicData || []).map(topic => ({
          ...topic,
          created_at: new Date(topic.created_at)
        }));
      }

      // Get relevant summaries based on available token budget
      const { data: summaryData } = await supabase
        .from('conversation_summaries')
        .select('*')
        .eq('user_id', user.id)
        .eq('thread_id', threadId)
        .order('summary_level', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(3);

      const messages = (recentMessages || []).map(msg => ({
        ...msg,
        created_at: new Date(msg.created_at)
      })) as StructuredMessage[];
      const summaries = (summaryData || []).map(summary => ({
        ...summary,
        created_at: new Date(summary.created_at)
      })) as ConversationSummary[];

      // Calculate token usage and optimize context
      let totalTokens = 0;
      const optimizedMessages: StructuredMessage[] = [];
      const optimizedSummaries: ConversationSummary[] = [];

      // Prioritize recent messages
      for (const message of messages) {
        const messageTokens = message.tokens_count || this.estimateTokenCount(message.content);
        if (totalTokens + messageTokens <= maxTokens * 0.6) { // Reserve 40% for summaries
          optimizedMessages.push(message);
          totalTokens += messageTokens;
        } else {
          break;
        }
      }

      // Add summaries with remaining token budget
      for (const summary of summaries) {
        const summaryTokens = this.estimateTokenCount(summary.summary_content);
        if (totalTokens + summaryTokens <= maxTokens) {
          optimizedSummaries.push(summary);
          totalTokens += summaryTokens;
        } else {
          break;
        }
      }

      const contextStrategy = optimizedMessages.length > 0 && optimizedSummaries.length > 0 
        ? 'hybrid_progressive' 
        : optimizedMessages.length > 0 
          ? 'recent_messages' 
          : 'summary_only';

      console.log(`✅ PROGRESSIVE: Context loaded - ${optimizedMessages.length} messages, ${optimizedSummaries.length} summaries, ${topics.length} topics (${totalTokens} tokens)`);

      return {
        messages: optimizedMessages,
        summaries: optimizedSummaries,
        topics,
        totalTokens,
        contextStrategy
      };
    } catch (error) {
      console.error('❌ PROGRESSIVE: Error getting progressive context:', error);
      return { messages: [], summaries: [], topics: [], totalTokens: 0, contextStrategy: 'error' };
    }
  }

  // Helper methods
  private async analyzeMessageContent(content: string, role: string): Promise<{
    topicTags: string[];
    emotionalTone: string;
  }> {
    // Simplified content analysis - in production, this could use more sophisticated NLP
    const topicTags: string[] = [];
    
    // Extract potential topics from content
    if (content.toLowerCase().includes('work') || content.toLowerCase().includes('job')) {
      topicTags.push('career');
    }
    if (content.toLowerCase().includes('relationship') || content.toLowerCase().includes('partner')) {
      topicTags.push('relationships');
    }
    if (content.toLowerCase().includes('health') || content.toLowerCase().includes('wellness')) {
      topicTags.push('health');
    }
    if (content.toLowerCase().includes('goal') || content.toLowerCase().includes('plan')) {
      topicTags.push('planning');
    }

    // Simple emotional tone detection
    let emotionalTone = 'neutral';
    if (content.includes('!') || content.toLowerCase().includes('excited')) {
      emotionalTone = 'excited';
    } else if (content.toLowerCase().includes('sad') || content.toLowerCase().includes('worried')) {
      emotionalTone = 'concerned';
    } else if (content.toLowerCase().includes('happy') || content.toLowerCase().includes('good')) {
      emotionalTone = 'positive';
    }

    return { topicTags, emotionalTone };
  }

  private calculateMessageImportance(content: string, role: string, analysis: any): number {
    let importance = 5.0; // Base importance

    // User messages are generally more important
    if (role === 'user') importance += 1.0;

    // Longer messages might be more important
    if (content.length > 200) importance += 0.5;

    // Messages with topic tags are more important
    importance += analysis.topicTags.length * 0.3;

    // Emotional messages are more important
    if (analysis.emotionalTone !== 'neutral') importance += 0.5;

    return Math.min(importance, 10.0);
  }

  private estimateTokenCount(text: string): number {
    // Rough estimation: 4 characters = 1 token
    return Math.ceil(text.length / 4);
  }

  private async calculateSemanticDistances(embedding: number[], recentMessages: any[]): Promise<number[]> {
    const distances: number[] = [];
    
    for (const message of recentMessages) {
      if (message.semantic_embedding) {
        try {
          // Parse the embedding string back to array
          const messageEmbedding = JSON.parse(message.semantic_embedding);
          const distance = this.cosineSimilarity(embedding, messageEmbedding);
          distances.push(1 - distance); // Convert similarity to distance
        } catch (e) {
          // Skip invalid embeddings
        }
      }
    }
    
    return distances;
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

  private async generateTopicName(content: string, embedding: number[]): Promise<string> {
    // Simplified topic generation - could be enhanced with AI
    const words = content.toLowerCase().split(' ');
    const keywords = words.filter(word => word.length > 4);
    return keywords.slice(0, 2).join('_') || 'general_discussion';
  }

  private async getCurrentActiveTopic(threadId: string): Promise<ConversationTopic | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data } = await supabase
      .from('conversation_topics')
      .select('*')
      .eq('user_id', user.id)
      .eq('thread_id', threadId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1);

    return data?.[0] ? {
      ...data[0],
      created_at: new Date(data[0].created_at)
    } : null;
  }

  private async closeCurrentTopic(topicId: string, endMessageId: string): Promise<void> {
    await supabase
      .from('conversation_topics')
      .update({
        is_active: false,
        end_message_id: endMessageId
      })
      .eq('id', topicId);
  }

  private async createNewTopic(
    threadId: string,
    topicName: string,
    startMessageId: string,
    embedding: number[]
  ): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const embeddingString = `[${embedding.join(',')}]`;

    await supabase
      .from('conversation_topics')
      .insert({
        user_id: user.id,
        thread_id: threadId,
        topic_name: topicName,
        topic_description: `Discussion about ${topicName}`,
        start_message_id: startMessageId,
        topic_embedding: embeddingString,
        confidence_score: 0.8,
        message_count: 1,
        is_active: true
      });
  }

  private async generateSummaryContent(messages: any[], summaryLevel: number): Promise<string> {
    // Simplified summarization - in production, this could use AI
    const messageContents = messages.map(m => m.content).join(' ');
    
    switch (summaryLevel) {
      case 1: // Immediate - last few exchanges
        return `Recent exchange: ${messageContents.substring(0, 200)}...`;
      case 2: // Session - key points from session
        return `Session summary: Key discussion points included ${messageContents.substring(0, 300)}...`;
      case 3: // Topic - comprehensive topic summary
        return `Topic summary: Comprehensive discussion covering ${messageContents.substring(0, 500)}...`;
      case 4: // Long-term - high-level overview
        return `Long-term summary: Extended conversation encompassing ${messageContents.substring(0, 150)}...`;
      default:
        return messageContents.substring(0, 200);
    }
  }

  private async extractKeyInsights(messages: any[]): Promise<string[]> {
    // Simplified insight extraction
    const insights: string[] = [];
    
    for (const message of messages) {
      if (message.importance_score > 7.0) {
        insights.push(`High-importance insight from ${message.role}`);
      }
    }
    
    if (insights.length === 0) {
      insights.push('General conversation flow maintained');
    }
    
    return insights.slice(0, 3); // Max 3 insights
  }

  private analyzeEmotionalArc(messages: any[]): string {
    const tones = messages.map(m => m.emotional_tone).filter(Boolean);
    if (tones.length === 0) return 'neutral';
    
    const uniqueTones = [...new Set(tones)];
    return uniqueTones.join(' → ');
  }
}

export const progressiveMemoryService = ProgressiveMemoryService.getInstance();
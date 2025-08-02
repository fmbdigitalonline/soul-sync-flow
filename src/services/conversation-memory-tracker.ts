/**
 * Conversation Memory Tracker
 * Tracks specific conversation elements for progressive memory building
 */

import { supabase } from "@/integrations/supabase/client";

interface ConversationElement {
  type: 'statement' | 'question' | 'decision' | 'emotion' | 'goal' | 'pattern';
  content: string;
  timestamp: Date;
  importance: number;
  context: string;
}

interface MemoryReference {
  elementId: string;
  content: string;
  timestamp: Date;
  relevanceScore: number;
}

export class ConversationMemoryTracker {
  private currentSession: ConversationElement[] = [];
  
  /**
   * Track a specific conversation element for memory building
   */
  trackElement(element: ConversationElement, sessionId: string, userId: string): void {
    this.currentSession.push(element);
    
    // Save to database asynchronously
    this.saveElementToMemory(element, sessionId, userId).catch(error => {
      console.error('❌ Error saving conversation element:', error);
    });
  }

  /**
   * Extract trackable elements from user message
   */
  extractElementsFromMessage(message: string, sessionId: string, userId: string): ConversationElement[] {
    const elements: ConversationElement[] = [];
    const lowerMessage = message.toLowerCase();
    
    // Track specific statements and decisions
    if (lowerMessage.includes('i am') || lowerMessage.includes("i'm")) {
      elements.push({
        type: 'statement',
        content: this.extractStatement(message),
        timestamp: new Date(),
        importance: 7,
        context: 'self_identification'
      });
    }
    
    // Track emotional expressions
    const emotionalWords = ['feel', 'feeling', 'frustrated', 'excited', 'stuck', 'happy', 'sad', 'angry', 'grateful'];
    if (emotionalWords.some(word => lowerMessage.includes(word))) {
      elements.push({
        type: 'emotion',
        content: message,
        timestamp: new Date(),
        importance: 8,
        context: 'emotional_state'
      });
    }
    
    // Track goals and aspirations
    if (lowerMessage.includes('want to') || lowerMessage.includes('goal') || lowerMessage.includes('building') || lowerMessage.includes('creating')) {
      elements.push({
        type: 'goal',
        content: message,
        timestamp: new Date(),
        importance: 9,
        context: 'aspirations'
      });
    }
    
    // Track patterns and behaviors
    if (lowerMessage.includes('always') || lowerMessage.includes('usually') || lowerMessage.includes('tend to') || lowerMessage.includes('often')) {
      elements.push({
        type: 'pattern',
        content: message,
        timestamp: new Date(),
        importance: 8,
        context: 'behavioral_patterns'
      });
    }
    
    // Save all elements
    elements.forEach(element => {
      this.trackElement(element, sessionId, userId);
    });
    
    return elements;
  }

  /**
   * Get memory references for response generation
   */
  async getMemoryReferences(userMessage: string, sessionId: string, userId: string): Promise<MemoryReference[]> {
    try {
      console.log('🧠 MEMORY TRACKER: Retrieving references from conversation_memory for sessionId:', sessionId);
      
      // Get from conversation_memory table where companion conversations are stored
      const { data: conversationMemory, error } = await supabase
        .from('conversation_memory')
        .select('messages, created_at, session_id')
        .eq('user_id', userId)
        .eq('mode', 'companion')
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (error) throw error;
      
      // Process conversation messages as memory references
      const memories: any[] = [];
      conversationMemory?.forEach(conv => {
        if (Array.isArray(conv.messages)) {
          const messages = conv.messages as any[];
          messages.forEach((msg, index) => {
            if (msg.role === 'user' && msg.content) {
              memories.push({
                id: `${conv.session_id}_${index}`,
                created_at: msg.timestamp || conv.created_at,
                memory_data: {
                  content: msg.content,
                  user_message: msg.content
                }
              });
            }
          });
        }
      });
      
      console.log('🧠 MEMORY TRACKER: Found', memories.length, 'conversation memory references');
      return this.processMemoriesForReferences(memories, userMessage);
    } catch (error) {
      console.error('❌ Error retrieving memory references:', error);
      return [];
    }
  }

  /**
   * Generate conversational memory context for prompts
   */
  generateMemoryContext(references: MemoryReference[]): string {
    if (references.length === 0) return '';
    
    const contextLines = references.map(ref => {
      const timeAgo = this.getTimeAgo(ref.timestamp);
      return `- ${timeAgo}: "${ref.content}" (relevance: ${ref.relevanceScore.toFixed(1)})`;
    });
    
    return `## CONVERSATION MEMORY REFERENCES
${contextLines.join('\n')}

IMPORTANT: Reference these previous statements naturally in your response. Show that you remember and build upon what the user has shared.`;
  }

  private extractStatement(message: string): string {
    // Extract self-identification statements
    const patterns = [
      /i am (.+?)[\.\,\!]/i,
      /i'm (.+?)[\.\,\!]/i,
      /i tend to (.+?)[\.\,\!]/i,
      /i usually (.+?)[\.\,\!]/i
    ];
    
    for (const pattern of patterns) {
      const match = message.match(pattern);
      if (match) {
        return match[0];
      }
    }
    
    return message.substring(0, 100); // fallback
  }

  private async saveElementToMemory(element: ConversationElement, sessionId: string, userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_session_memory')
        .insert({
          user_id: userId,
          session_id: sessionId,
          memory_type: 'conversation_element',
          memory_data: {
            element_type: element.type,
            content: element.content,
            context: element.context,
            timestamp: element.timestamp.toISOString()
          },
          context_summary: `${element.type}: ${element.content.substring(0, 50)}...`,
          importance_score: element.importance
        });
      
      if (error) throw error;
      console.log('✅ Conversation element saved:', element.type);
    } catch (error) {
      console.error('❌ Error saving conversation element:', error);
    }
  }

  private processMemoriesForReferences(memories: any[], currentMessage: string): MemoryReference[] {
    const references: MemoryReference[] = [];
    const messageKeywords = this.extractKeywords(currentMessage);
    
    memories.forEach(memory => {
      const memoryData = memory.memory_data || {};
      const content = memoryData.content || memoryData.user_message || '';
      
      if (content) {
        const relevanceScore = this.calculateRelevance(content, messageKeywords);
        
        if (relevanceScore > 0.3) { // Only include relevant memories
          references.push({
            elementId: memory.id,
            content: content,
            timestamp: new Date(memory.created_at),
            relevanceScore: relevanceScore
          });
        }
      }
    });
    
    return references
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 5); // Top 5 most relevant
  }

  private calculateRelevance(memoryContent: string, currentKeywords: string[]): number {
    const memoryKeywords = this.extractKeywords(memoryContent);
    const commonKeywords = memoryKeywords.filter(word => 
      currentKeywords.some(current => current.includes(word) || word.includes(current))
    );
    
    return commonKeywords.length / Math.max(currentKeywords.length, memoryKeywords.length);
  }

  private extractKeywords(text: string): string[] {
    const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];
    return text.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 2 && !stopWords.includes(word))
      .slice(0, 10);
  }

  private getTimeAgo(timestamp: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - timestamp.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Earlier today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return `${Math.floor(diffDays / 7)} weeks ago`;
  }
}

export const conversationMemoryTracker = new ConversationMemoryTracker();
/**
 * SoulSync Conversation Memory Service
 * Pillar I: Preserves core intelligence pathways
 * Pillar II: Ground truth - no hardcoded data, transparent state
 * Pillar III: Intentional craft - validated, structured storage
 */

import { supabase } from '@/integrations/supabase/client';
import { BlueprintHealthChecker } from './blueprint-health-checker';

export interface ValidatedMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  agent_mode?: string;
}

export interface ConversationContext {
  threadId: string;
  messages: ValidatedMessage[];
  lastActivity: Date;
}

export class ConversationMemoryService {
  private static instance: ConversationMemoryService;
  
  static getInstance(): ConversationMemoryService {
    if (!this.instance) {
      this.instance = new ConversationMemoryService();
    }
    return this.instance;
  }

  /**
   * Pillar II: No fallbacks that mask errors - validate before store
   */
  private validateMessage(message: any): ValidatedMessage | null {
    BlueprintHealthChecker.logValidation('ConversationMemory', `Validating message: ${JSON.stringify(message)}`);
    
    if (!message || typeof message !== 'object') {
      BlueprintHealthChecker.logHealthCheck('ConversationMemory', 'fail', 'Invalid message object');
      return null;
    }

    const validRoles = ['user', 'assistant', 'system'];
    if (!validRoles.includes(message.role)) {
      BlueprintHealthChecker.logHealthCheck('ConversationMemory', 'fail', `Invalid role: ${message.role}`);
      return null;
    }

    if (!message.content || typeof message.content !== 'string' || message.content.trim() === '') {
      BlueprintHealthChecker.logHealthCheck('ConversationMemory', 'fail', 'Empty or invalid content');
      return null;
    }

    // Strip streaming artifacts and internal tags
    const cleanContent = message.content
      .replace(/\[STREAMING\]/g, '')
      .replace(/\[ORACLE\]/g, '')
      .replace(/\[INTERNAL\]/g, '')
      .trim();

    if (!cleanContent) {
      BlueprintHealthChecker.logHealthCheck('ConversationMemory', 'fail', 'Content empty after cleaning');
      return null;
    }

    BlueprintHealthChecker.logHealthCheck('ConversationMemory', 'pass', 'Message validated successfully');
    
    return {
      id: message.id || `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      role: message.role,
      content: cleanContent,
      timestamp: message.timestamp ? new Date(message.timestamp) : new Date(),
      agent_mode: message.agent_mode
    };
  }

  /**
   * Pillar I: Preserve core intelligence - structured retrieval
   */
  async getConversationContext(threadId: string): Promise<ConversationContext | null> {
    BlueprintHealthChecker.logValidation('ConversationMemory', `Retrieving context for thread: ${threadId}`);
    
    try {
      const { data, error } = await supabase
        .from('conversation_memory')
        .select('*')
        .eq('session_id', threadId)
        .single();

      if (error) {
        BlueprintHealthChecker.logHealthCheck('ConversationMemory', 'warning', `No existing context: ${error.message}`);
        return null;
      }

      if (!data || !data.messages) {
        BlueprintHealthChecker.logHealthCheck('ConversationMemory', 'warning', 'No messages in context');
        return null;
      }

      // Validate all messages
      const validatedMessages: ValidatedMessage[] = [];
      const rawMessages = Array.isArray(data.messages) ? data.messages : [];
      
      for (const msg of rawMessages) {
        const validated = this.validateMessage(msg);
        if (validated) {
          validatedMessages.push(validated);
        }
      }

      BlueprintHealthChecker.logHealthCheck('ConversationMemory', 'pass', 
        `Retrieved ${validatedMessages.length} valid messages from ${rawMessages.length} total`);

      return {
        threadId,
        messages: validatedMessages,
        lastActivity: new Date(data.last_activity)
      };

    } catch (error) {
      BlueprintHealthChecker.logHealthCheck('ConversationMemory', 'fail', 
        `Context retrieval failed: ${error.message}`);
      return null;
    }
  }

  /**
   * Pillar I & II: Ground truth storage - only add validated content
   */
  async storeMessage(threadId: string, message: any, userId?: string): Promise<boolean> {
    const validated = this.validateMessage(message);
    if (!validated) {
      BlueprintHealthChecker.logHealthCheck('ConversationMemory', 'fail', 'Message validation failed - not stored');
      return false;
    }

    try {
      // Get existing context
      const context = await this.getConversationContext(threadId);
      const existingMessages = context?.messages || [];
      
      // Deduplication - check for exact content matches
      const isDuplicate = existingMessages.some(existing => 
        existing.content === validated.content && existing.role === validated.role
      );
      
      if (isDuplicate) {
        BlueprintHealthChecker.logHealthCheck('ConversationMemory', 'warning', 'Duplicate message not stored');
        return true; // Not an error, just filtered
      }

      const updatedMessages = [...existingMessages, validated];
      
      // Get user_id from auth if not provided
      const { data: { user } } = await supabase.auth.getUser();
      const effectiveUserId = userId || user?.id || 'anonymous';
      
      const { error } = await supabase
        .from('conversation_memory')
        .upsert({
          session_id: threadId,
          user_id: effectiveUserId,
          messages: updatedMessages as any, // JSON type casting
          last_activity: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (error) {
        BlueprintHealthChecker.logHealthCheck('ConversationMemory', 'fail', 
          `Storage failed: ${error.message}`);
        return false;
      }

      BlueprintHealthChecker.logHealthCheck('ConversationMemory', 'pass', 
        `Message stored successfully. Total: ${updatedMessages.length}`);
      return true;

    } catch (error) {
      BlueprintHealthChecker.logHealthCheck('ConversationMemory', 'fail', 
        `Storage error: ${error.message}`);
      return false;
    }
  }

  /**
   * Pillar III: Intentional craft - intelligent context selection
   */
  getIntelligentContext(messages: ValidatedMessage[], maxTokens: number = 4000): ValidatedMessage[] {
    if (messages.length === 0) return [];
    
    // Estimate tokens (rough: 4 chars = 1 token)
    const estimateTokens = (text: string) => Math.ceil(text.length / 4);
    
    let totalTokens = 0;
    const selectedMessages: ValidatedMessage[] = [];
    
    // Always include the last few messages for immediate context
    const recentMessages = messages.slice(-5);
    
    for (let i = recentMessages.length - 1; i >= 0; i--) {
      const message = recentMessages[i];
      const messageTokens = estimateTokens(message.content);
      
      if (totalTokens + messageTokens > maxTokens && selectedMessages.length > 0) {
        break;
      }
      
      selectedMessages.unshift(message);
      totalTokens += messageTokens;
    }
    
    BlueprintHealthChecker.logValidation('ConversationMemory', 
      `Selected ${selectedMessages.length} messages (~${totalTokens} tokens)`);
    
    return selectedMessages;
  }
}

export const conversationMemoryService = ConversationMemoryService.getInstance();

import { supabase } from "@/integrations/supabase/client";

export interface ConversationTurn {
  userMessage: string;
  assistantResponse: string;
  timestamp: Date;
  agentType: string;
}

class ConversationMemoryService {
  private memoryCache: Map<string, ConversationTurn[]> = new Map();
  
  async getRecentConversation(userId: string, agentType: string, limit: number = 5): Promise<ConversationTurn[]> {
    const cacheKey = `${userId}_${agentType}`;
    
    if (this.memoryCache.has(cacheKey)) {
      return this.memoryCache.get(cacheKey)?.slice(-limit) || [];
    }

    try {
      const { data, error } = await supabase
        .from('conversation_memory')
        .select('messages')
        .eq('user_id', userId)
        .eq('mode', agentType)
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading conversation memory:', error);
        return [];
      }

      if (data?.messages && Array.isArray(data.messages)) {
        const turns = this.convertMessagesToTurns(data.messages, agentType);
        this.memoryCache.set(cacheKey, turns);
        return turns.slice(-limit);
      }

      return [];
    } catch (error) {
      console.error('Error in getRecentConversation:', error);
      return [];
    }
  }

  private convertMessagesToTurns(messages: any[], agentType: string): ConversationTurn[] {
    const turns: ConversationTurn[] = [];
    
    for (let i = 0; i < messages.length - 1; i += 2) {
      const userMessage = messages[i];
      const assistantMessage = messages[i + 1];
      
      if (userMessage?.sender === 'user' && assistantMessage?.sender === 'assistant') {
        turns.push({
          userMessage: userMessage.content,
          assistantResponse: assistantMessage.content,
          timestamp: new Date(assistantMessage.timestamp || Date.now()),
          agentType
        });
      }
    }
    
    return turns;
  }

  generateContextualPrompt(recentTurns: ConversationTurn[], currentMessage: string): string {
    if (recentTurns.length === 0) {
      return currentMessage;
    }

    const conversationContext = recentTurns
      .slice(-3) // Use last 3 turns for context
      .map(turn => `User: ${turn.userMessage}\nAssistant: ${turn.assistantResponse}`)
      .join('\n\n');

    return `Previous conversation context:
${conversationContext}

Current message: ${currentMessage}

Important: Avoid repeating the same phrases or questions from previous responses. Build on the conversation naturally and provide new insights.`;
  }

  detectRepetitiveResponse(response: string, recentTurns: ConversationTurn[]): boolean {
    if (recentTurns.length === 0) return false;
    
    const recentResponses = recentTurns.slice(-2).map(turn => turn.assistantResponse);
    
    // Check for common repetitive patterns
    const repetitivePatterns = [
      /I hear you,?\s*\w+/gi,
      /Let's explore this together/gi,
      /Can you tell me more about/gi,
      /What thoughts or feelings do you have/gi
    ];
    
    return repetitivePatterns.some(pattern => {
      const currentMatches = response.match(pattern);
      if (!currentMatches) return false;
      
      return recentResponses.some(prevResponse => {
        const prevMatches = prevResponse.match(pattern);
        return prevMatches && prevMatches.length > 0;
      });
    });
  }

  clearCache(): void {
    this.memoryCache.clear();
  }
}

export const conversationMemoryService = new ConversationMemoryService();

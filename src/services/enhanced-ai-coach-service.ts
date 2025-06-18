import { supabase } from "@/integrations/supabase/client";
import { PersonalityEngine } from "./personality-engine";
import { soulSyncService } from "./soul-sync-service";
import { LayeredBlueprint, AgentMode } from "@/types/personality-modules";

export type AgentType = "coach" | "guide" | "blend";

export interface ChatMessage {
  id: string;
  content: string;
  sender: "user" | "assistant";
  timestamp: Date;
  agentType?: AgentType;
}

export interface StreamingResponse {
  onChunk: (chunk: string) => void;
  onComplete: (fullResponse: string) => void;
  onError: (error: Error) => void;
}

class EnhancedAICoachService {
  private sessions: Map<string, string> = new Map();
  private personalityEngine: PersonalityEngine;
  private currentUserId: string | null = null;
  private conversationCache: Map<string, ChatMessage[]> = new Map();
  private blueprintCache: LayeredBlueprint | null = null;

  constructor() {
    this.personalityEngine = new PersonalityEngine();
  }

  async setCurrentUser(userId: string) {
    console.log("🔐 Enhanced AI Coach Service: Setting current user:", userId);
    this.currentUserId = userId;
    // Clear blueprint cache when user changes
    this.blueprintCache = null;
  }

  createNewSession(agentType: AgentType = "guide"): string {
    const sessionId = `session_${agentType}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.sessions.set(sessionId, "");
    console.log(`📅 Enhanced AI Coach Service: Created new session ${sessionId} for ${agentType}`);
    return sessionId;
  }

  updateUserBlueprint(blueprint: Partial<LayeredBlueprint>) {
    console.log("🎭 Enhanced AI Coach Service: Updating user blueprint");
    console.log("🔍 Blueprint data keys:", Object.keys(blueprint));
    this.personalityEngine.updateBlueprint(blueprint);
    
    // Update cached blueprint
    if (this.blueprintCache) {
      this.blueprintCache = { ...this.blueprintCache, ...blueprint };
    } else {
      this.blueprintCache = blueprint as LayeredBlueprint;
    }
  }

  private async getBlueprintFromCache(): Promise<LayeredBlueprint | null> {
    if (this.blueprintCache) {
      return this.blueprintCache;
    }

    if (!this.currentUserId) {
      return null;
    }

    try {
      // Fetch blueprint from database
      const { data, error } = await supabase
        .from('user_blueprints')
        .select('blueprint')
        .eq('user_id', this.currentUserId)
        .eq('is_active', true)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error || !data) {
        console.log("⚠️ No blueprint found in database");
        return null;
      }

      this.blueprintCache = data.blueprint as unknown as LayeredBlueprint;
      return this.blueprintCache;
    } catch (error) {
      console.error("❌ Error fetching blueprint:", error);
      return null;
    }
  }

  private async getOrCreatePersona(usePersona: boolean, agentType: AgentType): Promise<string | null> {
    if (!usePersona || !this.currentUserId) {
      console.log("⚠️ Persona not requested or no user ID available");
      return null;
    }

    try {
      console.log("🎭 SoulSync: Fetching or creating persona...");
      
      const blueprint = await this.getBlueprintFromCache();
      if (!blueprint) {
        console.log("⚠️ SoulSync: No blueprint available, falling back to personality engine");
        return this.personalityEngine.generateSystemPrompt(agentType as AgentMode);
      }

      // Use SoulSync service to get personalized prompt
      const personalizedPrompt = await soulSyncService.getOrCreatePersona(
        this.currentUserId,
        blueprint,
        agentType
      );

      if (personalizedPrompt) {
        console.log("✅ SoulSync: Personalized prompt generated successfully");
        return personalizedPrompt;
      } else {
        console.log("⚠️ SoulSync: Failed to generate persona, falling back");
        return this.personalityEngine.generateSystemPrompt(agentType as AgentMode);
      }
    } catch (error) {
      console.error("❌ SoulSync: Error in persona generation:", error);
      // Fall back to personality engine
      return this.personalityEngine.generateSystemPrompt(agentType as AgentMode);
    }
  }

  async sendMessage(
    message: string,
    sessionId: string,
    usePersona: boolean = false,
    agentType: AgentType = "guide",
    language: string = "en"
  ): Promise<{ response: string; conversationId: string }> {
    try {
      console.log(`📤 Enhanced AI Coach Service: Sending message (${agentType}, SoulSync: ${usePersona})`);
      
      const systemPrompt = await this.getOrCreatePersona(usePersona, agentType);
      
      const { data, error } = await supabase.functions.invoke("ai-coach", {
        body: {
          message,
          sessionId,
          includeBlueprint: usePersona,
          agentType,
          language,
          systemPrompt,
        },
      });

      if (error) throw error;

      return {
        response: data.response,
        conversationId: data.conversationId || sessionId,
      };
    } catch (error) {
      console.error("❌ Enhanced AI Coach Service: Error in sendMessage:", error);
      throw error;
    }
  }

  async sendStreamingMessage(
    message: string,
    sessionId: string,
    usePersona: boolean = false,
    agentType: AgentType = "guide",
    language: string = "en",
    callbacks: StreamingResponse
  ): Promise<void> {
    try {
      console.log(`📡 Enhanced AI Coach Service: Starting streaming (${agentType}, SoulSync: ${usePersona})`);
      
      const systemPrompt = await this.getOrCreatePersona(usePersona, agentType);
      
      const response = await fetch(`https://qxaajirrqrcnmvtowjbg.supabase.co/functions/v1/ai-coach-stream`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF4YWFqaXJycXJjbm12dG93amJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM5NzQ1NDcsImV4cCI6MjA1OTU1MDU0N30.HZRTlihPe3PNQVWxNHCrwjoa9R6Wvo8WOKlQVGunYIw`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          sessionId,
          includeBlueprint: usePersona,
          agentType,
          language,
          systemPrompt,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      if (!response.body) {
        throw new Error('No response body');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullResponse = '';

      try {
        while (true) {
          const { done, value } = await reader.read();
          
          if (done) break;
          
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');
          
          for (const line of lines) {
            if (line.trim() === '') continue;
            
            if (line.startsWith('data: ')) {
              const data = line.slice(6).trim();
              
              if (data === '[DONE]') {
                callbacks.onComplete(fullResponse);
                return;
              }
              
              if (data && data !== '[DONE]') {
                try {
                  const parsed = JSON.parse(data);
                  const content = parsed.choices?.[0]?.delta?.content;
                  
                  if (content) {
                    fullResponse += content;
                    callbacks.onChunk(content);
                  }
                } catch (parseError) {
                  console.log('Skipping non-JSON data:', data);
                }
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
      }
      
      if (fullResponse) {
        callbacks.onComplete(fullResponse);
      }
    } catch (error) {
      console.error("❌ Enhanced AI Coach Service: Error in streaming:", error);
      callbacks.onError(error as Error);
    }
  }

  async loadConversationHistory(agentType: AgentType): Promise<ChatMessage[]> {
    if (!this.currentUserId) {
      console.log("⚠️ No user ID available for conversation history");
      return [];
    }

    const cacheKey = `${this.currentUserId}_${agentType}`;
    
    if (this.conversationCache.has(cacheKey)) {
      return this.conversationCache.get(cacheKey) || [];
    }

    try {
      const { data, error } = await supabase
        .from('conversation_memory')
        .select('messages')
        .eq('user_id', this.currentUserId)
        .eq('mode', agentType)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error("❌ Error loading conversation history:", error);
        return [];
      }

      const messages = data?.messages || [];
      const chatMessages: ChatMessage[] = Array.isArray(messages) 
        ? messages.map((msg: any) => ({
            id: msg.id || `msg_${Date.now()}_${Math.random()}`,
            content: msg.content || '',
            sender: msg.sender || 'user',
            timestamp: new Date(msg.timestamp || Date.now()),
            agentType: agentType,
          }))
        : [];

      this.conversationCache.set(cacheKey, chatMessages);
      return chatMessages;
    } catch (error) {
      console.error("❌ Unexpected error loading conversation history:", error);
      return [];
    }
  }

  async saveConversationHistory(agentType: AgentType, messages: ChatMessage[]): Promise<void> {
    if (!this.currentUserId || messages.length === 0) {
      return;
    }

    const cacheKey = `${this.currentUserId}_${agentType}`;
    this.conversationCache.set(cacheKey, messages);

    try {
      const sessionId = `${this.currentUserId}_${agentType}_session`;
      
      const { error } = await supabase
        .from('conversation_memory')
        .upsert({
          user_id: this.currentUserId,
          session_id: sessionId,
          mode: agentType,
          messages: messages.map(msg => ({
            id: msg.id,
            content: msg.content,
            sender: msg.sender,
            timestamp: msg.timestamp.toISOString(),
            agentType: msg.agentType,
          })),
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id,session_id'
        });

      if (error) {
        console.error("❌ Error saving conversation history:", error);
      }
    } catch (error) {
      console.error("❌ Unexpected error saving conversation history:", error);
    }
  }

  clearConversationCache() {
    this.conversationCache.clear();
    this.blueprintCache = null;
    console.log("🧹 Enhanced AI Coach Service: Conversation cache cleared");
  }
}

export const enhancedAICoachService = new EnhancedAICoachService();

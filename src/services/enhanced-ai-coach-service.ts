import { supabase } from "@/integrations/supabase/client";
import { PersonalityEngine } from "./personality-engine";
import { soulSyncService } from "./soul-sync-service";
import { createBlueprintFilter } from "./blueprint-personality-filter";
import { UnifiedBlueprintService } from "./unified-blueprint-service";
import { LayeredBlueprint, AgentMode } from "@/types/personality-modules";
import { memoryInformedConversationService } from "./memory-informed-conversation-service";

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
    this.blueprintCache = null;
  }

  createNewSession(agentType: AgentType = "guide"): string {
    const sessionId = `session_${agentType}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.sessions.set(sessionId, "");
    console.log(`📅 Enhanced AI Coach Service: Created new session ${sessionId} for ${agentType}`);
    return sessionId;
  }

  updateUserBlueprint(blueprint: Partial<LayeredBlueprint>) {
    console.log("🎭 Enhanced AI Coach Service: Updating user blueprint with validation");
    
    if (this.blueprintCache) {
      this.blueprintCache = { ...this.blueprintCache, ...blueprint };
    } else {
      this.blueprintCache = blueprint as LayeredBlueprint;
    }

    const validation = UnifiedBlueprintService.validateBlueprint(this.blueprintCache);
    console.log("📊 Blueprint validation result:", validation);
    
    this.personalityEngine.updateBlueprint(blueprint);
  }

  private async getBlueprintFromCache(): Promise<LayeredBlueprint | null> {
    if (this.blueprintCache) {
      return this.blueprintCache;
    }

    if (!this.currentUserId) {
      console.log("⚠️ No user ID available for blueprint cache");
      return null;
    }

    try {
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
      console.log("✅ Blueprint loaded from database cache");
      return this.blueprintCache;
    } catch (error) {
      console.error("❌ Error fetching blueprint:", error);
      return null;
    }
  }

  private async getOrCreatePersona(usePersona: boolean, agentType: AgentType, userMessage?: string): Promise<string | null> {
    if (!usePersona || !this.currentUserId) {
      console.log("⚠️ Persona not requested or no user ID available");
      return null;
    }

    try {
      console.log("🎭 SoulSync: Fetching or creating comprehensive persona with memory context...");
      
      const blueprint = await this.getBlueprintFromCache();
      if (!blueprint) {
        console.log("⚠️ SoulSync: No blueprint available, using basic personality engine");
        return this.personalityEngine.generateSystemPrompt(agentType as AgentMode);
      }

      const validation = UnifiedBlueprintService.validateBlueprint(blueprint);
      console.log("📊 Blueprint validation for persona generation:", validation);

      if (!validation.isComplete) {
        console.log("⚠️ Blueprint incomplete, but proceeding with available data");
      }

      let comprehensivePrompt = UnifiedBlueprintService.formatBlueprintForAI(blueprint, agentType);
      
      // ENHANCED MEMORY INTEGRATION: Always try to enhance with memory context
      if (userMessage && this.currentUserId) {
        console.log("🧠 Integrating memory context into persona generation");
        const sessionId = Array.from(this.sessions.keys()).find(key => key.includes(this.currentUserId!)) || 'default';
        
        try {
          const memoryContext = await memoryInformedConversationService.buildMemoryContext(
            userMessage,
            sessionId,
            this.currentUserId
          );
          
          console.log('📖 Memory context retrieved:', {
            memoriesFound: memoryContext.relevantMemories.length,
            searchQuery: memoryContext.memorySearchQuery,
            contextSummary: memoryContext.contextSummary.substring(0, 100)
          });
          
          comprehensivePrompt = await memoryInformedConversationService.enhanceSystemPromptWithMemory(
            comprehensivePrompt,
            memoryContext,
            userMessage
          );
          
          console.log("✅ Memory context successfully integrated into persona");
        } catch (error) {
          console.error("❌ Error integrating memory context:", error);
          // Continue with basic prompt if memory integration fails
        }
      } else {
        console.log("⚠️ No user message provided for memory context integration");
      }
      
      console.log("✅ SoulSync: Comprehensive persona ready with full blueprint and memory context");
      return comprehensivePrompt;
    } catch (error) {
      console.error("❌ SoulSync: Error in persona generation:", error);
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
      console.log(`📤 Enhanced AI Coach Service: Sending message with memory integration (${agentType}, Full Blueprint: ${usePersona})`);
      
      const systemPrompt = await this.getOrCreatePersona(usePersona, agentType, message);
      
      if (systemPrompt && usePersona) {
        console.log("🎯 Using comprehensive blueprint and memory context in message");
      }
      
      const { data, error } = await supabase.functions.invoke("ai-coach", {
        body: {
          message,
          sessionId,
          includeBlueprint: usePersona,
          agentType,
          language,
          systemPrompt,
          maxTokens: 4000,
        },
      });

      if (error) throw error;

      // ENHANCED MEMORY TRACKING: Track memory application after successful response
      if (usePersona && this.currentUserId) {
        try {
          const memoryContext = await memoryInformedConversationService.buildMemoryContext(
            message,
            sessionId,
            this.currentUserId
          );
          
          await memoryInformedConversationService.trackMemoryApplication(
            sessionId,
            memoryContext,
            message,
            data.response
          );
          
          console.log("✅ Memory application tracked successfully");
        } catch (error) {
          console.error("❌ Error tracking memory application:", error);
        }
      }

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
      console.log(`📡 Enhanced AI Coach Service: Starting streaming with memory integration (${agentType}, Full Blueprint: ${usePersona})`);
      
      const systemPrompt = await this.getOrCreatePersona(usePersona, agentType, message);
      
      const blueprint = usePersona ? await this.getBlueprintFromCache() : null;
      const blueprintFilter = blueprint ? createBlueprintFilter(blueprint) : null;
      
      if (systemPrompt && usePersona) {
        console.log("🎯 Using comprehensive blueprint and memory context in streaming");
        const validation = UnifiedBlueprintService.validateBlueprint(blueprint);
        console.log("📊 Blueprint completeness for streaming:", validation.completionPercentage + "%");
      }
      
      const response = await fetch(`https://qxaajirrqrcnmvtowjbg.supabase.co/functions/v1/ai-coach-stream`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF4YWFqaXJycXJjbm12dG93amJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE0NDE5NzQ1NDcsImV4cCI6MjA1OTU1MDU0N30.HZRTlihPe3PNQVWxNHCrwjoa9R6Wvo8WOKlQVGunYIw`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          sessionId,
          includeBlueprint: usePersona,
          agentType,
          language,
          systemPrompt,
          enableBlueprintFiltering: !!blueprintFilter,
          maxTokens: 4000,
          temperature: 0.7
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
                if (blueprintFilter && fullResponse) {
                  console.log("🎭 Applying blueprint personality filter to complete response");
                  const filtered = blueprintFilter.filterResponse(fullResponse, message);
                  
                  if (filtered.content !== fullResponse && filtered.personalTouches.length > 0) {
                    console.log("✨ Blueprint filter enhanced response with:", filtered.personalTouches);
                    callbacks.onComplete(filtered.content);
                    
                    // Track memory application after successful response
                    if (usePersona && this.currentUserId) {
                      try {
                        const memoryContext = await memoryInformedConversationService.buildMemoryContext(
                          message,
                          sessionId,
                          this.currentUserId
                        );
                        
                        await memoryInformedConversationService.trackMemoryApplication(
                          sessionId,
                          memoryContext,
                          message,
                          filtered.content
                        );
                      } catch (error) {
                        console.error("❌ Error tracking memory application:", error);
                      }
                    }
                    return;
                  }
                }
                
                console.log(`📏 Final response length: ${fullResponse.length} characters`);
                callbacks.onComplete(fullResponse);
                
                // ENHANCED MEMORY TRACKING: Track memory application after successful response
                if (usePersona && this.currentUserId) {
                  try {
                    const memoryContext = await memoryInformedConversationService.buildMemoryContext(
                      message,
                      sessionId,
                      this.currentUserId
                    );
                    
                    await memoryInformedConversationService.trackMemoryApplication(
                      sessionId,
                      memoryContext,
                      message,
                      fullResponse
                    );
                    
                    console.log("✅ Memory application tracked for streaming response");
                  } catch (error) {
                    console.error("❌ Error tracking memory application:", error);
                  }
                }
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
        if (blueprintFilter) {
          const filtered = blueprintFilter.filterResponse(fullResponse, message);
          if (filtered.content !== fullResponse) {
            callbacks.onComplete(filtered.content);
            return;
          }
        }
        console.log(`📏 Final response length: ${fullResponse.length} characters`);
        callbacks.onComplete(fullResponse);
      }
    } catch (error) {
      console.error("❌ Enhanced AI Coach Service: Error in comprehensive streaming:", error);
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
    memoryInformedConversationService.clearCache();
    console.log("🧹 Enhanced AI Coach Service: All caches cleared");
  }

  async getBlueprintStatus(): Promise<{ isAvailable: boolean; completionPercentage: number; summary: string }> {
    const blueprint = await this.getBlueprintFromCache();
    
    if (!blueprint) {
      return {
        isAvailable: false,
        completionPercentage: 0,
        summary: 'No blueprint data available'
      };
    }

    const validation = UnifiedBlueprintService.validateBlueprint(blueprint);
    const summary = UnifiedBlueprintService.extractBlueprintSummary(blueprint);

    return {
      isAvailable: validation.isComplete,
      completionPercentage: validation.completionPercentage,
      summary
    };
  }
}

export const enhancedAICoachService = new EnhancedAICoachService();

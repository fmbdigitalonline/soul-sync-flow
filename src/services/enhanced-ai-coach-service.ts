import { supabase } from "@/integrations/supabase/client";
import { PersonalityEngine } from "./personality-engine";
import { LayeredBlueprint, AgentMode } from "@/types/personality-modules";
import { PersonaService, UserPersona } from "./persona-service";

export type AgentType = "coach" | "guide" | "blend";

export interface ChatMessage {
  id: string;
  content: string;
  sender: "user" | "assistant";
  timestamp: Date;
}

export interface ConversationMemory {
  id: string;
  user_id: string;
  session_id: string;
  mode: string;
  messages: ChatMessage[];
  created_at: string;
  updated_at: string;
}

export interface StreamingResponse {
  onChunk: (chunk: string) => void;
  onComplete: (fullResponse: string) => void;
  onError: (error: Error) => void;
}

// Type guard functions
function isValidChatMessage(obj: any): obj is ChatMessage {
  return obj && 
    typeof obj.id === 'string' && 
    typeof obj.content === 'string' && 
    (obj.sender === 'user' || obj.sender === 'assistant');
}

function parseChatMessages(jsonData: any): ChatMessage[] {
  if (!Array.isArray(jsonData)) return [];
  
  return jsonData.filter(isValidChatMessage).map(msg => ({
    ...msg,
    timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date()
  }));
}

function parseJsonArray(jsonData: any): any[] {
  if (Array.isArray(jsonData)) return jsonData;
  if (jsonData === null || jsonData === undefined) return [];
  return [];
}

function getMoodFromEntry(entry: any): string {
  if (entry && typeof entry === 'object' && 'mood' in entry) {
    return String(entry.mood);
  }
  return 'Unknown';
}

class EnhancedAICoachService {
  private sessions: Map<string, string> = new Map();
  private personalityEngine: PersonalityEngine;
  private conversationCache: Map<string, ChatMessage[]> = new Map();
  private currentUserId: string | null = null;
  private userPersonaCache: Map<string, any> = new Map();

  constructor() {
    this.personalityEngine = new PersonalityEngine();
  }

  createNewSession(mode: AgentType = "guide"): string {
    const sessionId = `session_${mode}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.sessions.set(sessionId, mode);
    return sessionId;
  }

  updateUserBlueprint(blueprint: Partial<LayeredBlueprint>) {
    console.log("🎭 Enhanced AI Coach: Updating user blueprint and triggering persona regeneration");
    console.log("🔍 SERVICE Blueprint Debug:", {
      hasCognitiveData: !!blueprint.cognitiveTemperamental,
      mbtiType: blueprint.cognitiveTemperamental?.mbtiType,
      hasEnergyData: !!blueprint.energyDecisionStrategy,
      humanDesignType: blueprint.energyDecisionStrategy?.humanDesignType,
      hasValuesData: !!blueprint.coreValuesNarrative,
      actualMissionStatement: blueprint.coreValuesNarrative?.missionStatement,
      userName: blueprint.user_meta?.preferred_name,
      sunSign: blueprint.publicArchetype?.sunSign,
      hasRealPersonalityData: !!(blueprint.cognitiveTemperamental?.mbtiType !== "Unknown" || 
                                 blueprint.publicArchetype?.sunSign !== "Unknown")
    });
    
    console.log("🎯 SERVICE DETAILED VERIFICATION:");
    console.log("- Current User ID:", this.currentUserId);
    console.log("- MBTI Type:", blueprint.cognitiveTemperamental?.mbtiType);
    console.log("- Sun Sign:", blueprint.publicArchetype?.sunSign);
    console.log("- User Name:", blueprint.user_meta?.preferred_name);
    console.log("- Has Real Data:", blueprint.cognitiveTemperamental?.mbtiType !== "Unknown");
    
    this.personalityEngine.updateBlueprint(blueprint);
    
    // Clear persona cache to force regeneration
    if (this.currentUserId) {
      this.userPersonaCache.delete(this.currentUserId);
      console.log("🔄 Cleared persona cache for user:", this.currentUserId);
    }
    
    console.log("✅ Enhanced AI Coach: Blueprint updated successfully");
  }

  async setCurrentUser(userId: string) {
    console.log("👤 Enhanced AI Coach SERVICE: Setting current user:", userId);
    this.currentUserId = userId;
    this.personalityEngine.setUserId(userId);
    
    // Pre-load user's persona if available
    try {
      const existingPersona = await PersonaService.getUserPersona(userId);
      if (existingPersona) {
        this.userPersonaCache.set(userId, existingPersona);
        console.log("✅ Enhanced AI Coach SERVICE: Pre-loaded existing persona for user");
      } else {
        console.log("ℹ️ Enhanced AI Coach SERVICE: No existing persona found for user");
      }
    } catch (error) {
      console.warn("⚠️ Enhanced AI Coach SERVICE: Could not pre-load persona:", error);
    }
  }

  async generatePersonalizedSystemPrompt(agentType: AgentType): Promise<string | null> {
    if (!this.currentUserId) {
      console.warn("⚠️ Enhanced AI Coach SERVICE: No user ID available for persona generation");
      return null;
    }

    try {
      console.log("🎭 Enhanced AI Coach SERVICE: Generating personalized system prompt for", agentType);
      console.log("🔍 Current User ID:", this.currentUserId);
      
      // Check cache first
      const cacheKey = `${this.currentUserId}_${agentType}`;
      if (this.userPersonaCache.has(cacheKey)) {
        const cachedPersona = this.userPersonaCache.get(cacheKey);
        console.log("⚡ Enhanced AI Coach SERVICE: Using cached persona");
        console.log("📋 Cached prompt preview:", cachedPersona.systemPrompt?.substring(0, 300) + "...");
        return cachedPersona.systemPrompt;
      }

      // Generate or retrieve persona
      console.log("🔧 Calling personalityEngine.getOrGeneratePersona...");
      const persona = await this.personalityEngine.getOrGeneratePersona(agentType as AgentMode);
      
      if (persona && persona.systemPrompt) {
        // Cache the persona
        this.userPersonaCache.set(cacheKey, persona);
        console.log("✅ Enhanced AI Coach SERVICE: Generated personalized system prompt:", {
          promptLength: persona.systemPrompt.length,
          agentType,
          userId: this.currentUserId,
          hasRealPersonalityData: persona.systemPrompt.includes('MBTI') || persona.systemPrompt.includes('Sun sign'),
          containsUserName: persona.systemPrompt.includes(this.personalityEngine.getUserFirstName() || 'user')
        });
        console.log("🔍 SERVICE System Prompt Preview (first 500 chars):", persona.systemPrompt.substring(0, 500) + "...");
        
        // Test personas table access
        try {
          console.log("🔧 Testing personas table access by attempting to save persona...");
          const userPersona: Partial<UserPersona> = {
            user_id: this.currentUserId,
            system_prompt: persona.systemPrompt,
            voice_tokens: persona.voiceTokens,
            humor_profile: persona.humorProfile,
            function_permissions: persona.functionPermissions,
            blueprint_version: '1.0.0'
          };
          const saved = await PersonaService.saveUserPersona(userPersona);
          if (saved) {
            console.log("✅ Personas table access working - saved persona successfully");
          } else {
            console.error("❌ Failed to save persona to database - RLS might still be blocking");
          }
        } catch (saveError) {
          console.error("❌ Error testing personas table access:", saveError);
        }
        
        return persona.systemPrompt;
      }

      console.warn("⚠️ Enhanced AI Coach SERVICE: Failed to generate persona, falling back to default");
      return null;
    } catch (error) {
      console.error("❌ Enhanced AI Coach SERVICE: Error generating personalized system prompt:", error);
      return null;
    }
  }

  async loadConversationHistory(mode: AgentType): Promise<ChatMessage[]> {
    const cacheKey = `conversation_${mode}`;
    
    if (this.conversationCache.has(cacheKey)) {
      return this.conversationCache.get(cacheKey) || [];
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('conversation_memory')
        .select('*')
        .eq('user_id', user.id)
        .eq('mode', mode)
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading conversation history:', error);
        return [];
      }

      const messages = parseChatMessages(data?.messages);
      this.conversationCache.set(cacheKey, messages);
      return messages;
    } catch (error) {
      console.error('Error in loadConversationHistory:', error);
      return [];
    }
  }

  async saveConversationHistory(mode: AgentType, messages: ChatMessage[]): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const cacheKey = `conversation_${mode}`;
      this.conversationCache.set(cacheKey, messages);

      const { data: existingConversation } = await supabase
        .from('conversation_memory')
        .select('id')
        .eq('user_id', user.id)
        .eq('mode', mode)
        .single();

      if (existingConversation) {
        const { error } = await supabase
          .from('conversation_memory')
          .update({
            messages: messages as any,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingConversation.id);

        if (error) {
          console.error('Error updating conversation:', error);
        }
      } else {
        const sessionId = this.createNewSession(mode);
        const { error } = await supabase
          .from('conversation_memory')
          .insert({
            user_id: user.id,
            session_id: sessionId,
            mode,
            messages: messages as any
          });

        if (error) {
          console.error('Error creating conversation:', error);
        }
      }
    } catch (error) {
      console.error('Error in saveConversationHistory:', error);
    }
  }

  async getJourneyContext(mode: AgentType): Promise<string> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return "";

      let contextString = "";

      if (mode === "blend") {
        const [productivityResult, growthResult] = await Promise.all([
          supabase.from('productivity_journey').select('*').eq('user_id', user.id).single(),
          supabase.from('growth_journey').select('*').eq('user_id', user.id).single()
        ]);

        if (productivityResult.data) {
          const productivity = productivityResult.data;
          const currentGoals = parseJsonArray(productivity.current_goals);
          const completedGoals = parseJsonArray(productivity.completed_goals);
          const currentTasks = parseJsonArray(productivity.current_tasks);
          const completedTasks = parseJsonArray(productivity.completed_tasks);
          const focusSessions = parseJsonArray(productivity.focus_sessions);
          
          contextString += `\nProductivity Journey Context:
- Current Position: ${productivity.current_position}
- Active Goals: ${currentGoals.length}
- Completed Goals: ${completedGoals.length}
- Current Tasks: ${currentTasks.length}
- Completed Tasks: ${completedTasks.length}
- Focus Sessions: ${focusSessions.length}
- Last Activity: ${productivity.last_activity_date}`;
        }

        if (growthResult.data) {
          const growth = growthResult.data;
          const moodEntries = parseJsonArray(growth.mood_entries);
          const reflectionEntries = parseJsonArray(growth.reflection_entries);
          const insightEntries = parseJsonArray(growth.insight_entries);
          const currentFocusAreas = parseJsonArray(growth.current_focus_areas);
          
          contextString += `\nGrowth Journey Context:
- Current Position: ${growth.current_position}
- Recent Moods: ${moodEntries.slice(-3).map(e => getMoodFromEntry(e)).join(', ') || 'None'}
- Reflection Entries: ${reflectionEntries.length}
- Insight Entries: ${insightEntries.length}
- Focus Areas: ${currentFocusAreas.join(', ') || 'None'}
- Last Reflection: ${growth.last_reflection_date}`;
        }
      } else if (mode === "coach") {
        const { data } = await supabase
          .from('productivity_journey')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (data) {
          const currentGoals = parseJsonArray(data.current_goals);
          const currentTasks = parseJsonArray(data.current_tasks);
          const focusSessions = parseJsonArray(data.focus_sessions);
          
          contextString = `\nProductivity Context:
- Current Position: ${data.current_position}
- Active Goals: ${currentGoals.length}
- Current Tasks: ${currentTasks.length}
- Recent Focus Sessions: ${focusSessions.slice(-5).length}`;
        }
      } else if (mode === "guide") {
        const { data } = await supabase
          .from('growth_journey')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (data) {
          const moodEntries = parseJsonArray(data.mood_entries);
          const currentFocusAreas = parseJsonArray(data.current_focus_areas);
          const insightEntries = parseJsonArray(data.insight_entries);
          
          contextString = `\nGrowth Context:
- Current Position: ${data.current_position}
- Recent Mood: ${moodEntries.slice(-1).map(e => getMoodFromEntry(e))[0] || 'Unknown'}
- Focus Areas: ${currentFocusAreas.join(', ') || 'None'}
- Recent Insights: ${insightEntries.slice(-3).length}`;
        }
      }

      return contextString;
    } catch (error) {
      console.error('Error getting journey context:', error);
      return "";
    }
  }

  async sendMessage(
    message: string,
    sessionId: string,
    includeBlueprint: boolean = false,
    agentType: AgentType = "guide",
    language: string = "en"
  ): Promise<{ response: string; conversationId: string }> {
    try {
      console.log("📤 Enhanced AI Coach SERVICE: Sending message with persona integration");
      console.log("🔍 SERVICE Message Debug:", {
        includeBlueprint,
        agentType,
        currentUserId: this.currentUserId,
        hasCurrentUser: !!this.currentUserId
      });
      
      const journeyContext = await this.getJourneyContext(agentType);
      
      // Get personalized system prompt using the enhanced persona system
      let systemPrompt: string | null = null;
      
      if (includeBlueprint && this.currentUserId) {
        console.log("🎭 SERVICE: Attempting to generate personalized system prompt...");
        systemPrompt = await this.generatePersonalizedSystemPrompt(agentType);
        console.log("📋 SERVICE: System prompt generated:", {
          hasSystemPrompt: !!systemPrompt,
          systemPromptLength: systemPrompt?.length || 0,
          agentType,
          containsPersonality: systemPrompt?.includes('MBTI') || systemPrompt?.includes('Sun sign'),
          promptStart: systemPrompt?.substring(0, 100) + "..."
        });
      } else {
        console.log("⚠️ SERVICE: Skipping persona generation:", {
          includeBlueprint,
          hasCurrentUserId: !!this.currentUserId
        });
      }

      console.log("📋 Enhanced AI Coach SERVICE: Context prepared:", {
        hasSystemPrompt: !!systemPrompt,
        systemPromptLength: systemPrompt?.length || 0,
        journeyContextLength: journeyContext.length,
        agentType,
        userId: this.currentUserId
      });

      const { data, error } = await supabase.functions.invoke("ai-coach", {
        body: {
          message,
          sessionId,
          includeBlueprint,
          agentType,
          language,
          systemPrompt,
          journeyContext,
        },
      });

      if (error) throw error;

      console.log("✅ Enhanced AI Coach SERVICE: Message sent successfully");
      return {
        response: data.response,
        conversationId: data.conversationId || sessionId,
      };
    } catch (error) {
      console.error("❌ Enhanced AI Coach SERVICE: Error in sendMessage:", error);
      throw error;
    }
  }

  async sendStreamingMessage(
    message: string,
    sessionId: string,
    includeBlueprint: boolean = false,
    agentType: AgentType = "guide",
    language: string = "en",
    callbacks: StreamingResponse
  ): Promise<void> {
    try {
      console.log('📡 Enhanced AI Coach SERVICE: Starting streaming request with persona integration', {
        agentType,
        messageLength: message.length,
        includeBlueprint,
        hasUserId: !!this.currentUserId,
        currentUserId: this.currentUserId
      });
      
      const journeyContext = await this.getJourneyContext(agentType);
      
      // Get personalized system prompt using the enhanced persona system
      let systemPrompt: string | null = null;
      
      if (includeBlueprint && this.currentUserId) {
        console.log("🎭 SERVICE STREAMING: Attempting to generate personalized system prompt...");
        systemPrompt = await this.generatePersonalizedSystemPrompt(agentType);
        console.log("📋 SERVICE STREAMING: System prompt generated:", {
          hasSystemPrompt: !!systemPrompt,
          systemPromptLength: systemPrompt?.length || 0,
          agentType,
          containsPersonality: systemPrompt?.includes('MBTI') || systemPrompt?.includes('Sun sign'),
          promptStart: systemPrompt?.substring(0, 100) + "..."
        });
      } else {
        console.log("⚠️ SERVICE STREAMING: Skipping persona generation:", {
          includeBlueprint,
          hasCurrentUserId: !!this.currentUserId
        });
      }

      console.log("📋 Enhanced AI Coach SERVICE STREAMING: Context prepared:", {
        hasSystemPrompt: !!systemPrompt,
        systemPromptLength: systemPrompt?.length || 0,
        journeyContextLength: journeyContext.length,
        willSendPersonalizedPrompt: !!systemPrompt
      });
      
      const response = await fetch(`https://qxaajirrqrcnmvtowjbg.supabase.co/functions/v1/ai-coach-stream`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF4YWFqaXJycXJjbm12dG93amJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM5NzQ1NDcsImV4cCI6MjA1OTU1MDU0N30.HZRTlihPe3PNQVWxNHCrwjoa9R6Wvo8WOKlQVGunYIw`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          sessionId,
          includeBlueprint,
          agentType,
          language,
          systemPrompt,
          journeyContext,
        }),
      });

      console.log('📡 Enhanced AI Coach SERVICE: Edge function response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Enhanced AI Coach SERVICE: Edge function error:', response.status, errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      if (!response.body) {
        throw new Error('No response body from edge function');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullResponse = '';
      let buffer = '';

      console.log('📡 Enhanced AI Coach SERVICE: Starting to read stream...');

      try {
        while (true) {
          const { done, value } = await reader.read();
          
          if (done) {
            console.log('✅ Enhanced AI Coach SERVICE: Stream reading completed');
            break;
          }
          
          const chunk = decoder.decode(value, { stream: true });
          buffer += chunk;
          
          // Process complete lines
          const lines = buffer.split('\n');
          buffer = lines.pop() || ''; // Keep incomplete line in buffer
          
          for (const line of lines) {
            if (line.trim() === '') continue;
            
            if (line.startsWith('data: ')) {
              const data = line.slice(6).trim();
              
              if (data === '[DONE]') {
                console.log('✅ Enhanced AI Coach SERVICE: Received [DONE], completing stream');
                console.log('🎯 FINAL RESPONSE ANALYSIS:', {
                  responseLength: fullResponse.length,
                  hasPersonalizedContent: fullResponse.includes('MBTI') || fullResponse.includes('Sun sign') || fullResponse.includes('ENFP') || fullResponse.includes('Projector'),
                  isGeneric: fullResponse.includes('powerful soul') || fullResponse.includes('Feurion') && fullResponse.includes('powerful soul'),
                  responsePreview: fullResponse.substring(0, 200)
                });
                callbacks.onComplete(fullResponse);
                return;
              }
              
              if (data && data !== '[DONE]') {
                try {
                  const parsed = JSON.parse(data);
                  
                  if (parsed.error) {
                    console.error('❌ Enhanced AI Coach SERVICE: Error from stream:', parsed);
                    throw new Error(parsed.message || 'Stream error');
                  }
                  
                  const content = parsed.choices?.[0]?.delta?.content;
                  
                  if (content) {
                    fullResponse += content;
                    callbacks.onChunk(content);
                  }
                } catch (parseError) {
                  // Skip non-JSON data silently - could be connection keep-alive
                  console.log('📡 Enhanced AI Coach SERVICE: Skipping non-JSON chunk:', data.substring(0, 50));
                }
              }
            }
          }
        }
        
        // If we exit the loop without receiving [DONE], complete with what we have
        if (fullResponse) {
          console.log('✅ Enhanced AI Coach SERVICE: Stream completed naturally, total response length:', fullResponse.length);
          callbacks.onComplete(fullResponse);
        } else {
          console.warn('⚠️ Enhanced AI Coach SERVICE: Stream ended with no content');
          callbacks.onError(new Error('Stream ended with no content'));
        }
      } finally {
        reader.releaseLock();
      }
    } catch (error) {
      console.error("❌ Enhanced AI Coach SERVICE: Streaming error:", error);
      callbacks.onError(error as Error);
    }
  }

  clearConversationCache() {
    this.conversationCache.clear();
    this.userPersonaCache.clear();
    console.log("🧹 Enhanced AI Coach SERVICE: Cleared all caches");
  }
}

export const enhancedAICoachService = new EnhancedAICoachService();


import { supabase } from "@/integrations/supabase/client";
import { PersonalityEngine } from "./personality-engine";
import { LayeredBlueprint, AgentMode } from "@/types/personality-modules";

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

  constructor() {
    this.personalityEngine = new PersonalityEngine();
  }

  createNewSession(mode: AgentType = "guide"): string {
    const sessionId = `session_${mode}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.sessions.set(sessionId, mode);
    return sessionId;
  }

  updateUserBlueprint(blueprint: Partial<LayeredBlueprint>) {
    this.personalityEngine.updateBlueprint(blueprint);
    console.log("Updated user blueprint in enhanced AI coach service:", blueprint);
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
      const journeyContext = await this.getJourneyContext(agentType);
      
      const systemPrompt = includeBlueprint 
        ? this.personalityEngine.generateSystemPrompt(agentType as AgentMode)
        : null;

      console.log("Generated personalized system prompt length:", systemPrompt?.length || 0);
      console.log("Journey context length:", journeyContext.length);

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

      return {
        response: data.response,
        conversationId: data.conversationId || sessionId,
      };
    } catch (error) {
      console.error("Error in enhanced AI coach service:", error);
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
      console.log('Starting enhanced streaming request...');
      
      const journeyContext = await this.getJourneyContext(agentType);
      const systemPrompt = includeBlueprint 
        ? this.personalityEngine.generateSystemPrompt(agentType as AgentMode)
        : null;

      console.log("Generated personalized system prompt for streaming, length:", systemPrompt?.length || 0);
      console.log("Journey context for streaming, length:", journeyContext.length);
      
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
      console.error("Error in enhanced streaming AI coach service:", error);
      callbacks.onError(error as Error);
    }
  }

  clearConversationCache() {
    this.conversationCache.clear();
  }
}

export const enhancedAICoachService = new EnhancedAICoachService();

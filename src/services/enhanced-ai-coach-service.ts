
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
    
    // Check cache first
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

      const messages = data?.messages || [];
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

      // Check if conversation exists
      const { data: existingConversation } = await supabase
        .from('conversation_memory')
        .select('id')
        .eq('user_id', user.id)
        .eq('mode', mode)
        .single();

      if (existingConversation) {
        // Update existing conversation
        const { error } = await supabase
          .from('conversation_memory')
          .update({
            messages,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingConversation.id);

        if (error) {
          console.error('Error updating conversation:', error);
        }
      } else {
        // Create new conversation
        const sessionId = this.createNewSession(mode);
        const { error } = await supabase
          .from('conversation_memory')
          .insert({
            user_id: user.id,
            session_id: sessionId,
            mode,
            messages
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

      if (mode === "blend" || mode === "coach") {
        // Get both productivity and growth journey data for Soul Companion
        const [productivityResult, growthResult] = await Promise.all([
          supabase.from('productivity_journey').select('*').eq('user_id', user.id).single(),
          supabase.from('growth_journey').select('*').eq('user_id', user.id).single()
        ]);

        if (productivityResult.data) {
          const productivity = productivityResult.data;
          contextString += `\nProductivity Journey Context:
- Current Position: ${productivity.current_position}
- Active Goals: ${productivity.current_goals?.length || 0}
- Completed Goals: ${productivity.completed_goals?.length || 0}
- Current Tasks: ${productivity.current_tasks?.length || 0}
- Completed Tasks: ${productivity.completed_tasks?.length || 0}
- Focus Sessions: ${productivity.focus_sessions?.length || 0}
- Last Activity: ${productivity.last_activity_date}`;
        }

        if (growthResult.data) {
          const growth = growthResult.data;
          contextString += `\nGrowth Journey Context:
- Current Position: ${growth.current_position}
- Recent Moods: ${growth.mood_entries?.slice(-3).map(e => e.mood).join(', ') || 'None'}
- Reflection Entries: ${growth.reflection_entries?.length || 0}
- Insight Entries: ${growth.insight_entries?.length || 0}
- Focus Areas: ${growth.current_focus_areas?.join(', ') || 'None'}
- Last Reflection: ${growth.last_reflection_date}`;
        }
      } else if (mode === "coach") {
        // Get productivity-specific context
        const { data } = await supabase
          .from('productivity_journey')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (data) {
          contextString = `\nProductivity Context:
- Current Position: ${data.current_position}
- Active Goals: ${data.current_goals?.length || 0}
- Current Tasks: ${data.current_tasks?.length || 0}
- Recent Focus Sessions: ${data.focus_sessions?.slice(-5).length || 0}`;
        }
      } else if (mode === "guide") {
        // Get growth-specific context
        const { data } = await supabase
          .from('growth_journey')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (data) {
          contextString = `\nGrowth Context:
- Current Position: ${data.current_position}
- Recent Mood: ${data.mood_entries?.slice(-1)[0]?.mood || 'Unknown'}
- Focus Areas: ${data.current_focus_areas?.join(', ') || 'None'}
- Recent Insights: ${data.insight_entries?.slice(-3).length || 0}`;
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
      // Get journey context for enhanced responses
      const journeyContext = await this.getJourneyContext(agentType);
      
      // Generate personalized system prompt using the personality engine
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
          journeyContext, // Include journey context
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

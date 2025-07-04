
import { supabase } from "@/integrations/supabase/client";
import { PersonalityEngine } from "./personality-engine";
import { LayeredBlueprint, AgentMode } from "@/types/personality-modules";
import { unifiedBrainService } from "./unified-brain-service";

export type AgentType = "coach" | "guide" | "blend";

export interface ChatMessage {
  id: string;
  content: string;
  sender: "user" | "assistant";
  timestamp: Date;
}

export interface StreamingResponse {
  onChunk: (chunk: string) => void;
  onComplete: (fullResponse: string) => void;
  onError: (error: Error) => void;
}

class AICoachService {
  private sessions: Map<string, string> = new Map();
  private personalityEngine: PersonalityEngine;
  private useUnifiedBrain: boolean = true;

  constructor() {
    this.personalityEngine = new PersonalityEngine();
  }

  createNewSession(): string {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.sessions.set(sessionId, "");
    return sessionId;
  }

  updateUserBlueprint(blueprint: Partial<LayeredBlueprint>) {
    this.personalityEngine.updateBlueprint(blueprint);
    console.log("Updated user blueprint in AI coach service:", blueprint);
  }

  enableUnifiedBrain(enabled: boolean = true) {
    this.useUnifiedBrain = enabled;
    console.log(`🧠 Unified brain ${enabled ? 'enabled' : 'disabled'} in AI coach service`);
  }

  async sendMessage(
    message: string,
    sessionId: string,
    includeBlueprint: boolean = false,
    agentType: AgentType = "guide",
    language: string = "en"
  ): Promise<{ response: string; conversationId: string }> {
    try {
      // Try unified brain first if enabled
      if (this.useUnifiedBrain) {
        try {
          const brainResponse = await unifiedBrainService.processMessage(
            message,
            sessionId,
            agentType as AgentMode
          );
          
          return {
            response: brainResponse.response,
            conversationId: sessionId,
          };
        } catch (brainError) {
          console.warn("🧠 Unified brain failed, falling back to regular coach:", brainError);
          // Fall through to regular processing
        }
      }

      // Fallback to regular AI coach processing
      const systemPrompt = includeBlueprint 
        ? (agentType === "guide" 
            ? this.personalityEngine.generateSystemPrompt("guide", message)
            : this.personalityEngine.generateSystemPrompt(agentType as AgentMode))
        : null;

      console.log("Using regular AI coach service, prompt length:", systemPrompt?.length || 0);

      const { data, error } = await supabase.functions.invoke("ai-coach", {
        body: {
          message,
          sessionId,
          includeBlueprint,
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
      console.error("Error in AI coach service:", error);
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
      console.log('Starting streaming request...');
      
      // Try unified brain first if enabled
      if (this.useUnifiedBrain) {
        try {
          const brainResponse = await unifiedBrainService.processMessage(
            message,
            sessionId,
            agentType as AgentMode
          );
          
          // Simulate streaming for unified brain response
          const words = brainResponse.response.split(' ');
          for (const word of words) {
            callbacks.onChunk(word + ' ');
            await new Promise(resolve => setTimeout(resolve, 50)); // Small delay for streaming effect
          }
          callbacks.onComplete(brainResponse.response);
          return;
        } catch (brainError) {
          console.warn("🧠 Unified brain streaming failed, falling back:", brainError);
          // Fall through to regular streaming
        }
      }
      
      // Fallback to regular streaming
      const systemPrompt = includeBlueprint 
        ? (agentType === "guide" 
            ? this.personalityEngine.generateSystemPrompt("guide", message)
            : this.personalityEngine.generateSystemPrompt(agentType as AgentMode))
        : null;

      console.log("Using regular streaming, prompt length:", systemPrompt?.length || 0);
      
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
      console.error("Error in streaming AI coach service:", error);
      callbacks.onError(error as Error);
    }
  }
}

export const aiCoachService = new AICoachService();

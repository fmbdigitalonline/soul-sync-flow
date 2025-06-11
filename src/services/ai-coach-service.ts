
import { supabase } from "@/integrations/supabase/client";

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

  createNewSession(): string {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.sessions.set(sessionId, "");
    return sessionId;
  }

  async sendMessage(
    message: string,
    sessionId: string,
    includeBlueprint: boolean = false,
    agentType: AgentType = "guide",
    language: string = "en"
  ): Promise<{ response: string; conversationId: string }> {
    try {
      const { data, error } = await supabase.functions.invoke("ai-coach", {
        body: {
          message,
          sessionId,
          includeBlueprint,
          agentType,
          language,
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
      
      const { data, error } = await supabase.functions.invoke("ai-coach-stream", {
        body: {
          message,
          sessionId,
          includeBlueprint,
          agentType,
          language,
        },
      });

      if (error) {
        console.error('Supabase function invoke error:', error);
        throw error;
      }

      console.log('Supabase function response:', data);

      // For streaming, the function should return a ReadableStream directly
      // If we get here, it means the function returned successfully but we need to handle the stream
      
      // Since we can't get the stream directly from supabase.functions.invoke,
      // we'll make a direct fetch to the edge function
      const response = await fetch(`${supabase.supabaseUrl}/functions/v1/ai-coach-stream`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabase.supabaseKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          sessionId,
          includeBlueprint,
          agentType,
          language,
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
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') {
                callbacks.onComplete(fullResponse);
                return;
              }
              
              try {
                const parsed = JSON.parse(data);
                if (parsed.choices?.[0]?.delta?.content) {
                  const content = parsed.choices[0].delta.content;
                  fullResponse += content;
                  callbacks.onChunk(content);
                }
              } catch (e) {
                // Ignore JSON parse errors for non-JSON lines
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
      }
      
      callbacks.onComplete(fullResponse);
    } catch (error) {
      console.error("Error in streaming AI coach service:", error);
      callbacks.onError(error as Error);
    }
  }
}

export const aiCoachService = new AICoachService();

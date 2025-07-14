
import { supabase } from '@/integrations/supabase/client';

interface AICoachStreamRequest {
  message: string;
  sessionId: string;
  includeBlueprint?: boolean;
  agentType?: string;
  language?: string;
  systemPrompt?: string;
  enableBlueprintFiltering?: boolean;
  maxTokens?: number;
  temperature?: number;
  contextDepth?: string;
  userDisplayName?: string;
}

interface HACSStreamingCallbacks {
  onChunk?: (chunk: string) => void;
  onComplete?: (fullContent: string) => void;
  onError?: (error: Error) => void;
}

/**
 * HACS Routing Service - Ensures all AI conversations route through HACS for intelligence learning
 * This service intercepts ai-coach-stream calls and routes them through hacs-intelligent-conversation
 * while maintaining backward compatibility with existing code.
 */
export class HACSRoutingService {
  private static instance: HACSRoutingService;
  
  static getInstance(): HACSRoutingService {
    if (!HACSRoutingService.instance) {
      HACSRoutingService.instance = new HACSRoutingService();
    }
    return HACSRoutingService.instance;
  }

  /**
   * CRITICAL: Route ai-coach-stream calls through HACS for intelligence learning
   * This ensures all conversations contribute to the user's intelligence growth
   */
  async routeStreamingMessage(
    request: AICoachStreamRequest,
    callbacks: HACSStreamingCallbacks = {}
  ): Promise<void> {
    try {
      console.log('🔄 HACS Routing: Intercepting ai-coach-stream call for intelligence learning');
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated for HACS routing');
      }

      // Route through HACS intelligent conversation for learning
      const { data: hacsResponse, error: hacsError } = await supabase.functions.invoke('hacs-intelligent-conversation', {
        body: {
          action: 'respond_to_user',
          userId: user.id,
          sessionId: request.sessionId,
          userMessage: request.message,
          messageHistory: []
        }
      });

      if (hacsError) {
        console.warn('HACS routing failed, falling back to ai-coach-stream:', hacsError);
        // Fallback to original ai-coach-stream if HACS fails
        return this.fallbackToAICoachStream(request, callbacks);
      }

      // Simulate streaming for compatibility with existing code
      const response = hacsResponse.response || 'I appreciate you sharing that with me.';
      
      // Simulate chunks for streaming compatibility
      if (callbacks.onChunk) {
        const words = response.split(' ');
        for (let i = 0; i < words.length; i++) {
          const chunk = (i === 0 ? words[i] : ' ' + words[i]);
          callbacks.onChunk(chunk);
          // Small delay to simulate streaming
          await new Promise(resolve => setTimeout(resolve, 50));
        }
      }

      if (callbacks.onComplete) {
        callbacks.onComplete(response);
      }

      console.log('✅ HACS Routing: Successfully routed conversation through HACS intelligence system');

    } catch (error) {
      console.error('❌ HACS Routing error:', error);
      if (callbacks.onError) {
        callbacks.onError(error as Error);
      } else {
        // Fallback to original service
        return this.fallbackToAICoachStream(request, callbacks);
      }
    }
  }

  /**
   * Fallback to original ai-coach-stream when HACS routing fails
   * This ensures the system continues working even if HACS is temporarily unavailable
   */
  private async fallbackToAICoachStream(
    request: AICoachStreamRequest,
    callbacks: HACSStreamingCallbacks
  ): Promise<void> {
    console.log('⚠️ HACS Routing: Using fallback ai-coach-stream (no intelligence learning)');
    
    try {
      const response = await fetch(`${supabase.supabaseUrl}/functions/v1/ai-coach-stream`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabase.supabaseKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`AI Coach Stream fallback failed: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullContent = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data.trim() === '[DONE]') {
                if (callbacks.onComplete) {
                  callbacks.onComplete(fullContent);
                }
                return;
              }

              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices?.[0]?.delta?.content;
                if (content) {
                  fullContent += content;
                  if (callbacks.onChunk) {
                    callbacks.onChunk(content);
                  }
                }
              } catch (e) {
                // Skip invalid JSON
                continue;
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Fallback ai-coach-stream also failed:', error);
      if (callbacks.onError) {
        callbacks.onError(error as Error);
      }
    }
  }

  /**
   * Route non-streaming AI coach calls through HACS
   */
  async routeAICoachCall(
    message: string,
    sessionId: string,
    systemPrompt?: string,
    agentType: string = 'guide'
  ): Promise<{ response: string }> {
    try {
      console.log('🔄 HACS Routing: Intercepting ai-coach call for intelligence learning');
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated for HACS routing');
      }

      const { data: hacsResponse, error: hacsError } = await supabase.functions.invoke('hacs-intelligent-conversation', {
        body: {
          action: 'respond_to_user',
          userId: user.id,
          sessionId,
          userMessage: message,
          messageHistory: []
        }
      });

      if (hacsError) {
        console.warn('HACS routing failed, falling back to ai-coach:', hacsError);
        // Fallback to original ai-coach
        const { data: fallbackResponse, error: fallbackError } = await supabase.functions.invoke('ai-coach', {
          body: {
            message,
            sessionId,
            systemPrompt,
            agentType,
            includeBlueprint: false,
            temperature: 0.7,
            maxTokens: 200
          }
        });

        if (fallbackError) throw fallbackError;
        return { response: fallbackResponse.response };
      }

      console.log('✅ HACS Routing: Successfully routed ai-coach call through HACS');
      return { response: hacsResponse.response || 'I appreciate you sharing that with me.' };

    } catch (error) {
      console.error('❌ HACS ai-coach routing error:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const hacsRoutingService = HACSRoutingService.getInstance();

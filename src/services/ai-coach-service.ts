import { supabase } from "@/integrations/supabase/client";
import { PersonalityEngine } from "./personality-engine";
import { LayeredBlueprint, AgentMode } from "@/types/personality-modules";
import { unifiedBrainService } from "./unified-brain-service";
import { enhancedCompanionOrchestrator } from "./enhanced-companion-orchestrator";

export type AgentType = "coach" | "guide" | "blend" | "dream";

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
    language: string = "en",
    userDisplayName: string = "friend"
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

      // Fallback to regular AI coach processing with enhanced prompts
      // Generate enhanced prompt with memory and brutal honesty for companion mode
      let systemPrompt: string;
      let contextualData: any = {};
      
      if (agentType === "guide" && includeBlueprint) {
        // Get current user for enhanced orchestration
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user?.id) {
          const enhancedResponse = await enhancedCompanionOrchestrator.generateEnhancedPrompt(
            message,
            sessionId,
            user.id,
            userDisplayName,
            '', // personalityContext - could be enhanced later
            [] // semanticChunks - could be enhanced later
          );
          
          systemPrompt = enhancedResponse.enhancedPrompt;
          contextualData = enhancedResponse.contextualData;
          
          console.log("Using enhanced companion orchestration with memory and brutal honesty:", {
            promptLength: systemPrompt.length,
            hasMemory: contextualData.hasMemoryContext,
            hasBrutalHonesty: contextualData.hasBrutalHonesty,
            readinessLevel: contextualData.readinessLevel
          });
        } else {
          systemPrompt = this.personalityEngine.generateSystemPrompt("guide", message);
          console.log("Fallback to standard personality engine prompt");
        }
      } else {
        systemPrompt = includeBlueprint 
          ? this.personalityEngine.generateSystemPrompt(agentType as AgentMode)
          : this.getUniversalConversationalPrompt(agentType, userDisplayName);
        
        console.log("Using standard prompting system, prompt length:", systemPrompt?.length || 0);
      }

      const { data, error } = await supabase.functions.invoke("ai-coach-v2", {
        body: {
          message,
          sessionId,
          includeBlueprint,
          agentType,
          language,
          systemPrompt,
          userDisplayName,
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

  private getUniversalConversationalPrompt(agentType: AgentType, userDisplayName: string = "friend"): string {
    return `# Universal Conversational Guidelines for ${userDisplayName}

You are a warm, supportive AI companion for ${userDisplayName}. Follow these critical rules for ALL conversations:

## LANGUAGE RULES (MANDATORY):
- ALWAYS use ${userDisplayName}'s name naturally in conversation - it is mandatory
- NEVER use "you" or impersonal language - always address ${userDisplayName} by name
- NEVER use technical personality terms like "ENFP", "Generator", "Manifestor", etc.
- When referring to personality insights, always call it ${userDisplayName}'s "blueprint" or "unique patterns"
- Speak in plain, warm language that feels personal and supportive to ${userDisplayName}
- Only explain technical details if ${userDisplayName} specifically asks "how do you know this?" or similar drilling-down questions

## COMMUNICATION STYLE:
- Be warm, genuine, and personally supportive to ${userDisplayName}
- Use natural, conversational language that addresses ${userDisplayName} directly
- Reference ${userDisplayName}'s unique patterns and strengths when relevant, but describe them in everyday terms
- Ask thoughtful follow-up questions to deepen the conversation with ${userDisplayName}
- Provide actionable insights based on ${userDisplayName}'s individual nature

## ROLE-SPECIFIC GUIDANCE:
${this.getRoleSpecificGuidance(agentType)}

Remember: Every response should feel like it comes from someone who truly knows and cares about ${userDisplayName}, using ${userDisplayName}'s name naturally and keeping all language warm and accessible.`;
  }

  private getRoleSpecificGuidance(agentType: AgentType): string {
    switch (agentType) {
      case 'coach':
        return `- Focus on practical productivity and goal achievement
- Help them work with their natural energy and patterns
- Provide actionable steps that fit their unique style
- Support them in breaking through obstacles using their strengths`;

      case 'guide':
        return `- Focus on deeper life questions and spiritual growth
- Help them understand their patterns and purpose
- Provide gentle wisdom for their personal journey
- Support their authentic self-expression and growth`;

      case 'blend':
        return `- Adapt fluidly between practical and spiritual guidance
- Meet them wherever they need support most
- Balance action-oriented help with deeper reflection
- Support their whole journey with integrated wisdom`;

      default:
        return '- Provide thoughtful, personalized support for their unique journey';
    }
  }

  async sendStreamingMessage(
    message: string,
    sessionId: string,
    includeBlueprint: boolean = false,
    agentType: AgentType = "guide",
    language: string = "en",
    callbacks: StreamingResponse,
    userDisplayName: string = "friend"
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
      
      // Fallback to regular streaming with enhanced prompts
      let systemPrompt: string;
      
      if (agentType === "guide" && includeBlueprint) {
        // Get current user for enhanced orchestration
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user?.id) {
          const enhancedResponse = await enhancedCompanionOrchestrator.generateEnhancedPrompt(
            message,
            sessionId,
            user.id,
            userDisplayName,
            '', // personalityContext - could be enhanced later
            [] // semanticChunks - could be enhanced later
          );
          
          systemPrompt = enhancedResponse.enhancedPrompt;
          
          console.log("Using enhanced streaming orchestration with memory and brutal honesty:", {
            promptLength: systemPrompt.length,
            hasMemory: enhancedResponse.contextualData.hasMemoryContext,
            hasBrutalHonesty: enhancedResponse.contextualData.hasBrutalHonesty
          });
        } else {
          systemPrompt = this.personalityEngine.generateSystemPrompt("guide", message);
          console.log("Fallback to standard personality engine streaming");
        }
      } else {
        systemPrompt = includeBlueprint 
          ? this.personalityEngine.generateSystemPrompt(agentType as AgentMode)
          : this.getUniversalConversationalPrompt(agentType, userDisplayName);
        
        console.log("Using standard streaming system, prompt length:", systemPrompt?.length || 0);
      }
      
      // Get current user session token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('No authentication session available');
      }
      
      console.log('🔐 Using authenticated session token for ai-coach-stream');
      
      const response = await fetch(`https://qxaajirrqrcnmvtowjbg.supabase.co/functions/v1/ai-coach-stream`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          sessionId,
          includeBlueprint,
          agentType,
          language,
          systemPrompt,
          userDisplayName,
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

  setLanguage(language: string) {
    console.log(`🌍 AI Coach Service language set to: ${language}`);
    // Language is now passed directly to methods rather than stored
  }
}

export const aiCoachService = new AICoachService();

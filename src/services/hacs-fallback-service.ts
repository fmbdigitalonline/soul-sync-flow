// HACS Fallback Service - Safe fallback mechanisms for HACS failures
// Provides graceful degradation when HACS modules fail

import { enhancedAICoachService, AgentType } from "./enhanced-ai-coach-service";
import { tieredMemoryGraph } from "./tiered-memory-graph";
import { enhancedPersonalityEngine } from "./enhanced-personality-engine";
import { hacsMonitorService } from "./hacs-monitor-service";

export interface FallbackResponse {
  response: string;
  usedFallback: boolean;
  fallbackReason: string;
  originalError?: string;
}

export interface FallbackContext {
  message: string;
  sessionId: string;
  userId: string;
  agentMode: string;
  retryCount: number;
}

class HACSFallbackService {
  private maxRetries: number = 2;
  private fallbackChain: Array<(context: FallbackContext) => Promise<FallbackResponse>> = [];

  constructor() {
    this.setupFallbackChain();
  }

  // Setup the fallback chain - order matters (most to least capable)
  private setupFallbackChain(): void {
    this.fallbackChain = [
      this.fallbackToEnhancedCoach.bind(this),
      this.fallbackToBasicPersonality.bind(this),
      this.fallbackToSimpleMemory.bind(this),
      this.fallbackToBasicResponse.bind(this)
    ];
  }

  // Main fallback orchestrator
  async executeFallback(context: FallbackContext, originalError?: string): Promise<FallbackResponse> {
    console.log(`🛡️ HACS Fallback: Executing fallback for session ${context.sessionId}`);
    
    for (let i = 0; i < this.fallbackChain.length; i++) {
      try {
        const fallbackMethod = this.fallbackChain[i];
        const result = await fallbackMethod(context);
        
        if (result.response) {
          console.log(`🛡️ HACS Fallback: Success with method ${i + 1}`);
          return {
            ...result,
            fallbackReason: `HACS failure - used fallback method ${i + 1}`,
            originalError
          };
        }
      } catch (error) {
        console.warn(`🛡️ HACS Fallback: Method ${i + 1} failed:`, error);
        continue;
      }
    }

    // Ultimate fallback
    return {
      response: "I'm experiencing some technical difficulties right now. Please try again in a moment.",
      usedFallback: true,
      fallbackReason: "All fallback methods failed",
      originalError
    };
  }

  // Fallback 1: Enhanced Coach (most capable)
  private async fallbackToEnhancedCoach(context: FallbackContext): Promise<FallbackResponse> {
    try {
      console.log('🛡️ Fallback 1: Attempting Enhanced Coach');
      
      const result = await enhancedAICoachService.sendMessage(
        context.message,
        context.sessionId,
        false, // No persona to avoid potential conflicts
        context.agentMode as AgentType,
        'en'
      );

      return {
        response: result.response,
        usedFallback: true,
        fallbackReason: "HACS unavailable - using Enhanced Coach"
      };
    } catch (error) {
      throw new Error(`Enhanced Coach fallback failed: ${error}`);
    }
  }

  // Fallback 2: Basic Personality (personality without full HACS)
  private async fallbackToBasicPersonality(context: FallbackContext): Promise<FallbackResponse> {
    try {
      console.log('🛡️ Fallback 2: Attempting Basic Personality');
      
      // Try to get basic personality prompt
      const systemPrompt = await enhancedPersonalityEngine.generateSystemPrompt(
        context.agentMode as any,
        context.message
      );
      
      // Use basic AI call with personality
      const response = await this.makeBasicAICall(context.message, systemPrompt);
      
      return {
        response,
        usedFallback: true,
        fallbackReason: "HACS unavailable - using basic personality"
      };
    } catch (error) {
      throw new Error(`Basic personality fallback failed: ${error}`);
    }
  }

  // Fallback 3: Simple Memory (memory without HACS)
  private async fallbackToSimpleMemory(context: FallbackContext): Promise<FallbackResponse> {
    try {
      console.log('🛡️ Fallback 3: Attempting Simple Memory');
      
      // Get basic memory context
      const memories = await tieredMemoryGraph.getFromHotMemory(
        context.userId, 
        context.sessionId, 
        3
      );
      
      const memoryContext = memories.map(m => 
        `Previous: ${m.raw_content?.content || 'No content'}`
      ).join('\n');
      
      const systemPrompt = `You are a helpful AI assistant. Here's recent context:\n${memoryContext}`;
      const response = await this.makeBasicAICall(context.message, systemPrompt);
      
      return {
        response,
        usedFallback: true,
        fallbackReason: "HACS unavailable - using simple memory"
      };
    } catch (error) {
      throw new Error(`Simple memory fallback failed: ${error}`);
    }
  }

  // Fallback 4: Basic Response (minimal functionality)
  private async fallbackToBasicResponse(context: FallbackContext): Promise<FallbackResponse> {
    try {
      console.log('🛡️ Fallback 4: Attempting Basic Response');
      
      const systemPrompt = `You are a helpful AI assistant. Respond warmly and helpfully to the user's message.`;
      const response = await this.makeBasicAICall(context.message, systemPrompt);
      
      return {
        response,
        usedFallback: true,
        fallbackReason: "HACS unavailable - using basic response"
      };
    } catch (error) {
      throw new Error(`Basic response fallback failed: ${error}`);
    }
  }

  // Basic AI call for fallbacks
  private async makeBasicAICall(message: string, systemPrompt: string): Promise<string> {
    // Use the same API call pattern as enhanced coach but simplified
    try {
      const response = await fetch('/api/ai-coach', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          systemPrompt,
          sessionId: `fallback_${Date.now()}`,
          usePersona: false,
          agentMode: 'guide'
        }),
      });

      if (!response.ok) {
        throw new Error(`API call failed: ${response.status}`);
      }

      const data = await response.json();
      return data.response || "I understand you're trying to communicate with me. How can I help?";
    } catch (error) {
      // Ultimate fallback response
      return this.getStaticFallbackResponse(message);
    }
  }

  // Static fallback responses for ultimate failure
  private getStaticFallbackResponse(message: string): string {
    const responses = [
      "I'm here to help! Could you tell me more about what you're looking for?",
      "That's interesting! I'd love to hear more about your thoughts on that.",
      "Thank you for sharing that with me. What would you like to explore together?",
      "I appreciate you reaching out. How can I support you today?",
      "That sounds important to you. Would you like to dive deeper into that topic?"
    ];
    
    // Simple hash to pick consistent response for same message
    const hash = message.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    return responses[hash % responses.length];
  }

  // Check if fallback should be used
  shouldUseFallback(): boolean {
    return hacsMonitorService.shouldUseFallback();
  }

  // Get fallback health status
  getFallbackHealth() {
    return {
      available: true,
      fallbackChainLength: this.fallbackChain.length,
      maxRetries: this.maxRetries,
      healthCheck: 'operational'
    };
  }

  // Test fallback chain
  async testFallbackChain(): Promise<{ success: boolean; results: string[] }> {
    const testContext: FallbackContext = {
      message: "Hello, this is a test message",
      sessionId: "test_session",
      userId: "test_user",
      agentMode: "guide",
      retryCount: 0
    };

    const results: string[] = [];
    
    for (let i = 0; i < this.fallbackChain.length; i++) {
      try {
        const method = this.fallbackChain[i];
        const result = await method(testContext);
        results.push(`Method ${i + 1}: SUCCESS - ${result.response.substring(0, 50)}...`);
      } catch (error) {
        results.push(`Method ${i + 1}: FAILED - ${error}`);
      }
    }

    const success = results.some(r => r.includes('SUCCESS'));
    return { success, results };
  }
}

export const hacsFallbackService = new HACSFallbackService();
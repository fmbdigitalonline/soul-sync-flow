/**
 * Enhanced Companion Orchestrator
 * Integrates memory tracking and hermetic brutal honesty into companion responses
 */

import { conversationMemoryTracker } from "./conversation-memory-tracker";
import { hermeticBrutalHonestyEngine } from "./hermetic-brutal-honesty-engine";
import { getCompanionOraclePrompt } from "./universal-conversational-rules";
import { memoryInformedConversationService } from "./memory-informed-conversation-service";

interface CompanionResponse {
  enhancedPrompt: string;
  memoryReferences: any[];
  honestyInsights: any[];
  contextualData: {
    emotionalState: string;
    readinessLevel: number;
    hasMemoryContext: boolean;
    hasBrutalHonesty: boolean;
  };
}

export class EnhancedCompanionOrchestrator {
  
  /**
   * Orchestrate enhanced companion response with memory and brutal honesty
   */
  async generateEnhancedPrompt(
    userMessage: string,
    sessionId: string,
    userId: string,
    userDisplayName: string = 'friend',
    personalityContext: string = '',
    semanticChunks: string[] = []
  ): Promise<CompanionResponse> {
    console.log('🎭 Orchestrating enhanced companion response...');
    
    try {
      // Phase 1: Extract and track conversation elements
      const conversationElements = conversationMemoryTracker.extractElementsFromMessage(
        userMessage, 
        sessionId, 
        userId
      );
      console.log('📝 Tracked', conversationElements.length, 'conversation elements');

      // Phase 2: Get memory references for conversation continuity
      const memoryReferences = await conversationMemoryTracker.getMemoryReferences(
        userMessage, 
        sessionId, 
        userId
      );
      console.log('🧠 Retrieved', memoryReferences.length, 'memory references');

      // Phase 3: Assess emotional state and readiness for brutal honesty
      const emotionalState = this.assessEmotionalState(userMessage);
      const readinessLevel = this.assessBrutalHonestyReadiness(userMessage, emotionalState);
      console.log('🎯 Emotional state:', emotionalState, 'Readiness level:', readinessLevel);

      // Phase 4: Generate brutal honesty insights if appropriate
      let honestyInsights: any[] = [];
      let brutalHonestySection = '';
      
      if (readinessLevel >= 5) { // Only generate brutal honesty if user is ready
        honestyInsights = await hermeticBrutalHonestyEngine.generateBrutalHonestyInsights(userId, {
          userMessage,
          conversationContext: '',
          emotionalState,
          readinessLevel
        });
        
        if (honestyInsights.length > 0) {
          brutalHonestySection = hermeticBrutalHonestyEngine.generateBrutalHonestyPrompt(
            honestyInsights,
            { userMessage, conversationContext: '', emotionalState, readinessLevel }
          );
          console.log('🔮 Generated', honestyInsights.length, 'brutal honesty insights');
        }
      }

      // Phase 5: Generate memory context for prompt
      const memoryContext = conversationMemoryTracker.generateMemoryContext(memoryReferences);

      // Phase 6: Build enhanced companion prompt
      const enhancedPrompt = getCompanionOraclePrompt(
        userDisplayName,
        personalityContext,
        semanticChunks,
        memoryContext,
        brutalHonestySection
      );

      console.log('✅ Enhanced companion prompt generated:', {
        promptLength: enhancedPrompt.length,
        memoryReferences: memoryReferences.length,
        honestyInsights: honestyInsights.length,
        readinessLevel
      });

      return {
        enhancedPrompt,
        memoryReferences,
        honestyInsights,
        contextualData: {
          emotionalState,
          readinessLevel,
          hasMemoryContext: memoryReferences.length > 0,
          hasBrutalHonesty: honestyInsights.length > 0
        }
      };

    } catch (error) {
      console.error('❌ Error in enhanced companion orchestration:', error);
      
      // Fallback to basic prompt
      const fallbackPrompt = getCompanionOraclePrompt(
        userDisplayName,
        personalityContext,
        semanticChunks
      );

      return {
        enhancedPrompt: fallbackPrompt,
        memoryReferences: [],
        honestyInsights: [],
        contextualData: {
          emotionalState: 'neutral',
          readinessLevel: 5,
          hasMemoryContext: false,
          hasBrutalHonesty: false
        }
      };
    }
  }

  /**
   * Assess emotional state from user message
   */
  private assessEmotionalState(message: string): string {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('frustrated') || lowerMessage.includes('stuck') || lowerMessage.includes('angry')) {
      return 'frustrated';
    } else if (lowerMessage.includes('excited') || lowerMessage.includes('happy') || lowerMessage.includes('great')) {
      return 'positive';
    } else if (lowerMessage.includes('sad') || lowerMessage.includes('down') || lowerMessage.includes('disappointed')) {
      return 'vulnerable';
    } else if (lowerMessage.includes('confused') || lowerMessage.includes('unclear') || lowerMessage.includes('lost')) {
      return 'seeking_support';
    } else {
      return 'neutral';
    }
  }

  /**
   * Assess readiness for brutal honesty
   */
  private assessBrutalHonestyReadiness(message: string, emotionalState: string): number {
    let readiness = 5; // base level

    // Check for explicit requests for honesty
    if (message.toLowerCase().includes('brutal') || message.toLowerCase().includes('honest')) {
      readiness += 4;
    }

    // Check for seeking change or growth
    if (message.toLowerCase().includes('change') || message.toLowerCase().includes('grow') || 
        message.toLowerCase().includes('improve') || message.toLowerCase().includes('better')) {
      readiness += 2;
    }

    // Check for frustration (can handle more honesty)
    if (emotionalState === 'frustrated') {
      readiness += 1;
    }

    // Check for vulnerability (reduce honesty)
    if (emotionalState === 'vulnerable' || emotionalState === 'seeking_support') {
      readiness -= 2;
    }

    // Check for solution-seeking language
    if (message.toLowerCase().includes('help') || message.toLowerCase().includes('advice') || 
        message.toLowerCase().includes('what should')) {
      readiness += 1;
    }

    return Math.max(3, Math.min(readiness, 10)); // Scale 3-10
  }

  /**
   * Save conversation outcome for learning
   */
  async saveConversationOutcome(
    sessionId: string,
    userId: string,
    userMessage: string,
    aiResponse: string,
    contextualData: any
  ): Promise<void> {
    try {
      // Track the AI response application
      await memoryInformedConversationService.trackMemoryApplication(
        sessionId,
        {
          relevantMemories: [],
          memorySearchQuery: userMessage,
          contextSummary: `Enhanced response with ${contextualData.hasMemoryContext ? 'memory' : 'no memory'} and ${contextualData.hasBrutalHonesty ? 'brutal honesty' : 'gentle guidance'}`,
          lastMemoryUpdate: new Date().toISOString()
        },
        userMessage,
        aiResponse
      );

      console.log('✅ Conversation outcome saved for learning');
    } catch (error) {
      console.error('❌ Error saving conversation outcome:', error);
    }
  }
}

export const enhancedCompanionOrchestrator = new EnhancedCompanionOrchestrator();
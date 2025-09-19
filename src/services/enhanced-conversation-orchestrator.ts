/**
 * Enhanced Conversation Orchestrator - Complete Memory & Intent System
 * Integrates all 4 layers: Turn Buffer + Summary + Semantic + Intent Router
 * Directive 4: Abstract External Systems - Unified interface for conversation intelligence
 */

import { turnBufferService, Turn } from './turn-buffer-service';
import { conversationSummaryService, ConversationSummary } from './conversation-summary-service';
import { intentRouterService, IntentAnalysis } from './intent-router-service';
import { semanticMemoryService } from './semantic-memory-service';

export interface EnhancedConversationContext {
  // Turn Buffer Layer
  recentTurns: Turn[];
  turnBufferSize: number;
  
  // Summary Layer  
  conversationSummary: ConversationSummary | null;
  
  // Intent Layer
  currentIntent: IntentAnalysis;
  
  // Semantic Layer
  semanticContext: {
    relevantMemories: any[];
    totalTokens: number;
    selectionMethod: string;
  };
  
  // Meta
  contextQuality: 'excellent' | 'good' | 'minimal' | 'empty';
  recommendedResponseType: 'reflector' | 'planner' | 'companion' | 'clarifier';
}

export class EnhancedConversationOrchestrator {
  private static instance: EnhancedConversationOrchestrator;

  static getInstance(): EnhancedConversationOrchestrator {
    if (!this.instance) {
      this.instance = new EnhancedConversationOrchestrator();
    }
    return this.instance;
  }

  /**
   * Main orchestration method - processes user message through all 4 layers
   * Directive 1: Correctness is Non-Negotiable - Complete processing or clear error
   */
  async processUserMessage(
    userMessage: string,
    sessionId: string,
    userId: string,
    aiResponse?: string
  ): Promise<EnhancedConversationContext> {
    
    console.log('🎭 ENHANCED ORCHESTRATOR: Processing message through 4-layer system');
    
    try {
      // Layer 1: Turn Buffer - Add user message
      turnBufferService.addTurn(sessionId, {
        speaker: 'user',
        text: userMessage,
        timestamp: new Date()
      });

      // Layer 4: Intent Analysis - Determine what user wants
      console.log('🎯 Layer 4: Analyzing intent...');
      const intentAnalysis = await intentRouterService.analyzeIntent(
        userMessage, 
        sessionId, 
        userId
      );
      
      console.log(`✅ Intent detected: ${intentAnalysis.type} (${Math.round(intentAnalysis.confidence * 100)}%)`);

      // Layer 2: Summary - Update conversation summary
      console.log('📝 Layer 2: Updating conversation summary...');
      const updatedSummary = await conversationSummaryService.updateSummary(
        sessionId,
        userId, 
        userMessage,
        aiResponse
      );

      // Layer 1: Get recent turns for context
      console.log('🔄 Layer 1: Retrieving turn buffer...');
      const recentTurns = turnBufferService.getRecentTurns(sessionId, 8);

      // Layer 3: Semantic Memory - Get relevant past conversations
      console.log('🧠 Layer 3: Retrieving semantic context...');
      let semanticContext = {
        relevantMemories: [],
        totalTokens: 0,
        selectionMethod: 'none'
      };

      try {
        const semanticResult = await semanticMemoryService.getSemanticContext(
          userMessage, 
          1500, // Token limit for semantic context
          {
            maxResults: 4,
            similarityThreshold: 0.7,
            timeWeighting: true
          }
        );
        
        semanticContext = {
          relevantMemories: semanticResult.semanticMessages,
          totalTokens: semanticResult.totalTokens,
          selectionMethod: semanticResult.selectionMethod
        };
      } catch (error) {
        console.warn('⚠️ ORCHESTRATOR: Semantic layer failed, continuing without:', error);
      }

      // Determine context quality
      const contextQuality = this.assessContextQuality(
        recentTurns.length,
        updatedSummary !== null,
        semanticContext.relevantMemories.length,
        intentAnalysis.confidence
      );

      const enhancedContext: EnhancedConversationContext = {
        recentTurns,
        turnBufferSize: recentTurns.length,
        conversationSummary: updatedSummary,
        currentIntent: intentAnalysis,
        semanticContext,
        contextQuality,
        recommendedResponseType: intentAnalysis.suggestedResponse
      };

      console.log('✅ ENHANCED ORCHESTRATOR: 4-layer processing complete', {
        turnBuffer: recentTurns.length,
        hasSummary: !!updatedSummary,
        semanticMemories: semanticContext.relevantMemories.length,
        intent: intentAnalysis.type,
        confidence: intentAnalysis.confidence,
        contextQuality
      });

      return enhancedContext;

    } catch (error) {
      console.error('❌ ENHANCED ORCHESTRATOR: Processing failed:', error);
      
      // Directive 3: Fail visibly - return minimal context but don't hide the error
      return {
        recentTurns: [],
        turnBufferSize: 0,
        conversationSummary: null,
        currentIntent: {
          type: 'continuation',
          confidence: 0.3,
          context: {
            emotionalState: 'neutraal',
            isFollowUp: false,
            hasQuestion: false,
            isRequestingAction: false,
            isRequestingSummary: false,
            isExpressingFrustration: false
          },
          suggestedResponse: 'companion'
        },
        semanticContext: {
          relevantMemories: [],
          totalTokens: 0,
          selectionMethod: 'error'
        },
        contextQuality: 'empty',
        recommendedResponseType: 'companion'
      };
    }
  }

  /**
   * Add AI response to turn buffer for complete conversation tracking
   */
  async processAIResponse(
    aiResponse: string,
    sessionId: string,
    userId: string,
    agentMode?: string
  ): Promise<void> {
    
    // Add AI response to turn buffer
    turnBufferService.addTurn(sessionId, {
      speaker: 'assistant',
      text: aiResponse,
      timestamp: new Date()
    });

    // Store in semantic memory for future retrieval
    try {
      await semanticMemoryService.storeMessageEmbedding(
        `ai_${Date.now()}`,
        sessionId,
        aiResponse,
        'assistant',
        agentMode
      );
    } catch (error) {
      console.warn('⚠️ ORCHESTRATOR: Failed to store AI response embedding:', error);
    }

    console.log('✅ ORCHESTRATOR: AI response processed and stored');
  }

  /**
   * Generate enhanced system prompt based on intent and context
   */
  async generateEnhancedPrompt(
    basePrompt: string,
    context: EnhancedConversationContext,
    sessionId: string,
    userDisplayName: string = 'friend'
  ): Promise<string> {
    
    let enhancedPrompt = basePrompt;

    // Add intent-specific instructions
    const intentPrompt = intentRouterService.generateContextPrompt(context.currentIntent, sessionId);
    enhancedPrompt += `\n\n## INTENT CONTEXT\n${intentPrompt}`;

    // Add turn buffer context
    if (context.recentTurns.length > 0) {
      const turnContext = turnBufferService.getContextSummary(sessionId);
      enhancedPrompt += `\n\n## RECENTE GESPREKSTURN\n${turnContext}`;
    }

    // Add conversation summary
    if (context.conversationSummary) {
      enhancedPrompt += `\n\n## GESPREKSAMENVATTING\n`;
      enhancedPrompt += `Hoofdthema's: ${context.conversationSummary.main_topics.join(', ')}\n`;
      enhancedPrompt += `Emotionele toon: ${context.conversationSummary.emotional_tone}\n`;
      enhancedPrompt += `Huidige uitdagingen: ${context.conversationSummary.current_challenges.join(', ')}\n`;
      enhancedPrompt += `Gebruikersdoelen: ${context.conversationSummary.user_goals.join(', ')}\n`;
      
      if (context.conversationSummary.open_questions.length > 0) {
        enhancedPrompt += `Open vragen: ${context.conversationSummary.open_questions.join(', ')}\n`;
      }
    }

    // Add semantic memory context
    if (context.semanticContext.relevantMemories.length > 0) {
      enhancedPrompt += `\n\n## RELEVANTE EERDERE GESPREKKEN\n`;
      context.semanticContext.relevantMemories.forEach((memory, index) => {
        enhancedPrompt += `${index + 1}. [${this.formatTimeAgo(new Date(memory.created_at))}] ${memory.content.substring(0, 150)}...\n`;
      });
    }

    // Special handling for reflection requests
    if (context.currentIntent.type === 'reflection') {
      try {
        const reflectionSummary = await conversationSummaryService.generateReflectionSummary(sessionId, userDisplayName);
        enhancedPrompt += `\n\n## REFLECTIE SAMENVATTING VOOR GEBRUIKER\n${reflectionSummary}`;
      } catch (error) {
        console.warn('⚠️ Failed to generate reflection summary:', error);
      }
    }

    // Add context quality note
    enhancedPrompt += `\n\n## CONTEXT KWALITEIT\n`;
    enhancedPrompt += `Kwaliteit: ${context.contextQuality}\n`;
    enhancedPrompt += `Aanbevolen response type: ${context.recommendedResponseType}\n`;
    enhancedPrompt += `Intent vertrouwen: ${Math.round(context.currentIntent.confidence * 100)}%\n`;

    console.log('✅ ORCHESTRATOR: Enhanced prompt generated', {
      originalLength: basePrompt.length,
      enhancedLength: enhancedPrompt.length,
      intentType: context.currentIntent.type
    });

    return enhancedPrompt;
  }

  /**
   * Clear session data (for resets)
   */
  clearSession(sessionId: string): void {
    turnBufferService.clearSession(sessionId);
    console.log('🧹 ORCHESTRATOR: Session cleared');
  }

  private assessContextQuality(
    turnCount: number,
    hasSummary: boolean,
    semanticMemoriesCount: number,
    intentConfidence: number
  ): 'excellent' | 'good' | 'minimal' | 'empty' {
    
    if (turnCount >= 6 && hasSummary && semanticMemoriesCount >= 2 && intentConfidence >= 0.8) {
      return 'excellent';
    }
    
    if (turnCount >= 3 && hasSummary && intentConfidence >= 0.7) {
      return 'good';
    }
    
    if (turnCount >= 1 || intentConfidence >= 0.6) {
      return 'minimal';
    }
    
    return 'empty';
  }

  private formatTimeAgo(date: Date): string {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    
    if (seconds < 60) return `${seconds}s geleden`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m geleden`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h geleden`;
    const days = Math.floor(hours / 24);
    return `${days}d geleden`;
  }
}

export const enhancedConversationOrchestrator = EnhancedConversationOrchestrator.getInstance();
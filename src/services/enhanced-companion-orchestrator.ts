/**
 * Enhanced Companion Orchestrator
 * Integrates memory tracking and hermetic brutal honesty into companion responses
 */

import { conversationMemoryTracker } from "./conversation-memory-tracker";
import { hermeticBrutalHonestyEngine } from "./hermetic-brutal-honesty-engine";
import { getCompanionOraclePrompt, getFullBlueprintPrompt } from "./universal-conversational-rules";
import { memoryInformedConversationService } from "./memory-informed-conversation-service";
import { hermeticIntelligenceBridge, HermeticCompanionContext } from "./hermetic-intelligence-bridge";
import { semanticMemoryService } from "./semantic-memory-service";

interface CompanionResponse {
  enhancedPrompt: string;
  memoryReferences: any[];
  honestyInsights: any[];
  hermeticContext: HermeticCompanionContext | null;
  contextualData: {
    emotionalState: string;
    readinessLevel: number;
    hasMemoryContext: boolean;
    hasBrutalHonesty: boolean;
    hasHermeticIntelligence: boolean;
    intelligenceDimensions: number;
    semanticBlueprintChunks: number;
  };
}

export class EnhancedCompanionOrchestrator {
  
  /**
   * Orchestrate enhanced companion response with memory, brutal honesty, and full Hermetic 2.0 intelligence
   * PRINCIPLE #1: Never Break - Additive enhancement preserving all existing functionality
   */
  async generateEnhancedPrompt(
    userMessage: string,
    sessionId: string,
    userId: string,
    userDisplayName: string = 'friend',
    personalityContext: string = '',
    semanticChunks: string[] = []
  ): Promise<CompanionResponse> {
    console.log('🎭 ENHANCED ORCHESTRATOR: Starting with full Hermetic 2.0 intelligence integration');
    
    try {
      // Phase 1: Load full Hermetic Intelligence Context (NEW - ADDITIVE)
      console.log('🧠 HERMETIC INTEGRATION: Loading full 13-dimension intelligence context');
      const hermeticContext = await hermeticIntelligenceBridge.getHermeticCompanionContext(
        userId, 
        userMessage, 
        8 // Max semantic blueprint chunks
      );
      
      console.log('✅ HERMETIC INTEGRATION: Context loaded', {
        hasStructuredIntelligence: !!hermeticContext.structuredIntelligence,
        dimensionsExtracted: hermeticContext.extractionMetadata.dimensionsExtracted,
        semanticChunks: hermeticContext.semanticBlueprintChunks.length,
        personalityInsights: hermeticContext.personalityContext.coreNarratives.length
      });

      if (hermeticContext.personalityContext.corePersonalityPattern || hermeticContext.personalityContext.decisionStyle) {
        console.log('🧬 HERMETIC INTEGRATION: Enriched traits detected', {
          corePersonalityPattern: hermeticContext.personalityContext.corePersonalityPattern,
          decisionStyle: hermeticContext.personalityContext.decisionStyle,
          communicationTone: hermeticContext.personalityContext.communicationTone
        });
      }

      // Phase 2: Extract and track conversation elements (EXISTING)
      const conversationElements = conversationMemoryTracker.extractElementsFromMessage(
        userMessage, 
        sessionId, 
        userId
      );
      console.log('📝 Tracked', conversationElements.length, 'conversation elements');

      // Phase 3: Enhanced semantic memory retrieval (ENHANCED)
      console.log('🧠 SEMANTIC MEMORY: Getting enhanced references with blueprint context');
      const [memoryReferences, semanticContext] = await Promise.all([
        conversationMemoryTracker.getMemoryReferences(userMessage, sessionId, userId),
        semanticMemoryService.getSemanticContext(userMessage, 2000, { 
          maxResults: 6,
          similarityThreshold: 0.65,
          timeWeighting: true 
        })
      ]);
      
      console.log('🧠 ENHANCED MEMORY RETRIEVAL: Retrieved contexts', {
        memoryReferences: memoryReferences.length,
        semanticMessages: semanticContext.semanticMessages.length,
        totalSemanticTokens: semanticContext.totalTokens,
        sessionId,
        userId
      });

      // Phase 4: Assess emotional state and readiness for brutal honesty (EXISTING)
      const emotionalState = this.assessEmotionalState(userMessage);
      const readinessLevel = this.assessBrutalHonestyReadiness(userMessage, emotionalState);
      console.log('🎯 Emotional state:', emotionalState, 'Readiness level:', readinessLevel);

      // Phase 5: Generate brutal honesty insights if appropriate (EXISTING)
      let honestyInsights: any[] = [];
      let brutalHonestySection = '';
      
      if (readinessLevel >= 5) {
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

      // Phase 6: Generate enhanced memory context (ENHANCED)
      const memoryContext = conversationMemoryTracker.generateMemoryContext(memoryReferences);
      const semanticMemoryContext = this.generateSemanticMemoryContext(semanticContext.semanticMessages);

      // Phase 7: Create comprehensive personality context (NEW - ADDITIVE)
      const comprehensivePersonalityContext = this.buildComprehensivePersonalityContext(
        hermeticContext,
        personalityContext,
        semanticChunks
      );

      // Phase 8: Detect full blueprint requests and build enhanced companion prompt (ENHANCED)
      const isFullBlueprintRequest = userMessage.toLowerCase().includes('full blueprint') || 
                                     userMessage.toLowerCase().includes('complete blueprint') ||
                                     userMessage.toLowerCase().includes('entire blueprint');

      const enhancedPrompt = isFullBlueprintRequest 
        ? this.getFullHermeticBlueprintPrompt(
            userDisplayName,
            hermeticContext,
            memoryContext,
            semanticMemoryContext,
            brutalHonestySection
          )
        : this.getEnhancedCompanionOraclePrompt(
            userDisplayName,
            comprehensivePersonalityContext,
            hermeticContext,
            memoryContext,
            semanticMemoryContext,
            brutalHonestySection
          );

      console.log('✅ ENHANCED COMPANION ORCHESTRATOR: Full Hermetic 2.0 integration complete', {
        sessionId,
        userId,
        promptLength: enhancedPrompt.length,
        memoryReferences: memoryReferences.length,
        semanticMessages: semanticContext.semanticMessages.length,
        hermeticDimensions: hermeticContext.extractionMetadata.dimensionsExtracted,
        blueprintChunks: hermeticContext.semanticBlueprintChunks.length,
        honestyInsights: honestyInsights.length,
        readinessLevel,
        memoryContextLength: memoryContext.length,
        semanticContextLength: semanticMemoryContext.length
      });

      return {
        enhancedPrompt,
        memoryReferences,
        honestyInsights,
        hermeticContext,
        contextualData: {
          emotionalState,
          readinessLevel,
          hasMemoryContext: memoryReferences.length > 0,
          hasBrutalHonesty: honestyInsights.length > 0,
          hasHermeticIntelligence: !!hermeticContext.structuredIntelligence,
          intelligenceDimensions: hermeticContext.extractionMetadata.dimensionsExtracted,
          semanticBlueprintChunks: hermeticContext.semanticBlueprintChunks.length
        }
      };

    } catch (error) {
      console.error('❌ ENHANCED ORCHESTRATOR ERROR: Full integration failed, using graceful fallback:', error);
      
      // PRINCIPLE #3: Surface errors clearly - Enhanced fallback with error context
      const fallbackPrompt = getCompanionOraclePrompt(
        userDisplayName,
        personalityContext + '\n\n[Note: Advanced intelligence integration temporarily unavailable]',
        semanticChunks
      );

      return {
        enhancedPrompt: fallbackPrompt,
        memoryReferences: [],
        honestyInsights: [],
        hermeticContext: null,
        contextualData: {
          emotionalState: 'neutral',
          readinessLevel: 5,
          hasMemoryContext: false,
          hasBrutalHonesty: false,
          hasHermeticIntelligence: false,
          intelligenceDimensions: 0,
          semanticBlueprintChunks: 0
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
   * Generate semantic memory context from semantic search results
   * NEW METHOD - ADDITIVE ENHANCEMENT
   */
  private generateSemanticMemoryContext(semanticMessages: any[]): string {
    if (semanticMessages.length === 0) {
      return '';
    }

    const contextLines = semanticMessages.map((msg, index) => {
      const timeAgo = this.getTimeAgo(new Date(msg.created_at));
      return `[${timeAgo}] ${msg.message_role}: ${msg.content.substring(0, 200)}${msg.content.length > 200 ? '...' : ''}`;
    });

    return `\n\n## Semantic Memory Context (${semanticMessages.length} relevant memories):\n${contextLines.join('\n')}\n`;
  }

  /**
   * Build comprehensive personality context from Hermetic intelligence AND full report
   * ENHANCED METHOD - Now includes full 18-section Hermetic 2.0 report context
   */
  private buildComprehensivePersonalityContext(
    hermeticContext: HermeticCompanionContext,
    fallbackPersonalityContext: string,
    fallbackSemanticChunks: string[]
  ): string {
    if (!hermeticContext.structuredIntelligence && Object.keys(hermeticContext.fullHermeticReport).length === 0) {
      // Fallback to existing context if no hermetic intelligence
      const chunks = fallbackSemanticChunks.length > 0 ? 
        `\n\nBlueprint Context:\n${fallbackSemanticChunks.join('\n')}` : '';
      return fallbackPersonalityContext + chunks;
    }

    const personality = hermeticContext.personalityContext;
    const blueprintChunks = hermeticContext.semanticBlueprintChunks;
    const fullReport = hermeticContext.fullHermeticReport;

    let context = `## Comprehensive Soul Profile (${hermeticContext.extractionMetadata.dimensionsExtracted}/13 analysts + ${hermeticContext.relevantReportSections.length} report sections):

**Core Identity Narratives:**
${personality.coreNarratives.slice(0, 3).map(n => `• ${n}`).join('\n')}

**Execution Style:** ${personality.executionStyle}

${personality.corePersonalityPattern ? `**Core Personality Pattern:** ${personality.corePersonalityPattern}` : ''}

${personality.decisionStyle ? `**Decision Style:** ${personality.decisionStyle}` : ''}

${personality.communicationTone ? `**Communication Tone:** ${personality.communicationTone}` : ''}

**Spiritual Framework:** ${personality.spiritualFramework}

**Key Behavioral Patterns:**
${personality.dominantPatterns.slice(0, 3).map(p => `• ${p}`).join('\n')}`;

    // Add adaptation style if available
    if (personality.adaptationStyle.length > 0) {
      context += `\n\n**Adaptation Style:**
${personality.adaptationStyle.slice(0, 2).map(s => `• ${s}`).join('\n')}`;
    }

    // Add conflict areas if present
    if (personality.conflictAreas.length > 0) {
      context += `\n\n**Areas of Internal Tension:**
${personality.conflictAreas.slice(0, 2).map(c => `• ${c}`).join('\n')}`;
    }

    // NEW: Add full Hermetic 2.0 report sections for deeper context
    if (Object.keys(fullReport).length > 0) {
      context += `\n\n## Deep Hermetic Intelligence Context:`;
      
      // Prioritize key sections for context
      const prioritySections = ['integrated_summary', 'life_path_purpose', 'consciousness_integration_map', 'core_personality_pattern'];
      const availablePrioritySections = prioritySections.filter(section => fullReport[section]);
      
      availablePrioritySections.forEach(sectionName => {
        const sectionContent = this.extractSectionSummary(fullReport[sectionName]);
        if (sectionContent) {
          context += `\n\n**${this.formatSectionName(sectionName)}:**\n${sectionContent}`;
        }
      });

      // Add other available sections (truncated)
      const otherSections = Object.keys(fullReport).filter(section => 
        !prioritySections.includes(section) && fullReport[section]
      ).slice(0, 3);

      otherSections.forEach(sectionName => {
        const sectionContent = this.extractSectionSummary(fullReport[sectionName], 200);
        if (sectionContent) {
          context += `\n\n**${this.formatSectionName(sectionName)}:** ${sectionContent}`;
        }
      });
    }

    // Add semantic blueprint chunks
    if (blueprintChunks.length > 0) {
      context += `\n\n**Relevant Blueprint Context:**`;
      blueprintChunks.slice(0, 3).forEach((chunk, i) => {
        context += `\n${i + 1}. [${chunk.facet}] ${chunk.content.substring(0, 120)}${chunk.content.length > 120 ? '...' : ''}`;
      });
    }

    // Add enhanced metadata
    context += `\n\n*Soul Intelligence: ${(hermeticContext.extractionMetadata.confidence * 100).toFixed(0)}% confidence • ${hermeticContext.reportMetadata.totalSections} report sections • ${Math.round(hermeticContext.reportMetadata.contentLength / 1000)}K characters*`;

    return context;
  }

  /**
   * Extract summary from section content
   * NEW METHOD - Helper for full report integration
   */
  private extractSectionSummary(sectionData: any, maxLength: number = 400): string {
    if (typeof sectionData === 'string') {
      return sectionData.length > maxLength ? sectionData.substring(0, maxLength) + '...' : sectionData;
    }

    if (typeof sectionData === 'object' && sectionData !== null) {
      // Look for summary fields first
      if (sectionData.summary) return this.truncateContent(sectionData.summary, maxLength);
      if (sectionData.overview) return this.truncateContent(sectionData.overview, maxLength);
      if (sectionData.description) return this.truncateContent(sectionData.description, maxLength);
      if (sectionData.content) return this.truncateContent(sectionData.content, maxLength);
      
      // Extract key insights or main points
      if (sectionData.key_insights && Array.isArray(sectionData.key_insights)) {
        return sectionData.key_insights.slice(0, 3).join('. ');
      }
      if (sectionData.main_points && Array.isArray(sectionData.main_points)) {
        return sectionData.main_points.slice(0, 3).join('. ');
      }
      
      // Fallback to formatted object
      const formatted = JSON.stringify(sectionData, null, 2);
      return this.truncateContent(formatted, maxLength);
    }

    return String(sectionData);
  }

  /**
   * Format section name for display
   * NEW METHOD - Helper for full report integration
   */
  private formatSectionName(sectionName: string): string {
    return sectionName
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  /**
   * Truncate content intelligently
   * NEW METHOD - Helper for content management
   */
  private truncateContent(content: string, maxLength: number): string {
    if (content.length <= maxLength) return content;
    
    // Try to truncate at sentence boundary
    const truncated = content.substring(0, maxLength);
    const lastSentence = truncated.lastIndexOf('.');
    
    if (lastSentence > maxLength * 0.7) {
      return truncated.substring(0, lastSentence + 1);
    }
    
    return truncated + '...';
  }

  /**
   * Generate full hermetic blueprint prompt for comprehensive requests
   * NEW METHOD - ADDITIVE ENHANCEMENT
   */
  private getFullHermeticBlueprintPrompt(
    userDisplayName: string,
    hermeticContext: HermeticCompanionContext,
    memoryContext: string,
    semanticMemoryContext: string,
    brutalHonestySection: string
  ): string {
    const comprehensiveContext = this.buildComprehensivePersonalityContext(hermeticContext, '', []);
    
    return getFullBlueprintPrompt(
      userDisplayName,
      memoryContext + semanticMemoryContext,
      brutalHonestySection
    ) + `\n\n## Enhanced Hermetic Intelligence Context:\n${comprehensiveContext}`;
  }

  /**
   * Generate enhanced companion oracle prompt with full intelligence integration
   * NEW METHOD - ADDITIVE ENHANCEMENT  
   */
  private getEnhancedCompanionOraclePrompt(
    userDisplayName: string,
    comprehensivePersonalityContext: string,
    hermeticContext: HermeticCompanionContext,
    memoryContext: string,
    semanticMemoryContext: string,
    brutalHonestySection: string
  ): string {
    // Create semantic chunks array from hermetic blueprint chunks
    const semanticChunks = hermeticContext.semanticBlueprintChunks.map(chunk => 
      `[${chunk.facet}] ${chunk.content}`
    );

    // Use existing prompt generation but with enhanced context
    return getCompanionOraclePrompt(
      userDisplayName,
      comprehensivePersonalityContext,
      semanticChunks,
      memoryContext + semanticMemoryContext,
      brutalHonestySection
    );
  }

  /**
   * Helper method to calculate time ago for context display
   */
  private getTimeAgo(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays}d ago`;
    if (diffHours > 0) return `${diffHours}h ago`;
    return 'recent';
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
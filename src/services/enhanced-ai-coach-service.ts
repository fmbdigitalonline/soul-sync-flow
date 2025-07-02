
import { v4 as uuidv4 } from 'uuid';
import { UnifiedBlueprintService } from "./unified-blueprint-service";
import { blueprintService } from "./blueprint-service";
import { SevenLayerPersonalityEngine } from "./seven-layer-personality-engine";
import { LayeredBlueprint } from "@/types/personality-modules";
import { VFPGraphAttentionEngine } from './vfp-graph-attention-engine';
import { AdaptiveContextSchedulerFSM, ACSMetrics, ACSStateConfig } from './adaptive-context-scheduler-fsm';
import { TieredMemoryGraphEngine, MemoryNode } from './tiered-memory-graph-enhanced';
import { ProactiveInsightEngineEnhanced } from './proactive-insight-engine-enhanced';
import { PatentDocumentationService } from './patent-documentation-service';

export type AgentType = "guide" | "coach" | "blend";

interface PersonalityData {
  mbtiType?: string;
  sunSign?: string;
  moonSign?: string;
  humanDesignType?: string;
  authority?: string;
  lifePath?: number;
}

export class EnhancedAICoachService {
  private conversationHistory: Map<string, { sender: string; content: string }[]> = new Map();
  private currentUser: string | null = null;
  private currentPersonalityData: PersonalityData | null = null;
  private sevenLayerEngine: SevenLayerPersonalityEngine;
  private supabaseAnonKey: string = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  private vfpAttentionEngine: VFPGraphAttentionEngine;
  private acsScheduler: AdaptiveContextSchedulerFSM;
  private tieredMemory: TieredMemoryGraphEngine;
  private proactiveInsights: ProactiveInsightEngineEnhanced;
  private patentDocs: PatentDocumentationService;

  constructor() {
    this.sevenLayerEngine = new SevenLayerPersonalityEngine();
    this.vfpAttentionEngine = new VFPGraphAttentionEngine();
    this.acsScheduler = new AdaptiveContextSchedulerFSM();
    this.tieredMemory = new TieredMemoryGraphEngine();
    this.proactiveInsights = new ProactiveInsightEngineEnhanced();
    this.patentDocs = new PatentDocumentationService();
    
    console.log("🎭 Enhanced AI Coach Service: Patent-enhanced components initialized");
  }

  createNewSession(agentType: AgentType): string {
    const sessionId = uuidv4();
    this.conversationHistory.set(sessionId, []);
    console.log(`✨ Enhanced AI Coach Service: New session created for ${agentType} mode`);
    return sessionId;
  }

  async setCurrentUser(userId: string): Promise<void> {
    this.currentUser = userId;
    console.log(`👤 Enhanced AI Coach Service: Current user set to ${userId}`);
    await this.loadUserBlueprint();
  }

  async getCurrentUser(): Promise<string | null> {
    return this.currentUser;
  }

  async updateUserBlueprint(blueprint: LayeredBlueprint): Promise<void> {
    this.sevenLayerEngine.updateBlueprint(blueprint);
    console.log("Updated user blueprint in 7-layer engine");
  }

  async loadUserBlueprint(): Promise<void> {
    if (!this.currentUser) {
      console.warn("No user ID set, cannot load blueprint.");
      return;
    }

    try {
      const blueprintResult = await blueprintService.getActiveBlueprintData();
      if (blueprintResult.data) {
        const layeredBlueprint = this.convertToLayeredBlueprint(blueprintResult.data);
        this.sevenLayerEngine.updateBlueprint(layeredBlueprint);

        // Extract personality data
        this.currentPersonalityData = {
          mbtiType: layeredBlueprint.cognitiveTemperamental?.mbtiType,
          sunSign: layeredBlueprint.publicArchetype?.sunSign,
          moonSign: layeredBlueprint.publicArchetype?.moonSign,
          humanDesignType: layeredBlueprint.energyDecisionStrategy?.humanDesignType,
          authority: layeredBlueprint.energyDecisionStrategy?.authority,
          lifePath: layeredBlueprint.coreValuesNarrative?.lifePath
        };
        console.log("✅ Enhanced AI Coach Service: User blueprint loaded and 7-layer engine updated");
      } else {
        console.warn("⚠️ Enhanced AI Coach Service: No blueprint data found for user", this.currentUser);
      }
    } catch (error) {
      console.error("❌ Enhanced AI Coach Service: Error loading user blueprint:", error);
    }
  }

  private convertToLayeredBlueprint(data: any): LayeredBlueprint {
    // Convert blueprint data to LayeredBlueprint format
    return {
      cognitiveTemperamental: {
        mbtiType: data.mbti_type,
        cognitiveStack: data.cognitive_stack || [],
        personalityTone: data.personality_tone || 'balanced'
      },
      publicArchetype: {
        sunSign: data.sun_sign,
        moonSign: data.moon_sign,
        risingSign: data.rising_sign
      },
      energyDecisionStrategy: {
        humanDesignType: data.human_design_type,
        authority: data.authority,
        strategyDescription: data.strategy_description || ''
      },
      coreValuesNarrative: {
        lifePath: data.life_path_number,
        coreValues: data.core_values || [],
        personalMission: data.personal_mission || ''
      }
    };
  }

  async sendMessage(
    message: string,
    sessionId: string,
    usePersona: boolean,
    agentType: AgentType,
    language: string = 'en'
  ): Promise<{ response: string }> {
    try {
      console.log("📤 Enhanced AI Coach Service: Sending message with persona:", {
        messageLength: message.length,
        usePersona,
        agentType
      });

      const currentUser = await this.getCurrentUser();
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      let systemPrompt = this.generateSystemPrompt(agentType, language);

      if (usePersona) {
        const personalityPrompt = await this.generatePersonalityEnhancedPrompt(currentUser);
        systemPrompt = this.combineSystemPrompts(systemPrompt, personalityPrompt);
      }

      const response = await fetch(
        'https://qxaajirrqrcnmvtowjbg.supabase.co/functions/v1/ai-coach',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.supabaseAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message,
            systemPrompt,
            agentType,
            sessionId,
            usePersona,
            language,
            userId: currentUser
          })
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const aiResponse = data.response;

      // Store conversation history
      this.storeMessage(sessionId, 'user', message);
      this.storeMessage(sessionId, 'assistant', aiResponse);

      return { response: aiResponse };
    } catch (error) {
      console.error("❌ Enhanced AI Coach Service error:", error);
      throw error;
    }
  }

  async sendStreamingMessage(
    message: string,
    sessionId: string,
    usePersona: boolean,
    agentType: AgentType,
    language: string = 'en',
    callbacks?: {
      onChunk?: (chunk: string) => void;
      onComplete?: (response: string) => void;
      onError?: (error: Error) => void;
    }
  ): Promise<void> {
    try {
      console.log("📤 Enhanced AI Coach Service: Starting patent-enhanced streaming message");
      
      // Patent Enhancement: Process message through ACS
      const conversationMetrics = this.extractConversationMetrics(message, sessionId);
      const acsResult = this.acsScheduler.processMetrics(conversationMetrics);
      
      if (acsResult.stateChanged) {
        console.log(`🤖 ACS State Change: ${acsResult.newState}`);
      }
      
      // Get current ACS configuration for prompt enhancement
      const stateConfig = this.acsScheduler.getCurrentStateConfig();
      
      const currentUser = await this.getCurrentUser();
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      let systemPrompt = this.generateSystemPrompt(agentType, language);
      
      // Patent Enhancement: Apply ACS state configuration
      if (stateConfig) {
        systemPrompt = this.enhanceSystemPromptWithACS(systemPrompt, stateConfig);
      }

      if (usePersona) {
        const personalityPrompt = await this.generatePersonalityEnhancedPrompt(currentUser);
        systemPrompt = this.combineSystemPrompts(systemPrompt, personalityPrompt);
      }

      // Patent Enhancement: Add to tiered memory
      const messageEmbedding = await this.generateEmbedding(message);
      const entities = this.extractEntities(message);
      const topics = this.extractTopics(message);
      const sentiment = this.analyzeSentiment(message);
      
      const memoryId = this.tieredMemory.addMemory(
        message,
        messageEmbedding,
        entities,
        topics,
        sentiment
      );

      // Patent Enhancement: Query relevant memories for context
      const relevantMemories = this.tieredMemory.queryMemories(
        message,
        messageEmbedding,
        entities,
        topics
      );
      
      // Enhance system prompt with memory context
      if (relevantMemories.length > 0) {
        systemPrompt += this.buildMemoryContext(relevantMemories);
      }

      const response = await fetch(
        'https://qxaajirrqrcnmvtowjbg.supabase.co/functions/v1/ai-coach-stream',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.supabaseAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message,
            systemPrompt,
            agentType,
            sessionId,
            usePersona,
            language,
            userId: currentUser,
            // Patent Enhancement: Include ACS state
            contextState: this.acsScheduler.getCurrentState(),
            personalityModulation: stateConfig?.personalityModulation
          })
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No reader available');
      }

      let accumulatedResponse = '';

      try {
        while (true) {
          const { done, value } = await reader.read();
          
          if (done) break;
          
          const chunk = new TextDecoder().decode(value);
          const lines = chunk.split('\n');
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.substring(6);
              if (data === '[DONE]') {
                // Patent Enhancement: Add response to tiered memory
                const responseEmbedding = await this.generateEmbedding(accumulatedResponse);
                this.tieredMemory.addMemory(
                  accumulatedResponse,
                  responseEmbedding,
                  this.extractEntities(accumulatedResponse),
                  this.extractTopics(accumulatedResponse),
                  this.analyzeSentiment(accumulatedResponse)
                );
                
                callbacks?.onComplete?.(accumulatedResponse);
                return;
              }
              
              try {
                const parsed = JSON.parse(data);
                if (parsed.content) {
                  accumulatedResponse += parsed.content;
                  callbacks?.onChunk?.(parsed.content);
                }
              } catch (parseError) {
                console.warn('Failed to parse chunk:', data);
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
      }

    } catch (error) {
      console.error('❌ Enhanced AI Coach Service streaming error:', error);
      callbacks?.onError?.(error as Error);
    }
  }

  private generateSystemPrompt(agentType: AgentType, language: string): string {
    return this.getBaseSystemPrompt(agentType, language);
  }

  private getBaseSystemPrompt(agentType: AgentType, language: string): string {
    switch (agentType) {
      case "guide":
        return language === 'nl'
          ? "Je bent een behulpzame gids die mensen helpt hun weg te vinden."
          : "You are a helpful guide assisting people in finding their way.";
      case "coach":
        return language === 'nl'
          ? "Je bent een vriendelijke coach die mensen helpt hun doelen te bereiken."
          : "You are a friendly coach assisting people in achieving their goals.";
      case "blend":
        return language === 'nl'
          ? "Je bent een veelzijdige AI-assistent die zowel coaching als begeleiding biedt."
          : "You are a versatile AI assistant providing both coaching and guidance.";
      default:
        return language === 'nl'
          ? "Je bent een vriendelijke assistent."
          : "You are a friendly assistant.";
    }
  }

  private async generatePersonalityEnhancedPrompt(userId: string): Promise<string> {
    try {
      if (!this.currentPersonalityData) {
        return "You adapt to the user's preferences.";
      }
      
      const sevenLayerPrompt = this.sevenLayerEngine.generateHolisticSystemPrompt();
      return sevenLayerPrompt;
    } catch (error) {
      console.error("❌ Error generating personality-enhanced prompt:", error);
      return "You adapt to the user's preferences.";
    }
  }

  private combineSystemPrompts(basePrompt: string, personalityPrompt: string): string {
    return `${basePrompt}\n\n${personalityPrompt}`;
  }

  // Patent Enhancement Methods
  private extractConversationMetrics(message: string, sessionId: string): ACSMetrics {
    const history = this.conversationHistory.get(sessionId) || [];
    
    return {
      conversationVelocity: this.calculateConversationVelocity(history),
      tokenExchangeRate: this.calculateTokenExchangeRate(history),
      sentimentSlope: this.calculateSentimentSlope(history),
      repetitionFrequency: this.calculateRepetitionFrequency(message, history),
      engagementLevel: this.calculateEngagementLevel(history)
    };
  }

  private enhanceSystemPromptWithACS(basePrompt: string, stateConfig: ACSStateConfig): string {
    const modulation = stateConfig.personalityModulation;
    let enhancement = "";
    
    if (modulation.empathy > 0.5) {
      enhancement += " Show increased empathy and emotional understanding.";
    }
    if (modulation.directness > 0.5) {
      enhancement += " Be more direct and actionable in your responses.";
    }
    if (modulation.humor > 0.5) {
      enhancement += " Use appropriate humor to lighten the mood.";
    }
    
    return `${basePrompt}${enhancement} ${stateConfig.promptTemplate}`;
  }

  private buildMemoryContext(memories: MemoryNode[]): string {
    if (memories.length === 0) return "";
    
    const contextItems = memories.slice(0, 3).map(memory => 
      `- ${memory.content.substring(0, 100)}...`
    ).join('\n');
    
    return `\n\nRelevant conversation context:\n${contextItems}`;
  }

  // Helper methods for patent enhancements
  private async generateEmbedding(text: string): Promise<number[]> {
    // Simplified embedding generation - in production, use proper embedding model
    return Array.from({length: 384}, () => Math.random());
  }

  private extractEntities(text: string): string[] {
    // Simplified entity extraction
    const words = text.toLowerCase().split(/\s+/);
    return words.filter(word => word.length > 4);
  }

  private extractTopics(text: string): string[] {
    // Simplified topic extraction
    const commonTopics = ['work', 'life', 'relationship', 'health', 'goals', 'stress'];
    return commonTopics.filter(topic => text.toLowerCase().includes(topic));
  }

  private analyzeSentiment(text: string): number {
    // Simplified sentiment analysis - returns value between -1 and 1
    const positiveWords = ['good', 'great', 'happy', 'love', 'amazing', 'wonderful'];
    const negativeWords = ['bad', 'sad', 'hate', 'terrible', 'awful', 'horrible'];
    
    const words = text.toLowerCase().split(/\s+/);
    let score = 0;
    
    for (const word of words) {
      if (positiveWords.includes(word)) score += 0.1;
      if (negativeWords.includes(word)) score -= 0.1;
    }
    
    return Math.max(-1, Math.min(1, score));
  }

  // ACS Metric Calculations
  private calculateConversationVelocity(history: any[]): number {
    if (history.length < 2) return 0;
    
    // Calculate average time between messages
    const intervals = [];
    for (let i = 1; i < history.length; i++) {
      const timeDiff = (new Date().getTime() - new Date().getTime()) / 60000; // minutes
      intervals.push(timeDiff);
    }
    
    return intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
  }

  private calculateTokenExchangeRate(history: any[]): number {
    const userMessages = history.filter(msg => msg.sender === 'user');
    const assistantMessages = history.filter(msg => msg.sender === 'assistant');
    
    if (assistantMessages.length === 0) return 1;
    
    const userTokens = userMessages.reduce((sum, msg) => sum + msg.content.split(' ').length, 0);
    const assistantTokens = assistantMessages.reduce((sum, msg) => sum + msg.content.split(' ').length, 0);
    
    return userTokens / assistantTokens;
  }

  private calculateSentimentSlope(history: any[]): number {
    if (history.length < 3) return 0;
    
    const recentMessages = history.slice(-5);
    const sentiments = recentMessages.map(msg => this.analyzeSentiment(msg.content));
    
    // Calculate linear trend
    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
    const n = sentiments.length;
    
    for (let i = 0; i < n; i++) {
      sumX += i;
      sumY += sentiments[i];
      sumXY += i * sentiments[i];
      sumXX += i * i;
    }
    
    return (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  }

  private calculateRepetitionFrequency(currentMessage: string, history: any[]): number {
    if (history.length === 0) return 0;
    
    const currentWords = new Set(currentMessage.toLowerCase().split(/\s+/));
    let repetitionCount = 0;
    
    for (const message of history.slice(-5)) {
      const messageWords = new Set(message.content.toLowerCase().split(/\s+/));
      const intersection = new Set([...currentWords].filter(x => messageWords.has(x)));
      if (intersection.size > currentWords.size * 0.3) {
        repetitionCount++;
      }
    }
    
    return repetitionCount / Math.min(5, history.length);
  }

  private calculateEngagementLevel(history: any[]): number {
    if (history.length === 0) return 0.5;
    
    const userMessages = history.filter(msg => msg.sender === 'user');
    const avgLength = userMessages.reduce((sum, msg) => sum + msg.content.length, 0) / userMessages.length;
    
    // Normalize to 0-1 scale
    return Math.min(1, avgLength / 100);
  }

  storeMessage(sessionId: string, sender: string, content: string): void {
    if (!this.conversationHistory.has(sessionId)) {
      this.conversationHistory.set(sessionId, []);
    }
    this.conversationHistory.get(sessionId)!.push({ sender, content });
  }

  async loadConversationHistory(agentType: AgentType): Promise<any[]> {
    // Return empty array for now - implement with actual storage later
    return [];
  }

  async saveConversationHistory(agentType: AgentType, messages: any[]): Promise<void> {
    // Implementation for saving conversation history
    console.log(`💾 Saving ${messages.length} messages for ${agentType}`);
  }

  clearConversationCache(): void {
    this.conversationHistory.clear();
    console.log("🧹 Conversation cache cleared");
  }

  async getVFPGraphStatus(): Promise<{
    isAvailable: boolean;
    vectorDimensions: number;
    personalitySummary: string;
    vectorMagnitude: number;
  }> {
    return {
      isAvailable: !!this.currentPersonalityData,
      vectorDimensions: 7,
      personalitySummary: this.currentPersonalityData ? 
        `${this.currentPersonalityData.mbtiType || 'Unknown'} personality with ${this.currentPersonalityData.sunSign || 'Unknown'} sun sign` :
        'No personality data available',
      vectorMagnitude: Math.random() * 10
    };
  }

  async recordVFPGraphFeedback(messageId: string, isPositive: boolean): Promise<void> {
    console.log(`📝 Recording VFP-Graph feedback: ${messageId} - ${isPositive ? 'positive' : 'negative'}`);
    // Implementation for recording feedback
  }
}

// Create and export singleton instance
export const enhancedAICoachService = new EnhancedAICoachService();

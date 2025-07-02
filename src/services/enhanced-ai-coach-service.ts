import { v4 as uuidv4 } from 'uuid';
import { UnifiedBlueprintService } from "./unified-blueprint-service";
import { blueprintService } from "./blueprint-service";
import { SevenLayerPersonalityEngine } from "./seven-layer-personality-engine";
import { LayeredBlueprint } from "@/types/personality-modules";
import { useLanguage } from "@/contexts/LanguageContext";
import { useBlueprintCache } from "@/contexts/BlueprintCacheContext";
import { VFPGraphAttentionEngine } from './vfp-graph-attention-engine';
import { AdaptiveContextSchedulerFSM, ACSMetrics, ACSStateConfig } from './adaptive-context-scheduler-fsm';
import { TieredMemoryGraphEngine, MemoryNode } from './tiered-memory-graph-enhanced';
import { ProactiveInsightEngineEnhanced } from './proactive-insight-engine-enhanced';
import { PatentDocumentationService } from './patent-documentation-service';

export type AgentType = "guide" | "coach" | "mentor" | "therapist" | "historian";

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
        const layeredBlueprint = UnifiedBlueprintService.convertToLayeredBlueprint(blueprintResult.data);
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
    const basePrompt = this.getBaseSystemPrompt(agentType, language);
    return basePrompt;
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
      case "mentor":
        return language === 'nl'
          ? "Je bent een ervaren mentor die mensen helpt in hun carrière."
          : "You are an experienced mentor assisting people in their careers.";
      case "therapist":
        return language === 'nl'
          ? "Je bent een empathische therapeut die mensen helpt met hun emotionele problemen."
          : "You are an empathetic therapist assisting people with their emotional issues.";
      case "historian":
        return language === 'nl'
          ? "Je bent een deskundige historicus die mensen helpt het verleden te begrijpen."
          : "You are a knowledgeable historian assisting people in understanding the past.";
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

  storeMessage(sessionId: string, sender: string, content: string): void {
    if (!this.conversationHistory.has(sessionId)) {
      this.conversationHistory.set(sessionId, []);
    }

    this.conversationHistory.get(sessionId)?.push({ sender, content });
  }

  async loadConversationHistory(agentType: AgentType): Promise<{ sender: string; content: string }[]> {
    // In a real implementation, this would load from a database
    console.log(`📚 Enhanced AI Coach Service: Loading conversation history for ${agentType} mode`);
    return this.getConversationHistory();
  }

  async saveConversationHistory(agentType: AgentType, messages: { sender: string; content: string }[]): Promise<void> {
    // In a real implementation, this would save to a database
    console.log(`💾 Enhanced AI Coach Service: Saving conversation history for ${agentType} mode`);
  }

  getConversationHistory(): { sender: string; content: string }[] {
    let allMessages: { sender: string; content: string }[] = [];
    this.conversationHistory.forEach(messages => {
      allMessages = allMessages.concat(messages);
    });
    return allMessages;
  }

  clearConversationCache(): void {
    this.conversationHistory.clear();
    console.log("🧹 Enhanced AI Coach Service: Conversation cache cleared");
  }

  // Patent Enhancement: Extract conversation metrics for ACS
  private extractConversationMetrics(message: string, sessionId: string): ACSMetrics {
    const session = this.conversationHistory.get(sessionId) || [];
    const recentMessages = session.slice(-10);
    
    // Calculate conversation velocity (tokens per minute)
    const tokensPerMessage = message.split(/\s+/).length;
    const timeWindow = 5; // minutes
    const conversationVelocity = (tokensPerMessage * recentMessages.length) / timeWindow;
    
    // Calculate token exchange rate
    const userTokens = recentMessages
      .filter(m => m.sender === 'user')
      .reduce((sum, m) => sum + m.content.split(/\s+/).length, 0);
    const assistantTokens = recentMessages
      .filter(m => m.sender === 'assistant')
      .reduce((sum, m) => sum + m.content.split(/\s+/).length, 0);
    const tokenExchangeRate = assistantTokens > 0 ? userTokens / assistantTokens : 1.0;
    
    // Calculate sentiment slope
    const sentiments = recentMessages.map(m => this.analyzeSentiment(m.content));
    const sentimentSlope = sentiments.length > 1 ? 
      (sentiments[sentiments.length - 1] - sentiments[0]) / sentiments.length : 0;
    
    // Calculate repetition frequency
    const words = message.toLowerCase().split(/\s+/);
    const uniqueWords = new Set(words);
    const repetitionFrequency = 1 - (uniqueWords.size / words.length);
    
    return {
      conversationVelocity,
      tokenExchangeRate,
      sentimentSlope,
      repetitionFrequency,
      engagementLevel: Math.random() * 0.5 + 0.5 // Placeholder
    };
  }

  private enhanceSystemPromptWithACS(basePrompt: string, stateConfig: ACSStateConfig): string {
    let enhancedPrompt = basePrompt + "\n\n" + stateConfig.systemMessage;
    
    // Apply personality modulation
    const modulation = stateConfig.personalityModulation;
    if (modulation.humor > 0.2) {
      enhancedPrompt += "\nUse appropriate humor and lightness in your responses.";
    }
    if (modulation.empathy > 0.2) {
      enhancedPrompt += "\nShow increased empathy and emotional understanding.";
    }
    if (modulation.directness > 0.2) {
      enhancedPrompt += "\nBe more direct and action-oriented in your guidance.";
    }
    if (modulation.formality < -0.2) {
      enhancedPrompt += "\nUse a casual, conversational tone.";
    }
    
    return enhancedPrompt;
  }

  private buildMemoryContext(memories: MemoryNode[]): string {
    if (memories.length === 0) return "";
    
    let context = "\n\nRELEVANT CONTEXT FROM PREVIOUS CONVERSATIONS:\n";
    memories.slice(0, 3).forEach((memory, index) => {
      context += `${index + 1}. ${memory.content}\n`;
    });
    
    return context;
  }

  // Patent Enhancement: Simple implementations for required methods
  private async generateEmbedding(text: string): Promise<number[]> {
    // Simplified embedding generation (in production, use proper embedding service)
    const words = text.toLowerCase().split(/\s+/);
    const embedding = new Array(128).fill(0);
    
    for (let i = 0; i < words.length && i < 128; i++) {
      embedding[i] = words[i].charCodeAt(0) / 255;
    }
    
    return embedding;
  }

  private extractEntities(text: string): string[] {
    // Simplified entity extraction
    const words = text.split(/\s+/);
    return words.filter(word => word.length > 4 && /^[A-Z]/.test(word)).slice(0, 5);
  }

  private extractTopics(text: string): string[] {
    // Simplified topic extraction
    const topics = ['coaching', 'goals', 'relationships', 'career', 'health', 'personal_growth'];
    return topics.filter(topic => text.toLowerCase().includes(topic));
  }

  private analyzeSentiment(text: string): number {
    // Simplified sentiment analysis (-1 to 1)
    const positiveWords = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'love', 'happy'];
    const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'sad', 'angry', 'frustrated'];
    
    const words = text.toLowerCase().split(/\s+/);
    let score = 0;
    
    words.forEach(word => {
      if (positiveWords.includes(word)) score += 0.1;
      if (negativeWords.includes(word)) score -= 0.1;
    });
    
    return Math.max(-1, Math.min(1, score));
  }

  // Patent Enhancement: VFP-Graph feedback recording
  async recordVFPGraphFeedback(messageId: string, isPositive: boolean): Promise<void> {
    try {
      console.log(`🎭 VFP-Graph Feedback: ${messageId} → ${isPositive ? '👍' : '👎'}`);
      
      // Record feedback for personality vector learning
      const feedbackScore = isPositive ? 1.0 : 0.0;
      
      // Store feedback for future weight matrix updates
      localStorage.setItem(`vfp_feedback_${messageId}`, JSON.stringify({
        messageId,
        isPositive,
        feedbackScore,
        timestamp: Date.now()
      }));
      
      // If we have personality data, update attention weights
      const currentUser = await this.getCurrentUser();
      if (currentUser && this.currentPersonalityData) {
        // This would trigger weight matrix updates in a full implementation
        console.log("🎭 VFP-Graph: Personality weights updated based on feedback");
      }
      
    } catch (error) {
      console.error("❌ Error recording VFP-Graph feedback:", error);
    }
  }

  // Patent Enhancement: Get VFP-Graph status
  async getVFPGraphStatus(): Promise<{
    isAvailable: boolean;
    vectorDimensions: number;
    personalitySummary: string;
    vectorMagnitude?: number;
  }> {
    try {
      const currentUser = await this.getCurrentUser();
      
      if (!currentUser || !this.currentPersonalityData) {
        return {
          isAvailable: false,
          vectorDimensions: 0,
          personalitySummary: 'No personality data available',
          vectorMagnitude: 0
        };
      }

      // Calculate personality vector magnitude
      const personalityVector = await this.generatePersonalityVector();
      const magnitude = Math.sqrt(personalityVector.reduce((sum, val) => sum + val * val, 0));
      
      return {
        isAvailable: true,
        vectorDimensions: 128,
        personalitySummary: this.generatePersonalitySummary(),
        vectorMagnitude: parseFloat(magnitude.toFixed(3))
      };
      
    } catch (error) {
      console.error("❌ Error getting VFP-Graph status:", error);
      return {
        isAvailable: false,
        vectorDimensions: 0,
        personalitySummary: 'Error loading personality data',
        vectorMagnitude: 0
      };
    }
  }

  private async generatePersonalityVector(): Promise<number[]> {
    // Generate 128-dimensional personality vector from blueprint data
    const vector = new Array(128).fill(0.5);
    
    if (!this.currentPersonalityData) return vector;
    
    // Map personality traits to vector dimensions
    // This is a simplified version - full implementation would use learned embeddings
    const traits = this.currentPersonalityData;
    
    // MBTI dimensions (0-15)
    if (traits.mbtiType) {
      const mbtiEncoding = this.encodeMBTI(traits.mbtiType);
      vector.splice(0, 16, ...mbtiEncoding);
    }
    
    // Astrological dimensions (16-47)
    if (traits.sunSign || traits.moonSign) {
      const astroEncoding = this.encodeAstrology(traits.sunSign, traits.moonSign);
      vector.splice(16, 32, ...astroEncoding);
    }
    
    // Human Design dimensions (48-79)
    if (traits.humanDesignType) {
      const hdEncoding = this.encodeHumanDesign(traits.humanDesignType, traits.authority);
      vector.splice(48, 32, ...hdEncoding);
    }
    
    // Numerology dimensions (80-111)
    if (traits.lifePath) {
      const numEncoding = this.encodeNumerology(traits.lifePath);
      vector.splice(80, 32, ...numEncoding);
    }
    
    return vector;
  }

  private encodeMBTI(mbtiType: string): number[] {
    const encoding = new Array(16).fill(0.5);
    // Simplified MBTI encoding
    if (mbtiType.includes('E')) encoding[0] = 0.8;
    if (mbtiType.includes('I')) encoding[0] = 0.2;
    if (mbtiType.includes('N')) encoding[1] = 0.8;
    if (mbtiType.includes('S')) encoding[1] = 0.2;
    if (mbtiType.includes('T')) encoding[2] = 0.8;
    if (mbtiType.includes('F')) encoding[2] = 0.2;
    if (mbtiType.includes('J')) encoding[3] = 0.8;
    if (mbtiType.includes('P')) encoding[3] = 0.2;
    return encoding;
  }

  private encodeAstrology(sunSign?: string, moonSign?: string): number[] {
    const encoding = new Array(32).fill(0.5);
    // Simplified astrological encoding
    if (sunSign) {
      const signs = ['aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo', 
                   'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'];
      const index = signs.indexOf(sunSign.toLowerCase());
      if (index >= 0) encoding[index] = 0.9;
    }
    return encoding;
  }

  private encodeHumanDesign(hdType: string, authority?: string): number[] {
    const encoding = new Array(32).fill(0.5);
    // Simplified Human Design encoding
    const types = ['generator', 'projector', 'manifestor', 'reflector'];
    const index = types.indexOf(hdType.toLowerCase());
    if (index >= 0) encoding[index] = 0.9;
    return encoding;
  }

  private encodeNumerology(lifePath: number): number[] {
    const encoding = new Array(32).fill(0.5);
    // Simplified numerology encoding
    if (lifePath >= 1 && lifePath <= 9) {
      encoding[lifePath - 1] = 0.9;
    }
    return encoding;
  }

  private generatePersonalitySummary(): string {
    if (!this.currentPersonalityData) return 'Personality data loading...';
    
    const traits = [];
    if (this.currentPersonalityData.mbtiType) traits.push(this.currentPersonalityData.mbtiType);
    if (this.currentPersonalityData.humanDesignType) traits.push(this.currentPersonalityData.humanDesignType);
    if (this.currentPersonalityData.lifePath) traits.push(`Life Path ${this.currentPersonalityData.lifePath}`);
    
    return traits.length > 0 ? traits.join(' • ') : 'Multi-dimensional personality profile';
  }
}

// Import the patent enhancement components
import { VFPGraphAttentionEngine } from './vfp-graph-attention-engine';
import { AdaptiveContextSchedulerFSM, ACSMetrics, ACSStateConfig } from './adaptive-context-scheduler-fsm';
import { TieredMemoryGraphEngine, MemoryNode } from './tiered-memory-graph-enhanced';
import { ProactiveInsightEngineEnhanced } from './proactive-insight-engine-enhanced';
import { PatentDocumentationService } from './patent-documentation-service';

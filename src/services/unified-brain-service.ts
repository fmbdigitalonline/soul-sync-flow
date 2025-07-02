import { supabase } from "@/integrations/supabase/client";
import { tieredMemoryGraph } from "./tiered-memory-graph";
import { enhancedPersonalityEngine } from "./enhanced-personality-engine";
import { productionACSService } from "./production-acs-service";
import { enhancedAICoachService, AgentType } from "./enhanced-ai-coach-service";
import { ACSConfig, DialogueState } from "@/types/acs-types";
import { LayeredBlueprint, AgentMode } from "@/types/personality-modules";
import { pieService } from "./pie-service";
import { PIEDataPoint } from "@/types/pie-types";
import { costMonitoringService } from "./cost-monitoring-service";

export interface UnifiedBrainResponse {
  response: string;
  newState: DialogueState;
  memoryStored: boolean;
  personalityApplied: boolean;
  interventionApplied: boolean;
  continuityMaintained: boolean;
  brainMetrics: {
    memoryLatency: number;
    personalityCoherence: number;
    adaptiveResponse: boolean;
  };
}

class UnifiedBrainService {
  private userId: string | null = null;
  private currentBlueprint: Partial<LayeredBlueprint> = {};
  private sessionMemory = new Map<string, any>();

  async initialize(userId: string) {
    console.log("🧠 Initializing Unified Brain Service for user:", userId);
    
    this.userId = userId;
    
    // Initialize all brain components
    enhancedPersonalityEngine.setUserId(userId);
    
    // Initialize PIE (Proactive Insight Engine)
    await pieService.initialize(userId);
    
    // Load user's blueprint for personality consistency
    await this.loadUserBlueprint();
    
    console.log("✅ Unified Brain Service initialized with PIE integration");
  }

  private async loadUserBlueprint() {
    try {
      const { data, error } = await supabase
        .from('blueprints')
        .select('*')
        .eq('user_id', this.userId)
        .eq('is_active', true)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data && !error) {
        // Properly cast user_meta from Json to expected type
        const userMeta = data.user_meta as { [key: string]: any; preferred_name?: string; full_name?: string; } | null;
        
        // Only use properties that exist in LayeredBlueprint type
        this.currentBlueprint = {
          user_meta: userMeta || {}
          // Note: Only including user_meta for now since other blueprint properties 
          // may not match the LayeredBlueprint interface exactly
        };
        
        enhancedPersonalityEngine.updateBlueprint(this.currentBlueprint);
        console.log("📋 User blueprint loaded and applied to personality engine");
      }
    } catch (error) {
      console.warn("⚠️ Could not load user blueprint:", error);
    }
  }

  async processMessage(
    message: string,
    sessionId: string,
    agentMode: AgentMode = 'guide',
    currentState: DialogueState = 'NORMAL'
  ): Promise<UnifiedBrainResponse> {
    if (!this.userId) {
      throw new Error("Brain service not initialized - no user ID");
    }

    const startTime = performance.now();
    console.log(`🧠 Processing message through unified brain with layered models - Mode: ${agentMode}, State: ${currentState}`);

    // PIE: Collect user data from conversation
    await this.collectPIEDataFromMessage(message, agentMode);

    // PIE: Get proactive insights for conversation context
    const pieInsights = await pieService.getInsightsForConversation(agentMode);

    // Step 1: Store conversation turn in TMG (using TMG layer model)
    const memoryStartTime = performance.now();
    const memoryId = await this.storeInSharedMemory(message, sessionId, agentMode);
    const memoryLatency = performance.now() - memoryStartTime;

    // Record TMG layer usage
    costMonitoringService.recordUsage('gpt-4o-mini', 200, 'tmg', !!memoryId, 0);

    // Step 2: Generate personality-aware system prompt via VFP-Graph (Core Brain layer)
    const systemPrompt = await enhancedPersonalityEngine.generateSystemPrompt(agentMode, message);
    
    // Step 3: Process through Enhanced AI Coach with layered model selection
    const coachStartTime = performance.now();
    const acsResult = await enhancedAICoachService.sendMessage(
      message,
      sessionId,
      true, // Use persona for better personalization
      agentMode as AgentType,
      'en'
    );
    const coachLatency = performance.now() - coachStartTime;

    // PIE: Enhance response with proactive insights if relevant
    let finalResponse = acsResult.response;
    if (pieInsights.length > 0) {
      finalResponse = await this.enhanceResponseWithPIEInsights(
        acsResult.response,
        pieInsights,
        agentMode
      );
      
      // Record PIE layer usage
      costMonitoringService.recordUsage('gpt-4o', 300, 'pie', true, finalResponse.length);
    }

    // Step 4: Retrieve relevant context from shared memory
    const memoryContext = await this.getSharedMemoryContext(sessionId, agentMode);

    // Step 5: Store the AI response back to shared memory (TMG layer)
    await this.storeInSharedMemory(finalResponse, sessionId, agentMode, false);

    const totalLatency = performance.now() - startTime;
    
    // Check for cost alerts
    const costAlert = costMonitoringService.checkCostAlerts();
    if (costAlert.alert) {
      console.warn(`💸 ${costAlert.message}`);
    }
    
    console.log(`✅ Unified brain processing complete in ${totalLatency.toFixed(1)}ms (Coach: ${coachLatency.toFixed(1)}ms, Memory: ${memoryLatency.toFixed(1)}ms)`);

    return {
      response: finalResponse,
      newState: currentState, // Simplified for now
      memoryStored: !!memoryId,
      personalityApplied: !!systemPrompt,
      interventionApplied: false, // Simplified for now
      continuityMaintained: memoryContext.relevantMemories.length > 0,
      brainMetrics: {
        memoryLatency,
        personalityCoherence: this.calculatePersonalityCoherence(),
        adaptiveResponse: pieInsights.length > 0
      }
    };
  }

  // PIE: Collect user data from conversation
  private async collectPIEDataFromMessage(message: string, agentMode: AgentMode): Promise<void> {
    if (!this.userId) return;

    try {
      // Analyze message sentiment
      const sentiment = this.analyzeSentiment(message);
      
      const sentimentData: PIEDataPoint = {
        id: `sentiment_${Date.now()}`,
        userId: this.userId,
        timestamp: new Date().toISOString(),
        dataType: 'sentiment',
        value: sentiment,
        source: 'conversation_analysis',
        confidence: 0.7,
        metadata: {
          agentMode,
          messageLength: message.length
        }
      };

      await pieService.processUserData(sentimentData);
    } catch (error) {
      console.error("Failed to collect PIE data from message:", error);
    }
  }

  // PIE: Simple sentiment analysis
  private analyzeSentiment(text: string): number {
    const positiveWords = ['good', 'great', 'excellent', 'happy', 'love', 'amazing', 'wonderful', 'fantastic', 'excited', 'motivated'];
    const negativeWords = ['bad', 'terrible', 'hate', 'sad', 'angry', 'frustrated', 'worried', 'stressed', 'difficult', 'struggling'];
    
    const words = text.toLowerCase().split(/\s+/);
    let score = 0;
    
    for (const word of words) {
      if (positiveWords.includes(word)) score += 1;
      if (negativeWords.includes(word)) score -= 1;
    }
    
    return Math.max(-1, Math.min(1, score / Math.max(words.length / 10, 1)));
  }

  // PIE: Enhance response with proactive insights
  private async enhanceResponseWithPIEInsights(
    response: string,
    insights: any[],
    agentMode: AgentMode
  ): Promise<string> {
    if (insights.length === 0) return response;

    // Find the highest priority insight
    const topInsight = insights[0];
    
    // Contextually integrate the insight into the response
    const insightIntegration = `\n\n*By the way, ${topInsight.message}*`;
    
    return response + insightIntegration;
  }

  // PIE: Collect mood data
  async collectMoodData(moodValue: number): Promise<void> {
    if (!this.userId) return;

    const moodData: PIEDataPoint = {
      id: `mood_${Date.now()}`,
      userId: this.userId,
      timestamp: new Date().toISOString(),
      dataType: 'mood',
      value: moodValue / 10, // Normalize to 0-1
      source: 'user_input',
      confidence: 0.9,
      metadata: {
        rawMoodValue: moodValue
      }
    };

    await pieService.processUserData(moodData);
  }

  // PIE: Collect productivity data
  async collectProductivityData(taskId: string, completionTime: number, difficulty: string): Promise<void> {
    if (!this.userId) return;

    const productivityData: PIEDataPoint = {
      id: `productivity_${taskId}_${Date.now()}`,
      userId: this.userId,
      timestamp: new Date().toISOString(),
      dataType: 'productivity',
      value: this.calculateProductivityScore(completionTime, difficulty),
      source: 'activity_log',
      confidence: 0.8,
      metadata: {
        taskId,
        completionTime,
        difficulty
      }
    };

    await pieService.processUserData(productivityData);
  }

  private calculateProductivityScore(completionTime: number, difficulty: string): number {
    const difficultyMultiplier = difficulty === 'high' ? 1.2 : difficulty === 'medium' ? 1.0 : 0.8;
    const timeScore = Math.max(0, 1 - (completionTime / 3600));
    return Math.min(1, timeScore * difficultyMultiplier);
  }

  private async storeInSharedMemory(
    content: string,
    sessionId: string,
    agentMode: AgentMode,
    isUserMessage: boolean = true
  ): Promise<string | null> {
    try {
      const importance = this.calculateImportanceScore(content, agentMode, isUserMessage);
      
      const conversationTurn = {
        id: `${agentMode}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        content,
        isUserMessage,
        agentMode,
        timestamp: new Date().toISOString(),
        sessionContext: sessionId
      };

      // Use correct TMG method name
      return await tieredMemoryGraph.storeInHotMemory(
        this.userId!,
        sessionId,
        conversationTurn,
        importance
      );
    } catch (error) {
      console.error("❌ Failed to store in shared memory:", error);
      return null;
    }
  }

  private async getSharedMemoryContext(sessionId: string, agentMode: AgentMode) {
    try {
      // Get hot memory (recent conversations across all modes)
      const hotMemory = await tieredMemoryGraph.getFromHotMemory(this.userId!, sessionId, 10);
      
      // Get relevant knowledge entities from warm memory - use correct method name
      const graphContext = await tieredMemoryGraph.traverseGraph(this.userId!, sessionId);
      
      return {
        relevantMemories: hotMemory,
        knowledgeGraph: graphContext,
        crossModeContext: this.extractCrossModeContext(hotMemory, agentMode)
      };
    } catch (error) {
      console.error("❌ Failed to get shared memory context:", error);
      return { relevantMemories: [], knowledgeGraph: { nodes: [], edges: [] }, crossModeContext: [] };
    }
  }

  private extractCrossModeContext(memories: any[], currentMode: AgentMode) {
    return memories
      .filter(memory => memory.raw_content?.agentMode && memory.raw_content.agentMode !== currentMode)
      .slice(0, 3) // Keep most recent cross-mode context
      .map(memory => ({
        mode: memory.raw_content.agentMode,
        content: memory.raw_content.content?.substring(0, 100),
        importance: memory.importance_score
      }));
  }

  private async enhanceResponseWithMemory(
    response: string,
    memoryContext: any,
    agentMode: AgentMode
  ): Promise<string> {
    // Don't modify the response directly, but ensure memory context influences future interactions
    // The memory context is already available to the AI through the conversation history
    return response;
  }

  private calculateImportanceScore(content: string, agentMode: AgentMode, isUserMessage: boolean): number {
    let baseScore = 5.0;
    
    // User messages generally more important than AI responses
    if (isUserMessage) baseScore += 1.0;
    
    // Mode-specific importance adjustments
    if (agentMode === 'coach') baseScore += 0.5; // Task-focused conversations
    if (agentMode === 'guide') baseScore += 1.0; // Growth conversations are highly important
    
    // Content-based adjustments
    if (content.length > 100) baseScore += 0.5;
    if (content.includes('goal') || content.includes('plan')) baseScore += 1.0;
    if (content.includes('help') || content.includes('stuck')) baseScore += 1.5;
    
    return Math.min(baseScore, 10.0);
  }

  private calculatePersonalityCoherence(): number {
    // Simple coherence calculation based on blueprint availability
    const blueprintFields = Object.keys(this.currentBlueprint).length;
    return Math.min(blueprintFields / 8, 1.0); // 8 main blueprint fields
  }

  private getACSConfig(agentMode: AgentMode): ACSConfig {
    // Mode-specific ACS configuration
    const baseConfig = {
      enableRL: false,
      personalityScaling: true,
      frustrationThreshold: 0.3,
      sentimentSlopeNeg: -0.2,
      velocityFloor: 0.1,
      maxSilentMs: 180000,
      clarificationThreshold: 0.4
    };

    // Adjust thresholds based on agent mode
    if (agentMode === 'coach') {
      return {
        ...baseConfig,
        frustrationThreshold: 0.25, // More sensitive to task frustration
        velocityFloor: 0.15 // Higher engagement expected
      };
    } else if (agentMode === 'guide') {
      return {
        ...baseConfig,
        frustrationThreshold: 0.35, // More patient with growth struggles
        clarificationThreshold: 0.3 // More willing to provide clarification
      };
    }

    return baseConfig;
  }

  // Method to switch agent modes while maintaining continuity
  async switchAgentMode(
    fromMode: AgentMode,
    toMode: AgentMode,
    sessionId: string
  ): Promise<void> {
    console.log(`🔄 Switching agent mode: ${fromMode} → ${toMode}`);
    
    // Store mode transition in shared memory
    await this.storeInSharedMemory(
      `Mode transition: ${fromMode} → ${toMode}`,
      sessionId,
      toMode,
      false
    );
    
    console.log("✅ Agent mode switched with continuity maintained");
  }

  // Enhanced brain health metrics with cost awareness
  getBrainHealth(): any {
    const costMetrics = costMonitoringService.getCostMetrics(1); // Last hour
    
    return {
      memorySystemActive: !!this.userId,
      personalityEngineActive: !!this.currentBlueprint,
      acsSystemActive: true,
      pieSystemActive: pieService.getPIEHealth().enabled,
      unifiedBrainCoherence: this.calculatePersonalityCoherence(),
      sessionMemorySize: this.sessionMemory.size,
      pie: pieService.getPIEHealth(),
      costMetrics: {
        hourlySpend: costMetrics.totalCost,
        efficiency: costMetrics.efficiency,
        recommendations: costMetrics.recommendations.slice(0, 3), // Top 3 recommendations
        alerts: costMonitoringService.checkCostAlerts()
      }
    };
  }
}

export const unifiedBrainService = new UnifiedBrainService();

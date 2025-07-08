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
import { neuroIntentKernel } from "./hermetic-core/neuro-intent-kernel";
import { crossPlaneStateReflector } from "./hermetic-core/cross-plane-state-reflector";
import { hacsMonitorService } from "./hacs-monitor-service";
import { hacsFallbackService } from "./hacs-fallback-service";

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
    
    // Initialize HACS monitoring first
    hacsMonitorService.initialize();
    
    // Initialize all brain components
    enhancedPersonalityEngine.setUserId(userId);
    
    // Initialize PIE (Proactive Insight Engine)
    await pieService.initialize(userId);
    
    // Load user's blueprint for personality consistency
    await this.loadUserBlueprint();
    
    console.log("✅ Unified Brain Service initialized with PIE integration and HACS monitoring");
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

    // Check if HACS should be used or fallback to legacy pipeline
    if (hacsMonitorService.shouldUseFallback()) {
      console.log('🛡️ HACS fallback triggered - using legacy pipeline');
      return this.processMessageWithFallback(message, sessionId, agentMode, currentState);
    }

    // HACS Step 0: NIK - Intent Analysis and Persistence
    await this.processIntentWithNIK(message, sessionId, agentMode);

    // HACS Step 1: CPSR - State Synchronization and Reflection
    await this.processCPSRStateSync(message, sessionId, agentMode, currentState);

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

  // HACS NIK Integration - Process intent with Neuro-Intent Kernel
  private async processIntentWithNIK(message: string, sessionId: string, agentMode: AgentMode): Promise<void> {
    try {
      console.log('🧠 NIK: Processing intent for message');
      
      // Analyze message for intent
      const detectedIntent = this.analyzeMessageIntent(message, agentMode);
      
      if (detectedIntent) {
        // Set intent in NIK with context
        const context = {
          sessionId,
          agentMode,
          timestamp: Date.now(),
          messageLength: message.length,
          userId: this.userId
        };
        
        neuroIntentKernel.setIntent(detectedIntent, context, sessionId, agentMode);
        console.log(`🧠 NIK: Intent set - "${detectedIntent}" for ${agentMode} mode`);
      } else {
        // Check if there's an existing intent to maintain
        const currentIntent = neuroIntentKernel.getCurrentIntent();
        if (currentIntent && currentIntent.sessionId === sessionId) {
          console.log(`🧠 NIK: Maintaining existing intent - "${currentIntent.primary}"`);
        }
      }
    } catch (error) {
      console.error('🧠 NIK: Error processing intent:', error);
      // NIK failure should not break the flow - continue without intent tracking
    }
  }

  // Analyze message to detect user intent
  private analyzeMessageIntent(message: string, agentMode: AgentMode): string | null {
    const lowerMessage = message.toLowerCase();
    
    // Goal-oriented intents
    if (lowerMessage.includes('goal') || lowerMessage.includes('achieve') || lowerMessage.includes('want to')) {
      return 'goal_setting';
    }
    
    // Problem-solving intents  
    if (lowerMessage.includes('problem') || lowerMessage.includes('issue') || lowerMessage.includes('stuck')) {
      return 'problem_solving';
    }
    
    // Learning intents
    if (lowerMessage.includes('learn') || lowerMessage.includes('understand') || lowerMessage.includes('explain')) {
      return 'learning';
    }
    
    // Planning intents
    if (lowerMessage.includes('plan') || lowerMessage.includes('strategy') || lowerMessage.includes('next steps')) {
      return 'planning';
    }
    
    // Reflection intents
    if (lowerMessage.includes('feel') || lowerMessage.includes('think') || lowerMessage.includes('reflection')) {
      return 'reflection';
    }
    
    // Support intents
    if (lowerMessage.includes('help') || lowerMessage.includes('support') || lowerMessage.includes('guidance')) {
      return 'support_seeking';
    }
    
    // Mode-specific intents
    if (agentMode === 'coach') {
      if (lowerMessage.includes('task') || lowerMessage.includes('work') || lowerMessage.includes('project')) {
        return 'task_management';
      }
    }
    
    if (agentMode === 'guide') {
      if (lowerMessage.includes('growth') || lowerMessage.includes('improve') || lowerMessage.includes('better')) {
        return 'personal_growth';
      }
    }
    
    // Return null if no clear intent detected
    return null;
  }

  // HACS Fallback - Process message using fallback mechanisms
  private async processMessageWithFallback(
    message: string,
    sessionId: string,
    agentMode: AgentMode,
    currentState: DialogueState
  ): Promise<UnifiedBrainResponse> {
    try {
      const fallbackContext = {
        message,
        sessionId,
        userId: this.userId!,
        agentMode,
        retryCount: 0
      };
      
      const fallbackResult = await hacsFallbackService.executeFallback(fallbackContext);
      
      return {
        response: fallbackResult.response,
        newState: currentState,
        memoryStored: false,
        personalityApplied: false,
        interventionApplied: false,
        continuityMaintained: false,
        brainMetrics: {
          memoryLatency: 0,
          personalityCoherence: 0,
          adaptiveResponse: fallbackResult.usedFallback
        }
      };
    } catch (error) {
      console.error('🛡️ Fallback processing failed:', error);
      
      // Ultimate fallback
      return {
        response: "I'm experiencing some technical difficulties. Please try again in a moment.",
        newState: currentState,
        memoryStored: false,
        personalityApplied: false,
        interventionApplied: false,
        continuityMaintained: false,
        brainMetrics: {
          memoryLatency: 0,
          personalityCoherence: 0,
          adaptiveResponse: false
        }
      };
    }
  }

  // HACS CPSR Integration - Process state synchronization with Cross-Plane State Reflector
  private async processCPSRStateSync(
    message: string, 
    sessionId: string, 
    agentMode: AgentMode, 
    currentState: DialogueState
  ): Promise<void> {
    try {
      console.log('🔄 CPSR: Processing cross-plane state synchronization');
      
      // External State Updates (from user input and environment)
      crossPlaneStateReflector.updateExternalState('user_input', message, 'unified_brain');
      crossPlaneStateReflector.updateExternalState('session_id', sessionId, 'unified_brain');
      crossPlaneStateReflector.updateExternalState('domain_context', agentMode, 'unified_brain');
      crossPlaneStateReflector.updateExternalState('system_mode', currentState, 'unified_brain');
      crossPlaneStateReflector.updateExternalState('timestamp', Date.now(), 'unified_brain');
      
      // Internal State Updates (from cognitive processing)
      const currentIntent = neuroIntentKernel.getCurrentIntent();
      if (currentIntent) {
        crossPlaneStateReflector.updateInternalState('current_intent', currentIntent.primary, 'nik');
        crossPlaneStateReflector.updateInternalState('intent_priority', currentIntent.priority, 'nik');
      }
      
      crossPlaneStateReflector.updateInternalState('active_domain', agentMode, 'personality_engine');
      crossPlaneStateReflector.updateInternalState('processing_mode', currentState, 'unified_brain');
      crossPlaneStateReflector.updateInternalState('user_id', this.userId, 'unified_brain');
      
      // Meta State Updates (system performance and health)
      crossPlaneStateReflector.updateMetaState('message_length', message.length, 'metrics');
      crossPlaneStateReflector.updateMetaState('session_active', true, 'session_manager');
      crossPlaneStateReflector.updateMetaState('last_interaction', Date.now(), 'activity_tracker');
      
      // Get reflection state for context awareness
      const unifiedState = crossPlaneStateReflector.getUnifiedState();
      console.log(`🔄 CPSR: State synchronized across planes - External: ${Object.keys(unifiedState.external).length} keys, Internal: ${Object.keys(unifiedState.internal).length} keys, Meta: ${Object.keys(unifiedState.meta).length} keys`);
      
      // Store state snapshot in session memory for continuity
      this.sessionMemory.set(`cpsr_state_${sessionId}`, {
        timestamp: Date.now(),
        unifiedState,
        agentMode,
        sessionId
      });
      
    } catch (error) {
      console.error('🔄 CPSR: Error in state synchronization:', error);
      // CPSR failure should not break the flow - continue without state sync
    }
  }

  // Get current CPSR state for debugging/monitoring
  getCPSRState() {
    try {
      return {
        unifiedState: crossPlaneStateReflector.getUnifiedState(),
        sessionStates: Array.from(this.sessionMemory.entries())
          .filter(([key]) => key.startsWith('cpsr_state_'))
          .map(([key, value]) => ({ key, value }))
      };
    } catch (error) {
      console.error('🔄 CPSR: Error getting state:', error);
      return { unifiedState: null, sessionStates: [] };
    }
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


import { supabase } from "@/integrations/supabase/client";
import { tieredMemoryGraph } from "./tiered-memory-graph";
import { enhancedPersonalityEngine } from "./enhanced-personality-engine";
import { productionACSService } from "./production-acs-service";
import { ACSConfig, DialogueState } from "@/types/acs-types";
import { LayeredBlueprint, AgentMode } from "@/types/personality-modules";

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
    
    // Load user's blueprint for personality consistency
    await this.loadUserBlueprint();
    
    console.log("✅ Unified Brain Service initialized");
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
        
        this.currentBlueprint = {
          user_meta: userMeta || {},
          archetype_western: data.archetype_western,
          archetype_chinese: data.archetype_chinese,
          values_life_path: data.values_life_path,
          energy_strategy_human_design: data.energy_strategy_human_design,
          cognition_mbti: data.cognition_mbti,
          bashar_suite: data.bashar_suite,
          timing_overlays: data.timing_overlays
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
    console.log(`🧠 Processing message through unified brain - Mode: ${agentMode}, State: ${currentState}`);

    // Step 1: Store conversation turn in TMG (shared memory)
    const memoryStartTime = performance.now();
    const memoryId = await this.storeInSharedMemory(message, sessionId, agentMode);
    const memoryLatency = performance.now() - memoryStartTime;

    // Step 2: Generate personality-aware system prompt via VFP-Graph
    const systemPrompt = await enhancedPersonalityEngine.generateSystemPrompt(agentMode, message);
    
    // Step 3: Process through ACS for adaptive conversation management
    const acsResult = await productionACSService.processMessage(
      message,
      sessionId,
      this.getACSConfig(agentMode),
      currentState
    );

    // Step 4: Retrieve relevant context from shared memory
    const memoryContext = await this.getSharedMemoryContext(sessionId, agentMode);

    // Step 5: Enhance response with memory context if ACS didn't already handle it
    let finalResponse = acsResult.response;
    if (!acsResult.fallbackUsed && memoryContext.relevantMemories.length > 0) {
      finalResponse = await this.enhanceResponseWithMemory(
        acsResult.response,
        memoryContext,
        agentMode
      );
    }

    // Step 6: Store the AI response back to shared memory
    await this.storeInSharedMemory(finalResponse, sessionId, agentMode, false);

    const totalLatency = performance.now() - startTime;
    
    console.log(`✅ Unified brain processing complete in ${totalLatency.toFixed(1)}ms`);

    return {
      response: finalResponse,
      newState: acsResult.newState,
      memoryStored: !!memoryId,
      personalityApplied: !!systemPrompt,
      interventionApplied: acsResult.interventionApplied,
      continuityMaintained: memoryContext.relevantMemories.length > 0,
      brainMetrics: {
        memoryLatency,
        personalityCoherence: this.calculatePersonalityCoherence(),
        adaptiveResponse: acsResult.interventionApplied || !acsResult.fallbackUsed
      }
    };
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

  // Get brain health metrics
  getBrainHealth(): any {
    return {
      memorySystemActive: !!this.userId,
      personalityEngineActive: !!this.currentBlueprint,
      acsSystemActive: true,
      unifiedBrainCoherence: this.calculatePersonalityCoherence(),
      sessionMemorySize: this.sessionMemory.size
    };
  }
}

export const unifiedBrainService = new UnifiedBrainService();

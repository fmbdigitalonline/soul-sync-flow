
import { supabase } from "@/integrations/supabase/client";
import { acsRealAIIntegrationService } from "./acs-real-ai-integration";
import { ACSConfig, DialogueState, DialogueHealthMetrics } from "@/types/acs-types";

interface ACSInterventionState {
  suppressedUntilTurn: number;
  currentTurn: number;
  lastInterventionType: string;
  lastInterventionTime: number;
}

interface ProductionACSResult {
  response: string;
  newState: DialogueState;
  metrics: DialogueHealthMetrics;
  interventionApplied: boolean;
  fallbackUsed: boolean;
  acsVersion: string;
}

class ProductionACSService {
  private interventionStates = new Map<string, ACSInterventionState>();
  private readonly ACS_VERSION = "1.0.0";
  private readonly VECTOR_VERSION = "1.0.0";
  private readonly BACK_OFF_TURNS = 3;
  private readonly MAX_RETRY_ATTEMPTS = 2;

  async processMessage(
    message: string,
    sessionId: string,
    config: ACSConfig = this.getDefaultConfig(),
    currentState: DialogueState = 'NORMAL'
  ): Promise<ProductionACSResult> {
    const userId = await this.getCurrentUserId();
    const turnNumber = await this.getTurnNumber(sessionId);
    
    // Check if interventions are suppressed
    const interventionState = this.getInterventionState(sessionId);
    const isInterventionSuppressed = turnNumber <= interventionState.suppressedUntilTurn;
    
    console.log(`🔒 ACS Turn ${turnNumber}, Suppressed until: ${interventionState.suppressedUntilTurn}, Current suppressed: ${isInterventionSuppressed}`);

    let attempt = 0;
    while (attempt <= this.MAX_RETRY_ATTEMPTS) {
      try {
        // Try ACS processing
        const result = await acsRealAIIntegrationService.sendMessage(
          message,
          config,
          currentState
        );

        // Determine if intervention occurred
        const interventionApplied = result.newState !== currentState && !isInterventionSuppressed;
        
        if (interventionApplied) {
          // Apply back-off timer
          this.applyBackOffTimer(sessionId, turnNumber, result.newState, currentState);
          
          // Log successful intervention
          await this.logIntervention(userId, sessionId, {
            interventionType: `${currentState}_to_${result.newState}`,
            fromState: currentState,
            toState: result.newState,
            triggerReason: this.determineTriggerReason(result.metrics),
            interventionData: result.evidence,
            suppressedUntilTurn: turnNumber + this.BACK_OFF_TURNS,
            success: true
          });
        }

        // Store session memory with versioning
        await this.storeSessionMemory(userId, sessionId, {
          message,
          response: result.response,
          state: result.newState,
          metrics: result.metrics,
          interventionApplied,
          turnNumber
        });

        return {
          response: result.response,
          newState: interventionApplied ? result.newState : currentState,
          metrics: result.metrics,
          interventionApplied,
          fallbackUsed: false,
          acsVersion: this.ACS_VERSION
        };

      } catch (error) {
        console.error(`❌ ACS attempt ${attempt + 1} failed:`, error);
        
        if (attempt === this.MAX_RETRY_ATTEMPTS) {
          // Use fallback persona after all retries exhausted
          return await this.useFallbackPersona(message, sessionId, userId, error);
        }
        attempt++;
      }
    }

    // This should never be reached, but TypeScript needs it
    return await this.useFallbackPersona(message, sessionId, userId, new Error("Max retries exceeded"));
  }

  private async useFallbackPersona(
    message: string,
    sessionId: string,
    userId: string | null,
    error: any
  ): Promise<ProductionACSResult> {
    console.log("🚨 Using fallback persona due to ACS failure");
    
    // Log the error
    await this.logError(userId, sessionId, {
      errorType: 'acs_processing_failure',
      errorMessage: error.message || String(error),
      stackTrace: error.stack || '',
      fallbackUsed: true,
      contextData: { message: message.substring(0, 100) }
    });

    try {
      // Call AI coach service directly without ACS processing
      const { data, error: coachError } = await supabase.functions.invoke("ai-coach", {
        body: {
          message,
          sessionId,
          systemPrompt: this.getDefaultPrompt(),
          temperature: 0.7,
          maxTokens: 200,
          includeBlueprint: false,
          agentType: "guide",
          language: "en"
        },
      });

      if (coachError || !data?.response) {
        throw new Error(coachError?.message || "Fallback coach service failed");
      }

      return {
        response: data.response,
        newState: 'NORMAL' as DialogueState,
        metrics: this.getBasicMetrics(),
        interventionApplied: false,
        fallbackUsed: true,
        acsVersion: this.ACS_VERSION
      };

    } catch (fallbackError) {
      console.error("🚨 Even fallback failed:", fallbackError);
      
      return {
        response: "I'm experiencing some technical difficulties. Please try again in a moment.",
        newState: 'NORMAL' as DialogueState,
        metrics: this.getBasicMetrics(),
        interventionApplied: false,
        fallbackUsed: true,
        acsVersion: this.ACS_VERSION
      };
    }
  }

  private getInterventionState(sessionId: string): ACSInterventionState {
    if (!this.interventionStates.has(sessionId)) {
      this.interventionStates.set(sessionId, {
        suppressedUntilTurn: 0,
        currentTurn: 0,
        lastInterventionType: '',
        lastInterventionTime: 0
      });
    }
    return this.interventionStates.get(sessionId)!;
  }

  private applyBackOffTimer(sessionId: string, turnNumber: number, newState: DialogueState, oldState: DialogueState): void {
    const state = this.getInterventionState(sessionId);
    state.suppressedUntilTurn = turnNumber + this.BACK_OFF_TURNS;
    state.lastInterventionType = `${oldState}_to_${newState}`;
    state.lastInterventionTime = Date.now();
    
    console.log(`⏰ Back-off timer applied: suppressing interventions until turn ${state.suppressedUntilTurn}`);
  }

  private async getTurnNumber(sessionId: string): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('user_session_memory')
        .select('id')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      if (error) {
        console.warn("Could not get turn number:", error);
        return 1;
      }

      return (data?.length || 0) + 1;
    } catch (error) {
      console.warn("Error getting turn number:", error);
      return 1;
    }
  }

  private async getCurrentUserId(): Promise<string | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      return user?.id || null;
    } catch (error) {
      console.warn("Could not get current user:", error);
      return null;
    }
  }

  private async logIntervention(userId: string | null, sessionId: string, data: any): Promise<void> {
    if (!userId) return;

    try {
      await supabase.from('acs_intervention_logs').insert({
        user_id: userId,
        session_id: sessionId,
        ...data
      });
    } catch (error) {
      console.error("Failed to log intervention:", error);
    }
  }

  private async logError(userId: string | null, sessionId: string, data: any): Promise<void> {
    try {
      await supabase.from('acs_error_logs').insert({
        user_id: userId,
        session_id: sessionId,
        acs_version: this.ACS_VERSION,
        ...data
      });
    } catch (error) {
      console.error("Failed to log ACS error:", error);
    }
  }

  private async storeSessionMemory(userId: string | null, sessionId: string, data: any): Promise<void> {
    if (!userId) return;

    try {
      await supabase.from('user_session_memory').insert({
        user_id: userId,
        session_id: sessionId,
        memory_type: 'acs_conversation',
        memory_data: data,
        context_summary: `ACS conversation turn ${data.turnNumber}`,
        importance_score: data.interventionApplied ? 8 : 5,
        vector_version: this.VECTOR_VERSION,
        acs_version: this.ACS_VERSION
      });
    } catch (error) {
      console.error("Failed to store session memory:", error);
    }
  }

  private determineTriggerReason(metrics: DialogueHealthMetrics): string {
    if (metrics.frustrationScore > 0.3) return 'frustration_detected';
    if (metrics.sentimentSlope < -0.2) return 'negative_sentiment_trend';
    if (metrics.conversationVelocity < 0.1) return 'low_engagement';
    if (metrics.helpSignals.length > 0) return 'help_signals_detected';
    return 'context_adaptation';
  }

  private getDefaultConfig(): ACSConfig {
    return {
      enableRL: false,
      personalityScaling: true,
      frustrationThreshold: 0.3,
      sentimentSlopeNeg: -0.2,
      velocityFloor: 0.1,
      maxSilentMs: 180000,
      clarificationThreshold: 0.4
    };
  }

  private getDefaultPrompt(): string {
    return "You are a helpful AI assistant. Respond naturally and helpfully to user questions.";
  }

  private getBasicMetrics(): DialogueHealthMetrics {
    return {
      conversationVelocity: 0.5,
      sentimentSlope: 0,
      silentDuration: 0,
      frustrationScore: 0,
      helpSignals: [],
      timestamp: Date.now(),
      l2NormConstraint: 1.0
    };
  }

  // Integration test methods
  async testStuckToClarify(sessionId: string): Promise<boolean> {
    console.log("🧪 Running test_stuck_to_clarify()");
    try {
      const result = await this.processMessage(
        "I don't understand what you mean", 
        sessionId, 
        this.getDefaultConfig(), 
        'NORMAL'
      );
      return result.newState === 'CLARIFICATION_NEEDED';
    } catch (error) {
      console.error("test_stuck_to_clarify failed:", error);
      return false;
    }
  }

  async testIdlePrompt(sessionId: string): Promise<boolean> {
    console.log("🧪 Running test_idle_prompt()");
    try {
      const result = await this.processMessage(
        "hello", 
        sessionId, 
        this.getDefaultConfig(), 
        'NORMAL'
      );
      return result.response.length > 0 && !result.fallbackUsed;
    } catch (error) {
      console.error("test_idle_prompt failed:", error);
      return false;
    }
  }

  async testLatencyP95(): Promise<{ passed: boolean; latency: number }> {
    console.log("🧪 Running test_latency_P95()");
    const latencies: number[] = [];
    const testCount = 20;

    for (let i = 0; i < testCount; i++) {
      const start = performance.now();
      try {
        await this.processMessage(
          `Test message ${i}`, 
          `latency_test_${Date.now()}_${i}`, 
          this.getDefaultConfig(), 
          'NORMAL'
        );
        latencies.push(performance.now() - start);
      } catch (error) {
        latencies.push(5000); // 5s penalty for failures
      }
    }

    latencies.sort((a, b) => a - b);
    const p95Index = Math.floor(testCount * 0.95);
    const p95Latency = latencies[p95Index];
    
    console.log(`📊 P95 Latency: ${p95Latency.toFixed(2)}ms`);
    return { passed: p95Latency < 3000, latency: p95Latency }; // 3s threshold
  }
}

export const productionACSService = new ProductionACSService();

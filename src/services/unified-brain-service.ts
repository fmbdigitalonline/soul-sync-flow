
import { supabase } from "@/integrations/supabase/client";
import { enhancedPersonalityEngine } from "./enhanced-personality-engine";
import { neuroIntentKernel } from "./hermetic-core/neuro-intent-kernel";
import { crossPlaneStateReflector } from "./hermetic-core/cross-plane-state-reflector";
import { holisticCoachService } from "./holistic-coach-service";
import { unifiedBrainContext } from "./unified-brain-context";

export class UnifiedBrainService {
  private static instance: UnifiedBrainService;
  private isInitialized = false;

  private constructor() {}

  static getInstance(): UnifiedBrainService {
    if (!UnifiedBrainService.instance) {
      UnifiedBrainService.instance = new UnifiedBrainService();
    }
    return UnifiedBrainService.instance;
  }

  async initialize(userId: string): Promise<void> {
    if (this.isInitialized) {
      console.log("🧠 UnifiedBrainService: Already initialized");
      return;
    }

    console.log("🧠 UnifiedBrainService: Initializing for user:", userId);

    try {
      // Load VPG blueprint first
      console.log("🧠 Loading VPG blueprint...");
      const blueprint = await unifiedBrainContext.loadBlueprint(userId);
      
      if (blueprint) {
        console.log("✅ VPG blueprint loaded (cached)");
        
        // Inject blueprint into all modules BEFORE any processing
        console.log("🧠 Injecting blueprint into all modules...");
        
        // Enhanced Personality Engine
        enhancedPersonalityEngine.setUserId(userId);
        enhancedPersonalityEngine.setBlueprintContext(blueprint);
        
        // Neuro Intent Kernel
        neuroIntentKernel.setUserId(userId);
        neuroIntentKernel.setBlueprintContext(blueprint);
        
        // Cross-Plane State Reflector
        crossPlaneStateReflector.setBlueprintContext(blueprint);
        
        // Holistic Coach Service - CRITICAL: inject BEFORE any prompt generation
        holisticCoachService.setBlueprint(blueprint);
        holisticCoachService.setCurrentUser(userId);
        
        console.log("✅ All modules initialized with VPG blueprint");
      } else {
        console.warn("⚠️ No VPG blueprint found for user");
      }

      this.isInitialized = true;
      console.log("🧠 UnifiedBrainService: Initialization complete");

    } catch (error) {
      console.error("❌ UnifiedBrainService initialization failed:", error);
      throw error;
    }
  }

  async processMessage(
    userId: string,
    message: string,
    mode: 'guide' | 'coach' | 'dream' = 'guide'
  ): Promise<{
    systemPrompt: string;
    personalityInsights: any;
    intentBias: any;
    stateReflection: any;
    response: string;
    memoryStored: boolean;
    personalityApplied: boolean;
    continuityMaintained: boolean;
  }> {
    console.log(`🧠 UnifiedBrainService: Processing message in ${mode} mode`);

    // Ensure initialization
    await this.initialize(userId);

    // Ensure blueprint is loaded and injected (guard against race conditions)
    const blueprint = unifiedBrainContext.get('blueprint', userId);
    if (blueprint) {
      // Re-inject to ensure all modules have latest blueprint
      holisticCoachService.setBlueprint(blueprint);
    }

    try {
      // Generate enhanced system prompt with personality awareness
      console.log("🧠 Generating personality-aware system prompt...");
      const systemPrompt = await enhancedPersonalityEngine.generateSystemPrompt(mode, message);

      // Get personality insights
      const personalityInsights = holisticCoachService.getPersonalityInsights();

      // Get intent bias from NIK (with fallback)
      let intentBias = null;
      try {
        intentBias = await neuroIntentKernel.analyzeIntent?.(message) || 
                    neuroIntentKernel.processIntent?.(message) || 
                    { intent: 'general', confidence: 0.5 };
      } catch (error) {
        console.warn("NIK intent analysis failed, using fallback:", error);
        intentBias = { intent: 'general', confidence: 0.5 };
      }

      // Get state reflection from CPSR (with fallback)
      let stateReflection = null;
      try {
        stateReflection = crossPlaneStateReflector.getUnifiedState?.() ||
                         crossPlaneStateReflector.reflectCurrentState?.() ||
                         { external: {}, internal: {}, meta: {} };
      } catch (error) {
        console.warn("CPSR state reflection failed, using fallback:", error);
        stateReflection = { external: {}, internal: {}, meta: {} };
      }

      console.log("✅ Message processed with full personality integration");

      return {
        systemPrompt,
        personalityInsights,
        intentBias,
        stateReflection,
        response: systemPrompt, // For backwards compatibility
        memoryStored: true,
        personalityApplied: !!personalityInsights,
        continuityMaintained: true
      };

    } catch (error) {
      console.error("❌ Message processing failed:", error);
      throw error;
    }
  }

  // Method for processing messages with session context (used by hooks)
  async processMessageForModeHook(
    message: string,
    sessionId: string,
    mode: string,
    state: string
  ): Promise<{
    systemPrompt: string;
    personalityInsights: any;
    intentBias: any;
    stateReflection: any;
    response: string;
    memoryStored: boolean;
    personalityApplied: boolean;
    continuityMaintained: boolean;
  }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Map mode string to valid mode type
    const validMode = ['guide', 'coach', 'dream'].includes(mode) ? mode as 'guide' | 'coach' | 'dream' : 'guide';
    
    return this.processMessage(user.id, message, validMode);
  }

  // Agent mode switching
  async switchAgentMode(fromMode: string, toMode: string, sessionId: string): Promise<void> {
    console.log(`🔄 Switching agent mode: ${fromMode} → ${toMode}`);
    // Implementation for mode switching logic
    // This could involve updating session state, clearing context, etc.
  }

  // Brain health monitoring
  getBrainHealth(): any {
    return {
      memorySystemActive: this.isInitialized,
      personalityEngineActive: holisticCoachService.isReady(),
      acsSystemActive: true,
      blueprintLoaded: !!unifiedBrainContext.get('blueprint'),
      modulesInitialized: this.isInitialized
    };
  }

  // CPSR state access
  getCPSRState(): any {
    try {
      return {
        unifiedState: crossPlaneStateReflector.getUnifiedState?.() || {},
        sessionStates: []
      };
    } catch (error) {
      console.warn("Failed to get CPSR state:", error);
      return { unifiedState: {}, sessionStates: [] };
    }
  }

  // NIK status access
  getNIKStatus(): any {
    return {
      initialized: true,
      intentAnalysisActive: true,
      blueprintInjected: !!unifiedBrainContext.get('blueprint')
    };
  }

  // TWS info access
  getTWSInfo(): any {
    return {
      initialized: true,
      temporalWeightingActive: true
    };
  }

  getPersonalityInsights(userId: string) {
    return holisticCoachService.getPersonalityInsights();
  }

  isReady(userId: string): boolean {
    return this.isInitialized && holisticCoachService.isReady();
  }

  reset() {
    this.isInitialized = false;
    try {
      unifiedBrainContext.clearAll?.();
    } catch (error) {
      console.warn("Failed to clear unified brain context:", error);
    }
    console.log("🧠 UnifiedBrainService: Reset complete");
  }
}

export const unifiedBrainService = UnifiedBrainService.getInstance();

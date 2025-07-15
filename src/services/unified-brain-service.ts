
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

      // Get intent bias from NIK
      const intentBias = await neuroIntentKernel.processIntent(message);

      // Get state reflection from CPSR
      const stateReflection = crossPlaneStateReflector.reflectCurrentState();

      console.log("✅ Message processed with full personality integration");

      return {
        systemPrompt,
        personalityInsights,
        intentBias,
        stateReflection
      };

    } catch (error) {
      console.error("❌ Message processing failed:", error);
      throw error;
    }
  }

  getPersonalityInsights(userId: string) {
    return holisticCoachService.getPersonalityInsights();
  }

  isReady(userId: string): boolean {
    return this.isInitialized && holisticCoachService.isReady();
  }

  reset() {
    this.isInitialized = false;
    unifiedBrainContext.clearAll();
    console.log("🧠 UnifiedBrainService: Reset complete");
  }
}

export const unifiedBrainService = UnifiedBrainService.getInstance();

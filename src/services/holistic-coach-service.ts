
import { SevenLayerPersonalityEngine } from "./seven-layer-personality-engine";
import { LayeredBlueprint } from "@/types/personality-modules";
import { HolisticContext } from "@/types/seven-layer-personality";
import { AdvancedHolisticPromptGenerator, UserState } from "./advanced-holistic-prompt-generator";
import type { VPGBlueprint } from "./unified-brain-context";

export type CoachMode = "growth" | "companion" | "dream";

class HolisticCoachService {
  private personalityEngine: SevenLayerPersonalityEngine;
  private currentUserId: string | null = null;
  private currentMode: CoachMode = "growth";
  private cachedBlueprint: VPGBlueprint | null = null;

  constructor() {
    this.personalityEngine = new SevenLayerPersonalityEngine();
    console.log("🎭 Holistic Coach Service: Initialized");
  }

  setCurrentUser(userId: string) {
    this.currentUserId = userId;
    console.log("👤 Holistic Coach Service: User set:", userId);
  }

  setMode(mode: CoachMode) {
    this.currentMode = mode;
    console.log("🎯 Holistic Coach Service: Mode set to:", mode);
  }

  updateBlueprint(blueprint: Partial<LayeredBlueprint>) {
    console.log("🔄 Holistic Coach Service: Updating blueprint");
    this.personalityEngine.updateBlueprint(blueprint);
  }

  updateContext(context: Partial<HolisticContext>) {
    console.log("🎯 Holistic Coach Service: Updating context", context);
    this.personalityEngine.updateContext(context);
  }

  setBlueprint(blueprint: VPGBlueprint | null) {
    this.cachedBlueprint = blueprint;
    console.log("🧠 Holistic Coach Service: Blueprint loaded (cached)");
  }

  generateSystemPrompt(userMessage?: string): string {
    console.log(`📝 Holistic Coach Service: Generating system prompt for ${this.currentMode} mode`);
    
    // Only use advanced system prompt for growth mode
    if (this.currentMode === "growth" && userMessage) {
      return this.generateAdvancedSystemPrompt(userMessage);
    }
    
    // Fall back to basic system prompt for companion and dream modes
    return this.personalityEngine.generateHolisticSystemPrompt();
  }

  private generateAdvancedSystemPrompt(userMessage: string): string {
    const personality = this.personalityEngine.getPersonality();
    const context = this.personalityEngine.getContext();
    
    // Use cached blueprint from UBC instead of legacy fetch
    if (!personality && !this.cachedBlueprint) {
      console.log("⚠️ No personality data available, using basic prompt");
      return this.personalityEngine.generateHolisticSystemPrompt();
    }
    
    // If we have cached blueprint but no personality, use cached blueprint for VPG-aware prompt
    if (!personality && this.cachedBlueprint) {
      console.log("🧠 Using cached VPG blueprint for personality-aware prompt");
      return this.generateVPGAwarePrompt(this.cachedBlueprint, userMessage, context);
    }

    console.log("🚀 Generating advanced holistic system prompt for growth mode");
    
    // Analyze user state from message
    const userState = AdvancedHolisticPromptGenerator.analyzeUserState(userMessage, context);
    
    console.log("📊 User state analysis:", userState);
    
    // Generate advanced system prompt with dynamic layer integration
    const advancedPrompt = AdvancedHolisticPromptGenerator.generateAdvancedSystemPrompt(
      personality,
      userMessage,
      userState,
      context
    );
    
    console.log("✅ Advanced system prompt generated, length:", advancedPrompt.length);
    
    return advancedPrompt;
  }

  getPersonalityInsights() {
    const personality = this.personalityEngine.getPersonality();
    if (!personality) return null;

    return {
      layers: {
        neural: personality.physioNeuralHardware,
        traits: personality.traitOS,
        motivation: personality.motivationAdaptations,
        energy: personality.energyDecisionStrategy,
        archetypal: personality.archetypalSkin,
        shadow: personality.shadowGiftAlchemy,
        expression: personality.expressionLayer
      },
      metadata: personality.metadata,
      context: this.personalityEngine.getContext(),
      mode: this.currentMode
    };
  }

  private generateVPGAwarePrompt(blueprint: VPGBlueprint, userMessage: string, context: any): string {
    console.log("🎯 Generating VPG-aware prompt with cached blueprint");
    
    // Use VPG blueprint for personality-aware prompt generation
    const personalityContext = {
      traits: blueprint.personality.traits,
      communicationStyle: blueprint.personality.traits.communicationStyle,
      cognitiveStyle: blueprint.personality.traits.cognitiveStyle,
      preferences: blueprint.user.preferences
    };
    
    return `You are a holistic coach with deep understanding of this user's personality profile:
    
Personality Traits: ${JSON.stringify(personalityContext.traits)}
Communication Style: ${personalityContext.communicationStyle}
Cognitive Style: ${personalityContext.cognitiveStyle}
User Preferences: ${JSON.stringify(personalityContext.preferences)}

User Message: ${userMessage}

Respond in a way that honors their cognitive style, energy strategy, and core values. Be specific and personalized.`;
  }

  isReady(): boolean {
    return this.personalityEngine.getPersonality() !== null || this.cachedBlueprint !== null;
  }
}

export const holisticCoachService = new HolisticCoachService();

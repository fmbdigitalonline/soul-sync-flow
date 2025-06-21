
import { SevenLayerPersonalityEngine } from "./seven-layer-personality-engine";
import { LayeredBlueprint } from "@/types/personality-modules";
import { HolisticContext } from "@/types/seven-layer-personality";

class HolisticCoachService {
  private personalityEngine: SevenLayerPersonalityEngine;
  private currentUserId: string | null = null;

  constructor() {
    this.personalityEngine = new SevenLayerPersonalityEngine();
    console.log("🎭 Holistic Coach Service: Initialized");
  }

  setCurrentUser(userId: string) {
    this.currentUserId = userId;
    console.log("👤 Holistic Coach Service: User set:", userId);
  }

  updateBlueprint(blueprint: Partial<LayeredBlueprint>) {
    console.log("🔄 Holistic Coach Service: Updating blueprint");
    this.personalityEngine.updateBlueprint(blueprint);
  }

  updateContext(context: Partial<HolisticContext>) {
    console.log("🎯 Holistic Coach Service: Updating context", context);
    this.personalityEngine.updateContext(context);
  }

  generateSystemPrompt(): string {
    console.log("📝 Holistic Coach Service: Generating holistic system prompt");
    return this.personalityEngine.generateHolisticSystemPrompt();
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
      context: this.personalityEngine.getContext()
    };
  }

  isReady(): boolean {
    return this.personalityEngine.getPersonality() !== null;
  }
}

export const holisticCoachService = new HolisticCoachService();

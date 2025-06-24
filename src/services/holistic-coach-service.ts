
import { SevenLayerPersonalityEngine } from "./seven-layer-personality-engine";
import { LayeredBlueprint } from "@/types/personality-modules";
import { HolisticContext } from "@/types/seven-layer-personality";
import { AdvancedHolisticPromptGenerator, UserState } from "./advanced-holistic-prompt-generator";

export type CoachMode = "growth" | "companion" | "dream";

class HolisticCoachService {
  private personalityEngine: SevenLayerPersonalityEngine;
  private currentUserId: string | null = null;
  private currentMode: CoachMode = "growth";

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
    
    if (!personality) {
      console.log("⚠️ No personality data available, using basic prompt");
      return this.personalityEngine.generateHolisticSystemPrompt();
    }

    console.log("🚀 Generating advanced holistic system prompt for growth mode");
    
    // Create a default HolisticContext with required properties
    const defaultContext: HolisticContext = {
      currentMood: 'medium',
      energyLevel: 'stable',
      contextType: 'analytical',
      recentPatterns: [],
      activeChallenges: [],
      excitementLevel: 5,
      ...context // Override with actual context if available
    };
    
    // Analyze user state from message
    const userState = AdvancedHolisticPromptGenerator.analyzeUserState(userMessage, defaultContext);
    
    console.log("📊 User state analysis:", userState);
    
    // Convert LayeredBlueprint to SevenLayerPersonality format for the advanced prompt generator
    const sevenLayerPersonality = this.convertBlueprintToSevenLayer(personality);
    
    // Generate advanced system prompt with dynamic layer integration
    const advancedPrompt = AdvancedHolisticPromptGenerator.generateAdvancedSystemPrompt(
      sevenLayerPersonality,
      userMessage,
      userState,
      defaultContext
    );
    
    console.log("✅ Advanced system prompt generated, length:", advancedPrompt.length);
    
    return advancedPrompt;
  }

  private convertBlueprintToSevenLayer(blueprint: Partial<LayeredBlueprint>) {
    // Convert LayeredBlueprint to SevenLayerPersonality format
    // Ensure lifePath is converted to number type
    const lifePathValue = blueprint.coreValuesNarrative?.lifePath;
    const lifePath = typeof lifePathValue === 'string' ? parseInt(lifePathValue, 10) || 3 : (lifePathValue || 3);
    
    return {
      physioNeuralHardware: {
        brainWiringPatterns: ['creative-bursts', 'ideation-focused'],
        arousalBaseline: 'medium' as const,
        eegSignatures: ['alpha-waves', 'theta-bursts'],
        workingMemoryCapacity: 7,
        processingSpeed: 'fast' as const,
        attentionStyle: 'flexible' as const
      },
      traitOS: {
        mbtiType: blueprint.cognitiveTemperamental?.mbtiType || 'ENFP',
        bigFiveScores: {
          openness: 85,
          conscientiousness: 65,
          extraversion: 75,
          agreeableness: 80,
          neuroticism: 45
        },
        cognitiveFunctions: {
          dominant: blueprint.cognitiveTemperamental?.dominantFunction || 'Ne',
          auxiliary: 'Fi',
          tertiary: 'Te',
          inferior: 'Si'
        },
        defaultSettings: {
          ideationStyle: 'brainstorming',
          decisionFilter: 'values-based',
          responsePattern: 'enthusiastic'
        }
      },
      motivationAdaptations: {
        lifePath: lifePath, // Now guaranteed to be number
        lifePathKeyword: 'Creative Expression',
        soulUrge: 6,
        soulUrgeKeyword: 'Nurturing',
        guidingGoalTree: ['inspire others', 'create beauty', 'foster connection'],
        coreValues: blueprint.coreValuesNarrative?.core_values || ['creativity', 'authenticity', 'growth'], // Use correct property name
        copingStyles: ['brainstorming', 'seeking support', 'reframing'],
        adaptiveStrategies: ['flexibility', 'perspective-taking', 'solution-finding']
      },
      energyDecisionStrategy: {
        humanDesignType: blueprint.energyDecisionStrategy?.humanDesignType || 'Projector',
        strategy: blueprint.energyDecisionStrategy?.strategy || 'Wait for invitation',
        authority: blueprint.energyDecisionStrategy?.authority || 'Emotional',
        profile: '2/4',
        definition: 'single',
        dailyQuestions: ['What excites me today?', 'Where am I being invited?'],
        energyRhythm: 'wave-like',
        decisionMaking: 'emotional-clarity'
      },
      archetypalSkin: {
        sunSign: blueprint.publicArchetype?.sunSign || 'Aquarius',
        moonSign: blueprint.publicArchetype?.moonSign || 'Cancer',
        risingSign: blueprint.publicArchetype?.risingSign || 'Gemini',
        chineseZodiac: 'Dragon',
        element: 'Air',
        innovatorPersona: 'Visionary',
        stableBase: 'emotional-wisdom',
        kineticCharisma: 'infectious-enthusiasm',
        colorPalette: ['electric-blue', 'cosmic-purple', 'sunset-orange'],
        styleMotifs: ['geometric', 'flowing', 'unexpected']
      },
      shadowGiftAlchemy: {
        geneKeyGates: [
          {
            gate: '64',
            shadow: 'Confusion',
            gift: 'Imagination',
            siddhi: 'Illumination'
          }
        ],
        notSelfTheme: 'bitterness',
        innerSaboteur: 'perfectionist',
        transformationPath: 'confusion-to-clarity',
        dailyReflections: ['What story am I telling myself?', 'Where is the gift in this challenge?'],
        pivotStrategies: ['pause-and-breathe', 'reframe-perspective', 'seek-support']
      },
      expressionLayer: {
        speechPatterns: ['what if...', 'imagine this...', 'I wonder...'],
        rituals: {
          morning: ['gratitude practice', 'intention setting'],
          decision: ['feeling check', 'excitement compass'],
          evening: ['reflection journaling', 'tomorrow visioning']
        },
        microBehaviors: ['animated gesturing', 'expressive facial expressions'],
        socialAPI: ['warm greetings', 'genuine curiosity', 'celebratory responses'],
        decisionAPI: ['gut-check', 'values-alignment', 'excitement-level'],
        brandVoice: {
          tone: 'warm-enthusiastic',
          metaphors: ['journey', 'garden', 'constellation'],
          signaturePhrases: ['What if...?', 'I see this as...', 'Let\'s explore...']
        },
        excitementCompass: 'follow-the-spark'
      },
      metadata: {
        integrationLevel: 85,
        coherenceScore: 90,
        lastUpdated: new Date().toISOString(),
        version: '2.0'
      }
    };
  }

  getPersonalityInsights() {
    const personality = this.personalityEngine.getPersonality();
    if (!personality) return null;

    return {
      layers: {
        cognitive: personality.cognitiveTemperamental,
        energy: personality.energyDecisionStrategy,
        archetype: personality.publicArchetype,
        values: personality.coreValuesNarrative
      },
      context: this.personalityEngine.getContext(),
      mode: this.currentMode
    };
  }

  isReady(): boolean {
    return this.personalityEngine.getPersonality() !== null;
  }
}

export const holisticCoachService = new HolisticCoachService();

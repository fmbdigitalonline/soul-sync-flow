
// Modular Personality Framework Types
export interface PersonalityModule {
  id: string;
  domain: string;
  input: string[];
  output: string;
}

export interface LayeredBlueprint {
  cognitiveTemperamental: {
    mbtiType: string;
    functions: string[];
    taskApproach: string;
  };
  energyDecisionStrategy: {
    humanDesignType: string;
    authority: string;
    decisionStyle: string;
    pacing: string;
  };
  motivationBeliefEngine: {
    mindset: string;
    motivation: string[];
    stateManagement: string;
  };
  coreValuesNarrative: {
    lifePath: number;
    meaningfulAreas: string[];
    anchoringVision: string;
  };
  publicArchetype: {
    sunSign: string;
    socialStyle: string;
    publicVibe: string;
  };
  generationalCode: {
    chineseZodiac: string;
    element: string;
    cohortTint: string;
  };
  surfaceExpression: {
    observableStyle: string;
    realWorldImpact: string;
  };
  marketingArchetype: {
    messagingStyle: string;
    socialHooks: string[];
  };
  goalPersona: {
    currentMode: 'coach' | 'guide' | 'blend';
    serviceRole: string;
    coachingTone: string;
  };
  interactionPreferences: {
    rapportStyle: string;
    storyPreference: string;
    empathyLevel: string;
  };
}

export type AgentMode = 'coach' | 'guide' | 'blend';

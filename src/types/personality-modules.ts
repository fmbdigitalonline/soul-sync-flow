
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
    communicationStyle: string;
    decisionMaking: string;
  };
  energyDecisionStrategy: {
    humanDesignType: string;
    authority: string;
    decisionStyle: string;
    pacing: string;
    energyType: string;
    strategy: string;
  };
  motivationBeliefEngine: {
    mindset: string;
    motivation: string[];
    stateManagement: string;
    coreBeliefs: string[];
    drivingForces: string[];
  };
  coreValuesNarrative: {
    lifePath: number;
    meaningfulAreas: string[];
    anchoringVision: string;
    lifeThemes: string[];
    valueSystem: string;
  };
  publicArchetype: {
    sunSign: string;
    socialStyle: string;
    publicVibe: string;
    publicPersona: string;
    leadershipStyle: string;
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
    conflictStyle: string;
    collaborationStyle: string;
  };
}

export type AgentMode = 'coach' | 'guide' | 'blend';


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
    dominantFunction: string;
    auxiliaryFunction: string;
    cognitiveStack: string[];
    taskApproach: string;
    communicationStyle: string;
    decisionMaking: string;
    informationProcessing: string;
  };
  energyDecisionStrategy: {
    humanDesignType: string;
    authority: string;
    decisionStyle: string;
    pacing: string;
    energyType: string;
    strategy: string;
    profile: string;
    centers: string[];
    gates: string[];
    channels: string[];
  };
  motivationBeliefEngine: {
    mindset: string;
    motivation: string[];
    stateManagement: string;
    coreBeliefs: string[];
    drivingForces: string[];
    excitementCompass: string;
    frequencyAlignment: string;
    beliefInterface: string[];
    resistancePatterns: string[];
  };
  coreValuesNarrative: {
    lifePath: number;
    meaningfulAreas: string[];
    anchoringVision: string;
    lifeThemes: string[];
    valueSystem: string;
    northStar: string;
    missionStatement: string;
    purposeAlignment: string;
  };
  publicArchetype: {
    sunSign: string;
    socialStyle: string;
    publicVibe: string;
    publicPersona: string;
    leadershipStyle: string;
    socialMask: string;
    externalExpression: string;
  };
  generationalCode: {
    chineseZodiac: string;
    element: string;
    cohortTint: string;
    generationalThemes: string[];
    collectiveInfluence: string;
  };
  surfaceExpression: {
    observableStyle: string;
    realWorldImpact: string;
    behavioralSignatures: string[];
    externalManifestations: string[];
  };
  marketingArchetype: {
    messagingStyle: string;
    socialHooks: string[];
    brandPersonality: string;
    communicationPatterns: string[];
    influenceStyle: string;
  };
  goalPersona: {
    currentMode: 'coach' | 'guide' | 'blend';
    serviceRole: string;
    coachingTone: string;
    nudgeStyle: string;
    motivationApproach: string;
  };
  interactionPreferences: {
    rapportStyle: string;
    storyPreference: string;
    empathyLevel: string;
    conflictStyle: string;
    collaborationStyle: string;
    feedbackStyle: string;
    learningStyle: string;
  };
  timingOverlays: {
    currentTransits: string[];
    seasonalInfluences: string[];
    cyclicalPatterns: string[];
    optimalTimings: string[];
    energyWeather: string;
  };
  proactiveContext: {
    nudgeHistory: string[];
    taskGraph: any;
    streaks: any;
    moodLog: string[];
    recentPatterns: string[];
    triggerEvents: string[];
  };
}

export type AgentMode = 'coach' | 'guide' | 'blend';

export interface EnrichmentData {
  mbtiCognitiveFunctions: {
    dominant: string;
    auxiliary: string;
    tertiary: string;
    inferior: string;
    stack: string[];
  };
  humanDesignDetails: {
    profile: string;
    definedCenters: string[];
    openCenters: string[];
    gates: string[];
    channels: string[];
  };
  basharFramework: {
    excitementLevel: number;
    beliefPatterns: string[];
    resistanceAreas: string[];
    alignmentIndicators: string[];
  };
  timingContext: {
    activeTransits: string[];
    seasonalContext: string;
    cyclicalPhase: string;
    optimalWindows: string[];
  };
}

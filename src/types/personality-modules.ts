
// Modular Personality Framework Types
export interface PersonalityModule {
  id: string;
  domain: string;
  input: string[];
  output: string;
}

// Humor Profile Types
export type HumorStyle = 
  | 'witty-inventor'
  | 'dry-strategist' 
  | 'playful-storyteller'
  | 'warm-nurturer'
  | 'observational-analyst'
  | 'spontaneous-entertainer'
  | 'philosophical-sage'
  | 'gentle-empath';

export interface HumorProfile {
  primaryStyle: HumorStyle;
  secondaryStyle?: HumorStyle;
  intensity: 'subtle' | 'moderate' | 'vibrant';
  appropriatenessLevel: 'conservative' | 'balanced' | 'playful';
  contextualAdaptation: {
    coaching: HumorStyle;
    guidance: HumorStyle;
    casual: HumorStyle;
  };
  avoidancePatterns: string[];
  signatureElements: string[];
}

// Voice Token Types - made JSON serializable
export interface VoiceToken {
  pattern: string;
  replacement: string;
  context: "all" | "coach" | "guide" | "blend";
  confidence: number;
}

export interface VoiceTokens {
  pacing: {
    sentenceLength: 'short' | 'medium' | 'flowing' | 'elaborate';
    pauseFrequency: 'minimal' | 'thoughtful' | 'dramatic';
    rhythmPattern: 'steady' | 'varied' | 'staccato' | 'melodic';
  };
  expressiveness: {
    emojiFrequency: 'none' | 'rare' | 'occasional' | 'frequent';
    emphasisStyle: 'bold' | 'italic' | 'caps' | 'punctuation' | 'subtle';
    exclamationTendency: 'reserved' | 'balanced' | 'enthusiastic';
  };
  vocabulary: {
    formalityLevel: 'casual' | 'conversational' | 'professional' | 'academic';
    metaphorUsage: 'literal' | 'occasional' | 'frequent' | 'poetic';
    technicalDepth: 'simplified' | 'balanced' | 'detailed' | 'expert';
  };
  conversationStyle: {
    questionAsking: 'direct' | 'exploratory' | 'socratic' | 'supportive';
    responseLength: 'concise' | 'thorough' | 'comprehensive' | 'storytelling';
    personalSharing: 'minimal' | 'relevant' | 'warm' | 'intimate';
  };
  signaturePhrases: string[];
  greetingStyles: string[];
  transitionWords: string[];
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
    coreKeywords?: string[];
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
    lifePath: number | string;
    meaningfulAreas: string[];
    anchoringVision: string;
    lifeThemes: string[];
    valueSystem: string;
    northStar: string;
    missionStatement: string;
    purposeAlignment: string;
    core_values?: string[];
  };
  publicArchetype: {
    sunSign: string;
    moonSign: string;
    risingSign?: string;
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
  // NEW: User meta information including name
  user_meta?: {
    preferred_name?: string;
    full_name?: string;
    [key: string]: any;
  };
  // NEW: Auto-Generated Personality Components
  humorProfile: HumorProfile;
  voiceTokens: VoiceTokens;
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

// Compiled Persona Interface
export interface CompiledPersona {
  userId: string;
  systemPrompt: string;
  voiceTokens: VoiceTokens;
  humorProfile: HumorProfile;
  functionPermissions: string[];
  generatedAt: Date;
  blueprintVersion: string;
}

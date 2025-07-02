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
  publicArchetype: {
    sunSign: string;
    moonSign?: string;
    risingSign?: string;
    socialStyle: string;
    publicVibe: string;
    publicPersona: string;
    leadershipStyle: string;
    socialMask: string;
    externalExpression: string;
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
  coreValuesNarrative: {
    lifePath: string | number;
    lifePathKeyword?: string;
    expressionNumber?: number;
    expressionKeyword?: string;
    soulUrgeNumber?: number;
    soulUrgeKeyword?: string;
    personalityNumber?: number;
    personalityKeyword?: string;
    meaningfulAreas: string[];
    anchoringVision: string;
    lifeThemes: string[];
    valueSystem: string;
    northStar: string;
    missionStatement: string;
    purposeAlignment: string;
    core_values?: string[];
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
    currentMode: AgentMode;
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
    taskGraph: Record<string, any>;
    streaks: Record<string, number>;
    moodLog: Array<{ mood: string; timestamp: string }>;
    recentPatterns: string[];
    triggerEvents: string[];
  };
  user_meta: Record<string, any>;
  humorProfile: {
    primaryStyle: string;
    intensity: string;
    appropriatenessLevel: string;
    contextualAdaptation: {
      coaching: string;
      guidance: string;
      casual: string;
    };
    avoidancePatterns: string[];
    signatureElements: string[];
  };
  voiceTokens: {
    pacing: {
      sentenceLength: string;
      pauseFrequency: string;
      rhythmPattern: string;
    };
    expressiveness: {
      emojiFrequency: string;
      emphasisStyle: string;
      exclamationTendency: string;
    };
    vocabulary: {
      formalityLevel: string;
      metaphorUsage: string;
      technicalDepth: string;
    };
    conversationStyle: {
      questionAsking: string;
      responseLength: string;
      personalSharing: string;
    };
    signaturePhrases: string[];
    greetingStyles: string[];
    transitionWords: string[];
  };
  motivationBeliefEngine: {
    coreBeliefs: string[];
    motivationalDrivers: string[];
    beliefPatterns: string[];
    motivationTriggers: string[];
    resistancePoints: string[];
    empowermentSources: string[];
  };
}

export type AgentMode = "guide" | "coach" | "blend";

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

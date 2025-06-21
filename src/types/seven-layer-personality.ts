
export interface PhysioNeuralHardware {
  brainWiringPatterns: string[];
  arousalBaseline: 'low' | 'medium' | 'high';
  eegSignatures: string[];
  workingMemoryCapacity: number;
  processingSpeed: 'slow' | 'medium' | 'fast';
  attentionStyle: 'focused' | 'scattered' | 'flexible';
}

export interface TraitOS {
  mbtiType: string;
  bigFiveScores: {
    openness: number;
    conscientiousness: number;
    extraversion: number;
    agreeableness: number;
    neuroticism: number;
  };
  cognitiveFunctions: {
    dominant: string;
    auxiliary: string;
    tertiary: string;
    inferior: string;
  };
  defaultSettings: {
    ideationStyle: string;
    decisionFilter: string;
    responsePattern: string;
  };
}

export interface MotivationAdaptations {
  lifePath: number;
  lifePathKeyword: string;
  soulUrge: number;
  soulUrgeKeyword: string;
  guidingGoalTree: string[];
  coreValues: string[];
  copingStyles: string[];
  adaptiveStrategies: string[];
}

export interface EnergyDecisionStrategy {
  humanDesignType: string;
  strategy: string;
  authority: string;
  profile: string;
  definition: string;
  dailyQuestions: string[];
  energyRhythm: string;
  decisionMaking: string;
}

export interface ArchetypalSkin {
  sunSign: string;
  moonSign: string;
  risingSign: string;
  chineseZodiac: string;
  element: string;
  innovatorPersona: string;
  stableBase: string;
  kineticCharisma: string;
  colorPalette: string[];
  styleMotifs: string[];
}

export interface ShadowGiftAlchemy {
  geneKeyGates: Array<{
    gate: string;
    shadow: string;
    gift: string;
    siddhi: string;
  }>;
  notSelfTheme: string;
  innerSaboteur: string;
  transformationPath: string;
  dailyReflections: string[];
  pivotStrategies: string[];
}

export interface ExpressionLayer {
  speechPatterns: string[];
  rituals: {
    morning: string[];
    decision: string[];
    evening: string[];
  };
  microBehaviors: string[];
  socialAPI: string[];
  decisionAPI: string[];
  brandVoice: {
    tone: string;
    metaphors: string[];
    signaturePhrases: string[];
  };
  excitementCompass: string;
}

export interface SevenLayerPersonality {
  physioNeuralHardware: PhysioNeuralHardware;
  traitOS: TraitOS;
  motivationAdaptations: MotivationAdaptations;
  energyDecisionStrategy: EnergyDecisionStrategy;
  archetypalSkin: ArchetypalSkin;
  shadowGiftAlchemy: ShadowGiftAlchemy;
  expressionLayer: ExpressionLayer;
  metadata: {
    integrationLevel: number;
    coherenceScore: number;
    lastUpdated: string;
    version: string;
  };
}

export interface HolisticContext {
  currentMood: 'low' | 'medium' | 'high';
  energyLevel: 'depleted' | 'stable' | 'vibrant';
  contextType: 'creative' | 'analytical' | 'emotional' | 'practical';
  recentPatterns: string[];
  activeChallenges: string[];
  excitementLevel: number;
}

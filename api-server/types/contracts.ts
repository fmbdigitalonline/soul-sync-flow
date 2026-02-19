export interface ProcessMessageRequest {
  userId: string;
  sessionId: string;
  message: string;
  agentMode?: 'guide' | 'coach' | 'companion';
  currentState?: string;
}

export interface PersonaRequest {
  userId: string;
  mbtiType: string;
  gates: number[];
  astroData: {
    sunSign: number;
    moonSign: number;
    ascendant: number;
    lifePathNumber: number;
  };
}

export interface ConflictResolveRequest {
  conflicts: Array<{
    type: 'framework_mismatch' | 'trait_contradiction' | 'goal_conflict' | 'temporal_inconsistency';
    frameworks: string[];
    conflictingData: Record<string, unknown>;
    severity: 'low' | 'medium' | 'high' | 'critical';
    sessionId: string;
    currentMode: string;
    userInput?: string;
  }>;
}

export interface FeedbackWeightRequest {
  userId: string;
  isPositive: boolean;
  contextVector: number[];
}

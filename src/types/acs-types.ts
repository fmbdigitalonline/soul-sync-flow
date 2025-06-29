
export interface ACSConfig {
  velocityFloor: number;          // tokens per second threshold
  sentimentSlopeNeg: number;      // negative sentiment slope threshold
  maxSilentMs: number;           // idle threshold in milliseconds
  frustrationThreshold: number;   // accumulated frustration score
  clarificationThreshold: number; // confusion detection threshold
  enableRL: boolean;             // reinforcement learning toggle
  personalityScaling: boolean;    // use VFP-Graph for threshold scaling
}

export interface DialogueHealthMetrics {
  conversationVelocity: number;   // tokens per second
  sentimentSlope: number;         // first derivative of sentiment
  silentDuration: number;         // milliseconds since last user input
  frustrationScore: number;       // accumulated frustration indicators
  helpSignals: HelpSignal[];      // detected confusion patterns
  timestamp: number;
}

export interface HelpSignal {
  type: 'repetitive_query' | 'confusion_pattern' | 'paralinguistic_cue' | 'negative_feedback';
  confidence: number;
  message: string;
  timestamp: number;
}

export type DialogueState = 'NORMAL' | 'CLARIFICATION_NEEDED' | 'FRUSTRATION_DETECTED' | 'IDLE' | 'HIGH_ENGAGEMENT';

export interface StateTransition {
  fromState: DialogueState;
  toState: DialogueState;
  trigger: string;
  timestamp: number;
  confidence: number;
}

export interface PromptStrategyConfig {
  systemPromptModifier?: string;
  temperatureAdjustment?: number;
  personaStyle?: 'empathetic' | 'direct' | 'encouraging' | 'clarifying' | 'neutral';
  apologyPrefix?: boolean;
  checkInEnabled?: boolean;
  maxTokens?: number;
}

export interface ACSMetrics {
  stateTransitions: number;
  averageLatency: number;
  userRepairRate: number;
  conversationVelocity: number;
  sentimentTrend: number;
  successRate: number;
}

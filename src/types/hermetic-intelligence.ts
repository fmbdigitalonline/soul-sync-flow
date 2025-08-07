// Core 12 Dimensions for Hermetic Intelligence Extraction
export interface IdentityConstructs {
  core_narratives: string[];
  role_archetypes: string[];
  impostor_loops: string[];
  heros_journey_stage: string;
}

export interface BehavioralTriggers {
  energy_dips: string[];
  avoidance_patterns: string[];
  thought_loops: string[];
  activation_rituals: string[];
}

export interface ExecutionBias {
  preferred_style: string;
  completion_patterns: string;
  momentum_triggers: string[];
  risk_tolerance: string;
}

export interface InternalConflicts {
  belief_contradictions: string[];
  emotional_double_binds: string[];
  identity_splits: string[];
}

export interface SpiritualDimension {
  philosophical_filters: string[];
  life_meaning_themes: string[];
  faith_model: string;
  integration_themes: string[];
}

export interface AdaptiveFeedback {
  reflection_style: string[];
  feedback_receptivity: string;
  change_resistance_profile: string;
}

export interface TemporalBiology {
  cognitive_peaks: string[];
  vulnerable_times: string[];
  biological_rhythms: string[];
}

export interface MetacognitiveBiases {
  dominant_biases: string[];
  self_judgment_heuristics: string[];
  perception_filters: string[];
}

export interface AttachmentStyle {
  pattern: string;
  repair_tendencies: string[];
  authority_archetypes: string[];
}

export interface GoalArchetypes {
  orientation: string[];
  motivation_structure: string;
  friction_points: string[];
}

export interface CrisisHandling {
  default_response: string;
  bounce_back_rituals: string[];
  threshold_triggers: string[];
}

export interface IdentityFlexibility {
  narrative_rigidity: string;
  reinvention_patterns: string[];
  fragmentation_signs: string[];
}

export interface LinguisticFingerprint {
  signature_metaphors: string[];
  motivational_verbs: string[];
  emotional_syntax: string[];
}

// Main interface combining all 12 dimensions (for application use)
export interface HermeticStructuredIntelligence {
  id: string;
  user_id: string;
  personality_report_id: string;
  
  // Core 12 Dimensions
  identity_constructs: IdentityConstructs;
  behavioral_triggers: BehavioralTriggers;
  execution_bias: ExecutionBias;
  internal_conflicts: InternalConflicts;
  spiritual_dimension: SpiritualDimension;
  adaptive_feedback: AdaptiveFeedback;
  temporal_biology: TemporalBiology;
  metacognitive_biases: MetacognitiveBiases;
  attachment_style: AttachmentStyle;
  goal_archetypes: GoalArchetypes;
  crisis_handling: CrisisHandling;
  identity_flexibility: IdentityFlexibility;
  linguistic_fingerprint: LinguisticFingerprint;
  
  // Extraction metadata
  extraction_confidence: number;
  extraction_version: string;
  processing_notes: Record<string, any>;
  
  created_at: string;
  updated_at: string;
}

// Database-compatible interface (for database operations)
export interface HermeticStructuredIntelligenceDB {
  id?: string;
  user_id: string;
  personality_report_id: string;
  
  // Core 12 Dimensions as JSONB
  identity_constructs: any;
  behavioral_triggers: any;
  execution_bias: any;
  internal_conflicts: any;
  spiritual_dimension: any;
  adaptive_feedback: any;
  temporal_biology: any;
  metacognitive_biases: any;
  attachment_style: any;
  goal_archetypes: any;
  crisis_handling: any;
  identity_flexibility: any;
  linguistic_fingerprint: any;
  
  // Extraction metadata
  extraction_confidence: number;
  extraction_version: string;
  processing_notes: any;
  
  created_at?: string;
  updated_at?: string;
}

// Interface for extraction context passed to individual agents
export interface ExtractionContext {
  report_content: any;
  user_id: string;
  report_id: string;
  chunk_text: string;
  chunk_index: number;
  total_chunks: number;
}

// Interface for individual dimension extraction results
export interface DimensionExtractionResult {
  dimension_name: string;
  extracted_data: any;
  confidence_score: number;
  source_chunks: string[];
  processing_notes: string[];
}

// Interface for batch extraction progress tracking
export interface ExtractionProgress {
  user_id: string;
  total_reports: number;
  processed_reports: number;
  current_report_id?: string;
  current_dimension?: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  error_message?: string;
  started_at: string;
  completed_at?: string;
}
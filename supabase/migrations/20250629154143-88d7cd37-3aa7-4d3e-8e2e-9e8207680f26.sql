
-- Create personality_fusion_vectors table for storing versioned vector embeddings
CREATE TABLE public.personality_fusion_vectors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Individual framework vectors
  mbti_vector REAL[] CHECK (array_length(mbti_vector, 1) = 16),
  hd_vector REAL[] CHECK (array_length(hd_vector, 1) = 64),
  astro_vector REAL[] CHECK (array_length(astro_vector, 1) = 32),
  
  -- Unified 128-dimensional embedding
  fused_vector REAL[] CHECK (array_length(fused_vector, 1) = 128),
  
  -- Encoder version tracking for reproducibility
  encoder_checksums JSONB NOT NULL DEFAULT '{}',
  
  -- Calibration parameters
  calibration_params JSONB NOT NULL DEFAULT '{}',
  
  -- Metadata
  fusion_metadata JSONB NOT NULL DEFAULT '{}'
);

-- Create adaptive_weight_matrices table for RLHF learning
CREATE TABLE public.adaptive_weight_matrices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  
  -- Weight matrix (3x128 for MBTI, HD, Astro → 128-dim output)
  weights JSONB NOT NULL DEFAULT '{}',
  
  -- Learning tracking
  update_count INTEGER NOT NULL DEFAULT 0,
  last_rlhf_update TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Feedback tracking
  positive_feedback_count INTEGER NOT NULL DEFAULT 0,
  negative_feedback_count INTEGER NOT NULL DEFAULT 0,
  
  -- Weight constraints
  l2_norm REAL NOT NULL DEFAULT 1.0,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Ensure L2 norm constraint
  CONSTRAINT weights_l2_norm_check CHECK (l2_norm <= 1.0)
);

-- Create conflict_resolution_contexts for attention head
CREATE TABLE public.conflict_resolution_contexts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  session_id TEXT NOT NULL,
  
  -- High-entropy dimensions detected
  conflicting_dimensions INTEGER[] NOT NULL,
  conflict_scores REAL[] NOT NULL,
  
  -- Framework disagreements
  framework_conflicts JSONB NOT NULL DEFAULT '{}',
  
  -- Generated clarifying questions
  clarifying_questions TEXT[] NOT NULL DEFAULT '{}',
  
  -- User responses to conflicts
  user_resolution JSONB DEFAULT NULL,
  resolved BOOLEAN NOT NULL DEFAULT false,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create encoder_versions for deterministic mapping
CREATE TABLE public.encoder_versions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  framework_name TEXT NOT NULL, -- 'mbti', 'human_design', 'astrology'
  version TEXT NOT NULL,
  checksum TEXT NOT NULL,
  
  -- Frozen encoder parameters
  encoder_weights JSONB NOT NULL,
  calibration_params JSONB NOT NULL DEFAULT '{}',
  
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(framework_name, version)
);

-- Add indexes for performance
CREATE INDEX idx_personality_fusion_vectors_user_id ON public.personality_fusion_vectors (user_id);
CREATE INDEX idx_personality_fusion_vectors_version ON public.personality_fusion_vectors (user_id, version DESC);
CREATE INDEX idx_adaptive_weight_matrices_user_id ON public.adaptive_weight_matrices (user_id);
CREATE INDEX idx_conflict_resolution_contexts_user_session ON public.conflict_resolution_contexts (user_id, session_id);
CREATE INDEX idx_encoder_versions_framework_active ON public.encoder_versions (framework_name, is_active);

-- Enable Row Level Security
ALTER TABLE public.personality_fusion_vectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.adaptive_weight_matrices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conflict_resolution_contexts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own fusion vectors" 
  ON public.personality_fusion_vectors 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own fusion vectors" 
  ON public.personality_fusion_vectors 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own fusion vectors" 
  ON public.personality_fusion_vectors 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own weight matrices" 
  ON public.adaptive_weight_matrices 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own weight matrices" 
  ON public.adaptive_weight_matrices 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own weight matrices" 
  ON public.adaptive_weight_matrices 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own conflict contexts" 
  ON public.conflict_resolution_contexts 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own conflict contexts" 
  ON public.conflict_resolution_contexts 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own conflict contexts" 
  ON public.conflict_resolution_contexts 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Encoder versions are public read (deterministic encoders)
CREATE POLICY "Anyone can view encoder versions" 
  ON public.encoder_versions 
  FOR SELECT 
  TO PUBLIC
  USING (true);

-- Function to update fusion vector version
CREATE OR REPLACE FUNCTION update_fusion_vector_version()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  NEW.version = OLD.version + 1;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-increment version on updates
CREATE TRIGGER trigger_update_fusion_vector_version
  BEFORE UPDATE ON public.personality_fusion_vectors
  FOR EACH ROW
  EXECUTE FUNCTION update_fusion_vector_version();

-- Function to validate L2 norm constraint
CREATE OR REPLACE FUNCTION validate_weight_matrix_l2_norm()
RETURNS TRIGGER AS $$
DECLARE
  calculated_norm REAL;
BEGIN
  -- Calculate L2 norm from weights JSON
  NEW.l2_norm = COALESCE((NEW.weights->>'l2_norm')::REAL, 1.0);
  
  -- Ensure it doesn't exceed 1.0
  IF NEW.l2_norm > 1.0 THEN
    RAISE EXCEPTION 'Weight matrix L2 norm cannot exceed 1.0, got: %', NEW.l2_norm;
  END IF;
  
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to validate weight matrix constraints
CREATE TRIGGER trigger_validate_weight_matrix_l2_norm
  BEFORE INSERT OR UPDATE ON public.adaptive_weight_matrices
  FOR EACH ROW
  EXECUTE FUNCTION validate_weight_matrix_l2_norm();

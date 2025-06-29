import { supabase } from '@/integrations/supabase/client';
import { Json } from '@/integrations/supabase/types';

// Type definitions for VFP-Graph
export interface FrameworkVector {
  mbti: number[];
  humanDesign: number[];
  astrology: number[];
}

export interface FusionVector {
  id: string;
  userId: string;
  version: number;
  mbtiVector: number[];
  hdVector: number[];
  astroVector: number[];
  fusedVector: number[];
  encoderChecksums: Record<string, string>;
  calibrationParams: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface AdaptiveWeights {
  id: string;
  userId: string;
  weights: Record<string, number[][]>;
  updateCount: number;
  positiveFeedbackCount: number;
  negativeFeedbackCount: number;
  l2Norm: number;
  lastRlhfUpdate: string;
}

export interface ConflictContext {
  conflictingDimensions: number[];
  conflictScores: number[];
  frameworkConflicts: Record<string, any>;
  clarifyingQuestions: string[];
}

class PersonalityFusionService {
  // Frozen encoder weights for deterministic mapping
  private static readonly ENCODER_VERSIONS = {
    mbti: '1.0.0',
    humanDesign: '1.0.0',
    astrology: '1.0.0'
  };

  // MBTI → 16-dimensional latent vector encoder
  private encodeMBTI(mbtiType: string): number[] {
    // Deterministic mapping of 16 MBTI types to 16-dimensional vectors
    const mbtiMap: Record<string, number[]> = {
      'INTJ': [0.9, 0.8, -0.7, 0.6, -0.5, 0.8, -0.9, 0.7, 0.6, -0.4, 0.8, -0.6, 0.9, -0.7, 0.5, 0.8],
      'INTP': [0.8, 0.9, -0.6, 0.7, -0.4, 0.9, -0.8, 0.6, 0.7, -0.3, 0.9, -0.5, 0.8, -0.6, 0.4, 0.7],
      'ENTJ': [0.7, 0.6, 0.8, 0.9, 0.5, 0.7, 0.8, -0.6, 0.9, 0.4, 0.6, 0.7, -0.5, 0.8, 0.9, -0.4],
      'ENTP': [0.6, 0.7, 0.9, 0.8, 0.4, 0.6, 0.9, -0.5, 0.8, 0.3, 0.7, 0.6, -0.4, 0.9, 0.8, -0.3],
      'INFJ': [0.9, -0.6, 0.7, -0.8, 0.5, -0.7, 0.8, 0.9, -0.4, 0.6, -0.5, 0.7, 0.8, -0.6, 0.9, 0.4],
      'INFP': [0.8, -0.5, 0.6, -0.7, 0.4, -0.6, 0.7, 0.8, -0.3, 0.5, -0.4, 0.6, 0.7, -0.5, 0.8, 0.3],
      'ENFJ': [-0.6, 0.8, -0.7, 0.9, -0.5, 0.7, -0.8, 0.6, 0.9, -0.4, 0.8, -0.6, 0.7, 0.9, -0.5, 0.8],
      'ENFP': [-0.5, 0.7, -0.6, 0.8, -0.4, 0.6, -0.7, 0.5, 0.8, -0.3, 0.7, -0.5, 0.6, 0.8, -0.4, 0.7],
      'ISTJ': [-0.8, -0.9, 0.6, -0.7, 0.8, -0.6, 0.9, -0.8, 0.7, 0.9, -0.5, 0.6, -0.7, 0.8, -0.9, 0.5],
      'ISFJ': [-0.7, -0.8, 0.5, -0.6, 0.7, -0.5, 0.8, -0.7, 0.6, 0.8, -0.4, 0.5, -0.6, 0.7, -0.8, 0.4],
      'ESTJ': [0.6, -0.7, -0.8, 0.9, -0.6, 0.8, -0.7, 0.5, -0.9, 0.7, 0.8, -0.5, 0.6, -0.8, 0.9, -0.6],
      'ESFJ': [0.5, -0.6, -0.7, 0.8, -0.5, 0.7, -0.6, 0.4, -0.8, 0.6, 0.7, -0.4, 0.5, -0.7, 0.8, -0.5],
      'ISTP': [-0.9, 0.6, -0.5, 0.7, -0.8, 0.5, -0.6, 0.9, 0.4, -0.7, 0.8, 0.6, -0.9, 0.5, 0.7, -0.8],
      'ISFP': [-0.8, 0.5, -0.4, 0.6, -0.7, 0.4, -0.5, 0.8, 0.3, -0.6, 0.7, 0.5, -0.8, 0.4, 0.6, -0.7],
      'ESTP': [0.4, 0.9, 0.6, -0.8, 0.7, -0.9, 0.5, -0.6, 0.8, 0.9, -0.7, 0.4, 0.6, -0.5, 0.8, 0.9],
      'ESFP': [0.3, 0.8, 0.5, -0.7, 0.6, -0.8, 0.4, -0.5, 0.7, 0.8, -0.6, 0.3, 0.5, -0.4, 0.7, 0.8]
    };

    return mbtiMap[mbtiType] || new Array(16).fill(0);
  }

  // Human Design → 64-channel binary vector encoder
  private encodeHumanDesign(gates: number[]): number[] {
    const hdVector = new Array(64).fill(0);
    
    // Set activated gates to 1
    gates.forEach(gate => {
      if (gate >= 1 && gate <= 64) {
        hdVector[gate - 1] = 1;
      }
    });

    return hdVector;
  }

  // Astrology/Numerology → 32-dimensional Fourier embeddings
  private encodeAstrology(birthData: {
    sunSign: number;
    moonSign: number;
    ascendant: number;
    lifePathNumber: number;
  }): number[] {
    const { sunSign, moonSign, ascendant, lifePathNumber } = birthData;
    const vector = new Array(32).fill(0);

    // Fourier-based encoding for continuous representations
    for (let i = 0; i < 8; i++) {
      // Sun sign harmonics
      vector[i] = Math.sin(2 * Math.PI * sunSign * (i + 1) / 12);
      vector[i + 8] = Math.cos(2 * Math.PI * sunSign * (i + 1) / 12);
      
      // Moon sign harmonics
      vector[i + 16] = Math.sin(2 * Math.PI * moonSign * (i + 1) / 12);
      vector[i + 24] = Math.cos(2 * Math.PI * moonSign * (i + 1) / 12);
    }

    // Incorporate ascendant and life path number
    vector[0] += Math.sin(2 * Math.PI * ascendant / 12) * 0.5;
    vector[16] += Math.sin(2 * Math.PI * lifePathNumber / 9) * 0.3;

    return vector;
  }

  // Cross-framework calibration layer
  private calibrateVector(vector: number[], frameworkType: string): number[] {
    // Min-max normalization to ensure variance ≈ 1
    const mean = vector.reduce((sum, val) => sum + val, 0) / vector.length;
    const variance = vector.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / vector.length;
    const stdDev = Math.sqrt(variance);

    if (stdDev === 0) return vector;

    // Z-score normalization
    return vector.map(val => (val - mean) / stdDev);
  }

  // Generate unified 128-dimensional embedding
  private fuseVectors(
    mbtiVector: number[],
    hdVector: number[],
    astroVector: number[],
    weights: Record<string, number[][]>
  ): number[] {
    const fusedVector = new Array(128).fill(0);

    // Concatenate calibrated vectors [16 + 64 + 32 + 16 padding = 128]
    const paddedMbti = [...mbtiVector, ...new Array(16).fill(0)]; // Pad to 32
    const paddedAstro = [...astroVector, ...new Array(32).fill(0)]; // Pad to 64

    // Apply adaptive weights
    for (let i = 0; i < 128; i++) {
      let weightedSum = 0;
      
      // MBTI contribution (first 32 dims)
      if (i < 32) {
        const mbtiWeights = weights.mbti || Array(32).fill(0).map(() => Array(128).fill(1/3));
        weightedSum += paddedMbti[i] * (mbtiWeights[Math.min(i, mbtiWeights.length - 1)]?.[Math.min(i, 127)] || 1/3);
      }
      
      // Human Design contribution (next 64 dims)
      if (i >= 32 && i < 96) {
        const hdWeights = weights.humanDesign || Array(64).fill(0).map(() => Array(128).fill(1/3));
        const hdIndex = i - 32;
        weightedSum += hdVector[hdIndex] * (hdWeights[Math.min(hdIndex, hdWeights.length - 1)]?.[Math.min(i, 127)] || 1/3);
      }
      
      // Astrology contribution (last 32 dims)
      if (i >= 96) {
        const astroWeights = weights.astrology || Array(32).fill(0).map(() => Array(128).fill(1/3));
        const astroIndex = i - 96;
        weightedSum += paddedAstro[astroIndex] * (astroWeights[Math.min(astroIndex, astroWeights.length - 1)]?.[Math.min(i, 127)] || 1/3);
      }

      fusedVector[i] = Math.tanh(weightedSum); // Activation function
    }

    return fusedVector;
  }

  // Detect conflicts using attention mechanism
  private detectConflicts(
    mbtiVector: number[],
    hdVector: number[],
    astroVector: number[]
  ): ConflictContext {
    const conflictingDimensions: number[] = [];
    const conflictScores: number[] = [];
    const frameworkConflicts: Record<string, any> = {};

    // Calculate entropy for each dimension
    for (let i = 0; i < Math.min(16, mbtiVector.length); i++) {
      const mbtiVal = mbtiVector[i];
      const hdVal = i < hdVector.length ? hdVector[i] : 0;
      const astroVal = i < astroVector.length ? astroVector[i] : 0;

      // Calculate disagreement score
      const values = [mbtiVal, hdVal, astroVal];
      const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
      const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;

      // High variance indicates conflict
      if (variance > 0.5) {
        conflictingDimensions.push(i);
        conflictScores.push(variance);
        frameworkConflicts[`dimension_${i}`] = {
          mbti: mbtiVal,
          humanDesign: hdVal,
          astrology: astroVal,
          variance
        };
      }
    }

    // Generate clarifying questions
    const clarifyingQuestions = this.generateClarifyingQuestions(conflictingDimensions, frameworkConflicts);

    return {
      conflictingDimensions,
      conflictScores,
      frameworkConflicts,
      clarifyingQuestions
    };
  }

  private generateClarifyingQuestions(
    conflictingDimensions: number[],
    frameworkConflicts: Record<string, any>
  ): string[] {
    const questions: string[] = [];

    if (conflictingDimensions.length > 0) {
      questions.push("Help me understand which aspects resonate most with you:");
      
      // Generate specific questions based on conflicts
      for (const dim of conflictingDimensions.slice(0, 3)) {
        const conflict = frameworkConflicts[`dimension_${dim}`];
        if (conflict) {
          if (Math.abs(conflict.mbti - conflict.humanDesign) > 0.5) {
            questions.push(`When making decisions, do you prefer logical analysis or following your gut energy?`);
          }
          if (Math.abs(conflict.astrology - conflict.mbti) > 0.5) {
            questions.push(`How much do timing and cosmic influences affect your personal choices?`);
          }
        }
      }
    }

    return questions;
  }

  // Save fusion vector to database
  async saveFusionVector(
    userId: string,
    mbtiVector: number[],
    hdVector: number[],
    astroVector: number[],
    fusedVector: number[]
  ): Promise<string> {
    const encoderChecksums = {
      mbti: this.calculateChecksum(mbtiVector),
      humanDesign: this.calculateChecksum(hdVector),
      astrology: this.calculateChecksum(astroVector)
    };

    const { data, error } = await supabase
      .from('personality_fusion_vectors')
      .insert({
        user_id: userId,
        mbti_vector: mbtiVector,
        hd_vector: hdVector,
        astro_vector: astroVector,
        fused_vector: fusedVector,
        encoder_checksums: encoderChecksums,
        calibration_params: {
          version: '1.0.0',
          normalization: 'z-score'
        }
      })
      .select('id')
      .single();

    if (error) throw error;
    return data.id;
  }

  // Load user's latest fusion vector
  async loadFusionVector(userId: string): Promise<FusionVector | null> {
    const { data, error } = await supabase
      .from('personality_fusion_vectors')
      .select('*')
      .eq('user_id', userId)
      .order('version', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) return null;

    return {
      id: data.id,
      userId: data.user_id,
      version: data.version,
      mbtiVector: data.mbti_vector || [],
      hdVector: data.hd_vector || [],
      astroVector: data.astro_vector || [],
      fusedVector: data.fused_vector || [],
      encoderChecksums: data.encoder_checksums as Record<string, string>,
      calibrationParams: data.calibration_params as Record<string, any>,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  }

  // Initialize or load adaptive weights
  async initializeAdaptiveWeights(userId: string): Promise<AdaptiveWeights> {
    // Try to load existing weights
    const { data: existing } = await supabase
      .from('adaptive_weight_matrices')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (existing) {
      return {
        id: existing.id,
        userId: existing.user_id,
        weights: existing.weights as Record<string, number[][]>,
        updateCount: existing.update_count,
        positiveFeedbackCount: existing.positive_feedback_count,
        negativeFeedbackCount: existing.negative_feedback_count,
        l2Norm: existing.l2_norm,
        lastRlhfUpdate: existing.last_rlhf_update
      };
    }

    // Create default weights (equal weighting)
    const defaultWeights = {
      mbti: Array(32).fill(0).map(() => Array(128).fill(1/3)),
      humanDesign: Array(64).fill(0).map(() => Array(128).fill(1/3)),
      astrology: Array(32).fill(0).map(() => Array(128).fill(1/3))
    };

    const { data, error } = await supabase
      .from('adaptive_weight_matrices')
      .insert({
        user_id: userId,
        weights: defaultWeights,
        l2_norm: 1.0
      })
      .select('*')
      .single();

    if (error) throw error;

    return {
      id: data.id,
      userId: data.user_id,
      weights: data.weights as Record<string, number[][]>,
      updateCount: data.update_count,
      positiveFeedbackCount: data.positive_feedback_count,
      negativeFeedbackCount: data.negative_feedback_count,
      l2Norm: data.l2_norm,
      lastRlhfUpdate: data.last_rlhf_update
    };
  }

  // Update weights based on user feedback
  async updateWeightsFromFeedback(
    userId: string,
    isPositive: boolean,
    contextVector: number[]
  ): Promise<void> {
    const weights = await this.initializeAdaptiveWeights(userId);
    
    // Simple RLHF update: increase weights for positive feedback, decrease for negative
    const learningRate = 0.01;
    const adjustment = isPositive ? learningRate : -learningRate;

    // Update weights based on context (simplified)
    const updatedWeights = { ...weights.weights };
    
    // Apply gradient update (simplified)
    Object.keys(updatedWeights).forEach(framework => {
      updatedWeights[framework] = updatedWeights[framework].map(row =>
        row.map(weight => Math.max(0, Math.min(1, weight + adjustment)))
      );
    });

    // Calculate new L2 norm
    const allWeights = Object.values(updatedWeights).flat().flat();
    const l2Norm = Math.sqrt(allWeights.reduce((sum, w) => sum + w * w, 0));
    const normalizedL2 = Math.min(1.0, l2Norm);

    await supabase
      .from('adaptive_weight_matrices')
      .update({
        weights: updatedWeights,
        update_count: weights.updateCount + 1,
        positive_feedback_count: weights.positiveFeedbackCount + (isPositive ? 1 : 0),
        negative_feedback_count: weights.negativeFeedbackCount + (isPositive ? 0 : 1),
        l2_norm: normalizedL2,
        last_rlhf_update: new Date().toISOString()
      })
      .eq('user_id', userId);
  }

  // Main fusion process
  async generatePersonalityFusion(
    userId: string,
    mbtiType: string,
    humanDesignGates: number[],
    astrologyData: {
      sunSign: number;
      moonSign: number;
      ascendant: number;
      lifePathNumber: number;
    }
  ): Promise<{
    fusionVector: FusionVector;
    conflicts?: ConflictContext;
  }> {
    // Step 1: Encode each framework
    const rawMbtiVector = this.encodeMBTI(mbtiType);
    const rawHdVector = this.encodeHumanDesign(humanDesignGates);
    const rawAstroVector = this.encodeAstrology(astrologyData);

    // Step 2: Apply calibration
    const mbtiVector = this.calibrateVector(rawMbtiVector, 'mbti');
    const hdVector = this.calibrateVector(rawHdVector, 'humanDesign');
    const astroVector = this.calibrateVector(rawAstroVector, 'astrology');

    // Step 3: Load adaptive weights
    const adaptiveWeights = await this.initializeAdaptiveWeights(userId);

    // Step 4: Generate fused vector
    const fusedVector = this.fuseVectors(
      mbtiVector, 
      hdVector, 
      astroVector, 
      adaptiveWeights.weights
    );

    // Step 5: Save to database
    const fusionId = await this.saveFusionVector(
      userId,
      mbtiVector,
      hdVector,
      astroVector,
      fusedVector
    );

    // Step 6: Detect conflicts
    const conflicts = this.detectConflicts(mbtiVector, hdVector, astroVector);

    // Step 7: Save conflicts if any
    if (conflicts.conflictingDimensions.length > 0) {
      await this.saveConflictContext(userId, 'fusion_generation', conflicts);
    }

    const savedFusion = await this.loadFusionVector(userId);
    
    return {
      fusionVector: savedFusion!,
      conflicts: conflicts.conflictingDimensions.length > 0 ? conflicts : undefined
    };
  }

  // Save conflict context
  private async saveConflictContext(
    userId: string,
    sessionId: string,
    conflicts: ConflictContext
  ): Promise<void> {
    await supabase
      .from('conflict_resolution_contexts')
      .insert({
        user_id: userId,
        session_id: sessionId,
        conflicting_dimensions: conflicts.conflictingDimensions,
        conflict_scores: conflicts.conflictScores,
        framework_conflicts: conflicts.frameworkConflicts,
        clarifying_questions: conflicts.clarifyingQuestions
      });
  }

  // Utility: Calculate checksum for deterministic encoding
  private calculateChecksum(vector: number[]): string {
    const str = vector.join(',');
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(16);
  }

  // Vector similarity operations
  async calculateVectorSimilarity(userId1: string, userId2: string): Promise<number> {
    const [vector1, vector2] = await Promise.all([
      this.loadFusionVector(userId1),
      this.loadFusionVector(userId2)
    ]);

    if (!vector1 || !vector2) return 0;

    // Cosine similarity
    const dotProduct = vector1.fusedVector.reduce((sum, val, i) => 
      sum + val * vector2.fusedVector[i], 0);
    
    const magnitude1 = Math.sqrt(vector1.fusedVector.reduce((sum, val) => sum + val * val, 0));
    const magnitude2 = Math.sqrt(vector2.fusedVector.reduce((sum, val) => sum + val * val, 0));

    return magnitude1 * magnitude2 > 0 ? dotProduct / (magnitude1 * magnitude2) : 0;
  }

  // Vector interpolation for personality evolution tracking
  async interpolatePersonalityChange(
    userId: string,
    fromVersion: number,
    toVersion: number,
    steps: number = 10
  ): Promise<number[][]> {
    const { data: vectors } = await supabase
      .from('personality_fusion_vectors')
      .select('fused_vector, version')
      .eq('user_id', userId)
      .gte('version', fromVersion)
      .lte('version', toVersion)
      .order('version');

    if (!vectors || vectors.length < 2) return [];

    const startVector = vectors[0].fused_vector as number[];
    const endVector = vectors[vectors.length - 1].fused_vector as number[];
    const interpolated: number[][] = [];

    for (let step = 0; step <= steps; step++) {
      const t = step / steps;
      const interpolatedVector = startVector.map((val, i) => 
        val * (1 - t) + (endVector[i] || 0) * t
      );
      interpolated.push(interpolatedVector);
    }

    return interpolated;
  }
}

// Export both the class and instance
export { PersonalityFusionService };
export const personalityFusionService = new PersonalityFusionService();


import { supabase } from '@/integrations/supabase/client';
import { personalityFusionService } from './personality-fusion-service';

// Core VFP-Graph service interface - the brain of the app
export interface PersonalityVectorService {
  getVector(userId: string): Promise<Float32Array>;
  voteThumb(userId: string, messageId: string, isPositive: boolean): Promise<void>;
  getPersonaSummary(userId: string): Promise<string>;
}

class VFPGraphService implements PersonalityVectorService {
  private static readonly ENCODER_VERSION = '1.0.0';
  private static readonly FEATURE_FLAG_KEY = 'useFusion';

  // Deterministic encoder checksum for version validation
  private calculateEncoderHash(): string {
    const encoderData = {
      version: VFPGraphService.ENCODER_VERSION,
      mbtiDimensions: 16,
      hdDimensions: 64,
      astroDimensions: 32,
      fusedDimensions: 128
    };
    
    let hash = 0;
    const str = JSON.stringify(encoderData);
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(16);
  }

  // Core method: Get 128D personality vector
  async getVector(userId: string): Promise<Float32Array> {
    try {
      // Check feature flag first
      if (!(await this.isFeatureEnabled())) {
        return await this.getFallbackVector(userId);
      }

      // Load existing fusion vector
      const fusionVector = await personalityFusionService.loadFusionVector(userId);
      
      if (fusionVector) {
        // Validate encoder version via checksum
        const currentHash = this.calculateEncoderHash();
        const storedHash = fusionVector.encoderChecksums?.system || '';
        
        if (storedHash === currentHash) {
          return new Float32Array(fusionVector.fusedVector);
        } else {
          console.log('🔄 Encoder version mismatch, regenerating vector for user:', userId);
          // Fall through to regeneration
        }
      }

      // Generate new vector if missing or stale
      return await this.generateFreshVector(userId);
    } catch (error) {
      console.error('❌ Error getting personality vector:', error);
      return await this.getFallbackVector(userId);
    }
  }

  // Thumbs up/down feedback integration
  async voteThumb(userId: string, messageId: string, isPositive: boolean): Promise<void> {
    try {
      if (!(await this.isFeatureEnabled())) {
        console.log('⚠️ VFP-Graph feedback disabled by feature flag');
        return;
      }

      // Get current vector for context
      const vector = await this.getVector(userId);
      
      // Update adaptive weights via RLHF
      await personalityFusionService.updateWeightsFromFeedback(
        userId,
        isPositive,
        Array.from(vector)
      );

      // Log feedback for analytics
      await supabase.from('user_activities').insert({
        user_id: userId,
        activity_type: 'vfp_feedback',
        activity_data: {
          messageId,
          isPositive,
          timestamp: new Date().toISOString(),
          vectorVersion: VFPGraphService.ENCODER_VERSION
        },
        points_earned: 1
      });

      console.log(`✅ VFP-Graph feedback recorded: ${isPositive ? '👍' : '👎'} for user ${userId}`);
    } catch (error) {
      console.error('❌ Error recording feedback:', error);
    }
  }

  // Natural language personality summary
  async getPersonaSummary(userId: string): Promise<string> {
    try {
      const vector = await this.getVector(userId);
      
      // Generate summary from 128D vector characteristics
      const dominantTraits = this.analyzeDominantTraits(vector);
      const energyProfile = this.analyzeEnergyProfile(vector);
      
      return `${dominantTraits} with ${energyProfile} energy patterns`;
    } catch (error) {
      console.error('❌ Error generating persona summary:', error);
      return 'Dynamic personality profile';
    }
  }

  // Generate fresh vector from user data
  private async generateFreshVector(userId: string): Promise<Float32Array> {
    // Get user's blueprint data
    const { data: blueprint } = await supabase
      .from('user_blueprints')
      .select('blueprint')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();

    if (!blueprint?.blueprint) {
      return await this.getFallbackVector(userId);
    }

    // Extract personality data
    const mbtiType = blueprint.blueprint.cognitiveTemperamental?.mbtiType || 'ENFP';
    const hdGates = blueprint.blueprint.energyDecisionStrategy?.gates || [1, 15, 31, 43];
    const astroData = {
      sunSign: blueprint.blueprint.publicArchetype?.sunSign === 'Cancer' ? 4 : 5,
      moonSign: blueprint.blueprint.publicArchetype?.moonSign === 'Pisces' ? 12 : 6,
      ascendant: 7,
      lifePathNumber: blueprint.blueprint.coreValuesNarrative?.lifePath || 7
    };

    // Generate fusion vector
    const result = await personalityFusionService.generatePersonalityFusion(
      userId,
      mbtiType,
      hdGates,
      astroData
    );

    // Store encoder checksum for version validation
    await supabase
      .from('personality_fusion_vectors')
      .update({
        encoder_checksums: {
          ...result.fusionVector.encoderChecksums,
          system: this.calculateEncoderHash()
        }
      })
      .eq('id', result.fusionVector.id);

    return new Float32Array(result.fusionVector.fusedVector);
  }

  // Fallback for when VFP-Graph is disabled
  private async getFallbackVector(userId: string): Promise<Float32Array> {
    // Simple fallback vector based on MBTI if available
    const fallback = new Array(128).fill(0.5);
    
    // Add some variation based on user ID hash
    const userHash = userId.split('').reduce((hash, char) => hash + char.charCodeAt(0), 0);
    for (let i = 0; i < 128; i++) {
      fallback[i] += (Math.sin(userHash + i) * 0.1);
    }
    
    return new Float32Array(fallback);
  }

  // Feature flag check
  private async isFeatureEnabled(): Promise<boolean> {
    try {
      // Check if VFP-Graph is enabled (default true for now)
      return true; // TODO: Connect to feature flag system
    } catch {
      return false;
    }
  }

  // Analyze dominant traits from vector
  private analyzeDominantTraits(vector: Float32Array): string {
    const traits = [];
    
    // MBTI section (first 32 dimensions)
    const mbtiSum = Array.from(vector.slice(0, 32)).reduce((sum, val) => sum + val, 0);
    if (mbtiSum > 10) traits.push('intuitive');
    if (mbtiSum < -10) traits.push('practical');
    
    // Human Design section (dimensions 32-96)
    const hdSum = Array.from(vector.slice(32, 96)).reduce((sum, val) => sum + val, 0);
    if (hdSum > 15) traits.push('responsive');
    if (hdSum < -15) traits.push('initiating');
    
    return traits.join(' and ') || 'balanced';
  }

  // Analyze energy profile from vector
  private analyzeEnergyProfile(vector: Float32Array): string {
    const energy = Array.from(vector).reduce((sum, val) => sum + Math.abs(val), 0);
    
    if (energy > 80) return 'high-intensity';
    if (energy > 60) return 'moderate-energy';
    return 'calm-steady';
  }
}

export const personalityVectorService = new VFPGraphService();

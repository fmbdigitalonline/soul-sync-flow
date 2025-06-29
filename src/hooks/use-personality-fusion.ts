
import { useState, useCallback } from 'react';
import { personalityFusionService, FusionVector, ConflictContext } from '@/services/personality-fusion-service';
import { useAuth } from '@/contexts/AuthContext';

export const usePersonalityFusion = () => {
  const [fusionVector, setFusionVector] = useState<FusionVector | null>(null);
  const [conflicts, setConflicts] = useState<ConflictContext | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const generateFusion = useCallback(async (
    mbtiType: string,
    humanDesignGates: number[],
    astrologyData: {
      sunSign: number;
      moonSign: number;
      ascendant: number;
      lifePathNumber: number;
    }
  ) => {
    if (!user) {
      setError('User must be authenticated');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const result = await personalityFusionService.generatePersonalityFusion(
        user.id,
        mbtiType,
        humanDesignGates,
        astrologyData
      );

      setFusionVector(result.fusionVector);
      setConflicts(result.conflicts || null);
      
      console.log('✅ VFP-Graph fusion generated:', {
        vectorId: result.fusionVector.id,
        hasConflicts: !!result.conflicts,
        fusionDimensions: result.fusionVector.fusedVector.length
      });
    } catch (err) {
      console.error('❌ Error generating personality fusion:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate fusion');
    } finally {
      setIsGenerating(false);
    }
  }, [user]);

  const loadExistingFusion = useCallback(async () => {
    if (!user) return;

    try {
      const existing = await personalityFusionService.loadFusionVector(user.id);
      setFusionVector(existing);
    } catch (err) {
      console.error('Error loading existing fusion:', err);
    }
  }, [user]);

  const provideFeedback = useCallback(async (isPositive: boolean) => {
    if (!user || !fusionVector) return;

    try {
      await personalityFusionService.updateWeightsFromFeedback(
        user.id,
        isPositive,
        fusionVector.fusedVector
      );
      
      console.log('✅ RLHF feedback recorded:', { isPositive });
    } catch (err) {
      console.error('Error providing feedback:', err);
    }
  }, [user, fusionVector]);

  const calculateSimilarity = useCallback(async (otherUserId: string): Promise<number> => {
    if (!user) return 0;
    
    try {
      return await personalityFusionService.calculateVectorSimilarity(user.id, otherUserId);
    } catch (err) {
      console.error('Error calculating similarity:', err);
      return 0;
    }
  }, [user]);

  const getPersonalityEvolution = useCallback(async (
    fromVersion: number,
    toVersion: number
  ): Promise<number[][]> => {
    if (!user) return [];
    
    try {
      return await personalityFusionService.interpolatePersonalityChange(
        user.id,
        fromVersion,
        toVersion
      );
    } catch (err) {
      console.error('Error getting personality evolution:', err);
      return [];
    }
  }, [user]);

  return {
    fusionVector,
    conflicts,
    isGenerating,
    error,
    generateFusion,
    loadExistingFusion,
    provideFeedback,
    calculateSimilarity,
    getPersonalityEvolution
  };
};

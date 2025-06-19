
import { useBlueprintCache } from '@/contexts/BlueprintCacheContext';
import { UnifiedBlueprintService } from '@/services/unified-blueprint-service';
import { useMemo } from 'react';

export const useOptimizedBlueprintData = () => {
  const {
    blueprintData,
    loading,
    error,
    refetch,
    hasBlueprint
  } = useBlueprintCache();

  const blueprintValidation = useMemo(() => {
    return UnifiedBlueprintService.validateBlueprint(blueprintData);
  }, [blueprintData]);

  const getPersonalityTraits = useMemo(() => {
    if (!blueprintData) return [];

    console.log('🎯 Extracting personality traits from LayeredBlueprint:', {
      hasCognitive: !!blueprintData.cognitiveTemperamental,
      hasEnergy: !!blueprintData.energyDecisionStrategy,
      hasArchetype: !!blueprintData.publicArchetype,
      cognitiveType: blueprintData.cognitiveTemperamental?.mbtiType,
      energyType: blueprintData.energyDecisionStrategy?.humanDesignType,
      sunSign: blueprintData.publicArchetype?.sunSign,
    });

    const traits = [];
    
    // MBTI Type from cognitiveTemperamental
    const mbtiType = blueprintData.cognitiveTemperamental?.mbtiType;
    if (mbtiType && mbtiType !== 'Unknown') {
      traits.push(mbtiType);
    }
    
    // Human Design Type from energyDecisionStrategy
    const hdType = blueprintData.energyDecisionStrategy?.humanDesignType;
    if (hdType && hdType !== 'Unknown') {
      traits.push(hdType);
    }
    
    // Sun Sign from publicArchetype
    const sunSign = blueprintData.publicArchetype?.sunSign;
    if (sunSign && sunSign !== 'Unknown') {
      traits.push(`${sunSign} Sun`);
    }

    console.log('✅ Extracted personality traits:', traits);
    return traits;
  }, [blueprintData]);

  const getDisplayName = useMemo(() => {
    const name = blueprintData?.user_meta?.preferred_name || 
                 blueprintData?.user_meta?.full_name?.split(' ')[0] || 
                 'User';
    console.log('👤 Display name extracted:', name);
    return name;
  }, [blueprintData]);

  const getBlueprintCompletionPercentage = useMemo(() => {
    return blueprintValidation.completionPercentage;
  }, [blueprintValidation]);

  const getPersonalityType = useMemo(() => {
    if (!blueprintData) {
      return 'powerful soul';
    }
    
    // Get the actual MBTI type from cognitiveTemperamental
    const mbti = blueprintData?.cognitiveTemperamental?.mbtiType;
    if (mbti && mbti !== 'Unknown') {
      console.log('🎯 Using MBTI type:', mbti);
      return mbti;
    }
    
    // Fallback to Human Design type
    const hdType = blueprintData?.energyDecisionStrategy?.humanDesignType;
    if (hdType && hdType !== 'Unknown' && hdType !== 'Generator') {
      console.log('🎯 Using Human Design type:', hdType);
      return hdType;
    }
    
    // Fallback to sun sign
    const sunSign = blueprintData?.publicArchetype?.sunSign;
    if (sunSign && sunSign !== 'Unknown') {
      console.log('🎯 Using Sun Sign:', `${sunSign} soul`);
      return `${sunSign} soul`;
    }
    
    console.log('🎯 Using fallback: unique soul');
    return 'unique soul';
  }, [blueprintData]);

  const getBlueprintSummary = useMemo(() => {
    if (!blueprintData) return 'No blueprint data available';
    return UnifiedBlueprintService.extractBlueprintSummary(blueprintData);
  }, [blueprintData]);

  return {
    blueprintData,
    loading,
    error,
    refetch,
    hasBlueprint,
    getPersonalityTraits,
    getDisplayName,
    getBlueprintCompletionPercentage,
    getPersonalityType,
    getBlueprintSummary,
    blueprintValidation, // Expose validation details
  };
};

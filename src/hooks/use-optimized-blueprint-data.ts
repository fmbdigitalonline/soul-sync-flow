
import { useBlueprintCache } from '@/contexts/BlueprintCacheContext';
import { UnifiedBlueprintService } from '@/services/unified-blueprint-service';
import { LayeredBlueprint } from '@/types/personality-modules';
import { useMemo } from 'react';

export const useOptimizedBlueprintData = () => {
  const {
    blueprintData: rawBlueprintData,
    loading,
    error,
    refetch,
    hasBlueprint: rawHasBlueprint
  } = useBlueprintCache();

  // Convert and validate the blueprint data
  const blueprintData = useMemo((): LayeredBlueprint | null => {
    console.log('🎯 OPTIMIZED HOOK: Processing blueprint data', {
      hasRawData: !!rawBlueprintData,
      rawDataKeys: rawBlueprintData ? Object.keys(rawBlueprintData) : []
    });

    if (!rawBlueprintData) {
      console.log('❌ OPTIMIZED HOOK: No raw blueprint data');
      return null;
    }

    // The raw blueprint data is already in LayeredBlueprint format
    const converted = rawBlueprintData;
    
    console.log('✅ OPTIMIZED HOOK: Conversion complete', {
      sunSign: converted.publicArchetype?.sunSign,
      mbtiType: converted.cognitiveTemperamental?.mbtiType,
      hdType: converted.energyDecisionStrategy?.humanDesignType
    });

    return converted;
  }, [rawBlueprintData]);

  const blueprintValidation = useMemo(() => {
    const validation = UnifiedBlueprintService.validateBlueprint(blueprintData);
    console.log('🔍 OPTIMIZED HOOK: Validation result', validation);
    return validation;
  }, [blueprintData]);

  // Determine if we actually have a blueprint based on validation
  const hasBlueprint = useMemo(() => {
    const hasData = blueprintValidation.hasEssentialData;
    console.log('📋 OPTIMIZED HOOK: Has blueprint determination', {
      rawHasBlueprint,
      hasEssentialData: blueprintValidation.hasEssentialData,
      finalDecision: hasData
    });
    return hasData;
  }, [blueprintValidation.hasEssentialData, rawHasBlueprint]);

  const getPersonalityTraits = useMemo(() => {
    if (!blueprintData) {
      console.log('🎯 OPTIMIZED HOOK: No blueprint data for traits extraction');
      return [];
    }

    console.log('🎯 OPTIMIZED HOOK: Extracting personality traits from LayeredBlueprint:', {
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

    console.log('✅ OPTIMIZED HOOK: Extracted personality traits:', traits);
    return traits;
  }, [blueprintData]);

  const getDisplayName = useMemo(() => {
    const name = blueprintData?.user_meta?.preferred_name || 
                 blueprintData?.user_meta?.full_name?.split(' ')[0] || 
                 'User';
    console.log('👤 OPTIMIZED HOOK: Display name extracted:', name);
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
      console.log('🎯 OPTIMIZED HOOK: Using MBTI type:', mbti);
      return mbti;
    }
    
    // Fallback to Human Design type
    const hdType = blueprintData?.energyDecisionStrategy?.humanDesignType;
    if (hdType && hdType !== 'Unknown' && hdType !== 'Generator') {
      console.log('🎯 OPTIMIZED HOOK: Using Human Design type:', hdType);
      return hdType;
    }
    
    // Fallback to sun sign
    const sunSign = blueprintData?.publicArchetype?.sunSign;
    if (sunSign && sunSign !== 'Unknown') {
      console.log('🎯 OPTIMIZED HOOK: Using Sun Sign:', `${sunSign} soul`);
      return `${sunSign} soul`;
    }
    
    console.log('🎯 OPTIMIZED HOOK: Using fallback: unique soul');
    return 'unique soul';
  }, [blueprintData]);

  const getBlueprintSummary = useMemo(() => {
    if (!blueprintData) return 'No blueprint data available';
    return UnifiedBlueprintService.extractBlueprintSummary(blueprintData);
  }, [blueprintData]);

  console.log('📊 OPTIMIZED HOOK: Final state', {
    hasBlueprint,
    loading,
    error,
    completionPercentage: getBlueprintCompletionPercentage,
    personalityType: getPersonalityType
  });

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

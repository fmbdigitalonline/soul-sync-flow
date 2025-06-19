
import { useBlueprintCache } from '@/contexts/BlueprintCacheContext';
import { useMemo } from 'react';

export const useOptimizedBlueprintData = () => {
  const {
    blueprintData,
    loading,
    error,
    refetch,
    hasBlueprint
  } = useBlueprintCache();

  const getPersonalityTraits = useMemo(() => {
    if (!blueprintData) return [];

    console.log('🎯 Extracting personality traits from LayeredBlueprint:', {
      hasCognitive: !!blueprintData.cognitiveTemperamental,
      hasEnergyStrategy: !!blueprintData.energyDecisionStrategy,
      hasPublicArchetype: !!blueprintData.publicArchetype,
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
    if (!blueprintData) return 0;
    
    let completedFields = 0;
    const totalFields = 7;
    
    // Check each major section using LayeredBlueprint structure
    const checks = [
      { name: 'Sun Sign', value: blueprintData.publicArchetype?.sunSign, condition: (v: any) => v && v !== 'Unknown' },
      { name: 'Chinese Animal', value: blueprintData.generationalCode?.chineseZodiac, condition: (v: any) => v && v !== 'Unknown' },
      { name: 'Life Path', value: blueprintData.coreValuesNarrative?.lifePath, condition: (v: any) => !!v },
      { name: 'Human Design', value: blueprintData.energyDecisionStrategy?.humanDesignType, condition: (v: any) => v && v !== 'Generator' },
      { name: 'MBTI', value: blueprintData.cognitiveTemperamental?.mbtiType, condition: (v: any) => v && v !== 'Unknown' },
      { name: 'Motivation Engine', value: blueprintData.motivationBeliefEngine, condition: (v: any) => !!v },
      { name: 'Timing Overlays', value: blueprintData.timingOverlays, condition: (v: any) => !!v },
    ];
    
    checks.forEach(check => {
      if (check.condition(check.value)) {
        completedFields++;
        console.log(`✅ ${check.name}: Completed`);
      } else {
        console.log(`❌ ${check.name}: Not completed (${check.value})`);
      }
    });
    
    const percentage = Math.round((completedFields / totalFields) * 100);
    console.log(`📊 Blueprint completion: ${percentage}% (${completedFields}/${totalFields})`);
    return percentage;
  }, [blueprintData]);

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

  return {
    blueprintData,
    loading,
    error,
    refetch,
    hasBlueprint,
    getPersonalityTraits,
    getDisplayName,
    getBlueprintCompletionPercentage,
    getPersonalityType
  };
};

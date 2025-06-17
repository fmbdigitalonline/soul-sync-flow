
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

    console.log('🎯 Extracting personality traits from blueprint:', {
      hasCognitionMBTI: !!blueprintData.cognition_mbti,
      hasEnergyStrategy: !!blueprintData.energy_strategy_human_design,
      hasArchetypeWestern: !!blueprintData.archetype_western,
      cognitionMBTI: blueprintData.cognition_mbti,
      energyStrategy: blueprintData.energy_strategy_human_design,
      archetypeWestern: blueprintData.archetype_western,
    });

    const traits = [];
    
    // MBTI Type from cognition_mbti
    const mbtiType = blueprintData.cognition_mbti?.type;
    if (mbtiType && mbtiType !== 'Unknown') {
      traits.push(mbtiType);
    }
    
    // Human Design Type from energy_strategy_human_design
    const hdType = blueprintData.energy_strategy_human_design?.type;
    if (hdType && hdType !== 'Unknown') {
      traits.push(hdType);
    }
    
    // Sun Sign from archetype_western
    const sunSign = blueprintData.archetype_western?.sun_sign;
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
    
    // Check each major section
    const checks = [
      { name: 'Sun Sign', value: blueprintData.archetype_western?.sun_sign, condition: (v: any) => v && v !== 'Unknown' },
      { name: 'Chinese Animal', value: blueprintData.archetype_chinese?.animal, condition: (v: any) => v && v !== 'Unknown' },
      { name: 'Life Path', value: blueprintData.values_life_path?.lifePathNumber, condition: (v: any) => !!v },
      { name: 'Human Design', value: blueprintData.energy_strategy_human_design?.type, condition: (v: any) => v && v !== 'Generator' },
      { name: 'MBTI', value: blueprintData.cognition_mbti?.type, condition: (v: any) => v && v !== 'Unknown' },
      { name: 'Bashar Suite', value: blueprintData.bashar_suite, condition: (v: any) => !!v },
      { name: 'Timing Overlays', value: blueprintData.timing_overlays, condition: (v: any) => !!v },
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
    
    // Get the actual MBTI type from cognition_mbti
    const mbti = blueprintData?.cognition_mbti?.type;
    if (mbti && mbti !== 'Unknown') {
      console.log('🎯 Using MBTI type:', mbti);
      return mbti;
    }
    
    // Fallback to Human Design type
    const hdType = blueprintData?.energy_strategy_human_design?.type;
    if (hdType && hdType !== 'Unknown' && hdType !== 'Generator') {
      console.log('🎯 Using Human Design type:', hdType);
      return hdType;
    }
    
    // Fallback to sun sign
    const sunSign = blueprintData?.archetype_western?.sun_sign;
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

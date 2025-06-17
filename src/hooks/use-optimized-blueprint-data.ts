
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

    const traits = [];
    
    // Fixed: Use correct blueprint data structure
    const sunSign = blueprintData.astrology?.sun_sign || blueprintData.archetype_western?.sun_sign;
    if (sunSign) {
      traits.push(`${sunSign} Sun`);
    }
    
    const mbtiType = blueprintData.mbti?.type || blueprintData.cognition_mbti?.type;
    if (mbtiType) {
      traits.push(mbtiType);
    }
    
    const hdType = blueprintData.human_design?.type || blueprintData.energy_strategy_human_design?.type;
    if (hdType) {
      traits.push(hdType);
    }

    return traits;
  }, [blueprintData]);

  const getDisplayName = useMemo(() => {
    return blueprintData?.user_meta?.preferred_name || 
           blueprintData?.user_meta?.full_name?.split(' ')[0] || 
           'User';
  }, [blueprintData]);

  const getBlueprintCompletionPercentage = useMemo(() => {
    if (!blueprintData) return 0;
    
    let completedFields = 0;
    const totalFields = 7;
    
    // Fixed: Use correct blueprint data structure
    const sunSign = blueprintData.astrology?.sun_sign || blueprintData.archetype_western?.sun_sign;
    if (sunSign && sunSign !== 'Unknown') completedFields++;
    
    const animal = blueprintData.astrology?.animal || blueprintData.archetype_chinese?.animal;
    if (animal && animal !== 'Unknown') completedFields++;
    
    const lifePathNumber = blueprintData.numerology?.lifePathNumber || blueprintData.values_life_path?.lifePathNumber;
    if (lifePathNumber) completedFields++;
    
    const hdType = blueprintData.human_design?.type || blueprintData.energy_strategy_human_design?.type;
    if (hdType && hdType !== 'Generator') completedFields++;
    
    const mbtiType = blueprintData.mbti?.type || blueprintData.cognition_mbti?.type;
    if (mbtiType) completedFields++;
    
    if (blueprintData.bashar_suite) completedFields++;
    if (blueprintData.timing_overlays) completedFields++;
    
    return Math.round((completedFields / totalFields) * 100);
  }, [blueprintData]);

  // Fixed: Prevent infinite re-rendering by memoizing the personality type
  const getPersonalityType = useMemo(() => {
    if (!blueprintData) {
      return 'powerful soul';
    }
    
    // Fixed: Use correct blueprint data structure
    const mbti = blueprintData?.mbti?.type || blueprintData?.cognition_mbti?.type;
    const hdType = blueprintData?.human_design?.type || blueprintData?.energy_strategy_human_design?.type;
    
    // Return the first available type with better fallbacks
    if (mbti && mbti !== 'Unknown') return mbti;
    if (hdType && hdType !== 'Unknown' && hdType !== 'Generator') return hdType;
    
    // Improved fallback based on available data
    const sunSign = blueprintData?.astrology?.sun_sign || blueprintData?.archetype_western?.sun_sign;
    if (sunSign && sunSign !== 'Unknown') {
      return `${sunSign} soul`;
    }
    
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

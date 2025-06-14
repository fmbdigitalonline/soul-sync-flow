
import { useBlueprintCache } from '@/contexts/BlueprintCacheContext';

export const useOptimizedBlueprintData = () => {
  const {
    blueprintData,
    loading,
    error,
    refetch,
    hasBlueprint
  } = useBlueprintCache();

  const getPersonalityTraits = () => {
    if (!blueprintData) return [];

    const traits = [];
    
    if (blueprintData.archetype_western?.sun_sign) {
      traits.push(`${blueprintData.archetype_western.sun_sign} Sun`);
    }
    
    if (blueprintData.cognition_mbti?.type) {
      traits.push(blueprintData.cognition_mbti.type);
    }
    
    if (blueprintData.energy_strategy_human_design?.type) {
      traits.push(blueprintData.energy_strategy_human_design.type);
    }

    return traits;
  };

  const getDisplayName = () => {
    return blueprintData?.user_meta?.preferred_name || 
           blueprintData?.user_meta?.full_name?.split(' ')[0] || 
           'User';
  };

  const getBlueprintCompletionPercentage = () => {
    if (!blueprintData) return 0;
    
    let completedFields = 0;
    const totalFields = 7;
    
    if (blueprintData.archetype_western?.sun_sign !== 'Unknown') completedFields++;
    if (blueprintData.archetype_chinese?.animal !== 'Unknown') completedFields++;
    if (blueprintData.values_life_path?.lifePathNumber) completedFields++;
    if (blueprintData.energy_strategy_human_design?.type !== 'Generator') completedFields++;
    if (blueprintData.cognition_mbti?.type) completedFields++;
    if (blueprintData.bashar_suite) completedFields++;
    if (blueprintData.timing_overlays) completedFields++;
    
    return Math.round((completedFields / totalFields) * 100);
  };

  // Add debug logging for user type detection
  const getPersonalityType = () => {
    console.log('🎯 Getting personality type from optimized blueprint data:', blueprintData);
    
    if (!blueprintData) {
      console.log('❌ No blueprint data available in optimized hook');
      return 'powerful soul';
    }
    
    const mbti = blueprintData?.cognition_mbti?.type;
    const hdType = blueprintData?.energy_strategy_human_design?.type;
    
    console.log('🔍 Optimized MBTI type found:', mbti);
    console.log('🔍 Optimized Human Design type found:', hdType);
    
    // Return the first available type with better fallbacks
    if (mbti && mbti !== 'Unknown') return mbti;
    if (hdType && hdType !== 'Unknown' && hdType !== 'Generator') return hdType;
    
    // Improved fallback based on available data
    if (blueprintData?.archetype_western?.sun_sign && blueprintData.archetype_western.sun_sign !== 'Unknown') {
      return `${blueprintData.archetype_western.sun_sign} soul`;
    }
    
    return 'unique soul';
  };

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

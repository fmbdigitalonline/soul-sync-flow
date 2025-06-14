
import { useState, useEffect } from 'react';
import { blueprintService } from '@/services/blueprint-service';

export const useBlueprintData = () => {
  const [blueprintData, setBlueprintData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBlueprintData = async () => {
    try {
      setLoading(true);
      const { data, error: blueprintError } = await blueprintService.getActiveBlueprintData();
      
      if (blueprintError) {
        setError(blueprintError);
        return;
      }

      // Ensure backward compatibility by mapping new properties to legacy names
      if (data) {
        console.log('🔍 Raw blueprint data received:', data);
        
        const compatibleData = {
          ...data,
          archetype_western: data.archetype_western || data.astrology,
          archetype_chinese: data.archetype_chinese || data.astrology,
          values_life_path: data.values_life_path || data.numerology,
          // Fixed: Prioritize actual database field names first
          energy_strategy_human_design: data.human_design || data.energy_strategy_human_design,
          cognition_mbti: data.mbti || data.cognition_mbti,
          bashar_suite: data.bashar_suite || {},
          timing_overlays: data.timing_overlays || {}
        };
        
        console.log('🔄 Mapped blueprint data:', compatibleData);
        console.log('🎯 MBTI data:', compatibleData.cognition_mbti);
        console.log('🎯 Human Design data:', compatibleData.energy_strategy_human_design);
        
        setBlueprintData(compatibleData);
      }

      setError(null);
    } catch (err) {
      console.error('Error fetching blueprint:', err);
      setError('Failed to fetch blueprint data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlueprintData();
  }, []);

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
    const totalFields = 7; // Major sections we expect
    
    if (blueprintData.archetype_western?.sun_sign !== 'Unknown') completedFields++;
    if (blueprintData.archetype_chinese?.animal !== 'Unknown') completedFields++;
    if (blueprintData.values_life_path?.lifePathNumber) completedFields++;
    if (blueprintData.energy_strategy_human_design?.type !== 'Generator') completedFields++;
    if (blueprintData.cognition_mbti?.type) completedFields++;
    if (blueprintData.bashar_suite) completedFields++;
    if (blueprintData.timing_overlays) completedFields++;
    
    return Math.round((completedFields / totalFields) * 100);
  };

  return {
    blueprintData,
    loading,
    error,
    refetch: fetchBlueprintData,
    getPersonalityTraits,
    getDisplayName,
    getBlueprintCompletionPercentage
  };
};

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
        
        // Fixed: Properly map personality data to MBTI section with type safety
        const personalityData = data.user_meta?.personality;
        const mbtiType = personalityData?.likelyType || 'Unknown';
        const mbtiDescription = personalityData?.description || 'No description available';
        
        // Extract core traits from description for keywords
        const extractKeywords = (description: string) => {
          const keywords = [];
          if (description.includes('authentic')) keywords.push('Authentic');
          if (description.includes('empathetic')) keywords.push('Empathetic');
          if (description.includes('growth')) keywords.push('Growth-oriented');
          if (description.includes('helping')) keywords.push('Helper');
          if (description.includes('creative')) keywords.push('Creative');
          if (description.includes('values')) keywords.push('Values-driven');
          return keywords.length > 0 ? keywords : ['Authentic', 'Empathetic'];
        };

        // Map MBTI functions based on type
        const getMBTIFunctions = (type: string) => {
          const functionMap: { [key: string]: { dominant: string; auxiliary: string } } = {
            'INFP': { dominant: 'Introverted Feeling', auxiliary: 'Extraverted Intuition' },
            'ENFP': { dominant: 'Extraverted Intuition', auxiliary: 'Introverted Feeling' },
            'INFJ': { dominant: 'Introverted Intuition', auxiliary: 'Extraverted Feeling' },
            'ENFJ': { dominant: 'Extraverted Feeling', auxiliary: 'Introverted Intuition' },
            'INTJ': { dominant: 'Introverted Intuition', auxiliary: 'Extraverted Thinking' },
            'ENTJ': { dominant: 'Extraverted Thinking', auxiliary: 'Introverted Intuition' },
            'INTP': { dominant: 'Introverted Thinking', auxiliary: 'Extraverted Intuition' },
            'ENTP': { dominant: 'Extraverted Intuition', auxiliary: 'Introverted Thinking' },
            'ISFP': { dominant: 'Introverted Feeling', auxiliary: 'Extraverted Sensing' },
            'ESFP': { dominant: 'Extraverted Sensing', auxiliary: 'Introverted Feeling' },
            'ISFJ': { dominant: 'Introverted Sensing', auxiliary: 'Extraverted Feeling' },
            'ESFJ': { dominant: 'Extraverted Feeling', auxiliary: 'Introverted Sensing' },
            'ISTJ': { dominant: 'Introverted Sensing', auxiliary: 'Extraverted Thinking' },
            'ESTJ': { dominant: 'Extraverted Thinking', auxiliary: 'Introverted Sensing' },
            'ISTP': { dominant: 'Introverted Thinking', auxiliary: 'Extraverted Sensing' },
            'ESTP': { dominant: 'Extraverted Sensing', auxiliary: 'Introverted Thinking' }
          };
          return functionMap[type] || { dominant: 'Unknown', auxiliary: 'Unknown' };
        };

        const functions = getMBTIFunctions(mbtiType);
        
        const compatibleData = {
          ...data,
          archetype_western: data.archetype_western || data.astrology,
          archetype_chinese: data.archetype_chinese || data.astrology,
          values_life_path: data.values_life_path || data.numerology,
          energy_strategy_human_design: data.energy_strategy_human_design || data.human_design,
          // Fixed: Properly populate MBTI data from personality assessment with type safety
          cognition_mbti: {
            type: mbtiType,
            core_keywords: extractKeywords(mbtiDescription),
            dominant_function: functions.dominant,
            auxiliary_function: functions.auxiliary,
            description: mbtiDescription,
            confidence: personalityData?.userConfidence || 0.5,
            big_five: personalityData?.bigFive || {},
            probabilities: personalityData?.mbtiProbabilities || {}
          },
          bashar_suite: data.bashar_suite || {},
          timing_overlays: data.timing_overlays || {}
        };
        
        console.log('🔄 Mapped blueprint data:', compatibleData);
        console.log('🎯 Enhanced MBTI data:', compatibleData.cognition_mbti);
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
    
    if (blueprintData.cognition_mbti?.type && blueprintData.cognition_mbti.type !== 'Unknown') {
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
    if (blueprintData.values_life_path?.life_path_number) completedFields++;
    if (blueprintData.energy_strategy_human_design?.type !== 'Generator') completedFields++;
    if (blueprintData.cognition_mbti?.type !== 'Unknown') completedFields++;
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

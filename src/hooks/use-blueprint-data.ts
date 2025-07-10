
import { useState, useEffect } from 'react';
import { blueprintService } from '@/services/blueprint-service';

interface PersonalityData {
  likelyType?: string;
  description?: string;
  userConfidence?: number;
  bigFive?: any;
  mbtiProbabilities?: any;
}

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
        
        // Fixed: Properly map personality data to MBTI section with proper type checking
        const personalityData = data.user_meta?.personality;
        
        // Ensure personalityData is an object with proper typing
        const personalityObj: PersonalityData = (typeof personalityData === 'object' && personalityData !== null) 
          ? personalityData as PersonalityData 
          : {};
        
        const mbtiType = personalityObj.likelyType || 'Unknown';
        const mbtiDescription = personalityObj.description || 'No description available';
        
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
          // Fixed: Properly populate MBTI data from personality assessment with proper type safety
          cognition_mbti: {
            type: mbtiType,
            core_keywords: extractKeywords(mbtiDescription),
            dominant_function: functions.dominant,
            auxiliary_function: functions.auxiliary,
            description: mbtiDescription,
            confidence: personalityObj.userConfidence || 0.5,
            big_five: personalityObj.bigFive || {},
            probabilities: personalityObj.mbtiProbabilities || {}
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
    if (!blueprintData?.user_meta) {
      console.log('🎯 getDisplayName: No user_meta in blueprint data');
      return 'User';
    }

    const userMeta = blueprintData.user_meta;
    
    console.log('🎯 getDisplayName: Available user_meta fields:', {
      preferred_name: userMeta.preferred_name,
      first_name: userMeta.first_name,
      full_name: userMeta.full_name,
      display_name: userMeta.display_name
    });

    // Priority: preferred_name > first_name > first part of full_name > display_name > 'User'
    if (userMeta.preferred_name && typeof userMeta.preferred_name === 'string' && userMeta.preferred_name.trim()) {
      console.log('🎯 getDisplayName: Using preferred_name:', userMeta.preferred_name.trim());
      return userMeta.preferred_name.trim();
    }
    
    if (userMeta.first_name && typeof userMeta.first_name === 'string' && userMeta.first_name.trim()) {
      console.log('🎯 getDisplayName: Using first_name:', userMeta.first_name.trim());
      return userMeta.first_name.trim();
    }
    
    if (userMeta.full_name && typeof userMeta.full_name === 'string' && userMeta.full_name.trim()) {
      const firstName = userMeta.full_name.trim().split(' ')[0];
      if (firstName && firstName.length > 2) { // Avoid initials or very short strings
        console.log('🎯 getDisplayName: Using first part of full_name:', firstName);
        return firstName;
      }
    }
    
    if (userMeta.display_name && typeof userMeta.display_name === 'string' && userMeta.display_name.trim()) {
      const cleanDisplayName = userMeta.display_name.trim();
      // Avoid email-like strings or very short strings
      if (!cleanDisplayName.includes('@') && cleanDisplayName.length > 2) {
        console.log('🎯 getDisplayName: Using display_name:', cleanDisplayName);
        return cleanDisplayName;
      }
    }
    
    console.log('🎯 getDisplayName: Falling back to "User"');
    return 'User';
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

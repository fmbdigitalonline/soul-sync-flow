/**
 * MBTI to Cognitive Functions Mapper
 * 
 * Maps MBTI types to their cognitive function stacks.
 * Following Jungian cognitive function theory.
 */

export interface CognitiveFunctions {
  dominant: string;
  auxiliary: string;
  tertiary: string;
  inferior: string;
}

// Cognitive function abbreviations:
// Ne = Extraverted Intuition, Ni = Introverted Intuition
// Se = Extraverted Sensing, Si = Introverted Sensing
// Te = Extraverted Thinking, Ti = Introverted Thinking
// Fe = Extraverted Feeling, Fi = Introverted Feeling

const MBTI_COGNITIVE_FUNCTIONS: Record<string, CognitiveFunctions> = {
  // Analysts (NT)
  INTJ: { dominant: 'Ni', auxiliary: 'Te', tertiary: 'Fi', inferior: 'Se' },
  INTP: { dominant: 'Ti', auxiliary: 'Ne', tertiary: 'Si', inferior: 'Fe' },
  ENTJ: { dominant: 'Te', auxiliary: 'Ni', tertiary: 'Se', inferior: 'Fi' },
  ENTP: { dominant: 'Ne', auxiliary: 'Ti', tertiary: 'Fe', inferior: 'Si' },
  
  // Diplomats (NF)
  INFJ: { dominant: 'Ni', auxiliary: 'Fe', tertiary: 'Ti', inferior: 'Se' },
  INFP: { dominant: 'Fi', auxiliary: 'Ne', tertiary: 'Si', inferior: 'Te' },
  ENFJ: { dominant: 'Fe', auxiliary: 'Ni', tertiary: 'Se', inferior: 'Ti' },
  ENFP: { dominant: 'Ne', auxiliary: 'Fi', tertiary: 'Te', inferior: 'Si' },
  
  // Sentinels (SJ)
  ISTJ: { dominant: 'Si', auxiliary: 'Te', tertiary: 'Fi', inferior: 'Ne' },
  ISFJ: { dominant: 'Si', auxiliary: 'Fe', tertiary: 'Ti', inferior: 'Ne' },
  ESTJ: { dominant: 'Te', auxiliary: 'Si', tertiary: 'Ne', inferior: 'Fi' },
  ESFJ: { dominant: 'Fe', auxiliary: 'Si', tertiary: 'Ne', inferior: 'Ti' },
  
  // Explorers (SP)
  ISTP: { dominant: 'Ti', auxiliary: 'Se', tertiary: 'Ni', inferior: 'Fe' },
  ISFP: { dominant: 'Fi', auxiliary: 'Se', tertiary: 'Ni', inferior: 'Te' },
  ESTP: { dominant: 'Se', auxiliary: 'Ti', tertiary: 'Fe', inferior: 'Ni' },
  ESFP: { dominant: 'Se', auxiliary: 'Fi', tertiary: 'Te', inferior: 'Ni' }
};

/**
 * Get cognitive functions for a given MBTI type
 */
export const getCognitiveFunctions = (mbtiType: string): CognitiveFunctions | null => {
  const normalizedType = mbtiType.toUpperCase().trim();
  return MBTI_COGNITIVE_FUNCTIONS[normalizedType] || null;
};

/**
 * Get full function name with description
 */
export const getCognitiveFunctionDescription = (functionCode: string): string => {
  const descriptions: Record<string, string> = {
    'Ne': 'Extraverted Intuition - Exploring possibilities',
    'Ni': 'Introverted Intuition - Pattern recognition',
    'Se': 'Extraverted Sensing - Present awareness',
    'Si': 'Introverted Sensing - Memory & detail',
    'Te': 'Extraverted Thinking - Logical organization',
    'Ti': 'Introverted Thinking - Analytical reasoning',
    'Fe': 'Extraverted Feeling - Social harmony',
    'Fi': 'Introverted Feeling - Personal values'
  };
  
  return descriptions[functionCode] || functionCode;
};

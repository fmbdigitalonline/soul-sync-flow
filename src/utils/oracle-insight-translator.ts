import { HACSInsight } from '@/hooks/use-hacs-insights';

export interface PersonalityContext {
  blueprint?: any;
  communicationStyle?: string;
  preferredTone?: string;
  timingPattern?: string;
}

export const translateAnalyticsToOracle = (
  insight: HACSInsight,
  personalityContext?: PersonalityContext
): HACSInsight => {
  if (!personalityContext?.blueprint) {
    return insight; // Return original if no personality context
  }

  try {
    // Transform technical insights into oracle-style messages
    const oracleText = generateOracleInsightText(insight, personalityContext);
    
    return {
      ...insight,
      text: oracleText,
      module: 'Oracle', // Change from 'Analytics' to 'Oracle'
    };
  } catch (error) {
    console.error('Error translating insight to oracle style:', error);
    return insight; // Return original on error
  }
};

const generateOracleInsightText = (
  insight: HACSInsight,
  personalityContext: PersonalityContext
): string => {
  const { type, text } = insight;
  
  // Extract personality traits for oracle-style communication
  const blueprint = personalityContext.blueprint;
  const mbtiType = blueprint?.cognition_mbti?.type || 'INFP';
  const hdType = blueprint?.energy_strategy_human_design?.type || 'Manifesting Generator';
  const communicationStyle = personalityContext.communicationStyle || 'mystical';

  // Transform based on insight type
  switch (type) {
    case 'intelligence_trend':
      return generateIntelligenceTrendOracle(text, mbtiType, communicationStyle);
    
    case 'learning_streak':
      return generateLearningStreakOracle(text, hdType, communicationStyle);
    
    case 'performance_trend':
      return generatePerformanceTrendOracle(text, mbtiType, communicationStyle);
    
    case 'module_performance':
      return generateModulePerformanceOracle(text, blueprint, communicationStyle);
    
    default:
      return generateGenericOracle(text, blueprint, communicationStyle);
  }
};

const generateIntelligenceTrendOracle = (
  originalText: string,
  mbtiType: string,
  style: string
): string => {
  // Extract data from technical message
  const percentMatch = originalText.match(/(\d+\.?\d*)%/);
  const directionMatch = originalText.match(/(increasing|decreasing)/);
  const levelMatch = originalText.match(/Current level: (\d+\.?\d*)%/);
  
  if (!percentMatch || !directionMatch || !levelMatch) {
    return originalText;
  }

  const changePercent = percentMatch[1];
  const direction = directionMatch[1];
  const currentLevel = levelMatch[1];

  // Clear, inspiring transformation based on personality
  if (mbtiType.includes('N')) { // Intuitive types appreciate big-picture thinking
    if (direction === 'increasing') {
      return `Excellent progress! Your learning capacity has grown ${changePercent}% this week, reaching ${currentLevel}% overall. You're naturally building connections between ideas faster. Keep exploring new concepts to maintain this momentum.`;
    } else {
      return `Your intelligence level adjusted ${changePercent}% to ${currentLevel}% - this often happens when you're processing deeper insights. Focus on reviewing recent learnings to consolidate your understanding.`;
    }
  } else { // Sensing types appreciate step-by-step progress
    if (direction === 'increasing') {
      return `Great work! You've improved ${changePercent}% through consistent practice, now at ${currentLevel}% mastery. Your methodical approach is paying off. Continue your current learning routine for steady gains.`;
    } else {
      return `Your capacity shifted ${changePercent}% to ${currentLevel}% - a natural pause in learning curves. Try breaking down complex topics into smaller, manageable pieces to rebuild momentum.`;
    }
  }
};

const generateLearningStreakOracle = (
  originalText: string,
  hdType: string,
  style: string
): string => {
  const streakMatch = originalText.match(/(\d+)-day learning streak/);
  const longestMatch = originalText.match(/longest streak was (\d+) days/);
  
  if (!streakMatch || !longestMatch) {
    return originalText;
  }

  const currentStreak = streakMatch[1];
  const longestStreak = longestMatch[1];

  // Clear, encouraging streak recognition based on Human Design
  if (hdType.includes('Generator')) {
    return `Amazing consistency! You've maintained a ${currentStreak}-day learning streak by following your natural energy flow. Your personal best of ${longestStreak} days shows you thrive with sustainable daily practice. Keep responding to what energizes you most.`;
  } else if (hdType.includes('Projector')) {
    return `Impressive dedication! ${currentStreak} days of focused learning demonstrates your natural efficiency. Your ${longestStreak}-day record shows you excel when you pace yourself well. Continue learning in focused bursts when you feel most clear.`;
  } else {
    return `Outstanding momentum! ${currentStreak} consecutive days of learning shows your commitment is paying off. With a personal best of ${longestStreak} days, you've proven you can maintain long-term focus. Trust your natural rhythm and keep building.`;
  }
};

const generatePerformanceTrendOracle = (
  originalText: string,
  mbtiType: string,
  style: string
): string => {
  const scoreMatch = originalText.match(/average score of (\d+\.?\d*)/);
  const trendMatch = originalText.match(/has been (\w+)/);
  const sampleMatch = originalText.match(/over (\d+) interactions/);
  
  if (!scoreMatch || !trendMatch || !sampleMatch) {
    return originalText;
  }

  const score = scoreMatch[1];
  const trend = trendMatch[1];
  const interactions = sampleMatch[1];

  if (mbtiType.includes('F')) { // Feeling types appreciate personal connection
    if (trend === 'improving') {
      return `Wonderful growth! Your response quality is averaging ${score} across ${interactions} interactions, showing you're connecting more effectively. Your empathetic approach is clearly resonating. Keep focusing on authentic engagement.`;
    } else {
      return `Your responses are averaging ${score} over ${interactions} interactions. This is valuable feedback - try taking a moment to tune into what others really need before responding.`;
    }
  } else { // Thinking types prefer systematic improvement
    if (trend === 'improving') {
      return `Strong performance! You're achieving an average score of ${score} across ${interactions} interactions through logical, structured responses. Your analytical approach is working well. Continue refining your reasoning process.`;
    } else {
      return `Your average score is ${score} over ${interactions} interactions. Consider breaking down complex responses into clearer, more organized points to improve effectiveness.`;
    }
  }
};

const generateModulePerformanceOracle = (
  originalText: string,
  blueprint: any,
  style: string
): string => {
  // Extract module names and scores
  const strongestMatch = originalText.match(/strongest module is (.+?) \((\d+\.?\d*)%\)/);
  const weakestMatch = originalText.match(/while (.+?) \((\d+\.?\d*)%\) could use more attention/);
  
  if (!strongestMatch || !weakestMatch) {
    return originalText;
  }

  const strongestModule = strongestMatch[1];
  const strongestScore = strongestMatch[2];
  const weakestModule = weakestMatch[1];
  const weakestScore = weakestMatch[2];

  // Transform technical module names to clear, understandable concepts
  const moduleTranslations: { [key: string]: string } = {
    'Neural Integration Kernel': 'Core Learning Ability',
    'Cognitive Pattern Recognition': 'Pattern Recognition',
    'Temporal Wisdom Synthesis': 'Knowledge Integration',
    'Framework Management': 'System Organization',
    'Personality Expression': 'Authentic Communication',
    'Conflict Navigation': 'Problem Resolution',
    'Blueprint Sync': 'Self-Alignment',
    'Conversation System': 'Communication Skills',
    'Predictive Intelligence': 'Insight Generation',
    'Vector Fusion': 'Information Processing',
    'Temporal Memory': 'Memory & Recall'
  };

  const strongestClear = moduleTranslations[strongestModule] || strongestModule;
  const weakestClear = moduleTranslations[weakestModule] || weakestModule;

  // Clear, inspiring guidance based on astrological influence
  const sunSign = blueprint?.archetype_western?.sun_sign || 'Sagittarius';
  
  if (['Leo', 'Aries', 'Sagittarius'].includes(sunSign)) { // Fire signs - direct, energetic approach
    return `Excellent! Your ${strongestClear} is performing strongly at ${strongestScore}% - you're naturally excelling in this area. Your ${weakestClear} at ${weakestScore}% has great potential. Try setting bold, specific goals to rapidly develop this skill.`;
  } else if (['Cancer', 'Scorpio', 'Pisces'].includes(sunSign)) { // Water signs - intuitive, emotional approach
    return `Beautiful work! Your ${strongestClear} shines at ${strongestScore}%, showing your natural intuitive strength. Your ${weakestClear} at ${weakestScore}% can grow through gentle, consistent practice. Trust your instincts and take it step by step.`;
  } else if (['Gemini', 'Libra', 'Aquarius'].includes(sunSign)) { // Air signs - intellectual, systematic approach
    return `Impressive progress! Your ${strongestClear} excels at ${strongestScore}%, demonstrating your analytical capabilities. Your ${weakestClear} at ${weakestScore}% would benefit from structured learning. Consider creating a systematic study plan for this area.`;
  } else { // Earth signs - practical, methodical approach
    return `Solid achievement! Your ${strongestClear} is strong at ${strongestScore}%, built through your practical approach. Your ${weakestClear} at ${weakestScore}% can improve with consistent daily practice. Set a realistic routine and stick to it.`;
  }
};

const generateGenericOracle = (
  originalText: string,
  blueprint: any,
  style: string
): string => {
  // For any other insight types, apply clear, inspiring transformation
  const lifePathNumber = blueprint?.values_life_path?.lifePathNumber || 1;
  
  const encouragingPrefixes = [
    "Here's what your progress shows:",
    "Your growth patterns reveal:",
    "Your learning data indicates:",
    "Your development trends show:",
    "Your achievement patterns suggest:"
  ];

  const selectedPrefix = encouragingPrefixes[lifePathNumber % encouragingPrefixes.length];
  
  // Transform technical language to clearer, more understandable terms
  let transformedText = originalText
    .replace(/analytics/gi, 'progress patterns')
    .replace(/data/gi, 'learning insights')
    .replace(/algorithm/gi, 'systematic approach')
    .replace(/performance/gi, 'skill development')
    .replace(/optimization/gi, 'improvement');

  return `${selectedPrefix} ${transformedText}`;
};
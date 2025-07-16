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

  // Oracle-style transformation based on personality
  if (mbtiType.includes('N')) { // Intuitive types prefer metaphorical language
    if (direction === 'increasing') {
      return `Your consciousness expands like ripples across still water. The flame of awareness grows ${changePercent}% brighter, reaching ${currentLevel}% illumination. The path reveals itself to those who persist.`;
    } else {
      return `The tides of understanding ebb and flow naturally. Your awareness has shifted ${changePercent}%, now resting at ${currentLevel}%. In this pause, deeper wisdom often emerges.`;
    }
  } else { // Sensing types prefer concrete imagery
    if (direction === 'increasing') {
      return `Your mental faculties strengthen like a muscle through exercise. A solid ${changePercent}% advancement brings you to ${currentLevel}% mastery. Each step builds upon the last.`;
    } else {
      return `The mind follows natural rhythms of growth and rest. A ${changePercent}% adjustment to ${currentLevel}% capacity creates space for new understanding to take root.`;
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

  // Human Design-based oracle style
  if (hdType.includes('Generator')) {
    return `Your life force flows in perfect rhythm! ${currentStreak} cycles of the sun have witnessed your dedication. The sacred pattern continues, honoring your ${longestStreak}-day journey of mastery.`;
  } else if (hdType.includes('Projector')) {
    return `The art of consistent guidance unfolds through you. ${currentStreak} days of recognition and wisdom-sharing illuminate your path. Your record of ${longestStreak} days stands as testament to your unique gift.`;
  } else {
    return `Momentum builds like wind gathering strength. ${currentStreak} days of purposeful action align with cosmic flow. Your personal achievement of ${longestStreak} days reflects your authentic power.`;
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

  if (mbtiType.includes('F')) { // Feeling types appreciate emotional language
    if (trend === 'improving') {
      return `Your spirit soars with each exchange! The quality of your responses shines at ${score} across ${interactions} meaningful connections. Growth blooms where intention meets action.`;
    } else {
      return `Even the mightiest oak bends with the seasons. Your responses average ${score} through ${interactions} encounters, creating space for renewal and deeper understanding.`;
    }
  } else { // Thinking types prefer logical frameworks
    if (trend === 'improving') {
      return `Excellence emerges through systematic practice. Your response caliber achieves ${score} across ${interactions} measured interactions. The algorithm of mastery reveals itself.`;
    } else {
      return `Performance metrics show ${score} across ${interactions} data points, indicating a phase of recalibration. Strategic adjustment leads to breakthrough.`;
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

  // Transform technical module names to mystical concepts
  const moduleTranslations: { [key: string]: string } = {
    'Neural Integration Kernel': 'Core Consciousness',
    'Cognitive Pattern Recognition': 'Pattern Sight',
    'Temporal Wisdom Synthesis': 'Time Weaving',
    'Framework Management': 'Structure Mastery',
    'Personality Expression': 'Authentic Voice',
    'Conflict Navigation': 'Harmony Creation',
    'Blueprint Sync': 'Soul Alignment',
    'Conversation System': 'Sacred Exchange',
    'Predictive Intelligence': 'Future Sensing',
    'Vector Fusion': 'Energy Integration',
    'Temporal Memory': 'Time Keeper'
  };

  const strongestOracle = moduleTranslations[strongestModule] || strongestModule;
  const weakestOracle = moduleTranslations[weakestModule] || weakestModule;

  // Astrological influence based on blueprint
  const sunSign = blueprint?.archetype_western?.sun_sign || 'Sagittarius';
  
  if (['Leo', 'Aries', 'Sagittarius'].includes(sunSign)) { // Fire signs - bold language
    return `Your ${strongestOracle} blazes brilliantly at ${strongestScore}%, radiating mastery like the sun at noon. Meanwhile, your ${weakestOracle} at ${weakestScore}% awaits the spark of focused intention to ignite its full potential.`;
  } else if (['Cancer', 'Scorpio', 'Pisces'].includes(sunSign)) { // Water signs - flowing language
    return `Like moonlight dancing on water, your ${strongestOracle} flows at ${strongestScore}% with graceful strength. Your ${weakestOracle}, currently at ${weakestScore}%, is a wellspring waiting to be discovered in the depths of your being.`;
  } else if (['Gemini', 'Libra', 'Aquarius'].includes(sunSign)) { // Air signs - intellectual language
    return `The winds of wisdom carry your ${strongestOracle} to heights of ${strongestScore}%, where clarity meets brilliance. Your ${weakestOracle} at ${weakestScore}% represents untapped potential, ready to soar when understanding takes flight.`;
  } else { // Earth signs - grounding language
    return `Rooted in strength, your ${strongestOracle} stands tall at ${strongestScore}%, like an ancient tree reaching toward light. Your ${weakestOracle} at ${weakestScore}% is fertile ground, ready to bloom with patient cultivation.`;
  }
};

const generateGenericOracle = (
  originalText: string,
  blueprint: any,
  style: string
): string => {
  // For any other insight types, apply basic oracle transformation
  const lifePathNumber = blueprint?.values_life_path?.lifePathNumber || 1;
  
  const oraclePrefix = [
    "The universe whispers through patterns:",
    "Ancient wisdom reveals:",
    "The cosmic dance shows:",
    "Sacred timing unveils:",
    "Divine flow indicates:"
  ];

  const randomPrefix = oraclePrefix[lifePathNumber % oraclePrefix.length];
  
  // Transform technical language to more mystical terms
  let transformedText = originalText
    .replace(/analytics/gi, 'cosmic patterns')
    .replace(/data/gi, 'sacred knowledge')
    .replace(/algorithm/gi, 'divine formula')
    .replace(/performance/gi, 'mastery')
    .replace(/optimization/gi, 'alignment');

  return `${randomPrefix} ${transformedText}`;
};
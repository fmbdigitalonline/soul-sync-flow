import {
  mbtiAlignmentGuidance as enMbtiAlignmentGuidance,
  sunSignAlignmentGuidance as enSunSignAlignmentGuidance,
  moonSignAlignmentGuidance as enMoonSignAlignmentGuidance,
  risingSignAlignmentGuidance as enRisingSignAlignmentGuidance,
  lifePathAlignmentGuidance as enLifePathAlignmentGuidance,
  humanDesignTypeAlignmentGuidance as enHumanDesignTypeAlignmentGuidance,
  chineseZodiacAlignmentGuidance as enChineseZodiacAlignmentGuidance
} from '@/data/alignment-guidance';
import {
  mbtiAlignmentGuidance as nlMbtiAlignmentGuidance,
  sunSignAlignmentGuidance as nlSunSignAlignmentGuidance,
  moonSignAlignmentGuidance as nlMoonSignAlignmentGuidance,
  risingSignAlignmentGuidance as nlRisingSignAlignmentGuidance,
  lifePathAlignmentGuidance as nlLifePathAlignmentGuidance,
  humanDesignTypeAlignmentGuidance as nlHumanDesignTypeAlignmentGuidance,
  chineseZodiacAlignmentGuidance as nlChineseZodiacAlignmentGuidance
} from '@/data/alignment-guidance-nl';

type SupportedLanguage = 'en' | 'nl';

type AlignmentCategory =
  | 'mbti'
  | 'sun'
  | 'moon'
  | 'rising'
  | 'lifepath'
  | 'humandesign'
  | 'chinese';

type AlignmentLookup = Record<string, { think: string; act: string; react: string }>;

const alignmentGuidanceByLanguage: Record<SupportedLanguage, Record<AlignmentCategory, AlignmentLookup>> = {
  en: {
    mbti: enMbtiAlignmentGuidance,
    sun: enSunSignAlignmentGuidance,
    moon: enMoonSignAlignmentGuidance,
    rising: enRisingSignAlignmentGuidance,
    lifepath: enLifePathAlignmentGuidance,
    humandesign: enHumanDesignTypeAlignmentGuidance,
    chinese: enChineseZodiacAlignmentGuidance
  },
  nl: {
    mbti: nlMbtiAlignmentGuidance,
    sun: nlSunSignAlignmentGuidance,
    moon: nlMoonSignAlignmentGuidance,
    rising: nlRisingSignAlignmentGuidance,
    lifepath: nlLifePathAlignmentGuidance,
    humandesign: nlHumanDesignTypeAlignmentGuidance,
    chinese: nlChineseZodiacAlignmentGuidance
  }
};

const resolveLanguage = (language: SupportedLanguage | string): SupportedLanguage => {
  return language === 'nl' ? 'nl' : 'en';
};

const getGuidanceCategory = (category: string): AlignmentCategory | null => {
  const normalizedCategory = category.toLowerCase();

  if (normalizedCategory.includes('mbti')) {
    return 'mbti';
  }
  if (normalizedCategory.includes('sun')) {
    return 'sun';
  }
  if (normalizedCategory.includes('moon')) {
    return 'moon';
  }
  if (normalizedCategory.includes('rising') || normalizedCategory.includes('ascendant')) {
    return 'rising';
  }
  if (normalizedCategory.includes('lifepath') || normalizedCategory.includes('life path')) {
    return 'lifepath';
  }
  if (
    normalizedCategory.includes('humandesign') ||
    normalizedCategory.includes('human design') ||
    normalizedCategory.includes('energy')
  ) {
    return 'humandesign';
  }
  if (normalizedCategory.includes('chinese') || normalizedCategory.includes('zodiac')) {
    return 'chinese';
  }

  return null;
};

const findAlignmentGuidance = (
  category: string,
  lookupKey: string,
  language: SupportedLanguage | string
): { think?: string; act?: string; react?: string } => {
  const guidanceCategory = getGuidanceCategory(category);

  if (!guidanceCategory) {
    return {};
  }

  const preferredLanguage = resolveLanguage(language);
  const preferredGuidance = alignmentGuidanceByLanguage[preferredLanguage][guidanceCategory][lookupKey];

  if (preferredGuidance) {
    return preferredGuidance;
  }

  const fallbackGuidance = alignmentGuidanceByLanguage.en[guidanceCategory][lookupKey];
  return fallbackGuidance || {};
};

/**
 * Helper function to safely retrieve personality descriptions with fallback
 */

/**
 * Generic fallbacks, per language. A missing description must never put
 * English prose into a Dutch interface.
 */
const GENERIC_FALLBACK = {
  en: {
    light: "Your unique strengths shape how you move through the world",
    shadow: "Every strength has a growth edge to explore",
    insight: "You have unique gifts that contribute to your journey of self-discovery",
  },
  nl: {
    light: "Je unieke sterktes bepalen hoe je je door de wereld beweegt",
    shadow: "Elke sterkte heeft een groeirand om te verkennen",
    insight: "Je hebt unieke gaven die bijdragen aan je weg van zelfontdekking",
  },
} as const;

const genericFallback = (language: SupportedLanguage | string = 'en') =>
  GENERIC_FALLBACK[language === 'nl' ? 'nl' : 'en'];

export const getPersonalityDescription = (
  t: any,
  category: string,
  key: string | number,
  language: SupportedLanguage | string = 'en'
): {
  fullTitle: string;
  light: string;
  shadow: string;
  insight: string;
  think?: string;
  act?: string;
  react?: string;
} => {
  // Clean the key based on category type
  let cleanedKey = String(key);
  
  // For zodiac signs (Sun/Moon/Rising), extract just the sign name (remove degrees)
  if (category.toLowerCase().includes('sign')) {
    // "Aquarius 24.0°" → "Aquarius"
    cleanedKey = cleanedKey.split(' ')[0];
  }
  
  // For Chinese Zodiac, extract just the animal (remove element)
  if (category.toLowerCase().includes('chinese') || category.toLowerCase().includes('zodiac')) {
    // "Horse Earth" → "Horse"
    cleanedKey = cleanedKey.split(' ')[0];
  }
  
  // For Human Design profiles, remove slash: "4/4" → "44"
  if (category.toLowerCase().includes('profile')) {
    cleanedKey = cleanedKey.replace('/', '');
  }
  
  // For strategies with spaces, remove spaces: "Wait for the Invitation" → "waitfortheinvitation"
  if (category.toLowerCase().includes('strategy') || category.toLowerCase().includes('pacing')) {
    cleanedKey = cleanedKey.replace(/\s+/g, '').toLowerCase();
  }
  
  // Normalize: lowercase, remove spaces and special chars (except for already processed keys)
  const normalizedKey = cleanedKey.toLowerCase().replace(/[^\w]/g, '');
  const descKey = `blueprint.${category}.${normalizedKey}`;
  
  try {
    const desc = t(descKey);
    
    // Debug logging
    console.log(`🔍 Translation lookup:`, {
      category,
      originalKey: key,
      normalizedKey,
      descKey,
      descType: typeof desc,
      descValue: desc,
      isObject: typeof desc === 'object',
      hasLight: desc && typeof desc === 'object' && 'light' in desc,
      hasShadow: desc && typeof desc === 'object' && 'shadow' in desc,
      hasInsight: desc && typeof desc === 'object' && 'insight' in desc
    });
    
    // Check if translation exists and has required structure
    if (desc === descKey || typeof desc !== 'object' || !desc.light) {
      console.warn(`❌ Missing translation for: ${descKey} (original key: "${key}")`);
      return getFallbackDescription(category, key, language);
    }
    
    console.log(`✅ Translation found for: ${descKey}`);
    
    // Get alignment guidance based on category
    let alignmentGuidance = { think: desc.think, act: desc.act, react: desc.react };

    // Only apply alignment guidance if translation doesn't have it
    if (!desc.think || !desc.act || !desc.react) {
      const lookupKey = normalizedKey.toLowerCase();
      const fallbackGuidance = findAlignmentGuidance(category, lookupKey, language);

      alignmentGuidance = {
        think: desc.think || fallbackGuidance.think,
        act: desc.act || fallbackGuidance.act,
        react: desc.react || fallbackGuidance.react
      };
    }
    
    return {
      fullTitle: desc.fullTitle || `${category} ${key}`,
      light: desc.light || genericFallback(language).light,
      shadow: desc.shadow || genericFallback(language).shadow,
      insight: desc.insight || genericFallback(language).insight,
      think: alignmentGuidance.think || undefined,
      act: alignmentGuidance.act || undefined,
      react: alignmentGuidance.react || undefined
    };
  } catch (error) {
    console.error(`Error retrieving translation for ${descKey}:`, error);
    return getFallbackDescription(category, key, language);
  }
};

const getFallbackDescription = (category: string, key: string | number, language: SupportedLanguage | string = 'en') => {
  return {
    fullTitle: `${category} ${key}`,
    light: genericFallback(language).light,
    shadow: genericFallback(language).shadow,
    insight: genericFallback(language).insight,
    think: undefined,
    act: undefined,
    react: undefined
  };
};

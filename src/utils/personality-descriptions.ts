import { 
  mbtiAlignmentGuidance, 
  sunSignAlignmentGuidance,
  moonSignAlignmentGuidance,
  risingSignAlignmentGuidance,
  lifePathAlignmentGuidance,
  humanDesignTypeAlignmentGuidance,
  chineseZodiacAlignmentGuidance
} from '@/data/alignment-guidance';

/**
 * Helper function to safely retrieve personality descriptions with fallback
 */
export const getPersonalityDescription = (
  t: any,
  category: string,
  key: string | number
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
      return getFallbackDescription(category, key);
    }
    
    console.log(`✅ Translation found for: ${descKey}`);
    
    // Get alignment guidance based on category
    let alignmentGuidance = { think: desc.think, act: desc.act, react: desc.react };
    
    // Only apply alignment guidance if translation doesn't have it
    if (!desc.think || !desc.act || !desc.react) {
      const lookupKey = normalizedKey.toLowerCase();
      
      if (category.toLowerCase().includes('mbti')) {
        alignmentGuidance = mbtiAlignmentGuidance[lookupKey] || alignmentGuidance;
      } else if (category.toLowerCase().includes('sun')) {
        alignmentGuidance = sunSignAlignmentGuidance[lookupKey] || alignmentGuidance;
      } else if (category.toLowerCase().includes('moon')) {
        alignmentGuidance = moonSignAlignmentGuidance[lookupKey] || alignmentGuidance;
      } else if (category.toLowerCase().includes('rising') || category.toLowerCase().includes('ascendant')) {
        alignmentGuidance = risingSignAlignmentGuidance[lookupKey] || alignmentGuidance;
      } else if (category.toLowerCase().includes('lifepath') || category.toLowerCase().includes('life path')) {
        alignmentGuidance = lifePathAlignmentGuidance[lookupKey] || alignmentGuidance;
      } else if (category.toLowerCase().includes('humandesign') || category.toLowerCase().includes('human design') || category.toLowerCase().includes('energy')) {
        alignmentGuidance = humanDesignTypeAlignmentGuidance[lookupKey] || alignmentGuidance;
      } else if (category.toLowerCase().includes('chinese') || category.toLowerCase().includes('zodiac')) {
        alignmentGuidance = chineseZodiacAlignmentGuidance[lookupKey] || alignmentGuidance;
      }
    }
    
    return {
      fullTitle: desc.fullTitle || `${category} ${key}`,
      light: desc.light || "Your unique strengths shape how you move through the world",
      shadow: desc.shadow || "Every strength has a growth edge to explore",
      insight: desc.insight || "You have unique gifts that contribute to your journey of self-discovery",
      think: alignmentGuidance.think || undefined,
      act: alignmentGuidance.act || undefined,
      react: alignmentGuidance.react || undefined
    };
  } catch (error) {
    console.error(`Error retrieving translation for ${descKey}:`, error);
    return getFallbackDescription(category, key);
  }
};

const getFallbackDescription = (category: string, key: string | number) => {
  return {
    fullTitle: `${category} ${key}`,
    light: "Your unique strengths shape how you move through the world",
    shadow: "Every strength has a growth edge to explore",
    insight: "You have unique gifts that contribute to your journey of self-discovery",
    think: undefined,
    act: undefined,
    react: undefined
  };
};

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
  
  // Normalize: lowercase, remove spaces and special chars
  const normalizedKey = cleanedKey.toLowerCase().replace(/[^\w]/g, '');
  const descKey = `blueprint.${category}.${normalizedKey}`;
  
  try {
    const desc = t(descKey);
    
    // Check if translation exists and has required structure
    if (desc === descKey || typeof desc !== 'object' || !desc.light) {
      console.warn(`Missing translation for: ${descKey} (original key: "${key}")`);
      return getFallbackDescription(category, key);
    }
    
    return {
      fullTitle: desc.fullTitle || `${category} ${key}`,
      light: desc.light || "Your unique strengths shape how you move through the world",
      shadow: desc.shadow || "Every strength has a growth edge to explore",
      insight: desc.insight || "You have unique gifts that contribute to your journey of self-discovery"
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
    insight: "You have unique gifts that contribute to your journey of self-discovery"
  };
};

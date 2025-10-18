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
  const normalizedKey = String(key).toLowerCase().replace(/\s+/g, '');
  const descKey = `blueprint.${category}.${normalizedKey}`;
  
  try {
    const desc = t(descKey);
    
    // Check if translation exists and has required structure
    if (desc === descKey || typeof desc !== 'object' || !desc.light) {
      return getFallbackDescription(category, key);
    }
    
    return {
      fullTitle: desc.fullTitle || `${category} ${key}`,
      light: desc.light || "Your unique strengths shape how you move through the world",
      shadow: desc.shadow || "Every strength has a growth edge to explore",
      insight: desc.insight || "You have unique gifts that contribute to your journey of self-discovery"
    };
  } catch (error) {
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

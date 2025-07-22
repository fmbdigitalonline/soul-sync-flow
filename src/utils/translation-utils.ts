/**
 * Phase 2: Translation Utilities
 * 
 * SoulSync Principles Implemented:
 * ✅ #7: Build Transparently - Clear interpolation without fallbacks
 * ✅ #3: No Fallbacks That Mask Errors - Log missing interpolation values
 */

export const interpolateTranslation = (
  translatedText: string, 
  variables: Record<string, string>
): string => {
  let result = translatedText;
  
  // Replace all variables in the format {variableName}
  Object.entries(variables).forEach(([key, value]) => {
    const placeholder = `{${key}}`;
    if (result.includes(placeholder)) {
      result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
    } else {
      console.warn(`Translation interpolation: placeholder "${placeholder}" not found in text: "${translatedText}"`);
    }
  });
  
  // Check for remaining unreplaced placeholders
  const remainingPlaceholders = result.match(/\{[^}]+\}/g);
  if (remainingPlaceholders) {
    console.warn('Translation interpolation: Unreplaced placeholders found:', remainingPlaceholders, 'in text:', result);
  }
  
  return result;
};

export const safeInterpolateTranslation = (
  translatedText: string,
  variables: Record<string, string | undefined>
): string => {
  // Filter out undefined values to prevent errors
  const safeVariables = Object.fromEntries(
    Object.entries(variables).filter(([_, value]) => value !== undefined)
  ) as Record<string, string>;
  
  return interpolateTranslation(translatedText, safeVariables);
};
import { useResponsiveLayout } from './use-responsive-layout';

// Centralized text sizing helper that works with the unified typography system
export const useTextSize = () => {
  const { getTextSize } = useResponsiveLayout();

  // Standardized typography scale following the design system
  const getStandardTextSize = (variant: 'h1' | 'h2' | 'h3' | 'h4' | 'body' | 'small' | 'xs') => {
    const sizeMap = {
      'h1': getTextSize('text-xl'), // 24-28px
      'h2': getTextSize('text-lg'), // 20-22px  
      'h3': getTextSize('text-base'), // 16px base
      'h4': getTextSize('text-base'),
      'body': getTextSize('text-base'), // 16px base
      'small': getTextSize('text-sm'), // 14px
      'xs': getTextSize('text-xs') // 12px
    };
    
    return sizeMap[variant];
  };

  return {
    getStandardTextSize,
    getTextSize // Keep original for backward compatibility
  };
};
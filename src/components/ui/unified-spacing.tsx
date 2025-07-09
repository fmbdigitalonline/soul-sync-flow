import { useResponsiveLayout } from '@/hooks/use-responsive-layout';

// Unified spacing system following 8pt grid
export const useUnifiedSpacing = () => {
  const { spacing, layout, isMobile, isUltraNarrow, isFoldDevice } = useResponsiveLayout();

  // Standardized spacing scale: 8, 16, 24, 32px
  const getSpacing = (size: 'xs' | 'sm' | 'md' | 'lg' | 'xl') => {
    const spaceMap = {
      'xs': isFoldDevice ? 'gap-1' : 'gap-2', // 4-8px
      'sm': isFoldDevice ? 'gap-2' : 'gap-3', // 8-12px  
      'md': isFoldDevice ? 'gap-3' : 'gap-4', // 12-16px
      'lg': isFoldDevice ? 'gap-4' : 'gap-6', // 16-24px
      'xl': isFoldDevice ? 'gap-6' : 'gap-8'  // 24-32px
    };
    
    return spaceMap[size];
  };

  // Standardized padding scale
  const getPadding = (size: 'xs' | 'sm' | 'md' | 'lg' | 'xl') => {
    const paddingMap = {
      'xs': isFoldDevice ? 'p-1' : 'p-2', // 4-8px
      'sm': isFoldDevice ? 'p-2' : 'p-3', // 8-12px
      'md': isFoldDevice ? 'p-3' : 'p-4', // 12-16px (standard card padding)
      'lg': isFoldDevice ? 'p-4' : 'p-6', // 16-24px
      'xl': isFoldDevice ? 'p-6' : 'p-8'  // 24-32px
    };
    
    return paddingMap[size];
  };

  // Container classes for consistent layout
  const getContainer = () => {
    return `w-full max-w-4xl mx-auto ${spacing.container}`;
  };

  return {
    getSpacing,
    getPadding,
    getContainer,
    spacing, // Original spacing for backward compatibility
    layout,
    isMobile,
    isUltraNarrow,
    isFoldDevice
  };
};
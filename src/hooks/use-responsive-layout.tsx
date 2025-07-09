
import { useIsMobile } from './use-mobile';

interface ResponsiveSpacing {
  container: string;
  card: string;
  button: string;
  text: string;
  gap: string;
}

interface ResponsiveLayout {
  columns: string;
  width: string;
  maxWidth: string;
  padding: string;
}

export const useResponsiveLayout = () => {
  const { isMobile, isUltraNarrow, isFoldDevice } = useIsMobile();

  const getSpacing = (): ResponsiveSpacing => {
    if (isFoldDevice) {
      return {
        container: 'px-2 py-2',
        card: 'p-3',
        button: 'px-3 py-2',
        text: 'text-sm', // Increased from text-xs
        gap: 'gap-2'
      };
    }
    
    if (isUltraNarrow) {
      return {
        container: 'px-3 py-3',
        card: 'p-4',
        button: 'px-4 py-2',
        text: 'text-sm',
        gap: 'gap-3'
      };
    }
    
    if (isMobile) {
      return {
        container: 'px-4 py-4',
        card: 'p-4',
        button: 'px-4 py-3',
        text: 'text-sm',
        gap: 'gap-4'
      };
    }
    
    return {
      container: 'px-6 py-6',
      card: 'p-6',
      button: 'px-6 py-3',
      text: 'text-base',
      gap: 'gap-6'
    };
  };

  const getLayout = (): ResponsiveLayout => {
    if (isFoldDevice) {
      return {
        columns: 'grid-cols-1',
        width: 'w-full',
        maxWidth: 'max-w-full',
        padding: 'px-2'
      };
    }
    
    if (isUltraNarrow) {
      return {
        columns: 'grid-cols-1',
        width: 'w-full',
        maxWidth: 'max-w-sm',
        padding: 'px-3'
      };
    }
    
    if (isMobile) {
      return {
        columns: 'grid-cols-1',
        width: 'w-full',
        maxWidth: 'max-w-sm',
        padding: 'px-4'
      };
    }
    
    return {
      columns: 'grid-cols-2',
      width: 'w-full',
      maxWidth: 'max-w-4xl',
      padding: 'px-6'
    };
  };

  const getTouchTargetSize = () => {
    return isFoldDevice ? 'min-h-[44px] min-w-[44px]' : 'min-h-[44px] min-w-[44px]'; // Increased from 40px to 44px for fold
  };

  const getTextSize = (base: string) => {
    const sizeMap: Record<string, string> = {
      'text-xs': isFoldDevice ? 'text-sm' : 'text-xs', // Increased from text-[10px] to text-sm
      'text-sm': isFoldDevice ? 'text-sm' : 'text-sm', // Kept as text-sm instead of text-xs
      'text-base': isFoldDevice ? 'text-base' : isUltraNarrow ? 'text-sm' : 'text-base', // Increased from text-sm to text-base
      'text-lg': isFoldDevice ? 'text-lg' : isUltraNarrow ? 'text-base' : 'text-lg', // Increased from text-base to text-lg
      'text-xl': isFoldDevice ? 'text-xl' : isUltraNarrow ? 'text-lg' : 'text-xl', // Increased from text-lg to text-xl
      'text-2xl': isFoldDevice ? 'text-xl' : isUltraNarrow ? 'text-xl' : 'text-2xl' // Only this one stays smaller for fold
    };
    
    return sizeMap[base] || base;
  };

  return {
    spacing: getSpacing(),
    layout: getLayout(),
    touchTargetSize: getTouchTargetSize(),
    getTextSize,
    isMobile,
    isUltraNarrow,
    isFoldDevice
  };
};

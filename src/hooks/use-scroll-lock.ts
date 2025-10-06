import { useEffect } from 'react';

/**
 * Hook to prevent body scrolling when modals are open
 * Part of Fix #6: Touch-Scroll Lock System
 * 
 * SoulSync Principles:
 * ✅ #7: Build Transparently - Clear when scroll is locked
 * ✅ #1: Additive utility hook
 */
export const useScrollLock = (isLocked: boolean) => {
  useEffect(() => {
    if (isLocked) {
      // Only lock body scroll, not dialog internal scroll
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isLocked]);
};


import { useRef, useCallback } from 'react';

interface UseDoubleTapOptions {
  onDoubleTap: () => void;
  onSingleTap?: () => void;
  delay?: number;
}

export const useDoubleTap = ({ onDoubleTap, onSingleTap, delay = 300 }: UseDoubleTapOptions) => {
  const tapCountRef = useRef(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleTap = useCallback(() => {
    tapCountRef.current += 1;

    if (tapCountRef.current === 1) {
      // Start timer for single tap
      timerRef.current = setTimeout(() => {
        if (tapCountRef.current === 1) {
          onSingleTap?.();
        }
        tapCountRef.current = 0;
      }, delay);
    } else if (tapCountRef.current === 2) {
      // Double tap detected
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      tapCountRef.current = 0;
      onDoubleTap();
    }
  }, [onDoubleTap, onSingleTap, delay]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault(); // Prevent default touch behaviors
    handleTap();
  }, [handleTap]);

  const handleClick = useCallback((e: React.MouseEvent) => {
    // Only handle click if it's not a touch device
    if (!('ontouchstart' in window)) {
      e.preventDefault();
      handleTap();
    }
  }, [handleTap]);

  return {
    onTouchStart: handleTouchStart,
    onClick: handleClick,
  };
};

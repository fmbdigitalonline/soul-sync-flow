
import { useState, useEffect } from 'react';

interface UseFloatingHACSOptions {
  autoShow?: boolean;
  showDelay?: number;
  enabled?: boolean;
}

export const useFloatingHACS = (options: UseFloatingHACSOptions = {}) => {
  const {
    autoShow = true,
    showDelay = 2000,
    enabled = true
  } = options;

  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    if (!enabled || isDismissed || !autoShow) return;

    const timer = setTimeout(() => {
      setIsVisible(true);
    }, showDelay);

    return () => clearTimeout(timer);
  }, [enabled, isDismissed, autoShow, showDelay]);

  const show = () => {
    if (enabled && !isDismissed) {
      setIsVisible(true);
    }
  };

  const hide = () => {
    setIsVisible(false);
  };

  const dismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
  };

  return {
    isVisible,
    show,
    hide,
    dismiss,
    isDismissed
  };
};

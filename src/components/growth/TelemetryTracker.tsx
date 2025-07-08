import React, { useEffect } from 'react';
import { agentGrowthIntegration } from '@/services/agent-growth-integration';

interface TelemetryTrackerProps {
  children: React.ReactNode;
}

export const TelemetryTracker: React.FC<TelemetryTrackerProps> = ({ children }) => {
  useEffect(() => {
    // Track component interactions
    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (target.closest('[data-track]')) {
        const trackingData = target.closest('[data-track]')?.getAttribute('data-track');
        if (trackingData) {
          agentGrowthIntegration.trackUserInteraction('click', {
            element: trackingData,
            timestamp: Date.now()
          });
        }
      }
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  return <>{children}</>;
};
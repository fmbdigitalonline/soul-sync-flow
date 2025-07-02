
import React from 'react';
import { useResponsiveLayout } from '@/hooks/use-responsive-layout';

interface CelebrationHeaderProps {
  speaking: boolean;
  celebrationComplete: boolean;
  goalTitle: string;
}

export const CelebrationHeader: React.FC<CelebrationHeaderProps> = ({
  speaking,
  celebrationComplete,
  goalTitle
}) => {
  const { spacing, getTextSize, isFoldDevice, isMobile } = useResponsiveLayout();

  return (
    <div className={`text-center ${spacing.gap} w-full`}>
      <div className="w-full">
        <h1 className={`font-bold mb-3 bg-gradient-to-r from-soul-purple to-soul-teal bg-clip-text text-transparent leading-tight ${getTextSize('text-2xl')} ${isFoldDevice ? 'px-2' : ''}`}>
          🎯 Your Dream Journey is Ready!
        </h1>
        <p className={`text-gray-600 max-w-2xl mx-auto leading-relaxed ${getTextSize('text-base')} ${isMobile ? 'px-3' : ''}`}>
          I've transformed "{goalTitle}" into a personalized, step-by-step roadmap that honors your unique soul blueprint
        </p>
      </div>
    </div>
  );
};

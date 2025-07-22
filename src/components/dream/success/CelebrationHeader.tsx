
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
  const { getTextSize, isFoldDevice } = useResponsiveLayout();

  return (
    <div className="text-center space-y-4 w-full max-w-full overflow-hidden px-2">
      <div className="w-full">
        <h1 className={`font-bold mb-3 bg-gradient-to-r from-soul-purple to-soul-teal bg-clip-text text-transparent leading-tight ${getTextSize('text-xl')} ${isFoldDevice ? 'text-lg' : ''}`}>
          🎯 Your Dream Journey is Ready!
        </h1>
        <p className={`text-gray-600 max-w-2xl mx-auto leading-relaxed break-words ${getTextSize('text-base')} ${isFoldDevice ? getTextSize('text-sm') : ''}`}>
          I've transformed "{goalTitle}" into a personalized, step-by-step roadmap that honors your unique soul blueprint
        </p>
      </div>
    </div>
  );
};


import React from 'react';
import { SoulOrb } from '@/components/ui/soul-orb';
import { CheckCircle } from 'lucide-react';
import { DynamicLoadingStages } from './DynamicLoadingStages';
import { useEnhancedLoadingLogic } from './useEnhancedLoadingLogic';

interface DecompositionStage {
  id: string;
  title: string;
  message: string;
  icon: React.ReactNode;
  duration: number;
  action?: () => Promise<void>;
}

interface DecompositionStageDisplayProps {
  speaking: boolean;
  currentStage: DecompositionStage;
  currentStageIndex: number;
  totalStages: number;
  completedStages: string[];
  dreamTitle: string;
}

export const DecompositionStageDisplay: React.FC<DecompositionStageDisplayProps> = ({
  speaking,
  currentStage,
  currentStageIndex,
  totalStages,
  completedStages,
  dreamTitle
}) => {
  const { hasBeenLoadingLong } = useEnhancedLoadingLogic({
    currentStageIndex,
    totalStages
  });

  return (
    <>
      {/* Enhanced Soul Orb with Loading State */}
      <div className="flex justify-center mb-6">
        <div className="relative">
          <SoulOrb 
            speaking={speaking}
            stage="generating"
            size="lg"
            pulse={true}
          />
          {/* Surrounding energy rings for active processing */}
          <div className="absolute inset-0 rounded-full border-2 border-soul-purple/20 animate-ping" 
               style={{ animationDuration: '2s' }} />
          <div className="absolute inset-0 rounded-full border border-soul-teal/20 animate-ping" 
               style={{ animationDuration: '3s', animationDelay: '1s' }} />
        </div>
      </div>

      {/* Current Stage Header */}
      <div className="space-y-3 mb-8">
        <div className="flex items-center justify-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-soul-purple to-soul-teal rounded-full flex items-center justify-center text-white animate-pulse">
            {currentStage.icon}
          </div>
          <h2 className="text-xl font-bold text-gray-800 animate-fade-in">
            {currentStage.title}
          </h2>
        </div>
        
        {/* Stage message with typewriter effect */}
        <p className="text-gray-600 leading-relaxed px-4 text-center animate-fade-in">
          {currentStage.message}
        </p>
      </div>

      {/* Dynamic Loading Content */}
      <DynamicLoadingStages
        currentStageIndex={currentStageIndex}
        hasBeenLoadingLong={hasBeenLoadingLong}
        dreamTitle={dreamTitle}
      />
    </>
  );
};

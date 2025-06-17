
import React from 'react';
import { SoulOrb } from '@/components/ui/soul-orb';
import { CheckCircle, Brain, AlertTriangle, SkipForward } from 'lucide-react';
import { DynamicLoadingStages } from './DynamicLoadingStages';
import { useEnhancedLoadingLogic } from './useEnhancedLoadingLogic';
import { Button } from '@/components/ui/button';

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
  showSkipOption?: boolean;
  onSkip?: () => void;
}

export const DecompositionStageDisplay: React.FC<DecompositionStageDisplayProps> = ({
  speaking,
  currentStage,
  currentStageIndex,
  totalStages,
  completedStages,
  dreamTitle,
  showSkipOption = false,
  onSkip
}) => {
  const { hasBeenLoadingLong } = useEnhancedLoadingLogic({
    currentStageIndex,
    totalStages
  });

  // Fallback state when currentStage is undefined
  if (!currentStage) {
    return (
      <div className="flex justify-center mb-6">
        <div className="relative">
          <SoulOrb 
            speaking={false}
            stage="generating"
            size="lg"
            pulse={true}
          />
          <div className="absolute inset-0 rounded-full border-2 border-soul-purple/20 animate-ping" 
               style={{ animationDuration: '2s' }} />
        </div>
        <div className="space-y-3 mb-8 mt-4">
          <div className="flex items-center justify-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-soul-purple to-soul-teal rounded-full flex items-center justify-center text-white animate-pulse">
              <Brain className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 animate-fade-in">
              Initializing...
            </h2>
          </div>
          <p className="text-gray-600 leading-relaxed px-4 text-center animate-fade-in">
            Preparing your dream analysis...
          </p>
        </div>
      </div>
    );
  }

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

      {/* Skip Option - Show after timeout */}
      {showSkipOption && onSkip && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl animate-fade-in">
          <div className="flex items-center gap-3 mb-3">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            <div className="flex-1">
              <h3 className="font-medium text-amber-800 text-sm">Taking longer than expected?</h3>
              <p className="text-amber-700 text-xs mt-1">
                You can skip the AI processing and start with a basic plan that you can customize later.
              </p>
            </div>
          </div>
          <Button
            onClick={onSkip}
            size="sm"
            variant="outline"
            className="w-full border-amber-300 text-amber-700 hover:bg-amber-100"
          >
            <SkipForward className="h-4 w-4 mr-2" />
            Skip to Basic Plan
          </Button>
        </div>
      )}

      {/* Dynamic Loading Content */}
      <DynamicLoadingStages
        currentStageIndex={currentStageIndex}
        hasBeenLoadingLong={hasBeenLoadingLong}
        dreamTitle={dreamTitle}
      />
    </>
  );
};

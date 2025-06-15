
import React from 'react';
import { EnhancedProgressAnimation } from './EnhancedProgressAnimation';
import { useEnhancedLoadingLogic } from './useEnhancedLoadingLogic';

interface DecompositionStage {
  id: string;
  title: string;
  message: string;
  icon: React.ReactNode;
  duration: number;
  action?: () => Promise<void>;
}

interface DecompositionProgressProps {
  progress: number;
  currentStageIndex: number;
  totalStages: number;
  stages: DecompositionStage[];
  completedStages: string[];
}

export const DecompositionProgress: React.FC<DecompositionProgressProps> = ({
  progress,
  currentStageIndex,
  totalStages,
  stages,
  completedStages
}) => {
  const { hasBeenLoadingLong, dynamicProgress } = useEnhancedLoadingLogic({
    currentStageIndex,
    totalStages
  });

  const stagesWithCompletion = stages.map(stage => ({
    ...stage,
    completed: completedStages.includes(stage.id)
  }));

  return (
    <EnhancedProgressAnimation
      progress={dynamicProgress}
      currentStageIndex={currentStageIndex}
      totalStages={totalStages}
      hasBeenLoadingLong={hasBeenLoadingLong}
      stages={stagesWithCompletion}
    />
  );
};

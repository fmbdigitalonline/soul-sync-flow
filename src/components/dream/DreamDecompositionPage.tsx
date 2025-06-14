
import React from 'react';
import { DecompositionStageDisplay } from './decomposition/DecompositionStageDisplay';
import { DecompositionProgress } from './decomposition/DecompositionProgress';
import { BlueprintInsight } from './decomposition/BlueprintInsight';
import { ErrorDisplay } from './decomposition/ErrorDisplay';
import { useDecompositionLogic } from './decomposition/useDecompositionLogic';

interface DreamDecompositionPageProps {
  dreamTitle: string;
  dreamDescription?: string;
  dreamCategory?: string;
  dreamTimeframe?: string;
  onComplete: (decomposedGoal: any) => void;
  blueprintData?: any;
}

export const DreamDecompositionPage: React.FC<DreamDecompositionPageProps> = ({
  dreamTitle,
  dreamDescription = '',
  dreamCategory = 'personal_growth',
  dreamTimeframe = '3 months',
  onComplete,
  blueprintData
}) => {
  const {
    speaking,
    currentStage,
    currentStageIndex,
    progress,
    completedStages,
    error,
    stages,
    getUserType
  } = useDecompositionLogic({
    dreamTitle,
    dreamDescription,
    dreamTimeframe,
    dreamCategory,
    blueprintData,
    onComplete
  });

  // Show error state if something went wrong
  if (error) {
    return <ErrorDisplay error={error} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-soul-purple/10 via-white to-soul-teal/5 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-8">
        
        <DecompositionStageDisplay
          speaking={speaking}
          currentStage={currentStage}
          currentStageIndex={currentStageIndex}
          totalStages={stages.length}
          completedStages={completedStages}
        />

        <DecompositionProgress
          progress={progress}
          currentStageIndex={currentStageIndex}
          totalStages={stages.length}
          stages={stages}
          completedStages={completedStages}
        />

        <BlueprintInsight
          blueprintData={blueprintData}
          getUserType={getUserType}
        />
      </div>
    </div>
  );
};

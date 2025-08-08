
import React from 'react';
import { DecompositionStageDisplay } from './decomposition/DecompositionStageDisplay';
import { DecompositionProgress } from './decomposition/DecompositionProgress';
import { BlueprintInsight } from './decomposition/BlueprintInsight';
import { ErrorDisplay } from './decomposition/ErrorDisplay';
import { useDecompositionLogic } from './decomposition/useDecompositionLogic';
import { motion } from '@/lib/framer-motion';

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
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-background flex items-center justify-center p-4"
    >
      <div className="max-w-md w-full text-center space-y-8">
        
        <DecompositionStageDisplay
          speaking={speaking}
          currentStage={currentStage}
          currentStageIndex={currentStageIndex}
          totalStages={stages.length}
          completedStages={completedStages}
          dreamTitle={dreamTitle}
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
    </motion.div>
  );
};

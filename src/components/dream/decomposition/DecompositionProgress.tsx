
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { CheckCircle } from 'lucide-react';

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
  return (
    <>
      {/* Progress Bar */}
      <div className="space-y-3">
        <Progress value={progress} className="w-full h-2" />
        <p className="text-sm text-gray-500">
          Step {currentStageIndex + 1} of {totalStages}
        </p>
      </div>

      {/* Stage Progress Indicators */}
      <div className="flex justify-center gap-3">
        {stages.map((stage, index) => (
          <div
            key={stage.id}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
              completedStages.includes(stage.id)
                ? 'bg-green-500 text-white'
                : index === currentStageIndex
                ? 'bg-soul-purple text-white animate-pulse'
                : 'bg-gray-200 text-gray-400'
            }`}
          >
            {completedStages.includes(stage.id) ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <span className="text-xs font-medium">{index + 1}</span>
            )}
          </div>
        ))}
      </div>
    </>
  );
};

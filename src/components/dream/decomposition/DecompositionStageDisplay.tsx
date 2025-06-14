
import React from 'react';
import { SoulOrb } from '@/components/ui/soul-orb';
import { CheckCircle } from 'lucide-react';

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
}

export const DecompositionStageDisplay: React.FC<DecompositionStageDisplayProps> = ({
  speaking,
  currentStage,
  currentStageIndex,
  totalStages,
  completedStages
}) => {
  return (
    <>
      {/* Soul Orb */}
      <div className="flex justify-center">
        <SoulOrb 
          speaking={speaking}
          stage="generating"
          size="lg"
          pulse={true}
        />
      </div>

      {/* Current Stage Info */}
      <div className="space-y-4">
        <div className="flex items-center justify-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-soul-purple to-soul-teal rounded-full flex items-center justify-center text-white">
            {currentStage.icon}
          </div>
          <h2 className="text-xl font-bold text-gray-800">
            {currentStage.title}
          </h2>
        </div>
        
        <p className="text-gray-600 leading-relaxed px-4">
          {currentStage.message}
        </p>
      </div>
    </>
  );
};

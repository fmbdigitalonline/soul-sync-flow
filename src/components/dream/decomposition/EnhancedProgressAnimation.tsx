
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Clock, Sparkles } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface EnhancedProgressAnimationProps {
  progress: number;
  currentStageIndex: number;
  totalStages: number;
  hasBeenLoadingLong: boolean;
  stages: Array<{
    id: string;
    title: string;
    completed?: boolean;
  }>;
}

export const EnhancedProgressAnimation: React.FC<EnhancedProgressAnimationProps> = ({
  progress,
  currentStageIndex,
  totalStages,
  hasBeenLoadingLong,
  stages
}) => {
  const { t } = useLanguage();
  
  return (
    <div className="space-y-4">
      {/* Animated Progress Bar */}
      <div className="space-y-3">
        <div className="relative">
          <Progress 
            value={progress} 
            className="w-full h-3 bg-gray-100 overflow-hidden rounded-full" 
          />
          {/* Animated shine effect */}
          <div 
            className="absolute top-0 left-0 h-full w-6 bg-gradient-to-r from-transparent via-white/30 to-transparent rounded-full animate-pulse"
            style={{
              left: `${Math.max(0, progress - 10)}%`,
              transition: 'left 0.5s ease-out'
            }}
          />
        </div>
        
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-600">
            {t('decomposition.progress.creating').replace('{progress}', Math.round(progress).toString())}
          </p>
          {hasBeenLoadingLong && (
            <div className="flex items-center gap-1 text-xs text-soul-purple">
              <Clock className="h-3 w-3 animate-pulse" />
              <span>{t('decomposition.loading.deepAnalysis')}</span>
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Stage Indicators */}
      <div className="flex justify-center gap-3">
        {stages.map((stage, index) => (
          <div
            key={stage.id}
            className={`relative w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${
              index < currentStageIndex
                ? 'bg-green-500 text-white scale-110'
                : index === currentStageIndex
                ? 'bg-gradient-to-br from-soul-purple to-soul-teal text-white scale-110 animate-pulse'
                : 'bg-gray-200 text-gray-400 scale-90'
            }`}
          >
            {index < currentStageIndex ? (
              <CheckCircle className="h-5 w-5" />
            ) : index === currentStageIndex ? (
              <Sparkles className="h-4 w-4 animate-spin" />
            ) : (
              <span className="text-xs font-medium">{index + 1}</span>
            )}
            
            {/* Ripple effect for active stage */}
            {index === currentStageIndex && (
              <div className="absolute inset-0 rounded-full bg-soul-purple/20 animate-ping" />
            )}
          </div>
        ))}
      </div>

      {/* Stage Labels */}
      <div className="grid grid-cols-4 gap-1 text-center">
        {stages.map((stage, index) => (
          <div key={stage.id} className="space-y-1">
            <p className={`text-xs font-medium transition-colors duration-300 ${
              index <= currentStageIndex ? 'text-soul-purple' : 'text-gray-400'
            }`}>
              {stage.title.split(' ')[0]}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};


import React, { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Clock, ArrowRight } from 'lucide-react';
import { useResponsiveLayout } from '@/hooks/use-responsive-layout';
import { useLanguage } from '@/contexts/LanguageContext';
import { extractDreamEssence } from '@/utils/text-essence';

interface RecommendedTaskProps {
  task: any;
  isHighlighted: boolean;
  onStartTask: (task: any) => void;
}

export const RecommendedTask: React.FC<RecommendedTaskProps> = ({
  task,
  isHighlighted,
  onStartTask
}) => {
  const { spacing, getTextSize, touchTargetSize, isFoldDevice, isMobile } = useResponsiveLayout();
  const { t } = useLanguage();

  if (!task) return null;

  const formatDuration = (duration: string) => {
    return duration || '30 min';
  };

  const getEnergyColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const taskDescription = useMemo(
    () => extractDreamEssence(task.description || '', 200),
    [task.description]
  );

  const blueprintReasoning = useMemo(
    () => extractDreamEssence(task.blueprint_reasoning || '', 220),
    [task.blueprint_reasoning]
  );

  return (
    <div className={`bg-gradient-to-br from-soul-purple/10 to-soul-teal/5 rounded-2xl border border-soul-purple/20 transition-all duration-500 w-full overflow-hidden ${spacing.card} ${
      isHighlighted ? 'ring-2 ring-soul-purple shadow-soul-purple/20 transform scale-[1.01]' : ''
    }`}>
      <div className="flex flex-col gap-4 w-full">
        <div className={`flex items-center gap-3 ${isMobile ? 'flex-col text-center' : 'flex-row'}`}>
          <div className={`bg-gradient-to-br from-soul-purple to-soul-teal rounded-2xl flex items-center justify-center flex-shrink-0 ${isFoldDevice ? 'w-10 h-10' : 'w-12 h-12'}`}>
            <Play className={`text-white ${isFoldDevice ? 'h-4 w-4' : 'h-6 w-6'}`} />
          </div>
          
          <div className="flex-1 w-full min-w-0 overflow-hidden">
            <div className="flex flex-col gap-2 mb-3">
              <h3 className={`font-bold text-gray-800 leading-tight ${getTextSize('text-lg')}`}>
                {t('recommendedTask.perfectFirst')}
              </h3>
              <Badge className={`bg-gradient-to-r from-soul-purple to-soul-teal text-white self-start ${getTextSize('text-xs')}`}>
                {t('recommendedTask.blueprintOptimized')}
              </Badge>
            </div>
            
            <h4 className={`font-semibold text-gray-800 mb-2 leading-tight ${getTextSize('text-base')}`}>
              {task.title}
            </h4>
            <p
              className={`text-gray-600 mb-4 leading-relaxed line-clamp-3 ${getTextSize('text-sm')}`}
              title={taskDescription !== task.description ? task.description : undefined}
            >
              {taskDescription}
            </p>
            
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <Badge variant="outline" className={`flex items-center gap-1 border-gray-300 ${getTextSize('text-xs')}`}>
                <Clock className={isFoldDevice ? 'h-2 w-2' : 'h-3 w-3'} />
                {formatDuration(task.estimated_duration)}
              </Badge>
              <Badge className={`border ${getEnergyColor(task.energy_level_required)} ${getTextSize('text-xs')}`}>
                {task.energy_level_required} {t('recommendedTask.energy')}
              </Badge>
            </div>
            
            {task.blueprint_reasoning && (
              <div className={`bg-soul-purple/10 rounded-xl mb-4 overflow-hidden ${spacing.card}`}>
                <p className={`text-soul-purple font-medium mb-1 leading-tight ${getTextSize('text-xs')}`}>
                  {t('recommendedTask.whyPerfect')}
                </p>
                <p
                  className={`text-gray-700 leading-relaxed line-clamp-4 ${getTextSize('text-xs')}`}
                  title={blueprintReasoning !== task.blueprint_reasoning ? task.blueprint_reasoning : undefined}
                >
                  {blueprintReasoning}
                </p>
              </div>
            )}
            
            <Button 
              onClick={() => onStartTask(task)}
              className={`bg-gradient-to-r from-soul-purple to-soul-teal hover:shadow-lg text-white rounded-xl font-semibold transition-all duration-300 active:scale-95 w-full ${spacing.button} ${touchTargetSize}`}
            >
              <span className={getTextSize('text-sm')}>{t('recommendedTask.startTask')}</span>
              <ArrowRight className={`ml-2 ${isFoldDevice ? 'h-3 w-3' : 'h-4 w-4'}`} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

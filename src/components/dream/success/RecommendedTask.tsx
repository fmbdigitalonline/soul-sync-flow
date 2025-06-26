
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Clock, ArrowRight } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

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
  const isMobile = useIsMobile();

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

  return (
    <div className={`bg-gradient-to-br from-soul-purple/10 to-soul-teal/5 rounded-2xl p-4 sm:p-6 border border-soul-purple/20 transition-all duration-500 w-full max-w-full ${
      isHighlighted ? 'ring-2 ring-soul-purple shadow-soul-purple/20 transform scale-[1.02]' : ''
    }`}>
      <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-soul-purple to-soul-teal rounded-2xl flex items-center justify-center flex-shrink-0 mx-auto sm:mx-0">
          <Play className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
        </div>
        
        <div className="flex-1 w-full min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3">
            <h3 className="text-lg sm:text-xl font-bold text-gray-800 leading-tight">
              🎯 Perfect First Task for You
            </h3>
            <Badge className="bg-gradient-to-r from-soul-purple to-soul-teal text-white text-xs sm:text-sm self-start sm:self-auto">
              Blueprint Optimized
            </Badge>
          </div>
          
          <h4 className="font-semibold text-gray-800 mb-2 text-base sm:text-lg leading-tight">
            {task.title}
          </h4>
          <p className="text-gray-600 mb-4 leading-relaxed text-sm sm:text-base line-clamp-3 sm:line-clamp-none">
            {task.description}
          </p>
          
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-4">
            <Badge variant="outline" className="flex items-center gap-1 text-xs border-gray-300">
              <Clock className="h-3 w-3" />
              {formatDuration(task.estimated_duration)}
            </Badge>
            <Badge className={`border text-xs ${getEnergyColor(task.energy_level_required)}`}>
              {task.energy_level_required} energy
            </Badge>
          </div>
          
          {task.blueprint_reasoning && (
            <div className="bg-soul-purple/10 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6">
              <p className="text-xs sm:text-sm text-soul-purple font-medium mb-1 leading-tight">
                💡 Why this task is perfect for you:
              </p>
              <p className="text-xs sm:text-sm text-gray-700 leading-relaxed line-clamp-4 sm:line-clamp-none">
                {task.blueprint_reasoning}
              </p>
            </div>
          )}
          
          <Button 
            onClick={() => onStartTask(task)}
            className="bg-gradient-to-r from-soul-purple to-soul-teal hover:shadow-lg text-white px-6 sm:px-8 py-3 rounded-xl font-semibold transition-all duration-300 active:scale-95 w-full sm:w-auto min-h-[48px]"
          >
            <span className="text-sm sm:text-base">Start This Task</span>
            <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
};

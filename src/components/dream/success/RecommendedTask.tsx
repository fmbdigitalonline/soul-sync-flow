
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Clock, ArrowRight } from 'lucide-react';

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
    <div className={`bg-gradient-to-br from-soul-purple/10 to-soul-teal/5 rounded-2xl p-6 border border-soul-purple/20 transition-all duration-500 ${
      isHighlighted ? 'ring-2 ring-soul-purple shadow-soul-purple/20 transform scale-[1.02]' : ''
    }`}>
      <div className="flex items-start gap-6">
        <div className="w-16 h-16 bg-gradient-to-br from-soul-purple to-soul-teal rounded-2xl flex items-center justify-center flex-shrink-0">
          <Play className="h-8 w-8 text-white" />
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <h3 className="text-xl font-bold text-gray-800">
              🎯 Perfect First Task for You
            </h3>
            <Badge className="bg-gradient-to-r from-soul-purple to-soul-teal text-white">
              Blueprint Optimized
            </Badge>
          </div>
          
          <h4 className="font-semibold text-gray-800 mb-2 text-lg">
            {task.title}
          </h4>
          <p className="text-gray-600 mb-4 leading-relaxed">
            {task.description}
          </p>
          
          <div className="flex items-center gap-3 mb-4">
            <Badge variant="outline" className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatDuration(task.estimated_duration)}
            </Badge>
            <Badge className={`border ${getEnergyColor(task.energy_level_required)}`}>
              {task.energy_level_required} energy
            </Badge>
          </div>
          
          {task.blueprint_reasoning && (
            <div className="bg-soul-purple/10 rounded-xl p-4 mb-6">
              <p className="text-sm text-soul-purple font-medium mb-1">
                💡 Why this task is perfect for you:
              </p>
              <p className="text-sm text-gray-700 leading-relaxed">
                {task.blueprint_reasoning}
              </p>
            </div>
          )}
          
          <Button 
            onClick={() => onStartTask(task)}
            className="bg-gradient-to-r from-soul-purple to-soul-teal hover:shadow-lg text-white text-lg px-8 py-3 rounded-xl font-semibold"
          >
            Start This Task
            <ArrowRight className="h-5 w-5 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
};

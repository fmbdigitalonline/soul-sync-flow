
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle2, 
  Circle, 
  Play, 
  Clock, 
  Zap,
  ArrowRight 
} from 'lucide-react';
import { ParsedSubTask } from '@/services/coach-message-parser';

interface SubTaskCardProps {
  subTask: ParsedSubTask;
  onStart: (subTask: ParsedSubTask) => void;
  onToggleComplete: (subTask: ParsedSubTask) => void;
  compact?: boolean;
}

export const SubTaskCard: React.FC<SubTaskCardProps> = ({
  subTask,
  onStart,
  onToggleComplete,
  compact = false
}) => {
  const getEnergyColor = (energy?: string) => {
    switch (energy) {
      case 'low': return 'bg-green-100 text-green-700 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'high': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <Card className={`transition-all duration-200 hover:shadow-md ${
      subTask.completed 
        ? 'bg-emerald-50 border-emerald-200' 
        : 'bg-white border-gray-200 hover:border-soul-purple/30'
    } ${compact ? 'p-3' : 'p-4'}`}>
      <div className="flex items-start gap-3">
        <button
          onClick={() => onToggleComplete(subTask)}
          className="mt-1 flex-shrink-0 transition-colors"
        >
          {subTask.completed ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          ) : (
            <Circle className="h-5 w-5 text-gray-400 hover:text-soul-purple" />
          )}
        </button>
        
        <div className="flex-1 min-w-0">
          <h4 className={`font-medium text-sm leading-tight ${
            subTask.completed 
              ? 'line-through text-gray-500' 
              : 'text-gray-800'
          }`}>
            {subTask.title}
          </h4>
          
          {subTask.description && !compact && (
            <p className="text-xs text-gray-600 mt-1 leading-relaxed">
              {subTask.description}
            </p>
          )}
          
          <div className="flex items-center gap-2 mt-2">
            {subTask.estimatedTime && (
              <Badge variant="outline" className="text-xs">
                <Clock className="h-3 w-3 mr-1" />
                {subTask.estimatedTime}
              </Badge>
            )}
            
            {subTask.energyLevel && (
              <Badge variant="outline" className={`text-xs ${getEnergyColor(subTask.energyLevel)}`}>
                <Zap className="h-3 w-3 mr-1" />
                {subTask.energyLevel}
              </Badge>
            )}
          </div>
        </div>
        
        {!subTask.completed && (
          <Button
            onClick={() => onStart(subTask)}
            size="sm"
            className="bg-soul-purple hover:bg-soul-purple/90 text-white px-3 py-1 h-8"
          >
            <Play className="h-3 w-3 mr-1" />
            Start
          </Button>
        )}
      </div>
    </Card>
  );
};

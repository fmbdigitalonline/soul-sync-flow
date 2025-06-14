
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, Clock, Zap, Info } from "lucide-react";
import { useDoubleTap } from "@/hooks/use-double-tap";

interface TaskCardProps {
  task: any;
  onDoubleTap: (task: any) => void;
  onSingleTap?: (task: any) => void;
  showGoal?: boolean;
}

export const TaskCard: React.FC<TaskCardProps> = ({ 
  task, 
  onDoubleTap, 
  onSingleTap, 
  showGoal = false 
}) => {
  const doubleTapHandlers = useDoubleTap({
    onDoubleTap: () => onDoubleTap(task),
    onSingleTap: () => onSingleTap?.(task),
    delay: 300
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'border-green-200 bg-green-50';
      case 'in_progress': return 'border-blue-200 bg-blue-50';
      case 'stuck': return 'border-amber-200 bg-amber-50';
      default: return 'border-gray-200 bg-white';
    }
  };

  const getEnergyColor = (energy: string) => {
    switch (energy?.toLowerCase()) {
      case 'low': return 'bg-green-100 text-green-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'high': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <Card 
      className={`cursor-pointer transition-all duration-200 hover:shadow-md transform active:scale-[0.98] ${getStatusColor(task.status)}`}
      {...doubleTapHandlers}
    >
      <CardContent className="p-3">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {task.completed || task.status === 'completed' ? (
              <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
            ) : (
              <Circle className="h-4 w-4 text-gray-400 flex-shrink-0" />
            )}
            <h4 className={`font-medium text-sm leading-tight flex-1 ${
              task.completed || task.status === 'completed' ? 'line-through text-gray-500' : 'text-gray-800'
            }`}>
              {task.title}
            </h4>
          </div>
          <Info className="h-4 w-4 text-gray-400 flex-shrink-0 ml-2" />
        </div>
        
        <div className="flex flex-wrap gap-1 mb-2">
          <Badge variant="outline" className={`text-xs ${getEnergyColor(task.energy_level_required)}`}>
            <Zap className="h-3 w-3 mr-1" />
            {task.energy_level_required}
          </Badge>
          <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700">
            <Clock className="h-3 w-3 mr-1" />
            {task.estimated_duration}
          </Badge>
        </div>
        
        <div className="text-center">
          <p className="text-xs text-gray-400">Double-tap for coaching</p>
        </div>
      </CardContent>
    </Card>
  );
};

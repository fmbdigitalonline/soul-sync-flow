
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Clock, 
  Target, 
  Zap, 
  Calendar,
  TrendingUp,
  Battery
} from "lucide-react";

interface SessionProgressProps {
  focusTime: number;
  estimatedDuration: string;
  energyLevel: string;
  taskProgress?: number;
  dayOfTask?: number;
  totalDays?: number;
}

export const SessionProgress: React.FC<SessionProgressProps> = ({
  focusTime,
  estimatedDuration,
  energyLevel,
  taskProgress = 0,
  dayOfTask = 1,
  totalDays = 1
}) => {
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getEnergyColor = (energy: string) => {
    switch (energy.toLowerCase()) {
      case 'low': return 'bg-green-100 text-green-700 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'high': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getEnergyIcon = () => {
    const bars = energyLevel.toLowerCase() === 'high' ? 3 : 
                 energyLevel.toLowerCase() === 'medium' ? 2 : 1;
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3].map(i => (
          <div 
            key={i}
            className={`w-1 h-3 rounded-sm ${
              i <= bars ? 'bg-current' : 'bg-current/20'
            }`}
          />
        ))}
      </div>
    );
  };

  const dayProgress = totalDays > 1 ? (dayOfTask / totalDays) * 100 : 100;

  return (
    <div className="space-y-4 p-4 bg-muted/20 rounded-lg border">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-sm flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-soul-purple" />
          Session Progress
        </h3>
        <Badge variant="outline" className="text-xs">
          Day {dayOfTask} of {totalDays}
        </Badge>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Clock className="h-3 w-3 text-blue-600" />
            <span className="text-xs font-medium">Focus Time</span>
          </div>
          <div className="text-sm font-semibold text-blue-600">
            {formatTime(focusTime)}
          </div>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Target className="h-3 w-3 text-emerald-600" />
            <span className="text-xs font-medium">Duration</span>
          </div>
          <div className="text-sm font-semibold text-emerald-600">
            {estimatedDuration}
          </div>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Battery className="h-3 w-3" />
            <span className="text-xs font-medium">Energy</span>
          </div>
          <Badge variant="outline" className={`text-xs ${getEnergyColor(energyLevel)}`}>
            <span className="mr-1">{getEnergyIcon()}</span>
            {energyLevel}
          </Badge>
        </div>
      </div>

      {totalDays > 1 && (
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span>Multi-day Progress</span>
            <span>{Math.round(dayProgress)}%</span>
          </div>
          <Progress value={dayProgress} className="h-1.5" />
        </div>
      )}

      {taskProgress > 0 && (
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span>Task Completion</span>
            <span>{Math.round(taskProgress)}%</span>
          </div>
          <Progress value={taskProgress} className="h-1.5" />
        </div>
      )}
    </div>
  );
};

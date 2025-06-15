
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Zap, TrendingUp, Target, CheckCircle2 } from "lucide-react";

interface TaskInsightsProps {
  task: {
    title: string;
    estimated_duration: string;
    energy_level_required: string;
    category: string;
  };
  actualDuration: number;
  insights?: string[];
  onClose?: () => void;
}

export const TaskInsights: React.FC<TaskInsightsProps> = ({
  task,
  actualDuration,
  insights = [],
  onClose
}) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const parseEstimatedDuration = (duration: string): number => {
    const match = duration.match(/(\d+)/);
    return match ? parseInt(match[1]) * 60 : 1800; // Default to 30 minutes
  };

  const estimatedSeconds = parseEstimatedDuration(task.estimated_duration);
  const timeDifference = actualDuration - estimatedSeconds;
  const isUnderTime = timeDifference < 0;
  const isOnTime = Math.abs(timeDifference) <= 300; // Within 5 minutes

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-green-600" />
          Task Completed!
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="font-medium text-sm text-gray-800 mb-2">{task.title}</h4>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Estimated:</span>
              <Badge variant="outline" className="text-xs">
                <Clock className="h-3 w-3 mr-1" />
                {task.estimated_duration}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Actual:</span>
              <Badge variant="outline" className="text-xs">
                <Clock className="h-3 w-3 mr-1" />
                {formatTime(actualDuration)}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Timing:</span>
              <Badge 
                variant={isOnTime ? "default" : isUnderTime ? "secondary" : "destructive"}
                className="text-xs"
              >
                <TrendingUp className="h-3 w-3 mr-1" />
                {isOnTime ? "On Time" : isUnderTime ? "Under Time" : "Over Time"}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Energy:</span>
              <Badge variant="outline" className="text-xs">
                <Zap className="h-3 w-3 mr-1" />
                {task.energy_level_required}
              </Badge>
            </div>
          </div>
        </div>

        {insights.length > 0 && (
          <div>
            <h5 className="font-medium text-sm text-gray-800 mb-2">Key Insights:</h5>
            <ul className="space-y-1">
              {insights.map((insight, index) => (
                <li key={index} className="text-xs text-muted-foreground flex items-start gap-2">
                  <Target className="h-3 w-3 mt-0.5 flex-shrink-0" />
                  {insight}
                </li>
              ))}
            </ul>
          </div>
        )}

        {onClose && (
          <button
            onClick={onClose}
            className="w-full px-3 py-2 bg-soul-purple hover:bg-soul-purple/90 text-white rounded-lg font-medium transition-colors text-sm"
          >
            Continue Journey
          </button>
        )}
      </CardContent>
    </Card>
  );
};


import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Zap, TrendingUp, Target, CheckCircle2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

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
  const { t } = useLanguage();
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
          {t('tasks.status.completed')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="font-medium text-sm text-gray-800 mb-2">{task.title}</h4>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">{t('tasks.status.estimated')}</span>
              <Badge variant="outline" className="text-xs">
                <Clock className="h-3 w-3 mr-1" />
                {task.estimated_duration}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">{t('tasks.status.actual')}</span>
              <Badge variant="outline" className="text-xs">
                <Clock className="h-3 w-3 mr-1" />
                {formatTime(actualDuration)}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">{t('tasks.status.timing')}</span>
              <Badge 
                variant={isOnTime ? "default" : isUnderTime ? "secondary" : "destructive"}
                className="text-xs"
              >
                <TrendingUp className="h-3 w-3 mr-1" />
                {isOnTime ? t('tasks.status.onTime') : isUnderTime ? t('tasks.status.underTime') : t('tasks.status.overTime')}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">{t('tasks.status.energy')}</span>
              <Badge variant="outline" className="text-xs">
                <Zap className="h-3 w-3 mr-1" />
                {task.energy_level_required}
              </Badge>
            </div>
          </div>
        </div>

        {insights.length > 0 && (
          <div>
            <h5 className="font-medium text-sm text-gray-800 mb-2">{t('tasks.status.keyInsights')}</h5>
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
            {t('tasks.actions.continueJourney')}
          </button>
        )}
      </CardContent>
    </Card>
  );
};

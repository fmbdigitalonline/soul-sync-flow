
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, Flame, Info } from "lucide-react";
import { useDoubleTap } from "@/hooks/use-double-tap";
import { useLanguage } from "@/contexts/LanguageContext";
import { useResponsiveLayout } from "@/hooks/use-responsive-layout";

interface HabitCardProps {
  habit: any;
  onDoubleTap: (habit: any) => void;
  onSingleTap?: (habit: any) => void;
}

export const HabitCard: React.FC<HabitCardProps> = ({ habit, onDoubleTap, onSingleTap }) => {
  const doubleTapHandlers = useDoubleTap({
    onDoubleTap: () => onDoubleTap(habit),
    onSingleTap: () => onSingleTap?.(habit),
    delay: 300
  });
  const { t } = useLanguage();
  const { spacing, getTextSize, touchTargetSize, isFoldDevice } = useResponsiveLayout();

  const todayCompleted = habit.completedToday || false;
  const streak = habit.streak || 0;

  return (
    <Card 
      className={`cursor-pointer transition-colors duration-300 hover:bg-accent/50 w-full ${
        todayCompleted ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-white'
      }`}
      {...doubleTapHandlers}
    >
      <CardContent className={`${isFoldDevice ? 'p-2' : 'p-3'} w-full`}>
        <div className={`flex items-center justify-between mb-2 w-full`}>
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {todayCompleted ? (
              <CheckCircle2 className={`text-green-600 flex-shrink-0 ${isFoldDevice ? 'h-3 w-3' : 'h-4 w-4'}`} />
            ) : (
              <Circle className={`text-gray-400 flex-shrink-0 ${isFoldDevice ? 'h-3 w-3' : 'h-4 w-4'}`} />
            )}
            <h4 className={`font-medium truncate ${getTextSize('text-sm')}`}>{habit.title}</h4>
          </div>
          <Info className={`text-gray-400 flex-shrink-0 ${isFoldDevice ? 'h-3 w-3' : 'h-4 w-4'}`} />
        </div>

        <div className={`flex items-center justify-between mb-2 w-full ${isFoldDevice ? 'flex-col items-start gap-1' : ''}`}>
          <div className="flex items-center gap-1">
            <Flame className={`text-orange-500 ${isFoldDevice ? 'h-2 w-2' : 'h-3 w-3'}`} />
            <span className={`text-gray-600 ${getTextSize('text-xs')}`}>
              {t('habits.streak', { 
                count: streak.toString(), 
                unit: streak === 1 ? t('habits.daysSingular') : t('habits.daysPlural')
              })}
            </span>
          </div>
          <Badge variant="outline" className={`${getTextSize('text-xs')} ${isFoldDevice ? 'self-end' : ''}`}>
            {habit.frequency || t('habits.frequency')}
          </Badge>
        </div>

        <div className="text-center w-full">
          <p className={`text-gray-400 ${getTextSize('text-xs')}`}>{t('habits.doubleTapDetails')}</p>
        </div>
      </CardContent>
    </Card>
  );
};

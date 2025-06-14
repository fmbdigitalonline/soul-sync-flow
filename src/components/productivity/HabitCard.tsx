
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, Flame, Calendar, Info } from "lucide-react";
import { useDoubleTap } from "@/hooks/use-double-tap";

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

  const todayCompleted = habit.completedToday || false;
  const streak = habit.streak || 0;

  return (
    <Card 
      className={`cursor-pointer transition-all duration-200 hover:shadow-md transform active:scale-[0.98] ${
        todayCompleted ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-white'
      }`}
      {...doubleTapHandlers}
    >
      <CardContent className="p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {todayCompleted ? (
              <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
            ) : (
              <Circle className="h-4 w-4 text-gray-400 flex-shrink-0" />
            )}
            <h4 className="font-medium text-sm truncate">{habit.title}</h4>
          </div>
          <Info className="h-4 w-4 text-gray-400 flex-shrink-0" />
        </div>

        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1">
            <Flame className="h-3 w-3 text-orange-500" />
            <span className="text-xs text-gray-600">{streak} day streak</span>
          </div>
          <Badge variant="outline" className="text-xs">
            {habit.frequency || 'Daily'}
          </Badge>
        </div>

        <div className="text-center">
          <p className="text-xs text-gray-400">Double-tap for details</p>
        </div>
      </CardContent>
    </Card>
  );
};

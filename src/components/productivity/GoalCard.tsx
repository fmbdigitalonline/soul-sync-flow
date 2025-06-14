
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Target, Calendar, CheckCircle2, Info } from "lucide-react";
import { useDoubleTap } from "@/hooks/use-double-tap";

interface GoalCardProps {
  goal: any;
  onDoubleTap: (goal: any) => void;
  onSingleTap?: (goal: any) => void;
}

export const GoalCard: React.FC<GoalCardProps> = ({ goal, onDoubleTap, onSingleTap }) => {
  const doubleTapHandlers = useDoubleTap({
    onDoubleTap: () => onDoubleTap(goal),
    onSingleTap: () => onSingleTap?.(goal),
    delay: 300
  });

  const completedTasks = goal.tasks?.filter((t: any) => t.completed) || [];
  const totalTasks = goal.tasks?.length || 0;
  const progress = totalTasks > 0 ? Math.round((completedTasks.length / totalTasks) * 100) : 0;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric'
    });
  };

  return (
    <Card 
      className="cursor-pointer transition-all duration-200 hover:shadow-lg transform active:scale-[0.98] border-2"
      {...doubleTapHandlers}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Target className="h-4 w-4 text-soul-purple flex-shrink-0" />
            <h3 className="font-semibold text-sm truncate">{goal.title}</h3>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Badge variant="outline" className="text-xs">
              {goal.category}
            </Badge>
            <Info className="h-4 w-4 text-gray-400" />
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3 text-gray-500" />
              <span className="text-gray-600">{formatDate(goal.target_completion)}</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3 text-green-500" />
              <span className="text-gray-600">{completedTasks.length}/{totalTasks} tasks</span>
            </div>
          </div>

          <Progress value={progress} className="h-2" />

          <div className="text-center">
            <p className="text-xs text-gray-400">Double-tap for details</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

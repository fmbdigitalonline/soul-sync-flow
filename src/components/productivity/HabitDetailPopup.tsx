
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  CheckCircle2, 
  Flame, 
  Calendar,
  X,
  Target,
  Clock
} from "lucide-react";

interface HabitDetailPopupProps {
  habit: any;
  isOpen: boolean;
  onClose: () => void;
  onMarkComplete?: (habitId: string) => void;
}

export const HabitDetailPopup: React.FC<HabitDetailPopupProps> = ({
  habit,
  isOpen,
  onClose,
  onMarkComplete
}) => {
  if (!habit) return null;

  const streak = habit.streak || 0;
  const target = habit.target || 30;
  const progress = Math.min((streak / target) * 100, 100);
  const todayCompleted = habit.completedToday || false;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-md mx-auto h-[80vh] max-h-[80vh] overflow-y-auto p-0 rounded-t-3xl rounded-b-none sm:rounded-2xl">
        {/* Header */}
        <DialogHeader className="p-4 pb-0 sticky top-0 bg-white z-10">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-orange-400 to-orange-600">
                <Flame className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <DialogTitle className="text-lg font-bold leading-tight mb-1">
                  {habit.title}
                </DialogTitle>
                <Badge variant="outline" className="text-xs">
                  {habit.frequency || 'Daily'}
                </Badge>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 rounded-full"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* Content */}
        <div className="p-4 pt-2 space-y-6">
          {/* Description */}
          {habit.description && (
            <div>
              <h4 className="font-semibold text-sm mb-2 text-gray-700">Description</h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                {habit.description}
              </p>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-orange-50 p-3 rounded-xl">
              <div className="flex items-center gap-2 mb-1">
                <Flame className="h-4 w-4 text-orange-500" />
                <span className="text-xs font-medium text-orange-700">Current Streak</span>
              </div>
              <p className="text-lg font-bold text-orange-800">
                {streak} days
              </p>
            </div>
            <div className="bg-blue-50 p-3 rounded-xl">
              <div className="flex items-center gap-2 mb-1">
                <Target className="h-4 w-4 text-blue-500" />
                <span className="text-xs font-medium text-blue-700">Target</span>
              </div>
              <p className="text-lg font-bold text-blue-800">
                {target} days
              </p>
            </div>
          </div>

          {/* Progress */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-sm text-gray-700">Progress to Goal</h4>
              <span className="text-xs text-gray-500">
                {Math.round(progress)}%
              </span>
            </div>
            <Progress value={progress} className="h-3 mb-2" />
            <p className="text-xs text-gray-500 text-center">
              {target - streak > 0 ? `${target - streak} days to go!` : 'Goal achieved! 🎉'}
            </p>
          </div>

          {/* Today's Status */}
          <div className={`p-4 rounded-xl border-2 ${
            todayCompleted 
              ? 'bg-green-50 border-green-200' 
              : 'bg-gray-50 border-gray-200'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className={`h-5 w-5 ${
                  todayCompleted ? 'text-green-600' : 'text-gray-400'
                }`} />
                <span className={`font-semibold ${
                  todayCompleted ? 'text-green-800' : 'text-gray-600'
                }`}>
                  Today
                </span>
              </div>
              <Badge variant={todayCompleted ? 'default' : 'outline'} className="text-xs">
                {todayCompleted ? 'Completed' : 'Pending'}
              </Badge>
            </div>
            {!todayCompleted && (
              <p className="text-xs text-gray-500 mt-2">
                Complete today to continue your streak!
              </p>
            )}
          </div>

          {/* Action Button */}
          {!todayCompleted && (
            <div className="pt-4">
              <Button
                onClick={() => onMarkComplete?.(habit.id)}
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 rounded-xl font-semibold"
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Mark as Complete Today
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

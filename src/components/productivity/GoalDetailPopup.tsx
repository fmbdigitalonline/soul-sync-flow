
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Calendar, 
  Target, 
  CheckCircle2, 
  ArrowRight,
  X,
  Focus,
  Clock
} from "lucide-react";

interface GoalDetailPopupProps {
  goal: any;
  isOpen: boolean;
  onClose: () => void;
  onTaskClick?: (taskId: string) => void;
  onGoalFocus?: (goalId: string) => void;
}

export const GoalDetailPopup: React.FC<GoalDetailPopupProps> = ({
  goal,
  isOpen,
  onClose,
  onTaskClick,
  onGoalFocus
}) => {
  if (!goal) return null;

  const completedTasks = goal.tasks?.filter((t: any) => t.completed) || [];
  const totalTasks = goal.tasks?.length || 0;
  const progress = totalTasks > 0 ? Math.round((completedTasks.length / totalTasks) * 100) : 0;
  const nextTasks = goal.tasks?.filter((t: any) => !t.completed).slice(0, 3) || [];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      personal_growth: 'from-purple-400 to-purple-600',
      career: 'from-blue-400 to-blue-600',
      health: 'from-green-400 to-green-600',
      relationships: 'from-pink-400 to-pink-600',
      creativity: 'from-orange-400 to-orange-600',
      financial: 'from-emerald-400 to-emerald-600',
      spiritual: 'from-indigo-400 to-indigo-600'
    };
    return colors[category] || 'from-gray-400 to-gray-600';
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      personal_growth: '🌱',
      career: '💼',
      health: '💪',
      relationships: '❤️',
      creativity: '🎨',
      financial: '💰',
      spiritual: '🧘'
    };
    return icons[category] || '🎯';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-md mx-auto h-[90vh] max-h-[90vh] overflow-y-auto p-0 rounded-t-3xl rounded-b-none sm:rounded-2xl">
        {/* Header */}
        <DialogHeader className="p-4 pb-0 sticky top-0 bg-white z-10">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br ${getCategoryColor(goal.category)}`}>
                <span className="text-lg">{getCategoryIcon(goal.category)}</span>
              </div>
              <div className="flex-1 min-w-0">
                <DialogTitle className="text-lg font-bold leading-tight mb-1">
                  {goal.title}
                </DialogTitle>
                <Badge variant="outline" className="text-xs">
                  {goal.category}
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
          <div>
            <h4 className="font-semibold text-sm mb-2 text-gray-700">Description</h4>
            <p className="text-sm text-gray-600 leading-relaxed">
              {goal.description}
            </p>
          </div>

          {/* Progress & Timeline */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-3 rounded-xl">
              <div className="flex items-center gap-2 mb-1">
                <Target className="h-4 w-4 text-gray-500" />
                <span className="text-xs font-medium text-gray-500">Progress</span>
              </div>
              <p className="text-sm font-semibold text-gray-800">
                {progress}% Complete
              </p>
            </div>
            <div className="bg-gray-50 p-3 rounded-xl">
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="text-xs font-medium text-gray-500">Target</span>
              </div>
              <p className="text-sm font-semibold text-gray-800">
                {formatDate(goal.target_completion)}
              </p>
            </div>
          </div>

          {/* Task Progress */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-sm text-gray-700">Task Progress</h4>
              <span className="text-xs text-gray-500">
                {completedTasks.length} of {totalTasks} tasks
              </span>
            </div>
            <Progress value={progress} className="h-2 mb-3" />
          </div>

          {/* Next Tasks */}
          {nextTasks.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-sm text-gray-700">Next Tasks</h4>
                <span className="text-xs text-gray-500">{nextTasks.length} upcoming</span>
              </div>
              <div className="space-y-2">
                {nextTasks.map((task: any) => (
                  <div
                    key={task.id}
                    className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-xl hover:border-gray-200 cursor-pointer transition-colors"
                    onClick={() => onTaskClick?.(task.id)}
                  >
                    <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                      <div className="w-2 h-2 bg-gray-400 rounded-full" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">
                        {task.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {task.estimated_duration}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {task.energy_level_required}
                        </Badge>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Button */}
          <div className="pt-4">
            <Button
              onClick={() => onGoalFocus?.(goal.id)}
              className="w-full bg-gradient-to-r from-soul-purple to-soul-teal text-white py-3 rounded-xl font-semibold"
            >
              <Focus className="h-4 w-4 mr-2" />
              Focus on This Goal
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};


import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Target, 
  ArrowRight,
  X,
  Focus
} from "lucide-react";

interface MilestoneDetailPopupProps {
  milestone: any;
  tasks: any[];
  isOpen: boolean;
  onClose: () => void;
  onTaskClick?: (taskId: string) => void;
  onMilestoneAction?: (milestoneId: string) => void;
}

export const MilestoneDetailPopup: React.FC<MilestoneDetailPopupProps> = ({
  milestone,
  tasks,
  isOpen,
  onClose,
  onTaskClick,
  onMilestoneAction
}) => {
  if (!milestone) return null;

  const milestoneTasks = tasks.filter(task => task.milestone_id === milestone.id);
  const completedTasks = milestoneTasks.filter(task => task.completed);
  const taskProgress = milestoneTasks.length > 0 ? Math.round((completedTasks.length / milestoneTasks.length) * 100) : 0;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getPhaseColor = (phase: string) => {
    const colors = {
      discovery: 'from-blue-400 to-blue-600',
      planning: 'from-purple-400 to-purple-600',
      execution: 'from-green-400 to-green-600',
      analysis: 'from-orange-400 to-orange-600'
    };
    return colors[phase] || 'from-gray-400 to-gray-600';
  };

  const getPhaseIcon = (phase: string) => {
    const icons = {
      discovery: '🔍',
      planning: '📋',
      execution: '⚡',
      analysis: '📊'
    };
    return icons[phase] || '📌';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-md mx-auto h-[90vh] max-h-[90vh] overflow-y-auto p-0 rounded-t-3xl rounded-b-none sm:rounded-2xl">
        {/* Header */}
        <DialogHeader className="p-4 pb-0 sticky top-0 bg-white z-10">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br ${getPhaseColor(milestone.phase)}`}>
                <span className="text-lg">{getPhaseIcon(milestone.phase)}</span>
              </div>
              <div className="flex-1 min-w-0">
                <DialogTitle className="text-lg font-bold leading-tight mb-1">
                  {milestone.title}
                </DialogTitle>
                <Badge variant="outline" className="text-xs">
                  {milestone.phase}
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
              {milestone.description}
            </p>
          </div>

          {/* Timeline & Progress */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-3 rounded-xl">
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="text-xs font-medium text-gray-500">Target Date</span>
              </div>
              <p className="text-sm font-semibold text-gray-800">
                {formatDate(milestone.target_date)}
              </p>
            </div>
            <div className="bg-gray-50 p-3 rounded-xl">
              <div className="flex items-center gap-2 mb-1">
                <Target className="h-4 w-4 text-gray-500" />
                <span className="text-xs font-medium text-gray-500">Progress</span>
              </div>
              <p className="text-sm font-semibold text-gray-800">
                {taskProgress}% Complete
              </p>
            </div>
          </div>

          {/* Task Progress */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-sm text-gray-700">Task Progress</h4>
              <span className="text-xs text-gray-500">
                {completedTasks.length} of {milestoneTasks.length} tasks
              </span>
            </div>
            <Progress value={taskProgress} className="h-2 mb-3" />
          </div>

          {/* Completion Criteria */}
          {milestone.completion_criteria && milestone.completion_criteria.length > 0 && (
            <div>
              <h4 className="font-semibold text-sm mb-3 text-gray-700">Success Criteria</h4>
              <div className="space-y-2">
                {milestone.completion_criteria.map((criteria: string, index: number) => (
                  <div key={index} className="flex items-start gap-2 p-2 bg-green-50 rounded-lg">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-green-800">{criteria}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tasks List */}
          {milestoneTasks.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-sm text-gray-700">Tasks</h4>
                <span className="text-xs text-gray-500">{milestoneTasks.length} total</span>
              </div>
              <div className="space-y-2">
                {milestoneTasks.map((task: any) => (
                  <div
                    key={task.id}
                    className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-xl hover:border-gray-200 cursor-pointer transition-colors"
                    onClick={() => onTaskClick?.(task.id)}
                  >
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                      task.completed ? 'bg-green-500 text-white' : 'bg-gray-200'
                    }`}>
                      {task.completed ? (
                        <CheckCircle2 className="h-3 w-3" />
                      ) : (
                        <div className="w-2 h-2 bg-gray-400 rounded-full" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${task.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>
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
          {!milestone.completed && (
            <div className="pt-4">
              <Button
                onClick={() => onMilestoneAction?.(milestone.id)}
                className="w-full bg-gradient-to-r from-soul-purple to-soul-teal text-white py-3 rounded-xl font-semibold"
              >
                <Focus className="h-4 w-4 mr-2" />
                Focus on This Milestone
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

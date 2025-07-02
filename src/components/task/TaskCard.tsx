
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, Clock, Zap, Info } from "lucide-react";
import { useDoubleTap } from "@/hooks/use-double-tap";
import { TaskPreview } from "./TaskPreview";
import { ReadyToBeginModal } from "./ReadyToBeginModal";
import { TaskStatusSelector } from "./TaskStatusSelector";
import { useResponsiveLayout } from "@/hooks/use-responsive-layout";

interface TaskCardProps {
  task: any;
  onDoubleTap: (task: any) => void;
  onSingleTap?: (task: any) => void;
  showGoal?: boolean;
  onMarkDone?: (task: any) => void;
  onStatusChange?: (task: any, status: 'todo' | 'in_progress' | 'stuck' | 'completed') => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onDoubleTap,
  onSingleTap,
  showGoal = false,
  onMarkDone,
  onStatusChange
}) => {
  const [showModal, setShowModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [localStatus, setLocalStatus] = useState(task.status || 'todo');
  const { spacing, getTextSize, touchTargetSize, isFoldDevice, isUltraNarrow } = useResponsiveLayout();

  const handleStartCoach = () => {
    if (!isProcessing) {
      setShowModal(true);
    }
  };

  const handleReadyGo = () => {
    if (!isProcessing) {
      setIsProcessing(true);
      setShowModal(false);
      onDoubleTap(task);
      setTimeout(() => setIsProcessing(false), 1000);
    }
  };

  const handleReadyCancel = () => {
    setShowModal(false);
  };

  const handleStatusChange = async (newStatus: 'todo' | 'in_progress' | 'stuck' | 'completed') => {
    if (onStatusChange && !isProcessing) {
      console.log('TaskCard: Status changing from', localStatus, 'to', newStatus);
      
      // Optimistic update
      setLocalStatus(newStatus);
      
      try {
        await onStatusChange(task, newStatus);
        console.log('TaskCard: Status change successful');
      } catch (error) {
        console.error('TaskCard: Status change failed, reverting', error);
        // Revert on error
        setLocalStatus(task.status || 'todo');
      }
    }
  };

  const handleMarkDone = () => {
    if (onMarkDone && !isProcessing) {
      setIsProcessing(true);
      setLocalStatus('completed');
      onMarkDone(task);
      setTimeout(() => setIsProcessing(false), 500);
    }
  };

  // Use local status for optimistic updates, but fall back to task status
  const currentStatus = localStatus;
  const isCompleted = currentStatus === 'completed' || task.completed;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "border-green-200 bg-green-50";
      case "in_progress": return "border-blue-200 bg-blue-50";
      case "stuck": return "border-amber-200 bg-amber-50";
      default: return "border-gray-200 bg-white";
    }
  };

  const getEnergyColor = (energy: string) => {
    switch (energy?.toLowerCase()) {
      case "low": return "bg-green-100 text-green-700";
      case "medium": return "bg-yellow-100 text-yellow-700";
      case "high": return "bg-red-100 text-red-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <>
      <Card
        className={`cursor-pointer transition-all duration-200 hover:shadow-md transform active:scale-[0.98] w-full max-w-full overflow-hidden ${getStatusColor(
          currentStatus
        )}`}
      >
        <CardContent className={`w-full max-w-full overflow-hidden ${spacing.card}`}>
          <div className={`flex items-center gap-3 mb-2 w-full max-w-full overflow-hidden ${isFoldDevice ? 'gap-2' : ''}`}>
            {isCompleted ? (
              <CheckCircle2 className={`text-green-600 flex-shrink-0 ${isFoldDevice ? 'h-4 w-4' : 'h-5 w-5'}`} />
            ) : (
              <Circle className={`text-gray-400 flex-shrink-0 ${isFoldDevice ? 'h-4 w-4' : 'h-5 w-5'}`} />
            )}
            <div className="flex-1 min-w-0 w-full max-w-full overflow-hidden">
              <h4
                className={`font-bold truncate w-full max-w-full ${
                  isCompleted
                    ? "line-through text-gray-500"
                    : "text-gray-800"
                } ${getTextSize('text-base')}`}
              >
                {task.title}
              </h4>
              {task.short_description && (
                <div className={`text-muted-foreground truncate mt-1 w-full max-w-full ${getTextSize('text-xs')}`}>
                  {task.short_description}
                </div>
              )}
            </div>
            <Info className={`text-gray-400 flex-shrink-0 ml-2 ${isFoldDevice ? 'h-3 w-3' : 'h-4 w-4'}`} />
          </div>
          
          <div className={`flex flex-wrap gap-2 mb-2 w-full max-w-full overflow-hidden ${isFoldDevice ? 'gap-1' : ''}`}>
            <Badge variant="secondary" className={`bg-soul-purple/20 text-soul-purple flex-shrink-0 ${getTextSize('text-xs')}`}>
              🧩 {isFoldDevice ? 'Blueprint' : 'This task is aligned to your blueprint'}
            </Badge>
            <Badge variant="outline" className={`${getEnergyColor(task.energy_level_required)} flex-shrink-0 ${getTextSize('text-xs')}`}>
              <Zap className={`mr-1 ${isFoldDevice ? 'h-2 w-2' : 'h-3 w-3'}`} />
              {task.energy_level_required}
            </Badge>
            <Badge variant="outline" className={`bg-purple-50 text-purple-700 flex-shrink-0 ${getTextSize('text-xs')}`}>
              <Clock className={`mr-1 ${isFoldDevice ? 'h-2 w-2' : 'h-3 w-3'}`} />
              {task.estimated_duration}
            </Badge>
          </div>
          
          <div className="w-full max-w-full overflow-hidden mb-3">
            <TaskPreview task={task} />
          </div>

          {/* Status Selector */}
          <div className="mb-3 w-full max-w-full">
            <TaskStatusSelector
              currentStatus={currentStatus}
              onStatusChange={handleStatusChange}
              disabled={isCompleted || isProcessing}
            />
          </div>

          {/* Mobile-Responsive Button Layout */}
          <div className={`w-full max-w-full ${
            isFoldDevice || isUltraNarrow 
              ? 'flex flex-col gap-2' 
              : 'flex gap-2'
          }`}>
            <button
              className={`px-2 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full max-w-full overflow-hidden ${
                isFoldDevice || isUltraNarrow ? 'flex-none' : 'flex-1'
              } ${getTextSize('text-sm')} ${touchTargetSize}`}
              disabled={isCompleted || isProcessing}
              onClick={handleMarkDone}
            >
              <span className="truncate w-full">
                ✅ {isFoldDevice ? 'Done' : 'Mark as Done'}
              </span>
            </button>
            <button
              className={`px-2 py-2 bg-soul-purple hover:bg-soul-purple/90 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full max-w-full overflow-hidden ${
                isFoldDevice || isUltraNarrow ? 'flex-none' : 'flex-1'
              } ${getTextSize('text-sm')} ${touchTargetSize}`}
              onClick={handleStartCoach}
              disabled={isCompleted || isProcessing}
            >
              <span className="truncate w-full">
                🔮 {isFoldDevice ? 'Coach' : 'Tackle with Coach'}
              </span>
            </button>
          </div>
        </CardContent>
      </Card>
      <ReadyToBeginModal
        open={showModal}
        onConfirm={handleReadyGo}
        onCancel={handleReadyCancel}
        estimatedDuration={task.estimated_duration}
      />
    </>
  );
};

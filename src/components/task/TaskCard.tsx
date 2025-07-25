
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, Clock, Zap, Info } from "lucide-react";
import { useDoubleTap } from "@/hooks/use-double-tap";
import { TaskPreview } from "./TaskPreview";
import { ReadyToBeginModal } from "./ReadyToBeginModal";
import { TaskStatusSelector } from "./TaskStatusSelector";
import { SmartQuickActions } from "./SmartQuickActions";
import { useResponsiveLayout } from "@/hooks/use-responsive-layout";

interface TaskCardProps {
  task: any;
  onDoubleTap: (task: any) => void;
  onSingleTap?: (task: any) => void;
  showGoal?: boolean;
  onMarkDone?: (task: any) => void;
  onStatusChange?: (task: any, status: 'todo' | 'in_progress' | 'stuck' | 'completed') => void;
  onSmartAction?: (actionId: string, message: string, task: any) => void;
  onCreateSubTasks?: (task: any, subtasks: string[]) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onDoubleTap,
  onSingleTap,
  showGoal = false,
  onMarkDone,
  onStatusChange,
  onSmartAction,
  onCreateSubTasks
}) => {
  const [showModal, setShowModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [localStatus, setLocalStatus] = useState(task.status || 'todo');
  const [showSmartActions, setShowSmartActions] = useState(false);
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

  const handleCompletionMarkerClick = () => {
    if (isCompleted) {
      // If completed, just mark done
      handleMarkDone();
    } else {
      // If not completed, toggle smart actions
      setShowSmartActions(!showSmartActions);
    }
  };

  const handleSmartAction = (actionId: string, message: string) => {
    if (onSmartAction) {
      onSmartAction(actionId, message, task);
    }
    // Keep smart actions open for now, let user decide when to close
  };

  const handleCreateSubTasks = (subtasks: string[]) => {
    if (onCreateSubTasks) {
      onCreateSubTasks(task, subtasks);
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
        className={`cursor-pointer transition-all duration-200 hover:shadow-md transform active:scale-[0.98] w-full max-w-full ${getStatusColor(
          currentStatus
        )}`}
      >
        <CardContent className={`w-full max-w-full ${isFoldDevice ? 'p-2' : isUltraNarrow ? 'p-3' : 'p-4'}`}>
          {/* Header with title and icon */}
          <div className={`flex items-start gap-2 mb-3 w-full max-w-full`}>
            <button
              onClick={handleCompletionMarkerClick}
              className={`flex-shrink-0 mt-0.5 transition-colors hover:scale-110 ${touchTargetSize}`}
              disabled={isProcessing}
            >
              {isCompleted ? (
                <CheckCircle2 className={`text-green-600 ${isFoldDevice ? 'h-3 w-3' : 'h-4 w-4'}`} />
              ) : (
                <Circle className={`text-gray-400 hover:text-soul-purple ${isFoldDevice ? 'h-3 w-3' : 'h-4 w-4'} ${showSmartActions ? 'text-soul-purple' : ''}`} />
              )}
            </button>
            <div className="flex-1 min-w-0 max-w-full">
              <h4
                className={`font-bold leading-tight ${
                  isCompleted
                    ? "line-through text-gray-500"
                    : "text-gray-800"
                } ${getTextSize('text-sm')} break-words overflow-hidden`}
              >
                {task.title}
              </h4>
              {task.short_description && (
                <p className={`text-muted-foreground mt-1 leading-tight ${getTextSize('text-xs')} break-words overflow-hidden`}>
                  {task.short_description}
                </p>
              )}
            </div>
            <Info className={`text-gray-400 flex-shrink-0 mt-0.5 ${isFoldDevice ? 'h-3 w-3' : 'h-4 w-4'}`} />
          </div>
          
          {/* Badges - improved wrapping */}
          <div className={`flex flex-wrap gap-1 mb-3 w-full max-w-full ${isFoldDevice ? 'gap-0.5' : ''}`}>
            <Badge variant="secondary" className={`bg-soul-purple/20 text-soul-purple text-[10px] px-1 py-0 h-5 leading-tight flex-shrink-0`}>
              🧩 Blueprint
            </Badge>
            <Badge variant="outline" className={`${getEnergyColor(task.energy_level_required)} text-[10px] px-1 py-0 h-5 leading-tight flex-shrink-0`}>
              <Zap className={`mr-0.5 ${isFoldDevice ? 'h-2 w-2' : 'h-2.5 w-2.5'}`} />
              {task.energy_level_required}
            </Badge>
            <Badge variant="outline" className={`bg-purple-50 text-purple-700 text-[10px] px-1 py-0 h-5 leading-tight flex-shrink-0`}>
              <Clock className={`mr-0.5 ${isFoldDevice ? 'h-2 w-2' : 'h-2.5 w-2.5'}`} />
              {task.estimated_duration}
            </Badge>
          </div>
          
          {/* Task Preview */}
          <div className="w-full max-w-full mb-3">
            <TaskPreview task={task} onCreateSubTasks={handleCreateSubTasks} />
          </div>

          {/* Status Selector */}
          <div className="mb-3 w-full max-w-full">
            <TaskStatusSelector
              currentStatus={currentStatus}
              onStatusChange={handleStatusChange}
              disabled={isCompleted || isProcessing}
            />
          </div>

          {/* Action Buttons - Properly responsive with full text */}
          <div className={`w-full max-w-full ${
            isFoldDevice || isUltraNarrow 
              ? 'flex flex-col gap-1.5' 
              : 'flex gap-2'
          }`}>
            <button
              className={`${
                isFoldDevice || isUltraNarrow ? 'w-full' : 'flex-1'
              } ${isFoldDevice ? 'px-2 py-1.5 text-xs' : 'px-3 py-2 text-sm'} bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${touchTargetSize} flex items-center justify-center gap-1`}
              disabled={isCompleted || isProcessing}
              onClick={handleMarkDone}
            >
              <span>✅</span>
              <span className="truncate">Mark Done</span>
            </button>
            <button
              className={`${
                isFoldDevice || isUltraNarrow ? 'w-full' : 'flex-1'
              } ${isFoldDevice ? 'px-2 py-1.5 text-xs' : 'px-3 py-2 text-sm'} bg-soul-purple hover:bg-soul-purple/90 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${touchTargetSize} flex items-center justify-center gap-1`}
              onClick={handleStartCoach}
              disabled={isCompleted || isProcessing}
            >
              <span>🔮</span>
              <span className="truncate">Get Coach</span>
            </button>
          </div>
          
          {/* Smart Actions - Show when completion marker is clicked */}
          {showSmartActions && onSmartAction && !isCompleted && (
            <div className="mt-4 border-t pt-4">
              <SmartQuickActions
                onAction={handleSmartAction}
                isLoading={isProcessing}
                currentProgress={task.progress || 0}
                hasSubTasks={!!(task.subtasks && task.subtasks.length > 0)}
              />
            </div>
          )}
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

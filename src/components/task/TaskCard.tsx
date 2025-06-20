
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, Clock, Zap, Info } from "lucide-react";
import { useDoubleTap } from "@/hooks/use-double-tap";
import { TaskPreview } from "./TaskPreview";
import { ReadyToBeginModal } from "./ReadyToBeginModal";
import { TaskStatusSelector } from "./TaskStatusSelector";

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
        className={`cursor-pointer transition-all duration-200 hover:shadow-md transform active:scale-[0.98] ${getStatusColor(
          currentStatus
        )}`}
      >
        <CardContent className="p-4">
          <div className="flex items-center gap-3 mb-2">
            {isCompleted ? (
              <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
            ) : (
              <Circle className="h-5 w-5 text-gray-400 flex-shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <h4
                className={`font-bold text-base truncate ${
                  isCompleted
                    ? "line-through text-gray-500"
                    : "text-gray-800"
                }`}
              >
                {task.title}
              </h4>
              {task.short_description && (
                <div className="text-xs text-muted-foreground truncate mt-1">
                  {task.short_description}
                </div>
              )}
            </div>
            <Info className="h-4 w-4 text-gray-400 flex-shrink-0 ml-2" />
          </div>
          
          <div className="flex flex-wrap gap-2 mb-2">
            <Badge variant="secondary" className="text-xs bg-soul-purple/20 text-soul-purple">
              🧩 This task is aligned to your blueprint
            </Badge>
            <Badge variant="outline" className={`text-xs ${getEnergyColor(task.energy_level_required)}`}>
              <Zap className="h-3 w-3 mr-1" />
              {task.energy_level_required}
            </Badge>
            <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700">
              <Clock className="h-3 w-3 mr-1" />
              {task.estimated_duration}
            </Badge>
          </div>
          
          <TaskPreview task={task} />

          {/* Status Selector */}
          <div className="mb-3">
            <TaskStatusSelector
              currentStatus={currentStatus}
              onStatusChange={handleStatusChange}
              disabled={isCompleted || isProcessing}
            />
          </div>

          <div className="flex gap-2">
            <button
              className="flex-1 px-2 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isCompleted || isProcessing}
              onClick={handleMarkDone}
            >
              ✅ Mark as Done
            </button>
            <button
              className="flex-1 px-2 py-2 bg-soul-purple hover:bg-soul-purple/90 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleStartCoach}
              disabled={isCompleted || isProcessing}
            >
              🔮 Tackle with Coach
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

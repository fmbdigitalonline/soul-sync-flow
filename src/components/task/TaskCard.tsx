
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, Clock, Zap, Info, ListChecks } from "lucide-react";
import { useDoubleTap } from "@/hooks/use-double-tap";
import { TaskPreview } from "./TaskPreview";
import { ReadyToBeginModal } from "./ReadyToBeginModal";
import { TaskStatusSelector } from "./TaskStatusSelector";
import { useResponsiveLayout } from "@/hooks/use-responsive-layout";
import { useTaskCompletion } from "@/hooks/use-task-completion";
import { useLanguage } from "@/contexts/LanguageContext";
import { TaskSessionType } from "@/utils/task-session";

interface TaskCardProps {
  task: any;
  onDoubleTap: (task: any) => void;
  onSingleTap?: (task: any) => void;
  showGoal?: boolean;
  onMarkDone?: (task: any) => void;
  onStatusChange?: (task: any, status: 'todo' | 'in_progress' | 'stuck' | 'completed') => void;
  sessionType?: TaskSessionType;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onDoubleTap,
  onSingleTap,
  showGoal = false,
  onMarkDone,
  onStatusChange,
  sessionType = TaskSessionType.NO_SESSION
}) => {
  const [showModal, setShowModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [localStatus, setLocalStatus] = useState(task.status || 'todo');
  const { spacing, getTextSize, touchTargetSize, isFoldDevice, isUltraNarrow } = useResponsiveLayout();
  const { t } = useLanguage();
  
  // Pillar I: Preserve existing functionality, add unified completion
  const { completeTaskFromCard, isTaskCompleting } = useTaskCompletion({
    showFeedback: true,
    autoNavigate: false // Don't auto-navigate from card completion
  });

  const handleStartCoach = () => {
    if (!isProcessing) {
      setShowModal(true);
    }
  };

  const handleResumePlan = () => {
    if (!isProcessing) {
      onDoubleTap(task);
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

  const handleMarkDone = async () => {
    if (!isProcessing && !isTaskCompleting(task.id)) {
      setIsProcessing(true);
      setLocalStatus('completed');
      
      try {
        // Pillar I: Preserve existing callback, add unified completion
        if (onMarkDone) {
          onMarkDone(task);
        }
        
        // Use unified completion service
        await completeTaskFromCard(task.id);
      } catch (error) {
        console.error('Task completion failed:', error);
        // Pillar II: Revert on failure (no masking)
        setLocalStatus(task.status || 'todo');
      } finally {
        setIsProcessing(false);
      }
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

  const isWorkInstructionSession = sessionType === TaskSessionType.WORK_INSTRUCTION_SESSION;
  const isBasicSession = sessionType === TaskSessionType.BASIC_SESSION;

  const cardHighlight = isWorkInstructionSession ? 'border-blue-200 ring-2 ring-blue-200/60' : '';

  return (
    <>
      <Card
        className={`cursor-pointer transition-all duration-200 hover:shadow-md transform active:scale-[0.98] w-full max-w-full ${getStatusColor(
          currentStatus
        )} ${cardHighlight}`}
      >
        <CardContent className={`w-full max-w-full ${isFoldDevice ? 'p-2' : isUltraNarrow ? 'p-3' : 'p-4'}`}>
          {/* Header with title and icon */}
          <div className={`flex items-start gap-2 mb-3 w-full max-w-full`}>
            {isCompleted ? (
              <CheckCircle2 className={`text-green-600 flex-shrink-0 mt-0.5 ${isFoldDevice ? 'h-3 w-3' : 'h-4 w-4'}`} />
            ) : (
              <Circle className={`text-gray-400 flex-shrink-0 mt-0.5 ${isFoldDevice ? 'h-3 w-3' : 'h-4 w-4'}`} />
            )}
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
              {isWorkInstructionSession && (
                <div className="mt-2 flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 text-blue-700 text-[11px] font-semibold px-2 py-0.5">
                    <ListChecks className="h-3 w-3" />
                    Plan Ready
                  </span>
                  <span className="text-[11px] text-blue-600 font-medium">
                    Resume your working instructions
                  </span>
                </div>
              )}
            </div>
            <Info className={`text-gray-400 flex-shrink-0 mt-0.5 ${isFoldDevice ? 'h-3 w-3' : 'h-4 w-4'}`} />
          </div>
          
          {/* Badges - improved wrapping */}
          <div className={`flex flex-wrap gap-1 mb-3 w-full max-w-full ${isFoldDevice ? 'gap-0.5' : ''}`}>
            <Badge variant="secondary" className={`bg-soul-purple/20 text-soul-purple text-[10px] px-1 py-0 h-5 leading-tight flex-shrink-0`}>
              {t('tasks.badges.blueprint')}
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
              disabled={isCompleted || isProcessing || isTaskCompleting(task.id)}
              onClick={handleMarkDone}
            >
              <span>✅</span>
              <span>{t('tasks.actions.markDone')}</span>
            </button>
            <button
              className={`${
                isFoldDevice || isUltraNarrow ? 'w-full' : 'flex-1'
              } ${isFoldDevice ? 'px-2 py-1.5 text-xs' : 'px-3 py-2 text-sm'} ${
                isWorkInstructionSession ? 'bg-blue-600 hover:bg-blue-700' : 'bg-soul-purple hover:bg-soul-purple/90'
              } text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${touchTargetSize} flex items-center justify-center gap-1`}
              onClick={isWorkInstructionSession ? handleResumePlan : handleStartCoach}
              disabled={isCompleted || isProcessing}
            >
              {isWorkInstructionSession ? (
                <ListChecks className={`${isFoldDevice ? 'h-3 w-3' : 'h-4 w-4'}`} />
              ) : (
                <span>🔮</span>
              )}
              <span>{isWorkInstructionSession ? 'Resume Plan' : isBasicSession ? 'Resume Session' : t('tasks.actions.getCoach')}</span>
            </button>
          </div>
        </CardContent>
      </Card>
      {!isWorkInstructionSession && (
        <ReadyToBeginModal
          open={showModal}
          onConfirm={handleReadyGo}
          onCancel={handleReadyCancel}
          estimatedDuration={task.estimated_duration}
        />
      )}
    </>
  );
};

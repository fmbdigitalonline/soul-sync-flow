
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle2, 
  Circle, 
  Plus, 
  Clock,
  Zap,
  Target
} from "lucide-react";

interface SubTask {
  id: string;
  title: string;
  completed: boolean;
  order: number;
  metadata?: {
    estimatedTime?: string;
    energyRequired?: 'low' | 'medium' | 'high';
    source?: string;
  };
}

interface SubTaskManagerProps {
  taskTitle: string;
  subTasks: SubTask[]; // Now controlled - data comes from parent
  onSubTaskComplete: (subTaskId: string) => void;
  onSubTaskAdd?: (title: string, metadata?: SubTask['metadata']) => void;
  onAllComplete: () => void;
}

export const SubTaskManager: React.FC<SubTaskManagerProps> = ({
  taskTitle,
  subTasks, // Use prop instead of state
  onSubTaskComplete,
  onSubTaskAdd,
  onAllComplete
}) => {

  const toggleSubTask = (id: string) => {
    // Just call the parent callback - state is managed there
    onSubTaskComplete(id);
    
    // Check if all will be completed after this toggle
    const subTask = subTasks.find(st => st.id === id);
    if (subTask && !subTask.completed) {
      const completedCount = subTasks.filter(t => t.completed).length + 1;
      const progress = (completedCount / subTasks.length) * 100;
      
      if (progress === 100) {
        onAllComplete();
      }
    }
  };

  const completedCount = subTasks.filter(t => t.completed).length;
  const progress = subTasks.length > 0 ? (completedCount / subTasks.length) * 100 : 0;

  const getEnergyColor = (energy?: string) => {
    switch (energy) {
      case 'low': return 'bg-green-100 text-green-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'high': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getEnergyFromMetadata = (subTask: SubTask): string => {
    return subTask.metadata?.energyRequired || 'medium';
  };

  const getTimeFromMetadata = (subTask: SubTask): string => {
    return subTask.metadata?.estimatedTime || '15min';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium flex items-center gap-2">
          <Target className="h-4 w-4 text-soul-purple" />
          Task Breakdown
        </h3>
        {subTasks.length > 0 && (
          <span className="text-sm text-muted-foreground">
            {completedCount}/{subTasks.length} completed
          </span>
        )}
      </div>

      {subTasks.length > 0 && (
        <div className="space-y-2">
          <Progress value={progress} className="h-2" />
          <div className="text-xs text-muted-foreground text-center">
            {Math.round(progress)}% complete
          </div>
        </div>
      )}

      <div className="space-y-2">
        {subTasks.map(task => (
          <div 
            key={task.id}
            className={`flex items-center gap-3 p-3 rounded-lg border transition-colors cursor-pointer hover:bg-muted/50 ${
              task.completed ? 'bg-emerald-50 border-emerald-200' : 'bg-background'
            }`}
            onClick={() => toggleSubTask(task.id)}
          >
            {task.completed ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            ) : (
              <Circle className="h-5 w-5 text-muted-foreground" />
            )}
            
            <div className="flex-1">
              <p className={`text-sm ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                {task.title}
              </p>
              {task.metadata && (
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className={getEnergyColor(getEnergyFromMetadata(task))}>
                    <Zap className="h-3 w-3 mr-1" />
                    {getEnergyFromMetadata(task)}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    <Clock className="h-3 w-3 mr-1" />
                    {getTimeFromMetadata(task)}
                  </Badge>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {subTasks.length === 0 && (
        <div className="text-center py-6 text-muted-foreground">
          <Circle className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Your coach will help break this task into steps</p>
        </div>
      )}
    </div>
  );
};

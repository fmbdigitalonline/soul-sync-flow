
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
  estimatedTime: string;
  energyRequired: 'low' | 'medium' | 'high';
}

interface SubTaskManagerProps {
  taskTitle: string;
  onSubTaskComplete: (subTaskId: string) => void;
  onAllComplete: () => void;
}

export const SubTaskManager: React.FC<SubTaskManagerProps> = ({
  taskTitle,
  onSubTaskComplete,
  onAllComplete
}) => {
  const [subTasks, setSubTasks] = useState<SubTask[]>([]);

  const toggleSubTask = (id: string) => {
    setSubTasks(prev => {
      const updated = prev.map(task => 
        task.id === id ? { ...task, completed: !task.completed } : task
      );
      
      const completedCount = updated.filter(t => t.completed).length;
      const progress = (completedCount / updated.length) * 100;
      
      if (progress === 100) {
        onAllComplete();
      }
      
      onSubTaskComplete(id);
      return updated;
    });
  };

  const addSubTask = (task: Omit<SubTask, 'id' | 'completed'>) => {
    const newTask: SubTask = {
      ...task,
      id: Date.now().toString(),
      completed: false
    };
    setSubTasks(prev => [...prev, newTask]);
  };

  const completedCount = subTasks.filter(t => t.completed).length;
  const progress = subTasks.length > 0 ? (completedCount / subTasks.length) * 100 : 0;

  const getEnergyColor = (energy: string) => {
    switch (energy) {
      case 'low': return 'bg-green-100 text-green-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'high': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
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
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className={getEnergyColor(task.energyRequired)}>
                  <Zap className="h-3 w-3 mr-1" />
                  {task.energyRequired}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  <Clock className="h-3 w-3 mr-1" />
                  {task.estimatedTime}
                </Badge>
              </div>
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

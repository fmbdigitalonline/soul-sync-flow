
import React, { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Target, 
  CheckCircle2, 
  TrendingUp,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { SubTaskCard } from './SubTaskCard';
import { ParsedSubTask } from '@/services/coach-message-parser';

interface TaskBreakdownDisplayProps {
  subTasks: ParsedSubTask[];
  onSubTaskStart: (subTask: ParsedSubTask) => void;
  onSubTaskComplete: (subTask: ParsedSubTask) => void;
  onStartAll: () => void;
  taskTitle?: string;
}

export const TaskBreakdownDisplay: React.FC<TaskBreakdownDisplayProps> = ({
  subTasks,
  onSubTaskStart,
  onSubTaskComplete,
  onStartAll,
  taskTitle = "Task Breakdown"
}) => {
  // Memoize calculations to prevent unnecessary re-renders
  const { completedCount, progress, allCompleted, validSubTasks } = useMemo(() => {
    // Filter out any invalid or duplicate sub-tasks
    const validTasks = subTasks.filter((task, index, arr) => 
      task.title && 
      task.title.length > 5 && 
      arr.findIndex(t => t.title === task.title) === index
    );
    
    const completed = validTasks.filter(task => task.completed).length;
    const progressPercent = validTasks.length > 0 ? (completed / validTasks.length) * 100 : 0;
    const isAllCompleted = completed === validTasks.length && validTasks.length > 0;
    
    return {
      completedCount: completed,
      progress: progressPercent,
      allCompleted: isAllCompleted,
      validSubTasks: validTasks
    };
  }, [subTasks]);

  // Don't render if no valid sub-tasks
  if (validSubTasks.length === 0) {
    return null;
  }

  return (
    <Card className="p-4 bg-gradient-to-br from-soul-purple/5 to-soul-teal/5 border-soul-purple/20">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-soul-purple rounded-lg flex items-center justify-center">
            <Target className="h-4 w-4 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 text-sm">Smart Task Breakdown</h3>
            <p className="text-xs text-gray-600">AI-generated action plan</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            <Sparkles className="h-3 w-3 mr-1" />
            {validSubTasks.length} steps
          </Badge>
          {allCompleted && (
            <Badge className="text-xs bg-emerald-100 text-emerald-700 border-emerald-200">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Complete
            </Badge>
          )}
        </div>
      </div>

      {/* Progress */}
      <div className="mb-4">
        <div className="flex justify-between text-xs mb-2">
          <span className="text-gray-600">Progress</span>
          <span className="font-medium text-gray-800">{completedCount}/{validSubTasks.length} completed</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Sub-tasks */}
      <div className="space-y-2 mb-4">
        {validSubTasks.map((subTask) => (
          <SubTaskCard
            key={subTask.id}
            subTask={subTask}
            onStart={onSubTaskStart}
            onToggleComplete={onSubTaskComplete}
            compact={true}
          />
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        {!allCompleted && (
          <Button
            onClick={onStartAll}
            className="flex-1 bg-gradient-to-r from-soul-purple to-soul-teal hover:shadow-lg text-white"
            size="sm"
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            Start This Plan
          </Button>
        )}
        
        {allCompleted && (
          <div className="flex-1 text-center">
            <p className="text-sm text-emerald-600 font-medium">
              🎉 Great work! All steps completed.
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};

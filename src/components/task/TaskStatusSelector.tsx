
import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Circle, Play, Pause, CheckCircle2 } from "lucide-react";

interface TaskStatusSelectorProps {
  currentStatus: 'todo' | 'in_progress' | 'stuck' | 'completed';
  onStatusChange: (status: 'todo' | 'in_progress' | 'stuck' | 'completed') => void;
  disabled?: boolean;
}

export const TaskStatusSelector: React.FC<TaskStatusSelectorProps> = ({
  currentStatus,
  onStatusChange,
  disabled = false
}) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'todo': return <Circle className="h-3 w-3" />;
      case 'in_progress': return <Play className="h-3 w-3" />;
      case 'stuck': return <Pause className="h-3 w-3" />;
      case 'completed': return <CheckCircle2 className="h-3 w-3" />;
      default: return <Circle className="h-3 w-3" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'todo': return 'To Do';
      case 'in_progress': return 'In Progress';
      case 'stuck': return 'Stuck';
      case 'completed': return 'Completed';
      default: return 'To Do';
    }
  };

  const handleValueChange = (value: string) => {
    console.log('TaskStatusSelector: Value changing from', currentStatus, 'to', value);
    onStatusChange(value as 'todo' | 'in_progress' | 'stuck' | 'completed');
  };

  console.log('TaskStatusSelector: Rendering with currentStatus:', currentStatus, 'disabled:', disabled);

  return (
    <Select
      value={currentStatus}
      onValueChange={handleValueChange}
      disabled={disabled}
    >
      <SelectTrigger className="w-full h-8 text-xs">
        <SelectValue>
          <div className="flex items-center gap-2">
            {getStatusIcon(currentStatus)}
            <span>{getStatusLabel(currentStatus)}</span>
          </div>
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="bg-white z-50">
        <SelectItem value="todo">
          <div className="flex items-center gap-2">
            <Circle className="h-3 w-3 text-slate-600" />
            <span>To Do</span>
          </div>
        </SelectItem>
        <SelectItem value="in_progress">
          <div className="flex items-center gap-2">
            <Play className="h-3 w-3 text-blue-600" />
            <span>In Progress</span>
          </div>
        </SelectItem>
        <SelectItem value="stuck">
          <div className="flex items-center gap-2">
            <Pause className="h-3 w-3 text-amber-600" />
            <span>Stuck</span>
          </div>
        </SelectItem>
        <SelectItem value="completed">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-3 w-3 text-emerald-600" />
            <span>Completed</span>
          </div>
        </SelectItem>
      </SelectContent>
    </Select>
  );
};

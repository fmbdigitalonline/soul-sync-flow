
import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Circle, Play, Pause, CheckCircle2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

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
  const { t } = useLanguage();

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
      case 'todo': return t('tasks.statusLabels.todo');
      case 'in_progress': return t('tasks.statusLabels.inProgress');
      case 'stuck': return t('tasks.statusLabels.stuck');
      case 'completed': return t('tasks.statusLabels.completed');
      default: return t('tasks.statusLabels.todo');
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
            <span>{t('tasks.statusLabels.todo')}</span>
          </div>
        </SelectItem>
        <SelectItem value="in_progress">
          <div className="flex items-center gap-2">
            <Play className="h-3 w-3 text-blue-600" />
            <span>{t('tasks.statusLabels.inProgress')}</span>
          </div>
        </SelectItem>
        <SelectItem value="stuck">
          <div className="flex items-center gap-2">
            <Pause className="h-3 w-3 text-amber-600" />
            <span>{t('tasks.statusLabels.stuck')}</span>
          </div>
        </SelectItem>
        <SelectItem value="completed">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-3 w-3 text-emerald-600" />
            <span>{t('tasks.statusLabels.completed')}</span>
          </div>
        </SelectItem>
      </SelectContent>
    </Select>
  );
};

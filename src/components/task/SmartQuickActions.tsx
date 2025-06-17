
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  CheckCircle, 
  Plus, 
  BarChart3, 
  ArrowRight, 
  Target,
  Clock,
  Lightbulb
} from 'lucide-react';

interface SmartQuickActionsProps {
  onAction: (actionId: string, message: string) => void;
  isLoading: boolean;
  currentProgress?: number;
  hasSubTasks?: boolean;
}

export const SmartQuickActions: React.FC<SmartQuickActionsProps> = ({
  onAction,
  isLoading,
  currentProgress = 0,
  hasSubTasks = false
}) => {
  const quickActions = [
    {
      id: 'break_down',
      icon: <Target className="h-4 w-4" />,
      label: 'Break Down Task',
      message: 'Please break this task down into 3-5 specific sub-tasks I can work on step by step.',
      color: 'bg-blue-50 hover:bg-blue-100 border-blue-200',
      condition: !hasSubTasks
    },
    {
      id: 'next_step',
      icon: <ArrowRight className="h-4 w-4" />,
      label: 'What\'s Next?',
      message: 'What should I focus on next for this task?',
      color: 'bg-green-50 hover:bg-green-100 border-green-200',
      condition: true
    },
    {
      id: 'progress_check',
      icon: <BarChart3 className="h-4 w-4" />,
      label: 'Progress Check',
      message: 'Can you review my progress and help me update the completion percentage?',
      color: 'bg-purple-50 hover:bg-purple-100 border-purple-200',
      condition: currentProgress > 0
    },
    {
      id: 'add_subtask',
      icon: <Plus className="h-4 w-4" />,
      label: 'Add Sub-task',
      message: 'I need to add a new sub-task to this main task. Can you help me define it?',
      color: 'bg-orange-50 hover:bg-orange-100 border-orange-200',
      condition: hasSubTasks
    },
    {
      id: 'im_stuck',
      icon: <Lightbulb className="h-4 w-4" />,
      label: 'I\'m Stuck',
      message: 'I\'m feeling stuck on this task. Can you help me troubleshoot and find a way forward?',
      color: 'bg-yellow-50 hover:bg-yellow-100 border-yellow-200',
      condition: true
    },
    {
      id: 'time_check',
      icon: <Clock className="h-4 w-4" />,
      label: 'Time Management',
      message: 'Help me optimize my time on this task. Should I continue or take a break?',
      color: 'bg-teal-50 hover:bg-teal-100 border-teal-200',
      condition: true
    },
    {
      id: 'complete_check',
      icon: <CheckCircle className="h-4 w-4" />,
      label: 'Mark Complete',
      message: 'I think I\'ve finished this task. Can you verify completion and mark it as done?',
      color: 'bg-emerald-50 hover:bg-emerald-100 border-emerald-200',
      condition: currentProgress >= 80
    }
  ];

  const availableActions = quickActions.filter(action => action.condition);

  return (
    <Card className="p-4">
      <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
        <Target className="h-4 w-4 text-soul-purple" />
        Smart Actions
      </h3>
      
      <div className="space-y-2">
        {availableActions.map((action) => (
          <Button
            key={action.id}
            variant="outline"
            size="sm"
            onClick={() => onAction(action.id, action.message)}
            disabled={isLoading}
            className={`w-full justify-start text-xs h-8 ${action.color}`}
          >
            {action.icon}
            <span className="ml-2">{action.label}</span>
          </Button>
        ))}
      </div>
      
      <p className="text-xs text-muted-foreground mt-3">
        These actions integrate directly with your task progress and coach guidance.
      </p>
    </Card>
  );
};

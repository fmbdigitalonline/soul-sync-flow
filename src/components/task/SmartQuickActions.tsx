
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
import { useLanguage } from '@/contexts/LanguageContext';

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
  const { t } = useLanguage();
  const quickActions = [
    {
      id: 'break_down',
      icon: <Target className="h-4 w-4" />,
      label: t('quickActions.breakDownLabel'),
      message: t('quickActions.breakDownMessage'),
      color: 'bg-blue-50 hover:bg-blue-100 border-blue-200',
      condition: !hasSubTasks
    },
    {
      id: 'next_step',
      icon: <ArrowRight className="h-4 w-4" />,
      label: t('quickActions.whatsNextLabel'),
      message: t('quickActions.whatsNextMessage'),
      color: 'bg-green-50 hover:bg-green-100 border-green-200',
      condition: true
    },
    {
      id: 'progress_check',
      icon: <BarChart3 className="h-4 w-4" />,
      label: t('quickActions.progressCheckLabel'),
      message: t('quickActions.progressCheckMessage'),
      color: 'bg-purple-50 hover:bg-purple-100 border-purple-200',
      condition: currentProgress > 0
    },
    {
      id: 'add_subtask',
      icon: <Plus className="h-4 w-4" />,
      label: t('quickActions.addSubTaskLabel'),
      message: t('quickActions.addSubTaskMessage'),
      color: 'bg-orange-50 hover:bg-orange-100 border-orange-200',
      condition: hasSubTasks
    },
    {
      id: 'im_stuck',
      icon: <Lightbulb className="h-4 w-4" />,
      label: t('quickActions.imStuckLabel'),
      message: t('quickActions.imStuckMessage'),
      color: 'bg-yellow-50 hover:bg-yellow-100 border-yellow-200',
      condition: true
    },
    {
      id: 'time_check',
      icon: <Clock className="h-4 w-4" />,
      label: t('quickActions.timeManagementLabel'),
      message: t('quickActions.timeManagementMessage'),
      color: 'bg-teal-50 hover:bg-teal-100 border-teal-200',
      condition: true
    },
    {
      id: 'complete_check',
      icon: <CheckCircle className="h-4 w-4" />,
      label: t('quickActions.markCompleteLabel'),
      message: t('quickActions.markCompleteMessage'),
      color: 'bg-emerald-50 hover:bg-emerald-100 border-emerald-200',
      condition: currentProgress >= 80
    }
  ];

  const availableActions = quickActions.filter(action => action.condition);

  return (
    <Card className="p-4">
      <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
        <Target className="h-4 w-4 text-soul-purple" />
        {t('tasks.smartActions')}
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
        {t('tasks.smartActionsDescription')}
      </p>
    </Card>
  );
};

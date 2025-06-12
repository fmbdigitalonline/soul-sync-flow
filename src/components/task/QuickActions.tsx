
import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  HelpCircle, 
  ArrowRight, 
  Coffee, 
  CheckCircle2,
  Lightbulb,
  Timer,
  MessageSquare
} from "lucide-react";

interface QuickActionsProps {
  onAction: (action: string, message: string) => void;
  isLoading: boolean;
}

export const QuickActions: React.FC<QuickActionsProps> = ({ onAction, isLoading }) => {
  const quickActions = [
    {
      id: 'stuck',
      label: 'I\'m stuck',
      icon: HelpCircle,
      message: 'I\'m feeling stuck on this task. Can you help me figure out what\'s blocking me and suggest a way forward?',
      variant: 'outline' as const,
      color: 'text-amber-600'
    },
    {
      id: 'next',
      label: 'Next step',
      icon: ArrowRight,
      message: 'I\'ve completed the current step. What should I focus on next?',
      variant: 'outline' as const,
      color: 'text-blue-600'
    },
    {
      id: 'break',
      label: 'Take a break',
      icon: Coffee,
      message: 'I think I need a break. Can you suggest a good stopping point and how long I should rest?',
      variant: 'outline' as const,
      color: 'text-green-600'
    },
    {
      id: 'complete',
      label: 'Mark done',
      icon: CheckCircle2,
      message: 'I think I\'ve completed this part. Can you help me review what I\'ve accomplished and confirm if it\'s ready?',
      variant: 'outline' as const,
      color: 'text-emerald-600'
    },
    {
      id: 'insight',
      label: 'Share insight',
      icon: Lightbulb,
      message: 'I just had an insight while working on this. Let me share what I discovered and get your thoughts.',
      variant: 'outline' as const,
      color: 'text-purple-600'
    },
    {
      id: 'clarify',
      label: 'Need clarity',
      icon: MessageSquare,
      message: 'I need some clarification on the requirements or approach. Can you help me understand this better?',
      variant: 'outline' as const,
      color: 'text-indigo-600'
    }
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Timer className="h-4 w-4 text-soul-purple" />
        <h4 className="font-medium text-sm">Quick Actions</h4>
        <Badge variant="secondary" className="text-xs">
          Tap for instant help
        </Badge>
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        {quickActions.map(action => (
          <Button
            key={action.id}
            variant={action.variant}
            size="sm"
            onClick={() => onAction(action.id, action.message)}
            disabled={isLoading}
            className="flex items-center gap-2 justify-start text-xs h-auto py-2 px-3"
          >
            <action.icon className={`h-3 w-3 ${action.color}`} />
            <span>{action.label}</span>
          </Button>
        ))}
      </div>

      <div className="text-xs text-muted-foreground text-center">
        These actions help your coach understand where you are in the process
      </div>
    </div>
  );
};

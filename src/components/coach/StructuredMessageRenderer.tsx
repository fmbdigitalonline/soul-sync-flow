
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowRight, 
  Lightbulb, 
  TrendingUp, 
  MessageSquare,
  CheckCircle2,
  Target,
  Play,
  Clock,
  Zap
} from 'lucide-react';
import { ParsedCoachMessage, ParsedSubTask, deriveCoachIntroText } from '@/services/coach-message-parser';
import { TaskBreakdownDisplay } from './TaskBreakdownDisplay';
import { WorkingInstructionsPanel } from './WorkingInstructionsPanel';

interface StructuredMessageRendererProps {
  parsedMessage: ParsedCoachMessage;
  taskId: string; // Add taskId for instruction progress tracking
  onSubTaskStart: (subTask: ParsedSubTask) => void;
  onSubTaskComplete: (subTask: ParsedSubTask) => void;
  onStartTaskPlan: () => void;
  onInstructionComplete?: (instructionId: string) => void;
  onAllInstructionsComplete?: () => void;
  initialCompletedInstructionIds?: string[];
  onInstructionProgressChange?: (completedInstructionIds: string[]) => void;
}

export const StructuredMessageRenderer: React.FC<StructuredMessageRendererProps> = ({
  parsedMessage,
  taskId,
  onSubTaskStart,
  onSubTaskComplete,
  onStartTaskPlan,
  onInstructionComplete,
  onAllInstructionsComplete,
  initialCompletedInstructionIds,
  onInstructionProgressChange
}) => {
  // Render working instructions with interactive checkable cards
  if (parsedMessage.type === 'working_instructions' && parsedMessage.workingInstructions && parsedMessage.workingInstructions.length > 0) {
    return (
      <WorkingInstructionsPanel
        instructions={parsedMessage.workingInstructions}
        taskId={taskId}
        onInstructionComplete={onInstructionComplete || (() => {})}
        onAllInstructionsComplete={onAllInstructionsComplete || (() => {})}
        originalText={parsedMessage.originalText}
        initialCompletedIds={initialCompletedInstructionIds}
        onProgressChange={onInstructionProgressChange}
      />
    );
  }

  // Render task breakdown with enhanced interactive cards
  if (parsedMessage.type === 'breakdown' && parsedMessage.subTasks && parsedMessage.subTasks.length > 0) {
    const introText = deriveCoachIntroText(
      parsedMessage.originalText,
      "Here's your task breakdown with clickable micro-tasks:"
    );

    return (
      <div className="space-y-4">
        {/* Coach's explanation text */}
        <Card className="p-4 bg-slate-50 border-green-200/40">
          <div className="flex items-center gap-2 mb-2">
            <ArrowRight className="h-4 w-4 text-green-400" />
            <span className="text-xs font-medium text-gray-700">Task Coach</span>
          </div>
          <div className="text-sm leading-relaxed text-gray-800">
            {introText}
          </div>
        </Card>
        
        {/* Enhanced interactive task breakdown */}
        <TaskBreakdownDisplay
          subTasks={parsedMessage.subTasks}
          onSubTaskStart={onSubTaskStart}
          onSubTaskComplete={onSubTaskComplete}
          onStartAll={onStartTaskPlan}
          taskTitle="Task Breakdown"
        />
      </div>
    );
  }

  // Render progress update with enhanced feedback
  if (parsedMessage.type === 'progress' && parsedMessage.progressUpdate) {
    return (
      <Card className="p-4 bg-emerald-50 border-emerald-200">
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <span className="text-xs font-medium text-emerald-700">Progress Update</span>
        </div>
        
        {parsedMessage.progressUpdate.percentage && (
          <div className="mb-3">
            <div className="flex justify-between text-xs mb-1">
              <span>Task Progress</span>
              <span className="font-medium">{parsedMessage.progressUpdate.percentage}%</span>
            </div>
            <Progress value={parsedMessage.progressUpdate.percentage} className="h-2" />
          </div>
        )}
        
        <div className="text-sm leading-relaxed text-gray-800">
          {parsedMessage.originalText}
        </div>
      </Card>
    );
  }

  // Render guidance with enhanced action items
  if (parsedMessage.type === 'guidance' && parsedMessage.actionItems && parsedMessage.actionItems.length > 0) {
    const introText = deriveCoachIntroText(
      parsedMessage.originalText,
      "Here's what I recommend next:"
    );

    return (
      <Card className="p-4 bg-blue-50 border-blue-200">
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb className="h-4 w-4 text-blue-600" />
          <span className="text-xs font-medium text-blue-700">Guidance & Recommendations</span>
        </div>

        <div className="text-sm leading-relaxed text-gray-800 mb-3">
          {introText}
        </div>
        
        <div className="space-y-2">
          {parsedMessage.actionItems.map((item, index) => (
            <div key={index} className="flex items-start gap-3 p-3 bg-white rounded-lg border border-blue-100 hover:border-blue-200 transition-colors">
              <Target className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-gray-700 leading-relaxed">{item}</span>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  // Enhanced default rendering for general messages
  return (
    <Card className="p-4 bg-slate-50 border-green-200/40">
      <div className="flex items-center gap-2 mb-2">
        <ArrowRight className="h-4 w-4 text-green-400" />
        <span className="text-xs font-medium text-gray-700">Task Coach</span>
      </div>
      <div className="text-sm leading-relaxed text-gray-800 whitespace-pre-line">
        {parsedMessage.originalText}
      </div>
    </Card>
  );
};

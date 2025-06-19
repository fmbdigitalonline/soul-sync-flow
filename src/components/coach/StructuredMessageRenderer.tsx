
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
  Target
} from 'lucide-react';
import { ParsedCoachMessage, ParsedSubTask } from '@/services/coach-message-parser';
import { TaskBreakdownDisplay } from './TaskBreakdownDisplay';

interface StructuredMessageRendererProps {
  parsedMessage: ParsedCoachMessage;
  onSubTaskStart: (subTask: ParsedSubTask) => void;
  onSubTaskComplete: (subTask: ParsedSubTask) => void;
  onStartTaskPlan: () => void;
}

export const StructuredMessageRenderer: React.FC<StructuredMessageRendererProps> = ({
  parsedMessage,
  onSubTaskStart,
  onSubTaskComplete,
  onStartTaskPlan
}) => {
  // Render task breakdown with interactive cards
  if (parsedMessage.type === 'breakdown' && parsedMessage.subTasks && parsedMessage.subTasks.length > 0) {
    return (
      <div className="space-y-4">
        {/* Coach's explanation text */}
        <Card className="p-4 bg-slate-50 border-green-200/40">
          <div className="flex items-center gap-2 mb-2">
            <ArrowRight className="h-4 w-4 text-green-400" />
            <span className="text-xs font-medium text-gray-700">Soul Coach</span>
          </div>
          <div className="text-sm leading-relaxed text-gray-800">
            {parsedMessage.originalText.split(/\d+\.|Step \d+:/)[0].trim()}
          </div>
        </Card>
        
        {/* Interactive task breakdown */}
        <TaskBreakdownDisplay
          subTasks={parsedMessage.subTasks}
          onSubTaskStart={onSubTaskStart}
          onSubTaskComplete={onSubTaskComplete}
          onStartAll={onStartTaskPlan}
        />
      </div>
    );
  }

  // Render progress update
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

  // Render guidance with action items
  if (parsedMessage.type === 'guidance' && parsedMessage.actionItems && parsedMessage.actionItems.length > 0) {
    return (
      <Card className="p-4 bg-blue-50 border-blue-200">
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb className="h-4 w-4 text-blue-600" />
          <span className="text-xs font-medium text-blue-700">Guidance & Recommendations</span>
        </div>
        
        <div className="text-sm leading-relaxed text-gray-800 mb-3">
          {parsedMessage.originalText.split(/[-•*]|\d+\./)[0].trim()}
        </div>
        
        <div className="space-y-2">
          {parsedMessage.actionItems.map((item, index) => (
            <div key={index} className="flex items-center gap-2 p-2 bg-white rounded-lg border border-blue-100">
              <Target className="h-3 w-3 text-blue-500 flex-shrink-0" />
              <span className="text-xs text-gray-700">{item}</span>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  // Default rendering for general messages
  return (
    <Card className="p-4 bg-slate-50 border-green-200/40">
      <div className="flex items-center gap-2 mb-2">
        <ArrowRight className="h-4 w-4 text-green-400" />
        <span className="text-xs font-medium text-gray-700">Soul Coach</span>
      </div>
      <div className="text-sm leading-relaxed text-gray-800 whitespace-pre-line">
        {parsedMessage.originalText}
      </div>
    </Card>
  );
};


import React from 'react';
import { CoachMessageParser, ParsedCoachMessage, ParsedSubTask } from '@/services/coach-message-parser';
import { StructuredMessageRenderer } from '@/components/coach/StructuredMessageRenderer';
import { Card } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';

interface TaskCoachMessageRendererProps {
  content: string;
  isUser: boolean;
  onSubTaskStart: (subTask: ParsedSubTask) => void;
  onSubTaskComplete: (subTask: ParsedSubTask) => void;
  onStartTaskPlan: () => void;
}

export const TaskCoachMessageRenderer: React.FC<TaskCoachMessageRendererProps> = ({
  content,
  isUser,
  onSubTaskStart,
  onSubTaskComplete,
  onStartTaskPlan
}) => {
  // User messages - render as simple cards
  if (isUser) {
    return (
      <div className="w-full mx-auto max-w-2xl md:max-w-3xl rounded-2xl border bg-green-600 text-white text-base px-5 py-4 my-2">
        <div className="flex items-center gap-2 mb-1">
          <ArrowRight className="h-4 w-4 text-white" />
          <span className="text-xs font-medium">You</span>
        </div>
        <div className="text-base leading-relaxed whitespace-pre-line">
          {content}
        </div>
      </div>
    );
  }

  // Parse assistant messages for structure
  const parsedMessage: ParsedCoachMessage = CoachMessageParser.parseMessage(content);
  
  // Check if this is a structured message that should use the enhanced renderer
  if (parsedMessage.type === 'breakdown' || parsedMessage.type === 'guidance' || parsedMessage.type === 'progress') {
    return (
      <div className="w-full mx-auto max-w-2xl md:max-w-3xl my-2">
        <StructuredMessageRenderer
          parsedMessage={parsedMessage}
          onSubTaskStart={onSubTaskStart}
          onSubTaskComplete={onSubTaskComplete}
          onStartTaskPlan={onStartTaskPlan}
        />
      </div>
    );
  }

  // Default rendering for regular coach messages
  return (
    <div className="w-full mx-auto max-w-2xl md:max-w-3xl rounded-2xl border bg-slate-50 border-green-200/40 text-gray-900 px-5 py-4 my-2">
      <div className="flex items-center gap-2 mb-1">
        <ArrowRight className="h-4 w-4 text-green-400" />
        <span className="text-xs font-medium">Task Coach</span>
      </div>
      <div className="text-base leading-relaxed whitespace-pre-line">
        {content}
      </div>
    </div>
  );
};

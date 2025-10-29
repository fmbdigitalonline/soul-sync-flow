
import React, { useMemo } from 'react';
import { CoachMessageParser, ParsedCoachMessage, ParsedSubTask } from '@/services/coach-message-parser';
import { StructuredMessageRenderer } from '@/components/coach/StructuredMessageRenderer';
import { Card } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';

interface TaskCoachMessageRendererProps {
  content: string;
  isUser: boolean;
  taskId: string; // Add taskId for instruction progress tracking
  onSubTaskStart: (subTask: ParsedSubTask) => void;
  onSubTaskComplete: (subTask: ParsedSubTask) => void;
  onStartTaskPlan: () => void;
  onInstructionComplete?: (instructionId: string) => void;
  onAllInstructionsComplete?: () => void;
  initialCompletedInstructionIds?: string[];
  onInstructionProgressChange?: (completedInstructionIds: string[]) => void;
}

export const TaskCoachMessageRenderer: React.FC<TaskCoachMessageRendererProps> = ({
  content,
  isUser,
  taskId,
  onSubTaskStart,
  onSubTaskComplete,
  onStartTaskPlan,
  onInstructionComplete,
  onAllInstructionsComplete,
  initialCompletedInstructionIds,
  onInstructionProgressChange
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

  // Memoize parsing to prevent re-computation
  const parsedMessage: ParsedCoachMessage = useMemo(() => {
    console.log('🔍 TaskCoachMessageRenderer: Parsing message content:', content.substring(0, 100));
    const result = CoachMessageParser.parseMessage(content);
    console.log('🔍 TaskCoachMessageRenderer: Parsed message type:', result.type);
    
    // PHASE 4: Debug logging
    if (result.type === 'working_instructions') {
      console.log('✅ TaskCoachMessageRenderer: Working instructions detected!', {
        instructionCount: result.workingInstructions?.length || 0,
        instructions: result.workingInstructions?.map(i => i.title) || []
      });
    } else {
      console.log('❌ TaskCoachMessageRenderer: Not working instructions, type:', result.type);
    }
    
    return result;
  }, [content]);
  
  // Check if this is a structured message that should use the enhanced renderer
  if (parsedMessage.type === 'working_instructions' && parsedMessage.workingInstructions && parsedMessage.workingInstructions.length > 0) {
    console.log('🎯 TaskCoachMessageRenderer: Rendering working instructions panel');
    return (
      <div className="w-full mx-auto max-w-2xl md:max-w-3xl my-2">
        <StructuredMessageRenderer
          parsedMessage={parsedMessage}
          taskId={taskId}
          onSubTaskStart={onSubTaskStart}
          onSubTaskComplete={onSubTaskComplete}
          onStartTaskPlan={onStartTaskPlan}
          onInstructionComplete={onInstructionComplete}
          onAllInstructionsComplete={onAllInstructionsComplete}
          initialCompletedInstructionIds={initialCompletedInstructionIds}
          onInstructionProgressChange={onInstructionProgressChange}
        />
      </div>
    );
  }

  if (parsedMessage.type === 'breakdown' && parsedMessage.subTasks && parsedMessage.subTasks.length > 0) {
    return (
      <div className="w-full mx-auto max-w-2xl md:max-w-3xl my-2">
        <StructuredMessageRenderer
          parsedMessage={parsedMessage}
          taskId={taskId}
          onSubTaskStart={onSubTaskStart}
          onSubTaskComplete={onSubTaskComplete}
          onStartTaskPlan={onStartTaskPlan}
          onInstructionComplete={onInstructionComplete}
          onAllInstructionsComplete={onAllInstructionsComplete}
          initialCompletedInstructionIds={initialCompletedInstructionIds}
          onInstructionProgressChange={onInstructionProgressChange}
        />
      </div>
    );
  }

  if (parsedMessage.type === 'guidance' || parsedMessage.type === 'progress') {
    return (
      <div className="w-full mx-auto max-w-2xl md:max-w-3xl my-2">
        <StructuredMessageRenderer
          parsedMessage={parsedMessage}
          taskId={taskId}
          onSubTaskStart={onSubTaskStart}
          onSubTaskComplete={onSubTaskComplete}
          onStartTaskPlan={onStartTaskPlan}
          onInstructionComplete={onInstructionComplete}
          onAllInstructionsComplete={onAllInstructionsComplete}
          initialCompletedInstructionIds={initialCompletedInstructionIds}
          onInstructionProgressChange={onInstructionProgressChange}
        />
      </div>
    );
  }

  // Default rendering for regular coach messages
  console.log('🔍 TaskCoachMessageRenderer: Using default rendering for message type:', parsedMessage.type);
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

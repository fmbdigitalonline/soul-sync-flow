import React, { useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  Wrench, 
  ArrowRight, 
  Trophy,
  Target
} from 'lucide-react';
import { WorkingInstruction } from '@/services/coach-message-parser';
import { AssistanceButton } from '@/components/ui/assistance-button';
import { HelpPanel } from '@/components/ui/help-panel';
import { interactiveAssistanceService, AssistanceResponse } from '@/services/interactive-assistance-service';

interface WorkingInstructionsPanelProps {
  instructions: WorkingInstruction[];
  onInstructionComplete: (instructionId: string) => void;
  onAllInstructionsComplete: () => void;
  originalText: string;
}

export const WorkingInstructionsPanel: React.FC<WorkingInstructionsPanelProps> = ({
  instructions,
  onInstructionComplete,
  onAllInstructionsComplete,
  originalText
}) => {
  const [completedInstructions, setCompletedInstructions] = useState<Set<string>>(new Set());
  const [assistanceResponses, setAssistanceResponses] = useState<Map<string, AssistanceResponse>>(new Map());
  const [isRequestingHelp, setIsRequestingHelp] = useState<Map<string, boolean>>(new Map());

  const handleInstructionToggle = useCallback((instructionId: string) => {
    const newCompleted = new Set(completedInstructions);
    
    if (newCompleted.has(instructionId)) {
      newCompleted.delete(instructionId);
    } else {
      newCompleted.add(instructionId);
      onInstructionComplete(instructionId);
    }
    
    setCompletedInstructions(newCompleted);
  }, [completedInstructions, onInstructionComplete]);

  const handleAssistanceRequest = useCallback(async (
    instructionId: string,
    instructionTitle: string,
    type: 'stuck' | 'need_details' | 'how_to' | 'examples',
    message?: string
  ) => {
    setIsRequestingHelp(prev => new Map(prev).set(instructionId, true));
    
    try {
      const instruction = instructions.find(i => i.id === instructionId);
      const response = await interactiveAssistanceService.requestAssistance(
        instructionId,
        instructionTitle,
        type,
        { 
          instruction,
          description: instruction?.description,
          timeEstimate: instruction?.timeEstimate,
          toolsNeeded: instruction?.toolsNeeded
        },
        message
      );
      
      setAssistanceResponses(prev => new Map(prev).set(instructionId, response));
    } catch (error) {
      console.error('Failed to get assistance:', error);
    } finally {
      setIsRequestingHelp(prev => {
        const updated = new Map(prev);
        updated.delete(instructionId);
        return updated;
      });
    }
  }, [instructions]);

  const completedCount = completedInstructions.size;
  const totalCount = instructions.length;
  const progressPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const isAllComplete = completedCount === totalCount && totalCount > 0;

  // Extract introduction text from original message
  const introText = originalText.split(/^\d+\.\s*\*\*/m)[0].trim() || 
    "Here are your detailed working instructions:";

  return (
    <div className="space-y-4">
      {/* Header with introduction */}
      <Card className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <div className="flex items-center gap-2 mb-2">
          <Target className="h-4 w-4 text-blue-600" />
          <span className="text-xs font-medium text-blue-700">Working Instructions</span>
        </div>
        <p className="text-sm text-gray-700 leading-relaxed mb-3">
          {introText}
        </p>
        
        {/* Progress tracking */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-600">Progress</span>
            <span className="font-medium text-gray-800">{completedCount}/{totalCount} completed</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>
      </Card>

      {/* Instruction cards */}
      <div className="space-y-3">
        {instructions.map((instruction, index) => {
          const isCompleted = completedInstructions.has(instruction.id);
          
          return (
            <Card 
              key={instruction.id} 
              className={`p-4 transition-all duration-200 ${
                isCompleted 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-sm'
              }`}
            >
              <div className="flex items-start gap-3">
                <button
                  onClick={() => handleInstructionToggle(instruction.id)}
                  className="mt-1 flex-shrink-0 transition-colors"
                >
                  {isCompleted ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : (
                    <Circle className="h-5 w-5 text-gray-400 hover:text-blue-500" />
                  )}
                </button>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-medium text-white">{index + 1}</span>
                    </div>
                    <h4 className={`font-medium text-sm ${
                      isCompleted 
                        ? 'line-through text-gray-500' 
                        : 'text-gray-800'
                    }`}>
                      {instruction.title}
                    </h4>
                  </div>
                  
                  <p className={`text-xs leading-relaxed mb-3 ${
                    isCompleted 
                      ? 'text-gray-500' 
                      : 'text-gray-600'
                  }`}>
                    {instruction.description}
                  </p>
                  
                  {/* Meta information and assistance buttons */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {instruction.timeEstimate && (
                      <Badge variant="outline" className="text-xs">
                        <Clock className="h-3 w-3 mr-1" />
                        {instruction.timeEstimate}
                      </Badge>
                    )}
                    
                    {instruction.toolsNeeded && instruction.toolsNeeded.length > 0 && (
                      <Badge variant="outline" className="text-xs">
                        <Wrench className="h-3 w-3 mr-1" />
                        {instruction.toolsNeeded.join(', ')}
                      </Badge>
                    )}
                    
                    {/* Assistance Buttons - only show for incomplete instructions */}
                    {!isCompleted && (
                      <>
                        <AssistanceButton
                          type="stuck"
                          onRequest={(type, msg) => handleAssistanceRequest(instruction.id, instruction.title, type, msg)}
                          isLoading={isRequestingHelp.get(instruction.id) || false}
                          hasResponse={assistanceResponses.has(instruction.id)}
                          compact={true}
                        />
                        <AssistanceButton
                          type="need_details"
                          onRequest={(type, msg) => handleAssistanceRequest(instruction.id, instruction.title, type, msg)}
                          isLoading={isRequestingHelp.get(instruction.id) || false}
                          hasResponse={assistanceResponses.has(instruction.id)}
                          compact={true}
                        />
                        <AssistanceButton
                          type="how_to"
                          onRequest={(type, msg) => handleAssistanceRequest(instruction.id, instruction.title, type, msg)}
                          isLoading={isRequestingHelp.get(instruction.id) || false}
                          hasResponse={assistanceResponses.has(instruction.id)}
                          compact={true}
                        />
                        <AssistanceButton
                          type="examples"
                          onRequest={(type, msg) => handleAssistanceRequest(instruction.id, instruction.title, type, msg)}
                          isLoading={isRequestingHelp.get(instruction.id) || false}
                          hasResponse={assistanceResponses.has(instruction.id)}
                          compact={true}
                        />
                      </>
                    )}
                  </div>
                  
                  {/* Help Panel for this instruction */}
                  {assistanceResponses.has(instruction.id) && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <HelpPanel
                        response={assistanceResponses.get(instruction.id)!}
                        onActionClick={(action) => {
                          if (action === 'need_more_help') {
                            handleAssistanceRequest(
                              instruction.id, 
                              instruction.title, 
                              'stuck', 
                              'I need more specific help with this step'
                            );
                          }
                        }}
                        compact={true}
                      />
                    </div>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Completion action */}
      {isAllComplete && (
        <Card className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-green-600" />
              <div>
                <h4 className="font-medium text-sm text-green-800">
                  All instructions completed!
                </h4>
                <p className="text-xs text-green-600">
                  Great work! You've finished all the working instructions.
                </p>
              </div>
            </div>
            <Button
              onClick={onAllInstructionsComplete}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 text-sm"
            >
              <ArrowRight className="h-4 w-4 mr-1" />
              Mark Task Complete
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};
import React, { useState, useCallback, useMemo } from 'react';
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
  Target,
  History,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { WorkingInstruction, deriveCoachIntroText } from '@/services/coach-message-parser';
import { AssistanceButton } from '@/components/ui/assistance-button';
import { HelpPanel } from '@/components/ui/help-panel';
import { interactiveAssistanceService, AssistanceResponse } from '@/services/interactive-assistance-service';
import { useInstructionProgress } from '@/hooks/use-instruction-progress';
import { hermeticIntelligenceService } from '@/services/hermetic-intelligence-service';
import type { HermeticStructuredIntelligence } from '@/types/hermetic-intelligence';
import { supabase } from '@/integrations/supabase/client';
import { workingInstructionsPersistenceService } from '@/services/working-instructions-persistence-service';

interface WorkingInstructionsPanelProps {
  instructions: WorkingInstruction[];
  taskId: string;
  onInstructionComplete: (instructionId: string) => void;
  onAllInstructionsComplete: () => void;
  originalText: string;
  initialSource?: 'live' | 'stored';
}

export const WorkingInstructionsPanel: React.FC<WorkingInstructionsPanelProps> = ({
  instructions,
  taskId,
  onInstructionComplete,
  onAllInstructionsComplete,
  originalText,
  initialSource = 'live'
}) => {
  const [displayInstructions, setDisplayInstructions] = useState<WorkingInstruction[]>(instructions);
  const [isLoadingStoredInstructions, setIsLoadingStoredInstructions] = useState(false);
  const [storedInstructionsError, setStoredInstructionsError] = useState<string | null>(null);
  // Use database-backed instruction progress (Principle #2: No Hardcoded Data)
  const {
    completedInstructions,
    isLoading: isLoadingProgress,
    error: progressError,
    toggleInstruction 
  } = useInstructionProgress(taskId);
  
  const [assistanceResponses, setAssistanceResponses] = useState<Map<string, AssistanceResponse>>(new Map());
  const [isRequestingHelp, setIsRequestingHelp] = useState<Map<string, boolean>>(new Map());
  const [hermeticIntelligence, setHermeticIntelligence] = useState<HermeticStructuredIntelligence | null>(null);

  React.useEffect(() => {
    if (instructions.length > 0) {
      setDisplayInstructions(instructions);
    }
  }, [instructions]);

  React.useEffect(() => {
    if (instructions.length > 0) {
      return;
    }

    let isMounted = true;

    const loadStoredInstructions = async () => {
      setIsLoadingStoredInstructions(true);
      setStoredInstructionsError(null);

      try {
        const stored = await workingInstructionsPersistenceService.loadWorkingInstructions(taskId);

        if (!isMounted) return;

        if (stored.length > 0) {
          setDisplayInstructions(stored);
        }
      } catch (error) {
        console.error('❌ WORKING INSTRUCTIONS: Failed to load stored instructions', error);
        if (!isMounted) return;

        setStoredInstructionsError(
          'We couldn\'t load your saved instructions. Ask your coach for a new set to keep working.'
        );
      } finally {
        if (isMounted) {
          setIsLoadingStoredInstructions(false);
        }
      }
    };

    loadStoredInstructions();

    return () => {
      isMounted = false;
    };
  }, [taskId, instructions.length]);

  // Fetch Hermetic Intelligence and persist instructions on mount
  React.useEffect(() => {
    if (isStoredSource) {
      return;
    }

    const initialize = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch Hermetic Intelligence
      console.log('🧠 WORKING INSTRUCTIONS: Fetching Hermetic Intelligence...');
      const result = await hermeticIntelligenceService.getStructuredIntelligence(user.id);
      
      if (result.success && result.intelligence) {
        console.log('✅ WORKING INSTRUCTIONS: Hermetic Intelligence loaded', {
          dimensions: Object.keys(result.intelligence).length,
          confidence: result.intelligence.extraction_confidence
        });
        setHermeticIntelligence(result.intelligence);
      } else {
        console.log('⚠️ WORKING INSTRUCTIONS: No Hermetic Intelligence found');
      }

      // Persist instructions to database if they don't exist
      try {
        const hasStored = await workingInstructionsPersistenceService.hasStoredInstructions(taskId);
        if (!hasStored && instructions.length > 0) {
          console.log('💾 WORKING INSTRUCTIONS: Persisting instructions to database...');
          await workingInstructionsPersistenceService.saveWorkingInstructions(taskId, instructions);
          console.log('✅ WORKING INSTRUCTIONS: Instructions saved');
        }
      } catch (error) {
        console.error('❌ WORKING INSTRUCTIONS: Failed to persist instructions', error);
        // Don't block UI on persistence errors - Principle #7: Transparent errors
      }
    };

    initialize();
  }, [taskId, instructions, isStoredSource]);

  const handleInstructionToggle = useCallback(async (instructionId: string) => {
    await toggleInstruction(instructionId);
    
    // Trigger parent callback for legacy compatibility
    if (!completedInstructions.has(instructionId)) {
      onInstructionComplete(instructionId);
    }
  }, [toggleInstruction, completedInstructions, onInstructionComplete]);

  const handleAssistanceRequest = useCallback(async (
    instructionId: string,
    instructionTitle: string,
    type: 'stuck' | 'need_details' | 'how_to' | 'examples',
    message?: string
  ) => {
    setIsRequestingHelp(prev => new Map(prev).set(instructionId, true));

    try {
      const instruction = displayInstructions.find(i => i.id === instructionId);
      
      console.log('🔍 WORKING INSTRUCTIONS: Requesting assistance', {
        instructionId,
        instructionTitle,
        type,
        hasHermeticIntelligence: !!hermeticIntelligence
      });

      const response = await interactiveAssistanceService.requestAssistance(
        instructionId,
        instructionTitle,
        type,
        { 
          instruction,
          description: instruction?.description,
          timeEstimate: instruction?.timeEstimate,
          toolsNeeded: instruction?.toolsNeeded,
          hermeticIntelligence // Pass Hermetic Intelligence for personalization
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
  }, [displayInstructions, hermeticIntelligence]);

  const completedCount = completedInstructions.size;
  const totalCount = displayInstructions.length;
  const progressPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const isAllComplete = completedCount === totalCount && totalCount > 0;
  const isUsingStoredInstructions = instructions.length === 0 && displayInstructions.length > 0;

  // Extract introduction text from original message
  const introText = useMemo(() => (
    originalText && originalText.trim().length > 0
      ? deriveCoachIntroText(
          originalText,
          "Here's the plan I put together to keep you moving."
        )
      : isUsingStoredInstructions
        ? 'Welcome back! Here are the working instructions you were following last time.'
        : "Here's the plan I put together to keep you moving."
  ), [originalText, isUsingStoredInstructions]);

  const showLoadingState = isLoadingProgress || (isLoadingStoredInstructions && displayInstructions.length === 0);

  // Principle #7: Build Transparently - show loading states
  if (showLoadingState) {
    return (
      <Card className="p-8 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-blue-600" />
        <p className="text-sm text-gray-600">Loading your progress...</p>
      </Card>
    );
  }

  // Principle #3: No Fallbacks That Mask Errors - surface issues
  if (progressError) {
    return (
      <Card className="p-6 border-red-200 bg-red-50">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-red-900 mb-1">Failed to load progress</h4>
            <p className="text-sm text-red-700">{progressError}</p>
            <p className="text-xs text-red-600 mt-2">Your progress will not be saved. Please refresh or sign in.</p>
          </div>
        </div>
      </Card>
    );
  }

  if (displayInstructions.length === 0) {
    return (
      <Card className="p-6 text-center border-dashed border-blue-200 bg-blue-50/60">
        <AlertCircle className="h-8 w-8 text-blue-500 mx-auto mb-3" />
        <h4 className="font-semibold text-gray-800 mb-1">
          {storedInstructionsError ? 'Unable to load saved instructions' : 'No working instructions yet'}
        </h4>
        <p className="text-sm text-gray-600">
          {storedInstructionsError
            ? storedInstructionsError
            : 'Ask your coach for a step-by-step plan and the instructions will appear here for you to check off.'}
        </p>
      </Card>
    );
  }

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

        {isUsingStoredInstructions && (
          <div className="flex items-center gap-2 text-xs text-blue-800 bg-blue-100 border border-blue-200 rounded-md px-3 py-2 mb-3">
            <History className="h-4 w-4 text-blue-600" />
            <span>These steps were restored from your last session. Continue checking them off to keep your progress up to date.</span>
          </div>
        )}

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
        {displayInstructions.map((instruction, index) => {
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
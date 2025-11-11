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
import { useToast } from '@/hooks/use-toast';
import {
  buildAggregatedAssistanceContext,
  normalizeAssistanceResponses
} from '@/utils/assistance-response-utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { safeInterpolateTranslation } from '@/utils/translation-utils';

interface WorkingInstructionsPanelProps {
  instructions: WorkingInstruction[];
  goalId: string;
  taskId: string;
  onInstructionComplete: (instructionId: string) => void;
  onAllInstructionsComplete: () => void;
  originalText: string;
  initialCompletedIds?: string[];
  onProgressChange?: (completedInstructionIds: string[]) => void;
}

export const WorkingInstructionsPanel: React.FC<WorkingInstructionsPanelProps> = ({
  instructions,
  goalId,
  taskId,
  onInstructionComplete,
  onAllInstructionsComplete,
  originalText,
  initialCompletedIds = [],
  onProgressChange
}) => {
  // Use database-backed instruction progress (Principle #2: No Hardcoded Data)
  const {
    completedInstructions,
    isLoading: isLoadingProgress,
    error: progressError,
    toggleInstruction
  } = useInstructionProgress(goalId, taskId, initialCompletedIds);
  
  const { toast } = useToast();
  const { t } = useLanguage();

  const [assistanceResponses, setAssistanceResponses] = useState<Map<string, AssistanceResponse[]>>(new Map());
  const [isRequestingHelp, setIsRequestingHelp] = useState<Map<string, boolean>>(new Map());
  const [hermeticIntelligence, setHermeticIntelligence] = useState<HermeticStructuredIntelligence | null>(null);

  // Fetch Hermetic Intelligence and persist instructions on mount
  React.useEffect(() => {
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
        // ADD DEFENSIVE LOGGING - Track task ID flow
        console.log('💾 WorkingInstructionsPanel: About to persist instructions', {
          goalId,
          taskId,
          instructionCount: instructions.length,
          firstInstructionTitle: instructions[0]?.title,
          instructionIds: instructions.map(i => i.id)
        });

        const hasStored = await workingInstructionsPersistenceService.hasStoredInstructions(goalId, taskId);
        if (!hasStored && instructions.length > 0) {
          console.log('💾 Saving working instructions:', { goalId, taskId, count: instructions.length });
          await workingInstructionsPersistenceService.saveWorkingInstructions(goalId, taskId, instructions);
          console.log('✅ Instructions saved successfully');
        } else {
          console.log('ℹ️ Instructions already exist or none to save', { hasStored, instructionCount: instructions.length });
        }
      } catch (error) {
        console.error('❌ Failed to persist instructions', { goalId, taskId, error });
        // Don't block UI on persistence errors - Principle #7: Transparent errors
      }
    };

    initialize();
  }, [goalId, taskId, instructions]);

  const handleInstructionToggle = useCallback(async (instructionId: string) => {
    await toggleInstruction(instructionId);
    
    // Trigger parent callback for legacy compatibility
    if (!completedInstructions.has(instructionId)) {
      onInstructionComplete(instructionId);
    }
  }, [toggleInstruction, completedInstructions, onInstructionComplete]);

  const { language } = useLanguage();

  const handleAssistanceRequest = useCallback(async (
    instructionId: string,
    instructionTitle: string,
    type: 'stuck' | 'need_details' | 'how_to' | 'examples',
    message?: string
  ) => {
    setIsRequestingHelp(prev => new Map(prev).set(instructionId, true));

    try {
      const instruction = instructions.find(i => i.id === instructionId);
      const existingResponses = assistanceResponses.get(instructionId) ?? [];
      const normalizedExisting = normalizeAssistanceResponses(existingResponses);
      const previousHelp = buildAggregatedAssistanceContext(normalizedExisting);

      console.log('🔍 WORKING INSTRUCTIONS: Requesting assistance', {
        instructionId,
        instructionTitle,
        type,
        hasHermeticIntelligence: !!hermeticIntelligence,
        hasPreviousHelp: !!previousHelp,
        language
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
        message,
        previousHelp,
        language
      );

      const responseWithMeta: AssistanceResponse = {
        ...response,
        isFollowUp: normalizedExisting.length > 0,
        followUpDepth: normalizedExisting.length + 1
      };

      const aggregatedContext = buildAggregatedAssistanceContext([
        ...normalizedExisting,
        responseWithMeta
      ]);

      const responseWithContext: AssistanceResponse = {
        ...responseWithMeta,
        previousHelpContext: aggregatedContext
      };

      setAssistanceResponses(prev => {
        const updated = new Map(prev);
        updated.set(instructionId, [...normalizedExisting, responseWithContext]);
        return updated;
      });

      toast({
        title: normalizedExisting.length === 0
          ? 'Help guidance loaded'
          : `Follow-up help #${responseWithMeta.followUpDepth} loaded`,
        description: normalizedExisting.length === 0
          ? 'Guidance is now available for this instruction.'
          : 'New follow-up help has been added below the previous guidance.'
      });
    } catch (error) {
      console.error('Failed to get assistance:', error);
    } finally {
      setIsRequestingHelp(prev => {
        const updated = new Map(prev);
        updated.delete(instructionId);
        return updated;
      });
    }
  }, [instructions, hermeticIntelligence, assistanceResponses, toast, language]);

  const handleClearAssistance = useCallback((instructionId: string) => {
    if (!(assistanceResponses.get(instructionId)?.length)) {
      return;
    }

    setAssistanceResponses(prev => {
      const updated = new Map(prev);
      updated.delete(instructionId);
      return updated;
    });

    setIsRequestingHelp(prev => {
      const updated = new Map(prev);
      updated.delete(instructionId);
      return updated;
    });

    toast({
      title: 'Help cleared',
      description: 'All help guidance has been removed for this instruction.'
    });
  }, [assistanceResponses, toast]);

  React.useEffect(() => {
    if (onProgressChange) {
      onProgressChange(Array.from(completedInstructions));
    }
  }, [completedInstructions, onProgressChange]);

  const completedCount = completedInstructions.size;
  const totalCount = instructions.length;
  const progressPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const isAllComplete = completedCount === totalCount && totalCount > 0;

  // Extract introduction text from original message
  const introText = useMemo(() => (
    deriveCoachIntroText(
      originalText,
      "Here's the plan I put together to keep you moving."
    )
  ), [originalText]);

  // Principle #7: Build Transparently - show loading states
  if (isLoadingProgress) {
    return (
      <Card className="p-8 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-blue-600" />
        <p className="text-sm text-gray-600">{t('coach.loadingProgress')}</p>
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
            <h4 className="font-medium text-red-900 mb-1">{t('coach.loadProgressErrorTitle')}</h4>
            <p className="text-sm text-red-700">{progressError}</p>
            <p className="text-xs text-red-600 mt-2">{t('coach.loadProgressErrorDescription')}</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with introduction */}
      <Card className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <div className="flex items-center gap-2 mb-2">
          <Target className="h-4 w-4 text-blue-600" />
          <span className="text-xs font-medium text-blue-700">{t('coach.workingInstructions')}</span>
        </div>
        <p className="text-sm text-gray-700 leading-relaxed mb-3">
          {introText}
        </p>
        
        {/* Progress tracking */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-600">{t('coach.progress')}</span>
            <span className="font-medium text-gray-800">
              {safeInterpolateTranslation(t('coach.completedCount'), {
                completedCount: completedCount.toString(),
                totalCount: totalCount.toString()
              })}
            </span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>
      </Card>

      {/* Instruction cards */}
      <div className="space-y-3">
        {instructions.map((instruction, index) => {
          const isCompleted = completedInstructions.has(instruction.id);
          const responses = assistanceResponses.get(instruction.id) ?? [];
          const isHelpLoading = isRequestingHelp.get(instruction.id) || false;
          
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
                          isLoading={isHelpLoading}
                          hasResponse={responses.length > 0}
                          compact={true}
                        />
                        <AssistanceButton
                          type="need_details"
                          onRequest={(type, msg) => handleAssistanceRequest(instruction.id, instruction.title, type, msg)}
                          isLoading={isHelpLoading}
                          hasResponse={responses.length > 0}
                          compact={true}
                        />
                        <AssistanceButton
                          type="how_to"
                          onRequest={(type, msg) => handleAssistanceRequest(instruction.id, instruction.title, type, msg)}
                          isLoading={isHelpLoading}
                          hasResponse={responses.length > 0}
                          compact={true}
                        />
                        <AssistanceButton
                          type="examples"
                          onRequest={(type, msg) => handleAssistanceRequest(instruction.id, instruction.title, type, msg)}
                          isLoading={isHelpLoading}
                          hasResponse={responses.length > 0}
                          compact={true}
                        />
                      </>
                    )}
                  </div>

                  {(responses.length > 0 || isHelpLoading) && (
                    <div className="mt-3 pt-3 border-t border-gray-100 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                          Help history
                        </span>
                        {responses.length > 0 && (
                          <Button
                            onClick={() => handleClearAssistance(instruction.id)}
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-xs text-blue-600 hover:text-blue-700"
                          >
                            Clear all help
                          </Button>
                        )}
                      </div>

                      <div className="space-y-3">
                        {responses.map((response, responseIndex) => (
                          <HelpPanel
                            key={response.id ?? `${instruction.id}-response-${responseIndex}`}
                            response={response}
                            onAssistanceRequest={(type, customMessage) => {
                              const contextMessage = customMessage ||
                                (response.content
                                  ? `I need more help understanding: "${response.content}"`
                                  : undefined);

                              handleAssistanceRequest(
                                instruction.id,
                                instruction.title,
                                type,
                                contextMessage
                              );
                            }}
                            compact={true}
                            isLoading={isHelpLoading && responseIndex === responses.length - 1}
                          />
                        ))}

                        {isHelpLoading && responses.length === 0 && (
                          <div className="flex items-center text-xs text-blue-600">
                            <Loader2 className="h-3 w-3 animate-spin mr-2" />
                            Loading help guidance...
                          </div>
                        )}
                      </div>
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
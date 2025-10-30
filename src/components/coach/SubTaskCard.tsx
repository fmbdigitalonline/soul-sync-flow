
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AssistanceButton } from '@/components/ui/assistance-button';
import { HelpPanel } from '@/components/ui/help-panel';
import {
  CheckCircle2,
  Circle,
  Play,
  Clock,
  Zap
} from 'lucide-react';
import { ParsedSubTask } from '@/services/coach-message-parser';
import { interactiveAssistanceService, AssistanceResponse } from '@/services/interactive-assistance-service';

interface SubTaskCardProps {
  subTask: ParsedSubTask;
  onStart: (subTask: ParsedSubTask) => void;
  onToggleComplete: (subTask: ParsedSubTask) => void;
  compact?: boolean;
}

const formatPreviousHelpContext = (response?: AssistanceResponse): string | undefined => {
  if (!response) {
    return undefined;
  }

  const sections: string[] = [];

  if (response.content) {
    sections.push(response.content);
  }

  if (response.actionableSteps?.length) {
    const steps = response.actionableSteps
      .map((step, index) => `${index + 1}. ${step}`)
      .join('\n');
    sections.push(`Actionable steps:\n${steps}`);
  }

  if (response.toolsNeeded?.length) {
    sections.push(`Tools suggested: ${response.toolsNeeded.join(', ')}`);
  }

  if (response.successCriteria?.length) {
    const criteria = response.successCriteria
      .map((item, index) => `${index + 1}. ${item}`)
      .join('\n');
    sections.push(`Success criteria:\n${criteria}`);
  }

  if (response.timeEstimate) {
    sections.push(`Estimated time: ${response.timeEstimate}`);
  }

  return sections.join('\n\n');
};

export const SubTaskCard: React.FC<SubTaskCardProps> = ({
  subTask,
  onStart,
  onToggleComplete,
  compact = false
}) => {
  const [assistanceResponse, setAssistanceResponse] = useState<AssistanceResponse | null>(null);
  const [isRequestingHelp, setIsRequestingHelp] = useState(false);
  const handleAssistanceRequest = async (
    type: 'stuck' | 'need_details' | 'how_to' | 'examples',
    message?: string
  ) => {
    setIsRequestingHelp(true);
    try {
      const previousHelp = formatPreviousHelpContext(assistanceResponse || undefined);

      const response = await interactiveAssistanceService.requestAssistance(
        subTask.id,
        subTask.title,
        type,
        { subTask, compact },
        message,
        previousHelp
      );
      const previousContext = previousHelp;
      const currentSummary = summarizeAssistanceResponse(response);
      const aggregatedContext = previousContext
        ? `${previousContext}\n\n---\n\n${currentSummary}`
        : currentSummary;

      const enrichedResponse: AssistanceResponse = {
        ...response,
        isFollowUp: !!assistanceResponse,
        followUpDepth: assistanceResponse ? (assistanceResponse.followUpDepth ?? 0) + 1 : 0,
        previousHelpContext: aggregatedContext
      };

      setAssistanceResponse(enrichedResponse);
    } catch (error) {
      console.error('Failed to get assistance:', error);
    } finally {
      setIsRequestingHelp(false);
    }
  };

  const getEnergyColor = (energy?: string) => {
    switch (energy) {
      case 'low': return 'bg-green-100 text-green-700 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'high': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="space-y-3">
      <Card className={`transition-colors duration-300 hover:bg-accent/30 ${
        subTask.completed 
          ? 'bg-emerald-50 border-emerald-200' 
          : 'bg-white border-gray-200 hover:border-soul-purple/30'
      } ${compact ? 'p-3' : 'p-4'}`}>
        <div className="flex items-start gap-3">
          <button
            onClick={() => onToggleComplete(subTask)}
            className="mt-1 flex-shrink-0 transition-colors"
          >
            {subTask.completed ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            ) : (
              <Circle className="h-5 w-5 text-gray-400 hover:text-soul-purple" />
            )}
          </button>
          
          <div className="flex-1 min-w-0">
            <h4 className={`font-medium text-sm leading-tight ${
              subTask.completed 
                ? 'line-through text-gray-500' 
                : 'text-gray-800'
            }`}>
              {subTask.title}
            </h4>
            
            {subTask.description && !compact && (
              <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                {subTask.description}
              </p>
            )}
            
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              {subTask.estimatedTime && (
                <Badge variant="outline" className="text-xs">
                  <Clock className="h-3 w-3 mr-1" />
                  {subTask.estimatedTime}
                </Badge>
              )}
              
              {subTask.energyLevel && (
                <Badge variant="outline" className={`text-xs ${getEnergyColor(subTask.energyLevel)}`}>
                  <Zap className="h-3 w-3 mr-1" />
                  {subTask.energyLevel}
                </Badge>
              )}
              
              {!subTask.completed && (
                <>
                  <AssistanceButton
                    type="stuck"
                    onRequest={handleAssistanceRequest}
                    isLoading={isRequestingHelp}
                    hasResponse={!!assistanceResponse}
                    compact={true}
                  />
                  <AssistanceButton
                    type="need_details"
                    onRequest={handleAssistanceRequest}
                    isLoading={isRequestingHelp}
                    hasResponse={!!assistanceResponse}
                    compact={true}
                  />
                  <AssistanceButton
                    type="how_to"
                    onRequest={handleAssistanceRequest}
                    isLoading={isRequestingHelp}
                    hasResponse={!!assistanceResponse}
                    compact={true}
                  />
                  <AssistanceButton
                    type="examples"
                    onRequest={handleAssistanceRequest}
                    isLoading={isRequestingHelp}
                    hasResponse={!!assistanceResponse}
                    compact={true}
                  />
                </>
              )}
            </div>
          </div>
          
          {!subTask.completed && (
            <Button
              onClick={() => onStart(subTask)}
              size="sm"
              className="bg-soul-purple hover:bg-soul-purple/90 text-white px-3 py-1 h-8"
            >
              <Play className="h-3 w-3 mr-1" />
              Start
            </Button>
          )}
        </div>

      </Card>

      {/* Help Panel */}
      {assistanceResponse && (
        <HelpPanel
          response={assistanceResponse}
          onAssistanceRequest={(type, customMessage) => {
            const contextMessage = customMessage ||
              (assistanceResponse.content
                ? `I need more help understanding: "${assistanceResponse.content}"`
                : undefined);

            handleAssistanceRequest(type, contextMessage);
          }}
          compact={compact}
        />
      )}
    </div>
  );
};

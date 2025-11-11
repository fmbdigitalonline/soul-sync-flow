
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
  Zap,
  Loader2
} from 'lucide-react';
import { ParsedSubTask } from '@/services/coach-message-parser';
import { interactiveAssistanceService, AssistanceResponse } from '@/services/interactive-assistance-service';
import { useToast } from '@/hooks/use-toast';
import {
  buildAggregatedAssistanceContext,
  normalizeAssistanceResponses
} from '@/utils/assistance-response-utils';

interface SubTaskCardProps {
  subTask: ParsedSubTask;
  onStart: (subTask: ParsedSubTask) => void;
  onToggleComplete: (subTask: ParsedSubTask) => void;
  compact?: boolean;
}

export const SubTaskCard: React.FC<SubTaskCardProps> = ({
  subTask,
  onStart,
  onToggleComplete,
  compact = false
}) => {
  const { toast } = useToast();

  const [assistanceResponses, setAssistanceResponses] = useState<AssistanceResponse[]>([]);
  const [isRequestingHelp, setIsRequestingHelp] = useState(false);
  const handleAssistanceRequest = async (
    type: 'stuck' | 'need_details' | 'how_to' | 'examples',
    message?: string
  ) => {
    setIsRequestingHelp(true);
    try {
      const normalizedExisting = normalizeAssistanceResponses(assistanceResponses);
      const previousHelp = buildAggregatedAssistanceContext(normalizedExisting);

      const response = await interactiveAssistanceService.requestAssistance(
        subTask.id,
        subTask.title,
        type,
        { subTask, compact },
        message,
        previousHelp
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

      setAssistanceResponses([...normalizedExisting, responseWithContext]);

      toast({
        title: normalizedExisting.length === 0
          ? 'Help guidance loaded'
          : `Follow-up help #${responseWithMeta.followUpDepth} loaded`,
        description: normalizedExisting.length === 0
          ? 'Guidance is now available for this step.'
          : 'New follow-up help has been added below the previous guidance.'
      });
    } catch (error) {
      console.error('Failed to get assistance:', error);
    } finally {
      setIsRequestingHelp(false);
    }
  };

  const handleClearAssistance = () => {
    if (!assistanceResponses.length) {
      return;
    }

    setAssistanceResponses([]);
    setIsRequestingHelp(false);

    toast({
      title: 'Help cleared',
      description: 'All help guidance has been removed for this step.'
    });
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
                    hasResponse={assistanceResponses.length > 0}
                    compact={true}
                  />
                  <AssistanceButton
                    type="need_details"
                    onRequest={handleAssistanceRequest}
                    isLoading={isRequestingHelp}
                    hasResponse={assistanceResponses.length > 0}
                    compact={true}
                  />
                  <AssistanceButton
                    type="how_to"
                    onRequest={handleAssistanceRequest}
                    isLoading={isRequestingHelp}
                    hasResponse={assistanceResponses.length > 0}
                    compact={true}
                  />
                  <AssistanceButton
                    type="examples"
                    onRequest={handleAssistanceRequest}
                    isLoading={isRequestingHelp}
                    hasResponse={assistanceResponses.length > 0}
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
      {(assistanceResponses.length > 0 || isRequestingHelp) && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
              Help history
            </span>
            {assistanceResponses.length > 0 && (
              <Button
                onClick={handleClearAssistance}
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs text-blue-600 hover:text-blue-700"
              >
                Clear all help
              </Button>
            )}
          </div>

          <div className="space-y-3">
            {assistanceResponses.map((response, index) => (
              <HelpPanel
                key={response.id ?? `${subTask.id}-response-${index}`}
                response={response}
                completedSteps={new Set<number>()} // SubTaskCard doesn't persist step progress yet
                onToggleStep={() => {}} // SubTaskCard doesn't persist step progress yet
                onAssistanceRequest={(type, customMessage) => {
                  const contextMessage = customMessage ||
                    (response.content
                      ? `I need more help understanding: "${response.content}"`
                      : undefined);

                  handleAssistanceRequest(type, contextMessage);
                }}
                compact={compact}
                isLoading={isRequestingHelp && index === assistanceResponses.length - 1}
              />
            ))}

            {isRequestingHelp && assistanceResponses.length === 0 && (
              <div className="flex items-center text-xs text-blue-600">
                <Loader2 className="h-3 w-3 animate-spin mr-2" />
                Loading help guidance...
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

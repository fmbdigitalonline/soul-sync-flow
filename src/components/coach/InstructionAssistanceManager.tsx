import React from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AssistanceButton } from '@/components/ui/assistance-button';
import { HelpPanel } from '@/components/ui/help-panel';
import { useAssistanceResponsePersistence } from '@/hooks/use-assistance-response-persistence';

interface InstructionAssistanceManagerProps {
  taskId: string;
  instructionId: string;
  instructionTitle: string;
  isCompleted: boolean;
  onAssistanceRequest: (
    type: 'stuck' | 'need_details' | 'how_to' | 'examples',
    message?: string
  ) => Promise<void>;
  isRequestingHelp: boolean;
}

/**
 * Manages assistance responses for a single instruction
 * Handles loading responses from database and displaying help panels
 */
export const InstructionAssistanceManager: React.FC<InstructionAssistanceManagerProps> = ({
  taskId,
  instructionId,
  instructionTitle,
  isCompleted,
  onAssistanceRequest,
  isRequestingHelp
}) => {
  const {
    responses,
    isLoading,
    clearAllResponses
  } = useAssistanceResponsePersistence(taskId, instructionId);

  if (isCompleted) {
    return null;
  }

  return (
    <div className="space-y-3">
      {/* Assistance Buttons */}
      <div className="flex items-center gap-2 flex-wrap">
        <AssistanceButton
          type="stuck"
          onRequest={(type, msg) => onAssistanceRequest(type, msg)}
          isLoading={isRequestingHelp}
          hasResponse={responses.length > 0}
          compact={true}
        />
        <AssistanceButton
          type="need_details"
          onRequest={(type, msg) => onAssistanceRequest(type, msg)}
          isLoading={isRequestingHelp}
          hasResponse={responses.length > 0}
          compact={true}
        />
        <AssistanceButton
          type="how_to"
          onRequest={(type, msg) => onAssistanceRequest(type, msg)}
          isLoading={isRequestingHelp}
          hasResponse={responses.length > 0}
          compact={true}
        />
        <AssistanceButton
          type="examples"
          onRequest={(type, msg) => onAssistanceRequest(type, msg)}
          isLoading={isRequestingHelp}
          hasResponse={responses.length > 0}
          compact={true}
        />
      </div>

      {/* Help Panels */}
      {(responses.length > 0 || isRequestingHelp || isLoading) && (
        <div className="mt-3 pt-3 border-t border-gray-100 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
              Help history
            </span>
            {responses.length > 0 && (
              <Button
                onClick={clearAllResponses}
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs text-blue-600 hover:text-blue-700"
              >
                Clear all help
              </Button>
            )}
          </div>

          {isLoading && responses.length === 0 ? (
            <div className="flex items-center text-xs text-gray-500">
              <Loader2 className="h-3 w-3 animate-spin mr-2" />
              Loading saved help...
            </div>
          ) : (
            <div className="space-y-3">
              {responses.map((response, responseIndex) => (
                <HelpPanel
                  key={response.dbId || response.id}
                  response={response}
                  assistanceResponseDbId={response.dbId}
                  onAssistanceRequest={(type, customMessage) => {
                    const contextMessage = customMessage ||
                      (response.content
                        ? `I need more help understanding: "${response.content}"`
                        : undefined);

                    onAssistanceRequest(type, contextMessage);
                  }}
                  compact={true}
                  isLoading={isRequestingHelp && responseIndex === responses.length - 1}
                />
              ))}

              {isRequestingHelp && responses.length === 0 && (
                <div className="flex items-center text-xs text-blue-600">
                  <Loader2 className="h-3 w-3 animate-spin mr-2" />
                  Loading help guidance...
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

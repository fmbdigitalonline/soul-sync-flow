
import React, { useEffect, useState } from "react";
import { CosmicCard } from "@/components/ui/cosmic-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Target, 
  SendHorizontal, 
  User, 
  Loader2, 
  CheckCircle2, 
  Clock, 
  TrendingUp,
  Calendar,
  MessageSquare
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Message } from "@/hooks/use-ai-coach";
import { useLanguage } from "@/contexts/LanguageContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { FocusModeSessionBanner } from "./FocusModeSessionBanner";
import { StepChecklistProgress } from "./StepChecklistProgress";
import { CoachStepMessage } from "./CoachStepMessage";
import { ArrowRight } from "lucide-react";
import { CoachLoadingMessage } from "./CoachLoadingMessage";
import { SessionFeedback } from "@/components/memory/SessionFeedback";

interface CoachInterfaceProps {
  messages: Message[];
  isLoading: boolean;
  onSendMessage: (message: string) => void;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  taskTitle: string;
  estimatedDuration: string;
  sessionId?: string; // Made optional
  /** Optional: Used by TaskCoachInterface to signal waiting for the first reply */
  awaitingFirstAssistantReply?: boolean;
}

export const CoachInterface: React.FC<CoachInterfaceProps> = ({
  messages,
  isLoading,
  onSendMessage,
  messagesEndRef,
  taskTitle,
  estimatedDuration,
  sessionId = 'default-session', // Default value
  awaitingFirstAssistantReply = false,
}) => {
  const [inputValue, setInputValue] = useState("");
  const [showFeedback, setShowFeedback] = useState(false);
  const { t } = useLanguage();
  const isMobile = useIsMobile();
  const [assistantSteps, setAssistantSteps] = React.useState<string[]>([]);
  const [currentStepIdx, setCurrentStepIdx] = React.useState(0);

  const parseStepsFromMessages = React.useCallback(() => {
    const assistantMsgs = messages.filter((m) => m.sender === "assistant");
    const stepRegex = /Step\s*(\d+)\s*:\s*([^\n]+)\n?([\s\S]+?)(?=Step\s*\d+:|$)/gi;
    let foundSteps: string[] = [];
    let found = false;

    for (let i = 0; i < assistantMsgs.length; ++i) {
      let text = assistantMsgs[i].content;
      let match;
      while ((match = stepRegex.exec(text))) {
        found = true;
        foundSteps.push(match[2].trim());
      }
    }
    if (!found || foundSteps.length === 0) {
      const checklistRegex = /^\d+\.\s+([^\n]+)/gm;
      for (let i = 0; i < assistantMsgs.length; ++i) {
        let text = assistantMsgs[i].content;
        let clMatch;
        while ((clMatch = checklistRegex.exec(text))) {
          foundSteps.push(clMatch[1].trim());
        }
      }
    }
    return foundSteps;
  }, [messages]);

  React.useEffect(() => {
    const parsed = parseStepsFromMessages();
    setAssistantSteps(parsed);
    if (parsed.length > 0) {
      const userMsgs = messages.filter((m) => m.sender === "user").length;
      setCurrentStepIdx(Math.min(userMsgs, parsed.length - 1));
    } else {
      setCurrentStepIdx(0);
    }
  }, [messages, parseStepsFromMessages]);

  const [isFallbackTimeout, setIsFallbackTimeout] = useState(false);

  useEffect(() => {
    if (isLoading && messages.length === 0 && awaitingFirstAssistantReply) {
      setIsFallbackTimeout(false);
      const timeout = setTimeout(() => setIsFallbackTimeout(true), 15000);
      return () => clearTimeout(timeout);
    } else {
      setIsFallbackTimeout(false);
    }
  }, [isLoading, messages.length, awaitingFirstAssistantReply]);

  if (isLoading && messages.length === 0 && awaitingFirstAssistantReply) {
    return (
      <CoachLoadingMessage
        message={
          isFallbackTimeout
            ? t('coach.fallbackTimeout')
            : t('coach.preparingPlan')
        }
        showSpinner={!isFallbackTimeout}
      />
    );
  }

  const taskAwareQuickActions = [
    "Break this task into specific sub-tasks",
    "Help me prioritize what to do first",
    "I'm stuck - help me troubleshoot",
    "Check my progress and update completion"
  ];

  const handleQuickAction = (action: string) => {
    onSendMessage(action);
  };

  const handleSendMessage = () => {
    if (inputValue.trim() === "") return;
    onSendMessage(inputValue);
    setInputValue("");
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleToggleFeedback = () => {
    setShowFeedback(!showFeedback);
  };

  const renderEnhancedMessage = (message: any, idx: number) => {
    const isActionResponse = message.content.includes('ACTION COMPLETED') || 
                            message.content.includes('ACTION FAILED') ||
                            message.content.includes('Sub-task') ||
                            message.content.includes('Progress updated');

    const messageClass = message.sender === "user"
      ? "bg-green-600 text-white text-base px-5 py-4 my-2"
      : `${isActionResponse ? 'bg-blue-50 border-blue-200' : 'bg-slate-50 border-green-200/40'} text-gray-900 px-5 py-4 my-2`;

    return (
      <div
        key={message.id}
        className={`w-full mx-auto max-w-2xl md:max-w-3xl rounded-2xl border ${messageClass}`}
      >
        <div className="flex items-center gap-2 mb-1">
          {message.sender === "assistant" ? (
            <ArrowRight className="h-4 w-4 text-green-400" />
          ) : (
            <ArrowRight className="h-4 w-4 text-white" />
          )}
          <span className="text-xs font-medium">
            {message.sender === "assistant"
              ? (isActionResponse ? "Task Manager" : t('coach.soulCoach'))
              : t('you')}
          </span>
        </div>
        <div className="text-base leading-relaxed whitespace-pre-line">
          {message.content}
        </div>
      </div>
    );
  };

  // Show feedback form when there are messages and not currently loading
  const shouldShowFeedbackOption = messages.length > 2 && !isLoading;

  return (
    <div className="flex flex-col h-full w-full">
      <FocusModeSessionBanner 
        taskTitle={taskTitle || t('coach.taskSession')}
        estimatedDuration={estimatedDuration || t('coach.defaultDuration')}
      />

      {assistantSteps.length > 0 && (
        <StepChecklistProgress 
          steps={assistantSteps}
          currentStepIdx={currentStepIdx}
        />
      )}

      <div className="flex-1 overflow-y-auto px-0 pt-2 pb-4 space-y-4 min-h-0">
        {messages.length === 0 && (
          <div className="space-y-4">
            <div className="text-center p-4 text-muted-foreground">
              <ArrowRight className={cn("text-green-400 mx-auto mb-4", isMobile ? "h-8 w-8" : "h-12 w-12")} />
              <h3 className={cn("font-medium mb-1", isMobile ? "text-base" : "text-lg")}>
                Task-Aware Coach Ready
              </h3>
              <p className={cn("max-w-xs mx-auto", isMobile ? "text-xs" : "text-sm")}>
                I can help you break down tasks, track progress, and manage completion
              </p>
            </div>
            
            <div className="space-y-2">
              <p className="text-xs font-medium text-center text-muted-foreground">Quick Task Actions</p>
              <div className={cn("gap-2", isMobile ? "grid grid-cols-1" : "grid grid-cols-2")}>
                {taskAwareQuickActions.map((action, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => onSendMessage(action)}
                    className={cn("justify-start text-xs", isMobile ? "h-7" : "h-8")}
                  >
                    {action}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}

        {renderCoachStepsWithContext()}
        {messages.map((message, idx) => {
          if (
            message.sender === "assistant" &&
            /Step\s*\d+:/i.test(message.content)
          ) {
            return null;
          }
          return renderEnhancedMessage(message, idx);
        })}

        {isLoading && (
          <div className="flex justify-start">
            <div className={cn("cosmic-card max-w-[80%] rounded-2xl", isMobile ? "p-3" : "p-4")}>
              <div className="flex items-center space-x-2">
                <ArrowRight className="h-4 w-4 text-green-400" />
                <p className="text-xs font-medium">{t('coach.soulCoach')}</p>
              </div>
              <div className="flex items-center space-x-2 mt-2">
                <ArrowRight className="h-4 w-4 animate-spin" />
                <p className="text-sm">Processing your task request...</p>
              </div>
            </div>
          </div>
        )}

        {/* Session Feedback Section */}
        {showFeedback && (
          <div className="w-full mx-auto max-w-2xl md:max-w-3xl">
            <SessionFeedback
              sessionId={sessionId}
              sessionSummary={`Task coaching session: ${taskTitle}`}
              onFeedbackSubmitted={() => setShowFeedback(false)}
            />
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <div className="sticky bottom-0 pb-4">
        {/* Feedback Toggle Button */}
        {shouldShowFeedbackOption && !showFeedback && (
          <div className="flex justify-center mb-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleToggleFeedback}
              className="text-xs"
            >
              <MessageSquare className="h-3 w-3 mr-1" />
              Rate this session
            </Button>
          </div>
        )}

        <div className="flex items-center space-x-2 p-2 border border-green-200/20 bg-white rounded-2xl shadow">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder={t('forms.placeholders.askCoach')}
            className="flex-1"
            disabled={isLoading}
          />
          <Button
            size="icon"
            onClick={handleSendMessage}
            disabled={inputValue.trim() === "" || isLoading}
            className="bg-green-600 hover:bg-green-700"
          >
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-center text-muted-foreground mt-2">
          Task-aware coaching with integrated progress tracking
        </p>
      </div>
    </div>
  );

  function renderCoachStepsWithContext() {
    const assistantMsgs = messages.filter((m) => m.sender === "assistant");
    const stepBlocks: React.ReactNode[] = [];
    let totalSteps = 0;
    let estimated = estimatedDuration || t('coach.defaultDuration');
    const stepCountRegex = /Step\s*(\d+)\s*:/gi;
    for (const msg of assistantMsgs) {
      let scMatch;
      while ((scMatch = stepCountRegex.exec(msg.content))) {
        const stepNum = parseInt(scMatch[1]);
        if (stepNum > totalSteps) totalSteps = stepNum;
      }
    }
    for (const message of assistantMsgs) {
      const stepRegex = /Step\s*(\d+)\s*:\s*([^\n]+)\n?([\s\S]+?)(?=Step\s*\d+:|$)/gi;
      let m;
      while ((m = stepRegex.exec(message.content))) {
        const defaultMotivation = t('coach.motivation.default');
        const defaultCTA = t('coach.cta.default');
        stepBlocks.push(
          <CoachStepMessage
            key={`stepbox-${m[1]}`}
            stepNum={m[1]}
            title={m[2]}
            body={m[3].trim()}
            totalSteps={totalSteps > 1 ? totalSteps : undefined}
            estimatedDuration={estimated}
            motivation={defaultMotivation}
            cta={defaultCTA}
          />
        );
      }
    }
    return stepBlocks.length > 0 ? stepBlocks : null;
  }
};

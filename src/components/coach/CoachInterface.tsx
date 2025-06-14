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
  Calendar
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

interface CoachInterfaceProps {
  messages: Message[];
  isLoading: boolean;
  onSendMessage: (message: string) => void;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  taskTitle: string;
  estimatedDuration: string;
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
  awaitingFirstAssistantReply = false,
}) => {
  const [inputValue, setInputValue] = useState("");
  const { t } = useLanguage();
  const isMobile = useIsMobile();
  // New: Hold state for steps parsed from assistant messages
  const [assistantSteps, setAssistantSteps] = React.useState<string[]>([]);
  const [currentStepIdx, setCurrentStepIdx] = React.useState(0);

  // Utility: Parse steps out of latest assistant message
  const parseStepsFromMessages = React.useCallback(() => {
    // Parse all messages from assistant for "Step N: Title" or numbered list
    const assistantMsgs = messages.filter((m) => m.sender === "assistant");
    const stepRegex = /Step\s*(\d+)\s*:\s*([^\n]+)\n?([\s\S]+?)(?=Step\s*\d+:|$)/gi;
    let foundSteps: string[] = [];
    let found = false;

    for (let i = 0; i < assistantMsgs.length; ++i) {
      let text = assistantMsgs[i].content;
      let match;
      while ((match = stepRegex.exec(text))) {
        found = true;
        // Only use the step title, ignore the body here for checklist
        foundSteps.push(match[2].trim());
      }
    }
    if (!found || foundSteps.length === 0) {
      // Fallback: find top-level numbered checklist
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

  // Auto-update steps when messages come in
  React.useEffect(() => {
    const parsed = parseStepsFromMessages();
    setAssistantSteps(parsed);
    // Count how many steps are likely done (user message count towards assistant steps)
    if (parsed.length > 0) {
      // Guess: each user reply marks a step as done (not perfect but will do for now)
      const userMsgs = messages.filter((m) => m.sender === "user").length;
      setCurrentStepIdx(Math.min(userMsgs, parsed.length - 1));
    } else {
      setCurrentStepIdx(0);
    }
  }, [messages, parseStepsFromMessages]);

  // Fallback state in case the assistant takes too long
  const [isFallbackTimeout, setIsFallbackTimeout] = useState(false);

  useEffect(() => {
    // Only trigger on first waiting, and only when no messages yet, and is loading
    if (isLoading && messages.length === 0 && awaitingFirstAssistantReply) {
      setIsFallbackTimeout(false);
      const timeout = setTimeout(() => setIsFallbackTimeout(true), 15000); // 15 second fallback
      return () => clearTimeout(timeout);
    } else {
      setIsFallbackTimeout(false);
    }
  }, [isLoading, messages.length, awaitingFirstAssistantReply]);

  // Show loading state before first assistant message
  if (isLoading && messages.length === 0 && awaitingFirstAssistantReply) {
    return (
      <CoachLoadingMessage
        message={
          isFallbackTimeout
            ? "This is taking a moment — the coach is working deeply to shape your next step…"
            : "Coach is preparing your plan..."
        }
        showSpinner={!isFallbackTimeout}
      />
    );
  }

  const handleSendMessage = () => {
    if (inputValue.trim() === "") return;
    onSendMessage(inputValue);
    setInputValue("");
  };

  // Added to fix missing handler error
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Quick action suggestions for productivity
  const quickActions = [
    t('quickAction.breakDownGoal'),
    t('quickAction.createRoutine'),
    t('quickAction.setupAccountability'),
    t('quickAction.planWeek'),
  ];

  const handleQuickAction = (action: string) => {
    onSendMessage(action);
  };

  // Helper to provide extra coach meta/motivation/cta for steps
  function renderCoachStepsWithContext() {
    // Find all assistant messages with Step N, render as CoachStepMessage with meta/context
    const assistantMsgs = messages.filter((m) => m.sender === "assistant");
    const stepBlocks: React.ReactNode[] = [];
    let totalSteps = 0;
    let estimated = estimatedDuration || "~30 min";
    // Find highest step number for totalSteps
    const stepCountRegex = /Step\s*(\d+)\s*:/gi;
    for (const msg of assistantMsgs) {
      let scMatch;
      while ((scMatch = stepCountRegex.exec(msg.content))) {
        const stepNum = parseInt(scMatch[1]);
        if (stepNum > totalSteps) totalSteps = stepNum;
      }
    }
    // If none, leave as 0 (suppressed)
    for (const message of assistantMsgs) {
      // Render step blocks (Step N) as enhanced CoachStepMessage
      const stepRegex = /Step\s*(\d+)\s*:\s*([^\n]+)\n?([\s\S]+?)(?=Step\s*\d+:|$)/gi;
      let m;
      while ((m = stepRegex.exec(message.content))) {
        // Motivation and CTA defaults
        const defaultMotivation =
          "You don’t need to get it perfect — clarity starts by expressing what’s true for you.";
        const defaultCTA =
          "💬 When you’re ready, type your thoughts here — I’ll help organize and refine them into a clear direction.";
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

  return (
    <div className="flex flex-col h-full w-full">
      {/* Session Banner */}
      <FocusModeSessionBanner 
        taskTitle={taskTitle || "Task Session"}
        estimatedDuration={estimatedDuration || "~30 min"}
      />

      {/* Steps Progress checklist */}
      {assistantSteps.length > 0 && (
        <StepChecklistProgress 
          steps={assistantSteps}
          currentStepIdx={currentStepIdx}
        />
      )}

      {/* Chat area with expanded containers */}
      <div className="flex-1 overflow-y-auto px-0 pt-2 pb-4 space-y-4 min-h-0">
        {/* Improved message rendering: show Step messages as blocks if found */}
        {messages.length === 0 && (
          <div className="space-y-4">
            <div className="text-center p-4 text-muted-foreground">
              <ArrowRight className={cn("text-green-400 mx-auto mb-4", isMobile ? "h-8 w-8" : "h-12 w-12")} />
              <h3 className={cn("font-medium mb-1", isMobile ? "text-base" : "text-lg")}>{t('coach.ready')}</h3>
              <p className={cn("max-w-xs mx-auto", isMobile ? "text-xs" : "text-sm")}>
                {t('coach.readyDescription')}
              </p>
            </div>
            
            {/* Quick Actions - More compact on mobile */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-center text-muted-foreground">{t('coach.quickStart')}</p>
              <div className={cn("gap-2", isMobile ? "grid grid-cols-1" : "grid grid-cols-2")}>
                {[
                  t('quickAction.breakDownGoal'),
                  t('quickAction.createRoutine'),
                  t('quickAction.setupAccountability'),
                  t('quickAction.planWeek')
                ].map((action, index) => (
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
        {/* Instead of single message, render enhanced step blocks if detected */}
        {renderCoachStepsWithContext()}
        {/* Render rest of message blocks without step patterns */}
        {messages.map((message, idx) => {
          if (
            message.sender === "assistant" &&
            /Step\s*\d+:/i.test(message.content)
          ) {
            return null; // rendered above already
          }
          return (
            <div
              key={message.id}
              className={
                "w-full mx-auto max-w-2xl md:max-w-3xl rounded-2xl " +
                (message.sender === "user"
                  ? "bg-green-600 text-white text-base px-5 py-4 my-2"
                  : "bg-slate-50 border border-green-200/40 text-gray-900 px-5 py-4 my-2")
              }
            >
              {/* Top: metadata, icon, sender label */}
              <div className="flex items-center gap-2 mb-1">
                {message.sender === "assistant" ? (
                  <ArrowRight className="h-4 w-4 text-green-400" />
                ) : (
                  <ArrowRight className="h-4 w-4 text-white" />
                )}
                <span className="text-xs font-medium">
                  {message.sender === "assistant"
                    ? t('coach.soulCoach')
                    : t('you')}
                </span>
                {/* ... (timestamp etc if needed) */}
              </div>
              <div className="text-base leading-relaxed whitespace-pre-line">
                {message.content}
              </div>
            </div>
          );
        })}
        {isLoading && (
          <div className="flex justify-start">
            <div className={cn("cosmic-card border border-green-200/20 max-w-[80%] rounded-2xl", isMobile ? "p-3" : "p-4")}>
              <div className="flex items-center space-x-2">
                <ArrowRight className="h-4 w-4 text-green-400" />
                <p className="text-xs font-medium">{t('coach.soulCoach')}</p>
              </div>
              <div className="flex items-center space-x-2 mt-2">
                <ArrowRight className="h-4 w-4 animate-spin" />
                <p className="text-sm">{t('coach.analyzing')}</p>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      {/* Input Area */}
      <div className="sticky bottom-0 pb-4">
        <div className="flex items-center space-x-2 p-2 border border-green-200/20 bg-white rounded-2xl shadow">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder={t('coach.inputPlaceholder')}
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
          {t('coach.poweredBy')}
        </p>
      </div>
    </div>
  );
};

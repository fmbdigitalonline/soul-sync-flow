
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  SendHorizontal, 
  ArrowRight, 
  Loader2,
  Sparkles,
  Target,
  MessageSquare,
  Brain
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Message } from "@/hooks/use-ai-coach";
import { useLanguage } from "@/contexts/LanguageContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { FocusModeSessionBanner } from "./FocusModeSessionBanner";
import { CoachLoadingMessage } from "./CoachLoadingMessage";
import { SmartQuickActions } from "../task/SmartQuickActions";
import { StructuredMessageRenderer } from "./StructuredMessageRenderer";
import { CoachMessageParser, ParsedSubTask } from "@/services/coach-message-parser";
import { SessionFeedback } from "@/components/memory/SessionFeedback";
import { VFPGraphFeedback } from "./VFPGraphFeedback";

interface EnhancedCoachInterfaceProps {
  messages: Message[];
  isLoading: boolean;
  onSendMessage: (message: string) => void;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  taskTitle: string;
  estimatedDuration: string;
  sessionId?: string; // Made optional
  awaitingFirstAssistantReply?: boolean;
  vfpGraphStatus?: {
    isAvailable: boolean;
    vectorDimensions: number;
    personalitySummary: string;
    vectorMagnitude?: number;
  };
  onVFPGraphFeedback?: (messageId: string, isPositive: boolean) => void;
}

export const EnhancedCoachInterface: React.FC<EnhancedCoachInterfaceProps> = ({
  messages,
  isLoading,
  onSendMessage,
  messagesEndRef,
  taskTitle,
  estimatedDuration,
  sessionId = 'default-session', // Default value
  awaitingFirstAssistantReply = false,
  vfpGraphStatus,
  onVFPGraphFeedback,
}) => {
  const [inputValue, setInputValue] = useState("");
  const [showFeedback, setShowFeedback] = useState(false);
  const { t } = useLanguage();
  const isMobile = useIsMobile();
  const [isFallbackTimeout, setIsFallbackTimeout] = useState(false);
  const [managedSubTasks, setManagedSubTasks] = useState<ParsedSubTask[]>([]);

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
            : vfpGraphStatus?.isAvailable
              ? 'Analyzing with VFP-Graph intelligence...'
              : t('coach.preparingPlan')
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

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleToggleFeedback = () => {
    setShowFeedback(!showFeedback);
  };

  const handleSubTaskStart = (subTask: ParsedSubTask) => {
    console.log('🎯 Starting sub-task:', subTask.title);
    onSendMessage(`I'm starting the sub-task: "${subTask.title}". Please guide me through this step.`);
    
    // Mark as in progress
    setManagedSubTasks(prev => 
      prev.map(task => 
        task.id === subTask.id 
          ? { ...task, completed: false } 
          : task
      )
    );
  };

  const handleSubTaskComplete = (subTask: ParsedSubTask) => {
    console.log('✅ Toggling sub-task completion:', subTask.title);
    
    setManagedSubTasks(prev => 
      prev.map(task => 
        task.id === subTask.id 
          ? { ...task, completed: !task.completed } 
          : task
      )
    );

    const isCompleting = !subTask.completed;
    if (isCompleting) {
      onSendMessage(`I've completed the sub-task: "${subTask.title}". What's next?`);
    }
  };

  const handleStartTaskPlan = () => {
    console.log('🚀 Starting task plan');
    onSendMessage("I'm ready to start this task plan. Let's begin with the first step!");
  };

  const handleQuickAction = (actionId: string, message: string) => {
    if (!isLoading) {
      onSendMessage(message);
    }
  };

  // Extract all sub-tasks from messages for management
  useEffect(() => {
    const allSubTasks: ParsedSubTask[] = [];
    
    messages
      .filter(msg => msg.sender === "assistant")
      .forEach(msg => {
        const parsed = CoachMessageParser.parseMessage(msg.content);
        if (parsed.type === 'breakdown' && parsed.subTasks) {
          allSubTasks.push(...parsed.subTasks);
        }
      });
    
    if (allSubTasks.length > managedSubTasks.length) {
      setManagedSubTasks(allSubTasks);
    }
  }, [messages, managedSubTasks.length]);

  // Show feedback form when there are messages and not currently loading
  const shouldShowFeedbackOption = messages.length > 2 && !isLoading;

  return (
    <div className="flex flex-col h-full w-full">
      <FocusModeSessionBanner 
        taskTitle={taskTitle || t('coach.taskSession')}
        estimatedDuration={estimatedDuration || t('coach.defaultDuration')}
      />

      {/* VFP-Graph Status Header */}
      {vfpGraphStatus?.isAvailable && (
        <div className="bg-gradient-to-r from-soul-purple/10 to-soul-teal/10 border-b border-soul-purple/20 px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="h-4 w-4 text-soul-purple" />
              <span className="text-sm font-medium text-soul-purple">VFP-Graph Enhanced</span>
              <span className="text-xs text-muted-foreground">
                {vfpGraphStatus.vectorDimensions}D Intelligence
              </span>
            </div>
            <div className="text-xs text-muted-foreground max-w-xs truncate">
              {vfpGraphStatus.personalitySummary}
            </div>
          </div>
        </div>
      )}

      {/* Main Messages Area */}
      <div className="flex-1 overflow-y-auto px-0 pt-2 pb-4 space-y-4 min-h-0">
        {messages.length === 0 && (
          <div className="space-y-4">
            <div className="text-center p-4 text-muted-foreground">
              <div className={cn("bg-gradient-to-br from-soul-purple to-soul-teal rounded-full mx-auto mb-4 flex items-center justify-center", isMobile ? "w-12 h-12" : "w-16 h-16")}>
                {vfpGraphStatus?.isAvailable ? (
                  <Brain className={cn("text-white", isMobile ? "h-6 w-6" : "h-8 w-8")} />
                ) : (
                  <Sparkles className={cn("text-white", isMobile ? "h-6 w-6" : "h-8 w-8")} />
                )}
              </div>
              <h3 className={cn("font-medium mb-1", isMobile ? "text-base" : "text-lg")}>
                {vfpGraphStatus?.isAvailable ? 'VFP-Graph Enhanced' : 'AI'} Task Coach Ready
              </h3>
              <p className={cn("max-w-xs mx-auto", isMobile ? "text-xs" : "text-sm")}>
                {vfpGraphStatus?.isAvailable 
                  ? `I understand your unique ${vfpGraphStatus.personalitySummary.toLowerCase()} personality and will provide highly personalized task guidance`
                  : "I'll help you break down tasks, track progress, and provide personalized guidance"
                }
              </p>
              {vfpGraphStatus?.isAvailable && (
                <div className="mt-2 px-2 py-1 bg-soul-purple/10 text-soul-purple text-xs rounded-full inline-block">
                  Powered by 128-dimensional personality intelligence
                </div>
              )}
            </div>
          </div>
        )}

        {/* Render Messages with VFP-Graph Enhancement */}
        {messages.map((message, idx) => {
          if (message.sender === "user") {
            return (
              <div key={message.id} className="w-full mx-auto max-w-2xl md:max-w-3xl rounded-2xl border bg-green-600 text-white text-base px-5 py-4 my-2">
                <div className="flex items-center gap-2 mb-1">
                  <ArrowRight className="h-4 w-4 text-white" />
                  <span className="text-xs font-medium">You</span>
                </div>
                <div className="text-base leading-relaxed whitespace-pre-line">
                  {message.content}
                </div>
              </div>
            );
          } else {
            const parsedMessage = CoachMessageParser.parseMessage(message.content);
            const isVFPGraphPowered = vfpGraphStatus?.isAvailable;
            
            return (
              <div key={message.id} className="w-full mx-auto max-w-2xl md:max-w-3xl">
                <div className="rounded-2xl border bg-slate-50 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <ArrowRight className="h-4 w-4 text-green-400" />
                    <span className="text-sm font-medium text-slate-700">
                      {isVFPGraphPowered ? 'VFP-Graph' : 'AI'} Task Coach
                    </span>
                    {isVFPGraphPowered && (
                      <Brain className="h-3 w-3 text-soul-purple" />
                    )}
                  </div>
                  
                  <StructuredMessageRenderer
                    parsedMessage={parsedMessage}
                    onSubTaskStart={handleSubTaskStart}
                    onSubTaskComplete={handleSubTaskComplete}
                    onStartTaskPlan={handleStartTaskPlan}
                  />
                  
                  {/* VFP-Graph Feedback Integration */}
                  {isVFPGraphPowered && onVFPGraphFeedback && (
                    <VFPGraphFeedback
                      messageId={message.id}
                      onFeedbackGiven={(isPositive) => onVFPGraphFeedback(message.id, isPositive)}
                    />
                  )}
                  
                  {/* Personality Insight Display */}
                  {isVFPGraphPowered && vfpGraphStatus && (
                    <div className="mt-2 px-2 py-1 bg-soul-purple/5 rounded text-xs text-soul-purple/70">
                      Personalized using your {vfpGraphStatus.vectorDimensions}D personality vector
                      {vfpGraphStatus.vectorMagnitude && (
                        <span className="ml-1">• Intensity: {vfpGraphStatus.vectorMagnitude}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          }
        })}

        {isLoading && (
          <div className="flex justify-start">
            <div className={cn("border border-green-200/20 max-w-[80%] rounded-2xl bg-slate-50 p-4", isMobile ? "p-3" : "p-4")}>
              <div className="flex items-center space-x-2">
                <ArrowRight className="h-4 w-4 text-green-400" />
                <p className="text-xs font-medium">
                  {vfpGraphStatus?.isAvailable ? 'VFP-Graph' : 'AI'} Task Coach
                </p>
                {vfpGraphStatus?.isAvailable && (
                  <Brain className="h-3 w-3 text-soul-purple" />
                )}
              </div>
              <div className="flex items-center space-x-2 mt-2">
                <Loader2 className="h-4 w-4 animate-spin text-soul-purple" />
                <p className="text-sm">
                  {vfpGraphStatus?.isAvailable 
                    ? "Analyzing with VFP-Graph personality intelligence..."
                    : "Analyzing your task and creating a personalized plan..."
                  }
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Session Feedback Section */}
        {showFeedback && (
          <div className="w-full mx-auto max-w-2xl md:max-w-3xl">
            <SessionFeedback
              sessionId={sessionId}
              sessionSummary={`Enhanced task coaching session: ${taskTitle}`}
              onFeedbackSubmitted={() => setShowFeedback(false)}
            />
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Enhanced Quick Actions - Above Input */}
      <div className="px-2 pb-2">
        <SmartQuickActions
          onAction={handleQuickAction}
          isLoading={isLoading}
          currentProgress={0}
          hasSubTasks={managedSubTasks.length > 0}
        />
      </div>

      {/* Input Area with VFP-Graph Enhancement */}
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
            placeholder={
              vfpGraphStatus?.isAvailable
                ? "Ask about your task - I understand your unique working style..."
                : "Ask about your task, request guidance, or get help..."
            }
            className="flex-1 border-0 focus-visible:ring-0"
            disabled={isLoading}
          />
          <Button
            size="icon"
            onClick={handleSendMessage}
            disabled={inputValue.trim() === "" || isLoading}
            className="bg-green-600 hover:bg-green-700 rounded-xl"
          >
            <SendHorizontal className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-center text-muted-foreground mt-2">
          {vfpGraphStatus?.isAvailable 
            ? `VFP-Graph enhanced task coaching • ${vfpGraphStatus.personalitySummary}`
            : "Enhanced task coaching with smart breakdown and progress tracking"
          }
        </p>
      </div>
    </div>
  );
};

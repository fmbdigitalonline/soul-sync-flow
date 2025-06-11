
import React, { useState } from "react";
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

interface CoachInterfaceProps {
  messages: Message[];
  isLoading: boolean;
  onSendMessage: (message: string) => void;
  messagesEndRef: React.RefObject<HTMLDivElement>;
}

export const CoachInterface: React.FC<CoachInterfaceProps> = ({
  messages,
  isLoading,
  onSendMessage,
  messagesEndRef,
}) => {
  const [inputValue, setInputValue] = useState("");
  const { t } = useLanguage();
  const isMobile = useIsMobile();

  const handleSendMessage = () => {
    if (inputValue.trim() === "") return;
    onSendMessage(inputValue);
    setInputValue("");
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
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

  return (
    <>
      {/* Compact Progress Dashboard for Mobile */}
      <CosmicCard className={cn("mb-4", isMobile ? "p-3" : "p-4")}>
        <div className="flex items-center justify-between mb-2">
          <h3 className={cn("font-medium flex items-center", isMobile ? "text-xs" : "text-sm")}>
            <Target className={cn("text-green-400 mr-2", isMobile ? "h-3 w-3" : "h-4 w-4")} />
            {t('coach.todaysProgress')}
          </h3>
          <Badge variant="outline" className="text-xs">
            <TrendingUp className="h-3 w-3 mr-1" />
            {t('coach.dayStreak', { count: '3' })}
          </Badge>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span>{t('coach.dailyGoals')}</span>
            <span>{t('coach.complete', { completed: '2', total: '3' })}</span>
          </div>
          <Progress value={66} className="h-2" />
        </div>
      </CosmicCard>

      {/* Chat Messages - Improved flex layout */}
      <div className="flex-1 overflow-y-auto mb-4 space-y-4 pb-4 min-h-0">
        {messages.length === 0 && (
          <div className="space-y-4">
            <div className="text-center p-4 text-muted-foreground">
              <Target className={cn("text-green-400 mx-auto mb-4", isMobile ? "h-8 w-8" : "h-12 w-12")} />
              <h3 className={cn("font-medium mb-1", isMobile ? "text-base" : "text-lg")}>{t('coach.ready')}</h3>
              <p className={cn("max-w-xs mx-auto", isMobile ? "text-xs" : "text-sm")}>
                {t('coach.readyDescription')}
              </p>
            </div>
            
            {/* Quick Actions - More compact on mobile */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-center text-muted-foreground">{t('coach.quickStart')}</p>
              <div className={cn("gap-2", isMobile ? "grid grid-cols-1" : "grid grid-cols-2")}>
                {quickActions.map((action, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickAction(action)}
                    className={cn("justify-start text-xs", isMobile ? "h-7" : "h-8")}
                  >
                    {action}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex",
              message.sender === "user" ? "justify-end" : "justify-start"
            )}
          >
            <div
              className={cn(
                "max-w-[80%] rounded-2xl",
                isMobile ? "p-3" : "p-4",
                message.sender === "user"
                  ? "bg-green-600 text-white"
                  : "cosmic-card border border-green-200/20"
              )}
            >
              <div className="flex items-center space-x-2 mb-1">
                {message.sender === "assistant" ? (
                  <Target className="h-4 w-4 text-green-400" />
                ) : (
                  <User className="h-4 w-4" />
                )}
                <p className="text-xs font-medium">
                  {message.sender === "assistant" ? t('coach.soulCoach') : t('you')}
                </p>
                {message.sender === "assistant" && (
                  <Badge variant="outline" className="text-xs">
                    <Clock className="h-3 w-3 mr-1" />
                    {new Date(message.timestamp).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </Badge>
                )}
              </div>
              <p className="text-sm leading-relaxed">{message.content}</p>
              
              {/* Action buttons for AI messages - More compact on mobile */}
              {message.sender === "assistant" && messages.indexOf(message) === messages.length - 1 && (
                <div className={cn("flex mt-3", isMobile ? "flex-col space-y-1" : "space-x-2")}>
                  <Button
                    size="sm"
                    variant="outline"
                    className={cn("text-xs", isMobile ? "h-6" : "h-7")}
                    onClick={() => onSendMessage("Mark this as done")}
                  >
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    {t('coach.done')}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className={cn("text-xs", isMobile ? "h-6" : "h-7")}
                    onClick={() => onSendMessage("Schedule this for later")}
                  >
                    <Calendar className="h-3 w-3 mr-1" />
                    {t('coach.schedule')}
                  </Button>
                </div>
              )}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className={cn("cosmic-card border border-green-200/20 max-w-[80%] rounded-2xl", isMobile ? "p-3" : "p-4")}>
              <div className="flex items-center space-x-2">
                <Target className="h-4 w-4 text-green-400" />
                <p className="text-xs font-medium">{t('coach.soulCoach')}</p>
              </div>
              <div className="flex items-center space-x-2 mt-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <p className="text-sm">{t('coach.analyzing')}</p>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="sticky bottom-0 pb-4">
        <CosmicCard className="flex items-center space-x-2 p-2 border border-green-200/20">
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
            <SendHorizontal className="h-4 w-4" />
          </Button>
        </CosmicCard>
        <p className="text-xs text-center text-muted-foreground mt-2">
          {t('coach.poweredBy')}
        </p>
      </div>
    </>
  );
};


import React, { useState } from "react";
import { CosmicCard } from "@/components/ui/cosmic-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Heart, 
  SendHorizontal, 
  User, 
  Loader2, 
  Sparkles,
  Target,
  Compass,
  Star,
  Zap,
  CheckCircle,
  Calendar
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Message } from "@/hooks/use-ai-coach";
import { useLanguage } from "@/contexts/LanguageContext";
import { useIsMobile } from "@/hooks/use-mobile";

interface BlendInterfaceProps {
  messages: Message[];
  isLoading: boolean;
  onSendMessage: (message: string) => void;
  messagesEndRef: React.RefObject<HTMLDivElement>;
}

export const BlendInterface: React.FC<BlendInterfaceProps> = ({
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

  const quickActions = [
    {
      label: t('blend.setGoal'),
      icon: Target,
      message: t('action.setGoalMessage'),
      category: "productivity"
    },
    {
      label: t('blend.reflectToday'),
      icon: Heart,
      message: t('action.reflectMessage'),
      category: "reflection"
    },
    {
      label: t('blend.findBalance'),
      icon: Compass,
      message: t('action.balanceMessage'),
      category: "balance"
    },
    {
      label: t('blend.breakThrough'),
      icon: Zap,
      message: t('action.stuckMessage'),
      category: "breakthrough"
    }
  ];

  return (
    <>
      {/* Compact Blend Mode Dashboard */}
      <CosmicCard className={cn("mb-4", isMobile ? "p-3" : "p-4")}>
        <div className="flex items-center justify-between mb-2">
          <h3 className={cn("font-medium flex items-center", isMobile ? "text-xs" : "text-sm")}>
            <Sparkles className={cn("text-soul-purple mr-2", isMobile ? "h-3 w-3" : "h-4 w-4")} />
            {t('blend.soulCompanion')}
          </h3>
          <Badge variant="outline" className="text-xs">
            <Star className="h-3 w-3 mr-1" />
            {t('blend.balancedGuidance')}
          </Badge>
        </div>
        
        {!isMobile && (
          <p className="text-xs text-muted-foreground mb-3">
            {t('blend.description')}
          </p>
        )}
        
        <div className={cn("gap-2", isMobile ? "grid grid-cols-2" : "grid grid-cols-2")}>
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Button
                key={action.label}
                variant="outline"
                size="sm"
                onClick={() => onSendMessage(action.message)}
                className={cn(
                  "text-xs flex flex-col items-center gap-1 border-soul-purple/30 hover:bg-soul-purple/10",
                  isMobile ? "h-auto py-1 px-2" : "h-auto py-2 px-3"
                )}
              >
                <Icon className="h-3 w-3" />
                <span className={cn("text-center leading-tight", isMobile ? "text-xs" : "")}>{action.label}</span>
              </Button>
            );
          })}
        </div>
      </CosmicCard>

      {/* Chat Messages - Improved flex layout */}
      <div className="flex-1 overflow-y-auto mb-4 space-y-4 pb-4 min-h-0">
        {messages.length === 0 && (
          <div className="text-center p-4 text-muted-foreground">
            <Sparkles className={cn("text-soul-purple mx-auto mb-4", isMobile ? "h-8 w-8" : "h-12 w-12")} />
            <h3 className={cn("font-medium mb-1", isMobile ? "text-base" : "text-lg")}>{t('blend.awaits')}</h3>
            <p className={cn("max-w-xs mx-auto", isMobile ? "text-xs" : "text-sm")}>
              {t('blend.awaitsDescription')}
            </p>
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
                  ? "bg-soul-purple text-white"
                  : "cosmic-card border border-soul-purple/20"
              )}
            >
              <div className="flex items-center space-x-2 mb-1">
                {message.sender === "assistant" ? (
                  <Sparkles className="h-4 w-4 text-soul-purple" />
                ) : (
                  <User className="h-4 w-4" />
                )}
                <p className="text-xs font-medium">
                  {message.sender === "assistant" ? t('coach.soulCompanion') : t('you')}
                </p>
                {message.sender === "assistant" && (
                  <Badge variant="outline" className="text-xs border-soul-purple/30">
                    <Compass className="h-3 w-3 mr-1" />
                    {t('balanced')}
                  </Badge>
                )}
              </div>
              <p className="text-sm leading-relaxed">{message.content}</p>
              
              {/* Action buttons for AI messages - More compact on mobile */}
              {message.sender === "assistant" && messages.indexOf(message) === messages.length - 1 && (
                <div className={cn("mt-3", isMobile ? "flex flex-col gap-1" : "flex flex-wrap gap-2")}>
                  <Button
                    size="sm"
                    variant="outline"
                    className={cn("text-xs border-soul-purple/30", isMobile ? "h-6" : "h-7")}
                    onClick={() => onSendMessage(t('action.actionableSteps'))}
                  >
                    <CheckCircle className="h-3 w-3 mr-1" />
                    {t('blend.makeActionable')}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className={cn("text-xs border-soul-purple/30", isMobile ? "h-6" : "h-7")}
                    onClick={() => onSendMessage(t('action.deeperMeaning'))}
                  >
                    <Heart className="h-3 w-3 mr-1" />
                    {t('blend.goDeeper')}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className={cn("text-xs border-soul-purple/30", isMobile ? "h-6" : "h-7")}
                    onClick={() => onSendMessage(t('action.blueprintSays'))}
                  >
                    <Star className="h-3 w-3 mr-1" />
                    {t('blend.blueprintWisdom')}
                  </Button>
                </div>
              )}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className={cn("cosmic-card border border-soul-purple/20 max-w-[80%] rounded-2xl", isMobile ? "p-3" : "p-4")}>
              <div className="flex items-center space-x-2">
                <Sparkles className="h-4 w-4 text-soul-purple" />
                <p className="text-xs font-medium">{t('coach.soulCompanion')}</p>
              </div>
              <div className="flex items-center space-x-2 mt-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <p className="text-sm">{t('blend.finding')}</p>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="sticky bottom-0 pb-4">
        <CosmicCard className="flex items-center space-x-2 p-2 border border-soul-purple/20">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder={t('blend.inputPlaceholder')}
            className="flex-1"
            disabled={isLoading}
          />
          <Button
            size="icon"
            onClick={handleSendMessage}
            disabled={inputValue.trim() === "" || isLoading}
            className="bg-soul-purple hover:bg-soul-purple/90"
          >
            <SendHorizontal className="h-4 w-4" />
          </Button>
        </CosmicCard>
        <p className="text-xs text-center text-muted-foreground mt-2">
          {t('blend.poweredBy')}
        </p>
      </div>
    </>
  );
};

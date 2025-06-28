
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
  Moon,
  Star,
  Compass,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Message } from "@/hooks/use-ai-coach";
import { TypewriterText } from "./TypewriterText";
import { useLanguage } from "@/contexts/LanguageContext";

interface GuideInterfaceProps {
  messages: Message[];
  isLoading: boolean;
  onSendMessage: (message: string) => void;
  messagesEndRef: React.RefObject<HTMLDivElement>;
}

export const GuideInterface: React.FC<GuideInterfaceProps> = ({
  messages,
  isLoading,
  onSendMessage,
  messagesEndRef,
}) => {
  const [inputValue, setInputValue] = useState("");
  const [showTools, setShowTools] = useState(false);
  const { t } = useLanguage();

  const handleSendMessage = () => {
    if (inputValue.trim() === "") return;
    onSendMessage(inputValue);
    setInputValue("");
    setShowTools(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  const handleToolAction = (message: string) => {
    onSendMessage(message);
    setShowTools(false);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Collapsible Soul Compass Dashboard */}
      <div className="flex-shrink-0">
        <CosmicCard className="p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Heart className="h-4 w-4 mr-2 text-soul-purple" />
              <h3 className="text-sm font-medium">{t('guide.innerCompass')}</h3>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                <Moon className="h-3 w-3 mr-1" />
                {t('guide.reflectionMode')}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowTools(!showTools)}
                className="h-6 w-6 p-0"
              >
                {showTools ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          
          {showTools && (
            <div className="mt-3 space-y-3">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleToolAction("I want to check in with my current mood and energy. Help me understand what I'm feeling right now.")}
                  className="text-xs h-7 border-soul-purple/30"
                >
                  <Heart className="h-3 w-3 mr-1" />
                  {t('guide.checkIn')}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleToolAction("I want to explore some deep reflection questions about my life and growth. What should I be asking myself?")}
                  className="text-xs h-7 border-soul-purple/30"
                >
                  <Sparkles className="h-3 w-3 mr-1" />
                  {t('guide.reflect')}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleToolAction("I have some insights I'd like to explore deeper. Help me understand what I'm learning about myself.")}
                  className="text-xs h-7 border-soul-purple/30"
                >
                  <Star className="h-3 w-3 mr-1" />
                  {t('guide.journal')}
                </Button>
              </div>
              
              <div className="text-xs text-muted-foreground">
                {t('guide.description')}
              </div>
            </div>
          )}
        </CosmicCard>
      </div>

      {/* Chat Messages - Properly constrained scrollable area */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 min-h-0">
        <div className="space-y-4">
          {messages.length === 0 && (
            <div className="text-center p-6 text-muted-foreground">
              <Heart className="h-12 w-12 text-soul-purple mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-1">{t('guide.awaits')}</h3>
              <p className="text-sm max-w-xs mx-auto">
                {t('guide.awaitsDescription')}
              </p>
            </div>
          )}
          
          {messages.map((message, index) => (
            <div
              key={message.id}
              className={cn(
                "flex",
                message.sender === "user" ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={cn(
                  "max-w-[85%] rounded-2xl p-4",
                  message.sender === "user"
                    ? "bg-soul-purple text-white"
                    : "cosmic-card border border-soul-purple/20"
                )}
              >
                <div className="flex items-center space-x-2 mb-2">
                  {message.sender === "assistant" ? (
                    <Heart className="h-4 w-4 text-soul-purple" />
                  ) : (
                    <User className="h-4 w-4" />
                  )}
                  <p className="text-xs font-medium">
                    {message.sender === "assistant" ? t('coach.soulGuide') : t('you')}
                  </p>
                  {message.sender === "assistant" && (
                    <Badge variant="outline" className="text-xs border-soul-purple/30">
                      <Star className="h-3 w-3 mr-1" />
                      {message.isStreaming ? t('streaming') : t('insight')}
                    </Badge>
                  )}
                </div>
                
                {message.sender === "assistant" ? (
                  <TypewriterText 
                    text={message.content} 
                    isStreaming={message.isStreaming || false} 
                  />
                ) : (
                  <div className="text-sm leading-relaxed whitespace-pre-wrap">
                    {message.content}
                  </div>
                )}
                
                {/* Reflection buttons for latest AI message only */}
                {message.sender === "assistant" && 
                 !message.isStreaming && 
                 index === messages.length - 1 && 
                 messages.length > 1 && (
                  <div className="flex space-x-2 mt-3">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs h-7 border-soul-purple/30"
                      onClick={() => onSendMessage(t('guide.tellMore'))}
                    >
                      <Compass className="h-3 w-3 mr-1" />
                      {t('guide.exploreDeeper')}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs h-7 border-soul-purple/30"
                      onClick={() => onSendMessage(t('guide.howConnect'))}
                    >
                      <Sparkles className="h-3 w-3 mr-1" />
                      {t('guide.blueprintLink')}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="cosmic-card border border-soul-purple/20 max-w-[85%] rounded-2xl p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Heart className="h-4 w-4 text-soul-purple" />
                  <p className="text-xs font-medium">{t('coach.soulGuide')}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <p className="text-sm">{t('guide.reflecting')}</p>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area - Fixed at bottom with proper positioning */}
      <div className="flex-shrink-0 p-4 border-t bg-background">
        <CosmicCard className="flex items-center space-x-2 p-2 border border-soul-purple/20">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder={t('guide.inputPlaceholder')}
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
          {t('guide.poweredBy')}
        </p>
      </div>
    </div>
  );
};

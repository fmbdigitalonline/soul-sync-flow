
import React, { useState } from "react";
import { CosmicCard } from "@/components/ui/cosmic-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  SendHorizontal, 
  User, 
  Loader2, 
  Sparkles
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

  return (
    <>
      {/* Chat Messages - Full space for conversation */}
      <div className="flex-1 overflow-y-auto mb-4 space-y-4 pb-4 min-h-0">
        {messages.length === 0 && (
          <div className="text-center p-6 text-muted-foreground">
            <Sparkles className={cn("text-soul-purple mx-auto mb-4", isMobile ? "h-8 w-8" : "h-12 w-12")} />
            <h3 className={cn("font-medium mb-1", isMobile ? "text-base" : "text-lg")}>Your Soul Companion awaits</h3>
            <p className={cn("max-w-xs mx-auto", isMobile ? "text-xs" : "text-sm")}>
              Share anything on your mind. I'm here to understand, guide, and support your entire journey.
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
              </div>
              <p className="text-sm leading-relaxed">{message.content}</p>
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
                <p className="text-sm">Understanding your soul...</p>
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
            placeholder="Share what's on your mind..."
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
          Your complete life companion - integrating all aspects of your journey
        </p>
      </div>
    </>
  );
};

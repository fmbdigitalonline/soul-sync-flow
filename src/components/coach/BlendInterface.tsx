
import React, { useState } from "react";
import { CosmicCard } from "@/components/ui/cosmic-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  SendHorizontal, 
  User, 
  Loader2, 
  Sparkles,
  Heart,
  Brain
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Message } from "@/hooks/use-ai-coach";
import { useLanguage } from "@/contexts/LanguageContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { TypewriterText } from "./TypewriterText";

interface BlendInterfaceProps {
  messages: Message[];
  isLoading: boolean;
  onSendMessage: (message: string) => void;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  streamingContent?: string;
  isStreaming?: boolean;
}

export const BlendInterface: React.FC<BlendInterfaceProps> = ({
  messages,
  isLoading,
  onSendMessage,
  messagesEndRef,
  streamingContent,
  isStreaming,
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
    "I'm feeling stuck",
    "Help me plan my day", 
    "I need motivation",
    "Let's reflect together"
  ];

  const handleQuickAction = (action: string) => {
    onSendMessage(action);
  };

  return (
    <div className="flex flex-col h-full w-full">
      {/* Messages Area - Maximum space */}
      <div className="flex-1 overflow-y-auto space-y-3 mb-2 min-h-0 w-full px-3">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center w-full">
            <div className="w-12 h-12 bg-gradient-to-br from-soul-purple/20 to-soul-teal/20 rounded-full flex items-center justify-center mb-3">
              <Heart className="h-6 w-6 text-soul-purple" />
            </div>
            <h3 className="text-base font-medium mb-1">Your Soul Companion</h3>
            <p className="text-xs text-muted-foreground mb-4 w-full max-w-none">
              Hey there! I'm here to chat about whatever's on your mind - work, life, dreams, or just how you're feeling right now.
            </p>
            
            <div className="grid grid-cols-2 gap-1 w-full">
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickAction(action)}
                  className="text-xs h-7 px-1 w-full"
                >
                  {action}
                </Button>
              ))}
            </div>
          </div>
        )}
        
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex w-full",
              message.sender === "user" ? "justify-end" : "justify-start"
            )}
          >
            <div
              className={cn(
                "max-w-[85%] rounded-2xl p-3",
                message.sender === "user"
                  ? "bg-gradient-to-br from-soul-purple to-soul-teal text-white ml-8"
                  : "cosmic-card border border-white/20 mr-8"
              )}
            >
              <div className="flex items-center space-x-2 mb-1">
                {message.sender === "assistant" ? (
                  <Heart className="h-3 w-3 text-soul-purple" />
                ) : (
                  <User className="h-3 w-3" />
                )}
                <p className="text-xs font-medium opacity-75">
                  {message.sender === "assistant" ? "Ziel" : "You"}
                </p>
              </div>
              
              {message.isStreaming ? (
                <TypewriterText 
                  text={message.content} 
                  isStreaming={true}
                  speed={25}
                />
              ) : (
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
              )}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start w-full">
            <div className="cosmic-card border border-white/20 max-w-[85%] mr-8 rounded-2xl p-3">
              <div className="flex items-center space-x-2 mb-1">
                <Heart className="h-3 w-3 text-soul-purple" />
                <p className="text-xs font-medium opacity-75">Ziel</p>
              </div>
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-soul-purple/60 rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-soul-purple/60 rounded-full animate-pulse delay-100"></div>
                  <div className="w-2 h-2 bg-soul-purple/60 rounded-full animate-pulse delay-200"></div>
                </div>
                <p className="text-sm text-muted-foreground">thinking...</p>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="flex-shrink-0 flex items-center bg-white/80 backdrop-blur-lg border-t border-white/20 w-full px-3 py-2">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="What's on your mind?"
          className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-sm h-10 px-3 rounded-full"
          disabled={isLoading}
        />
        <Button
          size="sm"
          onClick={handleSendMessage}
          disabled={inputValue.trim() === "" || isLoading}
          className="bg-gradient-to-r from-soul-purple to-soul-teal hover:shadow-lg h-8 w-8 p-0 rounded-full flex-shrink-0 ml-2"
        >
          <SendHorizontal className="h-3 w-3" />
        </Button>
      </div>
      
      {/* Bottom hint */}
      <div className="flex-shrink-0 py-1">
        <p className="text-xs text-center text-muted-foreground opacity-60">
          Your soul companion who really gets you
        </p>
      </div>
    </div>
  );
};

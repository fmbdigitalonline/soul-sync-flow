
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

  // Compact quick actions for getting started
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
    <div className="flex flex-col h-full">
      {/* Messages Area - Takes all available space */}
      <div className="flex-1 overflow-y-auto space-y-3 pb-2 min-h-0">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="w-16 h-16 bg-gradient-to-br from-soul-purple/20 to-soul-teal/20 rounded-full flex items-center justify-center mb-4">
              <Heart className="h-8 w-8 text-soul-purple" />
            </div>
            <h3 className="text-lg font-medium mb-2">Your Soul Guide</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-xs">
              Integrating all aspects of your journey - productivity, growth, and life guidance
            </p>
            
            {/* Compact quick actions */}
            <div className="grid grid-cols-2 gap-2 w-full max-w-xs">
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickAction(action)}
                  className="text-xs h-8 px-2"
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
              "flex",
              message.sender === "user" ? "justify-end" : "justify-start"
            )}
          >
            <div
              className={cn(
                "max-w-[85%] rounded-2xl p-3",
                message.sender === "user"
                  ? "bg-gradient-to-br from-soul-purple to-soul-teal text-white"
                  : "cosmic-card border border-white/20"
              )}
            >
              {/* Minimal header */}
              <div className="flex items-center space-x-2 mb-1">
                {message.sender === "assistant" ? (
                  <Brain className="h-3 w-3 text-soul-purple" />
                ) : (
                  <User className="h-3 w-3" />
                )}
                <p className="text-xs font-medium opacity-75">
                  {message.sender === "assistant" ? "Ziel" : "You"}
                </p>
              </div>
              <p className="text-sm leading-relaxed">{message.content}</p>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="cosmic-card border border-white/20 max-w-[85%] rounded-2xl p-3">
              <div className="flex items-center space-x-2 mb-1">
                <Brain className="h-3 w-3 text-soul-purple" />
                <p className="text-xs font-medium opacity-75">Ziel</p>
              </div>
              <div className="flex items-center space-x-2">
                <Loader2 className="h-3 w-3 animate-spin" />
                <p className="text-sm">Thinking...</p>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Compact Input Area */}
      <div className="flex-shrink-0 pt-2">
        <div className="flex items-center space-x-2 bg-white/80 backdrop-blur-lg rounded-2xl p-2 border border-white/20">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Share what's on your mind..."
            className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-sm"
            disabled={isLoading}
          />
          <Button
            size="sm"
            onClick={handleSendMessage}
            disabled={inputValue.trim() === "" || isLoading}
            className="bg-gradient-to-r from-soul-purple to-soul-teal hover:shadow-lg h-8 w-8 p-0 rounded-xl"
          >
            <SendHorizontal className="h-3 w-3" />
          </Button>
        </div>
        <p className="text-xs text-center text-muted-foreground mt-2 opacity-60">
          Your complete life companion
        </p>
      </div>
    </div>
  );
};

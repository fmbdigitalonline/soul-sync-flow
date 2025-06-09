
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
      label: "Set a goal",
      icon: Target,
      message: "Help me set and track a meaningful goal",
      category: "productivity"
    },
    {
      label: "Reflect on today",
      icon: Heart,
      message: "I want to reflect on my day and understand my feelings",
      category: "reflection"
    },
    {
      label: "Find balance",
      icon: Compass,
      message: "Help me find balance between my productivity and personal growth",
      category: "balance"
    },
    {
      label: "Break through blocks",
      icon: Zap,
      message: "I'm feeling stuck and need help moving forward",
      category: "breakthrough"
    }
  ];

  return (
    <>
      {/* Blend Mode Dashboard */}
      <CosmicCard className="p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium flex items-center">
            <Sparkles className="h-4 w-4 mr-2 text-soul-purple" />
            Soul Companion
          </h3>
          <Badge variant="outline" className="text-xs">
            <Star className="h-3 w-3 mr-1" />
            Balanced guidance
          </Badge>
        </div>
        
        <p className="text-xs text-muted-foreground mb-3">
          Your companion for both achieving goals and understanding yourself deeply
        </p>
        
        <div className="grid grid-cols-2 gap-2">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Button
                key={action.label}
                variant="outline"
                size="sm"
                onClick={() => onSendMessage(action.message)}
                className="text-xs h-auto py-2 px-3 flex flex-col items-center gap-1 border-soul-purple/30 hover:bg-soul-purple/10"
              >
                <Icon className="h-3 w-3" />
                <span className="text-center leading-tight">{action.label}</span>
              </Button>
            );
          })}
        </div>
      </CosmicCard>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto mb-4 space-y-4 pb-4">
        {messages.length === 0 && (
          <div className="text-center p-6 text-muted-foreground">
            <Sparkles className="h-12 w-12 text-soul-purple mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-1">Your Soul Companion awaits</h3>
            <p className="text-sm max-w-xs mx-auto">
              Ask about productivity, goals, personal growth, or reflection. I'll help you find the perfect balance.
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
                "max-w-[80%] rounded-2xl p-4",
                message.sender === "user"
                  ? "bg-soul-purple text-white"
                  : "cosmic-card border border-soul-purple/20"
              )}
            >
              <div className="flex items-center space-x-2 mb-1">
                {message.sender === "ai" ? (
                  <Sparkles className="h-4 w-4 text-soul-purple" />
                ) : (
                  <User className="h-4 w-4" />
                )}
                <p className="text-xs font-medium">
                  {message.sender === "ai" ? "Soul Companion" : "You"}
                </p>
                {message.sender === "ai" && (
                  <Badge variant="outline" className="text-xs border-soul-purple/30">
                    <Compass className="h-3 w-3 mr-1" />
                    Balanced
                  </Badge>
                )}
              </div>
              <p className="text-sm leading-relaxed">{message.content}</p>
              
              {/* Action buttons for AI messages */}
              {message.sender === "ai" && messages.indexOf(message) === messages.length - 1 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs h-7 border-soul-purple/30"
                    onClick={() => onSendMessage("How can I turn this into actionable steps?")}
                  >
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Make actionable
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs h-7 border-soul-purple/30"
                    onClick={() => onSendMessage("Help me understand the deeper meaning here")}
                  >
                    <Heart className="h-3 w-3 mr-1" />
                    Go deeper
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs h-7 border-soul-purple/30"
                    onClick={() => onSendMessage("What would my blueprint say about this?")}
                  >
                    <Star className="h-3 w-3 mr-1" />
                    Blueprint wisdom
                  </Button>
                </div>
              )}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="cosmic-card border border-soul-purple/20 max-w-[80%] rounded-2xl p-4">
              <div className="flex items-center space-x-2">
                <Sparkles className="h-4 w-4 text-soul-purple" />
                <p className="text-xs font-medium">Soul Companion</p>
              </div>
              <div className="flex items-center space-x-2 mt-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <p className="text-sm">Finding the perfect balance for you...</p>
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
            placeholder="Ask about goals, growth, or anything on your mind..."
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
          Balanced guidance combining productivity and personal insight
        </p>
      </div>
    </>
  );
};

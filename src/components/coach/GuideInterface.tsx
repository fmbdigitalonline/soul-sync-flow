
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
  Compass
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Message } from "@/hooks/use-ai-coach";

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

  // Reflection prompts for personal growth
  const reflectionPrompts = [
    "What is my blueprint telling me?",
    "Help me understand my patterns",
    "What does this situation mean for me?",
    "Guide me through this feeling",
  ];

  const handlePrompt = (prompt: string) => {
    onSendMessage(prompt);
  };

  return (
    <>
      {/* Insight Dashboard */}
      <CosmicCard className="p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium flex items-center">
            <Heart className="h-4 w-4 mr-2 text-soul-purple" />
            Inner Compass
          </h3>
          <Badge variant="outline" className="text-xs">
            <Moon className="h-3 w-3 mr-1" />
            Reflection mode
          </Badge>
        </div>
        <div className="text-xs text-muted-foreground">
          Your Soul Guide is here to help you understand yourself more deeply and navigate life's complexities with wisdom.
        </div>
      </CosmicCard>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto mb-4 space-y-4 pb-4">
        {messages.length === 0 && (
          <div className="space-y-4">
            <div className="text-center p-6 text-muted-foreground">
              <Heart className="h-12 w-12 text-soul-purple mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-1">Your Soul Guide awaits</h3>
              <p className="text-sm max-w-xs mx-auto">
                Share what's on your heart and mind. Let's explore the deeper patterns together.
              </p>
            </div>
            
            {/* Reflection Prompts */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-center text-muted-foreground">Gentle Starters:</p>
              <div className="grid grid-cols-1 gap-2">
                {reflectionPrompts.map((prompt, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => handlePrompt(prompt)}
                    className="justify-start text-xs h-8 border-soul-purple/20 hover:bg-soul-purple/10"
                  >
                    <Sparkles className="h-3 w-3 mr-2" />
                    {prompt}
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
                "max-w-[80%] rounded-2xl p-4",
                message.sender === "user"
                  ? "bg-soul-purple text-white"
                  : "cosmic-card border border-soul-purple/20"
              )}
            >
              <div className="flex items-center space-x-2 mb-1">
                {message.sender === "ai" ? (
                  <Heart className="h-4 w-4 text-soul-purple" />
                ) : (
                  <User className="h-4 w-4" />
                )}
                <p className="text-xs font-medium">
                  {message.sender === "ai" ? "Soul Guide" : "You"}
                </p>
                {message.sender === "ai" && (
                  <Badge variant="outline" className="text-xs border-soul-purple/30">
                    <Star className="h-3 w-3 mr-1" />
                    Insight
                  </Badge>
                )}
              </div>
              <p className="text-sm leading-relaxed">{message.content}</p>
              
              {/* Reflection buttons for AI messages */}
              {message.sender === "ai" && messages.indexOf(message) === messages.length - 1 && (
                <div className="flex space-x-2 mt-3">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs h-7 border-soul-purple/30"
                    onClick={() => onSendMessage("Tell me more about this")}
                  >
                    <Compass className="h-3 w-3 mr-1" />
                    Explore deeper
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs h-7 border-soul-purple/30"
                    onClick={() => onSendMessage("How does this connect to my blueprint?")}
                  >
                    <Sparkles className="h-3 w-3 mr-1" />
                    Blueprint link
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
                <Heart className="h-4 w-4 text-soul-purple" />
                <p className="text-xs font-medium">Soul Guide</p>
              </div>
              <div className="flex items-center space-x-2 mt-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <p className="text-sm">Reflecting on your soul's wisdom...</p>
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
            placeholder="What's stirring in your soul today?"
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
          Compassionate guidance powered by your Soul Blueprint
        </p>
      </div>
    </>
  );
};

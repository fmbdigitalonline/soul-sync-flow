
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
    "Help me break down my goal",
    "Create a daily routine",
    "Set up accountability check-ins",
    "Plan my week",
  ];

  const handleQuickAction = (action: string) => {
    onSendMessage(action);
  };

  return (
    <>
      {/* Progress Dashboard */}
      <CosmicCard className="p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium flex items-center">
            <Target className="h-4 w-4 mr-2 text-green-400" />
            Today's Progress
          </h3>
          <Badge variant="outline" className="text-xs">
            <TrendingUp className="h-3 w-3 mr-1" />
            3 day streak
          </Badge>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span>Daily goals</span>
            <span>2/3 complete</span>
          </div>
          <Progress value={66} className="h-2" />
        </div>
      </CosmicCard>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto mb-4 space-y-4 pb-4">
        {messages.length === 0 && (
          <div className="space-y-4">
            <div className="text-center p-6 text-muted-foreground">
              <Target className="h-12 w-12 text-green-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-1">Your Soul Coach is ready</h3>
              <p className="text-sm max-w-xs mx-auto">
                Let's turn your goals into actionable steps. What would you like to achieve?
              </p>
            </div>
            
            {/* Quick Actions */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-center text-muted-foreground">Quick Start:</p>
              <div className="grid grid-cols-1 gap-2">
                {quickActions.map((action, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickAction(action)}
                    className="justify-start text-xs h-8"
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
                "max-w-[80%] rounded-2xl p-4",
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
                  {message.sender === "assistant" ? "Soul Coach" : "You"}
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
              
              {/* Action buttons for AI messages */}
              {message.sender === "assistant" && messages.indexOf(message) === messages.length - 1 && (
                <div className="flex space-x-2 mt-3">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs h-7"
                    onClick={() => onSendMessage("Mark this as done")}
                  >
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Done
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs h-7"
                    onClick={() => onSendMessage("Schedule this for later")}
                  >
                    <Calendar className="h-3 w-3 mr-1" />
                    Schedule
                  </Button>
                </div>
              )}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="cosmic-card border border-green-200/20 max-w-[80%] rounded-2xl p-4">
              <div className="flex items-center space-x-2">
                <Target className="h-4 w-4 text-green-400" />
                <p className="text-xs font-medium">Soul Coach</p>
              </div>
              <div className="flex items-center space-x-2 mt-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <p className="text-sm">Analyzing your goals...</p>
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
            placeholder="What's your next goal or challenge?"
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
          Goal-focused coaching powered by your Soul Blueprint
        </p>
      </div>
    </>
  );
};

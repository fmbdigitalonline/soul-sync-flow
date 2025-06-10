
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
import { MoodTracker } from "./MoodTracker";
import { ReflectionPrompts } from "./ReflectionPrompts";
import { InsightJournal } from "./InsightJournal";

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
  const [showMoodTracker, setShowMoodTracker] = useState(false);
  const [showReflectionPrompts, setShowReflectionPrompts] = useState(false);
  const [showInsightJournal, setShowInsightJournal] = useState(false);

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

  const handleMoodSelect = (mood: string, energy: string) => {
    const moodMessage = `I'm feeling ${mood.toLowerCase()} with ${energy.toLowerCase()} energy right now. Help me understand what this might mean for me today.`;
    onSendMessage(moodMessage);
    setShowMoodTracker(false);
  };

  const handleInsightSave = (insight: string, tags: string[]) => {
    const insightMessage = `I want to share an insight: "${insight}". This feels like it's about: ${tags.join(', ')}. Help me explore this deeper.`;
    onSendMessage(insightMessage);
    setShowInsightJournal(false);
  };

  return (
    <>
      {/* Soul Compass Dashboard */}
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
        
        <div className="flex gap-2 mb-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowMoodTracker(!showMoodTracker)}
            className="text-xs h-7 border-soul-purple/30"
          >
            <Heart className="h-3 w-3 mr-1" />
            Check-in
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowReflectionPrompts(!showReflectionPrompts)}
            className="text-xs h-7 border-soul-purple/30"
          >
            <Sparkles className="h-3 w-3 mr-1" />
            Reflect
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowInsightJournal(!showInsightJournal)}
            className="text-xs h-7 border-soul-purple/30"
          >
            <Star className="h-3 w-3 mr-1" />
            Journal
          </Button>
        </div>
        
        <div className="text-xs text-muted-foreground">
          Your Soul Guide is here to help you understand yourself more deeply and navigate life's complexities with wisdom.
        </div>
      </CosmicCard>

      {/* Conditional Components */}
      {showMoodTracker && <MoodTracker onMoodSelect={handleMoodSelect} />}
      {showReflectionPrompts && <ReflectionPrompts onPromptSelect={onSendMessage} />}
      {showInsightJournal && <InsightJournal onInsightSave={handleInsightSave} />}

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto mb-4 space-y-4 pb-4">
        {messages.length === 0 && (
          <div className="text-center p-6 text-muted-foreground">
            <Heart className="h-12 w-12 text-soul-purple mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-1">Your Soul Guide awaits</h3>
            <p className="text-sm max-w-xs mx-auto">
              Share what's on your heart and mind. Let's explore the deeper patterns together.
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
                {message.sender === "assistant" ? (
                  <Heart className="h-4 w-4 text-soul-purple" />
                ) : (
                  <User className="h-4 w-4" />
                )}
                <p className="text-xs font-medium">
                  {message.sender === "assistant" ? "Soul Guide" : "You"}
                </p>
                {message.sender === "assistant" && (
                  <Badge variant="outline" className="text-xs border-soul-purple/30">
                    <Star className="h-3 w-3 mr-1" />
                    Insight
                  </Badge>
                )}
              </div>
              <p className="text-sm leading-relaxed">{message.content}</p>
              
              {/* Reflection buttons for AI messages */}
              {message.sender === "assistant" && messages.indexOf(message) === messages.length - 1 && (
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

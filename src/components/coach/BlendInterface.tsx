
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  SendHorizontal, 
  ArrowRight, 
  Loader2,
  Sparkles,
  MessageSquare
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Message } from "@/hooks/use-ai-coach";
import { useLanguage } from "@/contexts/LanguageContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { SessionFeedback } from "@/components/memory/SessionFeedback";

interface BlendInterfaceProps {
  messages: Message[];
  isLoading: boolean;
  onSendMessage: (message: string) => void;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  streamingContent: string;
  isStreaming: boolean;
  sessionId: string;
}

export const BlendInterface: React.FC<BlendInterfaceProps> = ({
  messages,
  isLoading,
  onSendMessage,
  messagesEndRef,
  streamingContent,
  isStreaming,
  sessionId,
}) => {
  const [inputValue, setInputValue] = useState("");
  const [showFeedback, setShowFeedback] = useState(false);
  const { t } = useLanguage();
  const isMobile = useIsMobile();

  const handleSendMessage = () => {
    if (inputValue.trim() === "") return;
    onSendMessage(inputValue);
    setInputValue("");
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleToggleFeedback = () => {
    setShowFeedback(!showFeedback);
  };

  // Show feedback form when there are messages and not currently loading
  const shouldShowFeedbackOption = messages.length > 2 && !isLoading && !isStreaming;

  return (
    <div className="flex flex-col h-full w-full">
      {/* Main Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 pt-2 pb-4 space-y-4 min-h-0">
        {messages.length === 0 && (
          <div className="space-y-4">
            <div className="text-center p-6 text-muted-foreground">
              <div className={cn("bg-gradient-to-br from-soul-purple to-soul-teal rounded-full mx-auto mb-4 flex items-center justify-center", isMobile ? "w-12 h-12" : "w-16 h-16")}>
                <Sparkles className={cn("text-white", isMobile ? "h-6 w-6" : "h-8 w-8")} />
              </div>
              <h3 className={cn("font-medium mb-2", isMobile ? "text-lg" : "text-xl")}>
                <span className="gradient-text">Soul Companion Ready</span>
              </h3>
              <p className={cn("max-w-md mx-auto text-gray-600", isMobile ? "text-sm" : "text-base")}>
                I blend productivity coaching with personal growth guidance, adapting to your unique personality and current needs.
              </p>
            </div>
          </div>
        )}

        {/* Render Messages */}
        {messages.map((message, idx) => {
          if (message.sender === "user") {
            return (
              <div key={message.id} className="w-full mx-auto max-w-4xl rounded-2xl border bg-gradient-to-r from-soul-purple to-soul-teal text-white text-base px-6 py-4 my-3">
                <div className="flex items-center gap-3 mb-2">
                  <ArrowRight className="h-4 w-4 text-white" />
                  <span className="text-sm font-medium">You</span>
                </div>
                <div className="text-base leading-relaxed whitespace-pre-line">
                  {message.content}
                </div>
              </div>
            );
          } else {
            return (
              <div key={message.id} className="w-full mx-auto max-w-4xl rounded-2xl border bg-white/80 backdrop-blur-sm text-gray-900 px-6 py-4 my-3 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-6 h-6 bg-gradient-to-br from-soul-purple to-soul-teal rounded-full flex items-center justify-center flex-shrink-0">
                    <Sparkles className="h-3 w-3 text-white" />
                  </div>
                  <span className="text-sm font-medium text-soul-purple">Soul Companion</span>
                </div>
                <div className="text-base leading-relaxed whitespace-pre-line pl-9">
                  {message.content}
                </div>
              </div>
            );
          }
        })}

        {/* Streaming Message */}
        {isStreaming && streamingContent && (
          <div className="w-full mx-auto max-w-4xl rounded-2xl border bg-white/80 backdrop-blur-sm text-gray-900 px-6 py-4 my-3 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-6 h-6 bg-gradient-to-br from-soul-purple to-soul-teal rounded-full flex items-center justify-center flex-shrink-0">
                <Sparkles className="h-3 w-3 text-white" />
              </div>
              <span className="text-sm font-medium text-soul-purple">Soul Companion</span>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-soul-purple rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-soul-purple rounded-full animate-pulse delay-75"></div>
                <div className="w-2 h-2 bg-soul-purple rounded-full animate-pulse delay-150"></div>
              </div>
            </div>
            <div className="text-base leading-relaxed whitespace-pre-line pl-9">
              {streamingContent}
              <span className="inline-block w-2 h-5 bg-soul-purple ml-1 animate-pulse"></span>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && !isStreaming && (
          <div className="flex justify-start">
            <div className={cn("border border-soul-purple/20 max-w-[80%] rounded-2xl bg-white/80 backdrop-blur-sm p-4", isMobile ? "p-3" : "p-4")}>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-gradient-to-br from-soul-purple to-soul-teal rounded-full flex items-center justify-center flex-shrink-0">
                  <Sparkles className="h-3 w-3 text-white" />
                </div>
                <p className="text-sm font-medium text-soul-purple">Soul Companion</p>
              </div>
              <div className="flex items-center space-x-2 mt-3 pl-9">
                <Loader2 className="h-4 w-4 animate-spin text-soul-purple" />
                <p className="text-sm text-gray-600">Thinking and preparing a thoughtful response...</p>
              </div>
            </div>
          </div>
        )}

        {/* Session Feedback Section */}
        {showFeedback && (
          <div className="w-full mx-auto max-w-4xl">
            <SessionFeedback
              sessionId={sessionId}
              sessionSummary="Soul Companion conversation session"
              onFeedbackSubmitted={() => setShowFeedback(false)}
            />
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="sticky bottom-0 pb-4 px-4">
        {/* Feedback Toggle Button */}
        {shouldShowFeedbackOption && !showFeedback && (
          <div className="flex justify-center mb-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleToggleFeedback}
              className="text-sm border-soul-purple/30 text-soul-purple hover:bg-soul-purple/5"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Rate this conversation
            </Button>
          </div>
        )}

        <div className="flex items-center space-x-3 p-3 border border-soul-purple/20 bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Share what's on your mind - I'm here to help with both productivity and personal growth..."
            className="flex-1 border-0 focus-visible:ring-0 bg-transparent text-base placeholder:text-gray-500"
            disabled={isLoading || isStreaming}
          />
          <Button
            size="icon"
            onClick={handleSendMessage}
            disabled={inputValue.trim() === "" || isLoading || isStreaming}
            className="bg-gradient-to-r from-soul-purple to-soul-teal hover:shadow-lg rounded-xl flex-shrink-0"
          >
            <SendHorizontal className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-center text-muted-foreground mt-2">
          Integrated coaching combining productivity strategies with personal growth insights
        </p>
      </div>
    </div>
  );
};

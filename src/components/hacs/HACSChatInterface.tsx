import React, { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SendHorizontal, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { ConversationMessage } from "@/hooks/use-hacs-conversation";
import { useOptimisticMessages, OptimisticMessage } from "@/hooks/use-optimistic-messages";
import { useStreamingMessage } from "@/hooks/use-streaming-message";
import { SoulOrbLoading } from "@/components/ui/soul-orb-loading";
import { HACSErrorDisplay } from "./HACSErrorDisplay";

interface HACSChatInterfaceProps {
  messages: ConversationMessage[];
  isLoading: boolean;
  onSendMessage: (message: string) => Promise<void>;
}

export const HACSChatInterface: React.FC<HACSChatInterfaceProps> = ({
  messages,
  isLoading,
  onSendMessage,
}) => {
  const [inputValue, setInputValue] = useState("");
  const [error, setError] = useState<Error | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Optimistic message handling
  const {
    optimisticMessages,
    addOptimisticUserMessage,
    confirmOptimisticMessage,
    markOptimisticMessageError,
    clearOptimisticMessages,
    addAIResponseMessage,
    hasPendingMessage
  } = useOptimisticMessages();
  
  // Enhanced streaming for soul orb responses
  const {
    streamingContent,
    isStreaming,
    streamText,
    resetStreaming
  } = useStreamingMessage();
  
  // Combine actual messages with optimistic messages for display
  const displayMessages: (ConversationMessage | OptimisticMessage)[] = [...messages, ...optimisticMessages];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [displayMessages, streamingContent]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading || hasPendingMessage) return;
    
    const messageToSend = inputValue.trim();
    setInputValue("");
    setError(null);
    
    // Add optimistic user message immediately
    const optimisticId = addOptimisticUserMessage(messageToSend);
    
    try {
      await onSendMessage(messageToSend);
      // Message was sent successfully, the actual message will come through props
      // Clear optimistic messages since they'll be replaced by real ones
      clearOptimisticMessages();
      resetStreaming();
    } catch (error) {
      console.error('Soul Orb connection failed:', error);
      setError(error as Error);
      markOptimisticMessageError(optimisticId);
      setInputValue(messageToSend); // Restore message for retry
    }
  };
  
  const handleRetry = () => {
    if (inputValue.trim()) {
      handleSendMessage();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground">HACS Intelligence System</h2>
        <p className="text-sm text-muted-foreground">Pure intelligence learning - no fallbacks</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {displayMessages.length === 0 && !isStreaming && (
          <div className="text-center text-muted-foreground py-8">
            <p className="font-inter">Start a conversation to begin intelligence learning</p>
          </div>
        )}
        
        {displayMessages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex",
              message.role === "user" ? "justify-end" : "justify-start"
            )}
          >
            <div
              className={cn(
                "max-w-[70%] rounded-lg p-3 transition-all duration-200",
                message.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground",
                'isPending' in message && message.isPending && "opacity-70",
                'isError' in message && message.isError && "bg-destructive/10 border border-destructive/20"
              )}
            >
              <p className="text-sm font-inter">
                {message.content}
                {'isPending' in message && message.isPending && (
                  <span className="ml-2 inline-block w-2 h-2 bg-current opacity-50 rounded-full animate-pulse" />
                )}
              </p>
              {message.isQuestion && message.module !== 'CNR' && (
                <div className="mt-2 px-2 py-1 bg-accent/50 rounded text-xs font-inter">
                  Question from: {message.module}
                </div>
              )}
              {/* CNR questions are handled by FloatingHACSOrb - don't display here */}
              {'isError' in message && message.isError && (
                <div className="mt-2 text-xs text-destructive font-inter">
                  Failed to send - please try again
                </div>
              )}
            </div>
          </div>
        ))}
        
        {/* Streaming response display */}
        {isStreaming && streamingContent && (
          <div className="flex justify-start">
            <div className="bg-muted rounded-lg p-3 max-w-[70%]">
              <p className="text-sm text-muted-foreground font-inter">
                {streamingContent}
                <span className="ml-1 inline-block w-1 h-4 bg-soul-purple animate-pulse" />
              </p>
            </div>
          </div>
        )}
        
        {/* Soul Orb loading state */}
        {isLoading && !isStreaming && (
          <div className="flex justify-start">
            <SoulOrbLoading message="Soul Orb is connecting..." />
          </div>
        )}
        
        {/* Error display */}
        {error && (
          <div className="flex justify-start">
            <HACSErrorDisplay error={error} onRetry={handleRetry} />
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border">
        <div className="flex space-x-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            disabled={isLoading || hasPendingMessage}
            className="flex-1"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading || hasPendingMessage}
            size="sm"
          >
            {(isLoading || hasPendingMessage) ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <SendHorizontal className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
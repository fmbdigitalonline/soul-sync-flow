import React, { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SendHorizontal, Loader2, Square } from "lucide-react";
import { cn } from "@/lib/utils";
import { ConversationMessage } from "@/hooks/use-hacs-conversation";
import { TypewriterText } from "@/components/coach/TypewriterText";
import { ThinkingDots } from "./ThinkingDots";
import { useGlobalChatState } from "@/hooks/use-global-chat-state";
import { useHACSConversationAdapter } from "@/hooks/use-hacs-conversation-adapter";
import { VFPGraphFeedback } from "@/components/coach/VFPGraphFeedback";
import { useIsMobile } from "@/hooks/use-mobile";
import { InteractiveSentenceText } from "@/components/coach/InteractiveSentenceText";
import { SentenceActionButtons, SentenceAction } from "@/components/coach/SentenceActionButtons";
import { toast } from "sonner";

interface HACSChatInterfaceProps {
  messages: ConversationMessage[];
  isLoading: boolean;
  isStreamingResponse?: boolean;
  onSendMessage: (message: string) => Promise<void>;
  onStreamingComplete?: (messageId: string) => void;
  onStopStreaming?: () => void;
  onFeedback?: (messageId: string, isPositive: boolean) => void;
  onAddOptimisticMessage?: (message: ConversationMessage) => void;
}

export const HACSChatInterface: React.FC<HACSChatInterfaceProps> = ({
  messages,
  isLoading,
  isStreamingResponse = false,
  onSendMessage,
  onStreamingComplete,
  onStopStreaming,
  onFeedback,
  onAddOptimisticMessage,
}) => {
  const [inputValue, setInputValue] = useState("");
  const [initialMessageCount, setInitialMessageCount] = useState(0);
  const [selectedSentences, setSelectedSentences] = useState<Record<string, string | null>>({});
  const [isProcessingAction, setIsProcessingAction] = useState(false);
  const [loadingAction, setLoadingAction] = useState<SentenceAction | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { updateChatLoading } = useGlobalChatState();
  const { isMobile } = useIsMobile();

  // Handle sentence selection toggle
  const handleSentenceSelect = (messageId: string, sentence: string | null) => {
    setSelectedSentences(prev => ({
      ...prev,
      [messageId]: sentence
    }));
  };

  // Handle sentence action buttons
  const handleSentenceAction = async (action: SentenceAction, sentence: string) => {
    const prompts: Record<string, string> = {
      go_deeper: `Tell me more about: "${sentence}"`,
      next_action: `What's my next best action regarding: "${sentence}"`,
      challenge: `Help me question or challenge this: "${sentence}"`,
    };
    
    if (action === "save_insight") {
      toast.success("Insight saved!");
      setSelectedSentences({});
      return;
    }
    
    const prompt = prompts[action];
    if (!prompt) return;
    
    setIsProcessingAction(true);
    setLoadingAction(action);
    
    try {
      setSelectedSentences({}); // Clear selection
      await onSendMessage(prompt);
    } catch (error) {
      console.error("Failed to send action:", error);
      toast.error("Failed to send message");
    } finally {
      setIsProcessingAction(false);
      setLoadingAction(null);
    }
  };

  // Track initial message count to avoid animating historical messages
  useEffect(() => {
    if (initialMessageCount === 0 && messages.length > 0) {
      setInitialMessageCount(messages.length);
    }
  }, [messages.length, initialMessageCount]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Update global chat loading state
  useEffect(() => {
    updateChatLoading(isLoading);
  }, [isLoading, updateChatLoading]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
    
    const messageToSend = inputValue.trim();
    setInputValue(""); // Clear input immediately for responsive UI
    
    try {
      await onSendMessage(messageToSend); // Let adapter handle message state
    } catch (error) {
      console.error('Failed to send message:', error);
      setInputValue(messageToSend); // Restore on error
    }
  };

  const handleStopStreaming = () => {
    if (onStopStreaming) {
      onStopStreaming();
    }
  };

  const handleButtonClick = () => {
    if (isStreamingResponse) {
      handleStopStreaming();
    } else {
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
    <div className="flex flex-col h-full relative">

      {/* Messages */}
      <ScrollArea className={cn(
        "flex-1",
        isMobile
          ? "h-[calc(100%-10rem)]"
          : "h-[calc(100%-5rem)]"
      )}>
        <div className={cn(
          "px-3 py-2 space-y-3",
          isMobile ? "pb-32" : "pb-24"
        )}>
          {messages.length === 0 && (
            <div className="text-center text-muted-foreground py-4">
              <p>Start a conversation to begin intelligence learning</p>
            </div>
          )}
          
          {messages.map((message, index) => {
            const isNewMessage = index >= initialMessageCount;
            return (
              <div
                key={message.id}
                className={cn(
                  "w-full py-2",
                  message.role === "user" ? "text-right" : "text-left"
                )}
              >
                {message.role === "user" ? (
                  <div className="inline-block bg-primary text-primary-foreground rounded-lg p-3 max-w-[85%] sm:max-w-[70%]">
                    <p className="text-sm">{message.content}</p>
                    {message.isQuestion && (
                      <div className="mt-2 text-xs opacity-70">
                        Question from: {message.module}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="w-full">
                    <div className="text-sm leading-relaxed text-muted-foreground">
                      {isNewMessage ? (
                        <TypewriterText 
                          text={message.content} 
                          isStreaming={message.isStreaming || false}
                          speed={45}
                          messageId={message.id}
                          onStreamingComplete={onStreamingComplete}
                        />
                      ) : (
                        <InteractiveSentenceText
                          text={message.content}
                          selectedSentence={selectedSentences[message.id] || null}
                          onSentenceSelect={(sentence) => handleSentenceSelect(message.id, sentence)}
                          disabled={isLoading || isProcessingAction}
                        />
                      )}
                    </div>
                    
                    {/* Inline action buttons when sentence is selected */}
                    {selectedSentences[message.id] && (
                      <div className="mt-3 pt-2 border-t border-border/30">
                        <SentenceActionButtons
                          selectedSentence={selectedSentences[message.id]!}
                          onAction={handleSentenceAction}
                          isLoading={isProcessingAction}
                          loadingAction={loadingAction}
                        />
                      </div>
                    )}
                    
                    {message.isQuestion && (
                      <div className="mt-2 text-xs text-muted-foreground opacity-70">
                        Question from: {message.module}
                      </div>
                    )}
                    {/* Add feedback for AI messages */}
                    {!message.isQuestion && onFeedback && (
                      <VFPGraphFeedback
                        messageId={message.id}
                        onFeedbackGiven={(isPositive) => onFeedback(message.id, isPositive)}
                      />
                    )}
                  </div>
                )}
              </div>
            );
          })}
          
          {isLoading && !isStreamingResponse && (
            <div className="w-full py-2 text-left">
              <ThinkingDots className="ml-2" isThinking={isLoading && !isStreamingResponse} />
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input - Sticky to bottom */}
      <div
        className={cn(
          "left-0 right-0 px-3 pb-4 pt-2",
          isMobile
            ? "fixed"
            : "absolute bottom-4"
        )}
        style={isMobile ? { bottom: "calc(84px + env(safe-area-inset-bottom))" } : undefined}
      >
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2 bg-card border border-border/60 rounded-full shadow-lg px-3 py-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              disabled={isLoading}
              className="flex-1 text-base border-0 shadow-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
            />
            <Button
              onClick={handleButtonClick}
              disabled={!inputValue.trim() && !isStreamingResponse}
              size="icon"
              className="h-11 w-11 rounded-full"
            >
              {isStreamingResponse ? (
                <Square className="h-5 w-5" />
              ) : isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <SendHorizontal className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
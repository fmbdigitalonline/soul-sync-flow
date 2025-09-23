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
import { useOptimisticMessages } from "@/hooks/use-optimistic-messages";
import { AlertCircle, RotateCcw, X } from "lucide-react";

interface HACSChatInterfaceProps {
  messages: ConversationMessage[];
  isLoading: boolean;
  isStreamingResponse?: boolean;
  onSendMessage: (message: string) => Promise<void>;
  onStreamingComplete?: (messageId: string) => void;
  onStopStreaming?: () => void;
  onFeedback?: (messageId: string, isPositive: boolean) => void;
  retryFailedMessage?: (clientMsgId: string) => Promise<void>; // Step 5: Add retry function
  removeFailedMessage?: (clientMsgId: string, setInputValue: (value: string) => void) => void; // Step 5: Add remove function
}

export const HACSChatInterface: React.FC<HACSChatInterfaceProps> = ({
  messages,
  isLoading,
  isStreamingResponse = false,
  onSendMessage,
  onStreamingComplete,
  onStopStreaming,
  onFeedback,
  retryFailedMessage,
  removeFailedMessage,
}) => {
  const [inputValue, setInputValue] = useState("");
  const [initialMessageCount, setInitialMessageCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { updateChatLoading } = useGlobalChatState();
  const { sortMessages } = useOptimisticMessages();

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

  // Step 4: Sort messages for proper display order
  const sortedMessages = sortMessages(messages);

  // Update global chat loading state
  useEffect(() => {
    updateChatLoading(isLoading);
  }, [isLoading, updateChatLoading]);

  const handleSendMessage = async () => {
    console.log('🖱️ BUTTON CLICK: Send message button clicked', {
      inputValue: inputValue.substring(0, 50),
      inputValueLength: inputValue.length,
      inputValueTrimmed: inputValue.trim().length,
      isLoading,
      isStreamingResponse
    });
    
    if (!inputValue.trim()) {
      console.warn('⚠️ BUTTON CLICK: Empty input value, not sending');
      return;
    }
    
    if (isLoading) {
      console.warn('⚠️ BUTTON CLICK: Currently loading, not sending message');
      return;
    }
    
    const messageToSend = inputValue.trim();
    setInputValue("");
    
    console.log('📤 BUTTON CLICK: Calling onSendMessage with:', messageToSend.substring(0, 50));
    
    try {
      await onSendMessage(messageToSend);
      console.log('✅ BUTTON CLICK: Message sent successfully');
    } catch (error) {
      console.error('❌ BUTTON CLICK: Failed to send message:', error);
      // Put the message back if it failed
      setInputValue(messageToSend);
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

  // Step 5: Handle retry for failed messages
  const handleRetryMessage = (message: ConversationMessage) => {
    if (retryFailedMessage && message.client_msg_id) {
      retryFailedMessage(message.client_msg_id);
    }
  };

  // Step 5: Handle remove failed message  
  const handleRemoveFailedMessage = (clientMsgId: string) => {
    if (removeFailedMessage) {
      removeFailedMessage(clientMsgId, setInputValue);
    }
  };

  return (
    <div className="flex flex-col h-full relative">

      {/* Messages */}
      <ScrollArea className="flex-1 h-[calc(100%-5rem)]">
        <div className="px-3 py-2 pb-20 space-y-3">
          {sortedMessages.length === 0 && (
            <div className="text-center text-muted-foreground py-4">
              <p>Start a conversation to begin intelligence learning</p>
            </div>
          )}
          
          {sortedMessages.map((message, index) => {
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
                  <div className="inline-block bg-primary text-primary-foreground rounded-lg p-3 max-w-[85%] sm:max-w-[70%] relative">
                    <p className="text-sm">{message.content}</p>
                    {message.isQuestion && (
                      <div className="mt-2 text-xs opacity-70">
                        Question from: {message.module}
                      </div>
                    )}
                    
                    {/* Step 5: Status indicators and error recovery */}
                    {message.status === 'sending' && (
                      <div className="mt-1 flex items-center gap-1 text-xs opacity-70">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        <span>Sending...</span>
                      </div>
                    )}
                    
                    {message.status === 'error' && (
                      <div className="mt-2 flex items-center gap-2 text-xs">
                        <AlertCircle className="h-3 w-3 text-destructive" />
                        <span className="text-destructive">Failed to send</span>
                        <button
                          onClick={() => handleRetryMessage(message)}
                          className="flex items-center gap-1 text-primary hover:text-primary/80 underline"
                        >
                          <RotateCcw className="h-3 w-3" />
                          Retry
                        </button>
                        <button
                          onClick={() => handleRemoveFailedMessage(message.client_msg_id!)}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <X className="h-3 w-3" />
                        </button>
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
                        message.content
                      )}
                    </div>
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
      <div className="absolute bottom-0 left-0 right-0 bg-background px-2 py-1">
        <div className="flex space-x-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            disabled={isLoading}
            className="flex-1 text-base pb-[env(safe-area-inset-bottom)]"
          />
          <Button
            onClick={handleButtonClick}
            disabled={!inputValue.trim() && !isStreamingResponse}
            size="lg"
            className="h-14 px-4"
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
  );
};
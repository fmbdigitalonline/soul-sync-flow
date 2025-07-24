import React, { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SendHorizontal, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { ConversationMessage } from "@/hooks/use-hacs-conversation";

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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;
    
    const messageToSend = inputValue.trim();
    setInputValue("");
    
    try {
      await onSendMessage(messageToSend);
    } catch (error) {
      console.error('Failed to send message:', error);
      // Put the message back if it failed
      setInputValue(messageToSend);
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

      {/* Messages */}
      <ScrollArea className="flex-1">
        <div className="px-3 py-2 space-y-3">
          {messages.length === 0 && (
            <div className="text-center text-muted-foreground py-4">
              <p>Start a conversation to begin intelligence learning</p>
            </div>
          )}
          
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "w-full py-2",
                message.role === "user" ? "text-right" : "text-left"
              )}
            >
              <div className="w-full">
                <p className={cn(
                  "text-sm leading-relaxed",
                  message.role === "user" 
                    ? "text-foreground" 
                    : "text-muted-foreground"
                )}>
                  {message.content}
                </p>
                {message.isQuestion && (
                  <div className="mt-2 text-xs text-muted-foreground opacity-70">
                    Question from: {message.module}
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="w-full py-2 text-left">
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                <span className="text-sm text-muted-foreground">HACS is thinking...</span>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="px-3 py-3">
        <div className="flex space-x-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            disabled={isLoading}
            className="flex-1 h-12 text-base"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            size="lg"
            className="h-12 px-4"
          >
            {isLoading ? (
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
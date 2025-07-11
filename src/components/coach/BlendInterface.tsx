
import React, { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Loader2, MessageCircle } from 'lucide-react';
import { SlowStreamingMessage } from './SlowStreamingMessage';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  isStreaming?: boolean;
}

interface BlendInterfaceProps {
  messages: Message[];
  isLoading: boolean;
  onSendMessage: (message: string) => void;
  personaReady?: boolean;
  vfpGraphStatus?: any;
  onFeedback?: (feedback: any) => void;
  hideMessageOrbs?: boolean;
}

export const BlendInterface: React.FC<BlendInterfaceProps> = ({
  messages,
  isLoading,
  onSendMessage,
  personaReady = true,
  vfpGraphStatus,
  onFeedback,
  hideMessageOrbs = false
}) => {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (inputValue.trim() && !isLoading) {
      onSendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (messages.length === 0) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center space-y-4 max-w-md">
            <MessageCircle className="h-16 w-16 mx-auto text-primary opacity-50" />
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Welcome to Soul Companion
              </h3>
              <p className="text-muted-foreground">
                Your integrated AI companion for coaching and guidance. How can I help you today?
              </p>
            </div>
          </div>
        </div>

        <div className="border-t bg-background p-4">
          <div className="flex gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1"
              disabled={isLoading}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading}
              size="icon"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4 max-w-4xl mx-auto">
          {messages.map((message) => {
            if (message.isUser) {
              return (
                <div key={message.id} className="flex justify-end">
                  <div className="bg-primary text-primary-foreground rounded-lg px-4 py-2 max-w-xs md:max-w-md">
                    <p className="text-sm">{message.content}</p>
                  </div>
                </div>
              );
            }

            // AI messages - render without orb if hideMessageOrbs is true
            if (hideMessageOrbs) {
              return (
                <div key={message.id} className="flex justify-start">
                  <div className="bg-muted rounded-lg px-4 py-2 max-w-xs md:max-w-md">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-primary">AI Companion</span>
                    </div>
                    <p className="text-sm text-foreground">{message.content}</p>
                  </div>
                </div>
              );
            }

            // Default rendering with orb (for backward compatibility)
            return (
              <SlowStreamingMessage
                key={message.id}
                content={message.content}
                isStreaming={message.isStreaming || false}
                speed={50}
              />
            );
          })}
          
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      <div className="border-t bg-background p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1"
              disabled={isLoading}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading}
              size="icon"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

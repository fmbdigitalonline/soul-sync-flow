import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SendHorizontal, Loader2, Square } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TypewriterText } from '@/components/coach/TypewriterText';
import { ThinkingDots } from '@/components/hacs/ThinkingDots';
import { useHACSGrowthConversation } from '@/hooks/use-hacs-growth-conversation';
import { useHacsIntelligence } from '@/hooks/use-hacs-intelligence';

interface SpiritualGuideInterfaceProps {
  userDisplayName?: string;
  coreTraits?: string[];
}

export const SpiritualGuideInterface: React.FC<SpiritualGuideInterfaceProps> = ({
  userDisplayName = "Seeker",
  coreTraits = []
}) => {
  const [inputValue, setInputValue] = useState('');
  const [initialMessageCount, setInitialMessageCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { 
    messages, 
    isLoading,
    isStreamingResponse,
    sendMessage,
    onStreamingComplete,
    onStopStreaming
  } = useHACSGrowthConversation();
  
  const { refreshIntelligence } = useHacsIntelligence();

  // Track initial message count to avoid animating historical messages
  useEffect(() => {
    if (initialMessageCount === 0 && messages.length > 0) {
      setInitialMessageCount(messages.length);
    }
  }, [messages.length, initialMessageCount]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;
    
    const messageToSend = inputValue.trim();
    setInputValue('');
    
    console.log('🌱 Spiritual Guide - Sending message:', messageToSend);
    
    try {
      await sendMessage(messageToSend);
      // Refresh intelligence after successful message
      await refreshIntelligence();
    } catch (error) {
      console.error('❌ Failed to send spiritual message:', error);
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
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full relative">

      {/* Messages */}
      <ScrollArea className="flex-1 h-[calc(100%-5rem)]">
        <div className="px-3 py-2 pb-20 space-y-3">
          {messages.length === 0 && (
            <div className="text-center text-muted-foreground py-4 space-y-4">
              <div className="space-y-2">
                <h3 className="text-lg font-medium text-soul-purple">Welcome, {userDisplayName}</h3>
                <p className="text-sm">Begin your spiritual growth journey with guided conversation</p>
              </div>
              
              {/* Core Traits Display */}
              {coreTraits.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">Your Core Essence:</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {coreTraits.map((trait, index) => (
                      <span 
                        key={index}
                        className="px-3 py-1 bg-soul-purple/10 text-soul-purple text-xs rounded-full border border-soul-purple/20"
                      >
                        {trait}
                      </span>
                    ))}
                  </div>
                </div>
              )}
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
                  <div className="inline-block bg-soul-purple text-white rounded-lg p-3 max-w-[85%] sm:max-w-[70%]">
                    <p className="text-sm">{message.content}</p>
                  </div>
                ) : (
                  <div className="w-full">
                    <div className="text-sm leading-relaxed text-muted-foreground">
                      {isNewMessage ? (
                        <TypewriterText 
                          text={message.content} 
                          isStreaming={true}
                          speed={60}
                          messageId={message.id}
                          onStreamingComplete={onStreamingComplete}
                        />
                      ) : (
                        message.content
                      )}
                    </div>
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
            placeholder="Share your spiritual thoughts..."
            disabled={isLoading}
            className="flex-1 text-base pb-[env(safe-area-inset-bottom)]"
          />
          <Button
            onClick={handleButtonClick}
            disabled={!inputValue.trim() && !isStreamingResponse}
            size="lg"
            className="h-14 px-4 bg-soul-purple hover:bg-soul-purple/90"
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
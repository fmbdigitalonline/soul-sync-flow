
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Sparkles, User } from 'lucide-react';
import { SlowStreamingMessage } from './SlowStreamingMessage';
import { Message } from '@/services/program-aware-coach-service';
import { IntelligentSoulOrb } from '@/components/ui/intelligent-soul-orb';
import { useHacsIntelligence } from '@/hooks/use-hacs-intelligence';

interface GuideInterfaceProps {
  messages: Message[];
  isLoading: boolean;
  onSendMessage: (message: string) => void;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  streamingContent?: string;
  isStreaming?: boolean;
  userDisplayName?: string;
}

export const GuideInterface: React.FC<GuideInterfaceProps> = ({
  messages,
  isLoading,
  onSendMessage,
  messagesEndRef,
  streamingContent,
  isStreaming = false,
  userDisplayName = 'friend'
}) => {
  const [input, setInput] = useState('');
  
  // Use REAL intelligence data, no hardcoded values
  const { intelligence } = useHacsIntelligence();
  const intelligenceLevel = intelligence?.intelligence_level || 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading && !isStreaming) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  // Scroll to bottom when messages change or streaming updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent, isStreaming, messagesEndRef]);

  const getPlaceholderText = () => {
    return `Share what's on your heart, ${userDisplayName}...`;
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        
        {/* Welcome Message with Orb */}
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <div className="mb-6">
              <IntelligentSoulOrb
                size="lg" 
                pulse={true}
                stage="welcome"
                intelligenceLevel={intelligenceLevel}
                showProgressRing={true}
                showIntelligenceTooltip={false}
              />
            </div>
            <h3 className="text-xl font-semibold mb-2">
              Soul Guide
            </h3>
            <p className="text-muted-foreground max-w-md">
              I'm here to provide gentle guidance and support on your spiritual journey. Share what's on your heart, and let's explore together.
            </p>
          </div>
        )}

        {messages.map((message, index) => (
          <div key={message.id} className="animate-fade-in">
            {message.sender === 'user' ? (
              // User Message
              <div className="flex items-start gap-3 mb-4 justify-end">
                <div className="bg-soul-purple text-white rounded-lg p-3 max-w-[80%]">
                  <p className="text-sm leading-relaxed">{message.content}</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-soul-purple/10 flex items-center justify-center flex-shrink-0">
                  <User className="h-4 w-4 text-soul-purple" />
                </div>
              </div>
            ) : (
              // Assistant Message with Orb and Slow Streaming
              <div className="flex items-start gap-3 mb-6">
                <div className="flex-shrink-0 mt-1">
                  <IntelligentSoulOrb
                    size="sm"
                    pulse={false}
                    speaking={isStreaming && index === messages.length - 1}
                    stage="complete"
                    intelligenceLevel={intelligenceLevel}
                    showProgressRing={false}
                  />
                </div>
                <div className="flex-1">
                  <div className="mb-1">
                    <span className="text-sm font-medium text-soul-purple flex items-center gap-1">
                      <Sparkles className="h-3 w-3" />
                      Soul Guide
                    </span>
                  </div>
                  <div className="bg-soul-purple/5 rounded-lg p-4 border border-soul-purple/10">
                    <SlowStreamingMessage
                      content={
                        // If this is the last message and we're streaming, show streaming content
                        index === messages.length - 1 && isStreaming && !message.content
                          ? streamingContent || ''
                          : message.content
                      }
                      isStreaming={
                        // Only stream if this is the last message and we're actively streaming
                        index === messages.length - 1 && isStreaming && !message.content
                      }
                      speed={85} // Slow, contemplative speed for growth conversations
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
        
        {/* Loading indicator for when waiting for response */}
        {isLoading && !isStreaming && (
          <div className="flex items-start gap-3 mb-4">
            <div className="flex-shrink-0 mt-1">
              <IntelligentSoulOrb
                size="sm"
                pulse={true}
                speaking={true}
                stage="generating"
                intelligenceLevel={intelligenceLevel}
                showProgressRing={false}
              />
            </div>
            <div className="bg-soul-purple/5 rounded-lg p-4 border border-soul-purple/10">
              <div className="flex items-center gap-2 text-soul-purple">
                <div className="w-2 h-2 bg-soul-purple rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-soul-purple rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-soul-purple rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                <span className="text-sm ml-2">Thinking deeply...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t p-4 bg-background">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={getPlaceholderText()}
            disabled={isLoading || isStreaming}
            className="flex-1"
          />
          <Button 
            type="submit" 
            disabled={!input.trim() || isLoading || isStreaming}
            className="bg-soul-purple hover:bg-soul-purple/90"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
};

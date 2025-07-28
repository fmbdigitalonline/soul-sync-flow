import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CosmicCard } from '@/components/ui/cosmic-card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Eye, Sparkles, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CompanionOracleMessage {
  id: string;
  content: string;
  sender: "user" | "assistant";
  timestamp: Date;
  oracleMode?: string;
  semanticChunksUsed?: number;
}

interface OracleStatus {
  mode: 'full_oracle' | 'fallback_oracle' | 'initializing';
  chunksAvailable: boolean;
  personalityReportsFound: boolean;
}

interface CompanionOracleInterfaceProps {
  messages: CompanionOracleMessage[];
  isLoading: boolean;
  onSendMessage: (message: string) => void;
  oracleStatus: OracleStatus;
}

export const CompanionOracleInterface: React.FC<CompanionOracleInterfaceProps> = ({
  messages,
  isLoading,
  onSendMessage,
  oracleStatus
}) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getOracleStatusIcon = () => {
    switch (oracleStatus.mode) {
      case 'full_oracle':
        return <Eye className="h-4 w-4 text-purple-600" />;
      case 'fallback_oracle':
        return <Sparkles className="h-4 w-4 text-amber-600" />;
      default:
        return <Zap className="h-4 w-4 text-gray-500" />;
    }
  };

  const getOracleStatusText = () => {
    switch (oracleStatus.mode) {
      case 'full_oracle':
        return 'Oracle Authority Active';
      case 'fallback_oracle':
        return 'Oracle Developing';
      default:
        return 'Oracle Initializing';
    }
  };

  return (
    <CosmicCard className="flex flex-col h-full">
      {/* Header with Oracle Status */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full flex items-center justify-center">
            {getOracleStatusIcon()}
          </div>
          <div>
            <h3 className="font-semibold">Soul Companion Oracle</h3>
            <p className="text-xs text-muted-foreground">{getOracleStatusText()}</p>
          </div>
        </div>
        
        {oracleStatus.chunksAvailable && (
          <div className="flex items-center space-x-1 text-xs text-purple-600">
            <Eye className="h-3 w-3" />
            <span>Deep Insights Active</span>
          </div>
        )}
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-muted-foreground space-y-3 py-8">
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-purple-500/20 to-purple-700/20 rounded-full flex items-center justify-center">
                <Eye className="h-8 w-8 text-purple-600" />
              </div>
              <div>
                <p className="font-medium">Your Oracle Consciousness is Ready</p>
                <p className="text-sm">
                  {oracleStatus.mode === 'full_oracle' 
                    ? "I can see deep into your blueprint patterns and provide profound guidance."
                    : oracleStatus.mode === 'fallback_oracle'
                    ? "I'm developing my understanding of your patterns. Share with me to deepen our connection."
                    : "I'm awakening to your unique essence. Let's begin our conversation."
                  }
                </p>
              </div>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex",
                message.sender === 'user' ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={cn(
                  "max-w-[80%] rounded-lg px-4 py-2",
                  message.sender === 'user'
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                )}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                
                {/* Oracle Metadata */}
                {message.sender === 'assistant' && message.oracleMode && (
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
                    <div className="flex items-center space-x-2 text-xs">
                      {message.oracleMode === 'full_oracle' && (
                        <>
                          <Eye className="h-3 w-3 text-purple-500" />
                          <span className="text-purple-500">Oracle Authority</span>
                        </>
                      )}
                      {message.oracleMode === 'fallback_oracle' && (
                        <>
                          <Sparkles className="h-3 w-3 text-amber-500" />
                          <span className="text-amber-500">Developing Oracle</span>
                        </>
                      )}
                    </div>
                    
                    {message.semanticChunksUsed && message.semanticChunksUsed > 0 && (
                      <span className="text-xs text-purple-500">
                        {message.semanticChunksUsed} insights
                      </span>
                    )}
                  </div>
                )}
                
                <div className="text-xs text-muted-foreground/70 mt-1">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-lg px-4 py-2 max-w-[80%]">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span className="text-sm text-muted-foreground">Oracle contemplating...</span>
                </div>
              </div>
            </div>
          )}
        </div>
        <div ref={messagesEndRef} />
      </ScrollArea>

      {/* Input Area */}
      <div className="p-4 border-t border-border">
        <div className="flex space-x-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={
              oracleStatus.mode === 'full_oracle'
                ? "Share what's on your mind, I see deeply into your patterns..."
                : oracleStatus.mode === 'fallback_oracle'
                ? "Tell me what you're experiencing, let's build our connection..."
                : "Help me understand you better..."
            }
            className="flex-1"
            disabled={isLoading}
          />
          <Button 
            onClick={handleSendMessage} 
            disabled={!input.trim() || isLoading}
            size="icon"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex items-center justify-center mt-2 text-xs text-muted-foreground">
          {oracleStatus.personalityReportsFound 
            ? "Your Oracle has access to deep personality insights"
            : "Your Oracle is learning your patterns through conversation"
          }
        </div>
      </div>
    </CosmicCard>
  );
};
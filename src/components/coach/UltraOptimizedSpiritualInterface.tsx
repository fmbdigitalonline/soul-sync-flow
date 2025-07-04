
import React, { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Send, Sparkles, User, Zap, Timer, HardDrive } from 'lucide-react';
import { useUltraOptimizedSpiritualCoach } from '@/hooks/use-ultra-optimized-spiritual-coach';
import { TypewriterText } from './TypewriterText';

export const UltraOptimizedSpiritualInterface: React.FC = () => {
  const [input, setInput] = useState('');
  const [inputBlocked, setInputBlocked] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const {
    messages,
    isLoading,
    sendMessage,
    streamingContent,
    isStreaming,
    performanceMetrics,
    storageStatus
  } = useUltraOptimizedSpiritualCoach();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingContent]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !inputBlocked) {
      // Block input very briefly to prevent double-sends
      setInputBlocked(true);
      await sendMessage(input.trim());
      setInput('');
      
      // Unblock input immediately after sending
      setTimeout(() => setInputBlocked(false), 100);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const formatStorageUsage = (used: number, quota: number) => {
    const usedMB = (used / 1024 / 1024).toFixed(1);
    const quotaMB = (quota / 1024 / 1024).toFixed(1);
    const percentage = quota > 0 ? ((used / quota) * 100).toFixed(0) : '0';
    return `${usedMB}MB / ${quotaMB}MB (${percentage}%)`;
  };

  return (
    <Card className="flex flex-col h-full">
      {/* Ultra Performance Dashboard */}
      <div className="p-2 bg-gradient-to-r from-green-50 to-blue-50 border-b flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <Zap className="h-3 w-3 text-green-600" />
          <span className="text-green-700 font-medium">Ultra-Optimized Mode</span>
        </div>
        <div className="flex items-center gap-4 text-gray-600">
          <div className="flex items-center gap-1">
            <Timer className="h-3 w-3" />
            <span>Cache: {performanceMetrics.cacheSize}</span>
          </div>
          <div className="flex items-center gap-1">
            <span>Hit: {(performanceMetrics.cacheHitRate * 100).toFixed(0)}%</span>
          </div>
          <div className="flex items-center gap-1">
            <HardDrive className="h-3 w-3" />
            <span>{formatStorageUsage(storageStatus.used, storageStatus.quota)}</span>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div key={message.id} className="animate-fade-in">
            {message.sender === 'user' ? (
              // User Message
              <div className="flex items-start gap-3 mb-4 justify-end">
                <div className="bg-soul-purple text-white rounded-lg p-3 max-w-[80%]">
                  <p className="text-sm leading-relaxed">{message.content}</p>
                </div>
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-soul-purple/10">
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              </div>
            ) : (
              // Assistant Message
              <div className="flex items-start gap-3 mb-6">
                <Avatar className="h-8 w-8 border border-soul-purple/20">
                  <AvatarFallback className="bg-soul-purple/10 text-soul-purple">
                    <Sparkles className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 space-y-2">
                  <div className={`rounded-lg p-4 border ${
                    message.isEnhanced 
                      ? 'bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200' 
                      : 'bg-soul-purple/5 border-soul-purple/10'
                  }`}>
                    {/* Show streaming content for the last message */}
                    {index === messages.length - 1 && isStreaming && !message.content ? (
                      <TypewriterText
                        text={streamingContent}
                        isStreaming={isStreaming}
                        speed={20}
                      />
                    ) : (
                      <TypewriterText
                        text={message.content}
                        isStreaming={false}
                        speed={20}
                      />
                    )}
                  </div>
                  
                  {message.isEnhanced && (
                    <div className="text-xs text-purple-600 flex items-center gap-1">
                      <Sparkles className="h-3 w-3" />
                      <span>Enhanced with full context - loaded in background</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
        
        {/* Minimal loading indicator */}
        {isLoading && (
          <div className="flex items-start gap-3 mb-4 opacity-60">
            <Avatar className="h-8 w-8 border border-soul-purple/20">
              <AvatarFallback className="bg-soul-purple/10 text-soul-purple">
                <Sparkles className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <div className="bg-soul-purple/5 rounded-lg p-3 border border-soul-purple/10">
              <div className="flex items-center gap-2 text-soul-purple text-sm">
                <div className="w-1 h-1 bg-soul-purple rounded-full animate-pulse"></div>
                <div className="w-1 h-1 bg-soul-purple rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-1 h-1 bg-soul-purple rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                <span className="ml-2">Connecting...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Always-Available Input Area */}
      <div className="border-t p-4 bg-background">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Share what's on your heart..."
            disabled={inputBlocked}
            className="flex-1 min-h-[60px] resize-none"
          />
          <Button 
            type="submit" 
            disabled={!input.trim() || inputBlocked}
            className="bg-soul-purple hover:bg-soul-purple/90 self-end"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
        
        <div className="mt-2 text-xs text-gray-500 text-center">
          Ultra-optimized for instant responses • Sub-second initial reply • Input always available
        </div>
      </div>
    </Card>
  );
};

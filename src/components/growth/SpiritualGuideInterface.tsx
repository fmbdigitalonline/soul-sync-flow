
import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Heart, Brain, Loader2, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useResponsiveLayout } from '@/hooks/use-responsive-layout';
import { IntelligentSoulOrb } from '@/components/ui/intelligent-soul-orb';
import { useHacsIntelligence } from '@/hooks/use-hacs-intelligence';

interface Message {
  id: string;
  content: string;
  sender: "user" | "assistant";
  timestamp: Date;
  isStreaming?: boolean;
}

interface SpiritualGuideInterfaceProps {
  messages: Message[];
  isLoading: boolean;
  onSendMessage: (message: string) => void;
  userDisplayName?: string;
  coreTraits: string[];
}

export const SpiritualGuideInterface: React.FC<SpiritualGuideInterfaceProps> = ({
  messages,
  isLoading,
  onSendMessage,
  userDisplayName = 'friend',
  coreTraits = []
}) => {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { getTextSize, touchTargetSize, isFoldDevice, spacing } = useResponsiveLayout();
  const { intelligence, recordConversationInteraction, getIntelligencePhase } = useHacsIntelligence();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (inputValue.trim() && !isLoading) {
      // Record the interaction for HACS learning
      recordConversationInteraction(inputValue.trim(), 'good');
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

  const getGreetingMessage = () => {
    const traits = coreTraits.slice(0, 2).join(' & ');
    return `Hello ${userDisplayName}! I'm here to support your spiritual journey${traits ? ` as a ${traits}` : ''}. What's calling to your heart today?`;
  };

  // Show welcome screen only if no messages yet
  if (messages.length === 0) {
    return (
      <div className="flex flex-col h-full">
        {/* Welcome Content - Takes most of the space */}
        <div className="flex-1 flex flex-col justify-center px-4 py-6">
          <div className="text-center space-y-6 max-w-md mx-auto">
            <div className="flex justify-center">
              <IntelligentSoulOrb 
                size={isFoldDevice ? "sm" : "md"}
                intelligenceLevel={intelligence?.intelligence_level || 0}
                showProgressRing={true}
                showIntelligenceTooltip={true}
                stage="welcome"
                pulse={true}
              />
            </div>
            
            <div className="space-y-2">
              <h2 className={`font-bold text-gray-800 ${getTextSize('text-lg')}`}>
                {getIntelligencePhase()} Intelligence
              </h2>
              <p className={`text-gray-600 leading-relaxed ${getTextSize('text-sm')}`}>
                {getGreetingMessage()}
              </p>
            </div>

            {/* Status indicator */}
            <div className="space-y-3">
              <div className={`inline-flex items-center gap-2 bg-soul-purple/10 px-4 py-2 rounded-full ${getTextSize('text-xs')}`}>
                <Brain className={`text-soul-purple ${isFoldDevice ? 'h-3 w-3' : 'h-4 w-4'}`} />
                <span className="text-soul-purple font-medium">
                  HACS {getIntelligencePhase()} • {Math.round(intelligence?.intelligence_level || 0)}%
                </span>
              </div>
              
              {coreTraits.length > 0 && (
                <div className="flex flex-wrap justify-center gap-2">
                  {coreTraits.slice(0, 3).map((trait, index) => (
                    <span 
                      key={index}
                      className={`bg-soul-teal/10 text-soul-teal px-2 py-1 rounded-full font-medium ${getTextSize('text-xs')}`}
                    >
                      {trait}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Input Area - Fixed at bottom */}
        <div className="border-t bg-white px-4 py-3">
          <div className="max-w-2xl mx-auto">
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Share what's on your heart..."
                  className={`border-soul-purple/20 focus:border-soul-purple focus:ring-soul-purple/20 rounded-2xl ${getTextSize('text-sm')} ${touchTargetSize}`}
                  disabled={isLoading}
                />
              </div>
              <Button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading}
                className={`bg-gradient-to-r from-soul-purple to-soul-teal hover:shadow-lg transition-all duration-300 rounded-2xl ${touchTargetSize}`}
              >
                {isLoading ? (
                  <Loader2 className={`animate-spin ${isFoldDevice ? 'h-3 w-3' : 'h-4 w-4'}`} />
                ) : (
                  <Heart className={`${isFoldDevice ? 'h-3 w-3' : 'h-4 w-4'}`} />
                )}
              </Button>
            </div>
            
            <p className={`text-center text-gray-500 mt-2 ${getTextSize('text-xs')}`}>
              Your personalized spiritual coach is ready to support your journey
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show conversation interface with input at bottom
  return (
    <div className="flex flex-col h-full">
      {/* Messages Area - Takes most space and scrolls */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="max-w-2xl mx-auto space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-start gap-3 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {/* Avatar for assistant messages */}
              {message.sender === 'assistant' && (
                <div className="flex-shrink-0">
                  <IntelligentSoulOrb 
                    size="sm"
                    intelligenceLevel={intelligence?.intelligence_level || 0}
                    showProgressRing={false}
                    speaking={message.isStreaming}
                    stage="complete"
                  />
                </div>
              )}
              
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm ${
                  message.sender === 'user'
                    ? 'bg-gradient-to-r from-soul-purple to-soul-teal text-white'
                    : 'bg-gray-50 text-gray-800 border border-gray-100'
                }`}
              >
                <div className={`${getTextSize('text-sm')} leading-relaxed whitespace-pre-wrap`}>
                  {message.content}
                  {message.isStreaming && (
                    <span className="inline-block w-2 h-4 bg-current ml-1 animate-pulse" />
                  )}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area - Fixed at bottom */}
      <div className="border-t bg-white px-4 py-3">
        <div className="max-w-2xl mx-auto">
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Continue your spiritual conversation..."
                className={`border-soul-purple/20 focus:border-soul-purple focus:ring-soul-purple/20 rounded-2xl ${getTextSize('text-sm')} ${touchTargetSize}`}
                disabled={isLoading}
              />
            </div>
            <Button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading}
              className={`bg-gradient-to-r from-soul-purple to-soul-teal hover:shadow-lg transition-all duration-300 rounded-2xl ${touchTargetSize}`}
            >
              {isLoading ? (
                <Loader2 className={`animate-spin ${isFoldDevice ? 'h-3 w-3' : 'h-4 w-4'}`} />
              ) : (
                <Send className={`${isFoldDevice ? 'h-3 w-3' : 'h-4 w-4'}`} />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

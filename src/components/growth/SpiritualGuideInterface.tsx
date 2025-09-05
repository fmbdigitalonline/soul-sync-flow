
import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Heart, Loader2, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useResponsiveLayout } from '@/hooks/use-responsive-layout';
import { useHacsIntelligence } from '@/hooks/use-hacs-intelligence';
import { useHACSGrowthConversation } from '@/hooks/use-hacs-growth-conversation';
import { TypewriterText } from '@/components/coach/TypewriterText';
import { ThinkingDots } from '@/components/hacs/ThinkingDots';

interface Message {
  id: string;
  content: string;
  sender: "user" | "assistant";
  timestamp: Date;
  isStreaming?: boolean;
}

interface SpiritualGuideInterfaceProps {
  userDisplayName?: string;
  coreTraits: string[];
}

export const SpiritualGuideInterface: React.FC<SpiritualGuideInterfaceProps> = ({
  userDisplayName = 'friend',
  coreTraits = []
}) => {
  console.log('🎯 COMPONENT INIT: SpiritualGuideInterface initialized', {
    userDisplayName,
    coreTraitsCount: coreTraits.length,
    coreTraits: coreTraits.slice(0, 3),
    timestamp: new Date().toISOString()
  });

  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { getTextSize, touchTargetSize, isFoldDevice, spacing } = useResponsiveLayout();
  const { intelligence, refreshIntelligence } = useHacsIntelligence();
  
  // CRITICAL FIX: Use HACS conversation instead of enhanced AI coach
  const { 
    messages, 
    isLoading, 
    sendMessage: hacseSendMessage 
  } = useHACSGrowthConversation();

  console.log('📊 COMPONENT STATE: Current component state', {
    messagesCount: messages.length,
    isLoading,
    hasIntelligence: !!intelligence,
    intelligenceLevel: intelligence?.intelligence_level,
    inputValueLength: inputValue.length
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    console.log('📜 SCROLL EFFECT: Messages changed, scrolling to bottom', {
      newMessageCount: messages.length,
      timestamp: new Date().toISOString()
    });
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    console.log('🔄 LOADING STATE CHANGE: isLoading state changed', {
      newLoadingState: isLoading,
      messagesCount: messages.length,
      timestamp: new Date().toISOString()
    });
  }, [isLoading]);

  const handleSendMessage = async () => {
    console.log('🚀 SEND TRIGGER: User initiated message send', {
      hasInput: !!inputValue.trim(),
      inputLength: inputValue.trim().length,
      isCurrentlyLoading: isLoading,
      timestamp: new Date().toISOString()
    });

    if (inputValue.trim() && !isLoading) {
      const message = inputValue.trim();
      
      console.log('📝 MESSAGE PREP: Preparing message for send', {
        messageLength: message.length,
        messagePreview: message.substring(0, 50) + (message.length > 50 ? '...' : ''),
        userDisplayName
      });
      
      setInputValue('');
      
      console.log('🔗 HOOK CALL: Calling HACS sendMessage');
      // CRITICAL FIX: Send through HACS conversation for real intelligence updates
      await hacseSendMessage(message);
      
      console.log('🔄 REFRESH: Refreshing intelligence display');
      // Refresh intelligence display after successful conversation
      await refreshIntelligence();
      
      console.log('✅ SEND COMPLETE: Message send process completed from component');
    } else {
      console.log('⛔ SEND BLOCKED: Message send blocked from component', {
        reason: !inputValue.trim() ? 'no_input' : 'loading',
        hasInput: !!inputValue.trim(),
        isLoading
      });
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
    return `Hello ${userDisplayName}! I'm here to support your spiritual journey${traits ? ` based on your unique blueprint` : ''}. What's calling to your heart today?`;
  };

  // Show welcome screen only if no messages yet
  if (messages.length === 0) {
    return (
      <div className="flex flex-col h-full">
        {/* Welcome Content - Takes most of the space */}
        <div className="flex-1 flex flex-col justify-center px-4 py-6 overflow-y-auto">
          <div className="text-center space-y-4 max-w-md mx-auto">
            <div className="flex justify-center">
              <Sparkles className="h-12 w-12 text-soul-purple" />
            </div>
            
            <div className="space-y-2">
              <h2 className={`font-bold text-gray-800 ${getTextSize('text-lg')}`}>
                Your Personal Spiritual Guide
              </h2>
              <p className={`text-gray-600 leading-relaxed ${getTextSize('text-sm')}`}>
                {getGreetingMessage()}
              </p>
            </div>

            {/* User-friendly status indicator */}
            <div className="space-y-2">
              <div className={`inline-flex items-center gap-2 bg-soul-purple/10 px-3 py-1.5 rounded-full ${getTextSize('text-xs')}`}>
                <Heart className={`text-soul-purple ${isFoldDevice ? 'h-3 w-3' : 'h-4 w-4'}`} />
                <span className="text-soul-purple font-medium">
                  Ready to guide {userDisplayName}
                </span>
              </div>
              
              {coreTraits.length > 0 && (
                <div className="flex flex-wrap justify-center gap-1.5">
                  {coreTraits.slice(0, 3).map((trait, index) => (
                    <span 
                      key={index}
                      className={`bg-soul-teal/10 text-soul-teal px-2 py-0.5 rounded-full font-medium ${getTextSize('text-xs')}`}
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
                  placeholder={`Share what's on your heart, ${userDisplayName}...`}
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
              Your personalized spiritual guide is ready to support your journey, {userDisplayName}
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
        <div className="space-y-3">
          {messages.map((message) => (
            message.role === 'user' ? (
              <div key={message.id} className="flex justify-end">
                <div className="inline-block bg-primary text-primary-foreground rounded-lg p-3 max-w-[85%] sm:max-w-[70%]">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium opacity-90">{userDisplayName}</span>
                  </div>
                  <div className={`${getTextSize('text-sm')} leading-relaxed whitespace-pre-wrap`}>
                    {message.content}
                  </div>
                </div>
              </div>
            ) : (
              <div key={message.id} className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  <Sparkles className={`text-soul-purple ${isFoldDevice ? 'h-3 w-3' : 'h-4 w-4'}`} />
                </div>
                <div className="flex-1">
                   <div className={`${getTextSize('text-sm')} leading-relaxed whitespace-pre-wrap text-muted-foreground`}>
                     <TypewriterText 
                       text={message.content}
                       isStreaming={false}
                       speed={60}
                       messageId={message.id}
                     />
                   </div>
                </div>
              </div>
            )
          ))}
          
          {/* Loading indicator */}
          {isLoading && (
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-1">
                <Sparkles className={`text-soul-purple ${isFoldDevice ? 'h-3 w-3' : 'h-4 w-4'}`} />
              </div>
              <div className="flex-1">
                <ThinkingDots isThinking={isLoading} />
              </div>
            </div>
          )}
          
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
                placeholder={`Continue sharing with your guide, ${userDisplayName}...`}
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

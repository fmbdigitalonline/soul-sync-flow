
import React, { useState, useEffect } from 'react';
import { Sparkles, Heart, Brain, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useResponsiveLayout } from '@/hooks/use-responsive-layout';

interface ImmediateGrowthInterfaceProps {
  onSendMessage: (message: string) => void;
  messages: any[];
  isLoading: boolean;
  domain: string;
  userDisplayName?: string;
  coreTraits: string[];
}

export const ImmediateGrowthInterface: React.FC<ImmediateGrowthInterfaceProps> = ({
  onSendMessage,
  messages,
  isLoading,
  domain,
  userDisplayName = 'friend',
  coreTraits = []
}) => {
  const [inputValue, setInputValue] = useState('');
  const { getTextSize, touchTargetSize, isFoldDevice, spacing } = useResponsiveLayout();

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

  const getGreetingMessage = () => {
    const traits = coreTraits.slice(0, 2).join(' & ');
    
    switch (domain) {
      case 'spiritual-growth':
        return `Hello ${userDisplayName}! I'm here to support your spiritual journey${traits ? ` as a ${traits}` : ''}. What's calling to your heart today?`;
      case 'dreams':
        return `Welcome ${userDisplayName}! Let's explore what your soul is dreaming into reality${traits ? `. Your ${traits} nature` : ''} brings unique gifts to this world. What dream is stirring within you?`;
      default:
        return `Hi ${userDisplayName}! I'm your personalized guide, ready to support your growth journey. What would you like to explore?`;
    }
  };

  // Show welcome screen only if no messages yet
  if (messages.length === 0) {
    return (
      <div className={`min-h-[400px] flex flex-col ${spacing.container}`}>
        {/* Welcome Section */}
        <div className="flex-1 flex flex-col justify-center space-y-6">
          <div className="text-center space-y-4">
            <div className={`mx-auto bg-gradient-to-br from-soul-purple to-soul-teal rounded-full flex items-center justify-center shadow-lg ${isFoldDevice ? 'w-12 h-12' : 'w-16 h-16'}`}>
              <Heart className={`text-white ${isFoldDevice ? 'h-6 w-6' : 'h-8 w-8'}`} />
            </div>
            
            <div className="space-y-2">
              <h2 className={`font-bold text-gray-800 ${getTextSize('text-lg')}`}>
                Ready to Connect
              </h2>
              <p className={`text-gray-600 leading-relaxed max-w-md mx-auto ${getTextSize('text-sm')}`}>
                {getGreetingMessage()}
              </p>
            </div>
          </div>

          {/* Status indicator */}
          <div className="text-center space-y-3">
            <div className={`inline-flex items-center gap-2 bg-soul-purple/10 px-4 py-2 rounded-full ${getTextSize('text-xs')}`}>
              <Sparkles className={`text-soul-purple ${isFoldDevice ? 'h-3 w-3' : 'h-4 w-4'}`} />
              <span className="text-soul-purple font-medium">Connected & Ready</span>
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

        {/* Chat Input */}
        <div className="space-y-3">
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
          
          <p className={`text-center text-gray-500 ${getTextSize('text-xs')}`}>
            Your personalized spiritual guide is ready to support your journey
          </p>
        </div>
      </div>
    );
  }

  // Once conversation has started, return null to let GuideInterface take over
  return null;
};

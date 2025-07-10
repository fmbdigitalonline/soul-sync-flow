
import React, { useState } from 'react';
import IntelligentSoulOrb from '@/components/ui/intelligent-soul-orb';
import { useHacsIntelligence } from '@/hooks/use-hacs-intelligence';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Heart, Loader2 } from 'lucide-react';

interface Message {
  id: string;
  content: string;
  sender: "user" | "assistant";
  timestamp: Date;
  agentType?: string;
  isStreaming?: boolean;
}

interface SpiritualGuideInterfaceProps {
  messages?: Message[];
  isLoading?: boolean;
  onSendMessage?: (message: string) => Promise<void>;
  userDisplayName?: string;
  coreTraits?: string[];
}

export const SpiritualGuideInterface: React.FC<SpiritualGuideInterfaceProps> = ({
  messages = [],
  isLoading = false,
  onSendMessage,
  userDisplayName = 'Friend',
  coreTraits = []
}) => {
  const { intelligence, getModuleIntelligence, HACS_MODULES, recordInteraction, getIntelligenceLevel } = useHacsIntelligence();
  const [inputValue, setInputValue] = useState('');

  const handleSoulOrbInteraction = () => {
    // Record interaction with a random HACS module to simulate learning
    const modules = Object.keys(HACS_MODULES) as Array<keyof typeof HACS_MODULES>;
    const randomModule = modules[Math.floor(Math.random() * modules.length)];
    recordInteraction(randomModule, Math.floor(Math.random() * 3) + 1);
  };

  const handleSendMessage = () => {
    if (inputValue.trim() && !isLoading && onSendMessage) {
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

  const currentLevel = getIntelligenceLevel();
  const overallIntelligence = intelligence?.overall_intelligence || 10;

  // Show welcome interface if no messages
  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center space-y-8 p-6 min-h-[600px]">
        {/* Soul Orb with HACS Intelligence */}
        <div className="flex flex-col items-center space-y-6">
          <IntelligentSoulOrb 
            size="xl" 
            onInteraction={handleSoulOrbInteraction}
            className="mb-4"
          />
          
          {/* Intelligence Status */}
          <div className="text-center space-y-2">
            <div className="text-sm font-medium text-gold-400">
              HACS Awakening • {overallIntelligence}%
            </div>
            <div className="text-lg font-bold text-gold-300">
              Awakening Intelligence
            </div>
          </div>

          {/* Core Traits Display */}
          {coreTraits.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2">
              {coreTraits.slice(0, 3).map((trait, index) => (
                <span 
                  key={index}
                  className="bg-soul-teal/10 text-soul-teal px-3 py-1 rounded-full font-medium text-sm"
                >
                  {trait}
                </span>
              ))}
            </div>
          )}

          {/* Greeting Message */}
          <div className="max-w-md text-center">
            <p className="text-muted-foreground leading-relaxed">
              {getGreetingMessage()}
            </p>
          </div>
        </div>

        {/* HACS Module Status Display */}
        {intelligence && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-w-4xl">
            {Object.entries(HACS_MODULES).map(([key, module]) => {
              const score = getModuleIntelligence(key as keyof typeof HACS_MODULES);
              const level = Math.floor(score / 10);
              return (
                <div key={key} className="bg-card rounded-lg p-3 border border-gold-200/20">
                  <div className="text-xs font-semibold text-gold-400 uppercase tracking-wide">
                    {key.toUpperCase()}
                  </div>
                  <div className="text-sm text-gold-300 mt-1">
                    Lv.{level} ({score}%)
                  </div>
                  <div className="w-full bg-gold-900/30 rounded-full h-1.5 mt-2">
                    <div 
                      className="bg-gradient-to-r from-gold-400 to-gold-300 h-1.5 rounded-full transition-all duration-500"
                      style={{ width: `${score}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Chat Input */}
        <div className="w-full max-w-2xl space-y-3">
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Share what's on your heart..."
                className="border-soul-purple/20 focus:border-soul-purple focus:ring-soul-purple/20 rounded-2xl"
                disabled={isLoading}
              />
            </div>
            <Button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading || !onSendMessage}
              className="bg-gradient-to-r from-soul-purple to-soul-teal hover:shadow-lg transition-all duration-300 rounded-2xl h-10 px-4"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Heart className="h-4 w-4" />
              )}
            </Button>
          </div>
          
          <p className="text-center text-gray-500 text-xs">
            Your personalized spiritual guide is ready to support your journey
          </p>
        </div>
      </div>
    );
  }

  // Chat interface with messages
  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto p-6 space-y-6">
      {/* Header with Soul Orb */}
      <div className="flex flex-col items-center space-y-4">
        <IntelligentSoulOrb 
          size="lg" 
          onInteraction={handleSoulOrbInteraction}
          showLevel={true}
          showProgress={true}
        />
        
        <div className="text-center">
          <div className="text-sm font-medium text-gold-400">
            HACS Awakening • {overallIntelligence}%
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 bg-card rounded-lg p-4 space-y-4 max-h-96 overflow-y-auto">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.sender === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-muted text-muted-foreground px-4 py-2 rounded-lg">
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Thinking...</span>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Input for ongoing conversation */}
      {onSendMessage && (
        <div className="flex space-x-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Continue the conversation..."
            className="flex-1 px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            disabled={isLoading}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            className="bg-gradient-to-r from-soul-purple to-soul-teal"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Heart className="h-4 w-4" />
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

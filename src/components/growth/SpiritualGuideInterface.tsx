
import React from 'react';
import IntelligentSoulOrb from '@/components/ui/intelligent-soul-orb';
import { useHacsIntelligence } from '@/hooks/use-hacs-intelligence';

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
  const { intelligence, getModuleIntelligence, HACS_MODULES, recordInteraction } = useHacsIntelligence();

  const handleSoulOrbInteraction = () => {
    // Record interaction with a random HACS module to simulate learning
    const modules = Object.keys(HACS_MODULES) as Array<keyof typeof HACS_MODULES>;
    const randomModule = modules[Math.floor(Math.random() * modules.length)];
    recordInteraction(randomModule, Math.floor(Math.random() * 3) + 1);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Soul Orb with HACS Intelligence */}
      <div className="flex flex-col items-center space-y-6">
        <IntelligentSoulOrb 
          size="xl" 
          onInteraction={handleSoulOrbInteraction}
          className="mb-4"
        />
        
        {/* HACS Module Status Display */}
        {intelligence && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-w-3xl">
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
      </div>

      {/* Chat Interface - if messages are provided */}
      {messages.length > 0 && (
        <div className="bg-card rounded-lg p-4 space-y-4">
          <div className="space-y-4 max-h-96 overflow-y-auto">
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
                    <div className="animate-pulse">Thinking...</div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {onSendMessage && (
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Ask your spiritual guide..."
                className="flex-1 px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                    onSendMessage(e.currentTarget.value);
                    e.currentTarget.value = '';
                  }
                }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

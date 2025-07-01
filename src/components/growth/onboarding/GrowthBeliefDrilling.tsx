
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Send, Brain, Lightbulb, Target } from 'lucide-react';
import { LifeDomain } from '@/types/growth-program';
import { useProgramAwareCoach } from '@/hooks/use-program-aware-coach';
import { ScrollArea } from '@/components/ui/scroll-area';

interface GrowthBeliefDrillingProps {
  domain: LifeDomain;
  onComplete: (beliefData: any) => void;
  beliefData?: any;
}

export const GrowthBeliefDrilling: React.FC<GrowthBeliefDrillingProps> = ({
  domain,
  onComplete,
  beliefData
}) => {
  const { 
    messages, 
    isLoading, 
    sendMessage, 
    initializeBeliefDrilling,
    getProgramContext,
    currentSessionId
  } = useProgramAwareCoach();

  const [inputValue, setInputValue] = useState('');
  const [discoveryProgress, setDiscoveryProgress] = useState(0);
  const [discoveredInsights, setDiscoveredInsights] = useState<string[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (!isInitialized) {
      console.log('🎯 Initializing belief drilling with discovery-first approach for:', domain);
      initializeBeliefDrilling(domain);
      setIsInitialized(true);
    }
  }, [domain, initializeBeliefDrilling, isInitialized]);

  useEffect(() => {
    // Track discovery progress based on conversation depth
    const context = getProgramContext();
    if (context && context.discoveredInsights) {
      setDiscoveredInsights(context.discoveredInsights);
      setDiscoveryProgress(Math.min((context.discoveredInsights.length / 5) * 100, 100));
    }
  }, [messages, getProgramContext]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    await sendMessage(inputValue);
    setInputValue('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleComplete = () => {
    const context = getProgramContext();
    const completedBeliefData = {
      domain,
      sessionId: currentSessionId,
      discoveredInsights,
      conversationDepth: discoveryProgress,
      messages: messages.map(m => ({
        content: m.content,
        sender: m.sender,
        timestamp: m.timestamp
      })),
      discoveryContext: context,
      readyForProgram: discoveryProgress >= 60
    };

    console.log('✅ Belief drilling completed with discovery data:', completedBeliefData);
    onComplete(completedBeliefData);
  };

  const getDomainTitle = (domain: LifeDomain) => {
    const titles = {
      career: 'Career & Purpose',
      relationships: 'Relationships & Love',
      wellbeing: 'Health & Wellbeing',
      finances: 'Money & Abundance',
      creativity: 'Creativity & Expression',
      spirituality: 'Spirituality & Meaning',
      home_family: 'Home & Family'
    };
    return titles[domain] || 'Personal Growth';
  };

  const isReadyToComplete = discoveryProgress >= 40 && messages.length >= 4;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Exploring {getDomainTitle(domain)}
            </h2>
            <p className="text-gray-600 mt-1">
              AI-powered deep dive into your motivations and beliefs
            </p>
          </div>
          <Badge variant="secondary" className="flex items-center gap-2">
            <Brain className="w-4 h-4" />
            AI Fusion Active
          </Badge>
        </div>

        {/* Discovery Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Discovery Progress</span>
            <span className="font-medium">{Math.round(discoveryProgress)}% Depth</span>
          </div>
          <Progress value={discoveryProgress} className="h-2" />
          
          {discoveredInsights.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {discoveredInsights.slice(0, 3).map((insight, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  <Lightbulb className="w-3 h-3 mr-1" />
                  {insight.replace('_', ' ')}
                </Badge>
              ))}
              {discoveredInsights.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{discoveredInsights.length - 3} more
                </Badge>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Conversation */}
      <div className="flex-1 flex flex-col">
        <ScrollArea className="flex-1 p-6">
          <div className="space-y-4 max-w-3xl mx-auto">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-3 ${
                    message.sender === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white border border-gray-200 text-gray-900'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{message.content}</div>
                  {message.sender === 'assistant' && (
                    <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                      <Target className="w-3 h-3" />
                      <span>Soul Guide</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="p-6 border-t bg-white">
          <div className="max-w-3xl mx-auto">
            <div className="flex gap-3">
              <Textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Share what comes to mind..."
                className="flex-1 min-h-[60px] resize-none"
                disabled={isLoading}
              />
              <div className="flex flex-col gap-2">
                <Button
                  onClick={handleSendMessage}
                  disabled={isLoading || !inputValue.trim()}
                  size="sm"
                >
                  <Send className="w-4 h-4" />
                </Button>
                {isReadyToComplete && (
                  <Button
                    onClick={handleComplete}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                  >
                    Complete
                  </Button>
                )}
              </div>
            </div>
            
            {isReadyToComplete && (
              <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-green-800">
                  <Target className="w-4 h-4" />
                  <span>
                    Ready to create your personalized growth program
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

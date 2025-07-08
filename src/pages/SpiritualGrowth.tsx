
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Heart, Brain, Sparkles, Settings } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useProgramAwareCoach } from '@/hooks/use-program-aware-coach';
import { useBlueprint } from '@/hooks/use-blueprint';
import { SpiritualGuideInterface } from '@/components/growth/SpiritualGuideInterface';
import { ImmediateGrowthInterface } from '@/components/growth/ImmediateGrowthInterface';
import { HACSLiveDemonstration } from '@/components/growth/HACSLiveDemonstration';

const SpiritualGrowth: React.FC = () => {
  const [activeTab, setActiveTab] = useState('guide');
  const { user } = useAuth();
  const { blueprint } = useBlueprint();
  
  const {
    messages,
    isLoading,
    sendMessage,
    initializeBeliefDrilling,
    streamingContent,
    isStreaming
  } = useProgramAwareCoach('spiritual-growth');

  const displayName = blueprint?.user_meta?.preferred_name || 
                     blueprint?.user_meta?.full_name?.split(' ')[0] || 
                     'friend';

  const coreTraits = React.useMemo(() => {
    if (!blueprint) return ['Seeker', 'Growth-Oriented'];
    
    const traits = [];
    
    if (blueprint.cognition_mbti?.type && blueprint.cognition_mbti.type !== 'Unknown') {
      traits.push(blueprint.cognition_mbti.type);
    }
    
    if (blueprint.energy_strategy_human_design?.type && blueprint.energy_strategy_human_design.type !== 'Unknown') {
      traits.push(blueprint.energy_strategy_human_design.type);
    }
    
    if (blueprint.archetype_western?.sun_sign && blueprint.archetype_western.sun_sign !== 'Unknown') {
      traits.push(blueprint.archetype_western.sun_sign);
    }
    
    return traits.length > 0 ? traits : ['Unique Soul', 'Growth-Focused'];
  }, [blueprint]);

  useEffect(() => {
    if (user && messages.length === 0 && activeTab === 'guide') {
      initializeBeliefDrilling('spiritual_growth', 'spiritual-growth');
    }
  }, [user, messages.length, activeTab, initializeBeliefDrilling]);

  const handleSendMessage = async (message: string) => {
    await sendMessage(message, 'spiritual-growth');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-soul-purple/5 to-soul-teal/5">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-soul-purple to-soul-teal rounded-full flex items-center justify-center shadow-lg">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Spiritual Growth Journey</h1>
              <p className="text-gray-600">Discover your authentic path with personalized guidance</p>
            </div>
          </div>
          
          {user && (
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
              <Badge variant="outline" className="bg-soul-purple/10 text-soul-purple border-soul-purple/20">
                Welcome {displayName}
              </Badge>
              {blueprint && (
                <Badge variant="outline" className="bg-soul-teal/10 text-soul-teal border-soul-teal/20">
                  Blueprint Active
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Main Interface */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="guide" className="flex items-center space-x-2">
              <Heart className="w-4 h-4" />
              <span>Spiritual Guide</span>
            </TabsTrigger>
            <TabsTrigger value="hacs" className="flex items-center space-x-2">
              <Brain className="w-4 h-4" />
              <span>HACS Demo</span>
            </TabsTrigger>
            <TabsTrigger value="immediate" className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4" />
              <span>Quick Growth</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="guide">
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              {messages.length === 0 ? (
                <ImmediateGrowthInterface
                  onSendMessage={handleSendMessage}
                  messages={messages}
                  isLoading={isLoading}
                  domain="spiritual-growth"
                  userDisplayName={displayName}
                  coreTraits={coreTraits}
                />
              ) : (
                <SpiritualGuideInterface
                  messages={messages.map(msg => ({
                    ...msg,
                    content: msg.id === messages[messages.length - 1]?.id && isStreaming 
                      ? streamingContent || msg.content 
                      : msg.content,
                    isStreaming: msg.id === messages[messages.length - 1]?.id && isStreaming
                  }))}
                  isLoading={isLoading}
                  onSendMessage={handleSendMessage}
                  userDisplayName={displayName}
                  coreTraits={coreTraits}
                />
              )}
            </Card>
          </TabsContent>

          <TabsContent value="hacs">
            <HACSLiveDemonstration />
          </TabsContent>

          <TabsContent value="immediate">
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <ImmediateGrowthInterface
                onSendMessage={handleSendMessage}
                messages={[]}
                isLoading={isLoading}
                domain="spiritual-growth"
                userDisplayName={displayName}
                coreTraits={coreTraits}
              />
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SpiritualGrowth;

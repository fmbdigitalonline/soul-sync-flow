import React, { useRef, useEffect, useState } from "react";
import MainLayout from "@/components/Layout/MainLayout";
import { CosmicCard } from "@/components/ui/cosmic-card";
import { Button } from "@/components/ui/button";
import { Heart, Sparkles, Moon, BookOpen, Calendar, MessageCircle, Compass } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useEnhancedAICoach } from "@/hooks/use-enhanced-ai-coach";
import { supabase } from "@/integrations/supabase/client";
import { GuideInterface } from "@/components/coach/GuideInterface";
import { MoodTracker } from "@/components/coach/MoodTracker";
import { ReflectionPrompts } from "@/components/coach/ReflectionPrompts";
import { InsightJournal } from "@/components/coach/InsightJournal";
import { WeeklyInsights } from "@/components/coach/WeeklyInsights";
import { LifeAreaSelector, LifeArea } from "@/components/growth/LifeAreaSelector";
import { JourneyEngine } from "@/components/growth/JourneyEngine";
import { useLanguage } from "@/contexts/LanguageContext";
import { useJourneyTracking } from "@/hooks/use-journey-tracking";
import { LanguageSelector } from "@/components/ui/language-selector";

type ActiveTool = 'mood' | 'reflection' | 'insight' | 'weekly' | 'chat' | 'journey' | null;

const SpiritualGrowth = () => {
  const { messages, isLoading, sendMessage, resetConversation } = useEnhancedAICoach("guide");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [activeTool, setActiveTool] = useState<ActiveTool>('journey'); // Default to journey mode
  const [selectedLifeArea, setSelectedLifeArea] = useState<LifeArea | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { t } = useLanguage();
  
  const { growthJourney, addMoodEntry, addReflectionEntry, addInsightEntry } = useJourneyTracking();

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      setIsAuthenticated(!!data.session);
    };
    
    checkAuth();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleNewConversation = () => {
    resetConversation();
    toast({
      title: t('coach.newConversation'),
      description: t('newConversationStarted', { agent: t('coach.soulGuide') }),
    });
  };

  // Data collection handlers with journey tracking
  const handleMoodSave = (mood: string, energy: string) => {
    addMoodEntry(mood, energy);
  };

  const handleReflectionSave = (prompt: string, response: string) => {
    addReflectionEntry(prompt, response);
  };

  const handleInsightSave = (insight: string, tags: string[]) => {
    addInsightEntry(insight, tags);
  };

  const toggleTool = (tool: ActiveTool) => {
    setActiveTool(activeTool === tool ? null : tool);
    // Reset life area selection when switching tools
    if (tool !== 'journey') {
      setSelectedLifeArea(null);
    }
  };

  const handleLifeAreaSelect = (area: LifeArea) => {
    setSelectedLifeArea(area);
    console.log('Selected life area:', area.name);
  };

  const handleBackToLifeAreas = () => {
    setSelectedLifeArea(null);
  };

  const tools = [
    { id: 'journey' as ActiveTool, name: 'Soul Guide', icon: Compass },
    { id: 'mood' as ActiveTool, name: 'Mood Tracker', icon: Heart },
    { id: 'reflection' as ActiveTool, name: 'Reflection Prompts', icon: Sparkles },
    { id: 'insight' as ActiveTool, name: 'Insight Journal', icon: BookOpen },
    { id: 'weekly' as ActiveTool, name: 'Weekly Insights', icon: Calendar },
    { id: 'chat' as ActiveTool, name: 'Free Chat', icon: MessageCircle },
  ];

  if (!isAuthenticated) {
    return (
      <MainLayout>
        <div className="flex flex-col h-[calc(100vh-5rem)] w-full p-4 items-center justify-center">
          <div className="w-full flex justify-end mb-5">
            <LanguageSelector />
          </div>
          <CosmicCard className="p-6 text-center w-full">
            <Heart className="h-8 w-8 text-soul-purple mx-auto mb-4" />
            <h1 className="text-2xl font-bold font-display mb-2">
              <span className="gradient-text">Growth Mode</span>
            </h1>
            <p className="mb-6">{t('coach.signInRequired')}</p>
            <Button 
              className="bg-soul-purple hover:bg-soul-purple/90 w-full"
              onClick={() => window.location.href = '/auth'}
            >
              {t('nav.signIn')}
            </Button>
          </CosmicCard>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="flex flex-col h-[calc(100vh-5rem)] w-full p-4">
        {/* Header with language selector */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4 w-full">
          <div className="text-center sm:text-left">
            <h1 className="text-2xl font-bold font-display mb-1">
              <span className="gradient-text">Growth Mode</span>
            </h1>
            <p className="text-sm text-muted-foreground">
              {selectedLifeArea ? `Exploring ${selectedLifeArea.name}` : 'Inner reflection & soul wisdom'}
            </p>
            {growthJourney && (
              <p className="text-xs text-muted-foreground mt-1">
                Position: {growthJourney.current_position} • {messages.length} conversation messages
              </p>
            )}
          </div>
          <div className="self-center sm:self-auto">
            <LanguageSelector />
          </div>
        </div>

        {/* Tool Toggle Buttons */}
        <div className="grid grid-cols-3 gap-2 mb-4 w-full">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <Button
                key={tool.id}
                variant={activeTool === tool.id ? "default" : "outline"}
                onClick={() => toggleTool(tool.id)}
                className="h-12 flex-col gap-1 text-xs"
              >
                <Icon className="h-4 w-4" />
                {tool.name}
              </Button>
            );
          })}
        </div>

        {/* Active Tool Content */}
        <div className="flex-1 w-full">
          {activeTool === 'journey' && (
            selectedLifeArea ? (
              <JourneyEngine 
                selectedArea={selectedLifeArea} 
                onBack={handleBackToLifeAreas}
              />
            ) : (
              <LifeAreaSelector onAreaSelect={handleLifeAreaSelect} />
            )
          )}

          {activeTool === 'mood' && (
            <MoodTracker onMoodSave={handleMoodSave} />
          )}
          
          {activeTool === 'reflection' && (
            <ReflectionPrompts onReflectionSave={handleReflectionSave} />
          )}
          
          {activeTool === 'insight' && (
            <InsightJournal onInsightSave={handleInsightSave} />
          )}
          
          {activeTool === 'weekly' && (
            <WeeklyInsights />
          )}
          
          {activeTool === 'chat' && (
            <CosmicCard className="p-4 h-full flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium flex items-center">
                  <Heart className="h-4 w-4 mr-2 text-soul-purple" />
                  {t('coach.soulGuide')}
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNewConversation}
                  className="text-xs"
                >
                  New Chat
                </Button>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => sendMessage("Help me check in with my current emotional and spiritual state")}
                className="w-full text-xs border-soul-purple/30 hover:bg-soul-purple/10 mb-4"
              >
                <Moon className="h-3 w-3 mr-2" />
                Start Soul Check-in
              </Button>
              
              <div className="flex-1">
                <GuideInterface
                  messages={messages}
                  isLoading={isLoading}
                  onSendMessage={sendMessage}
                  messagesEndRef={messagesEndRef}
                />
              </div>
            </CosmicCard>
          )}
          
          {!activeTool && (
            <CosmicCard className="p-8 text-center h-full flex flex-col items-center justify-center">
              <Compass className="h-12 w-12 text-soul-purple/50 mb-4" />
              <h3 className="text-lg font-medium mb-2">Choose Your Growth Tool</h3>
              <p className="text-sm text-muted-foreground">
                Start with Soul Guide for a personalized journey, or select any tool above
              </p>
            </CosmicCard>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default SpiritualGrowth;

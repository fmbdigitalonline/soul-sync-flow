
import React, { useRef, useEffect, useState } from "react";
import MainLayout from "@/components/Layout/MainLayout";
import { CosmicCard } from "@/components/ui/cosmic-card";
import { Button } from "@/components/ui/button";
import { Heart, Sparkles, Moon, BookOpen, Calendar, MessageCircle, Compass, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useEnhancedAICoach } from "@/hooks/use-enhanced-ai-coach";
import { supabase } from "@/integrations/supabase/client";
import { GuideInterface } from "@/components/coach/GuideInterface";
import { MoodTracker } from "@/components/coach/MoodTracker";
import { ReflectionPrompts } from "@/components/coach/ReflectionPrompts";
import { InsightJournal } from "@/components/coach/InsightJournal";
import { WeeklyInsights } from "@/components/coach/WeeklyInsights";
import { GrowthProgramInterface } from "@/components/growth/GrowthProgramInterface";
import { useLanguage } from "@/contexts/LanguageContext";
import { useJourneyTracking } from "@/hooks/use-journey-tracking";
import { ProgramWeek } from "@/types/growth-program";

type ActiveTool = 'growth_program' | 'mood' | 'reflection' | 'insight' | 'weekly' | 'chat' | null;

const SpiritualGrowth = () => {
  const { messages, isLoading, sendMessage, resetConversation } = useEnhancedAICoach("guide");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [activeTool, setActiveTool] = useState<ActiveTool>('growth_program'); // Default to growth program
  const [selectedWeek, setSelectedWeek] = useState<ProgramWeek | null>(null);
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

  const handleWeekSelect = (week: ProgramWeek) => {
    setSelectedWeek(week);
  };

  const handleBackToProgram = () => {
    setSelectedWeek(null);
  };

  const toggleTool = (tool: ActiveTool) => {
    setActiveTool(activeTool === tool ? null : tool);
    // Reset week selection when switching tools
    if (tool !== 'growth_program') {
      setSelectedWeek(null);
    }
  };

  const tools = [
    { id: 'growth_program' as ActiveTool, name: 'Growth Program', icon: TrendingUp },
    { id: 'mood' as ActiveTool, name: t('growth.tools.moodTracker'), icon: Heart },
    { id: 'reflection' as ActiveTool, name: t('growth.tools.reflectionPrompts'), icon: Sparkles },
    { id: 'insight' as ActiveTool, name: t('growth.tools.insightJournal'), icon: BookOpen },
    { id: 'weekly' as ActiveTool, name: t('growth.tools.weeklyInsights'), icon: Calendar },
    { id: 'chat' as ActiveTool, name: t('growth.tools.freeChat'), icon: MessageCircle },
  ];

  if (!isAuthenticated) {
    return (
      <MainLayout>
        <div className="flex flex-col h-[calc(100vh-5rem)] w-full p-4 items-center justify-center">
          <CosmicCard className="p-6 text-center w-full">
            <Heart className="h-8 w-8 text-soul-purple mx-auto mb-4" />
            <h1 className="text-2xl font-bold font-display mb-2">
              <span className="gradient-text">{t('growth.title')}</span>
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

  // Handle week selection view
  if (selectedWeek) {
    return (
      <MainLayout>
        <div className="flex flex-col h-[calc(100vh-5rem)] w-full p-4">
          <div className="mb-6">
            <Button 
              variant="outline" 
              onClick={handleBackToProgram}
              className="mb-4"
            >
              ← Back to Growth Program
            </Button>
            
            <CosmicCard>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold capitalize">
                      Week {selectedWeek.week_number}: {selectedWeek.theme.replace('_', ' ')}
                    </h2>
                    <p className="text-muted-foreground mt-2">{selectedWeek.focus_area}</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Key Activities This Week</h3>
                    <div className="space-y-2">
                      {selectedWeek.key_activities.map((activity, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-3 bg-soul-purple/5 rounded-lg">
                          <div className="w-2 h-2 bg-soul-purple rounded-full" />
                          <span>{activity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Tools Available</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {selectedWeek.tools_unlocked.map((tool) => (
                        <div key={tool} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                          <Compass className="h-4 w-4 text-soul-purple" />
                          <span className="text-sm">{tool}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </CosmicCard>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="flex flex-col h-[calc(100vh-5rem)] w-full p-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4 w-full">
          <div className="text-center sm:text-left">
            <h1 className="text-2xl font-bold font-display mb-1">
              <span className="gradient-text">{t('growth.title')}</span>
            </h1>
            <p className="text-sm text-muted-foreground">
              {activeTool === 'growth_program' 
                ? "Your personalized growth journey based on your blueprint"
                : t('growth.headerSubtitle')
              }
            </p>
            {growthJourney && (
              <p className="text-xs text-muted-foreground mt-1">
                {t('growth.positionLabel')} {growthJourney.current_position} • {messages.length} {t('growth.conversationMessages')}
              </p>
            )}
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
          {activeTool === 'growth_program' && (
            <GrowthProgramInterface onWeekSelect={handleWeekSelect} />
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
                  {t('coach.newConversation')}
                </Button>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => sendMessage(t('growth.startSoulCheckIn'))}
                className="w-full text-xs border-soul-purple/30 hover:bg-soul-purple/10 mb-4"
              >
                <Moon className="h-3 w-3 mr-2" />
                {t('growth.startSoulCheckIn')}
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
              <h3 className="text-lg font-medium mb-2">{t('growth.chooseYourTool')}</h3>
              <p className="text-sm text-muted-foreground">
                {t('growth.chooseYourToolDescription')}
              </p>
            </CosmicCard>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default SpiritualGrowth;

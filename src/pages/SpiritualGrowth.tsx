
import React, { useRef, useEffect, useState } from "react";
import MainLayout from "@/components/Layout/MainLayout";
import { CosmicCard } from "@/components/ui/cosmic-card";
import { Button } from "@/components/ui/button";
import { Heart, Sparkles, Moon, ArrowDown, ArrowUp, ChevronDown, ChevronUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useEnhancedAICoach } from "@/hooks/use-enhanced-ai-coach";
import { supabase } from "@/integrations/supabase/client";
import { GuideInterface } from "@/components/coach/GuideInterface";
import { MoodTracker } from "@/components/coach/MoodTracker";
import { ReflectionPrompts } from "@/components/coach/ReflectionPrompts";
import { InsightJournal } from "@/components/coach/InsightJournal";
import { WeeklyInsights } from "@/components/coach/WeeklyInsights";
import { useLanguage } from "@/contexts/LanguageContext";
import { useJourneyTracking } from "@/hooks/use-journey-tracking";

const SpiritualGrowth = () => {
  const { messages, isLoading, sendMessage, resetConversation } = useEnhancedAICoach("guide");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [showMoodTracker, setShowMoodTracker] = useState(false);
  const [showReflectionPrompts, setShowReflectionPrompts] = useState(false);
  const [showInsightJournal, setShowInsightJournal] = useState(false);
  const [showWeeklyInsights, setShowWeeklyInsights] = useState(false);
  const [showChat, setShowChat] = useState(false);
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

  if (!isAuthenticated) {
    return (
      <MainLayout>
        <div className="flex flex-col h-[calc(100vh-5rem)] max-w-md mx-auto p-4 items-center justify-center">
          <CosmicCard className="p-6 text-center">
            <Heart className="h-8 w-8 text-soul-purple mx-auto mb-4" />
            <h1 className="text-2xl font-bold font-display mb-2">
              <span className="gradient-text">Growth Mode</span>
            </h1>
            <p className="mb-6">{t('coach.signInRequired')}</p>
            <Button 
              className="bg-soul-purple hover:bg-soul-purple/90"
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
        {/* Growth Header */}
        <div className="text-center mb-4">
          <h1 className="text-2xl font-bold font-display mb-1">
            <span className="gradient-text">Growth Mode</span>
          </h1>
          <p className="text-sm text-muted-foreground">Inner reflection & soul wisdom</p>
          {growthJourney && (
            <p className="text-xs text-muted-foreground mt-1">
              Position: {growthJourney.current_position} • {messages.length} conversation messages
            </p>
          )}
        </div>

        {/* Collapsible Tools Section */}
        <div className="space-y-3 mb-4">
          {/* Mood Tracker Toggle */}
          <CosmicCard className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Heart className="h-4 w-4 mr-2 text-soul-purple" />
                <h3 className="text-sm font-medium">Mood Tracker</h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowMoodTracker(!showMoodTracker)}
                className="h-6 w-6 p-0"
              >
                {showMoodTracker ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </div>
            {showMoodTracker && (
              <div className="mt-3">
                <MoodTracker onMoodSave={handleMoodSave} />
              </div>
            )}
          </CosmicCard>

          {/* Reflection Prompts Toggle */}
          <CosmicCard className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Sparkles className="h-4 w-4 mr-2 text-soul-purple" />
                <h3 className="text-sm font-medium">Reflection Prompts</h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowReflectionPrompts(!showReflectionPrompts)}
                className="h-6 w-6 p-0"
              >
                {showReflectionPrompts ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </div>
            {showReflectionPrompts && (
              <div className="mt-3">
                <ReflectionPrompts onReflectionSave={handleReflectionSave} />
              </div>
            )}
          </CosmicCard>

          {/* Insight Journal Toggle */}
          <CosmicCard className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Moon className="h-4 w-4 mr-2 text-soul-purple" />
                <h3 className="text-sm font-medium">Insight Journal</h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowInsightJournal(!showInsightJournal)}
                className="h-6 w-6 p-0"
              >
                {showInsightJournal ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </div>
            {showInsightJournal && (
              <div className="mt-3">
                <InsightJournal onInsightSave={handleInsightSave} />
              </div>
            )}
          </CosmicCard>

          {/* Weekly Insights Toggle */}
          <CosmicCard className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Sparkles className="h-4 w-4 mr-2 text-soul-purple" />
                <h3 className="text-sm font-medium">Weekly Insights</h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowWeeklyInsights(!showWeeklyInsights)}
                className="h-6 w-6 p-0"
              >
                {showWeeklyInsights ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </div>
            {showWeeklyInsights && (
              <div className="mt-3">
                <WeeklyInsights />
              </div>
            )}
          </CosmicCard>
        </div>

        {/* Soul Guide Chat Toggle */}
        <CosmicCard className="p-3 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Heart className="h-4 w-4 mr-2 text-soul-purple" />
              <h3 className="text-sm font-medium">{t('coach.soulGuide')}</h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowChat(!showChat)}
              className="h-6 w-6 p-0"
            >
              {showChat ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
          
          {!showChat && (
            <div className="mt-3 space-y-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowChat(true);
                  sendMessage("Help me check in with my current emotional and spiritual state");
                }}
                className="w-full text-xs border-soul-purple/30 hover:bg-soul-purple/10"
              >
                <Moon className="h-3 w-3 mr-2" />
                Start Soul Check-in
              </Button>
            </div>
          )}
        </CosmicCard>

        {/* Expandable Soul Guide Chat */}
        {showChat && (
          <div className="flex-1 flex flex-col">
            <div className="flex-1 flex flex-col">
              <GuideInterface
                messages={messages}
                isLoading={isLoading}
                onSendMessage={sendMessage}
                messagesEndRef={messagesEndRef}
              />
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default SpiritualGrowth;

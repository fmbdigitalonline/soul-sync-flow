
import React, { useRef, useEffect, useState } from "react";
import MainLayout from "@/components/Layout/MainLayout";
import { CosmicCard } from "@/components/ui/cosmic-card";
import { Button } from "@/components/ui/button";
import { Heart, Sparkles, Moon, ArrowDown, ArrowUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAICoach } from "@/hooks/use-ai-coach";
import { supabase } from "@/integrations/supabase/client";
import { GuideInterface } from "@/components/coach/GuideInterface";
import { MoodTracker } from "@/components/coach/MoodTracker";
import { ReflectionPrompts } from "@/components/coach/ReflectionPrompts";
import { InsightJournal } from "@/components/coach/InsightJournal";
import { WeeklyInsights } from "@/components/coach/WeeklyInsights";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePersonalInsights } from "@/hooks/use-personal-insights";

const SpiritualGrowth = () => {
  const { messages, isLoading, sendMessage, resetConversation, currentAgent, switchAgent } = useAICoach();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [showTools, setShowTools] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { t } = useLanguage();
  
  const { saveMoodEntry, saveReflectionEntry, saveInsightEntry } = usePersonalInsights();

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

  // Set agent to guide for this page
  useEffect(() => {
    if (currentAgent !== "guide") {
      switchAgent("guide");
    }
  }, [currentAgent, switchAgent]);

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

  // Data collection handlers (no AI messaging)
  const handleMoodSave = (mood: string, energy: string) => {
    saveMoodEntry(mood, energy);
  };

  const handleReflectionSave = (prompt: string, response: string) => {
    saveReflectionEntry(prompt, response);
  };

  const handleInsightSave = (insight: string, tags: string[]) => {
    saveInsightEntry(insight, tags);
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
      <div className="flex flex-col h-[calc(100vh-5rem)] max-w-md mx-auto p-4">
        {/* Growth Header */}
        <div className="text-center mb-4">
          <h1 className="text-2xl font-bold font-display mb-1">
            <span className="gradient-text">Growth Mode</span>
          </h1>
          <p className="text-sm text-muted-foreground">Inner reflection & soul wisdom</p>
        </div>

        {/* Soul State Check-in */}
        <CosmicCard className="p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium flex items-center">
              <Heart className="h-4 w-4 mr-2 text-soul-purple" />
              Your Inner State
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowTools(!showTools)}
              className="text-xs"
            >
              {showTools ? (
                <><ArrowUp className="h-3 w-3 mr-1" /> Hide Tools</>
              ) : (
                <><ArrowDown className="h-3 w-3 mr-1" /> Show Tools</>
              )}
            </Button>
          </div>
          
          {showTools && (
            <div className="space-y-3">
              <MoodTracker onMoodSave={handleMoodSave} />
              <ReflectionPrompts onReflectionSave={handleReflectionSave} />
              <InsightJournal onInsightSave={handleInsightSave} />
            </div>
          )}
          
          {!showTools && (
            <div className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => sendMessage("Help me check in with my current emotional and spiritual state")}
                className="w-full text-xs border-soul-purple/30 hover:bg-soul-purple/10"
              >
                <Moon className="h-3 w-3 mr-2" />
                Start Soul Check-in
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowChat(!showChat)}
                className="w-full text-xs border-soul-purple/30 hover:bg-soul-purple/10"
              >
                <Sparkles className="h-3 w-3 mr-2" />
                {showChat ? 'Hide' : 'Open'} Soul Guide
              </Button>
            </div>
          )}
        </CosmicCard>

        {/* Weekly Insights */}
        <WeeklyInsights />

        {/* Expandable Soul Guide Chat */}
        {showChat && (
          <div className="flex-1 flex flex-col mt-4">
            <CosmicCard className="p-3 mb-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">{t('coach.soulGuide')}</h3>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowChat(false)}
                  className="text-xs"
                >
                  Minimize
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Your inner wisdom and spiritual growth companion
              </p>
            </CosmicCard>
            
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

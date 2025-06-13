
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

const SpiritualGrowth = () => {
  const { messages, isLoading, sendMessage, resetConversation } = useEnhancedAICoach("guide");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
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
        <div className="flex flex-col h-[calc(100vh-5rem)] w-full p-4 items-center justify-center">
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
        {/* Growth Header */}
        <div className="text-center mb-4 w-full">
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

        {/* Collapsible Tools Section - Full Width */}
        <div className="space-y-2 mb-4 w-full">
          {/* Mood Tracker */}
          <Collapsible>
            <CosmicCard className="p-0 w-full">
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full p-3 justify-between h-auto rounded-2xl">
                  <div className="flex items-center">
                    <Heart className="h-4 w-4 mr-2 text-soul-purple" />
                    <h3 className="text-sm font-medium">Mood Tracker</h3>
                  </div>
                  <ChevronDown className="h-4 w-4 transition-transform data-[state=open]:rotate-180" />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="px-3 pb-3">
                <MoodTracker onMoodSave={handleMoodSave} />
              </CollapsibleContent>
            </CosmicCard>
          </Collapsible>

          {/* Reflection Prompts */}
          <Collapsible>
            <CosmicCard className="p-0 w-full">
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full p-3 justify-between h-auto rounded-2xl">
                  <div className="flex items-center">
                    <Sparkles className="h-4 w-4 mr-2 text-soul-purple" />
                    <h3 className="text-sm font-medium">Reflection Prompts</h3>
                  </div>
                  <ChevronDown className="h-4 w-4 transition-transform data-[state=open]:rotate-180" />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="px-3 pb-3">
                <ReflectionPrompts onReflectionSave={handleReflectionSave} />
              </CollapsibleContent>
            </CosmicCard>
          </Collapsible>

          {/* Insight Journal */}
          <Collapsible>
            <CosmicCard className="p-0 w-full">
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full p-3 justify-between h-auto rounded-2xl">
                  <div className="flex items-center">
                    <Moon className="h-4 w-4 mr-2 text-soul-purple" />
                    <h3 className="text-sm font-medium">Insight Journal</h3>
                  </div>
                  <ChevronDown className="h-4 w-4 transition-transform data-[state=open]:rotate-180" />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="px-3 pb-3">
                <InsightJournal onInsightSave={handleInsightSave} />
              </CollapsibleContent>
            </CosmicCard>
          </Collapsible>

          {/* Weekly Insights */}
          <Collapsible>
            <CosmicCard className="p-0 w-full">
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full p-3 justify-between h-auto rounded-2xl">
                  <div className="flex items-center">
                    <Sparkles className="h-4 w-4 mr-2 text-soul-purple" />
                    <h3 className="text-sm font-medium">Weekly Insights</h3>
                  </div>
                  <ChevronDown className="h-4 w-4 transition-transform data-[state=open]:rotate-180" />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="px-3 pb-3">
                <WeeklyInsights />
              </CollapsibleContent>
            </CosmicCard>
          </Collapsible>

          {/* Soul Guide Chat */}
          <Collapsible>
            <CosmicCard className="p-0 w-full">
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full p-3 justify-between h-auto rounded-2xl">
                  <div className="flex items-center">
                    <Heart className="h-4 w-4 mr-2 text-soul-purple" />
                    <h3 className="text-sm font-medium">{t('coach.soulGuide')}</h3>
                  </div>
                  <ChevronDown className="h-4 w-4 transition-transform data-[state=open]:rotate-180" />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="px-3 pb-3">
                <div className="space-y-2 w-full">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => sendMessage("Help me check in with my current emotional and spiritual state")}
                    className="w-full text-xs border-soul-purple/30 hover:bg-soul-purple/10"
                  >
                    <Moon className="h-3 w-3 mr-2" />
                    Start Soul Check-in
                  </Button>
                  <div className="mt-3">
                    <GuideInterface
                      messages={messages}
                      isLoading={isLoading}
                      onSendMessage={sendMessage}
                      messagesEndRef={messagesEndRef}
                    />
                  </div>
                </div>
              </CollapsibleContent>
            </CosmicCard>
          </Collapsible>
        </div>
      </div>
    </MainLayout>
  );
};

export default SpiritualGrowth;

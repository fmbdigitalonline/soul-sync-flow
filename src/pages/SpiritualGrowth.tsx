
import React, { useRef, useEffect, useState } from "react";
import MainLayout from "@/components/Layout/MainLayout";
import { CosmicCard } from "@/components/ui/cosmic-card";
import { Button } from "@/components/ui/button";
import { Heart, ArrowLeft, Sparkles, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAICoach } from "@/hooks/use-ai-coach";
import { supabase } from "@/integrations/supabase/client";
import { GuideInterface } from "@/components/coach/GuideInterface";
import { MoodTracker } from "@/components/coach/MoodTracker";
import { ReflectionPrompts } from "@/components/coach/ReflectionPrompts";
import { InsightJournal } from "@/components/coach/InsightJournal";
import { WeeklyInsights } from "@/components/coach/WeeklyInsights";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePersonalInsights } from "@/hooks/use-personal-insights";
import { Link } from "react-router-dom";

const SpiritualGrowth = () => {
  const { messages, isLoading, sendMessage, resetConversation, currentAgent, switchAgent } = useAICoach();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
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
              <span className="gradient-text">{t('coach.soulGuide')}</span>
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
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <Link to="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold font-display">
            <span className="gradient-text">{t('coach.soulGuide')}</span>
          </h1>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleNewConversation}
            className="text-xs"
          >
            New
          </Button>
        </div>

        <Tabs defaultValue="guide" className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-5 mb-4">
            <TabsTrigger value="guide" className="flex items-center gap-1">
              <Heart className="h-3 w-3" />
              <span className="text-xs">Guide</span>
            </TabsTrigger>
            <TabsTrigger value="mood" className="flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              <span className="text-xs">Mood</span>
            </TabsTrigger>
            <TabsTrigger value="reflect" className="flex items-center gap-1">
              <span className="text-xs">Reflect</span>
            </TabsTrigger>
            <TabsTrigger value="journal" className="flex items-center gap-1">
              <span className="text-xs">Journal</span>
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              <span className="text-xs">Insights</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="guide" className="flex-1">
            <GuideInterface
              messages={messages}
              isLoading={isLoading}
              onSendMessage={sendMessage}
              messagesEndRef={messagesEndRef}
            />
          </TabsContent>
          
          <TabsContent value="mood" className="flex-1">
            <MoodTracker onMoodSave={handleMoodSave} />
          </TabsContent>
          
          <TabsContent value="reflect" className="flex-1">
            <ReflectionPrompts onReflectionSave={handleReflectionSave} />
          </TabsContent>
          
          <TabsContent value="journal" className="flex-1">
            <InsightJournal onInsightSave={handleInsightSave} />
          </TabsContent>
          
          <TabsContent value="insights" className="flex-1 overflow-y-auto">
            <WeeklyInsights />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default SpiritualGrowth;


import React, { useRef, useEffect, useState } from "react";
import MainLayout from "@/components/Layout/MainLayout";
import { CosmicCard } from "@/components/ui/cosmic-card";
import { Button } from "@/components/ui/button";
import { Sparkles, Target, Heart, Star, TrendingUp, Compass } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAICoach } from "@/hooks/use-ai-coach";
import { supabase } from "@/integrations/supabase/client";
import { BlendInterface } from "@/components/coach/BlendInterface";
import { useLanguage } from "@/contexts/LanguageContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { usePersonalInsights } from "@/hooks/use-personal-insights";
import { Badge } from "@/components/ui/badge";

const Coach = () => {
  const { messages, isLoading, sendMessage, resetConversation, currentAgent, switchAgent } = useAICoach();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { t } = useLanguage();
  const isMobile = useIsMobile();
  const { generateWeeklyInsights } = usePersonalInsights();

  // Get user's data for intelligent suggestions
  const weeklyInsights = generateWeeklyInsights();

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

  // Set agent to blend (Soul Companion) for this page
  useEffect(() => {
    if (currentAgent !== "blend") {
      switchAgent("blend");
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
      description: t('newConversationStarted', { agent: t('coach.soulCompanion') }),
    });
  };

  // Intelligent suggestions based on user's data
  const getPersonalizedSuggestions = () => {
    const suggestions = [];
    
    // Based on mood patterns
    if (weeklyInsights.moodTrends.dominantMood === 'Challenged') {
      suggestions.push("I've been feeling challenged lately. Help me find my inner strength and next steps.");
    }
    
    // Based on growth score
    if (weeklyInsights.weeklyScore < 50) {
      suggestions.push("I want to get back on track with my goals and personal growth. What should I focus on?");
    }
    
    // Based on insight themes
    if (weeklyInsights.insightTags.includes('Breakthrough')) {
      suggestions.push("I've had some breakthroughs recently. Help me integrate them into actionable steps.");
    }
    
    // Default suggestions
    if (suggestions.length === 0) {
      suggestions.push(
        "Help me align my daily actions with my deeper purpose",
        "I want to balance productivity with spiritual growth",
        "Show me how my blueprint guides my current situation"
      );
    }
    
    return suggestions.slice(0, 3);
  };

  if (!isAuthenticated) {
    return (
      <MainLayout>
        <div className="flex flex-col h-[calc(100vh-5rem)] max-w-md mx-auto p-4 items-center justify-center">
          <CosmicCard className="p-6 text-center">
            <Sparkles className="h-8 w-8 text-soul-purple mx-auto mb-4" />
            <h1 className="text-2xl font-bold font-display mb-2">
              <span className="gradient-text">{t('coach.soulCompanion')}</span>
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

  const personalizedSuggestions = getPersonalizedSuggestions();

  return (
    <MainLayout>
      <div className="flex flex-col h-[calc(100vh-5rem)] max-w-md mx-auto p-4">
        {/* Soul Companion Header */}
        <div className="text-center mb-4">
          <h1 className="text-xl font-bold font-display">
            <span className="gradient-text">{t('coach.soulCompanion')}</span>
          </h1>
          <p className="text-sm text-muted-foreground">Your integrated life guide</p>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleNewConversation}
            className="mt-2 text-xs"
          >
            New Conversation
          </Button>
        </div>

        {/* Soul Intelligence Dashboard */}
        <CosmicCard className="p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium flex items-center">
              <Star className="h-4 w-4 mr-2 text-soul-purple" />
              Your Soul Pattern
            </h3>
            <Badge variant="outline" className="text-xs">
              <TrendingUp className="h-3 w-3 mr-1" />
              Score: {weeklyInsights.weeklyScore}
            </Badge>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs">
              <Heart className="h-3 w-3 text-soul-purple" />
              <span>Mood: {weeklyInsights.moodTrends.dominantMood}</span>
              <span className="text-muted-foreground">
                • {weeklyInsights.moodTrends.energyPattern} Energy
              </span>
            </div>
            
            {weeklyInsights.insightTags.length > 0 && (
              <div className="flex items-center gap-2 text-xs">
                <Sparkles className="h-3 w-3 text-soul-purple" />
                <span>Themes: {weeklyInsights.insightTags.slice(0, 2).join(', ')}</span>
              </div>
            )}
          </div>
        </CosmicCard>

        {/* Personalized Quick Actions */}
        {messages.length === 0 && (
          <CosmicCard className="p-4 mb-4">
            <h3 className="text-sm font-medium mb-3 flex items-center">
              <Compass className="h-4 w-4 mr-2 text-soul-purple" />
              Based on Your Patterns
            </h3>
            <div className="space-y-2">
              {personalizedSuggestions.map((suggestion, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => sendMessage(suggestion)}
                  className="w-full justify-start text-xs h-auto py-2 px-3 text-left border-soul-purple/30 hover:bg-soul-purple/10"
                >
                  <Target className="h-3 w-3 mr-2 flex-shrink-0" />
                  <span className="text-wrap">{suggestion}</span>
                </Button>
              ))}
            </div>
          </CosmicCard>
        )}

        {/* Enhanced Soul Companion Chat Interface */}
        <BlendInterface
          messages={messages}
          isLoading={isLoading}
          onSendMessage={sendMessage}
          messagesEndRef={messagesEndRef}
        />
      </div>
    </MainLayout>
  );
};

export default Coach;


import React, { useRef, useEffect, useState } from "react";
import MainLayout from "@/components/Layout/MainLayout";
import { CosmicCard } from "@/components/ui/cosmic-card";
import { Button } from "@/components/ui/button";
import { Heart, TrendingUp, Star, Plus, MessageCircle, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useEnhancedAICoach } from "@/hooks/use-enhanced-ai-coach";
import { supabase } from "@/integrations/supabase/client";
import { CoachInterface } from "@/components/coach/CoachInterface";
import DreamAchievementDashboard from "@/components/journey/DreamAchievementDashboard";
import { useLanguage } from "@/contexts/LanguageContext";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

const Dreams = () => {
  const { messages, isLoading, sendMessage, resetConversation, currentAgent, switchAgent } = useEnhancedAICoach("coach");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [showChat, setShowChat] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { t } = useLanguage();

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

  // Set agent to coach for this page
  useEffect(() => {
    if (currentAgent !== "coach") {
      switchAgent("coach");
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
      title: "New Journey Conversation",
      description: "Starting fresh with your Dream Guide",
    });
  };

  const quickActions = [
    "Help me define my biggest dream and break it down",
    "Create a journey map for my current goal",
    "What should I focus on today to move closer to my dreams?",
    "How can I align my daily actions with my soul's purpose?"
  ];

  if (!isAuthenticated) {
    return (
      <MainLayout>
        <div className="flex flex-col h-[calc(100vh-5rem)] max-w-md mx-auto p-4 items-center justify-center">
          <CosmicCard className="p-6 text-center">
            <Heart className="h-8 w-8 text-soul-purple mx-auto mb-4" />
            <h1 className="text-2xl font-bold font-display mb-2">
              <span className="text-soul-purple">Dream Achievement</span>
            </h1>
            <p className="mb-6">Sign in to start your personalized journey to your dreams</p>
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
        {/* Dream Journey Header */}
        <div className="text-center mb-4">
          <h1 className="text-2xl font-bold font-display text-soul-purple mb-1 flex items-center justify-center">
            <Heart className="h-6 w-6 mr-2" />
            Dream Journey
          </h1>
          <p className="text-sm text-muted-foreground">Soul-aligned path to your dreams</p>
        </div>

        {/* Journey Progress Overview */}
        <CosmicCard className="p-4 mb-4 border-soul-purple/20">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium flex items-center">
              <Sparkles className="h-4 w-4 mr-2 text-soul-purple" />
              Today's Soul Steps
            </h3>
            <Badge variant="outline" className="text-xs border-soul-purple/30">
              <TrendingUp className="h-3 w-3 mr-1" />
              Journey Active
            </Badge>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between text-xs">
              <span>Dream Progress</span>
              <span>2 of 5 milestones</span>
            </div>
            <Progress value={40} className="h-2" />
            
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="flex-1 text-xs h-7 border-soul-purple/30"
                onClick={() => sendMessage("What's my next soul step toward my dream?")}
              >
                <Star className="h-3 w-3 mr-1" />
                Next Step
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="flex-1 text-xs h-7 border-soul-purple/30"
                onClick={() => setShowChat(!showChat)}
              >
                <MessageCircle className="h-3 w-3 mr-1" />
                {showChat ? 'Hide' : 'Guide'}
              </Button>
            </div>
          </div>
        </CosmicCard>

        {/* Dream Achievement Tools */}
        <DreamAchievementDashboard />

        {/* Quick Soul Guidance */}
        {!showChat && (
          <CosmicCard className="p-4 mb-4 border-soul-purple/20">
            <h3 className="text-sm font-medium mb-3">Quick Soul Guidance</h3>
            <div className="space-y-2">
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    sendMessage(action);
                    setShowChat(true);
                  }}
                  className="w-full justify-start text-xs h-8 border-soul-purple/30 hover:bg-soul-purple/5"
                >
                  <Plus className="h-3 w-3 mr-2" />
                  {action}
                </Button>
              ))}
            </div>
          </CosmicCard>
        )}

        {/* Expandable Chat Interface */}
        {showChat && (
          <div className="flex-1 flex flex-col">
            <CosmicCard className="p-3 mb-3 border-soul-purple/20">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Dream Guide</h3>
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
                Your soul-aligned success companion
              </p>
            </CosmicCard>
            
            <div className="flex-1 flex flex-col">
              <CoachInterface
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

export default Dreams;

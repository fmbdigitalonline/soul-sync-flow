
import React, { useRef, useEffect, useState } from "react";
import MainLayout from "@/components/Layout/MainLayout";
import { CosmicCard } from "@/components/ui/cosmic-card";
import { Button } from "@/components/ui/button";
import { Heart, Target, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useEnhancedAICoach } from "@/hooks/use-enhanced-ai-coach";
import { supabase } from "@/integrations/supabase/client";
import { CoachInterface } from "@/components/coach/CoachInterface";
import { useLanguage } from "@/contexts/LanguageContext";

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

  const handleStartDreamJourney = () => {
    sendMessage("I want to start my dream journey. Help me define my biggest goal and create a personalized action plan.");
    setShowChat(true);
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
        <div className="min-h-screen flex items-center justify-center p-4">
          <CosmicCard className="p-8 text-center max-w-sm w-full">
            <Heart className="h-12 w-12 text-soul-purple mx-auto mb-6" />
            <h1 className="text-2xl font-bold font-display mb-4">
              <span className="text-soul-purple">Dream Achievement</span>
            </h1>
            <p className="mb-8 text-muted-foreground">Sign in to start your personalized journey to your dreams</p>
            <Button 
              className="w-full bg-soul-purple hover:bg-soul-purple/90"
              onClick={() => window.location.href = '/auth'}
            >
              {t('nav.signIn')}
            </Button>
          </CosmicCard>
        </div>
      </MainLayout>
    );
  }

  if (showChat) {
    return (
      <MainLayout>
        <div className="h-screen flex flex-col">
          {/* Minimal Chat Header */}
          <div className="bg-background border-b border-border p-4">
            <div className="flex items-center justify-between max-w-md mx-auto">
              <div className="flex items-center">
                <Heart className="h-5 w-5 text-soul-purple mr-2" />
                <h2 className="text-lg font-semibold">Dream Guide</h2>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowChat(false)}
                className="text-sm"
              >
                Back
              </Button>
            </div>
          </div>
          
          {/* Chat Interface */}
          <div className="flex-1 max-w-md mx-auto w-full p-4">
            <CoachInterface
              messages={messages}
              isLoading={isLoading}
              onSendMessage={sendMessage}
              messagesEndRef={messagesEndRef}
            />
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-b from-soul-purple/5 to-background">
        <div className="max-w-md mx-auto px-4 py-8">
          
          {/* Hero Section - Above the fold */}
          <div className="text-center mb-8">
            <div className="mb-6">
              <div className="w-24 h-24 mx-auto bg-gradient-to-br from-soul-purple/20 to-soul-purple/10 rounded-full flex items-center justify-center mb-6">
                <Target className="h-12 w-12 text-soul-purple" />
              </div>
              <h1 className="text-2xl font-bold font-display mb-3">Start Your Dream Journey</h1>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Define your first dream or goal to see your personalized journey map
              </p>
            </div>
            
            {/* Primary CTA */}
            <Button 
              onClick={handleStartDreamJourney}
              className="w-full bg-soul-purple hover:bg-soul-purple/90 text-white text-lg py-6 rounded-xl font-semibold"
              disabled={isLoading}
            >
              <Sparkles className="h-5 w-5 mr-2" />
              Create Your First Dream
            </Button>
          </div>

          {/* Quick Soul Guidance */}
          <CosmicCard className="p-6 border-soul-purple/20">
            <h3 className="text-lg font-semibold mb-4 text-center">Quick Soul Guidance</h3>
            <div className="space-y-3">
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  variant="outline"
                  onClick={() => {
                    sendMessage(action);
                    setShowChat(true);
                  }}
                  className="w-full justify-start text-left p-4 h-auto border-soul-purple/30 hover:bg-soul-purple/5"
                >
                  <div className="text-sm leading-relaxed">{action}</div>
                </Button>
              ))}
            </div>
          </CosmicCard>
        </div>
      </div>
    </MainLayout>
  );
};

export default Dreams;

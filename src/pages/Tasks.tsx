
import React, { useRef, useEffect, useState } from "react";
import MainLayout from "@/components/Layout/MainLayout";
import { CosmicCard } from "@/components/ui/cosmic-card";
import { Button } from "@/components/ui/button";
import { Target, TrendingUp, CheckCircle, Plus, MessageCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAICoach } from "@/hooks/use-ai-coach";
import { supabase } from "@/integrations/supabase/client";
import { CoachInterface } from "@/components/coach/CoachInterface";
import ProductivityDashboard from "@/components/productivity/ProductivityDashboard";
import { useLanguage } from "@/contexts/LanguageContext";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

const Tasks = () => {
  const { messages, isLoading, sendMessage, resetConversation, currentAgent, switchAgent } = useAICoach();
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
      title: t('coach.newConversation'),
      description: t('newConversationStarted', { agent: t('coach.soulCoach') }),
    });
  };

  const quickActions = [
    "Help me break down my biggest goal into actionable steps",
    "Create a morning routine that aligns with my energy",
    "Set up accountability for my weekly targets",
    "Plan my most productive work blocks"
  ];

  if (!isAuthenticated) {
    return (
      <MainLayout>
        <div className="flex flex-col h-[calc(100vh-5rem)] max-w-md mx-auto p-4 items-center justify-center">
          <CosmicCard className="p-6 text-center">
            <Target className="h-8 w-8 text-green-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold font-display mb-2">
              <span className="text-green-600">Productivity Mode</span>
            </h1>
            <p className="mb-6">{t('coach.signInRequired')}</p>
            <Button 
              className="bg-green-600 hover:bg-green-700"
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
        {/* Productivity Header */}
        <div className="text-center mb-4">
          <h1 className="text-2xl font-bold font-display text-green-600 mb-1">
            Productivity Mode
          </h1>
          <p className="text-sm text-muted-foreground">Goal-focused achievement</p>
        </div>

        {/* Progress Overview */}
        <CosmicCard className="p-4 mb-4 border-green-200/20">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium flex items-center">
              <Target className="h-4 w-4 mr-2 text-green-600" />
              Today's Focus
            </h3>
            <Badge variant="outline" className="text-xs border-green-600/30">
              <TrendingUp className="h-3 w-3 mr-1" />
              Day 3 Streak
            </Badge>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between text-xs">
              <span>Daily Goals</span>
              <span>2 of 3 complete</span>
            </div>
            <Progress value={66} className="h-2" />
            
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="flex-1 text-xs h-7 border-green-600/30"
                onClick={() => sendMessage("What should I focus on first today?")}
              >
                <Target className="h-3 w-3 mr-1" />
                Get Focused
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="flex-1 text-xs h-7 border-green-600/30"
                onClick={() => setShowChat(!showChat)}
              >
                <MessageCircle className="h-3 w-3 mr-1" />
                {showChat ? 'Hide' : 'Coach'}
              </Button>
            </div>
          </div>
        </CosmicCard>

        {/* Integrated Tools */}
        <ProductivityDashboard />

        {/* Quick Actions */}
        {!showChat && (
          <CosmicCard className="p-4 mb-4 border-green-200/20">
            <h3 className="text-sm font-medium mb-3">Quick Coaching</h3>
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
                  className="w-full justify-start text-xs h-8 border-green-600/30 hover:bg-green-50"
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
            <CosmicCard className="p-3 mb-3 border-green-200/20">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">{t('coach.soulCoach')}</h3>
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
                Your productivity and goal achievement specialist
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

export default Tasks;


import React, { useRef, useEffect, useState } from "react";
import MainLayout from "@/components/Layout/MainLayout";
import { CosmicCard } from "@/components/ui/cosmic-card";
import { Button } from "@/components/ui/button";
import { Target, ListTodo, Timer, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAICoach } from "@/hooks/use-ai-coach";
import { supabase } from "@/integrations/supabase/client";
import { CoachInterface } from "@/components/coach/CoachInterface";
import ProductivityDashboard from "@/components/productivity/ProductivityDashboard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/contexts/LanguageContext";

const Tasks = () => {
  const { messages, isLoading, sendMessage, resetConversation, currentAgent, switchAgent } = useAICoach();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
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

  if (!isAuthenticated) {
    return (
      <MainLayout>
        <div className="flex flex-col h-[calc(100vh-5rem)] max-w-md mx-auto p-4 items-center justify-center">
          <CosmicCard className="p-6 text-center">
            <Target className="h-8 w-8 text-soul-purple mx-auto mb-4" />
            <h1 className="text-2xl font-bold font-display mb-2">
              <span className="gradient-text">{t('nav.tasks')}</span>
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
        <div className="text-center mb-4">
          <h1 className="text-2xl font-bold font-display">
            <span className="gradient-text">{t('productivity.title')}</span>
          </h1>
          <p className="text-sm text-muted-foreground">Productivity & Goal Achievement</p>
        </div>

        <Tabs defaultValue="dashboard" className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <ListTodo className="h-4 w-4" />
              <span className="hidden sm:inline">Tools</span>
            </TabsTrigger>
            <TabsTrigger value="coach" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              <span className="hidden sm:inline">Coach</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Stats</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="dashboard" className="flex-1">
            <ProductivityDashboard />
          </TabsContent>
          
          <TabsContent value="coach" className="flex-1">
            <div className="flex flex-col h-full">
              <CosmicCard className="p-4 mb-4 text-center">
                <h3 className="font-semibold mb-2">{t('coach.soulCoach')}</h3>
                <p className="text-sm text-muted-foreground">
                  Your productivity and goal achievement specialist
                </p>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleNewConversation}
                  className="mt-2"
                >
                  New Conversation
                </Button>
              </CosmicCard>
              
              <CoachInterface
                messages={messages}
                isLoading={isLoading}
                onSendMessage={sendMessage}
                messagesEndRef={messagesEndRef}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="analytics" className="flex-1">
            <CosmicCard className="p-6 text-center">
              <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Analytics Coming Soon</h3>
              <p className="text-sm text-muted-foreground">
                Track your productivity patterns and goal progress
              </p>
            </CosmicCard>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Tasks;

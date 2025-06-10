import React, { useRef, useEffect, useState } from "react";
import MainLayout from "@/components/Layout/MainLayout";
import { CosmicCard } from "@/components/ui/cosmic-card";
import { Button } from "@/components/ui/button";
import { Sparkles, Settings, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAICoach } from "@/hooks/use-ai-coach";
import { supabase } from "@/integrations/supabase/client";
import { AgentSelector } from "@/components/coach/AgentSelector";
import { CoachInterface } from "@/components/coach/CoachInterface";
import { GuideInterface } from "@/components/coach/GuideInterface";
import { BlendInterface } from "@/components/coach/BlendInterface";
import { useLanguage } from "@/contexts/LanguageContext";

const Coach = () => {
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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleNewConversation = () => {
    resetConversation();
    const agentName = currentAgent === "coach" ? t('coach.soulCoach') : 
                     currentAgent === "guide" ? t('coach.soulGuide') : 
                     t('coach.soulCompanion');
    
    toast({
      title: t('coach.newConversation'),
      description: t('newConversationStarted', { agent: agentName }),
    });
  };

  const getAgentTitle = () => {
    switch (currentAgent) {
      case "coach":
        return t('coach.soulCoach');
      case "guide":
        return t('coach.soulGuide');
      case "blend":
        return t('coach.soulCompanion');
      default:
        return t('coach.title');
    }
  };

  if (!isAuthenticated) {
    return (
      <MainLayout>
        <div className="flex flex-col h-[calc(100vh-5rem)] max-w-md mx-auto p-4 items-center justify-center">
          <CosmicCard className="p-6 text-center">
            <Sparkles className="h-8 w-8 text-soul-purple mx-auto mb-4" />
            <h1 className="text-2xl font-bold font-display mb-2">
              <span className="gradient-text">{t('coach.title')}</span>
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
        <div className="text-center mb-4 flex justify-between items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleNewConversation}
            title={t('coach.newConversation')}
            className="relative"
          >
            <RefreshCw className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold font-display">
            <span className="gradient-text">{getAgentTitle()}</span>
          </h1>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => window.location.href = '/blueprint'}
            title={t('coach.blueprintSettings')}
          >
            <Settings className="h-5 w-5" />
          </Button>
        </div>

        {/* Agent Selector */}
        <AgentSelector 
          currentAgent={currentAgent} 
          onAgentChange={switchAgent}
          className="mb-4"
        />

        {/* Dynamic Interface Based on Agent */}
        {currentAgent === "coach" ? (
          <CoachInterface
            messages={messages}
            isLoading={isLoading}
            onSendMessage={sendMessage}
            messagesEndRef={messagesEndRef}
          />
        ) : currentAgent === "guide" ? (
          <GuideInterface
            messages={messages}
            isLoading={isLoading}
            onSendMessage={sendMessage}
            messagesEndRef={messagesEndRef}
          />
        ) : (
          <BlendInterface
            messages={messages}
            isLoading={isLoading}
            onSendMessage={sendMessage}
            messagesEndRef={messagesEndRef}
          />
        )}
      </div>
    </MainLayout>
  );
};

export default Coach;

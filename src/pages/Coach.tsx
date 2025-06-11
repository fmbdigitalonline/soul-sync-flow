
import React, { useRef, useEffect, useState } from "react";
import MainLayout from "@/components/Layout/MainLayout";
import { CosmicCard } from "@/components/ui/cosmic-card";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAICoach } from "@/hooks/use-ai-coach";
import { supabase } from "@/integrations/supabase/client";
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

        {/* Pure Soul Companion Chat Interface */}
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

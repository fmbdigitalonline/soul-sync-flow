
import React, { useRef, useEffect, useState } from "react";
import MainLayout from "@/components/Layout/MainLayout";
import { CosmicCard } from "@/components/ui/cosmic-card";
import { Button } from "@/components/ui/button";
import { Sparkles, MessageCircle, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useEnhancedAICoach } from "@/hooks/use-enhanced-ai-coach";
import { supabase } from "@/integrations/supabase/client";
import { BlendInterface } from "@/components/coach/BlendInterface";
import { useLanguage } from "@/contexts/LanguageContext";
import { useJourneyTracking } from "@/hooks/use-journey-tracking";

const Coach = () => {
  const { messages, isLoading, sendMessage, resetConversation } = useEnhancedAICoach("blend");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { t } = useLanguage();
  const { productivityJourney, growthJourney } = useJourneyTracking();

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
      <div className="flex flex-col h-[calc(100vh-5rem)] max-w-md mx-auto">
        {/* Compact Header - Minimal space */}
        <div className="flex-shrink-0 px-4 pt-3 pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-soul-purple to-soul-teal rounded-full flex items-center justify-center">
                <MessageCircle className="h-4 w-4 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold">
                  <span className="gradient-text">Soul Guide</span>
                </h1>
              </div>
            </div>
            
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleNewConversation}
              className="h-8 px-2"
            >
              <RotateCcw className="h-3 w-3" />
            </Button>
          </div>
          
          {/* Very compact status line */}
          {(productivityJourney || growthJourney) && (
            <p className="text-xs text-muted-foreground mt-1">
              Connected • {messages.length} messages
            </p>
          )}
        </div>

        {/* Maximized Chat Interface */}
        <div className="flex-1 px-4 pb-4 min-h-0">
          <BlendInterface
            messages={messages}
            isLoading={isLoading}
            onSendMessage={sendMessage}
            messagesEndRef={messagesEndRef}
          />
        </div>
      </div>
    </MainLayout>
  );
};

export default Coach;

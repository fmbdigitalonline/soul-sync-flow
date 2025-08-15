
import React, { useRef, useEffect, useState } from "react";
import MainLayout from "@/components/Layout/MainLayout";
import { CosmicCard } from "@/components/ui/cosmic-card";
import { Button } from "@/components/ui/button";
import { Sparkles, MessageCircle, RotateCcw, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useHACSConversationAdapter } from "@/hooks/use-hacs-conversation-adapter";
import { useBlueprintCache } from "@/contexts/BlueprintCacheContext";
import { supabase } from "@/integrations/supabase/client";
import { HACSChatInterface } from "@/components/hacs/HACSChatInterface";
import { useLanguage } from "@/contexts/LanguageContext";
import { ActiveReminders } from "@/components/reminders/ActiveReminders";
import { MobileTogglePanel } from "@/components/ui/mobile-toggle-panel";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

const Coach = () => {
  const {
    messages,
    isLoading,
    isStreamingResponse,
    sendMessage,
    resetConversation,
    markMessageStreamingComplete
  } = useHACSConversationAdapter("guide", "companion");

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const { toast } = useToast();
  const { t } = useLanguage();
  const { hasBlueprint } = useBlueprintCache();
  const { isMobile } = useIsMobile();
  
  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      const authenticated = !!data.session;
      setIsAuthenticated(authenticated);
    };
    
    checkAuth();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      const authenticated = !!session;
      setIsAuthenticated(authenticated);
    });
    
    return () => subscription.unsubscribe();
  }, []);

  const handleSendMessage = async (message: string) => {
    await sendMessage(message);
  };

  const handleReset = () => {
    resetConversation();
    toast({
      title: t('companion.resetToast.title'),
      description: t('companion.resetToast.description'),
    });
  };

  if (!isAuthenticated) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <CosmicCard className="w-full max-w-md text-center space-y-6">
            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
              <MessageCircle className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground mb-2">{t('companion.unauthTitle')}</h1>
              <p className="text-muted-foreground">{t('companion.unauthSubtitle')}</p>
            </div>
            <Button 
              className="w-full"
              onClick={() => window.location.href = '/auth'}
            >
              {t('companion.getStarted')}
            </Button>
          </CosmicCard>
        </div>
      </MainLayout>
    );
  }

  // Create the main chat interface component
  const chatInterface = (
    <HACSChatInterface
      messages={messages}
      isLoading={isLoading}
      isStreamingResponse={isStreamingResponse}
      onSendMessage={handleSendMessage}
      onStreamingComplete={markMessageStreamingComplete}
    />
  );

  const remindersContent = (
    <div className="space-y-4 h-full">
      <ActiveReminders />
      
      <CosmicCard className="p-4">
        <h3 className="font-semibold mb-3 flex items-center">
          <RotateCcw className="h-4 w-4 mr-2" />
          {t('companion.resetTitle')}
        </h3>
        <Button
          onClick={handleReset}
          variant="outline"
          size="sm"
          className="w-full"
        >
          {t('companion.clearConversation')}
        </Button>
      </CosmicCard>


      <CosmicCard className="p-4">
        <h3 className="font-semibold mb-3 flex items-center">
          <Sparkles className="h-4 w-4 mr-2" />
          {t('companion.systemStatus')}
        </h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>{t('companion.system.blueprint')}:</span>
            <span className={hasBlueprint ? "text-green-600" : "text-amber-600"}>
              {hasBlueprint ? t('companion.system.ready') : t('companion.system.partial')}
            </span>
          </div>
          <div className="flex justify-between">
            <span>{t('companion.system.mode')}:</span>
            <span className="text-primary">{t('companion.system.companion')}</span>
          </div>
          <div className="flex justify-between">
            <span>{t('companion.system.hacs')}:</span>
            <span className="text-blue-600">{t('companion.system.pureIntelligence')}</span>
          </div>
        </div>
      </CosmicCard>
    </div>
  );

  return (
    <MainLayout>
      <div className="min-h-screen bg-background">
        <div className={cn("container mx-auto px-4 max-w-6xl", isMobile ? "py-0" : "py-2")}>
          
          {messages.length === 0 && (
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold gradient-text mb-2">
                {t('companion.pageTitle')}
              </h1>
              <p className="text-muted-foreground">
                {t('companion.pageSubtitle')}
              </p>
            </div>
          )}

          {/* Render different layouts based on screen size */}
          {isMobile ? (
            // Mobile: Use MobileTogglePanel
            <MobileTogglePanel
              chatContent={<div className="h-full">{chatInterface}</div>}
              remindersContent={remindersContent}
              activeRemindersCount={0}
            />
          ) : (
            // Desktop: Use grid layout
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-12rem)]">
              <div className="lg:col-span-1">
                {remindersContent}
              </div>

              <div className="lg:col-span-3 h-full">
                {chatInterface}
              </div>
            </div>
          )}
        </div>
        
      </div>
    </MainLayout>
  );
};

export default Coach;

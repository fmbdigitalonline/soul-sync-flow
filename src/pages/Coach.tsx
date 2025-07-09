
import React, { useRef, useEffect, useState } from "react";
import MainLayout from "@/components/Layout/MainLayout";
import { CosmicCard } from "@/components/ui/cosmic-card";
import { Button } from "@/components/ui/button";
import { Sparkles, MessageCircle, RotateCcw, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useEnhancedAICoach } from "@/hooks/use-enhanced-ai-coach";
import { useSoulSync } from "@/hooks/use-soul-sync";
import { useBlueprintCache } from "@/contexts/BlueprintCacheContext";
import { supabase } from "@/integrations/supabase/client";
import { BlendInterface } from "@/components/coach/BlendInterface";
import { useLanguage } from "@/contexts/LanguageContext";
import { useJourneyTracking } from "@/hooks/use-journey-tracking";
import { ActiveReminders } from "@/components/reminders/ActiveReminders";
import { MobileTogglePanel } from "@/components/ui/mobile-toggle-panel";

const Coach = () => {
  const { 
    messages, 
    isLoading, 
    sendMessage, 
    resetConversation, 
    currentAgent, 
    switchAgent,
    personaReady,
    authInitialized,
    blueprintStatus,
    vfpGraphStatus,
    recordVFPGraphFeedback,
    acsEnabled,
    acsState
  } = useEnhancedAICoach("blend", "companion");

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const { toast } = useToast();
  const { t } = useLanguage();
  const { hasBlueprint } = useBlueprintCache();
  const { productivityJourney, growthJourney } = useJourneyTracking();

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
    await sendMessage(message, true, undefined, 'companion');
  };

  const handleReset = () => {
    resetConversation();
    toast({
      title: "Conversation Reset",
      description: "Your companion conversation has been cleared.",
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
              <h1 className="text-2xl font-bold text-foreground mb-2">AI Companion</h1>
              <p className="text-muted-foreground">Your personal AI companion for integrated support and guidance.</p>
            </div>
            <Button 
              className="w-full"
              onClick={() => window.location.href = '/auth'}
            >
              Get Started
            </Button>
          </CosmicCard>
        </div>
      </MainLayout>
    );
  }

  const chatContent = (
    <CosmicCard className="h-full">
      <BlendInterface
        messages={messages}
        isLoading={isLoading}
        onSendMessage={handleSendMessage}
        personaReady={personaReady}
        vfpGraphStatus={vfpGraphStatus}
        onFeedback={recordVFPGraphFeedback}
      />
    </CosmicCard>
  );

  const remindersContent = (
    <div className="space-y-4 h-full">
      <ActiveReminders />
      
      <CosmicCard className="p-4">
        <h3 className="font-semibold mb-3 flex items-center">
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset Chat
        </h3>
        <Button
          onClick={handleReset}
          variant="outline"
          size="sm"
          className="w-full"
        >
          Clear Conversation
        </Button>
      </CosmicCard>

      <CosmicCard className="p-4">
        <h3 className="font-semibold mb-3 flex items-center">
          <Sparkles className="h-4 w-4 mr-2" />
          System Status
        </h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Blueprint:</span>
            <span className={hasBlueprint ? "text-green-600" : "text-amber-600"}>
              {hasBlueprint ? "Ready" : "Partial"}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Mode:</span>
            <span className="text-primary">Companion</span>
          </div>
          {acsEnabled && (
            <div className="flex justify-between">
              <span>ACS:</span>
              <span className="text-blue-600">Active</span>
            </div>
          )}
        </div>
      </CosmicCard>
    </div>
  );

  return (
    <MainLayout>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto py-6 px-4 max-w-6xl">
          
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold gradient-text mb-2">
              AI Companion
            </h1>
            <p className="text-muted-foreground">
              Your integrated AI companion combining coaching and guidance
            </p>
          </div>

          {/* Coordinated height calculation for mobile layout */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-12rem)]">
            
            <div className="hidden lg:block lg:col-span-1">
              {remindersContent}
            </div>

            <div className="lg:col-span-3">
              {chatContent}
            </div>
          </div>

          <div className="lg:hidden">
            <MobileTogglePanel
              chatContent={chatContent}
              remindersContent={remindersContent}
              activeRemindersCount={0}
            />
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Coach;

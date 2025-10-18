
import React, { useRef, useEffect, useState } from "react";
import MainLayout from "@/components/Layout/MainLayout";
import { CosmicCard } from "@/components/ui/cosmic-card";
import { Button } from "@/components/ui/button";
import { MessageCircle, RotateCcw, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

import { supabase } from "@/integrations/supabase/client";
import { PureHACSInterface } from "@/components/hacs/PureHACSInterface";
import { useLanguage } from "@/contexts/LanguageContext";
import { MobileTogglePanel } from "@/components/ui/mobile-toggle-panel";
import { useIsMobile } from "@/hooks/use-mobile";


const CoachPure = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const { toast } = useToast();
  const { t } = useLanguage();
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

  const handleReset = () => {
    toast({
      title: "System Status",
      description: t('system.pureSoulIntelligence') + " - No fallbacks active",
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
              <h1 className="text-2xl font-bold text-foreground mb-2">{t('system.pureSoulIntelligence')}</h1>
              <p className="text-muted-foreground">Advanced intelligence learning without fallbacks.</p>
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

  // Create the main chat interface component
  const chatInterface = (
    <PureHACSInterface />
  );

  const remindersContent = (
    <div className="space-y-4 h-full">
      <CosmicCard className="p-4">
        <h3 className="font-semibold mb-3 flex items-center">
          <RotateCcw className="h-4 w-4 mr-2" />
          System Control
        </h3>
        <Button
          onClick={handleReset}
          variant="outline"
          size="sm"
          className="w-full"
        >
          Show Status
        </Button>
      </CosmicCard>
    </div>
  );

  return (
    <MainLayout>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto py-6 px-4 max-w-6xl">
          
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold gradient-text mb-2">
              {t('system.pureSoulIntelligence')}
            </h1>
            <p className="text-muted-foreground">
              Advanced intelligence learning without fallbacks
            </p>
          </div>

          {/* Render different layouts based on screen size */}
          {isMobile ? (
            // Mobile: Use MobileTogglePanel
            <MobileTogglePanel
              chatContent={<CosmicCard className="h-full">{chatInterface}</CosmicCard>}
              remindersContent={remindersContent}
              activeRemindersCount={0}
            />
          ) : (
            // Desktop: Use grid layout
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-12rem)]">
              <div className="lg:col-span-1">
                {remindersContent}
              </div>

              <div className="lg:col-span-3">
                <CosmicCard className="h-full">
                  {chatInterface}
                </CosmicCard>
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default CoachPure;

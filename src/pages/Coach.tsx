
import React, { useRef, useEffect, useState } from "react";
import MainLayout from "@/components/Layout/MainLayout";
import { CosmicCard } from "@/components/ui/cosmic-card";
import { Button } from "@/components/ui/button";
import { MessageCircle, RotateCcw, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useHACSConversationAdapter } from "@/hooks/use-hacs-conversation-adapter";
import { useSubconsciousOrb } from "@/hooks/use-subconscious-orb";

import { supabase } from "@/integrations/supabase/client";
import { HACSChatInterface } from "@/components/hacs/HACSChatInterface";
import { useLanguage } from "@/contexts/LanguageContext";
import { ActiveReminders } from "@/components/reminders/ActiveReminders";
import { MobileTogglePanel } from "@/components/ui/mobile-toggle-panel";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { OracleInitializationBanner } from "@/components/coach/OracleInitializationBanner";

const Coach = () => {
  const [userId, setUserId] = useState<string | null>(null);
  
  const {
    messages,
    isLoading,
    isStreamingResponse,
    sendMessage,
    stopStreaming,
    resetConversation,
    markMessageStreamingComplete,
    recordVFPGraphFeedback,
    addOptimisticMessage
  } = useHACSConversationAdapter("guide", "companion");

  // Shadow detection integration - only for message processing
  const { processMessage, isEnabled: orbEnabled } = useSubconsciousOrb();

  // Removed duplicate authentication state - trusting ProtectedRoute
  const { toast } = useToast();
  const { t } = useLanguage();
  
  const { isMobile } = useIsMobile();
  
  // Get current user ID for Oracle initialization
  useEffect(() => {
    const getUserId = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUserId(user.id);
    };
    getUserId();
  }, []);

  const handleSendMessage = async (message: string) => {
    await sendMessage(message);
    
    // Process message for shadow pattern detection
    if (orbEnabled && message.trim()) {
      const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await processMessage(message, messageId);
    }
  };

  const handleStopStreaming = () => {
    stopStreaming();
  };

  const handleFeedback = (messageId: string, isPositive: boolean) => {
    recordVFPGraphFeedback(messageId, isPositive);
  };

  const handleReset = () => {
    resetConversation();
    toast({
      title: t('companion.resetToast.title'),
      description: t('companion.resetToast.description'),
    });
  };


  // Removed duplicate authentication check - component is wrapped in ProtectedRoute

  // Create the main chat interface component
  const chatInterface = (
    <HACSChatInterface
      messages={messages}
      isLoading={isLoading}
      isStreamingResponse={isStreamingResponse}
      onSendMessage={handleSendMessage}
      onStreamingComplete={markMessageStreamingComplete}
      onStopStreaming={handleStopStreaming}
      onFeedback={handleFeedback}
      onAddOptimisticMessage={addOptimisticMessage}
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


    </div>
  );

  return (
    <MainLayout>
      <div className="min-h-screen bg-background">
        <div className={cn("container mx-auto px-4 max-w-6xl", isMobile ? "py-0" : "py-2")}>
          
          {userId && (
            <div className="mb-4">
              <OracleInitializationBanner userId={userId} />
            </div>
          )}
          
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


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
import { pieService } from "@/services/pie-service";

import { MobileTogglePanel } from "@/components/ui/mobile-toggle-panel";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { OracleInitializationBanner } from "@/components/coach/OracleInitializationBanner";

const Coach = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [isEndingSession, setIsEndingSession] = useState(false);

  const {
    messages,
    isLoading,
    isStreamingResponse,
    sendMessage,
    stopStreaming,
    resetConversation,
    markMessageStreamingComplete,
    recordVFPGraphFeedback,
    addOptimisticMessage,
    sessionId
  } = useHACSConversationAdapter("guide", "companion");

  // Shadow detection integration - only for message processing
  const { processMessage, isEnabled: orbEnabled } = useSubconsciousOrb();

  // Removed duplicate authentication state - trusting ProtectedRoute
  const { toast } = useToast();
  const { t } = useLanguage();
  
  const { isMobile } = useIsMobile();
  
  // Get current user ID - Hermetic extraction now happens automatically via hermetic-recovery
  useEffect(() => {
    const checkHermeticStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setUserId(user.id);

      try {
        await pieService.initialize(user.id);
      } catch (error) {
        console.error('⚠️ PIE initialization failed:', error);
      }

      // Just check if intelligence exists, don't trigger anything
      const { data: existingIntelligence } = await supabase
        .from('hermetic_structured_intelligence')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (existingIntelligence) {
        console.log('✅ Hermetic intelligence already exists');
      } else {
        console.log('⏳ Hermetic intelligence not yet generated (will auto-generate via hermetic-recovery)');
      }
    };
    
    checkHermeticStatus();
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

  const buildSessionSummary = () => {
    const userMessages = messages.filter(message => message.role === 'user');
    const recentMessages = userMessages.slice(-3).map(msg => msg.content.trim()).filter(Boolean);
    if (recentMessages.length === 0) {
      return 'User ended session without additional notes.';
    }

    const preview = recentMessages.join(' | ').slice(0, 400);
    return `User discussed goals and blockers. Recent notes: ${preview}`;
  };

  const handleSessionEnd = async () => {
    if (isEndingSession) return;

    setIsEndingSession(true);
    try {
      if (!userId) {
        throw new Error('No authenticated user for session end.');
      }

      const reflectiveSummary = buildSessionSummary();

      if (sessionId) {
        await pieService.processConversationSession(
          sessionId,
          reflectiveSummary || 'Session ended without summary.'
        );
        toast({
          title: 'Reflective bridge triggered',
          description: 'Generating action plan from this chat session.',
        });
      } else {
        console.warn('⚠️ Missing session identifier, skipping Reflective Bridge trigger');
      }
    } catch (error) {
      console.error('Failed to trigger Reflective Bridge:', error);
      toast({
        title: 'Could not trigger reflection',
        description: 'We could not process this session for reflection.',
        variant: 'destructive'
      });
    } finally {
      resetConversation();
      setIsEndingSession(false);
    }
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
        <Button
          onClick={handleSessionEnd}
          variant="default"
          size="sm"
          className="w-full mt-2"
          disabled={isEndingSession}
        >
          {isEndingSession ? 'Processing reflection...' : 'End chat & generate plan'}
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

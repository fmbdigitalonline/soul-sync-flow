
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
  const [hermeticExtractionTriggered, setHermeticExtractionTriggered] = useState(false);
  
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
  
  // Get current user ID and trigger Hermetic 2.0 extraction if needed
  useEffect(() => {
    const initializeHermeticExtraction = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      setUserId(user.id);
      
      // Check if hermetic intelligence already exists
      const { data: existingIntelligence } = await supabase
        .from('hermetic_structured_intelligence')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (existingIntelligence || hermeticExtractionTriggered) {
        console.log('✅ Hermetic intelligence already exists or extraction already triggered');
        return;
      }
      
      // Find completed hermetic jobs
      const { data: completedJobs, error: jobError } = await supabase
        .from('hermetic_processing_jobs')
        .select('id, status, progress_percentage')
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .eq('progress_percentage', 100)
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (jobError || !completedJobs || completedJobs.length === 0) {
        console.log('⚠️ No completed hermetic jobs found for extraction');
        return;
      }
      
      const jobToRecover = completedJobs[0];
      console.log('🔧 Triggering Hermetic 2.0 extraction for job:', jobToRecover.id);
      
      setHermeticExtractionTriggered(true);
      
      toast({
        title: "🧬 Extracting Hermetic Intelligence",
        description: "Analyzing 13 dimensions of your consciousness...",
      });
      
      try {
        const { data: recoveryResult, error: recoveryError } = await supabase.functions.invoke('hermetic-recovery', {
          body: { job_id: jobToRecover.id }
        });
        
        if (recoveryError) throw recoveryError;
        
        if (recoveryResult?.success) {
          toast({
            title: "✅ Hermetic Intelligence Activated",
            description: "All 13 consciousness dimensions are now integrated into Oracle.",
          });
          console.log('✅ Hermetic 2.0 extraction completed:', recoveryResult);
        } else {
          throw new Error(recoveryResult?.error || 'Extraction failed');
        }
      } catch (error) {
        console.error('❌ Hermetic extraction failed:', error);
        toast({
          title: "❌ Extraction Failed",
          description: error instanceof Error ? error.message : 'Unknown error occurred',
          variant: "destructive"
        });
        setHermeticExtractionTriggered(false);
      }
    };
    
    initializeHermeticExtraction();
  }, [hermeticExtractionTriggered, toast]);

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


import React, { useRef, useEffect, useState } from "react";
import MainLayout from "@/components/Layout/MainLayout";
import { CosmicCard } from "@/components/ui/cosmic-card";
import { Button } from "@/components/ui/button";
import { MessageCircle, RotateCcw, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useHACSConversationAdapter } from "@/hooks/use-hacs-conversation-adapter";

import { supabase } from "@/integrations/supabase/client";
import { HACSChatInterface } from "@/components/hacs/HACSChatInterface";
import { useLanguage } from "@/contexts/LanguageContext";
import { ActiveReminders } from "@/components/reminders/ActiveReminders";
import { MobileTogglePanel } from "@/components/ui/mobile-toggle-panel";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { useSubconsciousOrb } from "@/hooks/use-subconscious-orb";
import { IntelligentSoulOrb } from "@/components/ui/intelligent-soul-orb";
import { AnimatePresence } from "framer-motion";
import { motion } from "@/lib/framer-motion";
import { ShadowInsightDisplay } from "@/components/hacs/ShadowInsightDisplay";

const Coach = () => {
  const {
    messages,
    isLoading,
    isStreamingResponse,
    sendMessage,
    stopStreaming,
    resetConversation,
    markMessageStreamingComplete,
    recordVFPGraphFeedback
  } = useHACSConversationAdapter("guide", "companion");

  // Shadow detection integration
  const {
    orbState,
    isEnabled: orbEnabled,
    processMessage: processShadowMessage,
    handleOrbClick,
    subconsciousMode,
    patternDetected,
    adviceReady,
    confidence,
    processingTime
  } = useSubconsciousOrb();

  // State for shadow insight display
  const [showShadowInsight, setShowShadowInsight] = useState(false);

  const { toast } = useToast();
  const { t } = useLanguage();
  
  const { isMobile } = useIsMobile();
  
  // Removed duplicate authentication logic - trusting ProtectedRoute wrapper

  const handleSendMessage = async (message: string) => {
    // Send message through HACS conversation system
    await sendMessage(message);
    
    // Process through shadow detection system
    if (orbEnabled && message.trim()) {
      // Generate a unique message ID for shadow processing
      const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await processShadowMessage(message, messageId);
    }
  };

  const handleStopStreaming = () => {
    stopStreaming();
  };

  const handleFeedback = (messageId: string, isPositive: boolean) => {
    recordVFPGraphFeedback(messageId, isPositive);
  };

  const handleOrbInteraction = () => {
    if (!orbEnabled || !adviceReady) return;
    
    setShowShadowInsight(true);
  };

  const handleAcknowledgeInsight = () => {
    setShowShadowInsight(false);
    toast({
      title: "Shadow Pattern Integrated",
      description: "Hermetic wisdom has been integrated into your awareness.",
      duration: 4000,
    });
  };

  const handleDismissInsight = () => {
    setShowShadowInsight(false);
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
    />
  );

  const remindersContent = (
    <div className="space-y-4 h-full">
      <ActiveReminders />
      
      {/* Shadow Detection Orb */}
      <CosmicCard className="p-4">
        <h3 className="font-semibold mb-3 flex items-center">
          <Zap className="h-4 w-4 mr-2" />
          Shadow Detection
        </h3>
        <div className="flex items-center justify-center mb-3">
          <IntelligentSoulOrb
            size="md"
            stage={subconsciousMode === 'dormant' ? 'welcome' : 
                   subconsciousMode === 'detecting' ? 'collecting' : 
                   subconsciousMode === 'thinking' ? 'generating' : 'complete'}
            speaking={subconsciousMode === 'thinking'}
            pulse={patternDetected}
            onClick={handleOrbInteraction}
            className="cursor-pointer"
          />
        </div>
        
        {/* Shadow Detection Status */}
        <div className="text-center space-y-1">
          <p className="text-xs text-muted-foreground capitalize">
            {subconsciousMode}
          </p>
          {patternDetected && (
            <p className="text-xs text-primary">
              Pattern: {orbState.pattern?.type}
            </p>
          )}
          {confidence > 0 && (
            <p className="text-xs text-muted-foreground">
              Confidence: {Math.round(confidence)}%
            </p>
          )}
          {adviceReady && (
            <p className="text-xs text-accent animate-pulse">
              Hermetic insight ready - Click orb
            </p>
          )}
        </div>
      </CosmicCard>
      
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
        
        {/* Shadow Insight Display */}
        {showShadowInsight && (
          <ShadowInsightDisplay
            pattern={orbState.pattern}
            hermeticAdvice={orbState.hermeticAdvice}
            confidence={confidence}
            processingTime={processingTime}
            onAcknowledge={handleAcknowledgeInsight}
            onDismiss={handleDismissInsight}
            position="bottom-right"
          />
        )}
      </div>
    </MainLayout>
  );
};

export default Coach;

import React, { useRef, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import MainLayout from "@/components/Layout/MainLayout";
import { CosmicCard } from "@/components/ui/cosmic-card";
import { Button } from "@/components/ui/button";
import { MessageCircle, RotateCcw, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useHACSConversationAdapter } from "@/hooks/use-hacs-conversation-adapter";
import { useSubconsciousOrb } from "@/hooks/use-subconscious-orb";
import { useHermeticReportStatus } from "@/hooks/use-hermetic-report-status";
import type { PresenceState } from "@/components/companion/PresenceFrame";
import { supabase } from "@/integrations/supabase/client";
import { HACSChatInterface } from "@/components/hacs/HACSChatInterface";
import { useLanguage } from "@/contexts/LanguageContext";
import { MobileTogglePanel } from "@/components/ui/mobile-toggle-panel";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { OracleInitializationBanner } from "@/components/coach/OracleInitializationBanner";
import { useTwinName } from "@/hooks/use-twin-name";
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
    addOptimisticMessage,
    initiateFirstContact
  } = useHACSConversationAdapter("guide", "companion");
  const { twinName } = useTwinName();

  // First contact: arriving fresh from the onboarding reveal, the companion
  // speaks first. Guarded so it fires once, only for empty conversations.
  const [searchParams, setSearchParams] = useSearchParams();
  const firstContactRequestedRef = useRef(false);
  useEffect(() => {
    if (searchParams.get("from") !== "onboarding") return;
    if (firstContactRequestedRef.current) return;
    if (messages.length > 0) {
      // History exists — not actually a first contact; drop the param.
      firstContactRequestedRef.current = true;
      setSearchParams({}, { replace: true });
      return;
    }
    // Give history loading a moment to hydrate before speaking first.
    const t = window.setTimeout(() => {
      if (messages.length === 0 && !firstContactRequestedRef.current) {
        firstContactRequestedRef.current = true;
        setSearchParams({}, { replace: true });
        initiateFirstContact?.();
      }
    }, 1200);
    return () => window.clearTimeout(t);
  }, [searchParams, messages.length, initiateFirstContact, setSearchParams]);

  // Shadow detection integration - only for message processing
  const {
    processMessage,
    isEnabled: orbEnabled,
    orbState,
  } = useSubconsciousOrb();

  // Background deep-report generation state — feeds "thinking" border.
  const hermeticStatus = useHermeticReportStatus();

  // Presence state: idle | thinking | noticed.
  const [presenceState, setPresenceState] = useState<PresenceState>("idle");
  const insightBudgetUsedRef = useRef(false);
  const lastAdviceRef = useRef<string | null>(null);

  // Derive thinking automatically; noticed pulses take priority for 1.2s.
  useEffect(() => {
    if (presenceState === "noticed") return; // let the pulse finish
    const thinking = isLoading || isStreamingResponse || hermeticStatus?.isGenerating;
    setPresenceState(thinking ? "thinking" : "idle");
  }, [isLoading, isStreamingResponse, hermeticStatus?.isGenerating, presenceState]);

  // When the shadow detector surfaces fresh advice, pulse once and append it
  // as a plain twin message. Max ONE unsolicited insight per session.
  useEffect(() => {
    const advice = orbState?.hermeticAdvice;
    if (!advice) return;
    if (advice === lastAdviceRef.current) return;
    lastAdviceRef.current = advice;
    if (insightBudgetUsedRef.current) return;
    insightBudgetUsedRef.current = true;

    setPresenceState("noticed");
    window.setTimeout(() => {
      setPresenceState("idle");
    }, 1200);

    addOptimisticMessage?.({
      id: `insight_${Date.now()}`,
      role: "hacs",
      module: "SUBCONSCIOUS",
      content: advice,
      timestamp: new Date().toISOString(),
      isStreaming: false,
    });
  }, [orbState?.hermeticAdvice, addOptimisticMessage]);

  // Removed duplicate authentication state - trusting ProtectedRoute
  const {
    toast
  } = useToast();
  const {
    t,
    language
  } = useLanguage();
  const nl = language === "nl";
  const {
    isMobile
  } = useIsMobile();

  // Get current user ID - Hermetic extraction now happens automatically via hermetic-recovery
  useEffect(() => {
    const checkHermeticStatus = async () => {
      const {
        data: {
          user
        }
      } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      // Just check if intelligence exists, don't trigger anything
      const {
        data: existingIntelligence
      } = await supabase.from('hermetic_structured_intelligence').select('id').eq('user_id', user.id).maybeSingle();
      if (existingIntelligence) {
        console.log('✅ Hermetic intelligence already exists');
      } else {
        console.log('⏳ Hermetic intelligence not yet generated (will auto-generate via hermetic-recovery)');
      }
    };
    checkHermeticStatus();
  }, []);
  const handleSendMessage = async (
    message: string,
    options?: { confirmedAction?: { type: "decompose_goal"; title: string } }
  ) => {
    // Deterministic confirmation rail (Constitution Phase 2 §1): forward the
    // OfferCard's confirmedAction to the oracle so it skips detection.
    await sendMessage(
      message,
      true,
      options?.confirmedAction ? { confirmedAction: options.confirmedAction } : undefined
    );

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
      description: t('companion.resetToast.description')
    });
  };

  // Panel → Twin handoff: the app-level useCoachAskBridge queues prompts
  // dispatched by the Coach panel (from any route) into sessionStorage and
  // navigates here. We drain the queue on mount and whenever the bridge
  // fires 'coach-workspace:deliver-asks' (same-route dispatches).
  useEffect(() => {
    const drainAndSend = async () => {
      const { drainAskQueue } = await import('@/hooks/use-coach-ask-bridge');
      const prompts = drainAskQueue();
      for (const prompt of prompts) {
        try {
          await handleSendMessage(prompt);
        } catch (err) {
          console.error('coach-workspace:ask forward failed', err);
        }
      }
    };
    drainAndSend();
    const handler = () => {
      drainAndSend();
    };
    window.addEventListener('coach-workspace:deliver-asks', handler);
    return () => window.removeEventListener('coach-workspace:deliver-asks', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Removed duplicate authentication check - component is wrapped in ProtectedRoute

  // Create the main chat interface component
  const chatInterface = <HACSChatInterface messages={messages} isLoading={isLoading} isStreamingResponse={isStreamingResponse} onSendMessage={handleSendMessage} onStreamingComplete={markMessageStreamingComplete} onStopStreaming={handleStopStreaming} onFeedback={handleFeedback} onAddOptimisticMessage={addOptimisticMessage} presenceState={presenceState} />;
  const remindersContent = <div className="space-y-4 h-full">
      <CosmicCard className="p-4">
        <h3 className="font-semibold mb-3 flex items-center">
          <RotateCcw className="h-4 w-4 mr-2" />
          {t('companion.resetTitle')}
        </h3>
        <p className="text-xs text-muted-foreground mb-3">
          {t('companion.resetReassurance')}
        </p>
        <Button onClick={handleReset} variant="outline" size="sm" className="w-full">
          {t('companion.clearConversation')}
        </Button>
      </CosmicCard>
    </div>;
  return <MainLayout>
      <div className="ss ss-page min-h-screen">
        <div className={cn("container mx-auto px-4 max-w-6xl", isMobile ? "py-0" : "py-2")}>

          {/* echo header — the Twin, calm */}
          <div className="flex items-center gap-3 py-3">
            <div className="ss-orb" style={{ width: 42, height: 42 }} />
            <div>
              <div className="text-[19px] font-semibold tracking-tight" style={{ color: "var(--ss-accent-ink)" }}>
                {twinName?.name || t('companion.pageTitle')}
              </div>
              <div className="text-xs" style={{ color: "var(--ss-muted)" }}>{nl ? "Je AI Twin" : "Your AI Twin"}</div>
            </div>
          </div>

          {/* Render different layouts based on screen size */}
          {isMobile ?
        // Mobile: Use MobileTogglePanel
        <MobileTogglePanel chatContent={<div className="h-full">{chatInterface}</div>} remindersContent={remindersContent} activeRemindersCount={0} /> :
        // Desktop: Use grid layout
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-12rem)]">
              <div className="lg:col-span-1">
                {remindersContent}
              </div>

              <div className="lg:col-span-3 h-full">
                {chatInterface}
              </div>
            </div>}
        </div>
        
      </div>
    </MainLayout>;
};
export default Coach;
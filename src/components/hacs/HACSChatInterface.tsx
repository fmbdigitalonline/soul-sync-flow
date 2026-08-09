import React, { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SendHorizontal, Square } from "lucide-react";
import { cn } from "@/lib/utils";
import { ConversationMessage } from "@/hooks/use-hacs-conversation";
import { TypewriterText } from "@/components/coach/TypewriterText";
import { useGlobalChatState } from "@/hooks/use-global-chat-state";
import { useHACSConversationAdapter } from "@/hooks/use-hacs-conversation-adapter";
import { VFPGraphFeedback } from "@/components/coach/VFPGraphFeedback";
import { useIsMobile } from "@/hooks/use-mobile";
import { InteractiveSentenceText } from "@/components/coach/InteractiveSentenceText";
import { DreamCard } from "@/components/companion/message-parts/DreamCard";
import { OfferCard } from "@/components/companion/message-parts/OfferCard";
import { SentenceActionButtons, SentenceAction } from "@/components/coach/SentenceActionButtons";
import { toast } from "sonner";
// NEW: Orb Presence System (Singularity Principle)
import { useOrbPresence } from "@/hooks/use-orb-presence";
import { motion, AnimatePresence } from "framer-motion";
import { PresenceFrame, PresenceState } from "@/components/companion/PresenceFrame";
import { emitCoachOpen, emitCoachDecomposition } from "@/lib/coach-workspace-bus";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { saveRememberedInsight } from "@/services/insight-memory-service";
import {
  proactiveInsightGuardian,
  type ProactiveMomentCandidate,
} from "@/services/proactive-insight-guardian";
import { ProactiveMoment } from "./ProactiveMoment";
import { twinReunionService, type TwinReunion } from "@/services/twin-reunion-service";
import { TwinReunionGreeting } from "./TwinReunionGreeting";
import { TwinNamingCard } from "./TwinNamingCard";
import { useTwinName } from "@/hooks/use-twin-name";
import { useLanguage } from "@/contexts/LanguageContext";
import { useHermeticReportStatus } from "@/hooks/use-hermetic-report-status";

/**
 * Feature flag: route OfferCard confirmations into the panel-hosted flow
 * (WorkspaceContext.openPanelWithIntake) instead of the legacy
 * confirmedAction rail. The rail is still live server-side; it will be
 * disabled by the server author once this path is verified.
 */
const USE_PANEL_INTAKE = true;

// Deterministic confirmation rail: an OfferCard tap rides a structured flag
// alongside the visible message so the oracle can skip detection entirely.
// Intake fields (category/timeframe) ride the same freeze — what the card
// showed is what the dream gets.
export type ConfirmedAction = {
  type: "decompose_goal";
  title: string;
  category?: string;
  timeframe?: string;
};


/** The calendar day a message belongs to, or null when it has no timestamp. */
function dayKey(ts?: string): string | null {
  if (!ts) return null;
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return null;
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

/** "Vandaag" / "Gisteren", otherwise the date — never a fabricated label. */
function formatDay(ts: string | undefined, language: string): string | null {
  if (!ts) return null;
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return null;
  const nl = language === 'nl';
  const today = new Date();
  const same = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  if (same(d, today)) return nl ? 'Vandaag' : 'Today';
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (same(d, yesterday)) return nl ? 'Gisteren' : 'Yesterday';
  return d.toLocaleDateString(nl ? 'nl-NL' : 'en-US', { day: 'numeric', month: 'long' });
}

interface HACSChatInterfaceProps {
  messages: ConversationMessage[];
  isLoading: boolean;
  isStreamingResponse?: boolean;
  onSendMessage: (message: string, options?: { confirmedAction?: ConfirmedAction }) => Promise<void>;
  onStreamingComplete?: (messageId: string) => void;
  onStopStreaming?: () => void;
  onFeedback?: (messageId: string, isPositive: boolean) => void;
  onAddOptimisticMessage?: (message: ConversationMessage) => void;
  /** The parent raises this when the Twin proactively surfaces something
   *  (e.g. a subconscious observation) — the border's "reaching" state. */
  reaching?: boolean;
}

export const HACSChatInterface: React.FC<HACSChatInterfaceProps> = ({
  messages,
  isLoading,
  isStreamingResponse = false,
  onSendMessage,
  onStreamingComplete,
  onStopStreaming,
  onFeedback,
  onAddOptimisticMessage,
  reaching = false,
}) => {
  const [inputValue, setInputValue] = useState("");
  const [inputFocused, setInputFocused] = useState(false);
  // The settling cue (v3.8 "arriving"): a brief gentle motion when the last
  // token lands, then the border rests.
  const [settling, setSettling] = useState(false);
  const wasStreamingRef = useRef(false);
  const [selectedSentences, setSelectedSentences] = useState<Record<string, string | null>>({});
  const [isProcessingAction, setIsProcessingAction] = useState(false);
  const [loadingAction, setLoadingAction] = useState<SentenceAction | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  // Proactive Intelligence Layer (v3.0): at most ONE quiet moment; the
  // guardian's five checks make no-action the default outcome.
  const [proactiveMoment, setProactiveMoment] = useState<ProactiveMomentCandidate | null>(null);
  const proactiveCheckRef = useRef(false);
  // The Reunion (v3.1): the Twin speaks first when the conversation is
  // fresh. Cached read at open (instant), background refresh after.
  const [reunion, setReunion] = useState<TwinReunion | null>(null);
  // The Naming (v3.3): the ceremony appears once, right after the Twin's
  // first message, until the Twin has a name.
  const { twinName, loading: twinNameLoading } = useTwinName();
  const { language } = useLanguage();
  const [namingLater, setNamingLater] = useState(false);
  const { updateChatLoading } = useGlobalChatState();
  const { isMobile } = useIsMobile();

  // NEW: Orb Presence System - notify when chat is open and thinking
  const { setChatOpen, startLoading, completeLoading, isChatAvatar } = useOrbPresence();
  const { openPanelWithIntake, openPanelWithTransformIntake } = useWorkspace();

  // v3.8 "arriving": when streaming finishes, play one settling cue, then rest.
  useEffect(() => {
    const was = wasStreamingRef.current;
    wasStreamingRef.current = isStreamingResponse;
    if (was && !isStreamingResponse) {
      setSettling(true);
      const t = window.setTimeout(() => setSettling(false), 900);
      return () => window.clearTimeout(t);
    }
  }, [isStreamingResponse]);

  // The deep blueprint takes 15-30 minutes in the background. It used to be
  // visible as the floating orb's outer ring; the orb is gone, so the ring
  // becomes a second outline outside the input.
  //
  // It does not disappear when the work finishes. A completed hermetic
  // blueprint is a permanent fact about this person, so the line stays — the
  // frame quietly says "this is in place" for the rest of the relationship.
  const {
    isGenerating: hermeticGenerating,
    progress: hermeticProgress,
    hasReport: hermeticReady,
  } = useHermeticReportStatus();

  const hermeticRing =
    hermeticReady ? 100 : hermeticGenerating ? hermeticProgress : null;

  // v3.8 — the input border is the living state of the conversation. Each
  // state maps to a real interaction phase (no fabricated variety), in
  // priority order: proactive reach → speaking → gathering → settling →
  // listening → still.
  const borderState: PresenceState =
    reaching || !!proactiveMoment ? "reaching"
      : isStreamingResponse ? "speaking"
      : isLoading ? "gathering"
      : settling ? "arriving"
      : inputFocused && inputValue.trim().length > 0 ? "listening"
      : "idle";

  const routeConfirmToPanel = (
    title: string,
    category: string,
    timeframe: string,
    source: 'sentence' | 'offer',
  ) => {
    // `authored: false` — the title is a proposal until the user adopts it in
    // the panel. Every title reaching here came from a message the Twin wrote
    // (sentence selection renders on assistant messages only), so nothing may
    // be created from it yet.
    openPanelWithIntake({ title, category, timeframe, source, authored: false });
    // The building animation used to start here, before the user had agreed to
    // anything. It now waits for the authorship gate.
  };
  
  // Track when chat opens/closes
  useEffect(() => {
    setChatOpen(true);
    return () => setChatOpen(false);
  }, [setChatOpen]);
  
  // Track loading state for orb presence
  useEffect(() => {
    if (isLoading) {
      startLoading('chat_thinking');
    } else {
      completeLoading('chat_thinking');
    }
  }, [isLoading, startLoading, completeLoading]);

  // Guardian consult: after each completed assistant turn (never during
  // typing/loading, never twice for the same turn, never while a moment
  // is already showing). Quiet failure is the correct failure mode.
  useEffect(() => {
    if (isLoading || proactiveMoment) return;
    const last = messages[messages.length - 1];
    if (!last || (last as any).role === 'user' || (last as any).isUser) return;
    if (proactiveCheckRef.current) return;
    proactiveCheckRef.current = true;
    const lastUser = [...messages].reverse().find((m: any) => m.role === 'user' || m.isUser);
    const timer = setTimeout(async () => {
      const cand = await proactiveInsightGuardian.getProactiveMoment({
        messageCount: messages.length,
        lastUserMessage: typeof (lastUser as any)?.content === 'string' ? (lastUser as any).content : undefined,
      });
      if (cand) {
        const ledgerId = await proactiveInsightGuardian.recordDelivery(cand);
        setProactiveMoment({ ...cand, ledgerId: ledgerId ?? undefined });
      }
    }, 1500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages.length, isLoading]);

  // Re-arm the once-per-turn latch when a new user message arrives.
  useEffect(() => {
    const last = messages[messages.length - 1];
    if (last && ((last as any).role === 'user' || (last as any).isUser)) {
      proactiveCheckRef.current = false;
    }
  }, [messages.length]);

  // Reunion at open: cached read first (instant), then a live compose in
  // the background so a fresh device still gets a greeting.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const cached = await twinReunionService.loadForOpen();
      if (cached && !cancelled) setReunion(cached);
      const fresh = await twinReunionService.refresh();
      if (fresh && !cancelled) setReunion(fresh);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Reunion precompute: an SPA has no reliable close event, so the next
  // open's reunion is recomputed quietly after each completed assistant
  // turn. Display state is untouched — this only feeds the cache.
  useEffect(() => {
    if (isLoading || messages.length === 0) return;
    const last = messages[messages.length - 1];
    if (!last || (last as any).role === 'user' || (last as any).isUser) return;
    const timer = setTimeout(() => {
      void twinReunionService.refresh();
    }, 4000);
    return () => clearTimeout(timer);
  }, [messages.length, isLoading]);

  // Handle sentence selection toggle
  const handleSentenceSelect = (messageId: string, sentence: string | null) => {
    setSelectedSentences(prev => ({
      ...prev,
      [messageId]: sentence
    }));
  };

  /**
   * A hard slice cut "…die de juiste" to "…die de jui" and stored that as a
   * goal title. Cut on a word boundary and mark the cut, so a shortened title
   * still reads as language.
   */
  const clipToWords = (text: string, max: number): string => {
    const s = text.trim().replace(/\s+/g, " ");
    if (s.length <= max) return s;
    const cut = s.slice(0, max - 1).replace(/\s+\S*$/, "").replace(/[,;:–—-]+$/, "");
    return `${cut || s.slice(0, max - 1)}…`;
  };

  // The four-intent card routing (Constitution v2.6). The card asks "How
  // can I help you with this?" — each intent routes to a different
  // subsystem, no implementation exposed:
  //   understand      → the Twin (hidden context prompt, stays in stream)
  //   change_pattern  → Transformation engine (panel opens with the
  //                     selected passage as pattern seed)
  //   achieve         → Achievement engine (panel opens with the selected
  //                     passage as program intake, page-form defaults)
  //   remember        → Memory — gated until the real write lands (bug 7).
  const handleSentenceAction = async (action: SentenceAction, sentence: string) => {
    if (action === "change_pattern") {
      openPanelWithTransformIntake({ pattern: clipToWords(sentence, 200) });
      setSelectedSentences({});
      return;
    }

    if (action === "achieve") {
      // Deterministic intake: the selected words ARE the program title —
      // straight to the panel, no server round-trip, no model call.
      routeConfirmToPanel(clipToWords(sentence, 80), "personal_growth", "3 months", "sentence");
      setSelectedSentences({});
      return;
    }

    if (action === "remember") {
      // REAL memory write (bug 7 closed): user_session_memory type
      // 'insight' — the store the oracle's behavioral context reads.
      setIsProcessingAction(true);
      setLoadingAction(action);
      try {
        const result = await saveRememberedInsight(sentence);
        if (result.ok) {
          toast.success("Remembered.");
        } else {
          toast.error(result.error || "Couldn't remember this right now.");
        }
      } finally {
        setIsProcessingAction(false);
        setLoadingAction(null);
        setSelectedSentences({});
      }
      return;
    }

    // understand → the Twin, grounded in blueprint as always.
    // ONE thing, not three. This used to ask for "what it means, where it comes
    // from, and how it shows up" — a three-part brief, which is why the reply
    // came back as a three-part essay. The Twin optimises for insight, not
    // completeness; asking for completeness overrode that from our own side.
    const hiddenPrompt = `[CONTEXT: User selected this sentence and asks to understand it better: "${sentence}"] Take them one layer deeper into this — the single most useful thing to see about it, not a survey. Speak from their blueprint as you always do; do not offer programs or plans on this turn.`;

    setIsProcessingAction(true);
    setLoadingAction(action);

    try {
      setSelectedSentences({}); // Clear selection
      // Send as hidden context - adapter should handle not displaying this as user message
      await onSendMessage(hiddenPrompt);
    } catch (error) {
      console.error("Failed to send action:", error);
      toast.error("Failed to send message");
    } finally {
      setIsProcessingAction(false);
      setLoadingAction(null);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Update global chat loading state
  useEffect(() => {
    updateChatLoading(isLoading);
  }, [isLoading, updateChatLoading]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
    
    const messageToSend = inputValue.trim();
    setInputValue(""); // Clear input immediately for responsive UI
    
    try {
      await onSendMessage(messageToSend); // Let adapter handle message state
    } catch (error) {
      console.error('Failed to send message:', error);
      setInputValue(messageToSend); // Restore on error
    }
  };

  const handleStopStreaming = () => {
    if (onStopStreaming) {
      onStopStreaming();
    }
  };

  const handleButtonClick = () => {
    if (isStreamingResponse) {
      handleStopStreaming();
    } else {
      handleSendMessage();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Naming ceremony gate (v3.3): only after the Twin's first message, only
  // while it is still unnamed, only early in the relationship. The proactive
  // moment requires >=6 messages, so the two never overlap.
  const userMsgCount = messages.filter((m: any) => m.role === "user" || m.isUser).length;
  const lastMsg = messages[messages.length - 1];
  const lastIsCompletedAssistant =
    !!lastMsg &&
    !((lastMsg as any).role === "user" || (lastMsg as any).isUser) &&
    !(lastMsg as any).isStreaming;
  const showNaming =
    !twinName &&
    !twinNameLoading &&
    !namingLater &&
    lastIsCompletedAssistant &&
    userMsgCount <= 1 &&
    !isLoading;

  const handleNamed = (name: string) => {
    // The Twin acknowledges in its own voice, as a real chat message.
    const ack = language === "nl" ? `Mooi — ${name}. Dank je.` : `I like that — ${name}. Thank you.`;
    onAddOptimisticMessage?.({
      id: `twin_naming_ack_${Date.now()}`,
      role: "hacs",
      content: ack,
      timestamp: new Date().toISOString(),
      isStreaming: false,
    } as ConversationMessage);
  };

  return (
    <div className="flex flex-col h-full relative">

      {/* Messages */}
      <ScrollArea className={cn(
        "flex-1",
        isMobile
          ? "h-[calc(100%-10rem)]"
          : "h-[calc(100%-5rem)]"
      )}>
        <div className={cn(
          "px-3 py-2 space-y-3",
          isMobile ? "pb-32" : "pb-24"
        )}>
          {/* The Twin speaks first (v3.1): reunion replaces the empty state. */}
          {messages.length === 0 &&
            (reunion ? (
              <TwinReunionGreeting reunion={reunion} />
            ) : (
              <div className="text-center py-4 ss-sub" style={{ color: 'var(--ss-muted)' }}>
                <p>Start a conversation to begin intelligence learning</p>
              </div>
            ))}
          
          {messages.map((message, index) => {
            // Hide messages that start with [CONTEXT: - these are internal action prompts
            const isHiddenContextMessage = message.role === "user" && message.content.startsWith("[CONTEXT:");
            if (isHiddenContextMessage) return null;
            
            // Show interactive sentences for ALL completed AI messages (not currently streaming)
            const isCurrentlyStreaming = message.isStreaming;

            // A quiet day marker where the conversation actually crossed a
            // day — read from the messages' own timestamps, never inserted
            // for rhythm's sake.
            const dayLabel = (() => {
              const prev = messages[index - 1];
              const cur = dayKey(message.timestamp);
              if (!cur) return null;
              if (prev && dayKey(prev.timestamp) === cur) return null;
              return formatDay(message.timestamp, language);
            })();

            return (
              <React.Fragment key={message.id}>
              {dayLabel && (
                <div className="w-full flex items-center gap-2.5 py-3" aria-hidden="false">
                  <span className="h-px flex-1" style={{ background: "var(--ss-line)" }} />
                  <span className="ss-micro">{dayLabel}</span>
                  <span className="h-px flex-1" style={{ background: "var(--ss-line)" }} />
                </div>
              )}
              <div
                className={cn(
                  "w-full py-2",
                  message.role === "user" ? "text-right" : "text-left"
                )}
              >
                {message.role === "user" ? (
                  <div className="ss inline-block rounded-2xl px-4 py-2.5 max-w-[85%] sm:max-w-[70%] text-left" style={{ background: "var(--ss-accent)", color: "#fff" }}>
                    <p className="text-sm">{message.content}</p>
                    {message.isQuestion && (
                      <div className="mt-2 text-xs opacity-70">
                        Question from: {message.module}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="ss w-full">
                    <div className="flex gap-2.5">
                      <div className="ss-orb shrink-0 mt-0.5" style={{ width: 30, height: 30 }} />
                      {/* The Twin speaks from its own surface — white-on-white
                          read as one column of text with no second voice. */}
                      <div
                        className="rounded-2xl px-4 py-3 ss-body leading-relaxed max-w-[86%]"
                        style={{
                          background:
                            "radial-gradient(300px 170px at 112% -18%, var(--ss-accent-wash-2), transparent 60%), " +
                            "linear-gradient(180deg, var(--ss-accent-wash), transparent)",
                          border: "1px solid var(--ss-line)",
                          color: "var(--ss-ink)",
                        }}
                      >
                        {isCurrentlyStreaming ? (
                          <TypewriterText
                            text={message.content}
                            isStreaming={true}
                            speed={45}
                            messageId={message.id}
                            onStreamingComplete={onStreamingComplete}
                          />
                        ) : (
                          <InteractiveSentenceText
                            text={message.content}
                            selectedSentence={selectedSentences[message.id] || null}
                            onSentenceSelect={(sentence) => handleSentenceSelect(message.id, sentence)}
                            disabled={isLoading || isProcessingAction}
                          />
                        )}
                      </div>
                    </div>

                    {/* One-surface message parts: cards the twin attached */}
                    {(message as any).attachments?.map((att: any, i: number) =>
                      att?.type === "offer_decomposition" && att.title ? (
                        <OfferCard
                          key={`${message.id}_att_${i}`}
                          title={att.title}
                          frame={att.frame}
                          deferChip={att.defer_chip}
                          category={att.category}
                          timeframe={att.timeframe}
                          onConfirm={(title) =>
                            {
                              const category = att.category ?? 'personal_growth';
                              const timeframe = att.timeframe ?? '3 months';
                              if (USE_PANEL_INTAKE) {
                                routeConfirmToPanel(title, category, timeframe, 'offer');
                                return Promise.resolve();
                              }
                              emitCoachOpen({ section: 'actions', reason: 'decompose_goal_offer' });
                              emitCoachDecomposition({ phase: 'start', dreamTitle: title });
                              return onSendMessage(`Yes — break down "${title}" into milestones.`, {
                                confirmedAction: {
                                  type: "decompose_goal",
                                  title,
                                  category,
                                  timeframe,
                                },
                              });
                            }
                          }
                          onDefer={() => onSendMessage("Let me sit with this.")}
                        />
                      ) : att?.type === "dream_card" && att.goal_id ? (
                        <DreamCard
                          key={`${message.id}_att_${i}`}
                          goalId={att.goal_id}
                          onSpeak={(text) => onSendMessage(text)}
                        />
                      ) : null
                    )}

                    {/* Four-intent card when a sentence is selected (v2.6):
                        the card IS the transition — choosing an operational
                        intent opens the panel directly, no draft card. */}
                    {selectedSentences[message.id] && (
                      <div className="mt-3 pt-2 border-t border-border/30">
                        <SentenceActionButtons
                          selectedSentence={selectedSentences[message.id]!}
                          onAction={handleSentenceAction}
                          isLoading={isProcessingAction}
                          loadingAction={loadingAction}
                        />
                      </div>
                    )}
                    
                    {message.isQuestion && (
                      <div className="mt-2 ss-micro" style={{ color: 'var(--ss-faint)' }}>
                        Question from: {message.module}
                      </div>
                    )}
                    {/* Add feedback for AI messages */}
                    {!message.isQuestion && onFeedback && (
                      <VFPGraphFeedback
                        messageId={message.id}
                        onFeedbackGiven={(isPositive) => onFeedback(message.id, isPositive)}
                      />
                    )}
                  </div>
                )}
              </div>
              </React.Fragment>
            );
          })}
          
          {/* v3.8 asks that the border never be the sole carrier. The visible
              "Channeling wisdom…" line was one of three things all saying the
              same thing — border, line, and a spinner in the send button — so
              it drops to a polite live region: the language floor survives for
              assistive tech, and the border is the only thing a sighted reader
              has to watch. */}
          {isLoading && !isStreamingResponse && (
            <span className="sr-only" role="status" aria-live="polite">
              Channeling wisdom…
            </span>
          )}

          {showNaming && (
            <TwinNamingCard onNamed={handleNamed} onLater={() => setNamingLater(true)} growing={hermeticGenerating} />
          )}

          {proactiveMoment && (
            <ProactiveMoment
              observation={proactiveMoment.observation}
              onUnderstand={() => {
                void proactiveInsightGuardian.recordOutcome(proactiveMoment.ledgerId, 'accepted');
                setProactiveMoment(null);
                void onSendMessage(
                  `[CONTEXT: The system gently surfaced a possible pattern and the user chose to understand it: "${proactiveMoment.patternCore}"] Explore this hypothesis together — where it may come from and how it shows up. Stay tentative: check whether it feels accurate and invite their refinement; their correction matters more than the detection.`,
                );
              }}
              onChange={() => {
                void proactiveInsightGuardian.recordOutcome(proactiveMoment.ledgerId, 'acted_on');
                setProactiveMoment(null);
                openPanelWithTransformIntake({ pattern: proactiveMoment.patternCore.slice(0, 200) });
              }}
              onNotNow={() => {
                void proactiveInsightGuardian.recordOutcome(proactiveMoment.ledgerId, 'dismissed');
                setProactiveMoment(null);
              }}
            />
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input - Sticky to bottom */}
      <div
        className={cn(
          "left-0 right-0 px-3 pb-4 pt-2",
          isMobile
            ? "fixed"
            : "absolute bottom-4"
        )}
        style={isMobile ? { bottom: "calc(84px + env(safe-area-inset-bottom))" } : undefined}
      >
        <div className="max-w-4xl mx-auto">
          <PresenceFrame
            state={borderState}
            progress={hermeticRing}
            progressLabel="Deep report"
            className="ss flex items-center gap-2 px-3 py-1.5 rounded-full"
            style={{ background: "var(--ss-card)", boxShadow: "var(--ss-shadow)" }}
          >
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              onFocus={() => setInputFocused(true)}
              onBlur={() => setInputFocused(false)}
              placeholder="Type your message..."
              disabled={isLoading}
              className="flex-1 text-base border-0 shadow-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
            />
            <Button
              onClick={handleButtonClick}
              disabled={!inputValue.trim() && !isStreamingResponse}
              size="icon"
              className="h-11 w-11 rounded-full shrink-0"
              style={{ background: 'var(--ss-accent)', color: '#fff' }}
            >
              {/* Square is a control (stop streaming), so it stays. The
                  spinner was pure feedback and the ring already carries it. */}
              {isStreamingResponse ? (
                <Square className="h-5 w-5" />
              ) : (
                <SendHorizontal className="h-5 w-5" />
              )}
            </Button>
          </PresenceFrame>
        </div>
      </div>
    </div>
  );
};
import React, { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SendHorizontal, Loader2, Square } from "lucide-react";
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
import { IntelligentSoulOrb } from "@/components/ui/intelligent-soul-orb";
import { motion, AnimatePresence } from "framer-motion";
import { PresenceFrame, PresenceState } from "@/components/companion/PresenceFrame";
import { emitCoachOpen, emitCoachDecomposition } from "@/lib/coach-workspace-bus";
import { useWorkspace } from "@/contexts/WorkspaceContext";

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

interface HACSChatInterfaceProps {
  messages: ConversationMessage[];
  isLoading: boolean;
  isStreamingResponse?: boolean;
  onSendMessage: (message: string, options?: { confirmedAction?: ConfirmedAction }) => Promise<void>;
  onStreamingComplete?: (messageId: string) => void;
  onStopStreaming?: () => void;
  onFeedback?: (messageId: string, isPositive: boolean) => void;
  onAddOptimisticMessage?: (message: ConversationMessage) => void;
  presenceState?: PresenceState;
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
  presenceState = "idle",
}) => {
  const [inputValue, setInputValue] = useState("");
  const [selectedSentences, setSelectedSentences] = useState<Record<string, string | null>>({});
  const [isProcessingAction, setIsProcessingAction] = useState(false);
  const [loadingAction, setLoadingAction] = useState<SentenceAction | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { updateChatLoading } = useGlobalChatState();
  const { isMobile } = useIsMobile();

  // NEW: Orb Presence System - notify when chat is open and thinking
  const { setChatOpen, startLoading, completeLoading, isChatAvatar } = useOrbPresence();
  const { openPanelWithIntake, openPanelWithTransformIntake } = useWorkspace();

  const routeConfirmToPanel = (
    title: string,
    category: string,
    timeframe: string,
    source: 'sentence' | 'offer',
  ) => {
    openPanelWithIntake({ title, category, timeframe, source });
    // Kick the panel-side decomposition card into 'start' phase so the
    // building animation is visible even before useDecompositionLogic mounts.
    emitCoachDecomposition({ phase: 'start', dreamTitle: title });
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

  // Handle sentence selection toggle
  const handleSentenceSelect = (messageId: string, sentence: string | null) => {
    setSelectedSentences(prev => ({
      ...prev,
      [messageId]: sentence
    }));
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
      openPanelWithTransformIntake({ pattern: sentence.trim().slice(0, 200) });
      setSelectedSentences({});
      return;
    }

    if (action === "achieve") {
      // Deterministic intake: the selected words ARE the program title —
      // straight to the panel, no server round-trip, no model call.
      routeConfirmToPanel(sentence.trim().slice(0, 80), "personal_growth", "3 months", "sentence");
      setSelectedSentences({});
      return;
    }

    if (action === "remember") {
      // v2.6 law: this chip may not ship pointing at a toast. Unreachable
      // until the real memory write lands and the chip is rendered.
      return;
    }

    // understand → the Twin, grounded in blueprint as always.
    const hiddenPrompt = `[CONTEXT: User selected this sentence and asks to understand it better: "${sentence}"] Help them understand this more deeply — what it means, where it comes from, and how it shows up in their life. Speak from their blueprint as you always do; do not offer programs or plans on this turn.`;

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
          {messages.length === 0 && (
            <div className="text-center text-muted-foreground py-4">
              <p>Start a conversation to begin intelligence learning</p>
            </div>
          )}
          
          {messages.map((message, index) => {
            // Hide messages that start with [CONTEXT: - these are internal action prompts
            const isHiddenContextMessage = message.role === "user" && message.content.startsWith("[CONTEXT:");
            if (isHiddenContextMessage) return null;
            
            // Show interactive sentences for ALL completed AI messages (not currently streaming)
            const isCurrentlyStreaming = message.isStreaming;
            
            return (
              <div
                key={message.id}
                className={cn(
                  "w-full py-2",
                  message.role === "user" ? "text-right" : "text-left"
                )}
              >
                {message.role === "user" ? (
                  <div className="inline-block bg-primary text-primary-foreground rounded-lg p-3 max-w-[85%] sm:max-w-[70%]">
                    <p className="text-sm">{message.content}</p>
                    {message.isQuestion && (
                      <div className="mt-2 text-xs opacity-70">
                        Question from: {message.module}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="w-full">
                    <div className="text-sm leading-relaxed text-muted-foreground">
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
                      <div className="mt-2 text-xs text-muted-foreground opacity-70">
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
            );
          })}
          
          {/* SINGULARITY PRINCIPLE: Orb morphs into chat as avatar when thinking */}
          <AnimatePresence>
            {isLoading && !isStreamingResponse && (
              <motion.div 
                className="w-full py-3 text-left flex items-center gap-3"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                <IntelligentSoulOrb
                  size="sm"
                  stage="generating"
                  speaking={true}
                  isThinking={true}
                  showProgressRing={false}
                  className="shadow-md"
                />
                <span className="text-sm text-muted-foreground italic animate-pulse">
                  Channeling wisdom...
                </span>
              </motion.div>
            )}
          </AnimatePresence>
          
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
            state={presenceState}
            className="flex items-center gap-2 bg-card shadow-lg px-3 py-2"
          >
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              disabled={isLoading}
              className="flex-1 text-base border-0 shadow-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
            />
            <Button
              onClick={handleButtonClick}
              disabled={!inputValue.trim() && !isStreamingResponse}
              size="icon"
              className="h-11 w-11 rounded-full"
            >
              {isStreamingResponse ? (
                <Square className="h-5 w-5" />
              ) : isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
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
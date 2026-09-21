import React, { useEffect, useState } from "react";
import { Bookmark, Brain, ChevronDown, ChevronUp, Loader2, RefreshCw, Sprout, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Shimmer } from "@/components/ai-elements/shimmer";
import type { SentenceActionCopy } from "@/services/sentence-action-copy-service";

/**
 * The four-intent card (Constitution v2.6).
 *
 * On sentence selection the card asks ONE question — "How can I help you
 * with this?" — and offers relational intents, never operations on
 * software. The invariant "Help me…" prefix is deliberate: the user asks
 * a mind for help. Intent, never implementation: no engine names, no
 * mechanism words.
 *
 * Routing (owned by the chat interface):
 * - understand   → the Twin, stays in conversation
 * - change_pattern → Transformation engine, opens the Coach panel
 * - achieve      → Achievement engine, opens the Coach panel
 * - remember     → Memory — a REAL write to user_session_memory
 *   (insight-memory-service), retrievable by the Twin's behavioral
 *   memory context. Enabled since the write landed (bug 7 closed).
 */
export type SentenceAction = "understand" | "change_pattern" | "achieve" | "remember";

interface SentenceActionButtonsProps {
  selectedSentence: string;
  onAction: (action: SentenceAction, sentence: string) => void;
  question?: string;
  actions: SentenceActionCopy[];
  isGenerating?: boolean;
  generationError?: string | null;
  onRetry: () => void;
  isLoading?: boolean;
  loadingAction?: SentenceAction | null;
}

const intentIcons: Record<SentenceAction, React.ComponentType<{ className?: string }>> = {
  understand: Brain,
  change_pattern: Sprout,
  achieve: Target,
  remember: Bookmark,
};

export const SentenceActionButtons: React.FC<SentenceActionButtonsProps> = ({
  selectedSentence,
  onAction,
  question,
  actions,
  isGenerating = false,
  generationError = null,
  onRetry,
  isLoading = false,
  loadingAction = null,
}) => {
  const [expanded, setExpanded] = useState(false);
  const hasCompleteSet = actions.length === 4;
  const visibleActions = expanded ? actions : actions.slice(0, 3);

  useEffect(() => setExpanded(false), [selectedSentence]);

  return (
    <div className="animate-in fade-in-0 slide-in-from-top-2 duration-200 ss-rs border border-border/60 bg-card/60 p-2.5 space-y-1.5">
      {question ? (
        <p className="text-[11px] font-medium text-muted-foreground px-1">{question}</p>
      ) : isGenerating ? (
        <Shimmer className="px-1 text-[11px] font-medium">Passende vervolgstap formuleren…</Shimmer>
      ) : null}

      <div className="space-y-1">
        {visibleActions.map(({ action, label }) => {
          const isThisLoading = isLoading && loadingAction === action;
          const Icon = intentIcons[action];
          return (
            <Button
              key={action}
              type="button"
              variant="outline"
              size="sm"
              disabled={isLoading}
              onClick={() => onAction(action, selectedSentence)}
              className={cn(
                "w-full h-auto min-h-9 justify-start gap-2 whitespace-normal text-left text-xs ss-rs px-2.5 py-2 border border-border/50 transition-colors",
                "hover:bg-soul-purple/10 hover:border-soul-purple/30 hover:text-foreground",
                isLoading && "opacity-50 cursor-not-allowed"
              )}
            >
              {isThisLoading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0" />
              ) : (
                <Icon className="h-3.5 w-3.5 shrink-0 text-soul-purple" />
              )}
              <span className="text-foreground leading-snug">{label}</span>
            </Button>
          );
        })}

        {isGenerating && actions.length < 3 && Array.from({ length: 3 - actions.length }).map((_, index) => (
          <div key={`pending-${index}`} className="h-9 ss-rs border border-border/40 px-2.5 flex items-center">
            <Shimmer className="text-xs">Volgende optie afstemmen…</Shimmer>
          </div>
        ))}
      </div>

      {hasCompleteSet && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setExpanded((value) => !value)}
          className="h-8 w-full justify-between rounded-md px-2 text-xs text-muted-foreground"
        >
          <span>{expanded ? "Minder opties" : "Meer opties"}</span>
          {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </Button>
      )}

      {generationError && (
        <div className="flex items-center justify-between gap-2 px-1 pt-1">
          <p role="alert" className="text-xs text-destructive">{generationError}</p>
          <Button type="button" variant="outline" size="sm" onClick={onRetry} className="h-8 shrink-0 rounded-md px-2 text-xs">
            <RefreshCw className="h-3.5 w-3.5" />
            Opnieuw proberen
          </Button>
        </div>
      )}
    </div>
  );
};

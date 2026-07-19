import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

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
 * - remember     → Memory. NOT rendered yet: v2.6 law — this chip may not
 *   ship pointing at a toast (bug 7). It appears when the real memory
 *   write lands.
 */
export type SentenceAction = "understand" | "change_pattern" | "achieve" | "remember";

interface SentenceActionButtonsProps {
  selectedSentence: string;
  onAction: (action: SentenceAction, sentence: string) => void;
  isLoading?: boolean;
  loadingAction?: SentenceAction | null;
}

const intentConfig: Array<{
  action: SentenceAction;
  emoji: string;
  label: string;
}> = [
  { action: "understand", emoji: "🧠", label: "Help me understand this better" },
  { action: "change_pattern", emoji: "🌱", label: "Help me change this pattern" },
  { action: "achieve", emoji: "🎯", label: "Help me achieve this" },
  // { action: "remember", emoji: "💭", label: "Help me remember this" } — gated on the real memory write (bug 7).
];

export const SentenceActionButtons: React.FC<SentenceActionButtonsProps> = ({
  selectedSentence,
  onAction,
  isLoading = false,
  loadingAction = null,
}) => {
  return (
    <div className="animate-in fade-in-0 slide-in-from-top-2 duration-200 rounded-xl border border-border/60 bg-card/60 p-2.5 space-y-1.5">
      <p className="text-[11px] font-medium text-muted-foreground px-1">
        How can I help you with this?
      </p>
      <div className="space-y-1">
        {intentConfig.map(({ action, emoji, label }) => {
          const isThisLoading = isLoading && loadingAction === action;
          return (
            <button
              key={action}
              type="button"
              disabled={isLoading}
              onClick={() => onAction(action, selectedSentence)}
              className={cn(
                "w-full flex items-center gap-2 text-left text-xs rounded-lg px-2.5 py-2 border border-border/50 transition-colors",
                "hover:bg-soul-purple/10 hover:border-soul-purple/30",
                isLoading && "opacity-50 cursor-not-allowed"
              )}
            >
              {isThisLoading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0" />
              ) : (
                <span className="shrink-0">{emoji}</span>
              )}
              <span className="text-foreground">{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

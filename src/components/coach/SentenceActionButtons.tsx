import React from "react";
import { Badge } from "@/components/ui/badge";
import { Layers, Footprints, HelpCircle, Bookmark, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type SentenceAction = "go_deeper" | "next_action" | "challenge" | "save_insight";

interface SentenceActionButtonsProps {
  selectedSentence: string;
  onAction: (action: SentenceAction, sentence: string) => void;
  isLoading?: boolean;
  loadingAction?: SentenceAction | null;
}

const actionConfig: Array<{
  action: SentenceAction;
  label: string;
  icon: React.ElementType;
  colorClass: string;
}> = [
  {
    action: "go_deeper",
    label: "Go Deeper",
    icon: Layers,
    colorClass: "text-purple-500",
  },
  {
    action: "next_action",
    label: "Next Action",
    icon: Footprints,
    colorClass: "text-blue-500",
  },
  {
    action: "challenge",
    label: "Challenge This",
    icon: HelpCircle,
    colorClass: "text-orange-500",
  },
  {
    action: "save_insight",
    label: "Save Insight",
    icon: Bookmark,
    colorClass: "text-green-500",
  },
];

export const SentenceActionButtons: React.FC<SentenceActionButtonsProps> = ({
  selectedSentence,
  onAction,
  isLoading = false,
  loadingAction = null,
}) => {
  return (
    <div className="flex items-center gap-2 flex-wrap animate-in fade-in-0 slide-in-from-top-2 duration-200">
      {actionConfig.map(({ action, label, icon: Icon, colorClass }) => {
        const isThisLoading = isLoading && loadingAction === action;
        
        return (
          <Badge
            key={action}
            variant="outline"
            onClick={() => !isLoading && onAction(action, selectedSentence)}
            className={cn(
              "text-xs cursor-pointer transition-colors inline-flex items-center gap-1.5 px-2.5 py-1 h-7",
              "hover:bg-muted/50 border-border/60",
              isLoading && "opacity-50 cursor-not-allowed"
            )}
          >
            {isThisLoading ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Icon className={cn("h-3 w-3", colorClass)} />
            )}
            <span className="text-foreground">{label}</span>
          </Badge>
        );
      })}
    </div>
  );
};


import React from "react";
import { Toggle } from "@/components/ui/toggle";
import { cn } from "@/lib/utils";

interface FocusModeToggleProps {
  className?: string;
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
}

const FocusModeToggle = ({ 
  className, 
  enabled, 
  onToggle,
}: FocusModeToggleProps) => {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Toggle 
        pressed={enabled}
        onPressedChange={onToggle}
        className={cn(
          "bg-secondary px-3 py-2 rounded-comfort font-ui text-sm transition-colors duration-150",
          enabled && "bg-soul-sage text-white"
        )}
        aria-label="Toggle focus mode"
      >
        <span className="sr-only md:not-sr-only">Focus Mode</span>
      </Toggle>
    </div>
  );
};

export { FocusModeToggle };

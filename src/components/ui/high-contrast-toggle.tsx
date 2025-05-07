
import React from "react";
import { Toggle } from "@/components/ui/toggle";
import { cn } from "@/lib/utils";

interface HighContrastToggleProps {
  className?: string;
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
}

const HighContrastToggle = ({ 
  className, 
  enabled, 
  onToggle,
}: HighContrastToggleProps) => {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Toggle 
        pressed={enabled}
        onPressedChange={onToggle}
        className={cn(
          "bg-secondary px-3 py-2 rounded-comfort font-ui text-sm transition-colors duration-150",
          enabled && "bg-soul-teal text-white"
        )}
        aria-label="Toggle high contrast mode"
      >
        <span className="sr-only md:not-sr-only">High Contrast</span>
      </Toggle>
    </div>
  );
};

export { HighContrastToggle };

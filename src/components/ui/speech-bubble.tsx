
import React from "react";
import { cn } from "@/lib/utils";

interface SpeechBubbleProps {
  children: React.ReactNode;
  className?: string;
  position?: "top" | "bottom" | "left" | "right";
  isVisible?: boolean;
}

const SpeechBubble: React.FC<SpeechBubbleProps> = ({
  children,
  className,
  position = "bottom",
  isVisible = true,
}) => {
  const positionClasses = {
    top: "bottom-full mb-2",
    bottom: "top-full mt-2",
    left: "right-full mr-2",
    right: "left-full ml-2",
  };

  const arrowClasses = {
    top: "top-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-b-0",
    bottom: "bottom-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-t-0",
    left: "left-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-r-0",
    right: "right-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-l-0",
  };

  if (!isVisible) return null;

  return (
    <div
      className={cn(
        "absolute z-10 w-64 px-4 py-2 cosmic-card animate-fade-in",
        positionClasses[position],
        className
      )}
    >
      <div
        className={cn(
          "absolute w-0 h-0 border-[8px] border-white border-opacity-20",
          arrowClasses[position]
        )}
      />
      <div className="text-sm text-foreground">{children}</div>
    </div>
  );
};

export { SpeechBubble };

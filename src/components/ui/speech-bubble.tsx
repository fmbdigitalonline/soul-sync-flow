
import React from "react";
import { cn } from "@/lib/utils";
import { motion } from "@/lib/framer-motion";

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
    <motion.div
      className={cn(
        "absolute z-10 w-64 max-w-sm px-4 py-3 cosmic-card",
        positionClasses[position],
        className
      )}
      initial={{ opacity: 0, scale: 0.9, y: position === "bottom" ? -10 : position === "top" ? 10 : 0 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
    >
      <div
        className={cn(
          "absolute w-0 h-0 border-[8px] border-white border-opacity-20",
          arrowClasses[position]
        )}
      />
      <div className="text-sm text-foreground leading-relaxed">{children}</div>
    </motion.div>
  );
};

export { SpeechBubble };

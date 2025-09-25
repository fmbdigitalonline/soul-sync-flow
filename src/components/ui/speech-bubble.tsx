
import React from "react";
import { cn } from "@/lib/utils";
import { motion } from "@/lib/framer-motion";

interface SpeechBubbleProps {
  text?: string;
  children?: React.ReactNode;
  className?: string;
  position?: "top" | "bottom" | "left" | "right";
  isVisible?: boolean;
  is3D?: boolean;
  variant?: "default" | "whisper";
  onClick?: () => void;
}

const SpeechBubble: React.FC<SpeechBubbleProps> = ({
  text,
  children,
  className,
  position = "bottom",
  isVisible = true,
  is3D = false,
  variant = "default",
  onClick,
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
        "absolute z-10 w-64 max-w-sm px-4 py-3 cursor-pointer",
        is3D ? "bg-black bg-opacity-50 backdrop-blur-md border border-white border-opacity-40 text-white" : "cosmic-card",
        variant === "whisper" && "bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200 text-purple-800",
        positionClasses[position],
        className
      )}
      onClick={onClick}
      initial={{ opacity: 0, scale: 0.9, y: position === "bottom" ? -10 : position === "top" ? 10 : 0 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
      style={{
        borderRadius: is3D ? "1rem" : undefined,
        boxShadow: is3D ? "0 0 20px rgba(255, 255, 255, 0.2)" : undefined
      }}
    >
      <div
        className={cn(
          "absolute w-0 h-0",
          is3D ? "border-[8px] border-white border-opacity-40" : "border-[8px] border-white border-opacity-20",
          arrowClasses[position]
        )}
      />
      <div className={cn(
        "text-sm leading-relaxed", 
        is3D ? "text-white" : "text-foreground"
      )}>
        {children}
      </div>
    </motion.div>
  );
};

export { SpeechBubble };

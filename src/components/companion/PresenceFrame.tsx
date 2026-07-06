import React from "react";
import { cn } from "@/lib/utils";

export type PresenceState = "idle" | "thinking" | "noticed";

interface PresenceFrameProps {
  state: PresenceState;
  className?: string;
  children: React.ReactNode;
}

/**
 * Ambient border that expresses the twin's presence.
 * UI-only: never a click target, never a badge/dot/counter.
 * All animations CSS-only; disabled under prefers-reduced-motion.
 */
export const PresenceFrame: React.FC<PresenceFrameProps> = ({
  state,
  className,
  children,
}) => {
  return (
    <div
      data-presence={state}
      className={cn("presence-frame", className)}
    >
      {children}
    </div>
  );
};

export default PresenceFrame;
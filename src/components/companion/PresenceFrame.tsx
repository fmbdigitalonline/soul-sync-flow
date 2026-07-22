import React from "react";
import { cn } from "@/lib/utils";

/**
 * The conversational-presence vocabulary (Constitution v3.8).
 *   listening — the user is at the input, composing; the Twin attends.
 *   gathering — after send, before the first token; the most expressive
 *               motion ("I'm forming my response").
 *   speaking  — during typewriter streaming; calm, almost still (a calm
 *               extension of arriving — never the gathering motion, which
 *               would misrepresent that the Twin is speaking, not thinking).
 *   arriving  — one gentle settling cue when the last token lands ("done").
 *   reaching  — the Twin is proactively surfacing something ("I've noticed…").
 *   idle      — Still. "I'm here."
 */
export type PresenceState =
  | "idle"
  | "listening"
  | "gathering"
  | "speaking"
  | "arriving"
  | "reaching";

interface PresenceFrameProps {
  state: PresenceState;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}

/**
 * Ambient border that expresses the state of the conversation (v3.8): the
 * input border is the living state, not a floating orb. UI-only: never a
 * click target, never a badge/dot/counter/score. Ambient enrichment, not the
 * sole carrier — essential states stay legible in language and contrast, and
 * all motion is CSS-only and disabled under prefers-reduced-motion (where a
 * static tint keeps each active state distinguishable).
 */
export const PresenceFrame: React.FC<PresenceFrameProps> = ({
  state,
  className,
  style,
  children,
}) => {
  return (
    <div
      data-presence={state}
      className={cn("presence-frame", className)}
      style={style}
    >
      {children}
    </div>
  );
};

export default PresenceFrame;
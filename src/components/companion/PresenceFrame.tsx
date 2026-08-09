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
  /**
   * Determinate background work, 0–100. The floating orb used to carry this as
   * an outer ring; the border inherits it, because the border is now where
   * presence lives.
   *
   * It is a different kind of signal from `state`: state is what the Twin is
   * doing in this conversation, progress is work happening behind it. They can
   * be true at once, so the ring draws over the state animation rather than
   * replacing it. Null or undefined means nothing is running — no track, no
   * arc, no residue.
   */
  progress?: number | null;
  /** Accessible name for the progress ring, e.g. "Deep report". */
  progressLabel?: string;
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
  progress,
  progressLabel = "Background work",
  className,
  style,
  children,
}) => {
  const hostRef = React.useRef<HTMLDivElement>(null);
  const [box, setBox] = React.useState<{ w: number; h: number } | null>(null);

  const showRing = typeof progress === "number" && progress > 0 && progress < 100;

  // The frame is a pill of unknown width, so the ring is a rounded rect rather
  // than a circle and has to be measured. `pathLength="100"` then normalises
  // the perimeter, which makes the dash maths independent of the measurement —
  // a stale box shows a slightly wrong shape for one frame, never a wrong
  // percentage.
  React.useEffect(() => {
    if (!showRing) return;
    const el = hostRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const measure = () => setBox({ w: el.offsetWidth, h: el.offsetHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [showRing]);

  const pct = showRing ? Math.max(0, Math.min(100, progress as number)) : 0;

  return (
    <div
      ref={hostRef}
      data-presence={state}
      className={cn("presence-frame", className)}
      style={style}
    >
      {showRing && box && (
        <svg
          className="presence-progress"
          width={box.w}
          height={box.h}
          aria-hidden="true"
          focusable="false"
        >
          {/* The unfilled remainder, so the arc reads as a proportion rather
              than a lone travelling mark. */}
          <rect
            x={1.5}
            y={1.5}
            width={Math.max(0, box.w - 3)}
            height={Math.max(0, box.h - 3)}
            rx={9999}
            ry={9999}
            fill="none"
            stroke="hsl(var(--soul-purple) / 0.10)"
            strokeWidth={3}
          />
          <rect
            x={1.5}
            y={1.5}
            width={Math.max(0, box.w - 3)}
            height={Math.max(0, box.h - 3)}
            rx={9999}
            ry={9999}
            fill="none"
            stroke="hsl(var(--soul-teal) / 0.85)"
            strokeWidth={3}
            strokeLinecap="round"
            pathLength={100}
            strokeDasharray={100}
            strokeDashoffset={100 - pct}
          />
        </svg>
      )}
      {/* The ring is ambient; this is the state in language. Visually hidden so
          the border stays the only thing competing for attention, and polite so
          it never interrupts what the reader is doing. */}
      {showRing && (
        <span className="sr-only" role="status" aria-live="polite">
          {progressLabel}: {Math.round(pct)}%
        </span>
      )}
      {children}
    </div>
  );
};

export default PresenceFrame;

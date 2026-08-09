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

/**
 * The ring is drawn just INSIDE the element's own bounds, riding the outer edge
 * of the frame's 3px border band.
 *
 * It used to sit outside, which needed 4px of room the layout does not have —
 * the input is pinned to the bottom of a fixed container, so the ring was
 * clipped. A decoration that requires its host to make space for it is the
 * wrong shape of decoration. Half the stroke width keeps the whole stroke
 * within the box, so it can never be cut off no matter what contains it.
 */
const RING_STROKE = 2;
const RING_INSET = RING_STROKE / 2;

interface PresenceFrameProps {
  state: PresenceState;
  /**
   * The deep blueprint, 0–100, as a second line riding the border's outer edge.
   *
   * The border itself is spoken for — it carries the conversation's presence
   * states — so this is a separate line riding its outer edge. It has two
   * lives: it fills while the blueprint is being woven, and at 100 it stays,
   * quietly, for good. A completed hermetic blueprint is a permanent fact about
   * this person, so the frame keeps showing it rather than returning to bare.
   *
   * Null means there is no blueprint and none being built: no line at all.
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

  const showRing = typeof progress === "number" && progress > 0;
  const complete = showRing && (progress as number) >= 100;

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

  // Softer once complete: growing is an event worth watching, having grown is a
  // fact worth keeping — it should not keep asking for attention for the rest of
  // the relationship.
  const strokeColour = complete
    ? "hsl(var(--soul-teal) / 0.45)"
    : "hsl(var(--soul-teal) / 0.85)";

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
          {/* One arc, inset by half its own stroke so it rides the outer edge
              of the frame without leaving the box. No track ring behind it: a
              second full outline would read as a second border, which is what
              this is meant to decorate, not duplicate.

              rx and ry are both half the height. SVG clamps rx to width/2 and
              ry to height/2 independently, so rx={9999} on a wide box yields
              an ellipse rather than a pill — the oval this replaces. */}
          <rect
            x={RING_INSET}
            y={RING_INSET}
            width={Math.max(0, box.w - RING_STROKE)}
            height={Math.max(0, box.h - RING_STROKE)}
            rx={Math.max(0, box.h - RING_STROKE) / 2}
            ry={Math.max(0, box.h - RING_STROKE) / 2}
            fill="none"
            stroke={strokeColour}
            strokeWidth={RING_STROKE}
            strokeLinecap="round"
            pathLength={100}
            strokeDasharray={100}
            strokeDashoffset={100 - pct}
          />
        </svg>
      )}
      {/* The ring is ambient; this is the state in language. Visually hidden so
          the border stays the only thing competing for attention, and polite so
          it never interrupts what the reader is doing. Silent once complete —
          a permanent line should not keep announcing itself. */}
      {showRing && !complete && (
        <span className="sr-only" role="status" aria-live="polite">
          {progressLabel}: {Math.round(pct)}%
        </span>
      )}
      {children}
    </div>
  );
};

export default PresenceFrame;

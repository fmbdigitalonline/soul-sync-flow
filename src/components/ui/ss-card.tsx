import React from "react";
import { cn } from "@/lib/utils";

/**
 * The card.
 *
 * `.ss-card` in index.css has defined one for a while — 24px radius, 20px
 * padding, a 1px `--ss-line` border, one shadow — but nothing made it the only
 * way to draw a surface. So the app grew five corner radii (8, 12, 16, 24, and
 * full), four paddings, two card components and a long tail of hand-rolled
 * divs, and every screen ended up with slightly different edges.
 *
 * This is the single primitive. It takes no radius, no padding and no border
 * props on purpose: those are the decisions that drifted, and a component that
 * lets you re-decide them locally is a suggestion rather than a system. What it
 * does take is `tone` — the small set of surface meanings the design actually
 * uses — and `className` for layout (grid, flex, margins), which is the caller's
 * business and not the card's.
 *
 * Companion to the lint rule in eslint.config.js: that rule stops raw
 * `rounded-*` scale classes reappearing, this gives people the thing to use
 * instead.
 */

export type SsCardTone =
  /** The default surface. What almost everything should be. */
  | "plain"
  /** Carries the accent wash — for a card that is the point of its screen. */
  | "accent"
  /** Recedes: no shadow, hairline only. For nested or secondary surfaces. */
  | "quiet";

export interface SsCardProps extends React.HTMLAttributes<HTMLDivElement> {
  tone?: SsCardTone;
  /** Renders as <button>. Use when the whole card is the click target. */
  as?: "div" | "button" | "article" | "section";
  children?: React.ReactNode;
}

const TONE_STYLE: Record<SsCardTone, React.CSSProperties> = {
  plain: {},
  accent: {
    background: "var(--ss-accent-wash)",
    borderColor: "transparent",
  },
  quiet: {
    boxShadow: "none",
    background: "transparent",
  },
};

export const SsCard = React.forwardRef<HTMLDivElement, SsCardProps>(
  ({ tone = "plain", as = "div", className, style, children, ...rest }, ref) => {
    const Tag = as as any;
    return (
      <Tag
        ref={ref}
        className={cn("ss-card", as === "button" && "text-left w-full", className)}
        style={{ ...TONE_STYLE[tone], ...style }}
        {...rest}
      >
        {children}
      </Tag>
    );
  },
);

SsCard.displayName = "SsCard";

export default SsCard;

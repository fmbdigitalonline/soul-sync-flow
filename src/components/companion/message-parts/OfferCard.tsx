import React, { useState } from "react";
import { CardShell } from "./CardShell";

/**
 * OfferCard — the deterministic confirmation rail (Constitution Phase 2 §1).
 *
 * The twin deals this card via the side-effect-free `offer_decomposition`
 * tool: dealing it creates NO goal and writes nothing — it only presents a
 * single tappable offer. One tap is the whole rail: it speaks a visible
 * message into the stream AND sends
 * confirmedAction:{ type:'decompose_goal', title }. The title is FROZEN from
 * the user's own words at offer time, so the goal can't drift between the
 * offer and the decomposition. No typing, no detection, no second surface.
 *
 * Once tapped the card self-fossils (live-then-fossil): the newest offer is
 * the only live one, and a confirmed offer becomes a quiet one-liner.
 */
export const OfferCard: React.FC<{
  title: string;
  fossil?: boolean;
  onConfirm?: (title: string) => void; // speaks + sends confirmedAction
}> = ({ title, fossil, onConfirm }) => {
  const [confirmed, setConfirmed] = useState(false);

  if (fossil || confirmed) {
    return (
      <CardShell
        fossil
        summary={
          <>🌱 {title || "your goal"} — {confirmed ? "breaking it down…" : "offered"}</>
        }
      />
    );
  }

  return (
    <CardShell
      onPrimary={() => {
        setConfirmed(true);
        onConfirm?.(title);
      }}
      summary={
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm">
            Break <span className="font-semibold">{title}</span> into milestones?
          </span>
          <span className="shrink-0 text-xs rounded-lg px-3 py-1.5 border border-soul-purple/30 bg-soul-purple/10">
            Break it down →
          </span>
        </div>
      }
    />
  );
};

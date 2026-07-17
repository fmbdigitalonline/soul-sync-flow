import React, { useState } from "react";
import { CardShell } from "./CardShell";

/**
 * OfferCard — the deterministic confirmation rail (Constitution Phase 2 §1),
 * blueprint-informed since ChoiceCard Slice 2 (v2.3 dealer table).
 *
 * The twin deals this card via the side-effect-free deal rail (or the
 * `offer_decomposition` tool): dealing it creates NO goal and writes nothing —
 * it only presents a tappable offer. One tap is the whole rail: it speaks a
 * visible message into the stream AND sends
 * confirmedAction:{ type:'decompose_goal', title }. The title is FROZEN from
 * the user's own words at offer time, so the goal can't drift between the
 * offer and the decomposition. No typing, no detection, no second surface.
 *
 * Slice 2 fields, both optional and fail-soft to the Slice-1 card:
 * - `frame`: MBTI-worded door label (same route, different words) — absent
 *   when MBTI is unknown, falling back to the fixed copy.
 * - `deferChip`: dealt ONLY for emotional authority — "Let me sit with this"
 *   is their decision mechanic honored structurally. Tapping it speaks a
 *   plain visible message (no confirmedAction) and fossils the card.
 *
 * Once tapped the card self-fossils (live-then-fossil): the newest offer is
 * the only live one; a confirmed offer becomes a quiet one-liner, a deferred
 * one a "sitting with it" line.
 */
export const OfferCard: React.FC<{
  title: string;
  fossil?: boolean;
  frame?: string;
  deferChip?: boolean;
  onConfirm?: (title: string) => void; // speaks + sends confirmedAction
  onDefer?: () => void; // speaks a plain visible message, no confirmedAction
}> = ({ title, fossil, frame, deferChip, onConfirm, onDefer }) => {
  const [state, setState] = useState<"live" | "confirmed" | "deferred">("live");

  if (fossil || state !== "live") {
    return (
      <CardShell
        fossil
        summary={
          <>
            🌱 {title || "your goal"} —{" "}
            {state === "confirmed"
              ? "breaking it down…"
              : state === "deferred"
                ? "sitting with it"
                : "offered"}
          </>
        }
      />
    );
  }

  return (
    <CardShell
      onPrimary={() => {
        setState("confirmed");
        onConfirm?.(title);
      }}
      summary={
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm">
              Break <span className="font-semibold">{title}</span> into milestones?
            </span>
            <span className="shrink-0 text-xs rounded-lg px-3 py-1.5 border border-soul-purple/30 bg-soul-purple/10">
              {frame || "Break it down →"}
            </span>
          </div>
          {deferChip && (
            <button
              type="button"
              className="self-end text-xs rounded-lg px-3 py-1.5 border border-border/40 bg-background/50 text-muted-foreground hover:bg-background/80 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                setState("deferred");
                onDefer?.();
              }}
            >
              Let me sit with this
            </button>
          )}
        </div>
      }
    />
  );
};

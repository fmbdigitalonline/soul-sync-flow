import React, { useState } from "react";
import { CardShell } from "./CardShell";

/**
 * OfferCard — the deterministic confirmation rail (Constitution Phase 2 §1),
 * blueprint-informed since ChoiceCard Slice 2, and since the compression
 * pivot the CONVERSATIONAL INTAKE FORM: the Dreams-page intake (title /
 * category / timeframe / why) compressed to one card with one confirm tap.
 *
 * The card is dealt by two doors that converge here:
 * - twin-driven: the deal rail (stated-goal turns) or the
 *   `offer_decomposition` tool — side-effect-free, nothing written.
 * - user-driven: sentence selection → "Dream this" — the selected words ARE
 *   the title (perfect fidelity by construction), page defaults prefill the
 *   rest, no model call anywhere in the loop.
 *
 * One tap is the whole rail: it speaks a visible message AND sends
 * confirmedAction:{ type:'decompose_goal', title, category?, timeframe? }.
 * Every field is FROZEN at offer time — what the card shows is what the
 * dream gets. Intake fields are optional; absent → the Slice-1 face.
 *
 * Slice 2 fields (unchanged): `frame` = MBTI-worded door label;
 * `deferChip` = emotional authority's "Let me sit with this".
 * Live-then-fossil: confirmed → "breaking it down…", deferred →
 * "sitting with it".
 */

const CATEGORY_LABELS: Record<string, string> = {
  personal_growth: "Personal growth",
  career: "Career",
  health: "Health",
  relationships: "Relationships",
  creativity: "Creativity",
  financial: "Financial",
  spiritual: "Spiritual",
};

export const OfferCard: React.FC<{
  title: string;
  fossil?: boolean;
  frame?: string;
  deferChip?: boolean;
  category?: string;
  timeframe?: string;
  onConfirm?: (title: string) => void; // speaks + sends confirmedAction
  onDefer?: () => void; // speaks a plain visible message, no confirmedAction
}> = ({ title, fossil, frame, deferChip, category, timeframe, onConfirm, onDefer }) => {
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

  const intakeChips = [
    category ? (CATEGORY_LABELS[category] || category) : null,
    timeframe || null,
  ].filter(Boolean) as string[];

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
          {(intakeChips.length > 0 || deferChip) && (
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 flex-wrap">
                {intakeChips.map((chip) => (
                  <span
                    key={chip}
                    className="text-[11px] rounded-md px-2 py-0.5 border border-border/40 bg-background/50 text-muted-foreground"
                  >
                    {chip}
                  </span>
                ))}
              </div>
              {deferChip && (
                <button
                  type="button"
                  className="shrink-0 text-xs rounded-lg px-3 py-1.5 border border-border/40 bg-background/50 text-muted-foreground hover:bg-background/80 transition-colors"
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
          )}
        </div>
      }
    />
  );
};

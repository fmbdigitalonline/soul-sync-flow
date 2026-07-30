/**
 * TurningPoints — the timeline of what the person confirmed, and the one
 * question the Twin is currently asking.
 *
 * The timeline used to list recent conversations under the heading "moments
 * that shaped you", which asserted something the system could not know. It now
 * holds only what was answered yes to. The Twin brings the evidence and asks;
 * the person decides what counted.
 */

import React from "react";
import { Compass, X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTurningPoints } from "@/hooks/use-turning-points";
import type { TurningPointReason } from "@/services/turning-point-service";

const REASON: Record<TurningPointReason, { en: string; nl: string }> = {
  acted: {
    en: "You acted on something that surfaced here.",
    nl: "Je deed iets met wat hier naar boven kwam.",
  },
  recognised: {
    en: "You recognised something here, and kept it.",
    nl: "Je herkende hier iets, en hield het vast.",
  },
  depth: {
    en: "You stayed with this one much longer than usual.",
    nl: "Je bleef hier veel langer bij dan gewoonlijk.",
  },
  return: {
    en: "You came back to this after a long quiet stretch.",
    nl: "Je kwam hierop terug na een lange stilte.",
  },
};

export const TurningPoints: React.FC = () => {
  const { language } = useLanguage();
  const nl = language === "nl";
  const { kept, proposal, loading, keep, decline, forget } = useTurningPoints();

  const year = (iso: string) => {
    const y = new Date(iso).getFullYear();
    return Number.isFinite(y) ? String(y) : "";
  };

  return (
    <div className="ss-card">
      <span className="ss-eyebrow"><Compass className="h-3.5 w-3.5" /> {nl ? "Keerpunten" : "Turning points"}</span>
      <p className="ss-caption mt-0.5" style={{ color: "var(--ss-muted)" }}>
        {nl ? "Momenten die je vormden." : "Moments that shaped you."}
      </p>

      {kept.length > 0 && (
        <div className="mt-4 flex flex-col">
          {kept.map((k, i, arr) => {
            const last = i === arr.length - 1;
            return (
              <div key={k.sessionId} className="flex gap-3 ss-rise" style={{ ['--i' as any]: i } as React.CSSProperties}>
                <div className="flex flex-col items-center" style={{ width: 12 }}>
                  <span className="shrink-0 rounded-full" style={{ width: 10, height: 10, marginTop: 4, background: "var(--ss-accent)", boxShadow: "0 0 0 4px var(--ss-accent-wash)" }} />
                  {!last && <span className="flex-1" style={{ width: 2, marginTop: 2, marginBottom: 2, background: "var(--ss-line)" }} />}
                </div>
                <div className={`flex-1 min-w-0 ${last ? "pb-0.5" : "pb-5"}`}>
                  <div className="flex items-start gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="ss-caption font-semibold tabular-nums" style={{ color: "var(--ss-accent-ink)" }}>{year(k.at)}</div>
                      <div className="ss-sub leading-relaxed mt-0.5" style={{ color: "var(--ss-ink)" }}>{k.title}</div>
                    </div>
                    <button
                      onClick={() => forget(k.sessionId)}
                      className="ss-press shrink-0 rounded-full p-1"
                      aria-label={nl ? "Verwijder dit keerpunt" : "Remove this turning point"}
                      title={nl ? "Verwijder dit keerpunt" : "Remove this turning point"}
                      style={{ color: "var(--ss-faint)" }}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* The question. One at a time — the Twin asks, it never marks. */}
      {proposal && (
        <div
          className="mt-4 ss-settle"
          style={{
            borderRadius: "var(--ss-radius)",
            border: "1px solid var(--ss-line)",
            padding: 14,
            background: "var(--ss-accent-wash)",
          }}
        >
          <div className="ss-sub leading-relaxed" style={{ color: "var(--ss-ink)" }}>
            {nl ? "Dit voelde als een keerpunt — bewaren?" : "This felt like a turning point — keep it?"}
          </div>
          <div className="ss-heading leading-relaxed mt-2" style={{ color: "var(--ss-accent-ink)" }}>
            {proposal.title}
          </div>
          <div className="ss-caption mt-1" style={{ color: "var(--ss-muted)" }}>
            <span className="tabular-nums">{year(proposal.at)}</span> · {REASON[proposal.reason][nl ? "nl" : "en"]}
          </div>
          <div className="flex items-center gap-2 mt-3">
            <button
              onClick={keep}
              className="ss-press ss-sub font-semibold rounded-full px-4 py-2"
              style={{ background: "var(--ss-accent)", color: "#fff" }}
            >
              {nl ? "Bewaren" : "Keep it"}
            </button>
            <button
              onClick={decline}
              className="ss-press ss-sub font-semibold rounded-full px-4 py-2 border"
              style={{ background: "var(--ss-card)", color: "var(--ss-muted)", borderColor: "var(--ss-line)" }}
            >
              {nl ? "Deze niet" : "Not this one"}
            </button>
          </div>
        </div>
      )}

      {!loading && kept.length === 0 && !proposal && (
        <div className="text-sm mt-3" style={{ color: "var(--ss-faint)" }}>
          {nl ? "Je reis is nog pril." : "Your journey is still early."}
        </div>
      )}
    </div>
  );
};

export default TurningPoints;

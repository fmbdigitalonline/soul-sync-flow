/**
 * ReportSummaryCalm — the calm standard-report view (design system).
 * The Integrated Summary card + Key Themes (the report's real named
 * sections), matching the redesign. "View full report" opens the full
 * report modal for the complete text.
 */

import React from "react";
import { Sparkles, Heart, Compass, Users, Star, Zap, ChevronRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface ReportSummaryCalmProps {
  content: {
    core_personality_pattern?: string;
    decision_making_style?: string;
    relationship_style?: string;
    life_path_purpose?: string;
    current_energy_timing?: string;
    integrated_summary?: string;
  };
  sectionTitles: Record<string, string>;
  onViewFull: () => void;
}

const THEME_META: Array<{ key: string; icon: React.ReactNode }> = [
  { key: "core_personality_pattern", icon: <Heart className="h-[18px] w-[18px]" /> },
  { key: "decision_making_style", icon: <Compass className="h-[18px] w-[18px]" /> },
  { key: "relationship_style", icon: <Users className="h-[18px] w-[18px]" /> },
  { key: "life_path_purpose", icon: <Star className="h-[18px] w-[18px]" /> },
  { key: "current_energy_timing", icon: <Zap className="h-[18px] w-[18px]" /> },
];

function firstSentence(text?: string): string {
  if (!text) return "";
  const clean = String(text).replace(/\s+/g, " ").trim();
  const cut = clean.split(/(?<=[.!?])\s/)[0];
  return cut.length > 90 ? `${cut.slice(0, 89).replace(/\s+\S*$/, "")}…` : cut;
}

export const ReportSummaryCalm: React.FC<ReportSummaryCalmProps> = ({ content, sectionTitles, onViewFull }) => {
  const { language } = useLanguage();
  const nl = language === "nl";
  const summary = content?.integrated_summary || "";

  const themes = THEME_META.map((m) => ({ ...m, title: sectionTitles[m.key], body: (content as any)?.[m.key] as string | undefined }))
    .filter((th) => th.body && th.title);

  return (
    <div className="ss flex flex-col gap-5">
      {/* Integrated Summary */}
      {summary && (
        <div className="ss-card" style={{ padding: 20 }}>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" style={{ color: "var(--ss-accent)" }} />
            <span className="text-[17px] font-semibold tracking-tight" style={{ color: "var(--ss-ink)" }}>
              {nl ? "Geïntegreerde samenvatting" : "Integrated Summary"}
            </span>
          </div>
          <span className="inline-block mt-2 text-[11.5px] font-semibold rounded-full px-2.5 py-0.5"
            style={{ color: "var(--ss-green)", background: "rgba(52,201,138,.13)" }}>
            {summary.length} {nl ? "tekens" : "chars"}
          </span>
          <div className="mt-3 rounded-2xl p-4 text-[14.5px] leading-relaxed"
            style={{ background: "var(--ss-accent-wash)", color: "var(--ss-ink)", border: "1px solid var(--ss-line)" }}>
            {summary}
          </div>
        </div>
      )}

      {/* Key Themes — the report's real sections */}
      {themes.length > 0 && (
        <div className="flex flex-col gap-2.5">
          <div className="text-[13px] font-semibold px-1" style={{ color: "var(--ss-ink)" }}>
            {nl ? "Kernthema's" : "Key Themes"}
          </div>
          {themes.map((th) => (
            <button key={th.key} onClick={onViewFull} className="ss-card flex items-start gap-3.5 text-left w-full" style={{ padding: 16 }}>
              <span className="shrink-0 grid place-items-center"
                style={{ width: 40, height: 40, borderRadius: 12, background: "var(--ss-accent-wash)", color: "var(--ss-accent)" }}>
                {th.icon}
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-[15px] font-semibold" style={{ color: "var(--ss-ink)" }}>{th.title}</div>
                <div className="text-[13px] leading-relaxed mt-0.5" style={{ color: "var(--ss-muted)" }}>{firstSentence(th.body)}</div>
              </div>
              <ChevronRight className="h-[18px] w-[18px] shrink-0 mt-0.5" style={{ color: "var(--ss-faint)" }} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReportSummaryCalm;

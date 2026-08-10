/**
 * ReportSummaryCalm — the calm standard-report view (design system).
 * The Integrated Summary card + Key Themes (the report's real named
 * sections), matching the redesign. "View full report" opens the full
 * report modal for the complete text.
 */

import React from "react";
import { ChevronRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { ReportSectionFigure } from "./notation/ReportSectionFigure";

export interface CalmTheme {
  key: string;
  title: string;
  /** A prose body — the snippet shows its first sentence. */
  body?: string;
  /** For sections that aren't prose (e.g. nested groups): a plain subtitle. */
  note?: string;
}

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
  /** Optional explicit themes (used by the Hermetic report, whose sections
   *  differ from the standard five). Falls back to the standard mapping. */
  themes?: CalmTheme[];
  /** Opens the single section that was tapped. Without it, a tap falls back
   *  to the full report (the old behaviour). */
  onOpenSection?: (key: string) => void;
}

/** The standard report's five named sections, in reading order. */
const THEME_KEYS = [
  "core_personality_pattern",
  "decision_making_style",
  "relationship_style",
  "life_path_purpose",
  "current_energy_timing",
];


/**
 * The Hermetic summary arrives as markdown ("# The Living Symphony…", "---",
 * "## I."). A snippet is prose, so strip the syntax rather than printing it.
 */
function plainText(text?: string): string {
  if (!text) return "";
  return String(text)
    .replace(/```[\s\S]*?```/g, " ")        // fenced code
    .replace(/^\s*#{1,6}\s*/gm, "")         // headings
    .replace(/^\s*[-*_]{3,}\s*$/gm, " ")    // horizontal rules
    .replace(/^\s*>\s?/gm, "")              // block quotes
    .replace(/^\s*[-*+]\s+/gm, "")          // bullets
    .replace(/\*\*(.*?)\*\*/g, "$1")      // bold
    .replace(/(^|[^*])\*(?!\*)([^*]+)\*/g, "$1$2") // italic
    .replace(/`([^`]+)`/g, "$1")             // inline code
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")     // links
    .replace(/\s+/g, " ")
    .trim();
}

function firstSentence(text?: string): string {
  if (!text) return "";
  const clean = plainText(text);
  const cut = clean.split(/(?<=[.!?])\s/)[0];
  return cut.length > 90 ? `${cut.slice(0, 89).replace(/\s+\S*$/, "")}…` : cut;
}

export const ReportSummaryCalm: React.FC<ReportSummaryCalmProps> = ({ content, sectionTitles, onViewFull, themes: themesProp, onOpenSection }) => {
  const { language } = useLanguage();
  const nl = language === "nl";
  const summary = content?.integrated_summary || "";

  const derived: CalmTheme[] = THEME_KEYS
    .map((key) => ({ key, title: sectionTitles[key], body: (content as any)?.[key] as string | undefined }))
    .filter((th) => th.body && th.title);

  // Every section — standard or Hermetic — draws its own geometric figure, so
  // there is no icon rhythm to assign here.
  const themes: CalmTheme[] = themesProp
    ? themesProp.filter((th) => th.title && (th.body || th.note))
    : derived;

  return (
    <div className="ss flex flex-col gap-5">
      {/* Integrated Summary — a snippet; the full text is in the report modal. */}
      {summary && (
        <div className="ss-card ss-rise" style={{ padding: 'var(--ss-pad)' }}>
          <div className="flex items-center gap-2.5">
            <span className="shrink-0 grid place-items-center"
              style={{ width: 36, height: 36, borderRadius: 'var(--ss-radius-sm)', background: "var(--ss-accent-wash)" }}>
              <ReportSectionFigure section="integrated_summary" size={28} animate />
            </span>
            <span className="ss-title tracking-tight" style={{ color: "var(--ss-ink)" }}>
              {nl ? "Geïntegreerde samenvatting" : "Integrated Summary"}
            </span>
          </div>
          <p className="mt-2.5 ss-body leading-relaxed line-clamp-3" style={{ color: "var(--ss-muted)" }}>{plainText(summary)}</p>
          <button onClick={onViewFull} className="mt-2.5 inline-flex items-center gap-1 ss-sub font-semibold" style={{ color: "var(--ss-accent-ink)" }}>
            {nl ? "Lees volledig" : "Read full"} <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Key Themes — the report's real sections */}
      {themes.length > 0 && (
        <div className="flex flex-col gap-2.5">
          <div className="ss-heading tracking-tight px-1" style={{ color: "var(--ss-ink)" }}>
            {nl ? "Kernthema's" : "Key Themes"}
          </div>
          {themes.map((th, i) => (
            <button key={th.key} onClick={() => (onOpenSection ? onOpenSection(th.key) : onViewFull())}
              className="ss-card ss-rise ss-press flex items-start gap-3.5 text-left w-full"
              style={{ padding: 'var(--ss-pad-sm)', ['--i' as any]: i + 1 } as React.CSSProperties}>
              <span className="shrink-0 grid place-items-center"
                style={{ width: 44, height: 44, borderRadius: 'var(--ss-radius-sm)', background: "var(--ss-accent-wash)", color: "var(--ss-accent)" }}>
                <ReportSectionFigure section={th.key} size={34} animate />
              </span>
              <div className="min-w-0 flex-1">
                <div className="ss-heading" style={{ color: "var(--ss-ink)" }}>{th.title}</div>
                <div className="ss-sub leading-relaxed mt-0.5" style={{ color: "var(--ss-muted)" }}>
                  {th.body ? firstSentence(th.body) : (th as CalmTheme).note}
                </div>
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

/**
 * ReportSummaryCalm — the calm standard-report view (design system).
 * The Integrated Summary card + Key Themes (the report's real named
 * sections), matching the redesign. "View full report" opens the full
 * report modal for the complete text.
 */

import React from "react";
import { Sparkles, Heart, Compass, Users, Star, Zap, ChevronRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { BlueprintFigure, hasFigure } from "./notation/BlueprintFigure";

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
  /** The reader's own blueprint, so each theme can carry THEIR figure rather
   *  than a generic icon. Falls back to the icon when a figure can't be drawn. */
  blueprint?: any;
}

const THEME_META: Array<{ key: string; icon: React.ReactNode }> = [
  { key: "core_personality_pattern", icon: <Heart className="h-[18px] w-[18px]" /> },
  { key: "decision_making_style", icon: <Compass className="h-[18px] w-[18px]" /> },
  { key: "relationship_style", icon: <Users className="h-[18px] w-[18px]" /> },
  { key: "life_path_purpose", icon: <Star className="h-[18px] w-[18px]" /> },
  { key: "current_energy_timing", icon: <Zap className="h-[18px] w-[18px]" /> },
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

/**
 * Each standard-report section is about one system, so it can carry the
 * reader's OWN figure from that system rather than a stock icon: their
 * function stack, their bodygraph, their life-path geometry, their sky.
 */
function figureFor(key: string, bp: any): { category: string; value: string | number } | null {
  if (!bp) return null;
  const c = bp.cognitiveTemperamental || {};
  const e = bp.energyDecisionStrategy || {};
  const n = bp.coreValuesNarrative || {};
  const a = bp.publicArchetype || {};
  switch (key) {
    case 'core_personality_pattern': return c.mbtiType ? { category: 'mbtiDescriptions', value: c.mbtiType } : null;
    case 'decision_making_style':    return e.humanDesignType ? { category: 'humanDesignDescriptions', value: e.humanDesignType } : null;
    case 'relationship_style':       return a.moonSign ? { category: 'moonSignDescriptions', value: a.moonSign } : null;
    case 'life_path_purpose':        return n.lifePath ? { category: 'lifePathDescriptions', value: n.lifePath } : null;
    case 'current_energy_timing':    return a.sunSign ? { category: 'sunSignDescriptions', value: a.sunSign } : null;
    default: return null;
  }
}

export const ReportSummaryCalm: React.FC<ReportSummaryCalmProps> = ({ content, sectionTitles, onViewFull, themes: themesProp, onOpenSection, blueprint }) => {
  const { language } = useLanguage();
  const nl = language === "nl";
  const summary = content?.integrated_summary || "";

  const derived = THEME_META.map((m) => ({ ...m, title: sectionTitles[m.key], body: (content as any)?.[m.key] as string | undefined }))
    .filter((th) => th.body && th.title);

  // Explicit themes (Hermetic) get the same icon rhythm as the standard five.
  const themes = themesProp
    ? themesProp
        .filter((th) => th.title && (th.body || th.note))
        .map((th, i) => ({ ...th, icon: THEME_META[i % THEME_META.length].icon }))
    : derived;

  return (
    <div className="ss flex flex-col gap-5">
      {/* Integrated Summary — a snippet; the full text is in the report modal. */}
      {summary && (
        <div className="ss-card ss-rise" style={{ padding: 20 }}>
          <div className="flex items-center gap-2">
            <Sparkles className="h-[18px] w-[18px]" style={{ color: "var(--ss-accent)" }} />
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
              style={{ padding: 16, ['--i' as any]: i + 1 } as React.CSSProperties}>
              <span className="shrink-0 grid place-items-center"
                style={{ width: 44, height: 44, borderRadius: 13, background: "var(--ss-accent-wash)", color: "var(--ss-accent)" }}>
                {(() => {
                  const f = figureFor(th.key, blueprint);
                  return f && hasFigure(f.category, f.value)
                    ? <BlueprintFigure category={f.category} value={f.value} size={34} />
                    : th.icon;
                })()}
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

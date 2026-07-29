/**
 * BlueprintOverview — the calm Blauwdruk overview (design system).
 * A grouped row-list of the full blueprint: personality, numerology (all
 * five numbers), astrology, human design, generational. Every row is
 * tappable and opens the calm detail modal (light / shadow / insight /
 * think·act·react). Reads the same blueprint shape and getPersonalityDescription
 * helper the legacy viewer used, so the data is unchanged — only the
 * presentation is the calm redesign.
 */

import React, { useState } from "react";
import { Brain, Hash, Star, Compass, Globe, Info } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { getPersonalityDescription } from "@/utils/personality-descriptions";
import PersonalityDetailModal from "./PersonalityDetailModal";
import { BlueprintFigure, hasFigure } from "./notation/BlueprintFigure";
import { ConstellationFigure, normaliseSign, signElement, ELEMENT_TINT } from "./notation/ConstellationFigure";

interface Item {
  category: string;
  label: string;
  value: string | number;
  /** lookup value for the description, when it differs from the shown value */
  descValue?: string | number;
}
interface Section {
  title: string;
  icon: React.ReactNode;
  items: Item[];
}

type ModalData = {
  isOpen: boolean;
  title: string;
  subtitle?: string;
  mainValue: string;
  light: string;
  shadow: string;
  insight: string;
  think?: string;
  act?: string;
  react?: string;
  category: string;
};

const BlueprintOverview: React.FC<{ blueprint: any }> = ({ blueprint }) => {
  const { t, language } = useLanguage();
  const nl = language === "nl";
  const [modal, setModal] = useState<ModalData | null>(null);

  const gd = (category: string, value: string | number) =>
    getPersonalityDescription(t, category, value, language) as any;

  const unknown = t("blueprint.values.unknown");
  const userMeta = blueprint?.user_meta || {};
  const name = userMeta.preferred_name || userMeta.full_name || "You";

  const c = blueprint?.cognitiveTemperamental || {};
  const e = blueprint?.energyDecisionStrategy || {};
  const n = blueprint?.coreValuesNarrative || {};
  const a = blueprint?.publicArchetype || {};
  const g = blueprint?.generationalCode || {};

  // The stored blueprint uses the literal string "Unknown" for a missing
  // value. Treated as present it slipped past the translated label and showed
  // English "Unknown" on a Dutch page — treat it as absent.
  const val = (v: any) =>
    v === undefined || v === null || v === "" || (typeof v === "string" && v.trim().toLowerCase() === "unknown")
      ? undefined
      : v;
  const num = (v: any) => (val(v) !== undefined && Number(v) > 0 ? Number(v) : undefined);

  // The sun sign anchors the page's atmosphere — one stored field, no new data.
  const signKey = normaliseSign(val(a.sunSign));
  const tint = ELEMENT_TINT[signElement(val(a.sunSign)) ?? "air"];

  const sections: Section[] = [
    {
      title: nl ? "Persoonlijkheid" : "Personality",
      icon: <Brain className="h-[16px] w-[16px]" />,
      items: [
        { category: "mbtiDescriptions", label: nl ? "MBTI Type" : "MBTI Type", value: val(c.mbtiType) ?? unknown },
        val(c.dominantFunction) && { category: "cognitiveFunctionDescriptions", label: nl ? "Cognitieve functies" : "Cognitive functions", value: `${c.dominantFunction}${c.auxiliaryFunction ? ` · ${c.auxiliaryFunction}` : ""}`, descValue: String(c.dominantFunction).toLowerCase() },
        { category: "taskApproachDescriptions", label: nl ? "Taakbenadering" : "Task approach", value: val(c.taskApproach) ?? "systematic" },
        { category: "communicationDescriptions", label: nl ? "Communicatie" : "Communication", value: val(c.communicationStyle) ?? "clear" },
        { category: "decisionMakingDescriptions", label: nl ? "Besluitvorming" : "Decision making", value: val(c.decisionMaking) ?? "logical" },
      ].filter(Boolean) as Item[],
    },
    {
      title: nl ? "Numerologie" : "Numerology",
      icon: <Hash className="h-[16px] w-[16px]" />,
      items: [
        num(n.lifePath) && { category: "lifePathDescriptions", label: nl ? "Levenspad" : "Life Path", value: num(n.lifePath)! },
        num(n.expressionNumber) && { category: "expressionNumberDescriptions", label: nl ? "Expressie" : "Expression", value: num(n.expressionNumber)! },
        num(n.soulUrgeNumber) && { category: "soulUrgeDescriptions", label: nl ? "Zieldrang" : "Soul Urge", value: num(n.soulUrgeNumber)! },
        num(n.personalityNumber) && { category: "personalityNumberDescriptions", label: nl ? "Persoonlijkheid" : "Personality", value: num(n.personalityNumber)! },
        num(n.birthdayNumber) && { category: "birthdayNumberDescriptions", label: nl ? "Verjaardag" : "Birthday", value: num(n.birthdayNumber)! },
      ].filter(Boolean) as Item[],
    },
    {
      title: nl ? "Astrologie" : "Astrology",
      icon: <Star className="h-[16px] w-[16px]" />,
      items: [
        val(a.sunSign) && { category: "sunSignDescriptions", label: nl ? "Zonneteken" : "Sun Sign", value: a.sunSign },
        val(a.moonSign) && { category: "moonSignDescriptions", label: nl ? "Maanteken" : "Moon Sign", value: a.moonSign },
        val(a.risingSign) && { category: "risingSignDescriptions", label: nl ? "Rijzend teken" : "Rising Sign", value: a.risingSign },
        val(a.socialStyle) && { category: "socialStyleDescriptions", label: nl ? "Sociale stijl" : "Social style", value: a.socialStyle },
        val(a.publicVibe) && { category: "publicVibeDescriptions", label: nl ? "Publieke uitstraling" : "Public vibe", value: a.publicVibe },
        val(a.leadershipStyle) && { category: "leadershipStyleDescriptions", label: nl ? "Leiderschap" : "Leadership", value: a.leadershipStyle },
      ].filter(Boolean) as Item[],
    },
    {
      title: "Human Design",
      icon: <Compass className="h-[16px] w-[16px]" />,
      items: [
        { category: "humanDesignDescriptions", label: nl ? "Type" : "Type", value: val(e.humanDesignType) ?? "Projector" },
        val(e.authority) && { category: "authorityDescriptions", label: nl ? "Autoriteit" : "Authority", value: e.authority },
        val(e.strategy) && { category: "strategyDescriptions", label: nl ? "Strategie" : "Strategy", value: e.strategy },
        val(e.profile) && { category: "profileDescriptions", label: nl ? "Profiel" : "Profile", value: e.profile },
        val(e.pacing) && { category: "pacingDescriptions", label: nl ? "Tempo" : "Pacing", value: e.pacing },
      ].filter(Boolean) as Item[],
    },
    {
      title: nl ? "Generationeel" : "Generational",
      icon: <Globe className="h-[16px] w-[16px]" />,
      items: [
        val(g.chineseZodiac) && { category: "chineseZodiacDescriptions", label: nl ? "Chinese dierenriem" : "Chinese Zodiac", value: g.element ? `${g.chineseZodiac} ${g.element}` : g.chineseZodiac, descValue: g.chineseZodiac },
      ].filter(Boolean) as Item[],
    },
  ].filter((s) => s.items.length > 0);

  const openDetail = (item: Item, sectionTitle: string) => {
    const d = gd(item.category, item.descValue ?? item.value);
    setModal({
      isOpen: true,
      title: d?.fullTitle || item.label,
      subtitle: item.label,
      mainValue: String(item.value),
      light: d?.light || "",
      shadow: d?.shadow || "",
      insight: d?.insight || "",
      think: d?.think,
      act: d?.act,
      react: d?.react,
      category: sectionTitle,
    });
  };

  return (
    <div className="ss flex flex-col gap-5">
      {/* Signature — the sun sign's own sky opens the page. Falls back to the
          plain identity row when the sign can't be read. */}
      {signKey ? (
        <div
          className="flex items-center justify-between gap-3 ss-settle"
          style={{
            borderRadius: "var(--ss-radius)",
            border: "1px solid var(--ss-line)",
            padding: "16px 18px",
            background: `radial-gradient(240px 130px at 86% -14%, ${tint.glow}, transparent 64%),
                         radial-gradient(200px 120px at 4% 112%, var(--ss-accent-wash-2), transparent 62%),
                         linear-gradient(180deg, ${tint.tint}, transparent)`,
          }}
        >
          <div className="min-w-0">
            <div className="ss-avatar" style={{ width: 44, height: 44, fontSize: 18 }}>{name.charAt(0).toUpperCase()}</div>
            <div className="ss-title tracking-tight mt-2.5" style={{ color: "var(--ss-ink)" }}>{name}</div>
            <div className="ss-sub" style={{ color: "var(--ss-muted)" }}>{nl ? "Jouw Mental Blueprint" : "Your Mental Blueprint"}</div>
          </div>
          <ConstellationFigure sign={String(a.sunSign)} size={110} elemental animate />
        </div>
      ) : (
        <div className="flex items-center gap-3.5">
          <div className="ss-avatar" style={{ width: 56, height: 56, fontSize: 22 }}>{name.charAt(0).toUpperCase()}</div>
          <div className="min-w-0">
            <div className="ss-title tracking-tight" style={{ color: "var(--ss-ink)" }}>{name}</div>
            <div className="ss-sub" style={{ color: "var(--ss-muted)" }}>{nl ? "Jouw Mental Blueprint" : "Your Mental Blueprint"}</div>
          </div>
        </div>
      )}

      {sections.map((section) => (
        <div key={section.title} className="flex flex-col gap-2.5">
          <div className="flex items-center gap-1.5 px-1">
            <span style={{ color: "var(--ss-accent)" }}>{section.icon}</span>
            <span className="ss-caption font-semibold uppercase tracking-wider" style={{ color: "var(--ss-faint)" }}>{section.title}</span>
          </div>
          {section.items.map((item, idx) => {
            const insight = gd(item.category, item.descValue ?? item.value)?.insight as string | undefined;
            // Each system draws in its own notation; a facet we cannot read
            // keeps the plain tile rather than showing an invented figure.
            const drawn = hasFigure(item.category, item.value);
            return (
              <button
                key={item.label}
                onClick={() => openDetail(item, section.title)}
                className="ss-card ss-rise ss-press flex items-start gap-3 text-left w-full"
                style={{ padding: 16, ['--i' as any]: idx }}
              >
                <span className="shrink-0 grid place-items-center"
                  style={{ width: 44, height: 44, borderRadius: 13, background: "var(--ss-accent-wash)", color: "var(--ss-accent)" }}>
                  {drawn ? <BlueprintFigure category={item.category} value={item.value} size={36} /> : section.icon}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="ss-caption" style={{ color: "var(--ss-muted)" }}>{item.label}</div>
                  <div className="ss-heading tracking-tight mt-0.5 capitalize" style={{ color: "var(--ss-accent-ink)" }}>{item.value}</div>
                  {insight && (
                    <div className="ss-caption leading-relaxed mt-1.5 line-clamp-2" style={{ color: "var(--ss-muted)" }}>{insight}</div>
                  )}
                </div>
                <Info className="h-[17px] w-[17px] shrink-0 mt-0.5" style={{ color: "var(--ss-accent)" }} />
              </button>
            );
          })}
        </div>
      ))}

      {modal && (
        <PersonalityDetailModal
          isOpen={modal.isOpen}
          onClose={() => setModal((m) => (m ? { ...m, isOpen: false } : null))}
          title={modal.title}
          subtitle={modal.subtitle}
          mainValue={modal.mainValue}
          light={modal.light}
          shadow={modal.shadow}
          insight={modal.insight}
          think={modal.think}
          act={modal.act}
          react={modal.react}
          category={modal.category}
        />
      )}
    </div>
  );
};

export default BlueprintOverview;

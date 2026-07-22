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

  const val = (v: any) => (v === undefined || v === null || v === "" ? undefined : v);
  const num = (v: any) => (val(v) !== undefined && Number(v) > 0 ? Number(v) : undefined);

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
      {/* Identity */}
      <div className="flex items-center gap-3.5">
        <div className="ss-avatar" style={{ width: 56, height: 56, fontSize: 22 }}>{name.charAt(0).toUpperCase()}</div>
        <div className="min-w-0">
          <div className="text-[20px] font-semibold tracking-tight" style={{ color: "var(--ss-ink)" }}>{name}</div>
          <div className="text-[13px]" style={{ color: "var(--ss-muted)" }}>{nl ? "Jouw Mental Blueprint" : "Your Mental Blueprint"}</div>
          <div className="text-[11.5px] mt-0.5" style={{ color: "var(--ss-faint)" }}>
            {nl ? "Gebaseerd op Numerologie, Astrologie & Human Design" : "Based on Numerology, Astrology & Human Design"}
          </div>
        </div>
      </div>

      {sections.map((section) => (
        <div key={section.title} className="flex flex-col gap-2.5">
          <div className="flex items-center gap-1.5 px-1">
            <span style={{ color: "var(--ss-accent)" }}>{section.icon}</span>
            <span className="text-[12px] font-semibold uppercase tracking-wider" style={{ color: "var(--ss-faint)" }}>{section.title}</span>
          </div>
          {section.items.map((item) => {
            const insight = gd(item.category, item.descValue ?? item.value)?.insight as string | undefined;
            return (
              <button
                key={item.label}
                onClick={() => openDetail(item, section.title)}
                className="ss-card flex items-start gap-3 text-left w-full"
                style={{ padding: 16 }}
              >
                <div className="min-w-0 flex-1">
                  <div className="text-[12px]" style={{ color: "var(--ss-muted)" }}>{item.label}</div>
                  <div className="text-[16px] font-semibold tracking-tight mt-0.5 capitalize" style={{ color: "var(--ss-accent-ink)" }}>{item.value}</div>
                  {insight && (
                    <div className="text-[12.5px] leading-relaxed mt-1.5 line-clamp-2" style={{ color: "var(--ss-muted)" }}>{insight}</div>
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

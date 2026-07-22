/**
 * BlueprintOverview — the calm Blauwdruk overview (design system).
 * A clean row-list of the person's core blueprint: one card per facet,
 * icon · label · value · description. Reads the same blueprint shape and
 * description helper the legacy viewer used, so the data is unchanged —
 * only the presentation is the calm mockup.
 */

import React from "react";
import { Brain, Hash, Sparkles, Compass, Sun, Moon, Sunrise, Globe } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { getPersonalityDescription } from "@/utils/personality-descriptions";

interface Row {
  icon: React.ReactNode;
  label: string;
  value: string;
  description?: string;
}

const BlueprintOverview: React.FC<{ blueprint: any }> = ({ blueprint }) => {
  const { t, language } = useLanguage();
  const desc = (category: string, value: string | number) =>
    getPersonalityDescription(t, category, value, language);
  const descText = (category: string, value: string | number): string => {
    const d = getPersonalityDescription(t, category, value, language);
    return d?.insight || d?.fullTitle || "";
  };

  const unknown = t("blueprint.values.unknown");
  const userMeta = blueprint?.user_meta || {};
  const name = userMeta.preferred_name || userMeta.full_name || "You";

  const mbti = blueprint?.cognitiveTemperamental?.mbtiType || unknown;
  const lifePath = Number(blueprint?.coreValuesNarrative?.lifePath || 0);
  const expression = blueprint?.coreValuesNarrative?.expressionNumber;
  const hd = blueprint?.energyDecisionStrategy?.humanDesignType || "Projector";
  const sun = blueprint?.publicArchetype?.sunSign || unknown;
  const moon = blueprint?.publicArchetype?.moonSign;
  const rising = blueprint?.publicArchetype?.risingSign;
  const chinese = blueprint?.generationalCode?.chineseZodiac;
  const element = blueprint?.generationalCode?.element;

  const nl = language === "nl";
  const iconWrap = (node: React.ReactNode) => (
    <span
      className="shrink-0 grid place-items-center"
      style={{ width: 40, height: 40, borderRadius: 12, background: "var(--ss-accent-wash)", color: "var(--ss-accent)" }}
    >
      {node}
    </span>
  );

  const rows: Row[] = [
    { icon: iconWrap(<Brain className="h-[18px] w-[18px]" />), label: nl ? "MBTI Type" : "MBTI Type", value: mbti, description: mbti !== unknown ? descText("mbtiDescriptions", mbti) : (nl ? "Je hebt unieke gaven die bijdragen aan je pad van zelfontdekking." : "You have unique gifts that contribute to your journey of self-discovery.") },
    lifePath > 0 && { icon: iconWrap(<Hash className="h-[18px] w-[18px]" />), label: nl ? "Levenspad" : "Life Path", value: String(lifePath), description: descText("lifePathDescriptions", lifePath) },
    expression && { icon: iconWrap(<Sparkles className="h-[18px] w-[18px]" />), label: nl ? "Expressie" : "Expression", value: String(expression), description: descText("expressionDescriptions", expression) },
    { icon: iconWrap(<Compass className="h-[18px] w-[18px]" />), label: "Human Design", value: hd, description: descText("humanDesignDescriptions", hd) },
    sun !== unknown && { icon: iconWrap(<Sun className="h-[18px] w-[18px]" />), label: nl ? "Zonneteken" : "Sun Sign", value: sun, description: descText("sunSignDescriptions", sun) },
    moon && moon !== unknown && { icon: iconWrap(<Moon className="h-[18px] w-[18px]" />), label: nl ? "Maanteken" : "Moon Sign", value: moon, description: descText("moonSignDescriptions", moon) },
    rising && rising !== unknown && { icon: iconWrap(<Sunrise className="h-[18px] w-[18px]" />), label: nl ? "Rijzend teken" : "Rising Sign", value: rising, description: descText("risingSignDescriptions", rising) },
    chinese && chinese !== unknown && { icon: iconWrap(<Globe className="h-[18px] w-[18px]" />), label: nl ? "Chinese dierenriem" : "Chinese Zodiac", value: element ? `${chinese} ${element}` : chinese, description: descText("chineseZodiacDescriptions", chinese) },
  ].filter(Boolean) as Row[];

  return (
    <div className="ss flex flex-col gap-4">
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

      <div className="text-[13px] font-semibold uppercase tracking-wider px-1" style={{ color: "var(--ss-faint)" }}>
        {nl ? "Overzicht" : "Overview"}
      </div>

      <div className="flex flex-col gap-2.5">
        {rows.map((r, i) => (
          <div key={i} className="ss-card flex items-start gap-3.5" style={{ padding: 16 }}>
            {r.icon}
            <div className="min-w-0 flex-1">
              <div className="text-[12px]" style={{ color: "var(--ss-muted)" }}>{r.label}</div>
              <div className="text-[17px] font-semibold tracking-tight mt-0.5" style={{ color: "var(--ss-accent-ink)" }}>{r.value}</div>
              {r.description && (
                <div className="text-[13px] leading-relaxed mt-1.5" style={{ color: "var(--ss-muted)" }}>{r.description}</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BlueprintOverview;

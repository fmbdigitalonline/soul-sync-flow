
import React from "react";
import { BlueprintData } from "@/services/blueprint-service";
import { CosmicCard } from "@/components/ui/cosmic-card";
import { cn } from "@/lib/utils";
import PersonalInfoSection from "./sections/PersonalInfoSection";
import MBTIProfileSection from "./sections/MBTIProfileSection";
import HumanDesignSection from "./sections/HumanDesignSection";
import AstrologySection from "./sections/AstrologySection";
import ChineseZodiacSection from "./sections/ChineseZodiacSection";
import NumerologySection from "./sections/NumerologySection";

interface BlueprintViewerProps {
  blueprint: BlueprintData;
  className?: string;
}

const BlueprintViewer: React.FC<BlueprintViewerProps> = ({ blueprint, className }) => {
  return (
    <CosmicCard className={cn("p-6", className)}>
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold font-display">
          <span className="gradient-text">{blueprint.user_meta.preferred_name}'s Soul Blueprint</span>
        </h2>
        <p className="text-muted-foreground mt-2">
          Your unique spiritual DNA and pathway to higher alignment
        </p>
      </div>

      <PersonalInfoSection userMeta={blueprint.user_meta} />
      <MBTIProfileSection mbtiData={blueprint.cognition_mbti} />
      <HumanDesignSection humanDesign={blueprint.energy_strategy_human_design} />
      <AstrologySection astrology={blueprint.archetype_western} />
      <ChineseZodiacSection chinese={blueprint.archetype_chinese} />
      <NumerologySection numerology={blueprint.values_life_path} />
    </CosmicCard>
  );
};

export default BlueprintViewer;

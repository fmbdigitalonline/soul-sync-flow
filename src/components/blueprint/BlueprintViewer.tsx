
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

export interface BlueprintViewerProps {
  data?: BlueprintData; // Changed from blueprint to data to match usage
  blueprint?: BlueprintData; // Added for backward compatibility
  className?: string;
}

const BlueprintViewer: React.FC<BlueprintViewerProps> = ({ data, blueprint, className }) => {
  // Use data or blueprint, whichever is provided
  const blueprintData = data || blueprint;
  
  if (!blueprintData) {
    return (
      <CosmicCard className={cn("p-6", className)}>
        <div className="text-center">
          <p>No blueprint data available.</p>
        </div>
      </CosmicCard>
    );
  }

  return (
    <CosmicCard className={cn("p-6", className)}>
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold font-display">
          <span className="gradient-text">{blueprintData.user_meta.preferred_name || blueprintData.user_meta.full_name}'s Soul Blueprint</span>
        </h2>
        <p className="text-muted-foreground mt-2">
          Your unique spiritual DNA and pathway to higher alignment
        </p>
      </div>

      <PersonalInfoSection userMeta={blueprintData.user_meta} />
      <MBTIProfileSection mbtiData={blueprintData.cognition_mbti} />
      <HumanDesignSection humanDesign={blueprintData.energy_strategy_human_design} />
      <AstrologySection astrology={blueprintData.archetype_western} />
      <ChineseZodiacSection chinese={blueprintData.archetype_chinese} />
      <NumerologySection numerology={blueprintData.values_life_path} />
    </CosmicCard>
  );
};

export default BlueprintViewer;

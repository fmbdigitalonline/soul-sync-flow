
import React from "react";
import BlueprintSection from "../BlueprintSection";
import { Badge } from "@/components/ui/badge";
import { BlueprintData } from "@/services/blueprint-service";

interface HumanDesignSectionProps {
  humanDesign: BlueprintData["energy_strategy_human_design"];
}

const HumanDesignSection: React.FC<HumanDesignSectionProps> = ({ humanDesign }) => {
  // Early return with placeholder if humanDesign is completely missing
  if (!humanDesign) {
    return (
      <BlueprintSection id="humanDesign" title="Human Design" defaultExpanded={false}>
        <div className="text-center py-4 text-muted-foreground">
          <p>Human Design data is not available.</p>
          <p className="text-sm mt-2">Please update your profile settings.</p>
        </div>
      </BlueprintSection>
    );
  }

  // Create safe references with fallbacks
  const type = humanDesign.type || "Unknown";
  const profile = humanDesign.profile || "Not specified";
  const authority = humanDesign.authority || "Not specified";
  const strategy = humanDesign.strategy || "Not specified";
  const definition = humanDesign.definition || "Not specified";
  const notSelfTheme = humanDesign.not_self_theme || "Not specified";
  const lifePurpose = humanDesign.life_purpose || "Not specified";
  
  // Safely check if gates exist and have the expected structure
  const hasGates = humanDesign.gates && 
                   humanDesign.gates.unconscious_design && 
                   Array.isArray(humanDesign.gates.unconscious_design) &&
                   humanDesign.gates.conscious_personality && 
                   Array.isArray(humanDesign.gates.conscious_personality);

  return (
    <BlueprintSection id="humanDesign" title="Human Design" defaultExpanded={false}>
      <div className="grid grid-cols-1 gap-2">
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Type:</span>
          <Badge variant="outline" className="bg-soul-purple/10">{type}</Badge>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Profile:</span>
          <span>{profile}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Authority:</span>
          <span>{authority}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Strategy:</span>
          <span>{strategy}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Definition:</span>
          <span>{definition}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Not-Self Theme:</span>
          <span>{notSelfTheme}</span>
        </div>
        <div className="mt-3">
          <p className="text-muted-foreground mb-2">Life Purpose:</p>
          <p className="text-sm bg-soul-purple/5 p-3 rounded-md">
            {lifePurpose}
          </p>
        </div>
        {hasGates && (
          <div className="mt-2">
            <p className="text-muted-foreground mb-1">Key Active Gates:</p>
            <div className="grid grid-cols-2 gap-1 text-xs">
              <div>
                <span className="text-muted-foreground">Design: </span>
                {humanDesign.gates.unconscious_design.slice(0, 3).join(", ")}
              </div>
              <div>
                <span className="text-muted-foreground">Personality: </span>
                {humanDesign.gates.conscious_personality.slice(0, 3).join(", ")}
              </div>
            </div>
          </div>
        )}
      </div>
    </BlueprintSection>
  );
};

export default HumanDesignSection;

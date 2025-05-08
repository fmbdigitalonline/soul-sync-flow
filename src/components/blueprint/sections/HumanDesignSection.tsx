
import React from "react";
import BlueprintSection from "../BlueprintSection";
import { Badge } from "@/components/ui/badge";
import { BlueprintData } from "@/services/blueprint-service";

interface HumanDesignSectionProps {
  humanDesign: BlueprintData["energy_strategy_human_design"];
}

const HumanDesignSection: React.FC<HumanDesignSectionProps> = ({ humanDesign }) => {
  return (
    <BlueprintSection id="humanDesign" title="Human Design" defaultExpanded={false}>
      <div className="grid grid-cols-1 gap-2">
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Type:</span>
          <Badge variant="outline" className="bg-soul-purple/10">{humanDesign.type}</Badge>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Profile:</span>
          <span>{humanDesign.profile}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Authority:</span>
          <span>{humanDesign.authority}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Strategy:</span>
          <span>{humanDesign.strategy}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Definition:</span>
          <span>{humanDesign.definition}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Not-Self Theme:</span>
          <span>{humanDesign.not_self_theme}</span>
        </div>
        <div className="mt-3">
          <p className="text-muted-foreground mb-2">Life Purpose:</p>
          <p className="text-sm bg-soul-purple/5 p-3 rounded-md">
            {humanDesign.life_purpose}
          </p>
        </div>
        {humanDesign.gates && (
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

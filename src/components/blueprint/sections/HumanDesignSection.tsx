
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
                   Array.isArray(humanDesign.gates.unconscious_design) &&
                   humanDesign.gates.unconscious_design.length > 0 &&
                   Array.isArray(humanDesign.gates.conscious_personality) &&
                   humanDesign.gates.conscious_personality.length > 0;
  
  // Check if centers data exists
  const hasCenters = humanDesign.centers && typeof humanDesign.centers === 'object';

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
        
        {/* Centers visualization if available */}
        {hasCenters && (
          <div className="mt-3 bg-soul-purple/5 p-3 rounded-md">
            <p className="text-muted-foreground mb-2">Defined Centers:</p>
            <div className="grid grid-cols-3 gap-2 text-xs">
              {Object.entries(humanDesign.centers).map(([center, isDefined]) => (
                <div key={center} className={`p-1.5 rounded ${isDefined ? 'bg-soul-purple/20' : 'bg-gray-500/10'}`}>
                  <span className={isDefined ? 'text-soul-purple' : 'text-muted-foreground'}>
                    {center.charAt(0).toUpperCase() + center.slice(1)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="mt-3">
          <p className="text-muted-foreground mb-2">Life Purpose:</p>
          <p className="text-sm bg-soul-purple/5 p-3 rounded-md">
            {lifePurpose}
          </p>
        </div>
        
        {hasGates && (
          <div className="mt-2">
            <p className="text-muted-foreground mb-1">Key Active Gates:</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-soul-purple/5 p-2 rounded-md">
                <span className="text-muted-foreground block mb-1">Design: </span>
                <div className="flex flex-wrap gap-1">
                  {humanDesign.gates.unconscious_design.slice(0, 4).map((gate, idx) => (
                    <Badge key={`design-${idx}`} variant="outline" className="bg-soul-purple/10">
                      {gate}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="bg-soul-purple/5 p-2 rounded-md">
                <span className="text-muted-foreground block mb-1">Personality: </span>
                <div className="flex flex-wrap gap-1">
                  {humanDesign.gates.conscious_personality.slice(0, 4).map((gate, idx) => (
                    <Badge key={`personality-${idx}`} variant="outline" className="bg-soul-purple/10">
                      {gate}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </BlueprintSection>
  );
};

export default HumanDesignSection;
